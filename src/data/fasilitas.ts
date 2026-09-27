// Konten section Fasilitas — migrasi dari index.html situs lama (section `#fasilitas`):
// 3 ruang AI Center; foto diekstrak dari base64 di halaman lama ke public/fasilitas/.
export interface Ruang {
  /** Slug unik untuk key React. */
  slug: string;
  /** Label kecil di atas judul, mis. 'Ruang Demo'. */
  label: string;
  /** Sub-judul ruang, mis. 'Demo 1 & Demo 2'. */
  judul: string;
  deskripsi: string;
  /** Path gambar di `public/fasilitas/`. */
  gambar: string;
  alt: string;
  /** Dimensi asli gambar (atribut width/height anti-CLS). */
  lebar: number;
  tinggi: number;
}

export const fasilitasDummy: Ruang[] = [
  {
    slug: 'ruang-demo',
    label: 'Ruang Demo',
    judul: 'Demo 1 & Demo 2',
    deskripsi:
      'Ruang berdinding kaca untuk memperagakan produk dan solusi AI kepada mitra dan tamu.',
    gambar: '/fasilitas/ruang-demo.jpg',
    alt: 'Ruang Demo',
    lebar: 1200,
    tinggi: 675,
  },
  {
    slug: 'ruang-pelatihan',
    label: 'Ruang Pelatihan',
    judul: 'Kelas & Workshop',
    deskripsi:
      'Dilengkapi layar besar dan panel akustik — siap untuk pelatihan, bootcamp, dan sesi praktik.',
    gambar: '/fasilitas/ruang-pelatihan.jpg',
    alt: 'Ruang Pelatihan',
    lebar: 1000,
    tinggi: 625,
  },
  {
    slug: 'ruang-diskusi',
    label: 'Ruang Diskusi',
    judul: 'Meja Kolaborasi',
    deskripsi:
      'Ruang diskusi dengan meja bundar dan layar presentasi untuk brainstorming dan rapat tim.',
    gambar: '/fasilitas/ruang-diskusi.jpg',
    alt: 'Ruang Diskusi',
    lebar: 1000,
    tinggi: 625,
  },
];
