import { describe, expect, it } from 'vitest';
import { formatTanggal } from './formatTanggal.ts';

describe('formatTanggal', () => {
  it('memformat tanggal ISO ke Bahasa Indonesia', () => {
    expect(formatTanggal('2026-08-01')).toBe('1 Agustus 2026');
  });

  it('edge case: input kosong dan invalid', () => {
    expect(formatTanggal('')).toBe('');
    expect(formatTanggal('bukan-tanggal')).toBe('');
  });
});
