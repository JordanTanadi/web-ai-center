// Konten halaman Pelatihan — migrasi dari situs lama:
// - pelatihan.html (stats, katalog intro, filter kategori, modul unggulan R01, blok institusi)
// - detail-kursus.html (objek `fallbackCourses`: R01, E01, P01 lengkap dengan modul & hasil,
//   plus kartu akses & sidebar "Informasi kursus" untuk halaman detail per kursus)
// Katalog & detail kursus kini diambil dari backend (GET /api/kursus dan
// GET /api/kursus/:kode via useApiDaftar/useApiObjek di LayananDetail &
// PelatihanDetail) — array `kursusDummy` di file ini jadi fallback-nya.
// Teks statis di file ini (stats, panel, intro katalog, modul unggulan, dst.)
// tetap hardcoded; kontrak field kursus sama dengan sini.
// TODO_KONTEN: level/format/instruktur/sertifikat di bawah adalah placeholder
// migrasi situs lama; video & kuis per modul belum terisi. Isian user →
// docs/data-kursus.md (diisi manual, lalu saya sinkronkan ke kode + seed).
import { buildWaLink, kontakDummy } from './kontak.ts';

/** Satu soal kuis per modul (`kunci` = index opsi yang benar). */
export interface Soal {
  pertanyaan: string;
  opsi: string[];
  kunci: number;
}

export interface Modul {
  judul: string;
  deskripsi: string;
  /** Meta tampil, mis. '4 video · 35 menit'. */
  meta: string;
  /** URL video lesson (opsional dari admin); null/absen = video menyusul. */
  video?: string | null;
  /** Kuis per modul (opsional dari admin); kosong = checkpoint dummy. */
  quiz?: Soal[];
}

export interface Kursus {
  /** Kode kursus situs lama, mis. 'R01' (dibuat otomatis oleh plugin WordPress). */
  kode: string;
  /** Kategori untuk filter — subset label dari `kategoriKursus`. */
  target: string[];
  judul: string;
  deskripsi: string;
  /** Deskripsi panjang "Tentang kursus ini" (detail-kursus.html, `about`). */
  tentang: string;
  /** Durasi program, mis. '4 sesi'. */
  durasi: string;
  /** Level kursus — default statis situs lama. */
  level: string;
  /** Format belajar — default statis situs lama. */
  format: string;
  instruktur: string;
  peran: string;
  /** Inisial instruktur untuk avatar (detail-kursus.html, `initials`). */
  inisial: string;
  /** Tujuan pembelajaran (hasil) kursus. */
  hasil: string[];
  /** Daftar modul kursus. */
  modul: Modul[];
}

/** Chip filter katalog — label & nilai persis halaman lama. */
export const kategoriKursus = [
  { label: 'Semua program', nilai: 'all' },
  { label: 'Mahasiswa', nilai: 'mahasiswa' },
  { label: 'Dosen', nilai: 'dosen' },
  { label: 'Guru', nilai: 'guru' },
  { label: 'Masyarakat umum', nilai: 'umum' },
] as const;

const labelDariNilai: Record<string, string> = {
  mahasiswa: 'Mahasiswa',
  dosen: 'Dosen',
  guru: 'Guru',
  umum: 'Masyarakat umum',
};

/**
 * Nilai filter 'all' cocok untuk semua kursus.
 * Nilai yang tidak dikenal (mis. '') dianggap TIDAK cocok — gagal eksplisit,
 * bukan diam-diam menampilkan semua kursus.
 */
export function kursusCocokFilter(kursus: Kursus, nilai: string): boolean {
  if (nilai === 'all') return true;
  const label = labelDariNilai[nilai];
  if (!label) return false;
  return kursus.target.includes(label);
}

/** Statistik hero pelatihan (pelatihan.html, bagian `.stat`). */
export const statsPelatihan = [
  { nilai: 'Terstruktur', label: 'Materi bertahap' },
  { nilai: 'Praktis', label: 'Latihan berbasis kasus' },
  { nilai: 'Fleksibel', label: 'Online & tatap muka' },
];

/** Panel hero pelatihan dengan ringkasan pendekatan belajar. */
export const panelCaraBelajar = {
  kicker: 'Pendekatan belajar',
  judul: 'Dari konsep menuju penerapan.',
  deskripsi:
    'Setiap program memadukan konsep inti, latihan terarah, dan studi kasus agar peserta dapat ' +
    'menerapkan AI secara bertanggung jawab dalam konteks akademik maupun profesional.',
};

/** Tombol hero pelatihan yang mengarah ke katalog dan konsultasi tim. */
export const aksiHeroPelatihan = [
  { label: 'Lihat program pelatihan', href: '#katalog' },
  { label: 'Konsultasi pelatihan tim', href: '#layanan-kustom' },
] as const;

/** Navigasi & copy bagian Katalog kursus (pelatihan.html, `#katalog`). */
export const katalogIntro = {
  eyebrow: 'Katalog kursus',
  judul: 'Pilih program sesuai kebutuhan',
  sub: 'Pelajari AI melalui materi bertahap dan latihan yang relevan untuk kegiatan akademik maupun profesional.',
  kosong: 'Belum ada program untuk kategori ini.',
};

/** Blok Modul unggulan (pelatihan.html, `#unggulan`) — konten statis situs lama. */
export const modulUnggulan = {
  eyebrow: 'Modul unggulan · R01',
  judul: 'AI untuk mencari referensi jurnal',
  deskripsi:
    'Program ini membantu peserta membangun kebiasaan riset yang lebih terarah, mulai dari merumuskan ' +
    'pertanyaan hingga menyusun pustaka yang dapat dipertanggungjawabkan.',
  topik: [
    'Merumuskan kata kunci dan query akademik',
    'Mencari jurnal dengan Semantic Scholar dan Google Scholar',
    'Menguji relevansi menggunakan Consensus dan Elicit',
    'Meringkas jurnal tanpa kehilangan konteks',
    'Mengenali halusinasi dan referensi palsu',
    'Mengelola sitasi dengan Zotero atau Mendeley',
  ],
  catatan: 'Materi lengkap tersedia setelah pendaftaran.',
  catatanDetail:
    'Preview modul dapat dilihat publik. Video, PDF, latihan, dan kuis akan terbuka setelah pembayaran terverifikasi.',
};

/** Blok penutup "Untuk institusi" (pelatihan.html). */
export const institusiPelatihan = {
  kicker: 'Untuk institusi',
  judul: 'Butuh pelatihan yang sesuai kebutuhan tim?',
  deskripsi:
    'Ubaya AI Center dapat menyusun workshop, bootcamp, atau pendampingan khusus untuk sekolah, kampus, ' +
    'komunitas, dan organisasi.',
  cta: 'Diskusikan kebutuhan',
};

/** Kartu "Akses kursus" di halaman detail (detail-kursus.html, aside `.enroll`). */
export const aksesKursus = {
  label: 'Akses kursus',
  judul: 'Preview tersedia',
  // Teks sama dengan catatan modul unggulan di katalog — satu sumber agar tidak beda versi.
  catatan: modulUnggulan.catatanDetail,
  cta: 'Tanya & daftar via WhatsApp',
};

/** Sidebar "Informasi kursus" (detail-kursus.html, aside `.side-box`). */
export const infoKursus = [
  { label: 'Penyedia', nilai: 'Ubaya AI Center' },
  { label: 'Sertifikat', nilai: 'Tersedia' },
  { label: 'Akses materi', nilai: 'Online' },
  { label: 'Bahasa', nilai: 'Indonesia' },
];

export const kursusDummy: Kursus[] = [
  {
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

/**
 * Cari kursus untuk halaman detail — kode case-insensitive
 * karena URL lama memakai slug kecil ('r01').
 */
export function kursusDariKode(kode: string): Kursus | undefined {
  const bersih = kode.trim().toUpperCase();
  return kursusDummy.find((k) => k.kode === bersih);
}

/** Label audiens persis halaman lama: 'Mahasiswa · Dosen · Umum' (Masyarakat umum → Umum). */
export function audienceLabel(kursus: Kursus): string {
  return kursus.target.map((t) => (t === 'Masyarakat umum' ? 'Umum' : t)).join(' · ');
}

/** Link WhatsApp bertanya satu program — dipakai di kartu akses halaman detail kursus. */
export function waTanyaProgram(kode: string, judul: string): string {
  return buildWaLink(
    kontakDummy.whatsappNumber,
    `${kontakDummy.whatsappGreeting} Saya tertarik dengan program ${kode} (${judul}).`,
  );
}

/** Link WhatsApp untuk diskusi pelatihan kustom institusi/komunitas. */
export function waPelatihanInstitusi(): string {
  return buildWaLink(
    kontakDummy.whatsappNumber,
    `${kontakDummy.whatsappGreeting} Saya ingin merancang pelatihan untuk tim/institusi kami.`,
  );
}
