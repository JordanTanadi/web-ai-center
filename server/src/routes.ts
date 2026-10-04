/**
 * Endpoint API (read-only + tulis admin). Semua route memakai helper query
 * murni dari lib/query dan repository yang disuntikkan — tanpa akses DB langsung.
 *
 * Route tulis (POST/PUT/DELETE dokumentasi & berita) dijaga token hasil
 * POST /api/admin/login (konsul PROGRESS 2: login sederhana 1 akun);
 * login itu sendiri dibatasi rate-limit 5 gagal / 10 menit per IP → 429.
 *
 * Kontrak daftar: { items: T[] }; detail tidak ada → 404 { error }.
 */
import type { Elysia } from 'elysia';
import { buatTokenAdmin, passwordCocok, tokenAdminValid, tokenDariHeader } from './auth';
import { buatRateLimitLogin, kunciIpDariRequest } from './lib/rateLimit';
import { normalizeSearch, parseOrder, parsePagination, trimOrNull } from './lib/query';
import { slugDariJudul, validasiBerita, validasiDokumentasi, validasiKursus } from './lib/tulis';
import {
  namaFileAman,
  resolveUploadDir,
  simpanFileGambar,
  tipeKontenGambar,
  urlFileUnggahan,
  validasiFileGambar,
} from './lib/upload';
import type { Repositories } from './repositories/types';

/**
 * Rantai `.get()` mengubah generic Routes Elysia, sehingga helper komposisi
 * tidak bisa memakai tipe default-nya. Boundary ini memakai `any` disengaja
 * agar generic monster tidak menyebar ke seluruh kode.
 */
export type AnyElysia = Elysia<any, any, any, any, any, any, any>;

const ORDER_OPTIONS = ['asc', 'desc'] as const;

/** Pesan penolakan standar route tulis (401). */
const PESAN_BELUM_LOGIN = 'Belum login — ambil token dari POST /api/admin/login';

export function registerRoutes(
  app: AnyElysia,
  repos: Repositories,
  /** Password admin dari env ADMIN_PASSWORD — kunci verifikasi token tulis. */
  adminPassword: string,
  /** Override direktori unggahan (khusus test; default dari UPLOAD_DIR/cwd). */
  opsi?: { uploadDir?: string },
): AnyElysia {
  /** True bila header Authorization membawa token valid untuk password ini. */
  const terautentikasi = (request: Request): boolean => {
    const token = tokenDariHeader(request.headers.get('Authorization'));
    return token !== null && tokenAdminValid(token, adminPassword);
  };
  const dirUnggahan = opsi?.uploadDir ?? resolveUploadDir();

  /** Batas brute-force login admin: 5 gagal / 10 menit per IP (fixed-window). */
  const limiterLogin = buatRateLimitLogin({ batasPercobaan: 5, jendelaMs: 10 * 60_000 });

  return app
    .get('/api/health', () => ({ status: 'ok' as const }))

    // — Berita —————————————————————————————————————————————————
    .get('/api/berita', async ({ query }) => ({
      items: await repos.berita.list({
        q: normalizeSearch(query.q),
        pagination: parsePagination(query.page, query.limit),
        order: parseOrder(query.order, ORDER_OPTIONS, 'desc'),
      }),
    }))
    .get('/api/berita/:slug', async ({ params, set }) => {
      const item = await repos.berita.findBySlug(params.slug);
      if (item === null) {
        set.status = 404;
        return { error: 'Berita tidak ditemukan' };
      }
      return item;
    })

    // — Dokumentasi ————————————————————————————————————————————
    .get('/api/dokumentasi', async ({ query }) => ({
      items: await repos.dokumentasi.list({
        q: normalizeSearch(query.q),
        pagination: parsePagination(query.page, query.limit),
        order: parseOrder(query.order, ORDER_OPTIONS, 'desc'),
        kategori: trimOrNull(query.kategori),
      }),
    }))
    .get('/api/dokumentasi/:slug', async ({ params, set }) => {
      const item = await repos.dokumentasi.findBySlug(params.slug);
      if (item === null) {
        set.status = 404;
        return { error: 'Dokumentasi tidak ditemukan' };
      }
      return item;
    })

    // — Tim ———————————————————————————————————————————————————
    .get('/api/tim', async ({ query }) => ({
      items: await repos.tim.list({
        q: normalizeSearch(query.q),
        pagination: parsePagination(query.page, query.limit),
      }),
    }))

    // — Layanan —————————————————————————————————————————————————
    .get('/api/layanan', async () => ({ items: await repos.layanan.list() }))
    .get('/api/layanan/:slug', async ({ params, set }) => {
      const item = await repos.layanan.findBySlug(params.slug);
      if (item === null) {
        set.status = 404;
        return { error: 'Layanan tidak ditemukan' };
      }
      return item;
    })

    // — Kursus (Pelatihan) —————————————————————————————————————
    .get('/api/kursus', async ({ query }) => ({
      items: await repos.kursus.list({
        q: normalizeSearch(query.q),
        pagination: parsePagination(query.page, query.limit),
      }),
    }))
    .get('/api/kursus/:kode', async ({ params, set }) => {
      const item = await repos.kursus.findByKode(params.kode);
      if (item === null) {
        set.status = 404;
        return { error: 'Kursus tidak ditemukan' };
      }
      return item;
    })

    // — Konten beranda ——————————————————————————————————————————
    .get('/api/hero-slides', async () => ({ items: await repos.hero.list() }))
    .get('/api/klien', async () => ({ items: await repos.klien.list() }))
    .get('/api/testimoni', async () => ({ items: await repos.testimoni.list() }))

    // — Profil (Tentang Kami + kontak footer) ————————————————————————
    .get('/api/profil', async ({ set }) => {
      const item = await repos.profil.get();
      if (item === null) {
        set.status = 404;
        return { error: 'Profil belum diisi' };
      }
      return item;
    })

    // — Admin: login sederhana (1 akun; password dari ADMIN_PASSWORD) ————
    .post('/api/admin/login', ({ body, request, set }) => {
      // Rate-limit dulu sebelum verifikasi: blokir tanpa membuka oracle password.
      const kunciIp = kunciIpDariRequest(request);
      const keputusan = limiterLogin.periksa(kunciIp);
      if (!keputusan.diizinkan) {
        set.status = 429;
        set.headers['Retry-After'] = String(keputusan.detikTersisa);
        return {
          error: `Terlalu banyak percobaan login — coba lagi dalam ${keputusan.detikTersisa} detik`,
        };
      }
      const input = (body ?? {}) as { password?: unknown };
      const password = typeof input.password === 'string' ? input.password : '';
      if (!passwordCocok(password, adminPassword)) {
        limiterLogin.catatGagal(kunciIp);
        set.status = 401;
        return { error: 'Password salah' };
      }
      limiterLogin.reset(kunciIp);
      return { token: buatTokenAdmin(adminPassword) };
    })

    // — Tulis dokumentasi (CRUD admin; butuh Authorization: Bearer) ——————
    .post('/api/dokumentasi', async ({ body, request, set }) => {
      if (!terautentikasi(request)) {
        set.status = 401;
        return { error: PESAN_BELUM_LOGIN };
      }
      const hasil = validasiDokumentasi(body);
      if (!hasil.ok) {
        set.status = 400;
        return { error: hasil.error };
      }
      const slug = slugDariJudul(hasil.data.judul);
      if (slug === '') {
        set.status = 400;
        return { error: 'Judul tidak menghasilkan slug — tambahkan huruf/angka' };
      }
      if ((await repos.dokumentasi.findBySlug(slug)) !== null) {
        set.status = 409;
        return { error: 'Slug sudah dipakai — judul bentrok dengan konten lain' };
      }
      set.status = 201;
      return await repos.dokumentasi.create(slug, hasil.data);
    })
    .put('/api/dokumentasi/:slug', async ({ params, body, request, set }) => {
      if (!terautentikasi(request)) {
        set.status = 401;
        return { error: PESAN_BELUM_LOGIN };
      }
      const hasil = validasiDokumentasi(body);
      if (!hasil.ok) {
        set.status = 400;
        return { error: hasil.error };
      }
      // Slug TIDAK diubah saat edit — tautan lama tetap hidup walau judul berubah.
      const item = await repos.dokumentasi.update(params.slug, hasil.data);
      if (item === null) {
        set.status = 404;
        return { error: 'Dokumentasi tidak ditemukan' };
      }
      return item;
    })
    .delete('/api/dokumentasi/:slug', async ({ params, request, set }) => {
      if (!terautentikasi(request)) {
        set.status = 401;
        return { error: PESAN_BELUM_LOGIN };
      }
      const terhapus = await repos.dokumentasi.remove(params.slug);
      if (!terhapus) {
        set.status = 404;
        return { error: 'Dokumentasi tidak ditemukan' };
      }
      return { ok: true as const };
    })

    // — Tulis berita (CRUD admin; butuh Authorization: Bearer) ——————————
    .post('/api/berita', async ({ body, request, set }) => {      if (!terautentikasi(request)) {
        set.status = 401;
        return { error: PESAN_BELUM_LOGIN };
      }
      const hasil = validasiBerita(body);
      if (!hasil.ok) {
        set.status = 400;
        return { error: hasil.error };
      }
      const slug = slugDariJudul(hasil.data.judul);
      if (slug === '') {
        set.status = 400;
        return { error: 'Judul tidak menghasilkan slug — tambahkan huruf/angka' };
      }
      if ((await repos.berita.findBySlug(slug)) !== null) {
        set.status = 409;
        return { error: 'Slug sudah dipakai — judul bentrok dengan konten lain' };
      }
      set.status = 201;
      return await repos.berita.create(slug, hasil.data);
    })
    .put('/api/berita/:slug', async ({ params, body, request, set }) => {
      if (!terautentikasi(request)) {
        set.status = 401;
        return { error: PESAN_BELUM_LOGIN };
      }
      const hasil = validasiBerita(body);
      if (!hasil.ok) {
        set.status = 400;
        return { error: hasil.error };
      }
      const item = await repos.berita.update(params.slug, hasil.data);
      if (item === null) {
        set.status = 404;
        return { error: 'Berita tidak ditemukan' };
      }
      return item;
    })
    .delete('/api/berita/:slug', async ({ params, request, set }) => {
      if (!terautentikasi(request)) {
        set.status = 401;
        return { error: PESAN_BELUM_LOGIN };
      }
      const terhapus = await repos.berita.remove(params.slug);
      if (!terhapus) {
        set.status = 404;
        return { error: 'Berita tidak ditemukan' };
      }
      return { ok: true as const };
    })

    // — Tulis kursus (CRUD admin; kunci = kode, mis. 'R01') ————————————
    .post('/api/kursus', async ({ body, request, set }) => {
      if (!terautentikasi(request)) {
        set.status = 401;
        return { error: PESAN_BELUM_LOGIN };
      }
      const hasil = validasiKursus(body);
      if (!hasil.ok) {
        set.status = 400;
        return { error: hasil.error };
      }
      if ((await repos.kursus.findByKode(hasil.data.kode)) !== null) {
        set.status = 409;
        return { error: 'Kode sudah dipakai — gunakan kode lain' };
      }
      set.status = 201;
      return await repos.kursus.create(hasil.data);
    })
    .put('/api/kursus/:kode', async ({ params, body, request, set }) => {
      if (!terautentikasi(request)) {
        set.status = 401;
        return { error: PESAN_BELUM_LOGIN };
      }
      const hasil = validasiKursus(body);
      if (!hasil.ok) {
        set.status = 400;
        return { error: hasil.error };
      }
      // Kode kunci tidak boleh diganti saat edit — samakan dengan path.
      if (hasil.data.kode !== params.kode.trim().toUpperCase()) {
        set.status = 400;
        return { error: 'Kode tidak boleh diganti — samakan dengan kode di URL' };
      }
      const item = await repos.kursus.update(params.kode, hasil.data);
      if (item === null) {
        set.status = 404;
        return { error: 'Kursus tidak ditemukan' };
      }
      return item;
    })
    .delete('/api/kursus/:kode', async ({ params, request, set }) => {
      if (!terautentikasi(request)) {
        set.status = 401;
        return { error: PESAN_BELUM_LOGIN };
      }
      const terhapus = await repos.kursus.remove(params.kode);
      if (!terhapus) {
        set.status = 404;
        return { error: 'Kursus tidak ditemukan' };
      }
      return { ok: true as const };
    })

    // — Unggah gambar admin (multipart `gambar`; butuh Bearer) —————————
    .post('/api/admin/upload', async ({ body, request, set }) => {
      if (!terautentikasi(request)) {
        set.status = 401;
        return { error: PESAN_BELUM_LOGIN };
      }
      const file = (body as { gambar?: unknown } | null)?.gambar;
      const valid = validasiFileGambar(file);
      if (!valid.ok) {
        set.status = 400;
        return { error: valid.error };
      }
      const nama = await simpanFileGambar(file as File, valid.ext, dirUnggahan);
      set.status = 201;
      return { url: urlFileUnggahan(nama) };
    })

    // — Sajikan file unggahan (publik, tanpa auth) —————————————————————
    .get('/uploads/:nama', async ({ params, set }) => {
      const aman = namaFileAman(params.nama);
      if (aman === null) {
        set.status = 404;
        return { error: 'File tidak ditemukan' };
      }
      const lokasi = `${dirUnggahan.replace(/\/+$/, '')}/${aman}`;
      const berkas = Bun.file(lokasi);
      if (!(await berkas.exists())) {
        set.status = 404;
        return { error: 'File tidak ditemukan' };
      }
      set.headers['Content-Type'] = tipeKontenGambar(aman.slice(aman.lastIndexOf('.') + 1));
      set.headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      return berkas;
    });
}
