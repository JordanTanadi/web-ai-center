import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ambilDaftar, ambilJson, bangunUrlApi, harusFetch, resolveBaseUrl } from './api.ts';

const BASE = 'http://api.test';

/** Stub fetch yang mengembalikan respons JSON sukses dengan status tertentu. */
function stubFetch(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('resolveBaseUrl', () => {
  it('undefined/kosong → ""; whitespace & slash akhir dibersihkan', () => {
    expect(resolveBaseUrl(undefined)).toBe('');
    expect(resolveBaseUrl('')).toBe('');
    expect(resolveBaseUrl('   ')).toBe('');
    expect(resolveBaseUrl('  http://localhost:3000/api/  ')).toBe('http://localhost:3000/api');
    expect(resolveBaseUrl('http://localhost:3000/api///')).toBe('http://localhost:3000/api');
  });
});

describe('harusFetch', () => {
  it('hanya fetch bila base terisi dan bukan mode test', () => {
    expect(harusFetch('', 'development')).toBe(false);
    expect(harusFetch(BASE, 'test')).toBe(false);
    expect(harusFetch(BASE, 'development')).toBe(true);
    expect(harusFetch(BASE, 'production')).toBe(true);
  });
});

describe('bangunUrlApi', () => {
  it('menggabungkan base + path', () => {
    expect(bangunUrlApi(BASE, '/berita')).toBe('http://api.test/berita');
    expect(bangunUrlApi('http://api.test/api', '/kursus/R01')).toBe(
      'http://api.test/api/kursus/R01',
    );
  });

  it('edge: base kosong atau path tanpa "/" → error eksplisit', () => {
    expect(() => bangunUrlApi('', '/berita')).toThrow('base URL kosong');
    expect(() => bangunUrlApi(BASE, 'berita')).toThrow('diawali');
  });
});

describe('ambilJson', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('HTTP 200 objek → data dikembalikan; URL terpasang benar', async () => {
    const fetchMock = stubFetch({ slug: 'berita-1' });
    const hasil = await ambilJson('/berita/berita-1', { slug: 'fallback' }, BASE);
    expect(hasil).toEqual({ slug: 'berita-1' });
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/berita/berita-1');
  });

  it('HTTP non-2xx → fallback + console.error', async () => {
    stubFetch({ error: 'x' }, 500);
    const hasil = await ambilJson('/kursus/R01', { kode: 'fallback' }, BASE);
    expect(hasil).toEqual({ kode: 'fallback' });
    expect(console.error).toHaveBeenCalled();
  });

  it('respons non-objek (null/angka) → dianggap tidak valid → fallback', async () => {
    stubFetch(null);
    expect(await ambilJson('/profil', { nama: 'fb' }, BASE)).toEqual({ nama: 'fb' });
    stubFetch(42);
    expect(await ambilJson('/profil', { nama: 'fb' }, BASE)).toEqual({ nama: 'fb' });
  });

  it('edge: fetch melempar (network error) → fallback, tidak melempar ke pemanggil', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const hasil = await ambilJson('/profil', { nama: 'fb' }, BASE);
    expect(hasil).toEqual({ nama: 'fb' });
  });
});

describe('ambilDaftar', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('respons { items: [...] } → array item', async () => {
    stubFetch({ items: [{ slug: 'a' }, { slug: 'b' }] });
    const hasil = await ambilDaftar('/berita', [{ slug: 'fallback' }], BASE);
    expect(hasil).toEqual([{ slug: 'a' }, { slug: 'b' }]);
  });

  it('bentuk respons salah (tanpa items) → fallback + console.error', async () => {
    stubFetch({ data: 'bukan-items' });
    const hasil = await ambilDaftar('/berita', [{ slug: 'fallback' }], BASE);
    expect(hasil).toEqual([{ slug: 'fallback' }]);
    expect(console.error).toHaveBeenCalled();
  });

  it('items bukan array → fallback (validasi bentuk eksplisit)', async () => {
    stubFetch({ items: 'bukan-array' });
    expect(await ambilDaftar('/berita', [{ slug: 'fb' }], BASE)).toEqual([{ slug: 'fb' }]);
  });

  it('edge: base kosong → fallback + error tercatat (tanpa request)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const hasil = await ambilDaftar('/berita', [{ slug: 'fb' }], '');
    expect(hasil).toEqual([{ slug: 'fb' }]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
