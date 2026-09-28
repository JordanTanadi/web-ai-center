// Data dummy = FALLBACK untuk backend (GET /api/berita via useApiDaftar/useApiObjek):
// dipakai bila VITE_API_BASE_URL kosong atau request gagal — sumber utama ada di DB.
// Bentuk respons backend: { items: BeritaItem[] } dengan field yang sama.
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
    isi: 'AI Center Universitas Surabaya resmi diluncurkan. Fokus awal: riset terapan, pelatihan, dan solusi inference untuk industri serta sivitas akademika.',
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
    slug: 'kolaborasi-inference-solution-untuk-mitra',
    judul: 'Kolaborasi Inference Solution untuk Mitra',
    ringkasan: 'AI Center mendampingi mitra mengembangkan solusi inference yang siap digunakan.',
    isi: 'AI Center mendampingi integrasi model machine learning menjadi layanan inference untuk kebutuhan mitra industri.',
    tanggal: '2026-09-05',
    penulis: 'Tim Lab',
  },
];

export function getBeritaBySlug(slug: string): BeritaItem | undefined {
  if (!slug) return undefined;
  return beritaDummy.find((b) => b.slug === slug);
}
