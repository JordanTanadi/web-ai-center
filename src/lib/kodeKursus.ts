// Kode kursus OTOMATIS untuk form admin (tab Kursus): prefiks diambil dari
// peserta yang dicentang, nomor urut = angka terbesar pada prefiks itu + 1.
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

/** Label peserta yang bisa dicentang di form (filter katalog tanpa "Semua program"). */
export const LABEL_PESERTA: readonly string[] = kategoriKursus
  .filter((k) => k.nilai !== 'all')
  .map((k) => k.label);

/**
 * Kode kursus berikutnya; string kosong bila peserta belum dipilih.
 *
 * Prefiks ditentukan peserta terpilih yang paling awal pada urutan katalog —
 * hasil sama walau urutan centang berbeda. Kode terpakai yang tidak cocok
 * pola `huruf+angka` atau berprefiks lain (mis. R01) diabaikan.
 */
export function kodeOtomatis(
  peserta: readonly string[],
  kodeTerpakai: readonly string[],
): string {
  const label = LABEL_PESERTA.find((l) => peserta.includes(l));
  if (label === undefined) return '';
  const prefiks = PREFIKS_KODE[label];
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
