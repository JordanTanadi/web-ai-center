// TODO_BACKEND: ganti data dummy ini dengan fetch ke API backend (mis. GET /api/berita).
// Bentuk response backend yang diharapkan: { items: BeritaItem[] } dengan field yang sama.
export interface BeritaItem {
  slug: string;
  judul: string;
  ringkasan: string;
  isi: string;
  tanggal: string; // ISO date
  gambar?: string;
  penulis: string;
}

export const beritaDummy: BeritaItem[] = [
  {
    slug: 'peluncuran-ai-center-ubaya',
    judul: 'Peluncuran AI Center Universitas Surabaya',
    ringkasan: 'AI Center Ubaya resmi diluncurkan sebagai pusat riset dan layanan AI.',
    isi: 'AI Center Universitas Surabaya resmi diluncurkan. Fokus awal: riset terapan, pelatihan, layanan GPU, dan solusi inference untuk industri dan sivitas akademika.',
    tanggal: '2026-08-01',
    penulis: 'Humas AI Center',
  },
  {
    slug: 'pelatihan-dasar-machine-learning',
    judul: 'Pelatihan Dasar Machine Learning Angkatan 1',
    ringkasan: 'Pelatihan dasar ML untuk mahasiswa dan umum telah dibuka.',
    isi: 'Pelatihan mencakup Python, data preparation, regresi, klasifikasi, dan evaluasi model. Peserta mendapatkan sertifikat dan akses lab.',
    tanggal: '2026-08-20',
    penulis: 'Tim Pelatihan',
  },
  {
    slug: 'layanan-gpu-rental-untuk-riset',
    judul: 'Layanan GPU Rental untuk Riset Kini Dibuka',
    ringkasan: 'Sivitas akademika dan mitra industri kini dapat menyewa akses GPU lab.',
    isi: 'GPU lab AI Center membuka slot sewa untuk riset tugas akhir, skripsi, dan proyek industri. Pendaftaran melalui formulir kontak dan verifikasi admin.',
    tanggal: '2026-09-05',
    penulis: 'Tim Lab',
  },
];

export function getBeritaBySlug(slug: string): BeritaItem | undefined {
  if (!slug) return undefined;
  return beritaDummy.find((b) => b.slug === slug);
}
