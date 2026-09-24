// Visi & Misi resmi AI Center — mengikuti dokumen "Visi & Misi" (Arah Kami).
// TODO_BACKEND: ganti dengan GET /api/profil (field visi & misi).
// Catatan integrasi: kolom DB `misi` bertipe teks — simpan satu poin per baris,
// lalu split('\n') di lapisan pemetaan API saat frontend mulai fetch backend.
export interface Profil {
  /** Kalimat pengantar section Visi & Misi. */
  introVisiMisi: string;
  visi: {
    judul: string;
    deskripsi: string;
  };
  /** Daftar poin misi, berurutan 01..n. */
  misi: string[];
}

export const profilDummy: Profil = {
  introVisiMisi:
    'Komitmen kami membangun ekosistem kecerdasan buatan yang inovatif, aplikatif, dan berdampak.',
  visi: {
    judul: 'Menjadi AI Solution Factory terdepan',
    deskripsi:
      'Menghasilkan produk, menjadi pusat riset, serta meningkatkan kapasitas sumber daya manusia ' +
      'di bidang AI yang memberikan dampak nyata bagi akademik, industri, dan masyarakat.',
  },
  misi: [
    'Mendorong riset AI yang inovatif dan aplikatif.',
    'Menghasilkan produk dan solusi AI yang siap digunakan.',
    'Mengembangkan talenta AI yang kompeten.',
    'Membangun kolaborasi strategis dengan pemerintah dan industri.',
    'Menciptakan ekosistem inovasi dan startup berbasis AI.',
  ],
};
