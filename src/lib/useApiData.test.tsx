import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiDaftar, useApiObjek } from './useApiData.ts';
import { ambilDaftar, ambilJson, harusFetch } from './api.ts';

// Mock modul api: hook diuji terpisah dari jaringan (fetch diuji di api.test.ts).
vi.mock('./api.ts', () => ({
  BASE_URL_API: 'http://api.test',
  harusFetch: vi.fn(() => false),
  ambilDaftar: vi.fn(),
  ambilJson: vi.fn(),
}));

const mockHarusFetch = vi.mocked(harusFetch);
const mockDaftar = vi.mocked(ambilDaftar);
const mockJson = vi.mocked(ambilJson);

beforeEach(() => {
  vi.clearAllMocks();
  mockHarusFetch.mockReturnValue(false);
  mockDaftar.mockResolvedValue([]);
  mockJson.mockResolvedValue(undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('useApiDaftar', () => {
  it('integrasi mati → tampilkan fallback, tanpa request', () => {
    mockHarusFetch.mockReturnValue(false);
    const { result } = renderHook(() => useApiDaftar('/berita', ['dummy']));
    expect(result.current).toEqual(['dummy']);
    expect(mockDaftar).not.toHaveBeenCalled();
  });

  it('integrasi nyala → data backend menggantikan fallback', async () => {
    mockHarusFetch.mockReturnValue(true);
    mockDaftar.mockResolvedValue(['dari-server']);
    const { result } = renderHook(() => useApiDaftar('/berita', ['dummy']));
    expect(result.current).toEqual(['dummy']); // render pertama: fallback dulu
    await waitFor(() => expect(result.current).toEqual(['dari-server']));
    expect(mockDaftar).toHaveBeenCalledWith('/berita', ['dummy']);
  });

  it('loader gagal (reject) → tetap fallback, tidak crash', async () => {
    mockHarusFetch.mockReturnValue(true);
    mockDaftar.mockRejectedValue(new Error('server mati'));
    const { result } = renderHook(() => useApiDaftar('/berita', ['dummy']));
    await waitFor(() => expect(mockDaftar).toHaveBeenCalled());
    // beri satu tick untuk catch; data tidak boleh berubah
    await waitFor(() => expect(result.current).toEqual(['dummy']));
    expect(console.error).toHaveBeenCalled();
  });

  it('path berubah → reset sinkron ke fallback baru (anti konten lama)', () => {
    mockHarusFetch.mockReturnValue(false);
    const { result, rerender } = renderHook(
      ({ path, fallback }: { path: string; fallback: string[] }) => useApiDaftar(path, fallback),
      { initialProps: { path: '/berita', fallback: ['lama'] as string[] } },
    );
    expect(result.current).toEqual(['lama']);
    rerender({ path: '/dokumentasi', fallback: ['baru'] });
    expect(result.current).toEqual(['baru']);
  });
});

describe('useApiObjek', () => {
  it('integrasi mati → objek fallback dipertahankan', () => {
    mockHarusFetch.mockReturnValue(false);
    const fallback = { slug: 'berita-1', judul: 'Judul' };
    const { result } = renderHook(() => useApiObjek('/berita/berita-1', fallback));
    expect(result.current).toBe(fallback);
    expect(mockJson).not.toHaveBeenCalled();
  });

  it('fallback undefined (slug tidak dikenal) → tetap undefined tanpa request', () => {
    mockHarusFetch.mockReturnValue(false);
    const { result } = renderHook(() => useApiObjek('/berita/tidak-ada', undefined));
    expect(result.current).toBeUndefined();
    expect(mockJson).not.toHaveBeenCalled();
  });

  it('integrasi nyala → data detail dari server', async () => {
    mockHarusFetch.mockReturnValue(true);
    mockJson.mockResolvedValue({ slug: 'dari-server', judul: 'Baru' });
    const { result } = renderHook(() =>
      useApiObjek('/berita/berita-1', { slug: 'fallback', judul: 'Lama' }),
    );
    await waitFor(() => expect(result.current).toEqual({ slug: 'dari-server', judul: 'Baru' }));
  });
});
