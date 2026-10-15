// Data dummy = FALLBACK untuk backend (GET /api/berita via useApiDaftar/useApiObjek):
// dipakai bila VITE_API_BASE_URL kosong atau request gagal — sumber utama ada di DB.
// Bentuk respons backend: { items: BeritaItem[] } dengan field yang sama.
// Kebijakan konten (Okt 2026): hanya berita yang bisa diverifikasi dari sumber
// resmi — TIDAK ada artikel karangan. Tambah berita asli lewat admin / seed.
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
    slug: 'ai-center-dukung-layanan-kesehatan-jatim',
    judul: 'AI Center Ubaya Siap Dukung Layanan Kesehatan di Jawa Timur',
    ringkasan:
      'Rektor Ubaya bertemu Gubernur Jawa Timur di Grahadi; AI Center disiapkan sebagai pusat riset unggulan yang menjawab persoalan nyata, terutama di bidang kesehatan.',
    isi: 'Pengembangan AI Center dibahas dalam audiensi Rektor Ubaya, Benny Lianto, dengan Gubernur Jawa Timur, Khofifah Indar Parawansa, di Gedung Negara Grahadi, Surabaya, Jumat (22/5/2026). Gubernur Khofifah menyambut positif langkah Ubaya mengembangkan teknologi AI untuk mendukung sektor kesehatan dan peningkatan kualitas sumber daya manusia. Rektor Benny Lianto menyebut AI Center diproyeksikan menjadi pusat riset unggulan di Jawa Timur yang menghasilkan inovasi berbasis AI yang aplikatif, antara lain teknologi implan gigi dan aplikasi AI untuk membantu diagnosis penyakit. Pengembangan AI kesehatan di Ubaya didukung ekosistem yang lengkap, mulai dari Fakultas Kedokteran, rumah sakit milik kampus, hingga kolaborasi dengan institusi kesehatan lain termasuk RSUD Dr. Soetomo. Artikel ini disadur dari siaran pers Dinas Komunikasi dan Informatika Provinsi Jawa Timur (23 Mei 2026).',
    tanggal: '2026-05-22',
    penulis: 'AI Center Ubaya',
  },
];

export function getBeritaBySlug(slug: string): BeritaItem | undefined {
  if (!slug) return undefined;
  return beritaDummy.find((b) => b.slug === slug);
}
