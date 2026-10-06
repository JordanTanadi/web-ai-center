import { describe, expect, test } from 'bun:test';
import { findOrphanUploads } from './orphanUpload';

describe('findOrphanUploads', () => {
  test('file tanpa rujukan → tidak terpakai; file dirujuk → aman', () => {
    const hasil = findOrphanUploads(['a.jpg', 'b.jpg'], ['/uploads/a.jpg']);
    expect(hasil).toEqual(['b.jpg']);
  });

  test('referensi macam-macam: null/undefined/path statis/bukan-URL diabaikan', () => {
    const hasil = findOrphanUploads(
      ['x.jpg', 'y.jpg', 'z.jpg'],
      [null, undefined, '/tim/y.jpg', 'bebas', '/uploads/z.jpg'],
    );
    // 'y.jpg' tidak dianggap dirujuk (hanya URL /uploads/... yang dicocokkan);
    // z dirujuk lewat /uploads/z.jpg.
    expect(hasil).toEqual(['x.jpg', 'y.jpg']);
  });

  test('duplikat rujukan tidak masalah; semua file dipakai → []', () => {
    expect(findOrphanUploads(['a.jpg'], ['/uploads/a.jpg', '/uploads/a.jpg'])).toEqual([]);
  });

  test('hasil terurut alfabet (deterministik)', () => {
    expect(findOrphanUploads(['b.jpg', 'c.jpg', 'a.jpg'], [])).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
  });

  test('edge: daftar kosong → []', () => {
    expect(findOrphanUploads([], ['/uploads/apa.jpg'])).toEqual([]);
  });
});
