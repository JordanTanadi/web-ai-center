/**
 * Implementasi repository dengan Drizzle ORM (PostgreSQL).
 * Semua fungsi tipis: query + mapper — tanpa logika bisnis.
 * Disuntikkan ke route lewat `Repositories`, jadi test route tidak menyentuh file ini.
 */
import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import type { Db } from '../db/client';
import { berita, dokumentasi, heroSlides, klien, kursus, layanan, profil, tim, testimoni } from '../db/schema';
import { toLikePattern } from '../lib/query';
import {
  toAnggotaTim,
  toBeritaItem,
  toDokumentasiItem,
  toHeroSlide,
  toKlien,
  toKursus,
  toLayanan,
  toProfil,
  toTestimoni,
} from './mappers';
import type {
  DokumentasiRepository,
  HeroRepository,
  KlienRepository,
  KursusRepository,
  LayananRepository,
  ProfilRepository,
  Repositories,
  TestimoniRepository,
  TimRepository,
  BeritaRepository,
} from './types';

/** Terapkan LIMIT/OFFSET bila pagination aktif. */
function applyPagination<T extends { limit(n: number): unknown; offset(n: number): unknown }>(
  query: T,
  pagination: { limit: number | null; offset: number | null },
): T {
  if (pagination.limit === null || pagination.offset === null) return query;
  // Kedua method mengembalikan rantai query baru pada Drizzle; panggil berurutan.
  const withLimit = query.limit(pagination.limit) as T;
  return withLimit.offset(pagination.offset) as T;
}

export function createRepositories(db: Db): Repositories {
  const beritaRepo: BeritaRepository = {
    async list({ q, pagination, order }) {
      const search =
        q === null
          ? undefined
          : or(
              ilike(berita.judul, toLikePattern(q)),
              ilike(berita.ringkasan, toLikePattern(q)),
              ilike(berita.penulis, toLikePattern(q)),
            );
      const base = db.select().from(berita).where(search);
      const ordered =
        order === 'asc'
          ? base.orderBy(asc(berita.tanggal), desc(berita.id))
          : base.orderBy(desc(berita.tanggal), desc(berita.id));
      const rows = await applyPagination(ordered, pagination);
      return rows.map(toBeritaItem);
    },
    async findBySlug(slug) {
      if (slug === '') return null;
      const rows = await db.select().from(berita).where(eq(berita.slug, slug)).limit(1);
      return rows[0] !== undefined ? toBeritaItem(rows[0]) : null;
    },
    async create(slug, data) {
      const rows = await db
        .insert(berita)
        .values({
          slug,
          judul: data.judul,
          ringkasan: data.ringkasan,
          isi: data.isi,
          tanggal: data.tanggal,
          penulis: data.penulis,
          gambar: data.gambar,
        })
        .returning();
      return toBeritaItem(rows[0]);
    },
    async update(slug, data) {
      const rows = await db
        .update(berita)
        .set({
          judul: data.judul,
          ringkasan: data.ringkasan,
          isi: data.isi,
          tanggal: data.tanggal,
          penulis: data.penulis,
          gambar: data.gambar,
        })
        .where(eq(berita.slug, slug))
        .returning();
      return rows[0] !== undefined ? toBeritaItem(rows[0]) : null;
    },
    async remove(slug) {
      const rows = await db
        .delete(berita)
        .where(eq(berita.slug, slug))
        .returning({ id: berita.id });
      return rows.length > 0;
    },
  };

  const dokumentasiRepo: DokumentasiRepository = {
    async list({ q, pagination, order, kategori }) {
      const conditions = [];
      if (q !== null) {
        conditions.push(
          or(
            ilike(dokumentasi.judul, toLikePattern(q)),
            ilike(dokumentasi.deskripsi, toLikePattern(q)),
            ilike(dokumentasi.kategori, toLikePattern(q)),
          ),
        );
      }
      if (kategori !== null) conditions.push(eq(dokumentasi.kategori, kategori));
      const base = db
        .select()
        .from(dokumentasi)
        .where(conditions.length > 0 ? and(...conditions.filter((c) => c !== undefined)) : undefined);
      const ordered =
        order === 'asc'
          ? base.orderBy(asc(dokumentasi.tanggal), desc(dokumentasi.id))
          : base.orderBy(desc(dokumentasi.tanggal), desc(dokumentasi.id));
      const rows = await applyPagination(ordered, pagination);
      return rows.map(toDokumentasiItem);
    },
    async findBySlug(slug) {
      if (slug === '') return null;
      const rows = await db
        .select()
        .from(dokumentasi)
        .where(eq(dokumentasi.slug, slug))
        .limit(1);
      return rows[0] !== undefined ? toDokumentasiItem(rows[0]) : null;
    },
    async create(slug, data) {
      const rows = await db
        .insert(dokumentasi)
        .values({
          slug,
          judul: data.judul,
          deskripsi: data.deskripsi,
          tanggal: data.tanggal,
          kategori: data.kategori,
          gambar: data.gambar,
        })
        .returning();
      return toDokumentasiItem(rows[0]);
    },
    async update(slug, data) {
      const rows = await db
        .update(dokumentasi)
        .set({
          judul: data.judul,
          deskripsi: data.deskripsi,
          tanggal: data.tanggal,
          kategori: data.kategori,
          gambar: data.gambar,
        })
        .where(eq(dokumentasi.slug, slug))
        .returning();
      return rows[0] !== undefined ? toDokumentasiItem(rows[0]) : null;
    },
    async remove(slug) {
      const rows = await db
        .delete(dokumentasi)
        .where(eq(dokumentasi.slug, slug))
        .returning({ id: dokumentasi.id });
      return rows.length > 0;
    },
  };

  const timRepo: TimRepository = {
    async list({ q, pagination }) {
      const search =
        q === null
          ? undefined
          : or(
              ilike(tim.nama, toLikePattern(q)),
              ilike(tim.peran, toLikePattern(q)),
              ilike(tim.kredensial, toLikePattern(q)),
            );
      const base = db.select().from(tim).where(search).orderBy(asc(tim.urutan), asc(tim.id));
      const rows = await applyPagination(base, pagination);
      return rows.map(toAnggotaTim);
    },
  };

  const layananRepo: LayananRepository = {
    async list() {
      const rows = await db.select().from(layanan).orderBy(asc(layanan.id));
      return rows.map(toLayanan);
    },
    async findBySlug(slug) {
      if (slug === '') return null;
      const rows = await db.select().from(layanan).where(eq(layanan.slug, slug)).limit(1);
      return rows[0] !== undefined ? toLayanan(rows[0]) : null;
    },
  };

  const heroRepo: HeroRepository = {
    async list() {
      const rows = await db.select().from(heroSlides).orderBy(asc(heroSlides.urutan), asc(heroSlides.id));
      return rows.map(toHeroSlide);
    },
  };

  const klienRepo: KlienRepository = {
    async list() {
      const rows = await db.select().from(klien).orderBy(asc(klien.urutan), asc(klien.id));
      return rows.map(toKlien);
    },
  };

  const testimoniRepo: TestimoniRepository = {
    async list() {
      const rows = await db
        .select()
        .from(testimoni)
        .orderBy(asc(testimoni.urutan), asc(testimoni.id));
      return rows.map(toTestimoni);
    },
  };

  const profilRepo: ProfilRepository = {
    async get() {
      const rows = await db.select().from(profil).where(eq(profil.id, 1)).limit(1);
      return rows[0] !== undefined ? toProfil(rows[0]) : null;
    },
  };

  const kursusRepo: KursusRepository = {
    async list({ q, pagination }) {
      const search =
        q === null
          ? undefined
          : or(
              ilike(kursus.judul, toLikePattern(q)),
              ilike(kursus.deskripsi, toLikePattern(q)),
              ilike(kursus.tentang, toLikePattern(q)),
              ilike(kursus.instruktur, toLikePattern(q)),
            );
      const base = db
        .select()
        .from(kursus)
        .where(search)
        .orderBy(asc(kursus.urutan), asc(kursus.id));
      const rows = await applyPagination(base, pagination);
      return rows.map(toKursus);
    },
    async findByKode(kode) {
      const bersih = kode.trim().toUpperCase();
      if (bersih === '') return null;
      // eq dengan nilai sudah di-uppercase = pencocokan case-insensitive
      // untuk kode tersimpan 'R01' (mirror frontend kursusDariKode).
      const rows = await db.select().from(kursus).where(eq(kursus.kode, bersih)).limit(1);
      return rows[0] !== undefined ? toKursus(rows[0]) : null;
    },
  };

  return {
    berita: beritaRepo,
    dokumentasi: dokumentasiRepo,
    tim: timRepo,
    layanan: layananRepo,
    hero: heroRepo,
    klien: klienRepo,
    testimoni: testimoniRepo,
    profil: profilRepo,
    kursus: kursusRepo,
  };
}
