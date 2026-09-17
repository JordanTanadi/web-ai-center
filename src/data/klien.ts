// TODO_BACKEND: ganti data dummy ini dengan fetch ke API backend (mis. GET /api/klien).
export interface Klien {
  nama: string;
  bidang: string;
}

export const klienDummy: Klien[] = [
  { nama: 'PT Sinar Teknologi', bidang: 'Teknologi' },
  { nama: 'CV Data Prima', bidang: 'Konsultan Data' },
  { nama: 'Dinas Pendidikan Kota Surabaya', bidang: 'Pemerintahan' },
  { nama: 'PT Karya Digital', bidang: 'Software House' },
  { nama: 'Yayasan Pendidikan Ubaya', bidang: 'Pendidikan' },
  { nama: 'PT Cloud Nusantara', bidang: 'Infrastruktur' },
];
