import { describe, expect, test } from 'vitest';
import {
  MASA_BERLAKU_TOKEN_MS,
  buatTokenAdmin,
  passwordCocok,
  tokenAdminValid,
  tokenDariHeader,
} from './auth';

const PASSWORD = 'rahasia-untuk-test';
const NOW = 1_700_000_000_000;

describe('passwordCocok', () => {
  test('password benar → true; salah/kosong → false', () => {
    expect(passwordCocok(PASSWORD, PASSWORD)).toBe(true);
    expect(passwordCocok('salah', PASSWORD)).toBe(false);
    expect(passwordCocok('', PASSWORD)).toBe(false);
  });
});

describe('buatTokenAdmin / tokenAdminValid', () => {
  test('token baru valid pada saat yang sama (format exp.signature)', () => {
    const token = buatTokenAdmin(PASSWORD, NOW);
    expect(token).toMatch(/^\d+\.[0-9a-f]+$/);
    expect(tokenAdminValid(token, PASSWORD, NOW + 1)).toBe(true);
  });

  test('kedaluwarsa tepat di batas MASA_BERLAKU_TOKEN_MS (exp <= now = tolak)', () => {
    const token = buatTokenAdmin(PASSWORD, NOW);
    const batas = NOW + MASA_BERLAKU_TOKEN_MS;
    expect(tokenAdminValid(token, PASSWORD, batas - 1)).toBe(true);
    expect(tokenAdminValid(token, PASSWORD, batas)).toBe(false);
    expect(tokenAdminValid(token, PASSWORD, batas + 1)).toBe(false);
  });

  test('password berbeda → signature tak cocok (rotasi password mencabut token)', () => {
    const token = buatTokenAdmin(PASSWORD, NOW);
    expect(tokenAdminValid(token, 'password-lain', NOW + 1)).toBe(false);
  });

  test('signature dimanipulasi / token ditambah karakter → false', () => {
    const token = buatTokenAdmin(PASSWORD, NOW);
    const [exp, signature] = token.split('.');
    expect(tokenAdminValid(`${exp}.${'0'.repeat(signature.length)}`, PASSWORD, NOW + 1)).toBe(false);
    expect(tokenAdminValid(`${exp}.${signature}x`, PASSWORD, NOW + 1)).toBe(false);
  });

  test('token rusak/bukan format → false tanpa throw', () => {
    for (const rusak of ['', 'abc', 'a.b.c', '123.', '.x']) {
      expect(tokenAdminValid(rusak, PASSWORD, NOW)).toBe(false);
    }
  });
});

describe('tokenDariHeader', () => {
  test('skema Bearer + token → token diambil', () => {
    expect(tokenDariHeader('Bearer abc.def')).toBe('abc.def');
  });

  test('header hilang / skema salah / token kosong / lebih dari 2 bagian → null', () => {
    expect(tokenDariHeader(null)).toBeNull();
    expect(tokenDariHeader('')).toBeNull();
    expect(tokenDariHeader('Basic abc')).toBeNull();
    expect(tokenDariHeader('Bearer')).toBeNull();
    expect(tokenDariHeader('Bearer ')).toBeNull();
    expect(tokenDariHeader('Bearer a b')).toBeNull();
  });
});
