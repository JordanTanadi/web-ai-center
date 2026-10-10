/**
 * Helper katalog & detail kursus: estimasi durasi total meniru pola Coursera
 * ("9 hours to complete") — dihitung dari meta modul ("4 video · 35 menit").
 * Sifatnya perkiraan ("±"): bila sebagian modul tidak mencantumkan menit,
 * angka yang tampil hanyalah jumlah yang terbaca.
 */

/** Jumlah menit yang tertera di meta satu modul; 0 bila tidak terbaca. */
export function menitDariMeta(meta: string): number {
  const cocok = meta.match(/(\d+)\s*menit/i);
  return cocok === null ? 0 : Number(cocok[1]);
}

/** Total menit seluruh modul (0 bila tidak ada satupun meta yang terbaca). */
export function totalMenitKursus(modul: ReadonlyArray<{ meta: string }>): number {
  return modul.reduce((total, m) => total + menitDariMeta(m.meta), 0);
}

/**
 * Label durasi total ala Coursera: "±55 menit" / "±2 jam" / "±2 jam 15 menit".
 * `null` bila tidak ada satupun menit terbaca (tampilan menyembunyikan baris).
 */
export function labelDurasiTotal(modul: ReadonlyArray<{ meta: string }>): string | null {
  const menit = totalMenitKursus(modul);
  if (menit <= 0) return null;
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  if (jam === 0) return `±${menit} menit`;
  return sisa === 0 ? `±${jam} jam` : `±${jam} jam ${sisa} menit`;
}
