import { describe, expect, test } from 'bun:test';
import { cariYatim } from './yatim';

describe('cariYatim', () => {
  test('file tanpa rujukan → yatim; file dirujuk → aman', () => {
    const hasil = cariYatim(['a.jpg', 'b.jpg'], ['/uploads/a.jpg']);
    expect(hasil).toEqual(['b.jpg']);
  });

  test('referensi macam-macam: null/undefined/path statis/bukan-URL diabaikan', () => {
    const hasil = cariYatim(
      ['x.jpg', 'y.jpg', 'z.jpg'],
      [null, undefined, '/tim/y.jpg', 'bebas', '/uploads/z.jpg'],
    );
    // 'y.jpg' tidak dianggap dirujuk (hanya URL /uploads/... yang dicocokkan);
    // z dirujuk lewat /uploads/z.jpg.
    expect(hasil).toEqual(['x.jpg', 'y.jpg']);
  });

  test('duplikat rujukan tidak masalah; semua file dipakai → []', () => {
    expect(cariYatim(['a.jpg'], ['/uploads/a.jpg', '/uploads/a.jpg'])).toEqual([]);
  });

  test('hasil terurut alfabet (deterministik)', () => {
    expect(cariYatim(['b.jpg', 'c.jpg', 'a.jpg'], [])).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
  });

  test('edge: daftar kosong → []', () => {
    expect(cariYatim([], ['/uploads/apa.jpg'])).toEqual([]);
  });
});
