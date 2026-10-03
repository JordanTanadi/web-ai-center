/**
 * Unggah gambar admin (PROGRESS 2 lanjutan): gambar konten bukan lagi URL
 * teks, melainkan FILE yang diunggah ke server lalu disajikan statis.
 *
 * Alur: `POST /api/admin/upload` (multipart `gambar`) → validasi di sini →
 * simpan ke `UPLOAD_DIR` (default `<cwd>/uploads`) → balikan `{ url }`
 * berbentuk `/uploads/<nama-unik>.<ext>` untuk disimpan di kolom `gambar`.
 * `GET /uploads/:nama` menyajikan file-nya kembali.
 */

/** Ukuran maksimum file: 2 MB. */
export const BATAS_UKURAN_GAMBAR = 2 * 1024 * 1024;

/** MIME yang diterima → ekstensi aman untuk nama file. */
const EKSTENSI_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export interface GambarTervalidasi {
  /** Ekstensi aman hasil pemetaan MIME (tanpa titik). */
  ext: string;
}

/**
 * Validasi file unggahan: harus File, MIME gambar yang diizinkan,
 * ukuran ≤ batas. Murni (tanpa FS) supaya mudah diuji.
 */
export function validasiFileGambar(
  nilai: unknown,
): { ok: true; ext: string } | { ok: false; error: string } {
  if (!(nilai instanceof File)) {
    return { ok: false, error: 'Field "gambar" wajib file gambar (JPEG/PNG/WebP)' };
  }
  const ext = EKSTENSI_MIME[nilai.type];
  if (ext === undefined) {
    return { ok: false, error: 'Tipe file harus JPEG, PNG, atau WebP' };
  }
  if (nilai.size === 0) {
    return { ok: false, error: 'File gambar kosong' };
  }
  if (nilai.size > BATAS_UKURAN_GAMBAR) {
    return { ok: false, error: 'Ukuran file maksimal 2 MB' };
  }
  return { ok: true, ext };
}

/** Direktori penyimpanan: env UPLOAD_DIR, atau `<cwd>/uploads`. */
export function resolveUploadDir(cwd: string = process.cwd()): string {
  const mentah = process.env.UPLOAD_DIR;
  if (mentah !== undefined && mentah.trim() !== '') return mentah.trim();
  return `${cwd.replace(/\/+$/, '')}/uploads`;
}

/** Nama file unik anti-bentrok: `<epoch>-<acak>.<ext>`. */
export function namaFileUnik(ext: string): string {
  const acak = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${acak}.${ext}`;
}

/**
 * Amankan segmen nama file dari URL: tolak traversal & ekstensi asing.
 * Mengembalikan nama bersih, atau `null` bila tidak sah.
 */
export function namaFileAman(nama: string): string | null {
  if (nama === '' || nama.includes('/') || nama.includes('\\') || nama.includes('%')) return null;
  const titik = nama.lastIndexOf('.');
  if (titik <= 0) return null;
  const ext = nama.slice(titik + 1).toLowerCase();
  if (!Object.values(EKSTENSI_MIME).includes(ext)) return null;
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(nama)) return null;
  return nama;
}

/** Content-Type untuk ekstensi yang diizinkan. */
export function tipeKontenGambar(ext: string): string {
  switch (ext) {
    case 'jpg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'image/webp';
  }
}

/**
 * Simpan file tervalidasi ke direktori unggahan. Mengembalikan nama file.
 * (Bun.write membuat folder induk otomatis bila belum ada.)
 */
export async function simpanFileGambar(
  file: File,
  ext: string,
  dir: string = resolveUploadDir(),
): Promise<string> {
  const nama = namaFileUnik(ext);
  await Bun.write(`${dir.replace(/\/+$/, '')}/${nama}`, file);
  return nama;
}

/** URL publik untuk nama file tersimpan. */
export function urlFileUnggahan(nama: string): string {
  return `/uploads/${nama}`;
}
