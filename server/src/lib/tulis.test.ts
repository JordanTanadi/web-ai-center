import { describe, expect, test } from 'vitest';
import {
  slugDariJudul,
  validasiBerita,
  validasiDokumentasi,
  validasiKursus,
  validasiProfil,
  validasiTim,
} from './tulis';

describe('slugDariJudul', () => {
  test('judul normal → slug lowercase dengan strip', () => {
    expect(slugDariJudul('Demo Inference Solution untuk Mitra')).toBe(
      'demo-inference-solution-untuk-mitra',
    );
  });

  test('tanda baca dibuang, spasi ganda/underscore jadi satu strip', () => {
    expect(slugDariJudul('  AI: Center — Ubaya!  ')).toBe('ai-center-ubaya');
    expect(slugDariJudul('angka 2026 &AI')).toBe('angka-2026-ai');
  });

  test('edge: input kosong / tanpa karakter sah → "" (route menolak dengan 400)', () => {
    expect(slugDariJudul('')).toBe('');
    expect(slugDariJudul('!!! ???')).toBe('');
  });
});

const BODY_DOK_VALID = {
  judul: 'Workshop GPU',
  deskripsi: 'Dokumentasi workshop.',
  tanggal: '2026-10-01',
  kategori: 'Workshop',
};

const BODY_BERITA_VALID = {
  judul: 'Berita Baru',
  ringkasan: 'Ringkasan singkat.',
  isi: 'Isi lengkap berita.',
  tanggal: '2026-10-01',
  penulis: 'Admin',
};

describe('validasiDokumentasi', () => {
  test('body lengkap → ok, gambar default null, teks di-trim', () => {
    const hasil = validasiDokumentasi({ ...BODY_DOK_VALID, judul: ' Workshop GPU ' });
    expect(hasil).toEqual({
      ok: true,
      data: { ...BODY_DOK_VALID, judul: 'Workshop GPU', gambar: null },
    });
  });

  test('field wajib kosong/hilang → error eksplisit menyebut field', () => {
    const tanpaJudul = validasiDokumentasi({ ...BODY_DOK_VALID, judul: '   ' });
    expect(tanpaJudul).toEqual({ ok: false, error: 'Field "judul" wajib diisi' });
    const { judul: _dibuang, ...tanpaJudul2 } = BODY_DOK_VALID;
    expect(validasiDokumentasi(tanpaJudul2)).toEqual({ ok: false, error: 'Field "judul" wajib diisi' });
  });

  test('tanggal bukan YYYY-MM-DD atau tidak ada di kalender → tolak', () => {
    expect(validasiDokumentasi({ ...BODY_DOK_VALID, tanggal: '01/10/2026' })).toEqual({
      ok: false,
      error: 'Field "tanggal" harus format YYYY-MM-DD',
    });
    // Lolos pola tapi tidak ada di kalender → cabang "tidak valid" yang kedua.
    expect(validasiDokumentasi({ ...BODY_DOK_VALID, tanggal: '2026-02-30' })).toEqual({
      ok: false,
      error: 'Field "tanggal" tidak valid: 2026-02-30',
    });
  });

  test('edge: body bukan objek → tolak', () => {
    expect(validasiDokumentasi(null)).toEqual({ ok: false, error: 'Body harus objek JSON' });
    expect(validasiDokumentasi('halo')).toEqual({ ok: false, error: 'Body harus objek JSON' });
  });

  test('gambar terisi string dipertahankan; tipe salah → tolak', () => {
    const denganGambar = validasiDokumentasi({ ...BODY_DOK_VALID, gambar: '/berita/x.jpg' });
    expect(denganGambar.ok).toBe(true);
    if (denganGambar.ok) expect(denganGambar.data.gambar).toBe('/berita/x.jpg');
    expect(validasiDokumentasi({ ...BODY_DOK_VALID, gambar: 123 })).toEqual({
      ok: false,
      error: 'Field "gambar" harus teks',
    });
  });
});

describe('validasiBerita', () => {
  test('body lengkap → ok, semua field terpetak', () => {
    const hasil = validasiBerita({ ...BODY_BERITA_VALID, gambar: '' });
    expect(hasil).toEqual({
      ok: true,
      data: { ...BODY_BERITA_VALID, gambar: null },
    });
  });

  test('field ringkasan/isi/penulis wajib — pesan menyebut field yang salah', () => {
    expect(validasiBerita({ ...BODY_BERITA_VALID, penulis: '' })).toEqual({
      ok: false,
      error: 'Field "penulis" wajib diisi',
    });
    const { isi: _isiDibuang, ...tanpaIsi } = BODY_BERITA_VALID;
    expect(validasiBerita(tanpaIsi)).toEqual({ ok: false, error: 'Field "isi" wajib diisi' });
  });
});

const BODY_KURSUS_VALID = {
  kode: 'r01',
  judul: 'Dasar Machine Learning',
  deskripsi: 'Deskripsi singkat.',
  tentang: 'Tentang panjang.',
  durasi: '4 sesi',
  level: 'Pemula',
  format: 'Online',
  instruktur: 'Budi',
  peran: 'Pengajar',
  inisial: 'B',
  target: ['Mahasiswa', ''],
  hasil: ['Mampu regresi'],
  modul: [{ judul: 'M1', deskripsi: 'D1', meta: '4 video' }],
};

describe('validasiKursus', () => {
  test('body valid → kode di-uppercase + array dibersihkan', () => {
    const hasil = validasiKursus(BODY_KURSUS_VALID);
    expect(hasil.ok).toBe(true);
    if (hasil.ok) {
      expect(hasil.data.kode).toBe('R01');
      expect(hasil.data.target).toEqual(['Mahasiswa']);
    }
  });

  test('kode pola salah / teks wajib kosong → error eksplisit', () => {
    expect(validasiKursus({ ...BODY_KURSUS_VALID, kode: 'r 01!' }).ok).toBe(false);
    expect(validasiKursus({ ...BODY_KURSUS_VALID, judul: '  ' })).toEqual({
      ok: false,
      error: 'Field "judul" wajib diisi',
    });
  });

  test('target/hasil harus array berisi; modul minimal 1 lengkap', () => {
    expect(validasiKursus({ ...BODY_KURSUS_VALID, target: [] }).ok).toBe(false);
    expect(validasiKursus({ ...BODY_KURSUS_VALID, hasil: 'teks' }).ok).toBe(false);
    expect(validasiKursus({ ...BODY_KURSUS_VALID, modul: [] })).toEqual({
      ok: false,
      error: 'Field "modul" minimal 1 modul',
    });
    expect(
      validasiKursus({ ...BODY_KURSUS_VALID, modul: [{ judul: 'M1', deskripsi: '', meta: 'x' }] }),
    ).toEqual({ ok: false, error: 'Modul ke-1: field "deskripsi" wajib diisi' });
  });

  test('batas panjang: judul >200, modul meta >200, target item >200 → tolak', () => {
    expect(validasiKursus({ ...BODY_KURSUS_VALID, judul: 'x'.repeat(201) })).toEqual({
      ok: false,
      error: 'Field "judul" maksimal 200 karakter',
    });
    expect(
      validasiKursus({
        ...BODY_KURSUS_VALID,
        modul: [{ judul: 'M1', deskripsi: 'D1', meta: 'x'.repeat(201) }],
      }),
    ).toEqual({ ok: false, error: 'Modul ke-1: field "meta" maksimal 200 karakter' });
    expect(
      validasiKursus({ ...BODY_KURSUS_VALID, target: ['x'.repeat(201)] }),
    ).toEqual({ ok: false, error: 'Field "target" maksimal 200 karakter per item' });
  });
});

// — Prioritas 2: batas panjang field teks ————————————————————————————————

describe('batas panjang field teks (Prioritas 2)', () => {
  test('dokumentasi: deskripsi >10000 & kategori >100 → tolak dengan pesan field', () => {
    expect(validasiDokumentasi({ ...BODY_DOK_VALID, deskripsi: 'x'.repeat(10_001) })).toEqual({
      ok: false,
      error: 'Field "deskripsi" maksimal 10000 karakter',
    });
    expect(validasiDokumentasi({ ...BODY_DOK_VALID, kategori: 'x'.repeat(101) })).toEqual({
      ok: false,
      error: 'Field "kategori" maksimal 100 karakter',
    });
  });

  test('berita: judul 201 & ringkasan 501 → tolak; tepat batas lolos', () => {
    expect(validasiBerita({ ...BODY_BERITA_VALID, judul: 'x'.repeat(201) })).toEqual({
      ok: false,
      error: 'Field "judul" maksimal 200 karakter',
    });
    expect(validasiBerita({ ...BODY_BERITA_VALID, ringkasan: 'x'.repeat(501) })).toEqual({
      ok: false,
      error: 'Field "ringkasan" maksimal 500 karakter',
    });
    expect(validasiBerita({ ...BODY_BERITA_VALID, judul: 'x'.repeat(200) }).ok).toBe(true);
  });

  test('isi >20000 & gambar URL >500 → tolak', () => {
    expect(validasiBerita({ ...BODY_BERITA_VALID, isi: 'x'.repeat(20_001) })).toEqual({
      ok: false,
      error: 'Field "isi" maksimal 20000 karakter',
    });
    expect(
      validasiBerita({ ...BODY_BERITA_VALID, gambar: `/${'x'.repeat(501)}` }),
    ).toEqual({ ok: false, error: 'Field "gambar" maksimal 500 karakter' });
  });
});

// — Prioritas 2: CRUD profil & tim ———————————————————————————————————————

const BODY_PROFIL_VALID = {
  nama: 'AI Center Universitas Surabaya',
  tagline: 'Pusat riset AI Ubaya.',
  ringkasan: 'Ringkasan profil.',
  alamat: 'Gedung Perpustakaan LT.4',
  email: 'aicenter@unit.ubaya.ac.id',
  telepon: '0895-6342-22240',
  visi: 'Menjadi yang terdepan — Deskripsi visi.',
  misi: 'Mendorong riset.\nMenghasilkan produk.',
};

describe('validasiProfil', () => {
  test('body lengkap → ok, semua field terpetak, teks di-trim', () => {
    const hasil = validasiProfil({ ...BODY_PROFIL_VALID, nama: '  AI Center  ' });
    expect(hasil).toEqual({ ok: true, data: { ...BODY_PROFIL_VALID, nama: 'AI Center' } });
  });

  test('visi/misi kosong → null (DB NULL, frontend pakai fallback)', () => {
    const hasil = validasiProfil({ ...BODY_PROFIL_VALID, visi: '   ', misi: '' });
    expect(hasil.ok).toBe(true);
    if (hasil.ok) {
      expect(hasil.data.visi).toBeNull();
      expect(hasil.data.misi).toBeNull();
    }
  });

  test('field wajib hilang/kosong → error menyebut field', () => {
    expect(validasiProfil({ ...BODY_PROFIL_VALID, alamat: '' })).toEqual({
      ok: false,
      error: 'Field "alamat" wajib diisi',
    });
    const { email: _dibuang, ...tanpaEmail } = BODY_PROFIL_VALID;
    expect(validasiProfil(tanpaEmail)).toEqual({ ok: false, error: 'Field "email" wajib diisi' });
  });

  test('batas panjang: nama >200, telepon >50, misi >10000 → tolak', () => {
    expect(validasiProfil({ ...BODY_PROFIL_VALID, nama: 'x'.repeat(201) })).toEqual({
      ok: false,
      error: 'Field "nama" maksimal 200 karakter',
    });
    expect(validasiProfil({ ...BODY_PROFIL_VALID, telepon: 'x'.repeat(51) })).toEqual({
      ok: false,
      error: 'Field "telepon" maksimal 50 karakter',
    });
    expect(validasiProfil({ ...BODY_PROFIL_VALID, misi: 'x'.repeat(10_001) })).toEqual({
      ok: false,
      error: 'Field "misi" maksimal 10000 karakter',
    });
  });

  test('edge: body bukan objek → tolak', () => {
    expect(validasiProfil(null)).toEqual({ ok: false, error: 'Body harus objek JSON' });
    expect(validasiProfil('bukan-objek')).toEqual({ ok: false, error: 'Body harus objek JSON' });
  });
});

const BODY_TIM_VALID = {
  nama: 'Dr. Contoh',
  peran: 'Ketua',
  kredensial: 'Ph.D.',
  foto: '/uploads/1712-contoh.jpg',
  urutan: 0,
};

describe('validasiTim', () => {
  test('body lengkap → ok, semua field terpetak', () => {
    expect(validasiTim(BODY_TIM_VALID)).toEqual({ ok: true, data: BODY_TIM_VALID });
  });

  test('kredensial/foto kosong → null (kolom opsional)', () => {
    const hasil = validasiTim({ ...BODY_TIM_VALID, kredensial: '', foto: undefined });
    expect(hasil.ok).toBe(true);
    if (hasil.ok) {
      expect(hasil.data.kredensial).toBeNull();
      expect(hasil.data.foto).toBeNull();
    }
  });

  test('nama/peran wajib → error menyebut field', () => {
    expect(validasiTim({ ...BODY_TIM_VALID, nama: '  ' })).toEqual({
      ok: false,
      error: 'Field "nama" wajib diisi',
    });
    expect(validasiTim({ ...BODY_TIM_VALID, peran: undefined })).toEqual({
      ok: false,
      error: 'Field "peran" wajib diisi',
    });
  });

  test('urutan bukan bilangan bulat valid → tolak eksplisit', () => {
    expect(validasiTim({ ...BODY_TIM_VALID, urutan: '1' })).toEqual({
      ok: false,
      error: 'Field "urutan" harus bilangan bulat 0-9999',
    });
    expect(validasiTim({ ...BODY_TIM_VALID, urutan: 1.5 })).toEqual({
      ok: false,
      error: 'Field "urutan" harus bilangan bulat 0-9999',
    });
    expect(validasiTim({ ...BODY_TIM_VALID, urutan: -1 })).toEqual({
      ok: false,
      error: 'Field "urutan" harus bilangan bulat 0-9999',
    });
  });

  test('batas panjang: nama >200, kredensial >300 → tolak', () => {
    expect(validasiTim({ ...BODY_TIM_VALID, nama: 'x'.repeat(201) })).toEqual({
      ok: false,
      error: 'Field "nama" maksimal 200 karakter',
    });
    expect(validasiTim({ ...BODY_TIM_VALID, kredensial: 'x'.repeat(301) })).toEqual({
      ok: false,
      error: 'Field "kredensial" maksimal 300 karakter',
    });
  });
});
