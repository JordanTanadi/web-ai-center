// TODO_BACKEND: ganti data dummy ini dengan fetch ke API backend (mis. GET /api/tim).
// Sumber: section "Tim Kami" di situs lama (index.html) — nama & peran asli tim.
export interface AnggotaTim {
  nama: string;
  peran: string;
  kredensial?: string;
  foto?: string;
}

export const timDummy: AnggotaTim[] = [
  { nama: 'Dr. Mohammad Farid Naufal', peran: 'Ketua' },
  { nama: 'Dr. Monica Widiasri', peran: 'Koordinator Riset & Edukasi' },
  { nama: 'Prof. Joko Siswantoro', peran: 'Tim Riset' },
  { nama: 'Marco Ariano Kristyanto', peran: 'Tim Hardware', kredensial: 'M.M., M.Kom.' },
  { nama: 'Fikri Baharuddin', peran: 'Tim Software', kredensial: 'M.Kom.' },
  { nama: 'Jabesh Nehemiah Wijaya', peran: 'Tim Software', kredensial: 'S.Kom., M.Kom.' },
];
