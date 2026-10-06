// Data dummy = FALLBACK untuk backend (GET /api/testimoni via useApiDaftar di Beranda):
// dipakai bila VITE_API_BASE_URL kosong atau request gagal.
export interface Testimoni {
  /** Id baris DB — hanya ada pada data backend (kunci CRUD tab "Testimoni"
   *  di admin); data dummy tidak memilikinya. */
  id?: number;
  nama: string;
  peran: string;
  kutipan: string;
  /** Urutan tampil (asc) — hanya ada pada data backend. */
  urutan?: number;
}

export const testimoniDummy: Testimoni[] = [
  {
    nama: 'Peserta Pelatihan ML',
    peran: 'Mahasiswa',
    kutipan:
      'Materi pelatihan runtut dan langsung praktik. Akses GPU lab membuat eksperimen tugas akhir jauh lebih cepat.',
  },
  {
    nama: 'Mitra Industri',
    peran: 'Pengguna Inference Solution',
    kutipan:
      'Proses deployment model didampingi sampai jalan di infrastruktur kami. Komunikasi tim responsif dan dokumentasinya jelas.',
  },
  {
    nama: 'Dosen Peneliti',
    peran: 'Peneliti',
    kutipan:
      'Pendampingan AI Center sangat membantu riset. Tim responsif dan memberi dukungan teknis saat ada kendala.',
  },
];
