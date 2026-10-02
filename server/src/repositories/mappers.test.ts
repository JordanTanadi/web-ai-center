/**
 * Unit test mapper — kontrak row → respons harus identik dengan interface
 * frontend, dan kolom NULL tidak boleh bocor sebagai `null` di JSON.
 */
import { describe, expect, test } from 'bun:test';
import { heroSlides, kursus, layanan, profil, tim, berita, dokumentasi } from '../db/schema';
import {
  toAnggotaTim,
  toBeritaItem,
  toDokumentasiItem,
  toHeroSlide,
  toKlien,
  toKursus,
  toLayanan,
  toProfil,
  toTestimoni,
} from './mappers';

type BeritaRow = typeof berita.$inferSelect;
type DokumentasiRow = typeof dokumentasi.$inferSelect;
type TimRow = typeof tim.$inferSelect;
type LayananRow = typeof layanan.$inferSelect;
type HeroRow = typeof heroSlides.$inferSelect;
type ProfilRow = typeof profil.$inferSelect;
type KursusRow = typeof kursus.$inferSelect;

const baseBerita: BeritaRow = {
  id: 1,
  slug: 'berita-1',
  judul: 'Judul',
  ringkasan: 'Ringkasan',
  isi: 'Isi lengkap',
  tanggal: '2026-08-01',
  gambar: null,
  penulis: 'Humas',
  createdAt: new Date('2026-08-01T00:00:00Z'),
};

const baseDokumentasi: DokumentasiRow = {
  id: 1,
  slug: 'dok-1',
  judul: 'Workshop',
  deskripsi: 'Deskripsi',
  tanggal: '2026-07-15',
  kategori: 'Workshop',
  gambar: null,
  createdAt: new Date('2026-07-15T00:00:00Z'),
};

const baseTim: TimRow = {
  id: 1,
  nama: 'Nama',
  peran: 'Kepala',
  kredensial: null,
  foto: null,
  urutan: 0,
};

const baseLayanan: LayananRow = {
  id: 1,
  slug: 'pelatihan',
  nama: 'Pelatihan',
  tagline: 'Tagline',
  deskripsi: 'Deskripsi',
  fitur: ['a', 'b'],
};

const baseHero: HeroRow = {
  id: 1,
  urutan: 0,
  eyebrow: 'Eyebrow',
  judul: 'Judul',
  judulAksen: 'Aksen',
  sub: 'Sub',
  ctaPrimer: { label: 'Tentang Kami', to: '/tentang-kami' },
  ctaSekunder: { label: 'Lihat Berita', to: '/berita' },
  badgeJudul: 'Badge',
  badgeSub: 'Badge sub',
  image: null,
  srcSet: null,
  sizes: null,
  layout: null,
};

const baseProfil: ProfilRow = {
  id: 1,
  nama: 'AI Center Universitas Surabaya',
  tagline: 'Tagline',
  ringkasan: 'Ringkasan',
  alamat: 'Jl. Contoh',
  email: 'info@example.test',
  telepon: '+62312981000',
  visi: null,
  misi: null,
  statistik: null,
};

describe('toBeritaItem', () => {
  test('row lengkap → field frontend terpetakan + id/createdAt tidak ikut', () => {
    const item = toBeritaItem({ ...baseBerita, gambar: '/berita.jpg' });
    expect(item).toEqual({
      slug: 'berita-1',
      judul: 'Judul',
      ringkasan: 'Ringkasan',
      isi: 'Isi lengkap',
      tanggal: '2026-08-01',
      gambar: '/berita.jpg',
      penulis: 'Humas',
    });
    expect('id' in item).toBe(false);
    expect('createdAt' in item).toBe(false);
  });

  test('edge: gambar NULL → hilang dari JSON (bukan null)', () => {
    const json = JSON.stringify(toBeritaItem(baseBerita));
    expect(json).not.toContain('gambar');
    expect(json).not.toContain('null');
  });
});

describe('toDokumentasiItem', () => {
  test('kolom terpetak dan gambar NULL omitted dari JSON', () => {
    const item = toDokumentasiItem(baseDokumentasi);
    expect(item).toEqual({
      slug: 'dok-1',
      judul: 'Workshop',
      deskripsi: 'Deskripsi',
      tanggal: '2026-07-15',
      kategori: 'Workshop',
    });
    expect(JSON.stringify(item)).not.toContain('gambar');
  });
});

describe('toAnggotaTim', () => {
  test('kredensial/foto terisi → ikut; keduanya NULL → omitted', () => {
    expect(toAnggotaTim({ ...baseTim, kredensial: 'Ph.D.' })).toEqual({
      nama: 'Nama',
      peran: 'Kepala',
      kredensial: 'Ph.D.',
    });
    const bare = JSON.stringify(toAnggotaTim(baseTim));
    expect(bare).not.toContain('kredensial');
    expect(bare).not.toContain('foto');
  });
});

describe('toLayanan', () => {
  test('fitur (jsonb) diteruskan apa adanya', () => {
    expect(toLayanan(baseLayanan).fitur).toEqual(['a', 'b']);
    expect(toLayanan(baseLayanan).slug).toBe('pelatihan');
  });

  test('edge: fitur kosong tetap [] (bukan null)', () => {
    expect(toLayanan({ ...baseLayanan, fitur: [] }).fitur).toEqual([]);
  });
});

describe('toHeroSlide', () => {
  test('CTA jsonb dipetakan, gambar/srcset/sizes/layout NULL omitted', () => {
    const slide = toHeroSlide(baseHero);
    expect(slide.ctaPrimer).toEqual({ label: 'Tentang Kami', to: '/tentang-kami' });
    expect(slide.judulAksen).toBe('Aksen');
    const json = JSON.stringify(slide);
    expect(json).not.toContain('image');
    expect(json).not.toContain('srcSet');
    expect(json).not.toContain('sizes');
    expect(json).not.toContain('layout');
  });

  test('srcSet terisi → muncul di JSON', () => {
    const slide = toHeroSlide({ ...baseHero, srcSet: '/hero-1-800.webp 800w' });
    expect(JSON.stringify(slide)).toContain('/hero-1-800.webp 800w');
  });

  test('layout terisi → ikut direspons (slide Inference: image-left)', () => {
    const slide = toHeroSlide({ ...baseHero, layout: 'image-left' });
    expect(slide.layout).toBe('image-left');
  });
});

describe('toKlien / toTestimoni', () => {
  test('field sederhana terpetak penuh', () => {
    expect(toKlien({ id: 1, nama: 'PT X', bidang: 'Teknologi', urutan: 0 })).toEqual({
      nama: 'PT X',
      bidang: 'Teknologi',
    });
    expect(
      toTestimoni({ id: 1, nama: 'A', peran: 'B', kutipan: 'C', urutan: 0 }),
    ).toEqual({ nama: 'A', peran: 'B', kutipan: 'C' });
  });
});

describe('toProfil', () => {
  test('field wajib selalu ada; visi/misi/statistik NULL → omitted', () => {
    const json = JSON.stringify(toProfil(baseProfil));
    expect(toProfil(baseProfil).email).toBe('info@example.test');
    expect(json).not.toContain('visi');
    expect(json).not.toContain('misi');
    expect(json).not.toContain('statistik');
  });

  test('visi/misi/statistik terisi → ikut', () => {
    const p = toProfil({
      ...baseProfil,
      visi: 'Visi',
      misi: 'Misi',
      statistik: [{ label: 'Riset', value: '12' }],
    });
    expect(p.visi).toBe('Visi');
    expect(p.misi).toBe('Misi');
    expect(p.statistik).toEqual([{ label: 'Riset', value: '12' }]);
  });
});

describe('toKursus', () => {
  const baseKursus: KursusRow = {
    id: 1,
    urutan: 0,
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
    hasil: ['Hasil 1'],
    modul: [{ judul: 'Modul 1', deskripsi: 'Desc', meta: '4 video · 35 menit' }],
  };

  test('semua field kontrak terpetak; id/urutan tidak ikut', () => {
    const item = toKursus(baseKursus);
    expect(item).toEqual({
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
      hasil: ['Hasil 1'],
      modul: [{ judul: 'Modul 1', deskripsi: 'Desc', meta: '4 video · 35 menit' }],
    });
    expect('id' in item).toBe(false);
    expect('urutan' in item).toBe(false);
  });

  test('edge: hasil/modul kosong tetap [] (bukan null)', () => {
    const item = toKursus({ ...baseKursus, hasil: [], modul: [] });
    expect(item.hasil).toEqual([]);
    expect(item.modul).toEqual([]);
  });
});
