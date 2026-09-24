// TODO_BACKEND: ganti data dummy ini dengan fetch ke API backend (mis. GET /api/layanan dan GET /api/layanan/:slug).
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
    tagline: 'Kursus AI/ML terstruktur untuk belajar mandiri dan bertahap.',
    deskripsi:
      'Platform pembelajaran AI dan machine learning dengan kursus bertingkat, materi video, latihan praktik, ' +
      'evaluasi, dan sertifikat penyelesaian untuk sivitas akademika serta umum.',
    fitur: [
      'Katalog kursus dari dasar hingga lanjut',
      'Modul video, materi bacaan, dan latihan praktik',
      'Kuis dan evaluasi di setiap tahap pembelajaran',
      'Progress belajar dan sertifikat penyelesaian',
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
