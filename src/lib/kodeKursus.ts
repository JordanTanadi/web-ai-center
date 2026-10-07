// Kode kursus OTOMATIS untuk form admin (tab Kursus): prefiks diambil dari
// target peserta yang dipilih, nomor urut = angka terbesar pada prefiks itu + 1.
// Contoh: Mahasiswa → M01, Dosen → D01, Guru → G01, Masyarakat umum → U01.
// Kode lama situs (R01/E01/P01) memakai prefiks lain sehingga tidak ikut
// menaikkan nomor — tiap prefiks berjalan sendiri.
import { kategoriKursus } from '../data/pelatihan.ts';

/** Prefiks kode per label peserta — label HARUS persis dengan label filter katalog. */
export const PREFIKS_KODE: Record<string, string> = {
  Mahasiswa: 'M',
  Dosen: 'D',
  Guru: 'G',
  'Masyarakat umum': 'U',
};

/** Label peserta yang bisa dipilih di form (filter katalog tanpa "Semua program"). */
export const LABEL_PESERTA: readonly string[] = kategoriKursus
  .filter((k) => k.nilai !== 'all')
  .map((k) => k.label);

/**
 * Kode kursus berikutnya untuk SATU target peserta (dropdown di form);
 * string kosong bila target kosong atau di luar daftar katalog.
 *
 * Kode terpakai yang tidak cocok pola `huruf+angka` atau berprefiks lain
 * (mis. R01) diabaikan — nomor berjalan sendiri per prefiks.
 */
export function kodeOtomatis(target: string, kodeTerpakai: readonly string[]): string {
  if (!LABEL_PESERTA.includes(target)) return '';
  const prefiks = PREFIKS_KODE[target];
  if (prefiks === undefined) return '';
  let nomorTerbesar = 0;
  for (const kode of kodeTerpakai) {
    const pola = /^([A-Za-z]+)(\d+)$/.exec(kode.trim());
    if (pola === null) continue;
    const [, huruf, angka] = pola;
    if ((huruf ?? '').toUpperCase() !== prefiks) continue;
    nomorTerbesar = Math.max(nomorTerbesar, Number(angka ?? '0'));
  }
  return `${prefiks}${String(nomorTerbesar + 1).padStart(2, '0')}`;
}
