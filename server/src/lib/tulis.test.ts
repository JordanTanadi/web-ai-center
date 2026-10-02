import { describe, expect, test } from 'vitest';
import { slugDariJudul, validasiBerita, validasiDokumentasi } from './tulis';

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
