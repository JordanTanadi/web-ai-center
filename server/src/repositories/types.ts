/**
 * Interface repository — kontrak antara route (Elysia) dan lapisan DB.
 * Route hanya tahu interface ini; implementasi Drizzle disuntikkan di app.ts
 * sehingga unit test route bisa memakai fake repository tanpa DB.
 */
import type {
  AnggotaTim,
  BeritaItem,
  DokumentasiItem,
  HeroSlide,
  Klien,
  Kursus,
  Layanan,
  Profil,
  Testimoni,
} from '../api/types';
import type { Pagination } from '../lib/query';
// Input tulis admin (PROGRESS 2) hidup di lib/tulis — satu sumber kontrak
// validasi body, dipakai route & repository.
import type { InputBerita, InputDokumentasi, InputKursus } from '../lib/tulis';

/** Alias agar interface repository tidak perlu import langsung dari lib/tulis. */
export type BeritaInput = InputBerita;
export type DokumentasiInput = InputDokumentasi;
export type KursusInput = InputKursus;

export interface ListParams {
  /** Kata kunci pencarian; `null` = tanpa filter. */
  q: string | null;
  /** Hasil `parsePagination`. */
  pagination: Pagination;
  /** Urutan tanggal; hanya untuk berita/dokumentasi. */
  order?: 'asc' | 'desc';
}

export interface DokumentasiListParams extends ListParams {
  /** Filter kategori; `null` = semua. */
  kategori: string | null;
}

export interface BeritaRepository {
  list(params: ListParams): Promise<BeritaItem[]>;
  findBySlug(slug: string): Promise<BeritaItem | null>;
  /** Buat item baru (slug unik sudah dipastikan route); balikan item tersimpan. */
  create(slug: string, data: BeritaInput): Promise<BeritaItem>;
  /** Perbarui item berdasarkan slug; `null` bila slug tidak ditemukan. */
  update(slug: string, data: BeritaInput): Promise<BeritaItem | null>;
  /** Hapus item berdasarkan slug; `true` bila ada baris yang terhapus. */
  remove(slug: string): Promise<boolean>;
}

export interface DokumentasiRepository {
  list(params: DokumentasiListParams): Promise<DokumentasiItem[]>;
  findBySlug(slug: string): Promise<DokumentasiItem | null>;
  /** Buat item baru (slug unik sudah dipastikan route); balikan item tersimpan. */
  create(slug: string, data: DokumentasiInput): Promise<DokumentasiItem>;
  /** Perbarui item berdasarkan slug; `null` bila slug tidak ditemukan. */
  update(slug: string, data: DokumentasiInput): Promise<DokumentasiItem | null>;
  /** Hapus item berdasarkan slug; `true` bila ada baris yang terhapus. */
  remove(slug: string): Promise<boolean>;
}

export interface TimRepository {
  list(params: ListParams): Promise<AnggotaTim[]>;
}

export interface LayananRepository {
  list(): Promise<Layanan[]>;
  findBySlug(slug: string): Promise<Layanan | null>;
}

export interface HeroRepository {
  list(): Promise<HeroSlide[]>;
}

export interface KlienRepository {
  list(): Promise<Klien[]>;
}

export interface TestimoniRepository {
  list(): Promise<Testimoni[]>;
}

export interface ProfilRepository {
  /** Profil baris tunggal (id = 1); `null` bila belum di-seed. */
  get(): Promise<Profil | null>;
}

export interface KursusRepository {
  list(params: ListParams): Promise<Kursus[]>;
  /** Detail kursus; kode case-insensitive (URL lama memakai 'r01'). */
  findByKode(kode: string): Promise<Kursus | null>;
  /** Buat kursus (kode unik sudah dipastikan route). */
  create(data: KursusInput): Promise<Kursus>;
  /** Perbarui kursus berdasarkan kode; `null` bila tidak ditemukan. */
  update(kode: string, data: KursusInput): Promise<Kursus | null>;
  /** Hapus kursus berdasarkan kode; `true` bila ada baris yang terhapus. */
  remove(kode: string): Promise<boolean>;
}

/** Kumpulan semua repository yang disuntikkan ke route. */
export interface Repositories {
  berita: BeritaRepository;
  dokumentasi: DokumentasiRepository;
  tim: TimRepository;
  layanan: LayananRepository;
  hero: HeroRepository;
  klien: KlienRepository;
  testimoni: TestimoniRepository;
  profil: ProfilRepository;
  kursus: KursusRepository;
  /** Cek koneksi DB untuk `/api/health`; lempar bila DB tidak terjangkau. */
  ping: () => Promise<void>;
}
