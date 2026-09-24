/**
 * Seed data dummy development — menyalin data dummy frontend (src/data/*.ts)
 * ke database supaya API bisa langsung diuji.
 *
 * Idempoten: semua tabel dihapus lalu diisi ulang (deterministik untuk dummy).
 * Jalankan: `bun run db:seed` (setelah `bun run db:migrate`).
 */
import type { Db } from './client';
import { createDb, resolveDbTarget } from './client';
import { resolveConfig } from '../config';
import { berita, dokumentasi, heroSlides, klien, layanan, profil, tim, testimoni } from './schema';

type BeritaSeed = Omit<typeof berita.$inferInsert, 'id' | 'createdAt'>;
type DokumentasiSeed = Omit<typeof dokumentasi.$inferInsert, 'id' | 'createdAt'>;
type TimSeed = Omit<typeof tim.$inferInsert, 'id'>;
type LayananSeed = Omit<typeof layanan.$inferInsert, 'id'>;
type HeroSeed = Omit<typeof heroSlides.$inferInsert, 'id'>;
type KlienSeed = Omit<typeof klien.$inferInsert, 'id'>;
type TestimoniSeed = Omit<typeof testimoni.$inferInsert, 'id'>;
type ProfilSeed = typeof profil.$inferInsert;

export const SEED_BERITA: BeritaSeed[] = [
  {
    slug: 'peluncuran-ai-center-ubaya',
    judul: 'Peluncuran AI Center Universitas Surabaya',
    ringkasan: 'AI Center Ubaya resmi diluncurkan sebagai pusat riset dan layanan AI.',
    isi: 'AI Center Universitas Surabaya resmi diluncurkan. Fokus awal: riset terapan, pelatihan, dan solusi inference untuk industri serta sivitas akademika.',
    tanggal: '2026-08-01',
    penulis: 'Humas AI Center',
    gambar: null,
  },
  {
    slug: 'pelatihan-dasar-machine-learning',
    judul: 'Pelatihan Dasar Machine Learning Angkatan 1',
    ringkasan: 'Pelatihan dasar ML untuk mahasiswa dan umum telah dibuka.',
    isi: 'Pelatihan mencakup Python, data preparation, regresi, klasifikasi, dan evaluasi model. Peserta mendapatkan sertifikat dan akses lab.',
    tanggal: '2026-08-20',
    penulis: 'Tim Pelatihan',
    gambar: null,
  },
  {
    slug: 'kolaborasi-inference-solution-untuk-mitra',
    judul: 'Kolaborasi Inference Solution untuk Mitra',
    ringkasan: 'AI Center mendampingi mitra mengembangkan solusi inference yang siap digunakan.',
    isi: 'AI Center mendampingi integrasi model machine learning menjadi layanan inference untuk kebutuhan mitra industri.',
    tanggal: '2026-09-05',
    penulis: 'Tim Lab',
    gambar: null,
  },
];

export const SEED_DOKUMENTASI: DokumentasiSeed[] = [
  {
    slug: 'workshop-pengenalan-gpu-lab',
    judul: 'Workshop Pengenalan GPU Lab',
    deskripsi: 'Dokumentasi workshop pengenalan akses dan antrean GPU lab AI Center.',
    tanggal: '2026-07-15',
    kategori: 'Workshop',
    gambar: null,
  },
  {
    slug: 'kunjungan-industri-semester-genap',
    judul: 'Kunjungan Industri Semester Genap',
    deskripsi: 'Dokumentasi kunjungan industri ke AI Center Ubaya.',
    tanggal: '2026-06-10',
    kategori: 'Kunjungan',
    gambar: null,
  },
  {
    slug: 'demo-inference-solution-mitra',
    judul: 'Demo Inference Solution untuk Mitra',
    deskripsi: 'Dokumentasi sesi demo deployment model untuk mitra industri.',
    tanggal: '2026-08-28',
    kategori: 'Demo',
    gambar: null,
  },
];

export const SEED_TIM: TimSeed[] = [
  { nama: 'Nama Kepala AI Center', peran: 'Kepala AI Center', kredensial: 'Ph.D.', foto: null, urutan: 0 },
  { nama: 'Nama Koordinator Riset', peran: 'Koordinator Riset', kredensial: 'M.Kom.', foto: null, urutan: 1 },
  { nama: 'Nama Koordinator Pelatihan', peran: 'Koordinator Pelatihan', kredensial: 'M.Kom.', foto: null, urutan: 2 },
];

export const SEED_LAYANAN: LayananSeed[] = [
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

export const SEED_HERO: HeroSeed[] = [
  {
    urutan: 0,
    eyebrow: 'AI Center · Universitas Surabaya',
    judul: 'Pusat Riset & Layanan',
    judulAksen: 'Kecerdasan Artifisial',
    sub: 'Kursus AI/ML dan inference solution untuk sivitas akademika serta mitra industri.',
    ctaPrimer: { label: 'Tentang Kami', to: '/tentang-kami' },
    ctaSekunder: { label: 'Lihat Berita', to: '/berita' },
    badgeJudul: 'AI Center Ubaya',
    badgeSub: 'Riset · Pelatihan · Layanan',
    image: '/hero-1.jpg',
    srcSet: '/hero-1-800.webp 800w, /hero-1-1600.webp 1600w',
    sizes: '100vw',
  },
  {
    urutan: 1,
    eyebrow: 'Inference Solution',
    judul: 'Akselerasi Riset dan Produk',
    judulAksen: 'untuk Kebutuhan Nyata',
    sub: 'Kembangkan dan deploy model Anda sebagai layanan inference dengan pendampingan AI Center.',
    ctaPrimer: { label: 'Lihat Dokumentasi', to: '/dokumentasi' },
    ctaSekunder: { label: 'Tim Kami', to: '/tim' },
    badgeJudul: 'Inference Solution',
    badgeSub: 'Integrasi model + dukungan teknis',
    image: '/hero-2.jpg',
    srcSet: '/hero-2-800.webp 800w, /hero-2-1600.webp 1600w',
    sizes: '100vw',
  },
];

export const SEED_KLIEN: KlienSeed[] = [
  { nama: 'PT Sinar Teknologi', bidang: 'Teknologi', urutan: 0 },
  { nama: 'CV Data Prima', bidang: 'Konsultan Data', urutan: 1 },
  { nama: 'Dinas Pendidikan Kota Surabaya', bidang: 'Pemerintahan', urutan: 2 },
  { nama: 'PT Karya Digital', bidang: 'Software House', urutan: 3 },
  { nama: 'Yayasan Pendidikan Ubaya', bidang: 'Pendidikan', urutan: 4 },
  { nama: 'PT Cloud Nusantara', bidang: 'Infrastruktur', urutan: 5 },
];

export const SEED_TESTIMONI: TestimoniSeed[] = [
  {
    nama: 'Peserta Pelatihan ML',
    peran: 'Mahasiswa',
    kutipan:
      'Materi pelatihan runtut dan langsung praktik. Akses GPU lab membuat eksperimen tugas akhir jauh lebih cepat.',
  },
  {
    nama: 'Mitra Industri',
    peran: 'Pengguna Inference Solution',
    kutipan:
      'Proses deployment model didampingi sampai jalan di infrastruktur kami. Komunikasi tim responsif dan dokumentasinya jelas.',
  },
  {
    nama: 'Dosen Peneliti',
    peran: 'Peneliti',
    kutipan:
      'Pendampingan AI Center sangat membantu riset. Tim responsif dan memberi dukungan teknis saat ada kendala.',
  },
];

export const SEED_PROFIL: ProfilSeed = {
  id: 1,
  nama: 'AI Center Universitas Surabaya',
  tagline: 'Pusat riset dan layanan kecerdasan artifisial dalam ekosistem LPPM Universitas Surabaya.',
  ringkasan:
    'AI Center Universitas Surabaya adalah pusat riset dan layanan kecerdasan artifisial yang mendukung ' +
    'pendidikan, penelitian, dan pengabdian masyarakat dalam ekosistem LPPM Universitas Surabaya. ' +
    'Layanan utama: pelatihan AI/ML dan solusi inference untuk industri.',
  alamat: 'Gedung Perpustakaan LT.4, Jalan Raya Kalirungkut, Tenggilis, Surabaya',
  email: 'aicenter@unit.ubaya.ac.id',
  telepon: '0895-6342-22240',
  // Visi resmi: judul + deskripsi digabung satu baris teks.
  visi:
    'Menjadi AI Solution Factory terdepan — Menghasilkan produk, menjadi pusat riset, serta ' +
    'meningkatkan kapasitas sumber daya manusia di bidang AI yang memberikan dampak nyata bagi ' +
    'akademik, industri, dan masyarakat.',
  // Misi resmi: satu poin per baris (frontend memecah dengan split('\n')).
  misi: [
    'Mendorong riset AI yang inovatif dan aplikatif.',
    'Menghasilkan produk dan solusi AI yang siap digunakan.',
    'Mengembangkan talenta AI yang kompeten.',
    'Membangun kolaborasi strategis dengan pemerintah dan industri.',
    'Menciptakan ekosistem inovasi dan startup berbasis AI.',
  ].join('\n'),
  statistik: null,
};

/** Isi ulang semua tabel dummy (hapus dulu → idempoten & deterministik). */
export async function runSeed(db: Db): Promise<void> {
  await db.delete(berita);
  await db.delete(dokumentasi);
  await db.delete(tim);
  await db.delete(layanan);
  await db.delete(heroSlides);
  await db.delete(klien);
  await db.delete(testimoni);
  await db.delete(profil);

  if (SEED_BERITA.length > 0) await db.insert(berita).values(SEED_BERITA);
  if (SEED_DOKUMENTASI.length > 0) await db.insert(dokumentasi).values(SEED_DOKUMENTASI);
  if (SEED_TIM.length > 0) await db.insert(tim).values(SEED_TIM);
  if (SEED_LAYANAN.length > 0) await db.insert(layanan).values(SEED_LAYANAN);
  if (SEED_HERO.length > 0) await db.insert(heroSlides).values(SEED_HERO);
  if (SEED_KLIEN.length > 0) await db.insert(klien).values(SEED_KLIEN);
  if (SEED_TESTIMONI.length > 0) await db.insert(testimoni).values(SEED_TESTIMONI);
  await db.insert(profil).values(SEED_PROFIL);
}

/** CLI: `bun run db:seed` — exit code 1 bila gagal (tidak silent). */
if (import.meta.main) {
  const config = resolveConfig(process.env);
  const target = resolveDbTarget(config.databaseUrl);
  try {
    const handle = await createDb(target);
    try {
      await runSeed(handle.db);
      console.log(`Seed selesai (db: ${target.kind}).`);
    } finally {
      await handle.close();
    }
  } catch (error) {
    console.error('Seed gagal:', error);
    process.exit(1);
  }
}
