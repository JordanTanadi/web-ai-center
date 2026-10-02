/**
 * Utilita tulis konten admin (PROGRESS 2): pembuat slug + validasi body.
 * Semua fungsi murni — route mengembalikan `error` eksplisit (400/409),
 * tidak ada input yang gagal diam-diam.
 */

/** Bentuk hasil validasi: sukses membawa data bersih, atau alasan gagal. */
export type HasilValidasi<T> = { ok: true; data: T } | { ok: false; error: string };

/** Input tulis dokumentasi (tanpa slug — slug dibuat dari judul). */
export interface InputDokumentasi {
  judul: string;
  deskripsi: string;
  /** Tanggal ISO YYYY-MM-DD. */
  tanggal: string;
  kategori: string;
  gambar: string | null;
}

/** Input tulis berita (tanpa slug — slug dibuat dari judul). */
export interface InputBerita {
  judul: string;
  ringkasan: string;
  isi: string;
  /** Tanggal ISO YYYY-MM-DD. */
  tanggal: string;
  penulis: string;
  gambar: string | null;
}

const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Ubah judul menjadi slug URL — mirror `src/lib/slug.ts` (frontend) supaya
 * perilaku identik bila judul pernah di-slug-kan di klien.
 * Mengembalikan `''` bila tidak ada karakter sah (route menolak dengan 400).
 */
export function slugDariJudul(judul: string): string {
  if (judul === '') return '';
  return judul
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

/** Baca field teks wajib (trim; kosong = gagal). */
function bacaTeks(
  body: Record<string, unknown>,
  kunci: string,
): { nilai: string } | { error: string } {
  const nilai = body[kunci];
  if (typeof nilai !== 'string' || nilai.trim() === '') {
    return { error: `Field "${kunci}" wajib diisi` };
  }
  return { nilai: nilai.trim() };
}

/** Baca field `gambar` opsional: undefined/null/'' → null. */
function bacaGambar(body: Record<string, unknown>): { nilai: string | null } | { error: string } {
  const nilai = body.gambar;
  if (nilai === undefined || nilai === null || nilai === '') return { nilai: null };
  if (typeof nilai !== 'string') return { error: 'Field "gambar" harus teks' };
  return { nilai: nilai.trim() };
}

/** Baca field `tanggal` wajib berformat YYYY-MM-DD dan benar-benar ada di kalender. */
function bacaTanggal(body: Record<string, unknown>): { nilai: string } | { error: string } {
  const nilai = body.tanggal;
  if (typeof nilai !== 'string' || !POLA_TANGGAL.test(nilai)) {
    return { error: 'Field "tanggal" harus format YYYY-MM-DD' };
  }
  // Cek kalender via round-trip komponen — `new Date('2026-02-30')` di beberapa
  // runtime menggulung ke Maret (bukan Invalid Date), jadi parse Date saja tidak cukup.
  const [tahun, bulan, hari] = nilai.split('-').map(Number);
  const tanggal = new Date(Date.UTC(tahun, bulan - 1, hari));
  const sah =
    tanggal.getUTCFullYear() === tahun &&
    tanggal.getUTCMonth() === bulan - 1 &&
    tanggal.getUTCDate() === hari;
  if (!sah) {
    return { error: `Field "tanggal" tidak valid: ${nilai}` };
  }
  return { nilai };
}

/** Validasi body tulis dokumentasi. */
export function validasiDokumentasi(body: unknown): HasilValidasi<InputDokumentasi> {
  if (body === null || typeof body !== 'object') {
    return { ok: false, error: 'Body harus objek JSON' };
  }
  const b = body as Record<string, unknown>;
  const judul = bacaTeks(b, 'judul');
  if ('error' in judul) return { ok: false, error: judul.error };
  const deskripsi = bacaTeks(b, 'deskripsi');
  if ('error' in deskripsi) return { ok: false, error: deskripsi.error };
  const kategori = bacaTeks(b, 'kategori');
  if ('error' in kategori) return { ok: false, error: kategori.error };
  const tanggal = bacaTanggal(b);
  if ('error' in tanggal) return { ok: false, error: tanggal.error };
  const gambar = bacaGambar(b);
  if ('error' in gambar) return { ok: false, error: gambar.error };
  return {
    ok: true,
    data: {
      judul: judul.nilai,
      deskripsi: deskripsi.nilai,
      kategori: kategori.nilai,
      tanggal: tanggal.nilai,
      gambar: gambar.nilai,
    },
  };
}

/** Validasi body tulis berita. */
export function validasiBerita(body: unknown): HasilValidasi<InputBerita> {
  if (body === null || typeof body !== 'object') {
    return { ok: false, error: 'Body harus objek JSON' };
  }
  const b = body as Record<string, unknown>;
  const judul = bacaTeks(b, 'judul');
  if ('error' in judul) return { ok: false, error: judul.error };
  const ringkasan = bacaTeks(b, 'ringkasan');
  if ('error' in ringkasan) return { ok: false, error: ringkasan.error };
  const isi = bacaTeks(b, 'isi');
  if ('error' in isi) return { ok: false, error: isi.error };
  const penulis = bacaTeks(b, 'penulis');
  if ('error' in penulis) return { ok: false, error: penulis.error };
  const tanggal = bacaTanggal(b);
  if ('error' in tanggal) return { ok: false, error: tanggal.error };
  const gambar = bacaGambar(b);
  if ('error' in gambar) return { ok: false, error: gambar.error };
  return {
    ok: true,
    data: {
      judul: judul.nilai,
      ringkasan: ringkasan.nilai,
      isi: isi.nilai,
      penulis: penulis.nilai,
      tanggal: tanggal.nilai,
      gambar: gambar.nilai,
    },
  };
}
