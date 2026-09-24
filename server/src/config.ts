/**
 * Konfigurasi backend dari environment variable.
 * Semua fungsi murni (input → output) supaya mudah diuji tanpa membaca
 * process.env langsung di dalam logika.
 */

export const DEFAULT_PORT = 3000;
export const DEFAULT_CORS_ORIGINS = ['http://localhost:5173'];

export interface ServerConfig {
  /** Port HTTP backend. */
  port: number;
  /**
   * Koneksi PostgreSQL (mis. `postgres://user:pass@host:5432/db`).
   * `null` = tidak di-set → pakai PGlite lokal untuk development.
   */
  databaseUrl: string | null;
  /** Origin frontend yang diizinkan CORS. */
  corsOrigins: string[];
}

type RawEnv = Record<string, string | undefined>;

/** Parse port mentah; nilai invalid (bukan angka, di luar 1–65535) jatuh ke fallback. */
export function parsePort(raw: string | undefined, fallback: number = DEFAULT_PORT): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 65535) return fallback;
  return value;
}

/** Parse daftar origin CORS dipisah koma; entri kosong dibuang, bila kosong semua pakai default. */
export function parseCorsOrigins(raw: string | undefined): string[] {
  if (raw === undefined) return [...DEFAULT_CORS_ORIGINS];
  const origins = raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  return origins.length > 0 ? origins : [...DEFAULT_CORS_ORIGINS];
}

/** Baca DATABASE_URL; string kosong/whitespace dianggap tidak di-set (pakai PGlite). */
export function parseDatabaseUrl(raw: string | undefined): string | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  return trimmed === '' ? null : trimmed;
}

/** Susun konfigurasi server dari env mentah. */
export function resolveConfig(env: RawEnv): ServerConfig {
  return {
    port: parsePort(env.PORT),
    databaseUrl: parseDatabaseUrl(env.DATABASE_URL),
    corsOrigins: parseCorsOrigins(env.CORS_ORIGIN),
  };
}
