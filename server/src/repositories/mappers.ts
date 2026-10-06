/**
 * Mapper baris DB → objek respons API.
 * Murni (tanpa DB) supaya bisa diuji langsung; aturan utama:
 * - nilai NULL kolom opsional → properti di-omitted (undefined),
 *   sehingga JSON.stringify tidak mengirim `null` yang tidak diharapkan frontend.
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
import type { heroSlides, klien, kursus, layanan, profil, tim, testimoni, berita, dokumentasi } from '../db/schema';

type BeritaRow = typeof berita.$inferSelect;
type DokumentasiRow = typeof dokumentasi.$inferSelect;
type TimRow = typeof tim.$inferSelect;
type LayananRow = typeof layanan.$inferSelect;
type HeroRow = typeof heroSlides.$inferSelect;
type KlienRow = typeof klien.$inferSelect;
type TestimoniRow = typeof testimoni.$inferSelect;
type ProfilRow = typeof profil.$inferSelect;
type KursusRow = typeof kursus.$inferSelect;

export function toBeritaItem(row: BeritaRow): BeritaItem {
  return {
    slug: row.slug,
    judul: row.judul,
    ringkasan: row.ringkasan,
    isi: row.isi,
    tanggal: row.tanggal,
    ...(row.gambar !== null ? { gambar: row.gambar } : {}),
    penulis: row.penulis,
  };
}

export function toDokumentasiItem(row: DokumentasiRow): DokumentasiItem {
  return {
    slug: row.slug,
    judul: row.judul,
    deskripsi: row.deskripsi,
    tanggal: row.tanggal,
    kategori: row.kategori,
    ...(row.gambar !== null ? { gambar: row.gambar } : {}),
  };
}

export function toAnggotaTim(row: TimRow): AnggotaTim {
  return {
    id: row.id,
    nama: row.nama,
    peran: row.peran,
    ...(row.kredensial !== null ? { kredensial: row.kredensial } : {}),
    ...(row.foto !== null ? { foto: row.foto } : {}),
    urutan: row.urutan,
  };
}

export function toLayanan(row: LayananRow): Layanan {
  return {
    slug: row.slug,
    nama: row.nama,
    tagline: row.tagline,
    deskripsi: row.deskripsi,
    fitur: row.fitur,
  };
}

export function toHeroSlide(row: HeroRow): HeroSlide {
  return {
    eyebrow: row.eyebrow,
    judul: row.judul,
    judulAksen: row.judulAksen,
    sub: row.sub,
    ctaPrimer: row.ctaPrimer,
    ctaSekunder: row.ctaSekunder,
    badgeJudul: row.badgeJudul,
    badgeSub: row.badgeSub,
    ...(row.image !== null ? { image: row.image } : {}),
    ...(row.srcSet !== null ? { srcSet: row.srcSet } : {}),
    ...(row.sizes !== null ? { sizes: row.sizes } : {}),
    ...(row.layout !== null ? { layout: row.layout } : {}),
  };
}

export function toKlien(row: KlienRow): Klien {
  return { nama: row.nama, bidang: row.bidang };
}

export function toTestimoni(row: TestimoniRow): Testimoni {
  return { nama: row.nama, peran: row.peran, kutipan: row.kutipan };
}

export function toProfil(row: ProfilRow): Profil {
  return {
    nama: row.nama,
    tagline: row.tagline,
    ringkasan: row.ringkasan,
    alamat: row.alamat,
    email: row.email,
    telepon: row.telepon,
    ...(row.visi !== null ? { visi: row.visi } : {}),
    ...(row.misi !== null ? { misi: row.misi } : {}),
    ...(row.statistik !== null ? { statistik: row.statistik } : {}),
  };
}

export function toKursus(row: KursusRow): Kursus {
  return {
    kode: row.kode,
    target: row.target,
    judul: row.judul,
    deskripsi: row.deskripsi,
    tentang: row.tentang,
    durasi: row.durasi,
    level: row.level,
    format: row.format,
    instruktur: row.instruktur,
    peran: row.peran,
    inisial: row.inisial,
    hasil: row.hasil,
    modul: row.modul,
  };
}
