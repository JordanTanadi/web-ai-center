import { describe, expect, it } from 'vitest';
import { slugify } from './slug.ts';

describe('slugify', () => {
  it('mengubah judul menjadi slug lowercase dengan strip', () => {
    expect(slugify('Pelatihan Dasar Machine Learning')).toBe('pelatihan-dasar-machine-learning');
  });

  it('menghapus diakritik dan karakter khusus', () => {
    expect(slugify('Kunjungan Industri — Semester Genap!')).toBe('kunjungan-industri-semester-genap');
  });

  it('edge case: input kosong dan strip ganda', () => {
    expect(slugify('')).toBe('');
    expect(slugify('  GPU   Rental  ')).toBe('gpu-rental');
  });
});
