/**
 * Unit test kontrak skema: nama kolom TS & SQL harus cocok dengan
 * interface frontend dan komentar TODO_BACKEND (mencegah drift kontrak API).
 */
import { describe, expect, test } from 'bun:test';
import { getTableColumns } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { berita, dokumentasi, heroSlides, klien, kursus, layanan, profil, tim, testimoni } from './schema';

const columnNames = (table: PgTable): string[] => Object.keys(getTableColumns(table)).sort();

describe('kontrak kolom vs interface frontend', () => {
  test('berita ↔ BeritaItem', () => {
    expect(columnNames(berita)).toEqual([
      'createdAt',
      'gambar',
      'id',
      'isi',
      'judul',
      'penulis',
      'ringkasan',
      'slug',
      'tanggal',
    ]);
    expect(getTableColumns(berita).slug.isUnique).toBe(true);
    // mode 'string' → data TS berupa string ISO, bukan objek Date.
    expect(getTableColumns(berita).tanggal.dataType).toBe('string');
  });

  test('dokumentasi ↔ DokumentasiItem', () => {
    expect(columnNames(dokumentasi)).toEqual([
      'createdAt',
      'gambar',
      'id',
      'judul',
      'kategori',
      'deskripsi',
      'slug',
      'tanggal',
    ].sort());
    expect(getTableColumns(dokumentasi).slug.isUnique).toBe(true);
  });

  test('tim ↔ AnggotaTim (+urutan)', () => {
    expect(columnNames(tim)).toEqual(['foto', 'id', 'kredensial', 'nama', 'peran', 'urutan']);
    expect(getTableColumns(tim).kredensial.dataType).toBe('string');
  });

  test('layanan ↔ Layanan (fitur jsonb)', () => {
    expect(columnNames(layanan)).toEqual([
      'deskripsi',
      'fitur',
      'id',
      'nama',
      'slug',
      'tagline',
    ]);
    expect(getTableColumns(layanan).fitur.dataType).toBe('json');
    expect(getTableColumns(layanan).slug.isUnique).toBe(true);
  });

  test('heroSlides ↔ HeroSlide (kolom SQL snake_case)', () => {
    expect(columnNames(heroSlides)).toEqual([
      'badgeJudul',
      'badgeSub',
      'ctaPrimer',
      'ctaSekunder',
      'eyebrow',
      'id',
      'image',
      'judul',
      'judulAksen',
      'layout',
      'sizes',
      'srcSet',
      'sub',
      'urutan',
    ]);
    const cols = getTableColumns(heroSlides);
    expect(cols.judulAksen.name).toBe('judul_aksen');
    expect(cols.ctaPrimer.name).toBe('cta_primer');
    expect(cols.srcSet.name).toBe('src_set');
    expect(cols.ctaPrimer.dataType).toBe('json');
  });

  test('klien ↔ Klien, testimoni ↔ Testimoni', () => {
    expect(columnNames(klien)).toEqual(['bidang', 'id', 'nama', 'urutan']);
    expect(columnNames(testimoni)).toEqual(['id', 'kutipan', 'nama', 'peran', 'urutan']);
  });

  test('profil — baris tunggal dengan kontak & statistik', () => {
    expect(columnNames(profil)).toEqual([
      'alamat',
      'email',
      'id',
      'misi',
      'nama',
      'ringkasan',
      'statistik',
      'tagline',
      'telepon',
      'visi',
    ]);
    expect(getTableColumns(profil).statistik.dataType).toBe('json');
  });

  test('kursus ↔ Kursus (target/hasil/modul jsonb, kode unik)', () => {
    expect(columnNames(kursus)).toEqual([
      'deskripsi',
      'durasi',
      'format',
      'hasil',
      'id',
      'inisial',
      'instruktur',
      'judul',
      'kode',
      'level',
      'modul',
      'peran',
      'target',
      'tentang',
      'urutan',
    ]);
    expect(getTableColumns(kursus).kode.isUnique).toBe(true);
    const cols = getTableColumns(kursus);
    expect(cols.target.dataType).toBe('json');
    expect(cols.hasil.dataType).toBe('json');
    expect(cols.modul.dataType).toBe('json');
  });
});
