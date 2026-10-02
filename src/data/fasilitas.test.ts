import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fasilitasDummy } from './fasilitas.ts';

// Konten migrasi dari index.html situs lama (#fasilitas) — 3 ruang.
describe('data fasilitas (migrasi situs lama)', () => {
  it('memuat tepat 3 ruang dengan slug unik', () => {
    expect(fasilitasDummy).toHaveLength(3);
    const slugs = fasilitasDummy.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('setiap ruang punya label, judul, deskripsi, dan alt', () => {
    for (const ruang of fasilitasDummy) {
      expect(ruang.label).toMatch(/^Ruang /);
      expect(ruang.judul).toBeTruthy();
      expect(ruang.deskripsi.length).toBeGreaterThan(10);
      expect(ruang.alt).toBeTruthy();
      expect(ruang.lebar).toBeGreaterThan(0);
      expect(ruang.tinggi).toBeGreaterThan(0);
    }
  });

  it('semua gambar dirujuk ada di public/ (cegah broken image)', () => {
    for (const ruang of fasilitasDummy) {
      expect(ruang.gambar).toMatch(/^\/fasilitas\/[a-z0-9-]+\.jpg$/);
      const path = join(process.cwd(), 'public', ruang.gambar);
      expect(existsSync(path), `hilang: ${ruang.gambar}`).toBe(true);
    }
  });

  it('edge case: ruang diskusi memakai sub-judul Meja Kolaborasi', () => {
    const diskusi = fasilitasDummy.find((r) => r.slug === 'ruang-diskusi');
    expect(diskusi?.judul).toBe('Meja Kolaborasi');
  });
});
