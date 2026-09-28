// Data dummy = FALLBACK untuk backend (GET /api/tim via useApiDaftar di Tim):
// dipakai bila VITE_API_BASE_URL kosong atau request gagal — sumber utama ada di DB.
// Sumber: section "Tim Kami" di situs lama (index.html) — nama & peran asli tim.
// foto: diekstrak dari base64 di index.html situs lama ke public/tim/ (disetujui user).
export interface AnggotaTim {
  nama: string;
  peran: string;
  kredensial?: string;
  foto?: string;
}

export const timDummy: AnggotaTim[] = [
  { nama: 'Dr. Mohammad Farid Naufal', peran: 'Ketua', foto: '/tim/farid-naufal.jpg' },
  {
    nama: 'Dr. Monica Widiasri',
    peran: 'Koordinator Riset & Edukasi',
    foto: '/tim/monica-widiasri.jpg',
  },
  { nama: 'Prof. Joko Siswantoro', peran: 'Tim Riset', foto: '/tim/joko-siswantoro.jpg' },
  {
    nama: 'Marco Ariano Kristyanto',
    peran: 'Tim Hardware',
    kredensial: 'M.M., M.Kom.',
    foto: '/tim/marco-kristyanto.jpg',
  },
  {
    nama: 'Fikri Baharuddin',
    peran: 'Tim Software',
    kredensial: 'M.Kom.',
    foto: '/tim/fikri-baharuddin.jpg',
  },
  {
    nama: 'Jabesh Nehemiah Wijaya',
    peran: 'Tim Software',
    kredensial: 'S.Kom., M.Kom.',
    foto: '/tim/jabesh-wijaya.jpg',
  },
];
