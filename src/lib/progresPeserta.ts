/**
 * Sinkronisasi progres belajar ke backend (GET/POST /api/progress) —
 * TANPA akun: identitas peserta = `pesertaId` acak yang disimpan di
 * localStorage (key `ubaya-peserta-id`). localStorage tetap sumber utama
 * (alur belajar tetap jalan offline); backend hanya salinan cadangan.
 *
 * Semua kegagalan DISENTAP diam-diam (tanpa console) supaya konsol tetap
 * bersih di produksi dan belajar tidak terganggu — persis pola api.ts yang
 * memakai fallback diam bila backend tak tersedia.
 */
import { BASE_URL_API, bangunUrlApi, harusFetch } from './api.ts';
import { normalisasiStateBelajar, type StateBelajar } from './pembelajaran.ts';

const KEY_PESERTA_ID = 'ubaya-peserta-id';
/** Pola sama dengan validasi server (POLA_PESERTA_ID di lib/tulis). */
const POLA_PESERTA_ID = /^[A-Za-z0-9-]{8,64}$/;

/** Buat ID acak untuk browser tanpa crypto.randomUUID (fallback 36 karakter). */
function buatIdPeserta(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random()
    .toString(36)
    .slice(2, 14)}`;
}

/**
 * ID peserta per-browser: dibuat sekali lalu dipakai semua permintaan progres.
 * Bila localStorage terblokir (mode privasi ketat) → id sementara per-halaman
 * (sinkron tetap bekerja selama sesi, hanya tidak bertahan di antar kunjungan).
 */
export function pesertaIdLokal(): string {
  let tersimpan = '';
  try {
    tersimpan = localStorage.getItem(KEY_PESERTA_ID) ?? '';
  } catch {
    tersimpan = '';
  }
  if (POLA_PESERTA_ID.test(tersimpan)) return tersimpan;
  const baru = buatIdPeserta();
  try {
    localStorage.setItem(KEY_PESERTA_ID, baru);
  } catch {
    /* storage diblokir → pakai id tanpa persist */
  }
  return baru;
}

/** Opsi baca/tulis progres — baseUrl & mode disuntik saat unit test. */
interface OpsiProgres {
  baseUrl?: string;
  /** Mode Vite; 'test' = tanpa fetch (harusFetch) kecuali di-override. */
  mode?: string;
}

/**
 * Ambil salinan progres milik peserta untuk satu kursus dari backend.
 * `null` bila belum pernah disimpan / backend tak terjangkau / respons tak
 * valid — pemanggil memakai state lokal sebagai fallback.
 * Hasil sudah dinormalisasi (normalisasiStateBelajar) seperti baca localStorage.
 */
export async function ambilProgresBelajar(
  kode: string,
  jumlahModul: number,
  opsi: OpsiProgres = {},
): Promise<StateBelajar | null> {
  const baseUrl = opsi.baseUrl ?? BASE_URL_API;
  const mode = opsi.mode ?? import.meta.env.MODE;
  if (!harusFetch(baseUrl, mode)) return null;
  try {
    const res = await fetch(
      bangunUrlApi(
        baseUrl,
        `/progress?pesertaId=${encodeURIComponent(pesertaIdLokal())}&kode=${encodeURIComponent(
          kode.trim().toUpperCase(),
        )}`,
      ),
    );
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const items = (data as { items?: unknown } | null)?.items;
    if (!Array.isArray(items)) return null;
    const entri = items.find(
      (i) => (i as { kode?: unknown } | null)?.kode === kode.trim().toUpperCase(),
    );
    const state = (entri as { state?: unknown } | null | undefined)?.state;
    if (state === null || typeof state !== 'object') return null;
    return normalisasiStateBelajar(state, jumlahModul);
  } catch {
    return null;
  }
}

/**
 * Simpan state belajar ke backend (UPSERT per peserta+kode) — dipanggil
 * fire-and-forget setiap kali state berubah. `true` bila server mengonfirmasi.
 */
export async function sinkronProgresBelajar(
  kode: string,
  state: StateBelajar,
  opsi: OpsiProgres = {},
): Promise<boolean> {
  const baseUrl = opsi.baseUrl ?? BASE_URL_API;
  const mode = opsi.mode ?? import.meta.env.MODE;
  if (!harusFetch(baseUrl, mode)) return false;
  try {
    const res = await fetch(bangunUrlApi(baseUrl, '/progress'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pesertaId: pesertaIdLokal(),
        kode: kode.trim().toUpperCase(),
        state,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
