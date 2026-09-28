/**
 * Endpoint API (read-only). Semua route memakai helper query murni dari
 * lib/query dan repository yang disuntikkan — tanpa akses DB langsung.
 *
 * Kontrak daftar: { items: T[] }; detail tidak ada → 404 { error }.
 */
import type { Elysia } from 'elysia';
import { normalizeSearch, parseOrder, parsePagination, trimOrNull } from './lib/query';
import type { Repositories } from './repositories/types';

/**
 * Rantai `.get()` mengubah generic Routes Elysia, sehingga helper komposisi
 * tidak bisa memakai tipe default-nya. Boundary ini memakai `any` disengaja
 * agar generic monster tidak menyebar ke seluruh kode.
 */
export type AnyElysia = Elysia<any, any, any, any, any, any, any>;

const ORDER_OPTIONS = ['asc', 'desc'] as const;

export function registerRoutes(app: AnyElysia, repos: Repositories): AnyElysia {
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
    });
}
