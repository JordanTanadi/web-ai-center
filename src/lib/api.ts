/**
 * Lapisan akses API backend — SEMUA fetch ke backend melewati file ini.
 *
 * Konfigurasi: `VITE_API_BASE_URL` di `.env` (lihat `.env.example`), berisi
 * root API termasuk prefix `/api`, mis. `http://localhost:3000/api`.
 * Path yang diterima fungsi di bawah adalah bagian SETELAH prefix itu
 * (mis. `/berita`, `/kursus/R01`) — sama dengan route di server/src/routes.ts
 * tanpa prefix `/api`.
 *
 * Kegagalan (network, HTTP non-2xx, respons tidak valid) TIDAK melempar ke
 * pemanggil: dicatat eksplisit via console.error lalu data fallback dipakai,
 * supaya halaman tetap tampil (konten dummy) meski backend mati.
 */

/** Root API dari env; `''` = integrasi belum dikonfigurasi (pakai data dummy). */
export const BASE_URL_API = resolveBaseUrl(import.meta.env.VITE_API_BASE_URL);

/** Normalisasi base URL: trim + buang slash berlebih di akhir. */
export function resolveBaseUrl(raw: string | undefined): string {
  if (raw === undefined) return '';
  return raw.trim().replace(/\/+$/, '');
}

/**
 * Apakah request boleh dikirim?
 * - base URL kosong → tidak (frontend jalan mandiri dengan data dummy);
 * - mode 'test' → tidak, supaya unit test deterministik tanpa backend,
 *   meski developer punya `.env` lokal dengan base URL terisi.
 */
export function harusFetch(baseUrl: string, mode: string): boolean {
  return baseUrl !== '' && mode !== 'test';
}

/** Susun URL lengkap; error eksplisit bila base kosong atau path tidak valid. */
export function bangunUrlApi(baseUrl: string, path: string): string {
  if (baseUrl === '') {
    throw new Error('bangunUrlApi: base URL kosong — set VITE_API_BASE_URL di .env');
  }
  if (!path.startsWith('/')) {
    throw new Error(`bangunUrlApi: path harus diawali "/": ${path}`);
  }
  return `${baseUrl}${path}`;
}

/** GET JSON tunggal (detail/profil). Respons non-objek dianggap tidak valid. */
export async function ambilJson<T>(
  path: string,
  fallback: T,
  baseUrl: string = BASE_URL_API,
): Promise<T> {
  try {
    const res = await fetch(bangunUrlApi(baseUrl, path));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    if (data === null || typeof data !== 'object') {
      throw new Error('respons bukan objek JSON');
    }
    return data as T;
  } catch (error) {
    console.error(`[api] gagal memuat ${path} — memakai data fallback:`, error);
    return fallback;
  }
}

/** GET daftar berformat `{ items: T[] }`; bentuk salah → fallback + log. */
export async function ambilDaftar<T>(
  path: string,
  fallback: T[],
  baseUrl: string = BASE_URL_API,
): Promise<T[]> {
  try {
    const res = await fetch(bangunUrlApi(baseUrl, path));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    const items = (data as { items?: unknown } | null)?.items;
    if (!Array.isArray(items)) {
      throw new Error('respons bukan { items: [...] }');
    }
    return items as T[];
  } catch (error) {
    console.error(`[api] gagal memuat ${path} — memakai data fallback:`, error);
    return fallback;
  }
}

/** Error request tulis admin — membawa status HTTP (0 = jaringan/tidak terkonfigurasi). */
export class ErrorApi extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ErrorApi';
  }
}

/**
 * Request tulis admin (POST/PUT/DELETE) dengan header Authorization bila token diberikan.
 *
 * BERBEDA dengan ambilJson/ambilDaftar: kegagalan MELEMPAR `ErrorApi`
 * (pesan dari field `error` server, atau `HTTP <status>`) — admin harus tahu
 * operasinya gagal, bukan diam-diam memakai fallback. Status 401 dipakai UI
 * untuk auto-logout saat token kedaluwarsa.
 */
export async function kirimJsonAdmin<T>(
  path: string,
  opsi: {
    method: 'POST' | 'PUT' | 'DELETE';
    /** Body JSON; `undefined` = tanpa body. */
    body?: unknown;
    /** Token sesi admin → header `Authorization: Bearer <token>`. */
    token?: string;
    /** Override base URL (khusus test); default `BASE_URL_API`. */
    baseUrl?: string;
  },
): Promise<T> {
  const baseUrl = opsi.baseUrl ?? BASE_URL_API;
  if (baseUrl === '') {
    throw new ErrorApi('Backend belum dikonfigurasi — set VITE_API_BASE_URL di .env', 0);
  }
  let res: Response;
  try {
    res = await fetch(bangunUrlApi(baseUrl, path), {
      method: opsi.method,
      headers: {
        'Content-Type': 'application/json',
        ...(opsi.token !== undefined ? { Authorization: `Bearer ${opsi.token}` } : {}),
      },
      body: opsi.body !== undefined ? JSON.stringify(opsi.body) : undefined,
    });
  } catch (error) {
    throw new ErrorApi(`Tidak bisa terhubung ke backend (${String(error)})`, 0);
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const pesanServer = (data as { error?: unknown } | null)?.error;
    throw new ErrorApi(
      typeof pesanServer === 'string' ? pesanServer : `HTTP ${res.status}`,
      res.status,
    );
  }
  return data as T;
}
