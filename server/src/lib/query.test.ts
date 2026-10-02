import { describe, expect, test } from 'bun:test';
import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MAX_SEARCH_LENGTH,
  normalizeSearch,
  parseOrder,
  parsePagination,
  toLikePattern,
  trimOrNull,
} from './query';

describe('normalizeSearch', () => {
  test('trim, rapatkan spasi, dan potong ke batas maksimum', () => {
    expect(normalizeSearch('  gpu   rental  ')).toBe('gpu rental');
    expect(normalizeSearch('x'.repeat(MAX_SEARCH_LENGTH + 50))).toBe(
      'x'.repeat(MAX_SEARCH_LENGTH),
    );
  });

  test('edge: undefined, non-string, whitespace-only → null', () => {
    expect(normalizeSearch(undefined)).toBeNull();
    expect(normalizeSearch(null)).toBeNull();
    expect(normalizeSearch(42)).toBeNull();
    expect(normalizeSearch('   \t\n ')).toBeNull();
    expect(normalizeSearch('')).toBeNull();
  });
});

describe('parsePagination', () => {
  test('kedua parameter tidak ada → nonaktif (kirim semua)', () => {
    expect(parsePagination()).toEqual({ page: null, limit: null, offset: null });
    expect(parsePagination(undefined, undefined)).toEqual({
      page: null,
      limit: null,
      offset: null,
    });
  });

  test('hanya page → limit default & offset benar', () => {
    expect(parsePagination('3')).toEqual({
      page: 3,
      limit: DEFAULT_LIMIT,
      offset: (3 - 1) * DEFAULT_LIMIT,
    });
  });

  test('hanya limit (highlight beranda) → page 1, offset 0', () => {
    expect(parsePagination(undefined, '3')).toEqual({ page: 1, limit: 3, offset: 0 });
  });

  test('page & limit valid dihitung benar', () => {
    expect(parsePagination('2', '5')).toEqual({ page: 2, limit: 5, offset: 5 });
  });

  test('edge: nilai invalid jatuh ke default, limit di-clamp', () => {
    expect(parsePagination('abc', '0')).toEqual({
      page: 1,
      limit: DEFAULT_LIMIT,
      offset: 0,
    });
    expect(parsePagination('-2', '-7')).toEqual({
      page: 1,
      limit: DEFAULT_LIMIT,
      offset: 0,
    });
    expect(parsePagination('1.5', '1.5')).toEqual({
      page: 1,
      limit: DEFAULT_LIMIT,
      offset: 0,
    });
    expect(parsePagination('1', String(MAX_LIMIT + 500))).toEqual({
      page: 1,
      limit: MAX_LIMIT,
      offset: 0,
    });
  });
});

describe('parseOrder', () => {
  const allowed = ['asc', 'desc'] as const;

  test('menerima asc/desc apa adanya, case-insensitive', () => {
    expect(parseOrder('asc', allowed, 'desc')).toBe('asc');
    expect(parseOrder('DESC', allowed, 'desc')).toBe('desc');
    expect(parseOrder(' desc ', allowed, 'asc')).toBe('desc');
  });

  test('edge: undefined / nilai tidak dikenal → fallback', () => {
    expect(parseOrder(undefined, allowed, 'desc')).toBe('desc');
    expect(parseOrder('sideways', allowed, 'desc')).toBe('desc');
    expect(parseOrder('', allowed, 'asc')).toBe('asc');
  });
});

describe('toLikePattern', () => {
  test('membungkus kata kunci dengan % dua sisi', () => {
    expect(toLikePattern('gpu rental')).toBe('%gpu rental%');
  });

  test('edge: karakter khusus LIKE di-escape, bukan wildcard', () => {
    expect(toLikePattern('50%')).toBe('%50\\%%');
    expect(toLikePattern('a_b')).toBe('%a\\_b%');
    expect(toLikePattern('c:\\path')).toBe('%c:\\\\path%');
  });
});

describe('trimOrNull', () => {
  test('nilai terisi di-trim', () => {
    expect(trimOrNull('  Workshop ')).toBe('Workshop');
  });

  test('edge: undefined / kosong / whitespace → null', () => {
    expect(trimOrNull(undefined)).toBeNull();
    expect(trimOrNull('')).toBeNull();
    expect(trimOrNull('   ')).toBeNull();
  });
});
