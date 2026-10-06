/**
 * Deteksi file gambar YATIM di direktori unggahan (Prioritas 2): file yang
 * tidak lagi dirujuk kolom manapun (berita.gambar, dokumentasi.gambar,
 * tim.foto) — biasanya sisa setelah admin mengubah/menghapus konten.
 *
 * Murni (tanpa FS): route POST /api/admin/uploads/bersihkan yang membaca
 * direktori (lib/upload.daftarFileUnggahan), memanggil fungsi ini, lalu
 * menghapus hasilnya (lib/upload.hapusFileUnggahan).
 */

/**
 * Ambil nama file dari URL unggahan publik (`/uploads/x.jpg` → `x.jpg`).
 * Bukan URL unggahan (path statis `/tim/a.jpg`, nilai lain) → `null`.
 */
function namaDariUrl(url: string): string | null {
  const cocok = /^\/uploads\/([^/]+)$/.exec(url);
  return cocok !== null ? (cocok[1] as string) : null;
}

/**
 * Kembalikan nama file yang TIDAK dirujuk URL manapun (urut, deterministik).
 *
 * @param daftarFile nama file di direktori unggahan (sudah nama aman)
 * @param referensi  semua nilai kolom gambar/foto dari DB (boleh null/undefined)
 */
export function cariYatim(
  daftarFile: string[],
  referensi: Array<string | null | undefined>,
): string[] {
  const terpakai = new Set<string>();
  for (const url of referensi) {
    if (url === null || url === undefined) continue;
    const nama = namaDariUrl(url);
    if (nama !== null) terpakai.add(nama);
  }
  return daftarFile.filter((nama) => !terpakai.has(nama)).sort();
}
