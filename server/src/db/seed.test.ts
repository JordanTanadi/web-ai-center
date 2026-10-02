/**
 * Unit test integritas data seed (murni, tanpa DB):
 * menjaga seed selalu valid untuk kontrak frontend & aturan bisnis dasar.
 */
import { describe, expect, test } from 'bun:test';
import {
  SEED_BERITA,
  SEED_DOKUMENTASI,
  SEED_HERO,
  SEED_KLIEN,
  SEED_KURSUS,
  SEED_LAYANAN,
  SEED_PROFIL,
  SEED_TESTIMONI,
  SEED_TIM,
} from './seed';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const uniqueValues = (values: string[]): boolean => new Set(values).size === values.length;

describe('SEED_BERITA', () => {
  test('slug unik & tanggal ISO valid', () => {
    expect(SEED_BERITA.length).toBeGreaterThan(0);
    expect(uniqueValues(SEED_BERITA.map((b) => b.slug))).toBe(true);
    for (const b of SEED_BERITA) {
      expect(b.tanggal).toMatch(ISO_DATE);
      expect(b.judul.length).toBeGreaterThan(0);
      expect(b.penulis.length).toBeGreaterThan(0);
    }
  });

  test('edge: slug wajib format slug (huruf kecil-angka-dash)', () => {
    for (const b of SEED_BERITA) {
      expect(b.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});

describe('SEED_DOKUMENTASI', () => {
  test('slug unik, tanggal ISO, kategori terisi', () => {
    expect(SEED_DOKUMENTASI.length).toBeGreaterThan(0);
    expect(uniqueValues(SEED_DOKUMENTASI.map((d) => d.slug))).toBe(true);
    for (const d of SEED_DOKUMENTASI) {
      expect(d.tanggal).toMatch(ISO_DATE);
      expect(d.kategori.length).toBeGreaterThan(0);
    }
  });
});

describe('SEED_LAYANAN', () => {
  test('slug unik dan tiap layanan punya minimal 1 fitur', () => {
    expect(uniqueValues(SEED_LAYANAN.map((l) => l.slug))).toBe(true);
    for (const l of SEED_LAYANAN) {
      expect(l.fitur.length).toBeGreaterThan(0);
      expect(l.slug.length).toBeGreaterThan(0);
    }
  });
});

describe('SEED_HERO', () => {
  test('minimal 1 slide; CTA label valid & tujuan rute ("/") atau URL eksternal (https://)', () => {
    expect(SEED_HERO.length).toBeGreaterThan(0);
    // Kontrak frontend (HeroCarousel): rute internal diawali '/', URL eksternal
    // diawali https:// (CTA slide 1 = konsultasi WA statis situs lama).
    const tujuanValid = (to: string) => to.startsWith('/') || to.startsWith('https://');
    for (const slide of SEED_HERO) {
      expect(slide.ctaPrimer.label.length).toBeGreaterThan(0);
      expect(tujuanValid(slide.ctaPrimer.to)).toBe(true);
      expect(tujuanValid(slide.ctaSekunder.to)).toBe(true);
    }
  });

  test('urutan tidak duplikat (penomoran carousel stabil)', () => {
    const urutan = SEED_HERO.map((s) => s.urutan as number);
    expect(uniqueValues(urutan.map(String))).toBe(true);
  });

  test('layout image-left dicabut dari data (konsul 2 Okt): slide Inference ikut default', () => {
    const inferensi = SEED_HERO.find((s) => s.eyebrow === 'Inference Solution');
    expect(inferensi?.layout).toBeUndefined();
    for (const slide of SEED_HERO) {
      expect([null, undefined, 'default', 'image-left']).toContain(slide.layout);
    }
  });
});

describe('SEED_TIM / SEED_KLIEN / SEED_TESTIMONI', () => {
  test('nama & bidang/peran terisi', () => {
    expect(SEED_TIM.length).toBeGreaterThan(0);
    expect(SEED_KLIEN.length).toBeGreaterThan(0);
    expect(SEED_TESTIMONI.length).toBeGreaterThan(0);
    for (const t of SEED_TIM) {
      expect(t.nama.length).toBeGreaterThan(0);
      expect(t.peran.length).toBeGreaterThan(0);
    }
    for (const k of SEED_KLIEN) expect(k.bidang.length).toBeGreaterThan(0);
    for (const t of SEED_TESTIMONI) expect(t.kutipan.length).toBeGreaterThan(0);
  });
});

describe('SEED_KURSUS', () => {
  test('kode unik & huruf besar; tiap kursus punya hasil + modul', () => {
    expect(SEED_KURSUS.length).toBeGreaterThan(0);
    expect(uniqueValues(SEED_KURSUS.map((k) => k.kode))).toBe(true);
    for (const k of SEED_KURSUS) {
      expect(k.kode).toMatch(/^[A-Z][0-9]{2}$/);
      expect(k.judul.length).toBeGreaterThan(0);
      expect(k.target.length).toBeGreaterThan(0);
      expect(k.hasil.length).toBeGreaterThan(0);
      expect(k.modul.length).toBeGreaterThan(0);
      expect(k.inisial.length).toBeGreaterThan(0);
    }
  });

  test('urutan tidak duplikat (urutan katalog stabil)', () => {
    const urutan = SEED_KURSUS.map((k) => k.urutan as number);
    expect(uniqueValues(urutan.map(String))).toBe(true);
  });
});

describe('SEED_PROFIL', () => {
  test('baris tunggal id=1; kontak footer wajib terisi', () => {
    expect(SEED_PROFIL.id).toBe(1);
    expect(SEED_PROFIL.alamat.length).toBeGreaterThan(0);
    expect(SEED_PROFIL.email).toContain('@');
    expect(SEED_PROFIL.telepon.length).toBeGreaterThan(0);
    expect(SEED_PROFIL.ringkasan.length).toBeGreaterThan(0);
    expect(SEED_PROFIL.tagline.length).toBeGreaterThan(0);
  });

  test('edge: visi/misi/statistik boleh null (frontend harus sudah siap)', () => {
    expect(SEED_PROFIL.visi === null || typeof SEED_PROFIL.visi === 'string').toBe(true);
    expect(SEED_PROFIL.misi === null || typeof SEED_PROFIL.misi === 'string').toBe(true);
  });

  test('visi & misi memakai teks resmi (judul AI Solution Factory + 5 poin per baris)', () => {
    expect(SEED_PROFIL.visi).toContain('AI Solution Factory terdepan');
    const baris = (SEED_PROFIL.misi ?? '').split('\n');
    expect(baris).toHaveLength(5);
    for (const b of baris) expect(b.trim().length).toBeGreaterThan(0);
    // Kontak mengikuti keputusan rapat: email AI Center + nomor WhatsApp
    expect(SEED_PROFIL.email).toBe('aicenter@unit.ubaya.ac.id');
    expect(SEED_PROFIL.telepon).toBe('0895-6342-22240');
  });
});
