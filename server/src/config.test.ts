import { describe, expect, test } from 'bun:test';
import {
  DEFAULT_CORS_ORIGINS,
  DEFAULT_PORT,
  parseCorsOrigins,
  parseDatabaseUrl,
  parsePort,
  resolveConfig,
} from './config';

describe('parsePort', () => {
  test('mengembalikan angka valid apa adanya', () => {
    expect(parsePort('3001')).toBe(3001);
    expect(parsePort('1')).toBe(1);
    expect(parsePort('65535')).toBe(65535);
  });

  test('edge: undefined, kosong, bukan angka, di luar rentang jatuh ke default', () => {
    expect(parsePort(undefined)).toBe(DEFAULT_PORT);
    expect(parsePort('')).toBe(DEFAULT_PORT);
    expect(parsePort('   ')).toBe(DEFAULT_PORT);
    expect(parsePort('abc')).toBe(DEFAULT_PORT);
    expect(parsePort('80.5')).toBe(DEFAULT_PORT);
    expect(parsePort('0')).toBe(DEFAULT_PORT);
    expect(parsePort('-1')).toBe(DEFAULT_PORT);
    expect(parsePort('65536')).toBe(DEFAULT_PORT);
  });
});

describe('parseCorsOrigins', () => {
  test('memecah daftar dan membuang entri kosong', () => {
    expect(parseCorsOrigins('http://a.test, http://b.test ,,http://c.test')).toEqual([
      'http://a.test',
      'http://b.test',
      'http://c.test',
    ]);
  });

  test('edge: undefined / semua kosong jatuh ke default', () => {
    expect(parseCorsOrigins(undefined)).toEqual(DEFAULT_CORS_ORIGINS);
    expect(parseCorsOrigins('')).toEqual(DEFAULT_CORS_ORIGINS);
    expect(parseCorsOrigins(' , ,')).toEqual(DEFAULT_CORS_ORIGINS);
  });
});

describe('parseDatabaseUrl', () => {
  test('string terisi dipertahankan (di-trim)', () => {
    expect(parseDatabaseUrl(' postgres://user:pass@localhost:5432/db ')).toBe(
      'postgres://user:pass@localhost:5432/db',
    );
  });

  test('edge: undefined / kosong → null (tanda pakai PGlite)', () => {
    expect(parseDatabaseUrl(undefined)).toBeNull();
    expect(parseDatabaseUrl('')).toBeNull();
    expect(parseDatabaseUrl('   ')).toBeNull();
  });
});

describe('resolveConfig', () => {
  test('env kosong → konfigurasi default siap dev', () => {
    expect(resolveConfig({})).toEqual({
      port: DEFAULT_PORT,
      databaseUrl: null,
      corsOrigins: DEFAULT_CORS_ORIGINS,
    });
  });

  test('env lengkap dipetakan sesuai kunci', () => {
    expect(
      resolveConfig({
        PORT: '4000',
        DATABASE_URL: 'postgres://u:p@localhost:5432/ai',
        CORS_ORIGIN: 'https://ai-center.ubaya.ac.id',
      }),
    ).toEqual({
      port: 4000,
      databaseUrl: 'postgres://u:p@localhost:5432/ai',
      corsOrigins: ['https://ai-center.ubaya.ac.id'],
    });
  });
});
