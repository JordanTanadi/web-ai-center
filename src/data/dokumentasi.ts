// Konten Dokumentasi Kegiatan.
// Data dummy = FALLBACK untuk backend (GET /api/dokumentasi via useApiDaftar/useApiObjek):
// dipakai bila VITE_API_BASE_URL kosong atau request gagal — sumber utama ada di DB.
//
// Konsul PROGRESS 2: 6 karya portofolio ikut sebagai entri dokumentasi biasa
// (punya `tanggal` → mengikuti urutan "3 terbaru" di beranda & halaman dokumentasi).
import { portofolioDummy } from './portofolio.ts';

export interface DokumentasiItem {
  slug: string;
  judul: string;
  deskripsi: string;
  tanggal: string; // ISO date
  kategori: string;
  /** Path/URL gambar (opsional) — dikirim kolom `gambar` tabel dokumentasi. */
  gambar?: string;
}

// Tanggal terbit karya — dipilih tersebar di antara tanggal kegiatan agar campuran
// karya & kegiatan sama-sama tampil pada 3 entri terbaru.
const tanggalKarya: Record<string, string> = {
  'klasifikasi-xray-pneumonia': '2026-09-15',
  'implan-gigi-otomatis': '2026-08-20',
  'algae-finder': '2026-07-28',
  'translator-bahasa-isyarat': '2026-07-02',
  'deteksi-cacat-las': '2026-05-28',
  'deteksi-kesegaran-ikan': '2026-04-15',
};

const karyaSebagaiDokumentasi: DokumentasiItem[] = portofolioDummy.map((k) => ({
  slug: k.slug,
  judul: k.judul,
  deskripsi: k.deskripsi,
  tanggal: tanggalKarya[k.slug],
  kategori: k.kategori,
  gambar: k.gambar,
}));

export const dokumentasiDummy: DokumentasiItem[] = [
  {
    slug: 'workshop-pengenalan-gpu-lab',
    judul: 'Workshop Pengenalan GPU Lab',
    deskripsi: 'Dokumentasi workshop pengenalan akses dan antrean GPU lab AI Center.',
    tanggal: '2026-07-15',
    kategori: 'Workshop',
  },
  {
    slug: 'kunjungan-industri-semester-genap',
    judul: 'Kunjungan Industri Semester Genap',
    deskripsi: 'Dokumentasi kunjungan industri ke AI Center Ubaya.',
    tanggal: '2026-06-10',
    kategori: 'Kunjungan',
  },
  {
    slug: 'demo-inference-solution-mitra',
    judul: 'Demo Inference Solution untuk Mitra',
    deskripsi: 'Dokumentasi sesi demo deployment model untuk mitra industri.',
    tanggal: '2026-08-28',
    kategori: 'Demo',
  },
  ...karyaSebagaiDokumentasi,
];

export function getDokumentasiBySlug(slug: string): DokumentasiItem | undefined {
  if (!slug) return undefined;
  return dokumentasiDummy.find((d) => d.slug === slug);
}
