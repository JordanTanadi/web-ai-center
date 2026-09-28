// Data dummy = FALLBACK untuk backend (GET /api/layanan & /api/layanan/:slug via
// useApiDaftar/useApiObjek): dipakai bila VITE_API_BASE_URL kosong atau request gagal.
// Teks "pelatihan" disalin dari situs lama (pelatihan.html + pillar "Pelatihan & Talenta" di index.html).
export interface Layanan {
  slug: string;
  nama: string;
  tagline: string;
  deskripsi: string;
  fitur: string[];
}

export const layananDummy: Layanan[] = [
  {
    slug: 'pelatihan',
    nama: 'Pelatihan',
    tagline: 'Belajar AI untuk membuat dampak nyata.',
    deskripsi:
      'Program praktis dari Ubaya AI Center untuk mahasiswa, dosen, guru, profesional, dan masyarakat umum ' +
      'yang ingin menggunakan AI secara kritis, produktif, dan bertanggung jawab.',
    fitur: [
      'Workshop & bootcamp terjadwal',
      'Pelatihan kustom sesuai kebutuhan',
      'Materi terstruktur dan mudah diikuti',
      'Studi kasus akademik dan profesional',
      'Sertifikat setelah menyelesaikan program',
    ],
  },
  {
    slug: 'inference-solution',
    nama: 'Inference Solution',
    tagline: 'Solusi deployment model untuk kebutuhan industri.',
    deskripsi:
      'Layanan deployment model machine learning menjadi solusi inference siap pakai untuk mitra industri, ' +
      'didampingi tim AI Center dari integrasi sampai berjalan di infrastruktur Anda.',
    fitur: [
      'Deployment model menjadi API layanan',
      'Pendampingan integrasi infrastruktur',
      'Dokumentasi teknis yang jelas',
      'Dukungan purna implementasi',
    ],
  },
];

export function getLayananBySlug(slug: string): Layanan | undefined {
  if (!slug) return undefined;
  return layananDummy.find((l) => l.slug === slug);
}
