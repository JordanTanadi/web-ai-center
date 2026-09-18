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
    tagline: 'Pelatihan AI/ML untuk mahasiswa, dosen, dan umum.',
    deskripsi:
      'Program pelatihan kecerdasan artifisial dan machine learning dari tingkat dasar hingga lanjut, ' +
      'diselenggarakan reguler oleh AI Center Universitas Surabaya untuk sivitas akademika dan umum.',
    fitur: [
      'Kurikulum dasar hingga lanjut (Python, ML, deep learning)',
      'Praktik langsung dengan akses GPU lab',
      'Sertifikat penyelesaian',
      'Jadwal reguler tiap angkatan',
    ],
  },
  {
    slug: 'gpu-rental',
    nama: 'GPU Rental',
    tagline: 'Sewa akses GPU lab untuk riset dan tugas akhir.',
    deskripsi:
      'Layanan penyewaan akses GPU lab AI Center untuk kebutuhan riset tugas akhir, skripsi, ' +
      'penelitian dosen, dan proyek mitra industri dengan sistem antrean terjadwal.',
    fitur: [
      'Slot GPU terjadwal dan transparan',
      'Dukungan teknis selama pemakaian',
      'Cocok untuk tugas akhir dan riset',
      'Pendaftaran dan verifikasi admin',
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
