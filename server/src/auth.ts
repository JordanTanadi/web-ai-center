/**
 * Autentikasi admin sederhana (konsul PROGRESS 2): 1 akun, password dari env
 * ADMIN_PASSWORD, sesi memakai token `<exp>.<signature>`.
 *
 * Aturan eksplisit:
 * - `passwordCocok` membandingkan secara timing-safe (di-hash SHA-256 dulu
 *   supaya panjang buffer selalu sama untuk `timingSafeEqual`);
 * - signature = HMAC-SHA256(exp, password) hex — token diverifikasi ulang di
 *   tiap request tulis; rotasi password otomatis mencabut semua token lama;
 * - token TIDAK menyimpan password, hanya tanda tangan simetris.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/** Masa berlaku token login: 6 jam. */
export const MASA_BERLAKU_TOKEN_MS = 6 * 60 * 60 * 1000;

/** Bandingkan input password dengan password asli secara timing-safe. */
export function passwordCocok(input: string, passwordBenar: string): boolean {
  const hashInput = createHash('sha256').update(input).digest();
  const hashBenar = createHash('sha256').update(passwordBenar).digest();
  return timingSafeEqual(hashInput, hashBenar);
}

/** Buat token login yang berlaku `MASA_BERLAKU_TOKEN_MS` sejak `now`. */
export function buatTokenAdmin(passwordBenar: string, now: number = Date.now()): string {
  const exp = now + MASA_BERLAKU_TOKEN_MS;
  const signature = createHmac('sha256', passwordBenar).update(String(exp)).digest('hex');
  return `${exp}.${signature}`;
}

/**
 * Validasi token: format `exp.hex` benar, belum kedaluwarsa, signature cocok
 * untuk password yang sama. Semua kegagalan → `false` (tanpa throw).
 */
export function tokenAdminValid(
  token: string,
  passwordBenar: string,
  now: number = Date.now(),
): boolean {
  const bagian = token.split('.');
  if (bagian.length !== 2) return false;
  const [expStr, signature] = bagian;
  const exp = Number(expStr);
  if (expStr.trim() === '' || !Number.isFinite(exp) || exp <= now) return false;
  const signatureHarus = createHmac('sha256', passwordBenar).update(expStr).digest('hex');
  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(signatureHarus, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Ambil token dari header `Authorization: Bearer <token>`; null bila tidak sah. */
export function tokenDariHeader(header: string | null): string | null {
  if (header === null) return null;
  const bagian = header.split(' ');
  if (bagian.length !== 2) return null;
  const [scheme, token] = bagian;
  if (scheme !== 'Bearer' || token === '') return null;
  return token;
}
