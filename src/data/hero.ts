// TODO_BACKEND: ganti data dummy ini dengan fetch ke API backend (mis. GET /api/hero-slides).
// Slide hero beranda — struktur mengikuti slider hero di beranda/index.html.
export interface HeroSlide {
  eyebrow: string;
  judul: string;
  judulAksen: string;
  sub: string;
  ctaPrimer: { label: string; to: string };
  ctaSekunder: { label: string; to: string };
  badgeJudul: string;
  badgeSub: string;
  /** Path gambar di `public/` (opsional). Bila kosong, slide fallback ke background navy. */
  image?: string;
  /** Srcset responsif (opsional). TODO_BACKEND: backend mengirim varian ukuran + srcset. */
  srcSet?: string;
  sizes?: string;
}

export const heroSlidesDummy: HeroSlide[] = [
  {
    eyebrow: 'AI Center · Universitas Surabaya',
    judul: 'Pusat Riset & Layanan',
    judulAksen: 'Kecerdasan Artifisial',
    sub: 'Kursus AI/ML dan inference solution untuk sivitas akademika serta mitra industri.',
    ctaPrimer: { label: 'Tentang Kami', to: '/tentang-kami' },
    ctaSekunder: { label: 'Lihat Berita', to: '/berita' },
    badgeJudul: 'AI Center Ubaya',
    badgeSub: 'Riset · Pelatihan · Layanan',
    image: '/hero-1-1600.webp',
    srcSet: '/hero-1-800.webp 800w, /hero-1-1600.webp 1600w',
    sizes: '100vw',
  },
  {
    eyebrow: 'Inference Solution',
    judul: 'Akselerasi Riset dan Produk',
    judulAksen: 'untuk Kebutuhan Nyata',
    sub: 'Kembangkan dan deploy model Anda sebagai layanan inference dengan pendampingan AI Center.',
    ctaPrimer: { label: 'Lihat Dokumentasi', to: '/dokumentasi' },
    ctaSekunder: { label: 'Tim Kami', to: '/tim' },
    badgeJudul: 'Inference Solution',
    badgeSub: 'Integrasi model + dukungan teknis',
    image: '/hero-2-1600.webp',
    srcSet: '/hero-2-800.webp 800w, /hero-2-1600.webp 1600w',
    sizes: '100vw',
  },
];
