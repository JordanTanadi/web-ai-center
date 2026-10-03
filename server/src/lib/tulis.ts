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

/** Input tulis kursus (kode jadi kunci unik ala slug; modul jsonb). */
export interface InputKursus {
  /** Kode ternormalisasi UPPERCASE, mis. 'R01'. */
  kode: string;
  judul: string;
  deskripsi: string;
  tentang: string;
  durasi: string;
  level: string;
  format: string;
  instruktur: string;
  peran: string;
  inisial: string;
  target: string[];
  hasil: string[];
  modul: Array<{ judul: string; deskripsi: string; meta: string }>;
}

const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;
const POLA_KODE = /^[A-Za-z0-9-]{1,12}$/;

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

/** Baca array string (trim, buang kosong); gagal bila kosong/hasil kosong. */
function bacaDaftarTeks(
  body: Record<string, unknown>,
  kunci: string,
  min: number,
  maks: number,
): { nilai: string[] } | { error: string } {
  const mentah = body[kunci];
  if (!Array.isArray(mentah)) {
    return { error: `Field "${kunci}" harus array teks` };
  }
  const nilai = mentah
    .filter((e): e is string => typeof e === 'string')
    .map((e) => e.trim())
    .filter((e) => e !== '');
  if (nilai.length < min) {
    return { error: `Field "${kunci}" minimal ${min} item` };
  }
  if (nilai.length > maks) {
    return { error: `Field "${kunci}" maksimal ${maks} item` };
  }
  return { nilai };
}

/** Validasi body tulis kursus (termasuk daftar modul). */
export function validasiKursus(body: unknown): HasilValidasi<InputKursus> {
  if (body === null || typeof body !== 'object') {
    return { ok: false, error: 'Body harus objek JSON' };
  }
  const b = body as Record<string, unknown>;
  const kodeMentah = bacaTeks(b, 'kode');
  if ('error' in kodeMentah) return { ok: false, error: kodeMentah.error };
  if (!POLA_KODE.test(kodeMentah.nilai)) {
    return { ok: false, error: 'Field "kode" hanya huruf/angka/- (maks 12)' };
  }
  const kode = kodeMentah.nilai.toUpperCase();
  const teksWajib = ['judul', 'deskripsi', 'tentang', 'durasi', 'level', 'format', 'instruktur', 'peran', 'inisial'] as const;
  const bersih: Record<(typeof teksWajib)[number], string> = {} as Record<(typeof teksWajib)[number], string>;
  for (const kunci of teksWajib) {
    const hasil = bacaTeks(b, kunci);
    if ('error' in hasil) return { ok: false, error: hasil.error };
    bersih[kunci] = hasil.nilai;
  }
  const target = bacaDaftarTeks(b, 'target', 1, 10);
  if ('error' in target) return { ok: false, error: target.error };
  const hasil = bacaDaftarTeks(b, 'hasil', 1, 30);
  if ('error' in hasil) return { ok: false, error: hasil.error };
  const mentahModul = b.modul;
  if (!Array.isArray(mentahModul) || mentahModul.length === 0) {
    return { ok: false, error: 'Field "modul" minimal 1 modul' };
  }
  if (mentahModul.length > 50) {
    return { ok: false, error: 'Field "modul" maksimal 50 modul' };
  }
  const modul: Array<{ judul: string; deskripsi: string; meta: string }> = [];
  for (let i = 0; i < mentahModul.length; i++) {
    const m = mentahModul[i] as Record<string, unknown>;
    if (m === null || typeof m !== 'object') {
      return { ok: false, error: `Modul ke-${i + 1} tidak valid` };
    }
    for (const kunci of ['judul', 'deskripsi', 'meta'] as const) {
      const nilai = m[kunci];
      if (typeof nilai !== 'string' || nilai.trim() === '') {
        return { ok: false, error: `Modul ke-${i + 1}: field "${kunci}" wajib diisi` };
      }
    }
    modul.push({
      judul: (m.judul as string).trim(),
      deskripsi: (m.deskripsi as string).trim(),
      meta: (m.meta as string).trim(),
    });
  }
  return { ok: true, data: { kode, ...bersih, target: target.nilai, hasil: hasil.nilai, modul } };
}
