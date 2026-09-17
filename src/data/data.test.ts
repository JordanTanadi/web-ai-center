import { describe, expect, it } from 'vitest';
import { beritaDummy, getBeritaBySlug } from './berita.ts';
import { dokumentasiDummy, getDokumentasiBySlug } from './dokumentasi.ts';
import { timDummy } from './tim.ts';
import { klienDummy } from './klien.ts';
import { testimoniDummy } from './testimoni.ts';

describe('data dummy berita', () => {
  it('setiap item punya slug, judul, dan tanggal valid', () => {
    expect(beritaDummy.length).toBeGreaterThan(0);
    for (const b of beritaDummy) {
      expect(b.slug).toBeTruthy();
      expect(b.judul).toBeTruthy();
      expect(Number.isNaN(new Date(b.tanggal).getTime())).toBe(false);
    }
  });

  it('getBeritaBySlug: ketemu, tidak ketemu, dan slug kosong', () => {
    expect(getBeritaBySlug(beritaDummy[0].slug)?.judul).toBe(beritaDummy[0].judul);
    expect(getBeritaBySlug('tidak-ada')).toBeUndefined();
    expect(getBeritaBySlug('')).toBeUndefined();
  });
});

describe('data dummy dokumentasi', () => {
  it('setiap item punya slug dan kategori', () => {
    expect(dokumentasiDummy.length).toBeGreaterThan(0);
    for (const d of dokumentasiDummy) {
      expect(d.slug).toBeTruthy();
      expect(d.kategori).toBeTruthy();
    }
  });

  it('getDokumentasiBySlug: ketemu dan tidak ketemu', () => {
    expect(getDokumentasiBySlug(dokumentasiDummy[0].slug)?.judul).toBe(dokumentasiDummy[0].judul);
    expect(getDokumentasiBySlug('')).toBeUndefined();
  });
});

describe('data dummy tim', () => {
  it('setiap anggota punya nama dan peran', () => {
    expect(timDummy.length).toBeGreaterThan(0);
    for (const a of timDummy) {
      expect(a.nama).toBeTruthy();
      expect(a.peran).toBeTruthy();
    }
  });
});

describe('data dummy klien', () => {
  it('setiap klien punya nama dan bidang', () => {
    expect(klienDummy.length).toBeGreaterThan(0);
    for (const k of klienDummy) {
      expect(k.nama).toBeTruthy();
      expect(k.bidang).toBeTruthy();
    }
  });
});

describe('data dummy testimoni', () => {
  it('setiap testimoni punya nama, peran, dan kutipan', () => {
    expect(testimoniDummy.length).toBeGreaterThan(0);
    for (const t of testimoniDummy) {
      expect(t.nama).toBeTruthy();
      expect(t.kutipan).toBeTruthy();
    }
  });
});
