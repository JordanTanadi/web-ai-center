/**
 * Tipe respons API — kontrak sama persis dengan interface data frontend
 * (src/data/*.ts). Bila frontend mengubah interface, ubah juga file ini
 * (terlindungi unit test di src/repositories/mappers.test.ts).
 */

/** ↔ src/data/berita.ts BeritaItem */
export interface BeritaItem {
  slug: string;
  judul: string;
  ringkasan: string;
  isi: string;
  /** Tanggal ISO (YYYY-MM-DD). */
  tanggal: string;
  gambar?: string;
  penulis: string;
}

/** ↔ src/data/dokumentasi.ts DokumentasiItem */
export interface DokumentasiItem {
  slug: string;
  judul: string;
  deskripsi: string;
  /** Tanggal ISO (YYYY-MM-DD). */
  tanggal: string;
  kategori: string;
  gambar?: string;
}

/** ↔ src/data/tim.ts AnggotaTim */
export interface AnggotaTim {
  nama: string;
  peran: string;
  kredensial?: string;
  foto?: string;
}

/** ↔ src/data/layanan.ts Layanan */
export interface Layanan {
  slug: string;
  nama: string;
  tagline: string;
  deskripsi: string;
  fitur: string[];
}

/** ↔ src/data/hero.ts HeroSlide CTA */
export interface HeroCta {
  label: string;
  to: string;
}

/** ↔ src/data/hero.ts HeroSlide */
export interface HeroSlide {
  eyebrow: string;
  judul: string;
  judulAksen: string;
  sub: string;
  ctaPrimer: HeroCta;
  ctaSekunder: HeroCta;
  badgeJudul: string;
  badgeSub: string;
  image?: string;
  srcSet?: string;
  sizes?: string;
}

/** ↔ src/data/klien.ts Klien */
export interface Klien {
  nama: string;
  bidang: string;
}

/** ↔ src/data/testimoni.ts Testimoni */
export interface Testimoni {
  nama: string;
  peran: string;
  kutipan: string;
}

/** ↔ TentangKami + kontak footer SiteLayout (baris tunggal, id = 1). */
export interface Profil {
  nama: string;
  tagline: string;
  ringkasan: string;
  alamat: string;
  email: string;
  telepon: string;
  visi?: string;
  misi?: string;
  statistik?: Array<{ label: string; value: string }>;
}

/** ↔ src/data/pelatihan.ts Modul (kursus) */
export interface ModulKursus {
  judul: string;
  deskripsi: string;
  meta: string;
}

/** ↔ src/data/pelatihan.ts Kursus */
export interface Kursus {
  /** Kode kursus, mis. 'R01' (unik, disimpan huruf besar). */
  kode: string;
  /** Label audiens untuk filter katalog, mis. ['Mahasiswa', 'Dosen']. */
  target: string[];
  judul: string;
  deskripsi: string;
  tentang: string;
  durasi: string;
  level: string;
  format: string;
  instruktur: string;
  peran: string;
  inisial: string;
  hasil: string[];
  modul: ModulKursus[];
}

/** Bentuk standar daftar — { items: [...] } sesuai komentar TODO_BACKEND. */
export interface ListResponse<T> {
  items: T[];
}
