// TODO_BACKEND: ganti data dummy ini dengan fetch ke API backend (mis. GET /api/tim).
export interface AnggotaTim {
  nama: string;
  peran: string;
  kredensial?: string;
  foto?: string;
}

export const timDummy: AnggotaTim[] = [
  { nama: 'Nama Kepala AI Center', peran: 'Kepala AI Center', kredensial: 'Ph.D.' },
  { nama: 'Nama Koordinator Riset', peran: 'Koordinator Riset', kredensial: 'M.Kom.' },
  { nama: 'Nama Koordinator Pelatihan', peran: 'Koordinator Pelatihan', kredensial: 'M.Kom.' },
];
