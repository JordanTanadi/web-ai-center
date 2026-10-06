/**
 * Utilita tulis konten admin (PROGRESS 2 + Prioritas 2): pembuat slug +
 * validasi body. Semua fungsi murni — route mengembalikan `error` eksplisit
 * (400/409), tidak ada input yang gagal diam-diam.
 *
 * Prioritas 2: SETIAP field teks punya batas panjang (BATAS di bawah) supaya
 * body raksasa tidak masuk DB; pesan error eksplisit menyebut field + batasnya.
 * Batas sengaja jauh di atas panjang konten seed (judul ≤47, isi ≤148,
 * ringkasan profil ≤259, dst.) — data yang sudah ada selalu lolos saat
 * diedit ulang. Frontend menyalin nilai batas yang sama ke atribut maxLength
 * (lihat FieldDef.maks di src/pages/Admin.tsx).
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

/**
 * Input tulis profil (baris tunggal id = 1, form tab "Profil" di admin).
 * `statistik` SENGAJA tidak disertakan: kolom jsonb dipertahankan apa adanya
 * (belum ada UI untuk mengeditnya, dan PUT tidak boleh menghapusnya diam-diam).
 */
export interface InputProfil {
  nama: string;
  tagline: string;
  ringkasan: string;
  alamat: string;
  email: string;
  telepon: string;
  /** Format satu baris 'judul — deskripsi'; `null` = kosong (NULL di DB). */
  visi: string | null;
  /** Satu poin per baris; `null` = kosong (NULL di DB). */
  misi: string | null;
}

/** Input tulis anggota tim (kunci baris = id; lihat route /api/tim). */
export interface InputTim {
  nama: string;
  peran: string;
  kredensial: string | null;
  /** URL gambar ('/uploads/…' unggahan admin atau '/tim/…' asli); `null` = tanpa foto. */
  foto: string | null;
  urutan: number;
}

const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;
const POLA_KODE = /^[A-Za-z0-9-]{1,12}$/;

/**
 * Batas panjang karakter per field teks (Prioritas 2). Nilai batas disejajarkan
 * dengan Admin.tsx (atribut maxLength) — server adalah penegak utamanya.
 */
export const BATAS = {
  judul: 200,
  ringkasan: 500,
  isi: 20_000,
  /** Deskripsi dokumentasi (kartu + karya portofolio). */
  deskripsiDok: 10_000,
  kategori: 100,
  penulis: 100,
  /** URL gambar/foto ('/uploads/<nama>.<ext>' atau path statis). */
  url: 500,
  profilNama: 200,
  profilTagline: 300,
  profilRingkasan: 2_000,
  profilAlamat: 500,
  profilEmail: 320,
  profilTelepon: 50,
  profilVisi: 2_000,
  profilMisi: 10_000,
  timNama: 200,
  timPeran: 200,
  timKredensial: 300,
  /** Batas urutan baris tim (pengaman angka liar). */
  urutanMaks: 9_999,
  /** Field kursus. */
  kursusDeskripsi: 1_000,
  kursusTentang: 20_000,
  durasi: 100,
  level: 100,
  format: 100,
  instruktur: 200,
  peran: 200,
  inisial: 10,
  targetItem: 200,
  hasilItem: 500,
  modulJudul: 200,
  modulDeskripsi: 1_000,
  modulMeta: 200,
} as const;

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

/** Baca field teks wajib (trim; kosong = gagal; lewat `maks` = gagal). */
function bacaTeks(
  body: Record<string, unknown>,
  kunci: string,
  maks?: number,
): { nilai: string } | { error: string } {
  const nilai = body[kunci];
  if (typeof nilai !== 'string' || nilai.trim() === '') {
    return { error: `Field "${kunci}" wajib diisi` };
  }
  const bersih = nilai.trim();
  if (maks !== undefined && bersih.length > maks) {
    return { error: `Field "${kunci}" maksimal ${maks} karakter` };
  }
  return { nilai: bersih };
}

/**
 * Baca field teks opsional: undefined/null/''/spasi saja → `null`
 * (tersimpan NULL di DB supaya frontend memakai fallback-nya).
 */
function bacaTeksOpsional(
  body: Record<string, unknown>,
  kunci: string,
  maks?: number,
): { nilai: string | null } | { error: string } {
  const nilai = body[kunci];
  if (nilai === undefined || nilai === null || (typeof nilai === 'string' && nilai.trim() === '')) {
    return { nilai: null };
  }
  if (typeof nilai !== 'string') return { error: `Field "${kunci}" harus teks` };
  const bersih = nilai.trim();
  if (maks !== undefined && bersih.length > maks) {
    return { error: `Field "${kunci}" maksimal ${maks} karakter` };
  }
  return { nilai: bersih };
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
  const judul = bacaTeks(b, 'judul', BATAS.judul);
  if ('error' in judul) return { ok: false, error: judul.error };
  const deskripsi = bacaTeks(b, 'deskripsi', BATAS.deskripsiDok);
  if ('error' in deskripsi) return { ok: false, error: deskripsi.error };
  const kategori = bacaTeks(b, 'kategori', BATAS.kategori);
  if ('error' in kategori) return { ok: false, error: kategori.error };
  const tanggal = bacaTanggal(b);
  if ('error' in tanggal) return { ok: false, error: tanggal.error };
  const gambar = bacaTeksOpsional(b, 'gambar', BATAS.url);
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
  const judul = bacaTeks(b, 'judul', BATAS.judul);
  if ('error' in judul) return { ok: false, error: judul.error };
  const ringkasan = bacaTeks(b, 'ringkasan', BATAS.ringkasan);
  if ('error' in ringkasan) return { ok: false, error: ringkasan.error };
  const isi = bacaTeks(b, 'isi', BATAS.isi);
  if ('error' in isi) return { ok: false, error: isi.error };
  const penulis = bacaTeks(b, 'penulis', BATAS.penulis);
  if ('error' in penulis) return { ok: false, error: penulis.error };
  const tanggal = bacaTanggal(b);
  if ('error' in tanggal) return { ok: false, error: tanggal.error };
  const gambar = bacaTeksOpsional(b, 'gambar', BATAS.url);
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
  panjangItem?: number,
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
  if (panjangItem !== undefined) {
    const adaTerlaluPanjang = nilai.some((e) => e.length > panjangItem);
    if (adaTerlaluPanjang) {
      return { error: `Field "${kunci}" maksimal ${panjangItem} karakter per item` };
    }
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
  // Batas panjang per field wajib kursus (kunci = field InputKursus).
  const batasWajib = {
    judul: BATAS.judul,
    deskripsi: BATAS.kursusDeskripsi,
    tentang: BATAS.kursusTentang,
    durasi: BATAS.durasi,
    level: BATAS.level,
    format: BATAS.format,
    instruktur: BATAS.instruktur,
    peran: BATAS.peran,
    inisial: BATAS.inisial,
  } as const;
  const bersih = {} as Record<keyof typeof batasWajib, string>;
  for (const kunci of Object.keys(batasWajib) as Array<keyof typeof batasWajib>) {
    const hasil = bacaTeks(b, kunci, batasWajib[kunci]);
    if ('error' in hasil) return { ok: false, error: hasil.error };
    bersih[kunci] = hasil.nilai;
  }
  const target = bacaDaftarTeks(b, 'target', 1, 10, BATAS.targetItem);
  if ('error' in target) return { ok: false, error: target.error };
  const hasil = bacaDaftarTeks(b, 'hasil', 1, 30, BATAS.hasilItem);
  if ('error' in hasil) return { ok: false, error: hasil.error };
  const mentahModul = b.modul;
  if (!Array.isArray(mentahModul) || mentahModul.length === 0) {
    return { ok: false, error: 'Field "modul" minimal 1 modul' };
  }
  if (mentahModul.length > 50) {
    return { ok: false, error: 'Field "modul" maksimal 50 modul' };
  }
  const batasModul = {
    judul: BATAS.modulJudul,
    deskripsi: BATAS.modulDeskripsi,
    meta: BATAS.modulMeta,
  } as const;
  const modul: Array<{ judul: string; deskripsi: string; meta: string }> = [];
  for (let i = 0; i < mentahModul.length; i++) {
    const m = mentahModul[i] as Record<string, unknown>;
    if (m === null || typeof m !== 'object') {
      return { ok: false, error: `Modul ke-${i + 1} tidak valid` };
    }
    const modulBersih = {} as Record<keyof typeof batasModul, string>;
    for (const kunci of Object.keys(batasModul) as Array<keyof typeof batasModul>) {
      const nilai = m[kunci];
      if (typeof nilai !== 'string' || nilai.trim() === '') {
        return { ok: false, error: `Modul ke-${i + 1}: field "${kunci}" wajib diisi` };
      }
      const teks = nilai.trim();
      if (teks.length > batasModul[kunci]) {
        return {
          ok: false,
          error: `Modul ke-${i + 1}: field "${kunci}" maksimal ${batasModul[kunci]} karakter`,
        };
      }
      modulBersih[kunci] = teks;
    }
    modul.push(modulBersih);
  }
  return { ok: true, data: { kode, ...bersih, target: target.nilai, hasil: hasil.nilai, modul } };
}

/** Field wajib profil + batas panjangnya (kunci = field InputProfil). */
const BATAS_PROFIL: Record<
  'nama' | 'tagline' | 'ringkasan' | 'alamat' | 'email' | 'telepon',
  number
> = {
  nama: BATAS.profilNama,
  tagline: BATAS.profilTagline,
  ringkasan: BATAS.profilRingkasan,
  alamat: BATAS.profilAlamat,
  email: BATAS.profilEmail,
  telepon: BATAS.profilTelepon,
};

/** Validasi body tulis profil (PUT /api/profil — form tab "Profil" di admin). */
export function validasiProfil(body: unknown): HasilValidasi<InputProfil> {
  if (body === null || typeof body !== 'object') {
    return { ok: false, error: 'Body harus objek JSON' };
  }
  const b = body as Record<string, unknown>;
  const bersih = {} as Pick<InputProfil, keyof typeof BATAS_PROFIL>;
  for (const kunci of Object.keys(BATAS_PROFIL) as Array<keyof typeof BATAS_PROFIL>) {
    const hasil = bacaTeks(b, kunci, BATAS_PROFIL[kunci]);
    if ('error' in hasil) return { ok: false, error: hasil.error };
    bersih[kunci] = hasil.nilai;
  }
  const visi = bacaTeksOpsional(b, 'visi', BATAS.profilVisi);
  if ('error' in visi) return { ok: false, error: visi.error };
  const misi = bacaTeksOpsional(b, 'misi', BATAS.profilMisi);
  if ('error' in misi) return { ok: false, error: misi.error };
  return { ok: true, data: { ...bersih, visi: visi.nilai, misi: misi.nilai } };
}

/** Validasi body tulis anggota tim (POST/PUT /api/tim). */
export function validasiTim(body: unknown): HasilValidasi<InputTim> {
  if (body === null || typeof body !== 'object') {
    return { ok: false, error: 'Body harus objek JSON' };
  }
  const b = body as Record<string, unknown>;
  const nama = bacaTeks(b, 'nama', BATAS.timNama);
  if ('error' in nama) return { ok: false, error: nama.error };
  const peran = bacaTeks(b, 'peran', BATAS.timPeran);
  if ('error' in peran) return { ok: false, error: peran.error };
  const kredensial = bacaTeksOpsional(b, 'kredensial', BATAS.timKredensial);
  if ('error' in kredensial) return { ok: false, error: kredensial.error };
  const foto = bacaTeksOpsional(b, 'foto', BATAS.url);
  if ('error' in foto) return { ok: false, error: foto.error };
  const urutan = b.urutan;
  if (typeof urutan !== 'number' || !Number.isInteger(urutan) || urutan < 0 || urutan > BATAS.urutanMaks) {
    return { ok: false, error: `Field "urutan" harus bilangan bulat 0-${BATAS.urutanMaks}` };
  }
  return {
    ok: true,
    data: {
      nama: nama.nilai,
      peran: peran.nilai,
      kredensial: kredensial.nilai,
      foto: foto.nilai,
      urutan,
    },
  };
}
