import { describe, expect, it } from 'vitest';
import { LABEL_PESERTA, PREFIKS_KODE, kodeOtomatis } from './kodeKursus.ts';
import { kategoriKursus } from '../data/pelatihan.ts';

describe('kodeOtomatis', () => {
  it('prefiks per peserta + nomor 01 saat belum ada kode sebelumnya', () => {
    expect(kodeOtomatis('Mahasiswa', [])).toBe('M01');
    expect(kodeOtomatis('Dosen', [])).toBe('D01');
    expect(kodeOtomatis('Guru', [])).toBe('G01');
    expect(kodeOtomatis('Masyarakat umum', [])).toBe('U01');
  });

  it('nomor = angka terbesar pada prefiks itu + 1 (urutan tak berurutan & huruf kecil ikut dihitung)', () => {
    expect(kodeOtomatis('Mahasiswa', ['M03', 'M01', 'm02'])).toBe('M04');
    expect(kodeOtomatis('Guru', ['G9'])).toBe('G10');
  });

  it('kode prefiks lain (R01/E01/P01) diabaikan — tidak menaikkan nomor', () => {
    expect(kodeOtomatis('Mahasiswa', ['R01', 'E01', 'P01'])).toBe('M01');
  });

  it('tanpa target atau label di luar katalog → string kosong', () => {
    expect(kodeOtomatis('', ['M01'])).toBe('');
    expect(kodeOtomatis('Bukan Peserta', [])).toBe('');
  });

  it('setiap label filter katalog (di luar "Semua program") punya prefiks', () => {
    for (const k of kategoriKursus) {
      if (k.nilai === 'all') continue;
      expect(PREFIKS_KODE[k.label], `label "${k.label}" belum punya prefiks`).toBeTruthy();
    }
    expect(LABEL_PESERTA).not.toContain('Semua program');
    expect(LABEL_PESERTA).toHaveLength(Object.keys(PREFIKS_KODE).length);
  });
});
