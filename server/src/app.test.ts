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
    },
    dokumentasi: {
      list: rec('dokumentasi.list', async (_params: DokumentasiListParams): Promise<DokumentasiItem[]> => [sampleDok]),
      findBySlug: rec('dokumentasi.findBySlug', async (slug: string): Promise<DokumentasiItem | null> =>
        slug === sampleDok.slug ? sampleDok : null),
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
    },
  };
  return { repos, calls };
}

const CORS_ORIGINS = ['http://localhost:5173'];

function createTestApp(handle = createFakeRepos()) {
  const app = createApp({ repos: handle.repos, corsOrigins: CORS_ORIGINS });
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
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET,OPTIONS');
    expect(res.headers.get('Access-Control-Allow-Headers')).toBe('content-type');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
  });
});
