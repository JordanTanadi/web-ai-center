import { kontakDummy, waLinkKontak } from './kontak.ts';

// Data dummy = FALLBACK untuk backend (GET /api/hero-slides via useApiDaftar di Beranda):
// dipakai bila VITE_API_BASE_URL kosong atau request gagal.
// CTA primer berorientasi nilai (konversi); `to` boleh URL eksternal (konsultasi WA)
// — HeroCarousel me-render-nya sebagai <a> tab baru.
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
  /** Srcset responsif (opsional) — dikirim kolom `src_set` tabel hero_slides. */
  srcSet?: string;
  sizes?: string;
  /** Layout: 'default' (image bg overlay) atau 'image-left' (image kiri, teks kanan) */
  layout?: 'default' | 'image-left';
}

export const heroSlidesDummy: HeroSlide[] = [
  {
    eyebrow: 'AI Center · Universitas Surabaya',
    judul: 'Pusat Riset & Layanan',
    judulAksen: 'Kecerdasan Artifisial',
    sub: 'Kursus AI/ML dan inference solution untuk sivitas akademika serta mitra industri.',
    ctaPrimer: { label: 'Jadwalkan Konsultasi AI', to: waLinkKontak(kontakDummy) },
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
    ctaPrimer: { label: 'Mulai Transformasi Bisnis Anda', to: '/layanan/inference-solution' },
    ctaSekunder: { label: 'Tim Kami', to: '/tim' },
    badgeJudul: 'Inference Solution',
    badgeSub: 'Integrasi model + dukungan teknis',
    image: '/hero-2-1600.webp',
    srcSet: '/hero-2-800.webp 800w, /hero-2-1600.webp 1600w',
    sizes: '100vw',
    layout: 'image-left',
  },
];
