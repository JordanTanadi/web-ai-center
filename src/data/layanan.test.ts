import { describe, expect, it } from 'vitest';
import { getLayananBySlug, layananDummy } from './layanan.ts';

describe('layananDummy', () => {
  it('menyediakan tepat dua layanan yang disepakati', () => {
    expect(layananDummy.map((item) => item.slug)).toEqual(['pelatihan', 'inference-solution']);
  });

  it('mengembalikan undefined untuk slug kosong atau tidak dikenal', () => {
    expect(getLayananBySlug('')).toBeUndefined();
    expect(getLayananBySlug('gpu-rental')).toBeUndefined();
  });
});