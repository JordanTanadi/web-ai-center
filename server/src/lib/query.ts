/**
 * Helper kueri daftar (list) — murni tanpa akses DB, supaya mudah diuji.
 * Dipakai route untuk menerjemahkan query string URL → argumen repository.
 */

/** Batas maksimum `limit` per halaman (lindungi DB dari kueri terlalu besar). */
export const MAX_LIMIT = 100;
/** Default `limit` bila pagination aktif tapi `limit` tidak dikirim. */
export const DEFAULT_LIMIT = 20;
/** Panjang maksimum kata kunci pencarian (di atas itu dipotong). */
export const MAX_SEARCH_LENGTH = 100;

export interface Pagination {
  /** Nomor halaman (1-based), atau `null` = pagination nonaktif (kirim semua data). */
  page: number | null;
  /** Jumlah baris per halaman, atau `null` bila pagination nonaktif. */
  limit: number | null;
  /** `LIMIT`/`OFFSET` SQL, atau `null` bila pagination nonaktif. */
  offset: number | null;
}

export const NO_PAGINATION: Pagination = { page: null, limit: null, offset: null };

/**
 * Normalisasi kata kunci pencarian dari query string.
 * Mengembalikan `null` bila tidak ada kata kunci yang bisa dipakai
 * (undefined, non-string, hanya whitespace, atau kosong setelah trim).
 */
export function normalizeSearch(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const collapsed = raw.replace(/\s+/g, ' ').trim();
  if (collapsed === '') return null;
  return collapsed.slice(0, MAX_SEARCH_LENGTH);
}

/**
 * Parse parameter pagination `page` & `limit`.
 * - Tidak ada keduanya → nonaktif (kirim semua baris).
 * - Salah satu ada → pagination aktif; yang tidak dikirim/invalid memakai default.
 * - `limit` dibatasi MAX_LIMIT.
 */
export function parsePagination(pageRaw?: string, limitRaw?: string): Pagination {
  const engagementActive = pageRaw !== undefined || limitRaw !== undefined;
  if (!engagementActive) return { ...NO_PAGINATION };

  const page = parsePositiveInt(pageRaw) ?? 1;
  const limit = Math.min(parsePositiveInt(limitRaw) ?? DEFAULT_LIMIT, MAX_LIMIT);
  return { page, limit, offset: (page - 1) * limit };
}

/** Parse bilangan bulat positif dari string; hasil invalid → `null`. */
function parsePositiveInt(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === '') return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) return null;
  return value;
}

/**
 * Ubah kata kunci menjadi pola LIKE `...%` dengan escape karakter
 * khusus (`%`, `_`, `\`) supaya input pengguna bukan wildcard.
 * PostgreSQL memakai `\` sebagai escape bawaan LIKE.
 */
export function toLikePattern(input: string): string {
  const escaped = input.replace(/[\\%_]/g, '\\$&');
  return `%${escaped}%`;
}

/** Trim query param opsional; hasil kosong → `null` (mis. `?kategori=`). */
export function trimOrNull(raw: string | undefined): string | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Parse urutan tanggal `order` (asc/desc) dari query string.
 * Nilai tidak dikenal/di luar `allowed` jatuh ke `fallback`.
 */
export function parseOrder(
  raw: string | undefined,
  allowed: readonly ['asc', 'desc'],
  fallback: 'asc' | 'desc',
): 'asc' | 'desc' {
  if (raw === undefined) return fallback;
  const value = raw.trim().toLowerCase();
  return allowed.includes(value as 'asc' | 'desc') ? (value as 'asc' | 'desc') : fallback;
}
