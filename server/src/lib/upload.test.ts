import { describe, expect, test } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  BATAS_UKURAN_GAMBAR,
  namaFileAman,
  namaFileUnik,
  resolveUploadDir,
  simpanFileGambar,
  tipeKontenGambar,
  urlFileUnggahan,
  validasiFileGambar,
} from './upload';

function buatFile(nama: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], nama, { type });
}

describe('validasiFileGambar', () => {
  test('JPEG/PNG/WebP dalam batas → ok + ekstensi aman', () => {
    expect(validasiFileGambar(buatFile('a.jpg', 'image/jpeg', 100))).toEqual({ ok: true, ext: 'jpg' });
    expect(validasiFileGambar(buatFile('a.png', 'image/png', 100))).toEqual({ ok: true, ext: 'png' });
    expect(validasiFileGambar(buatFile('a.webp', 'image/webp', 100))).toEqual({ ok: true, ext: 'webp' });
  });

  test('bukan File / MIME asing / kosong / overlimit → error eksplisit', () => {
    expect(validasiFileGambar(undefined)).toEqual({
      ok: false,
      error: expect.stringContaining('wajib file gambar'),
    });
    expect(validasiFileGambar(buatFile('a.gif', 'image/gif', 100)).ok).toBe(false);
    expect(validasiFileGambar(buatFile('a.jpg', 'image/jpeg', 0)).ok).toBe(false);
    const besar = validasiFileGambar(buatFile('a.jpg', 'image/jpeg', BATAS_UKURAN_GAMBAR + 1));
    expect(besar).toEqual({ ok: false, error: expect.stringContaining('2 MB') });
  });

  test('ekstensi pembohong (nama .jpg isi gif) ditolak via MIME, bukan nama', () => {
    const hasil = validasiFileGambar(buatFile('foto.jpg', 'image/gif', 100));
    expect(hasil.ok).toBe(false);
  });
});

describe('namaFileAman', () => {
  test('nama normal lolos; traversal & ekstensi asing ditolak', () => {
    expect(namaFileAman('1728000000-ab12cd34.jpg')).toBe('1728000000-ab12cd34.jpg');
    expect(namaFileAman('../.env')).toBeNull();
    expect(namaFileAman('a/b.png')).toBeNull();
    expect(namaFileAman('x.svg')).toBeNull();
    expect(namaFileAman('tanpa-ekstensi')).toBeNull();
    expect(namaFileAman('spasi nama.jpg')).toBeNull();
  });
});

describe('namaFileUnik + simpanFileGambar', () => {
  test('unik & roundtrip tulis-baca di direktori temporer', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'unggah-test-'));
    try {
      const a = namaFileUnik('jpg');
      const b = namaFileUnik('jpg');
      expect(a).not.toBe(b);
      const nama = await simpanFileGambar(buatFile('x.png', 'image/png', 10), 'png', dir);
      const baca = Bun.file(join(dir, nama));
      expect(await baca.exists()).toBe(true);
      expect(baca.size).toBe(10);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('resolveUploadDir + urlFileUnggahan + tipeKontenGambar', () => {
  test('default <cwd>/uploads; URL & content-type konsisten', async () => {
    const lama = process.env.UPLOAD_DIR;
    delete process.env.UPLOAD_DIR;
    expect(resolveUploadDir('/srv/app')).toBe('/srv/app/uploads');
    process.env.UPLOAD_DIR = '  /data/gambar/ ';
    expect(resolveUploadDir('/srv/app')).toBe('/data/gambar/');
    if (lama === undefined) delete process.env.UPLOAD_DIR;
    else process.env.UPLOAD_DIR = lama;
    expect(urlFileUnggahan('a.webp')).toBe('/uploads/a.webp');
    expect(tipeKontenGambar('jpg')).toBe('image/jpeg');
    expect(tipeKontenGambar('png')).toBe('image/png');
    expect(tipeKontenGambar('webp')).toBe('image/webp');
  });
});
