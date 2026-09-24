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
  Layanan,
  Profil,
  Testimoni,
} from '../api/types';
import type { Pagination } from '../lib/query';

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
}

export interface DokumentasiRepository {
  list(params: DokumentasiListParams): Promise<DokumentasiItem[]>;
  findBySlug(slug: string): Promise<DokumentasiItem | null>;
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
}
