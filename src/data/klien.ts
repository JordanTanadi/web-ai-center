// Data untuk section "Our Client" di Beranda — sudah di-wire di Beranda.tsx
// via useApiDaftar('/klien', klienDummy).
// TODO_KONTEN: nama FTB/CAW/Ubaya masih placeholder sesuai spec — konfirmasi
// nama resmi + bidang ke user sebelum rilis.
export interface Klien {
  nama: string;
  bidang: string;
}

export const klienDummy: Klien[] = [
  { nama: 'FTB', bidang: 'Mitra Fakultas (placeholder)' },
  { nama: 'CAW', bidang: 'Mitra (placeholder)' },
  { nama: 'Ubaya', bidang: 'Universitas Surabaya' },
];
