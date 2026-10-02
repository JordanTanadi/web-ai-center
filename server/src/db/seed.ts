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
import { berita, dokumentasi, heroSlides, klien, kursus, layanan, profil, tim, testimoni } from './schema';

type BeritaSeed = Omit<typeof berita.$inferInsert, 'id' | 'createdAt'>;
type DokumentasiSeed = Omit<typeof dokumentasi.$inferInsert, 'id' | 'createdAt'>;
type TimSeed = Omit<typeof tim.$inferInsert, 'id'>;
type LayananSeed = Omit<typeof layanan.$inferInsert, 'id'>;
type HeroSeed = Omit<typeof heroSlides.$inferInsert, 'id'>;
type KlienSeed = Omit<typeof klien.$inferInsert, 'id'>;
type TestimoniSeed = Omit<typeof testimoni.$inferInsert, 'id'>;
type ProfilSeed = typeof profil.$inferInsert;
type KursusSeed = Omit<typeof kursus.$inferInsert, 'id'>;

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
  // Konsul PROGRESS 2: karya portofolio jadi entri dokumentasi (tanggal = terbit karya).
  {
    slug: 'klasifikasi-xray-pneumonia',
    judul: 'Klasifikasi X-Ray Pneumonia',
    deskripsi: 'Mengklasifikasi citra rontgen dada untuk indikasi pneumonia menggunakan ResNet152V2 + SVM.',
    tanggal: '2026-09-15',
    kategori: 'Kesehatan',
    gambar: '/portofolio/xray-pneumonia.jpg',
  },
  {
    slug: 'implan-gigi-otomatis',
    judul: 'Rekomendasi Implan Gigi Otomatis',
    deskripsi:
      'Menganalisis citra CBCT 3D untuk merekomendasikan ukuran, posisi, dan sudut implan gigi secara otomatis.',
    tanggal: '2026-08-20',
    kategori: 'Kesehatan',
    gambar: '/portofolio/implan-gigi.jpg',
  },
  {
    slug: 'algae-finder',
    judul: 'Algae Finder',
    deskripsi:
      'Mendeteksi dan menghitung jenis mikroalga di perairan (mis. Thalassiosira & Nannochloropsis) dari citra mikroskop.',
    tanggal: '2026-07-28',
    kategori: 'Lingkungan',
    gambar: '/portofolio/algae-finder.jpg',
  },
  {
    slug: 'translator-bahasa-isyarat',
    judul: 'Translator Bahasa Isyarat',
    deskripsi:
      'Menerjemahkan gerakan bahasa isyarat menjadi teks secara real-time melalui kamera, lengkap dengan skor keyakinan.',
    tanggal: '2026-07-02',
    kategori: 'Aksesibilitas',
    gambar: '/portofolio/gesture-translator.jpg',
  },
  {
    slug: 'deteksi-cacat-las',
    judul: 'Deteksi Cacat Las (Welding)',
    deskripsi:
      'Menilai kualitas hasil pengelasan — Good Weld, Bad Weld, atau Defect — langsung dari foto sambungan las.',
    tanggal: '2026-05-28',
    kategori: 'Industri',
    gambar: '/portofolio/cacat-las.jpg',
  },
  {
    slug: 'deteksi-kesegaran-ikan',
    judul: 'Deteksi Kesegaran Ikan',
    deskripsi:
      'Mengenali jenis ikan dan tingkat kesegarannya dari foto, langsung dari ponsel, beserta informasi nutrisi.',
    tanggal: '2026-04-15',
    kategori: 'Pangan',
    gambar: '/portofolio/kesegaran-ikan.jpg',
  },
];

export const SEED_TIM: TimSeed[] = [
  { nama: 'Dr. Mohammad Farid Naufal', peran: 'Ketua', kredensial: null, foto: '/tim/farid-naufal.jpg', urutan: 0 },
  {
    nama: 'Dr. Monica Widiasri',
    peran: 'Koordinator Riset & Edukasi',
    kredensial: null,
    foto: '/tim/monica-widiasri.jpg',
    urutan: 1,
  },
  { nama: 'Prof. Joko Siswantoro', peran: 'Tim Riset', kredensial: null, foto: '/tim/joko-siswantoro.jpg', urutan: 2 },
  {
    nama: 'Marco Ariano Kristyanto',
    peran: 'Tim Hardware',
    kredensial: 'M.M., M.Kom.',
    foto: '/tim/marco-kristyanto.jpg',
    urutan: 3,
  },
  {
    nama: 'Fikri Baharuddin',
    peran: 'Tim Software',
    kredensial: 'M.Kom.',
    foto: '/tim/fikri-baharuddin.jpg',
    urutan: 4,
  },
  {
    nama: 'Jabesh Nehemiah Wijaya',
    peran: 'Tim Software',
    kredensial: 'S.Kom., M.Kom.',
    foto: '/tim/jabesh-wijaya.jpg',
    urutan: 5,
  },
];

export const SEED_LAYANAN: LayananSeed[] = [
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

export const SEED_HERO: HeroSeed[] = [
  {
    urutan: 0,
    eyebrow: 'AI Center · Universitas Surabaya',
    judul: 'Pusat Riset & Layanan',
    judulAksen: 'Kecerdasan Artifisial',
    sub: 'Kursus AI/ML dan inference solution untuk sivitas akademika serta mitra industri.',
    // CTA disinkronkan dengan src/data/hero.ts (frontend). Link konsultasi WA
    // memakai nomor + pesan statis situs lama (lihat src/data/kontak.ts).
    ctaPrimer: {
      label: 'Jadwalkan Konsultasi AI',
      to: 'https://wa.me/62895634222240?text=Halo%20Ubaya%20AI%20Center%2C%20saya%20ingin%20berdiskusi%20mengenai%20layanan%2Fkerja%20sama%20AI.',
    },
    ctaSekunder: { label: 'Lihat Berita', to: '/berita' },
    badgeJudul: 'AI Center Ubaya',
    badgeSub: 'Riset · Pelatihan · Layanan',
    image: '/hero-1-1600.webp',
    srcSet: '/hero-1-800.webp 800w, /hero-1-1600.webp 1600w',
    sizes: '100vw',
  },
  {
    urutan: 1,
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
    // PROGRESS 2: layout image-left dicabut dari data (konsul 2 Okt — user memutuskan
    // slide 2 kembali default; kolom `layout` di DB tetap ada, semua isinya null).
    sizes: '100vw',
  },
];

// Sinkron dengan src/data/klien.ts (frontend) — aturan seed = data frontend,
// supaya tampilan "Klien Kami" sama persis dengan atau tanpa backend.
// TODO_KONTEN: nama FTB/CAW/Ubaya masih placeholder — konfirmasi nama resmi
// + bidang ke user sebelum rilis.
export const SEED_KLIEN: KlienSeed[] = [
  { nama: 'FTB', bidang: 'Mitra Fakultas (placeholder)', urutan: 0 },
  { nama: 'CAW', bidang: 'Mitra (placeholder)', urutan: 1 },
  { nama: 'Ubaya', bidang: 'Universitas Surabaya', urutan: 2 },
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

/** Data kursus — disalin dari `kursusDummy` frontend (src/data/pelatihan.ts). */
export const SEED_KURSUS: KursusSeed[] = [
  {
    urutan: 0,
    kode: 'R01',
    target: ['Mahasiswa', 'Dosen', 'Masyarakat umum'],
    judul: 'AI untuk Mencari dan Mengelola Referensi Jurnal',
    deskripsi:
      'Bangun alur kerja riset yang lebih terarah dengan bantuan AI, mulai dari menemukan jurnal hingga ' +
      'mengelola sitasi secara bertanggung jawab.',
    tentang:
      'Kursus praktis untuk mahasiswa, dosen, dan masyarakat umum yang ingin memakai AI sebagai alat bantu ' +
      'riset tanpa mengabaikan akurasi, etika, dan integritas akademik.',
    durasi: '4 sesi',
    level: 'Pemula',
    format: 'Online mandiri',
    instruktur: 'Tim Riset Ubaya AI Center',
    peran: 'Pengajar dan praktisi riset AI',
    inisial: 'RA',
    hasil: [
      'Merumuskan kata kunci dan query akademik',
      'Menguji relevansi sumber dengan tools AI',
      'Mengenali halusinasi dan referensi palsu',
      'Mengelola sitasi dengan rapi',
    ],
    modul: [
      {
        judul: 'Merumuskan pertanyaan dan kata kunci riset',
        deskripsi: 'Ubah topik menjadi pertanyaan riset dan query akademik yang terarah.',
        meta: '4 video · 35 menit',
      },
      {
        judul: 'Mencari jurnal ilmiah dengan Semantic Scholar',
        deskripsi: 'Temukan sumber primer, telusuri sitasi, dan buat daftar bacaan awal.',
        meta: '5 video · 48 menit',
      },
      {
        judul: 'Menguji relevansi dengan Consensus dan Elicit',
        deskripsi: 'Bandingkan temuan AI dengan isi jurnal dan cek kualitas buktinya.',
        meta: '4 video · 42 menit',
      },
      {
        judul: 'Meringkas jurnal dan mengelola sitasi',
        deskripsi: 'Buat ringkasan berbasis konteks dan rapikan pustaka dengan Zotero atau Mendeley.',
        meta: '5 video · 55 menit',
      },
    ],
  },
  {
    urutan: 1,
    kode: 'E01',
    target: ['Guru', 'Dosen', 'Masyarakat umum'],
    judul: 'Merancang Pembelajaran dengan AI',
    deskripsi:
      'Rancang aktivitas kelas, asesmen, dan umpan balik yang lebih personal dengan AI yang kritis dan ' +
      'bertanggung jawab.',
    tentang:
      'Program untuk pendidik yang ingin mengintegrasikan AI ke dalam perencanaan dan praktik pembelajaran ' +
      'secara efektif.',
    durasi: '3 sesi',
    level: 'Pemula',
    format: 'Online mandiri',
    instruktur: 'Tim Edukasi Ubaya AI Center',
    peran: 'Pengajar dan fasilitator pendidikan',
    inisial: 'ED',
    hasil: [
      'Menyusun ide pembelajaran dengan AI',
      'Membuat asesmen yang lebih adaptif',
      'Menguji kualitas output AI',
      'Menjaga etika dan privasi peserta didik',
    ],
    modul: [
      {
        judul: 'Memetakan kebutuhan belajar dan tujuan kelas',
        deskripsi: 'Tentukan tujuan belajar dan konteks peserta didik sebelum memakai AI.',
        meta: '4 video · 35 menit',
      },
      {
        judul: 'Menyusun materi serta aktivitas pembelajaran',
        deskripsi: 'Kembangkan bahan ajar, aktivitas, dan contoh yang relevan.',
        meta: '5 video · 45 menit',
      },
      {
        judul: 'Membuat asesmen dan rubrik dengan AI',
        deskripsi: 'Rancang asesmen, rubrik, dan umpan balik yang tetap dikontrol pendidik.',
        meta: '4 video · 40 menit',
      },
    ],
  },
  {
    urutan: 2,
    kode: 'P01',
    target: ['Mahasiswa', 'Masyarakat umum'],
    judul: 'Produktivitas Akademik dengan AI',
    deskripsi:
      'Bangun alur kerja untuk brainstorming, menulis, menganalisis data, dan mempresentasikan ide tanpa ' +
      'mengorbankan integritas akademik.',
    tentang:
      'Kursus fundamental untuk membangun kebiasaan kerja yang lebih produktif dengan AI, dari ide awal ' +
      'hingga presentasi yang terstruktur.',
    durasi: '3 sesi',
    level: 'Pemula',
    format: 'Online mandiri',
    instruktur: 'Tim Talenta Ubaya AI Center',
    peran: 'Pengajar dan mentor produktivitas AI',
    inisial: 'TA',
    hasil: [
      'Membuat workflow kerja dengan AI',
      'Mengolah ide dan data secara terstruktur',
      'Memeriksa kualitas tulisan dan analisis',
      'Menggunakan AI secara jujur dan bertanggung jawab',
    ],
    modul: [
      {
        judul: 'Brainstorming dan perencanaan tugas',
        deskripsi: 'Pecah tugas besar menjadi langkah kerja yang jelas dan realistis.',
        meta: '4 video · 32 menit',
      },
      {
        judul: 'Menulis, menyunting, dan memeriksa ide',
        deskripsi: 'Gunakan AI sebagai partner berpikir tanpa menggantikan suara penulis.',
        meta: '5 video · 46 menit',
      },
      {
        judul: 'Menganalisis data dan menyajikan temuan',
        deskripsi: 'Ubah data dan ide menjadi kesimpulan serta presentasi yang mudah dipahami.',
        meta: '4 video · 43 menit',
      },
    ],
  },
];

/** Isi ulang semua tabel dummy (hapus dulu → idempoten & deterministik). */
export async function runSeed(db: Db): Promise<void> {
  await db.delete(berita);
  await db.delete(dokumentasi);
  await db.delete(tim);
  await db.delete(layanan);
  await db.delete(heroSlides);
  await db.delete(klien);
  await db.delete(testimoni);
  await db.delete(kursus);
  await db.delete(profil);

  if (SEED_BERITA.length > 0) await db.insert(berita).values(SEED_BERITA);
  if (SEED_DOKUMENTASI.length > 0) await db.insert(dokumentasi).values(SEED_DOKUMENTASI);
  if (SEED_TIM.length > 0) await db.insert(tim).values(SEED_TIM);
  if (SEED_LAYANAN.length > 0) await db.insert(layanan).values(SEED_LAYANAN);
  if (SEED_HERO.length > 0) await db.insert(heroSlides).values(SEED_HERO);
  if (SEED_KLIEN.length > 0) await db.insert(klien).values(SEED_KLIEN);
  if (SEED_TESTIMONI.length > 0) await db.insert(testimoni).values(SEED_TESTIMONI);
  if (SEED_KURSUS.length > 0) await db.insert(kursus).values(SEED_KURSUS);
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
