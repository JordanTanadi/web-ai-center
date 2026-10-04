/**
 * Unit test route via app.handle(Request) dengan fake repository
 * (tanpa DB, tanpa listen jaringan) — input query → status + body benar.
 */
import { describe, expect, test } from 'bun:test';
import { createApp } from './app';
import type {
  AnggotaTim,
  BeritaItem,
  DokumentasiItem,
  HeroSlide,
  Klien,
  Kursus,
  Layanan,
  Profil,
  Testimoni,
} from './api/types';
import type { ListParams, Repositories, DokumentasiListParams } from './repositories/types';
import type { Pagination } from './lib/query';
import type { InputBerita as BeritaInput, InputDokumentasi as DokumentasiInput, InputKursus as KursusInput } from './lib/tulis';
import { buatTokenAdmin } from './auth';

const NO_PAGINATION: Pagination = { page: null, limit: null, offset: null };

const sampleBerita: BeritaItem = {
  slug: 'berita-1',
  judul: 'Judul',
  ringkasan: 'Ringkasan',
  isi: 'Isi',
  tanggal: '2026-08-01',
  penulis: 'Humas',
};
const sampleDok: DokumentasiItem = {
  slug: 'dok-1',
  judul: 'Workshop',
  deskripsi: 'Deskripsi',
  tanggal: '2026-07-15',
  kategori: 'Workshop',
};
const sampleTim: AnggotaTim = { nama: 'Nama', peran: 'Kepala' };
const sampleLayanan: Layanan = {
  slug: 'pelatihan',
  nama: 'Pelatihan',
  tagline: 'Tagline',
  deskripsi: 'Deskripsi',
  fitur: ['a'],
};
const sampleHero: HeroSlide = {
  eyebrow: 'E',
  judul: 'J',
  judulAksen: 'A',
  sub: 'S',
  ctaPrimer: { label: 'L', to: '/x' },
  ctaSekunder: { label: 'L2', to: '/y' },
  badgeJudul: 'B',
  badgeSub: 'BS',
};
const sampleKlien: Klien = { nama: 'PT X', bidang: 'Teknologi' };
const sampleTestimoni: Testimoni = { nama: 'A', peran: 'B', kutipan: 'C' };
const sampleProfil: Profil = {
  nama: 'AI Center Ubaya',
  tagline: 'Tagline',
  ringkasan: 'Ringkasan',
  alamat: 'Jl. Contoh',
  email: 'info@example.test',
  telepon: '+62312981000',
};
const sampleKursus: Kursus = {
  kode: 'R01',
  target: ['Mahasiswa'],
  judul: 'Judul Kursus',
  deskripsi: 'Deskripsi',
  tentang: 'Tentang',
  durasi: '4 sesi',
  level: 'Pemula',
  format: 'Online mandiri',
  instruktur: 'Tim',
  peran: 'Pengajar',
  inisial: 'RA',
  hasil: ['Hasil'],
  modul: [{ judul: 'Modul', deskripsi: 'Desc', meta: '4 video · 35 menit' }],
};

/** Fake repository: mencatat argumen tiap panggilan, balikan di-hardcode. */
interface FakeHandle {
  repos: Repositories;
  calls: Array<{ method: string; args: unknown[] }>;
}

function createFakeRepos(): FakeHandle {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const rec = <A extends unknown[], R>(method: string, impl: (...args: A) => R) =>
    (...args: A): R => {
      calls.push({ method, args });
      return impl(...args);
    };

  const repos: Repositories = {
    berita: {
      list: rec('berita.list', async (_params: ListParams): Promise<BeritaItem[]> => [sampleBerita]),
      findBySlug: rec('berita.findBySlug', async (slug: string): Promise<BeritaItem | null> =>
        slug === sampleBerita.slug ? sampleBerita : null),
      create: rec('berita.create', async (slug: string, data: BeritaInput): Promise<BeritaItem> =>
        ({ slug, ...data, gambar: data.gambar ?? undefined })),
      update: rec('berita.update', async (slug: string, data: BeritaInput): Promise<BeritaItem | null> =>
        slug === sampleBerita.slug ? { slug, ...data, gambar: data.gambar ?? undefined } : null),
      remove: rec('berita.remove', async (slug: string): Promise<boolean> =>
        slug === sampleBerita.slug),
    },
    dokumentasi: {
      list: rec('dokumentasi.list', async (_params: DokumentasiListParams): Promise<DokumentasiItem[]> => [sampleDok]),
      findBySlug: rec('dokumentasi.findBySlug', async (slug: string): Promise<DokumentasiItem | null> =>
        slug === sampleDok.slug ? sampleDok : null),
      create: rec('dokumentasi.create', async (slug: string, data: DokumentasiInput): Promise<DokumentasiItem> =>
        ({ slug, ...data, gambar: data.gambar ?? undefined })),
      update: rec('dokumentasi.update', async (slug: string, data: DokumentasiInput): Promise<DokumentasiItem | null> =>
        slug === sampleDok.slug ? { slug, ...data, gambar: data.gambar ?? undefined } : null),
      remove: rec('dokumentasi.remove', async (slug: string): Promise<boolean> =>
        slug === sampleDok.slug),
    },
    tim: {
      list: rec('tim.list', async (_params: ListParams): Promise<AnggotaTim[]> => [sampleTim]),
    },
    layanan: {
      list: rec('layanan.list', async (): Promise<Layanan[]> => [sampleLayanan]),
      findBySlug: rec('layanan.findBySlug', async (slug: string): Promise<Layanan | null> =>
        slug === sampleLayanan.slug ? sampleLayanan : null),
    },
    hero: { list: rec('hero.list', async (): Promise<HeroSlide[]> => [sampleHero]) },
    klien: { list: rec('klien.list', async (): Promise<Klien[]> => [sampleKlien]) },
    testimoni: { list: rec('testimoni.list', async (): Promise<Testimoni[]> => [sampleTestimoni]) },
    profil: { get: rec('profil.get', async (): Promise<Profil | null> => sampleProfil) },
    kursus: {
      list: rec('kursus.list', async (_params: ListParams): Promise<Kursus[]> => [sampleKursus]),
      findByKode: rec('kursus.findByKode', async (kode: string): Promise<Kursus | null> =>
        kode.toUpperCase() === sampleKursus.kode ? sampleKursus : null),
      create: rec('kursus.create', async (data: KursusInput): Promise<Kursus> =>
        ({ ...sampleKursus, ...data })),
      update: rec('kursus.update', async (kode: string, data: KursusInput): Promise<Kursus | null> =>
        kode.toUpperCase() === sampleKursus.kode ? { ...sampleKursus, ...data } : null),
      remove: rec('kursus.remove', async (kode: string): Promise<boolean> =>
        kode.toUpperCase() === sampleKursus.kode),
    },
  };
  return { repos, calls };
}

const CORS_ORIGINS = ['http://localhost:5173'];
/** Password admin khusus test — token di-buat langsung dengan `buatTokenAdmin`. */
const ADMIN_PASSWORD_TEST = 'rahasia-admin-test';
const TOKEN_ADMIN = buatTokenAdmin(ADMIN_PASSWORD_TEST);

function createTestApp(handle = createFakeRepos()) {
  const app = createApp({
    repos: handle.repos,
    corsOrigins: CORS_ORIGINS,
    adminPassword: ADMIN_PASSWORD_TEST,
  });
  return { app, calls: handle.calls };
}

const getJson = async (app: ReturnType<typeof createApp>, path: string) => {
  const res = await app.handle(new Request(`http://localhost${path}`));
  return { status: res.status, body: (await res.json()) as unknown, res };
};

describe('GET /api/health', () => {
  test('200 { status: "ok" }', async () => {
    const { app } = createTestApp();
    const { status, body } = await getJson(app, '/api/health');
    expect(status).toBe(200);
    expect(body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/berita', () => {
  test('tanpa query → { items } dan params default (q null, tanpa pagination)', async () => {
    const { app, calls } = createTestApp();
    const { status, body } = await getJson(app, '/api/berita');
    expect(status).toBe(200);
    expect(body).toEqual({ items: [sampleBerita] });
    expect(calls).toEqual([
      {
        method: 'berita.list',
        args: [{ q: null, pagination: NO_PAGINATION, order: 'desc' }],
      },
    ]);
  });

  test('query lengkap dinormalisasi & diteruskan ke repository', async () => {
    const { app, calls } = createTestApp();
    const { body } = await getJson(
      app,
      '/api/berita?q=' + encodeURIComponent('  gpu   rental ') + '&page=2&limit=3&order=asc',
    );
    expect(body).toEqual({ items: [sampleBerita] });
    expect(calls[0].args[0]).toEqual({
      q: 'gpu rental',
      pagination: { page: 2, limit: 3, offset: 3 },
      order: 'asc',
    });
  });
});

describe('GET /api/berita/:slug', () => {
  test('ada → 200 body item', async () => {
    const { app } = createTestApp();
    const { status, body } = await getJson(app, `/api/berita/${sampleBerita.slug}`);
    expect(status).toBe(200);
    expect(body).toEqual(sampleBerita);
  });

  test('tidak ada → 404 { error }', async () => {
    const { app } = createTestApp();
    const { status, body } = await getJson(app, '/api/berita/tidak-ada');
    expect(status).toBe(404);
    expect(body).toEqual({ error: 'Berita tidak ditemukan' });
  });
});

describe('GET /api/dokumentasi', () => {
  test('q & kategori diteruskan; kategori kosong → null', async () => {
    const { app, calls } = createTestApp();
    await getJson(app, '/api/dokumentasi?q=workshop&kategori=%20%20');
    expect(calls[0].args[0]).toMatchObject({ q: 'workshop', kategori: null });
    await getJson(app, '/api/dokumentasi?kategori=Workshop');
    expect(calls[1].args[0]).toMatchObject({ kategori: 'Workshop' });
  });

  test('detail tidak ada → 404', async () => {
    const { app } = createTestApp();
    const { status } = await getJson(app, '/api/dokumentasi/tidak-ada');
    expect(status).toBe(404);
  });
});

describe('GET /api/tim', () => {
  test('q di-normalize, pagination nonaktif tanpa query', async () => {
    const { app, calls } = createTestApp();
    const { body } = await getJson(app, '/api/tim?q=' + encodeURIComponent('  koordinator '));
    expect(body).toEqual({ items: [sampleTim] });
    expect(calls[0].args[0]).toEqual({ q: 'koordinator', pagination: NO_PAGINATION });
  });
});

describe('endpoint konten beranda & layanan', () => {
  test('layanan, hero-slides, klien, testimoni → { items }', async () => {
    const { app } = createTestApp();
    expect((await getJson(app, '/api/layanan')).body).toEqual({ items: [sampleLayanan] });
    expect((await getJson(app, '/api/hero-slides')).body).toEqual({ items: [sampleHero] });
    expect((await getJson(app, '/api/klien')).body).toEqual({ items: [sampleKlien] });
    expect((await getJson(app, '/api/testimoni')).body).toEqual({ items: [sampleTestimoni] });
  });

  test('detail layanan ada/tidak ada → 200/404', async () => {
    const { app } = createTestApp();
    expect((await getJson(app, '/api/layanan/pelatihan')).status).toBe(200);
    expect((await getJson(app, '/api/layanan/tidak-ada')).status).toBe(404);
  });
});

describe('GET /api/kursus', () => {
  test('tanpa query → { items } + pagination nonaktif (semua kursus)', async () => {
    const { app, calls } = createTestApp();
    const { status, body } = await getJson(app, '/api/kursus');
    expect(status).toBe(200);
    expect(body).toEqual({ items: [sampleKursus] });
    expect(calls).toEqual([
      { method: 'kursus.list', args: [{ q: null, pagination: NO_PAGINATION }] },
    ]);
  });

  test('q & limit dinormalisasi & diteruskan ke repository', async () => {
    const { app, calls } = createTestApp();
    await getJson(app, '/api/kursus?q=' + encodeURIComponent('  jurnal ') + '&limit=5');
    expect(calls[0].args[0]).toEqual({
      q: 'jurnal',
      pagination: { page: 1, limit: 5, offset: 0 },
    });
  });
});

describe('GET /api/kursus/:kode', () => {
  test('kode kecil ("r01") tetap diterima (URL lama) → 200', async () => {
    const { app } = createTestApp();
    const { status, body } = await getJson(app, '/api/kursus/r01');
    expect(status).toBe(200);
    expect(body).toEqual(sampleKursus);
  });

  test('tidak ada → 404 { error }', async () => {
    const { app } = createTestApp();
    const { status, body } = await getJson(app, '/api/kursus/Z99');
    expect(status).toBe(404);
    expect(body).toEqual({ error: 'Kursus tidak ditemukan' });
  });
});

describe('GET /api/profil', () => {
  test('ada → 200 body profil', async () => {
    const { app } = createTestApp();
    const { status, body } = await getJson(app, '/api/profil');
    expect(status).toBe(200);
    expect(body).toEqual(sampleProfil);
  });

  test('edge: belum di-seed (null) → 404', async () => {
    const handle = createFakeRepos();
    handle.repos.profil = { get: async () => null };
    const { app } = createTestApp(handle);
    const { status, body } = await getJson(app, '/api/profil');
    expect(status).toBe(404);
    expect(body).toEqual({ error: 'Profil belum diisi' });
  });
});

describe('error handling', () => {
  test('rute tidak dikenal → 404 JSON { error }', async () => {
    const { app } = createTestApp();
    const { status, body } = await getJson(app, '/api/tidak-ada');
    expect(status).toBe(404);
    expect(body).toEqual({ error: 'Not Found' });
  });

  test('repository melempar error → 500 JSON, bukan bocor stack', async () => {
    const handle = createFakeRepos();
    handle.repos.berita.list = async () => {
      throw new Error('db down');
    };
    const { app } = createTestApp(handle);
    const { status, body } = await getJson(app, '/api/berita');
    expect(status).toBe(500);
    expect(body).toEqual({ error: 'Internal Server Error' });
  });
});

describe('CORS', () => {
  test('origin whitelist → di-echo + Vary: Origin', async () => {
    const { app } = createTestApp();
    const res = await app.handle(
      new Request('http://localhost/api/health', {
        headers: { Origin: 'http://localhost:5173' },
      }),
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
    expect(res.headers.get('Vary')).toBe('Origin');
  });

  test('origin di luar whitelist → header tidak ada', async () => {
    const { app } = createTestApp();
    const res = await app.handle(
      new Request('http://localhost/api/health', {
        headers: { Origin: 'https://evil.test' },
      }),
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  test('preflight OPTIONS → 204 + allow methods/headers', async () => {
    const { app } = createTestApp();
    const res = await app.handle(
      new Request('http://localhost/api/berita', {
        method: 'OPTIONS',
        headers: { Origin: 'http://localhost:5173' },
      }),
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET,POST,PUT,DELETE,OPTIONS');
    expect(res.headers.get('Access-Control-Allow-Headers')).toBe('content-type,authorization');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
  });
});

/** Kirim request tulis JSON (POST/PUT/DELETE) — opsi token: `Bearer <TOKEN_ADMIN>`. */
const kirimTulis = async (
  app: ReturnType<typeof createApp>,
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body: unknown,
  token: string | null = TOKEN_ADMIN,
) => {
  const res = await app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, body: (await res.json()) as unknown };
};

const BODY_DOK = {
  judul: 'Dokumentasi Baru',
  deskripsi: 'Deskripsi baru.',
  tanggal: '2026-10-01',
  kategori: 'Workshop',
};

const BODY_BERITA = {
  judul: 'Berita Baru',
  ringkasan: 'Ringkasan.',
  isi: 'Isi lengkap.',
  tanggal: '2026-10-01',
  penulis: 'Admin',
};

describe('POST /api/admin/login', () => {
  test('password benar → 200 { token } yang valid', async () => {
    const { app } = createTestApp();
    const { status, body } = await kirimTulis(app, 'POST', '/api/admin/login', {
      password: ADMIN_PASSWORD_TEST,
    });
    expect(status).toBe(200);
    const token = (body as { token: string }).token;
    expect(typeof token).toBe('string');
    // Token yang diterbitkan diterima guard route tulis.
    const cek = await kirimTulis(app, 'DELETE', `/api/dokumentasi/${sampleDok.slug}`, null, token);
    expect(cek.status).toBe(200);
  });

  test('password salah / body bukan objek → 401', async () => {
    const { app } = createTestApp();
    const salah = await kirimTulis(app, 'POST', '/api/admin/login', { password: 'salah' });
    expect(salah.status).toBe(401);
    expect(salah.body).toEqual({ error: 'Password salah' });

    const bukanObjek = await kirimTulis(app, 'POST', '/api/admin/login', 'halo');
    expect(bukanObjek.status).toBe(401);
  });

  test('gagal beruntun dibatasi 429 + Retry-After; login benar me-reset hitungan', async () => {
    const { app } = createTestApp();
    const kirim = (password: string, ip: string) =>
      app.handle(
        new Request('http://localhost/api/admin/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
          body: JSON.stringify({ password }),
        }),
      );

    // IP A: 5 gagal pertama tetap 401 (kuota habis), percobaan ke-6 diblokir 429.
    for (let i = 0; i < 5; i++) {
      expect((await kirim('salah', '198.51.100.1')).status).toBe(401);
    }
    const terkunci = await kirim('salah', '198.51.100.1');
    expect(terkunci.status).toBe(429);
    expect(terkunci.headers.get('Retry-After')).not.toBeNull();
    const pesan = (await terkunci.json()) as { error: string };
    expect(pesan.error).toContain('percobaan login');

    // IP A tetap terkunci walau password benar — dicek sebelum verifikasi.
    expect((await kirim(ADMIN_PASSWORD_TEST, '198.51.100.1')).status).toBe(429);

    // IP lain tidak terdampak lock.
    expect((await kirim(ADMIN_PASSWORD_TEST, '198.51.100.2')).status).toBe(200);

    // Login benar mereset hitungan: 4 gagal + sukses, lalu 5 gagal baru
    // terkunci pada percobaan keenam sesudah reset.
    for (let i = 0; i < 4; i++) {
      expect((await kirim('salah', '198.51.100.3')).status).toBe(401);
    }
    expect((await kirim(ADMIN_PASSWORD_TEST, '198.51.100.3')).status).toBe(200);
    for (let i = 0; i < 4; i++) {
      expect((await kirim('salah', '198.51.100.3')).status).toBe(401);
    }
    expect((await kirim('salah', '198.51.100.3')).status).toBe(401); // gagal ke-5 setelah reset
    expect((await kirim('salah', '198.51.100.3')).status).toBe(429); // baru terkunci
  });
});

describe('guard route tulis (dokumentasi & berita)', () => {
  test('tanpa Authorization → 401; token salah → 401', async () => {
    const { app } = createTestApp();
    const tanpaToken = await kirimTulis(app, 'POST', '/api/dokumentasi', BODY_DOK, null);
    expect(tanpaToken.status).toBe(401);

    const tokenSalah = await kirimTulis(
      app,
      'POST',
      '/api/dokumentasi',
      BODY_DOK,
      '1700000000000.abc',
    );
    expect(tokenSalah.status).toBe(401);
  });
});

describe('POST /api/dokumentasi', () => {
  test('token valid + body valid → 201, slug dibuat dari judul, repo.create dipanggil', async () => {
    const { app, calls } = createTestApp();
    const { status, body } = await kirimTulis(app, 'POST', '/api/dokumentasi', BODY_DOK);
    expect(status).toBe(201);
    expect((body as { slug: string }).slug).toBe('dokumentasi-baru');

    const create = calls.find((c) => c.method === 'dokumentasi.create');
    expect(create).toBeDefined();
    expect(create?.args[0]).toBe('dokumentasi-baru');
  });

  test('slug bentrok dengan konten ada → 409', async () => {
    const { app } = createTestApp();
    const { status, body } = await kirimTulis(app, 'POST', '/api/dokumentasi', {
      ...BODY_DOK,
      judul: 'dok-1', // slugDariJudul → 'dok-1' = sampleDok.slug yang sudah ada
    });
    expect(status).toBe(409);
    expect(body).toEqual({ error: 'Slug sudah dipakai — judul bentrok dengan konten lain' });
  });

  test('field wajib hilang → 400 dengan pesan field', async () => {
    const { app } = createTestApp();
    const { status, body } = await kirimTulis(app, 'POST', '/api/dokumentasi', {
      ...BODY_DOK,
      kategori: '',
    });
    expect(status).toBe(400);
    expect(body).toEqual({ error: 'Field "kategori" wajib diisi' });
  });

  test('slug hasil judul kosong (tanda baca semua) → 400', async () => {
    const { app } = createTestApp();
    const { status } = await kirimTulis(app, 'POST', '/api/dokumentasi', {
      ...BODY_DOK,
      judul: '!!! ???',
    });
    expect(status).toBe(400);
  });
});

describe('PUT /api/dokumentasi/:slug', () => {
  test('slug ada + body valid → 200, repo.update dipanggil dengan slug yang sama', async () => {
    const { app, calls } = createTestApp();
    const { status, body } = await kirimTulis(
      app,
      'PUT',
      `/api/dokumentasi/${sampleDok.slug}`,
      BODY_DOK,
    );
    expect(status).toBe(200);
    expect((body as { slug: string }).slug).toBe(sampleDok.slug);

    const update = calls.find((c) => c.method === 'dokumentasi.update');
    expect(update?.args[0]).toBe(sampleDok.slug);
  });

  test('slug tidak ada → 404', async () => {
    const { app } = createTestApp();
    const { status, body } = await kirimTulis(app, 'PUT', '/api/dokumentasi/tidak-ada', BODY_DOK);
    expect(status).toBe(404);
    expect(body).toEqual({ error: 'Dokumentasi tidak ditemukan' });
  });

  test('body tidak valid → 400 tanpa menyentuh repository', async () => {
    const { app, calls } = createTestApp();
    const { status } = await kirimTulis(app, 'PUT', `/api/dokumentasi/${sampleDok.slug}`, {
      ...BODY_DOK,
      tanggal: 'besok',
    });
    expect(status).toBe(400);
    expect(calls.some((c) => c.method === 'dokumentasi.update')).toBe(false);
  });
});

describe('DELETE /api/dokumentasi/:slug', () => {
  test('slug ada → 200 { ok: true }', async () => {
    const { app, calls } = createTestApp();
    const { status, body } = await kirimTulis(
      app,
      'DELETE',
      `/api/dokumentasi/${sampleDok.slug}`,
      null,
    );
    expect(status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(calls.some((c) => c.method === 'dokumentasi.remove')).toBe(true);
  });

  test('slug tidak ada → 404', async () => {
    const { app } = createTestApp();
    const { status, body } = await kirimTulis(app, 'DELETE', '/api/dokumentasi/hilang', null);
    expect(status).toBe(404);
    expect(body).toEqual({ error: 'Dokumentasi tidak ditemukan' });
  });
});

describe('POST /api/berita (mirror dokumentasi)', () => {
  test('token valid + body valid → 201 + slug dari judul', async () => {
    const { app, calls } = createTestApp();
    const { status, body } = await kirimTulis(app, 'POST', '/api/berita', BODY_BERITA);
    expect(status).toBe(201);
    expect((body as { slug: string }).slug).toBe('berita-baru');
    expect(calls.some((c) => c.method === 'berita.create')).toBe(true);
  });

  test('tanpa token → 401; field hilang → 400', async () => {
    const { app } = createTestApp();
    const tanpaToken = await kirimTulis(app, 'POST', '/api/berita', BODY_BERITA, null);
    expect(tanpaToken.status).toBe(401);

    const tanpaPenulis = await kirimTulis(app, 'POST', '/api/berita', {
      ...BODY_BERITA,
      penulis: '  ',
    });
    expect(tanpaPenulis.status).toBe(400);
    expect(tanpaPenulis.body).toEqual({ error: 'Field "penulis" wajib diisi' });
  });

  test('slug bentrok → 409', async () => {
    const { app } = createTestApp();
    const { status } = await kirimTulis(app, 'POST', '/api/berita', {
      ...BODY_BERITA,
      judul: 'berita-1', // slugDariJudul → 'berita-1' = sampleBerita.slug
    });
    expect(status).toBe(409);
  });
});

describe('PUT & DELETE /api/berita', () => {
  test('PUT slug ada → 200; tidak ada → 404', async () => {
    const { app } = createTestApp();
    const ada = await kirimTulis(app, 'PUT', `/api/berita/${sampleBerita.slug}`, BODY_BERITA);
    expect(ada.status).toBe(200);
    expect((ada.body as { slug: string }).slug).toBe(sampleBerita.slug);

    const tidakAda = await kirimTulis(app, 'PUT', '/api/berita/tidak-ada', BODY_BERITA);
    expect(tidakAda.status).toBe(404);
    expect(tidakAda.body).toEqual({ error: 'Berita tidak ditemukan' });
  });

  test('DELETE ada → 200; tidak ada → 404; tanpa token → 401', async () => {
    const { app } = createTestApp();
    const ada = await kirimTulis(app, 'DELETE', `/api/berita/${sampleBerita.slug}`, null);
    expect(ada.status).toBe(200);
    expect(ada.body).toEqual({ ok: true });

    const tidakAda = await kirimTulis(app, 'DELETE', '/api/berita/hilang', null);
    expect(tidakAda.status).toBe(404);

    const tanpaToken = await kirimTulis(app, 'DELETE', `/api/berita/${sampleBerita.slug}`, null, null);
    expect(tanpaToken.status).toBe(401);
  });
});

const BODY_KURSUS = {
  kode: 'p02',
  judul: 'Kursus Baru',
  deskripsi: 'Deskripsi.',
  tentang: 'Tentang.',
  durasi: '2 sesi',
  level: 'Pemula',
  format: 'Online',
  instruktur: 'Tim',
  peran: 'Pengajar',
  inisial: 'T',
  target: ['Mahasiswa'],
  hasil: ['Hasil 1'],
  modul: [{ judul: 'M1', deskripsi: 'D1', meta: '2 video' }],
};

describe('CRUD /api/kursus (admin)', () => {
  test('POST valid → 201 + kode di-uppercase; duplikat → 409; invalid → 400; tanpa token → 401', async () => {
    const { app, calls } = createTestApp();
    const { status, body } = await kirimTulis(app, 'POST', '/api/kursus', BODY_KURSUS);
    expect(status).toBe(201);
    expect((body as { kode: string }).kode).toBe('P02');
    expect(calls.find((c) => c.method === 'kursus.create')).toBeDefined();

    const duplikat = await kirimTulis(app, 'POST', '/api/kursus', { ...BODY_KURSUS, kode: 'R01' });
    expect(duplikat.status).toBe(409);

    const invalid = await kirimTulis(app, 'POST', '/api/kursus', { ...BODY_KURSUS, modul: [] });
    expect(invalid.status).toBe(400);

    const tanpaToken = await kirimTulis(app, 'POST', '/api/kursus', BODY_KURSUS, null);
    expect(tanpaToken.status).toBe(401);
  });

  test('PUT cocok → 200; kode beda dengan path → 400; tidak ada → 404', async () => {
    const { app } = createTestApp();
    const { status } = await kirimTulis(app, 'PUT', '/api/kursus/R01', { ...BODY_KURSUS, kode: 'r01' });
    expect(status).toBe(200);

    const beda = await kirimTulis(app, 'PUT', '/api/kursus/R01', BODY_KURSUS);
    expect(beda.status).toBe(400);

    const hilang = await kirimTulis(app, 'PUT', '/api/kursus/Z99', { ...BODY_KURSUS, kode: 'Z99' });
    expect(hilang.status).toBe(404);
  });

  test('DELETE ada → 200; tidak ada → 404; tanpa token → 401', async () => {
    const { app } = createTestApp();
    expect((await kirimTulis(app, 'DELETE', '/api/kursus/R01', null)).status).toBe(200);
    expect((await kirimTulis(app, 'DELETE', '/api/kursus/Z99', null)).status).toBe(404);
    expect((await kirimTulis(app, 'DELETE', '/api/kursus/R01', null, null)).status).toBe(401);
  });
});

describe('POST /api/admin/upload + GET /uploads/:nama', () => {
  const filePng = () => new File([new Uint8Array([137, 80, 78, 71])], 'foto.png', { type: 'image/png' });

  async function kirimFile(
    app: ReturnType<typeof createApp>,
    file: unknown,
    token: string | null = TOKEN_ADMIN,
  ) {
    const form = new FormData();
    form.append('gambar', file as Blob);
    const res = await app.handle(
      new Request('http://localhost/api/admin/upload', {
        method: 'POST',
        headers: token === null ? {} : { Authorization: `Bearer ${token}` },
        body: form,
      }),
    );
    return { status: res.status, body: (await res.json()) as unknown };
  }

  test('tanpa token → 401; file bukan gambar → 400', async () => {
    const { mkdtemp, rm } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');
    const dir = await mkdtemp(join(tmpdir(), 'rute-unggah-'));
    const lama = process.env.UPLOAD_DIR;
    process.env.UPLOAD_DIR = dir;
    try {
      const { app } = createTestApp();
      const tanpaToken = await kirimFile(app, filePng(), null);
      expect(tanpaToken.status).toBe(401);

      const form = new FormData();
      form.append('gambar', new File(['halo'], 'a.txt', { type: 'text/plain' }));
      const res = await app.handle(
        new Request('http://localhost/api/admin/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${TOKEN_ADMIN}` },
          body: form,
        }),
      );
      expect(res.status).toBe(400);
    } finally {
      if (lama === undefined) delete process.env.UPLOAD_DIR;
      else process.env.UPLOAD_DIR = lama;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('file valid → 201 { url } + GET menyajikan file; traversal → 404', async () => {
    const { mkdtemp, rm } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');
    const dir = await mkdtemp(join(tmpdir(), 'rute-unggah-'));
    const lama = process.env.UPLOAD_DIR;
    process.env.UPLOAD_DIR = dir;
    try {
      const { app } = createTestApp();
      const { status, body } = await kirimFile(app, filePng());
      expect(status).toBe(201);
      const url = (body as { url: string }).url;
      expect(url).toMatch(/^\/uploads\/[A-Za-z0-9_-]+\.png$/);

      const ambil = await app.handle(new Request(`http://localhost${url}`));
      expect(ambil.status).toBe(200);
      expect(ambil.headers.get('Content-Type')).toBe('image/png');

      const hilang = await app.handle(new Request('http://localhost/uploads/tidak-ada.png'));
      expect(hilang.status).toBe(404);
      const jahat = await app.handle(new Request('http://localhost/uploads/..%2Fapp.ts'));
      expect(jahat.status).toBe(404);
    } finally {
      if (lama === undefined) delete process.env.UPLOAD_DIR;
      else process.env.UPLOAD_DIR = lama;
      await rm(dir, { recursive: true, force: true });
    }
  });
});
