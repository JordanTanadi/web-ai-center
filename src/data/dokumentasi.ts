// TODO_BACKEND: ganti data dummy ini dengan fetch ke API backend (mis. GET /api/dokumentasi).
export interface DokumentasiItem {
  slug: string;
  judul: string;
  deskripsi: string;
  tanggal: string; // ISO date
  kategori: string;
  /** Path gambar di `public/` (opsional). TODO_BACKEND: backend mengirim URL gambar. */
  gambar?: string;
}

export const dokumentasiDummy: DokumentasiItem[] = [
  {
    slug: 'workshop-pengenalan-gpu-lab',
    judul: 'Workshop Pengenalan GPU Lab',
    deskripsi: 'Dokumentasi workshop pengenalan akses dan antrean GPU lab AI Center.',
    tanggal: '2026-07-15',
    kategori: 'Workshop',
  },
  {
    slug: 'kunjungan-industri-semester-genap',
    judul: 'Kunjungan Industri Semester Genap',
    deskripsi: 'Dokumentasi kunjungan industri ke AI Center Ubaya.',
    tanggal: '2026-06-10',
    kategori: 'Kunjungan',
  },
  {
    slug: 'demo-inference-solution-mitra',
    judul: 'Demo Inference Solution untuk Mitra',
    deskripsi: 'Dokumentasi sesi demo deployment model untuk mitra industri.',
    tanggal: '2026-08-28',
    kategori: 'Demo',
  },
];

export function getDokumentasiBySlug(slug: string): DokumentasiItem | undefined {
  if (!slug) return undefined;
  return dokumentasiDummy.find((d) => d.slug === slug);
}
