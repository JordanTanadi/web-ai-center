import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Admin, { KATEGORI_LAINNYA, KEY_TOKEN_ADMIN, OPSI_KATEGORI } from './Admin.tsx';
import { ambilDaftar, ambilJson, kirimFileAdmin, kirimJsonAdmin } from '../lib/api.ts';
import { within } from '@testing-library/react';
import type { DokumentasiItem } from '../data/dokumentasi.ts';
import type { BeritaItem } from '../data/berita.ts';
import type { Kursus } from '../data/pelatihan.ts';
import type { KontenInference } from '../data/inference.ts';
import type { ProfilApi } from '../data/profil.ts';
import type { Testimoni } from '../data/testimoni.ts';
import type { HeroSlide } from '../data/hero.ts';
import type { Layanan } from '../data/layanan.ts';
import type { AnggotaTim } from '../data/tim.ts';

// Mock modul api: test deterministik tanpa backend (Admin memakai ambilDaftar
// untuk daftar, ambilJson untuk profil, kirimJsonAdmin/kirimFileAdmin untuk write).
vi.mock('../lib/api.ts', () => ({
  ambilDaftar: vi.fn(),
  ambilJson: vi.fn(),
  kirimJsonAdmin: vi.fn(),
  kirimFileAdmin: vi.fn(),
}));

const mockDaftar = vi.mocked(ambilDaftar);
const mockAmbilJson = vi.mocked(ambilJson);
const mockKirim = vi.mocked(kirimJsonAdmin);
const mockUnggah = vi.mocked(kirimFileAdmin);

const TOKEN = 'tok-abc';
const DOK: DokumentasiItem = {
  slug: 'xray-3d',
  judul: 'Deteksi X-Ray 3D',
  deskripsi: 'Deskripsi.',
  tanggal: '2026-09-15',
  kategori: 'Project',
};
const DOK2: DokumentasiItem = {
  slug: 'demo-inference',
  judul: 'Demo Inference',
  deskripsi: 'Deskripsi 2.',
  tanggal: '2026-08-28',
  kategori: 'Workshop',
};
const BERITA: BeritaItem = {
  slug: 'berita-1',
  judul: 'Berita Kampus',
  ringkasan: 'Ringkasan.',
  isi: 'Isi lengkap.',
  tanggal: '2026-08-01',
  penulis: 'Humas',
};
const KURSUS: Kursus = {
  kode: 'R01',
  target: ['Mahasiswa'],
  judul: 'Dasar ML',
  deskripsi: 'Deskripsi.',
  tentang: 'Tentang.',
  durasi: '4 sesi',
  level: 'Pemula',
  format: 'Online',
  instruktur: 'Tim',
  peran: 'Pengajar',
  inisial: 'T',
  hasil: ['Hasil 1'],
  modul: [{ judul: 'M1', deskripsi: 'D1', meta: '2 video' }],
};
/** Fixture anggota tim dari backend (membawa id & urutan — Prioritas 2). */
const ANGGOTA: AnggotaTim = {
  id: 1,
  nama: 'Dr. Contoh Saja',
  peran: 'Ketua',
  kredensial: 'Ph.D.',
  foto: '/tim/contoh.jpg',
  urutan: 0,
};
/** Fixture profil baris tunggal (GET/PUT /api/profil). */
const PROFIL: ProfilApi = {
  nama: 'AI Center Universitas Surabaya',
  tagline: 'Pusat riset AI Ubaya.',
  ringkasan: 'Ringkasan profil.',
  alamat: 'Gedung Perpustakaan LT.4',
  email: 'aicenter@unit.ubaya.ac.id',
  telepon: '0895-6342-22240',
  visi: 'Judul visi — Deskripsi visi.',
  misi: 'Poin satu.\nPoin dua.',
};

/** Fixture konten halaman inference (GET/PUT /api/inference). */
const KONTEN_INFERENCE: KontenInference = {
  judulApaItu: 'Apa itu Inference Solution?',
  deskripsiApaItu: 'Inference adalah tahap menjalankan model machine learning.',
  kebutuhan: ['Model belum dipakai tim lain', 'Butuh fitur AI di aplikasi'],
  alur: [
    { nomor: '01', judul: 'Konsultasi', deskripsi: 'Memetakan use case.' },
    { nomor: '02', judul: 'Deployment', deskripsi: 'Menjalankan model sebagai API.' },
  ],
  contohIntro: 'Beberapa produk AI Center:',
  contoh: [{ slug: 'algae-finder', judul: 'Algae Finder' }],
};

/** Render dengan sesi sudah ada di localStorage (langsung ke dashboard). */
async function renderDashboard(): Promise<void> {
  localStorage.setItem(KEY_TOKEN_ADMIN, TOKEN);
  render(<Admin />);
  await screen.findByRole('heading', { name: 'Dashboard Admin' });
}

/** Pilih "Lainnya (ketik sendiri)" di dropdown Kategori lalu ketik nilai custom. */
function isiKategoriSendiri(nilai: string): void {
  fireEvent.change(screen.getByLabelText(/^Kategori/), { target: { value: KATEGORI_LAINNYA } });
  fireEvent.change(screen.getByLabelText('Tulis kategori sendiri'), { target: { value: nilai } });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockDaftar.mockResolvedValue([DOK, DOK2] as never);
  // Default: GET /profil gagal (backend mati) → form profil dibiarkan kosong.
  mockAmbilJson.mockResolvedValue(null as never);
  mockKirim.mockResolvedValue({ token: TOKEN } as never);
});

describe('Admin — layar login', () => {
  it('tanpa sesi → form password, daftar tidak dimuat', () => {
    render(<Admin />);
    expect(screen.getByRole('heading', { name: 'Masuk Admin' })).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(mockDaftar).not.toHaveBeenCalled();
  });

  it('login sukses → token tersimpan, dashboard tampil, daftar dimuat', async () => {
    render(<Admin />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'katasandi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    await screen.findByRole('heading', { name: 'Dashboard Admin' });
    expect(localStorage.getItem(KEY_TOKEN_ADMIN)).toBe(TOKEN);
    expect(mockKirim).toHaveBeenCalledWith(
      '/admin/login',
      expect.objectContaining({ method: 'POST', body: { password: 'katasandi' } }),
    );
    // Tunggu item tampil dulu — efek muat daftar baru berjalan setelah render dashboard,
    // jadi assert mockDaftar SETELAHnya (hindari race saat beban CPU tinggi).
    expect(await screen.findByText('Deteksi X-Ray 3D')).toBeInTheDocument();
    expect(mockDaftar).toHaveBeenCalledWith('/dokumentasi', []);
  });

  it('login gagal → pesan role alert, tetap di layar login, tanpa token', async () => {
    mockKirim.mockRejectedValue(new Error('Password salah') as never);
    render(<Admin />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'salah' } });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Password salah');
    expect(localStorage.getItem(KEY_TOKEN_ADMIN)).toBeNull();
    expect(screen.getByRole('heading', { name: 'Masuk Admin' })).toBeInTheDocument();
    expect(mockDaftar).not.toHaveBeenCalled();
  });

  it('login diblokir rate-limit (429) → pesan server tampil, tetap di layar login', async () => {
    mockKirim.mockRejectedValue(
      new Error('Terlalu banyak percobaan login — coba lagi dalam 600 detik') as never,
    );
    render(<Admin />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'salah' } });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Terlalu banyak percobaan login');
    expect(localStorage.getItem(KEY_TOKEN_ADMIN)).toBeNull();
    expect(screen.getByRole('heading', { name: 'Masuk Admin' })).toBeInTheDocument();
    expect(mockDaftar).not.toHaveBeenCalled();
  });
});

describe('Admin — dashboard', () => {
  it('daftar kosong → pesan "Belum ada konten"', async () => {
    mockDaftar.mockResolvedValue([] as never);
    await renderDashboard();
    expect(screen.getByText('Belum ada konten Dokumentasi.')).toBeInTheDocument();
  });

  it('tab Berita → ganti jenis, daftar berita dimuat & tampil', async () => {
    mockDaftar.mockImplementation(
      async (path: string) => (path === '/berita' ? [BERITA] : [DOK, DOK2]) as never,
    );
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Berita' }));
    expect(await screen.findByText('Berita Kampus')).toBeInTheDocument();
    expect(mockDaftar).toHaveBeenCalledWith('/berita', []);
  });

  it('tambah baru → form muncul, Simpan → POST + daftar dimuat ulang', async () => {
    mockKirim.mockResolvedValue({ ...DOK, slug: 'karya-baru', judul: 'Karya Baru' } as never);
    await renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));
    fireEvent.change(screen.getByLabelText(/^Judul/), { target: { value: 'Karya Baru' } });
    fireEvent.change(screen.getByLabelText(/^Tanggal/), { target: { value: '2026-10-02' } });
    isiKategoriSendiri('Project');
    fireEvent.change(screen.getByLabelText(/^Deskripsi/), {
      target: { value: 'Deskripsi karya.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Konten "Karya Baru" tersimpan.',
    );
    expect(mockKirim).toHaveBeenCalledWith(
      '/dokumentasi',
      expect.objectContaining({
        method: 'POST',
        token: TOKEN,
        body: expect.objectContaining({
          judul: 'Karya Baru',
          tanggal: '2026-10-02',
          kategori: 'Project',
          deskripsi: 'Deskripsi karya.',
        }),
      }),
    );
    await waitFor(() => expect(mockDaftar).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('button', { name: 'Simpan' })).not.toBeInTheDocument();
  });

  it('Ubah → form terisi item, Simpan → PUT ke /dokumentasi/:slug', async () => {
    mockKirim.mockResolvedValue(DOK as never);
    await renderDashboard();

    fireEvent.click(screen.getAllByRole('button', { name: 'Ubah' })[0]);
    expect(screen.getByLabelText(/^Judul/)).toHaveValue('Deteksi X-Ray 3D');
    // 'Project' di luar opsi umum → dropdown menunjuk "Lainnya", nilai lama
    // tetap tampil di input teks (bisa diedit/dipilih ulang).
    expect(screen.getByLabelText(/^Kategori/)).toHaveValue(KATEGORI_LAINNYA);
    expect(screen.getByLabelText('Tulis kategori sendiri')).toHaveValue('Project');

    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(await screen.findByRole('status')).toHaveTextContent('diperbarui');
    expect(mockKirim).toHaveBeenCalledWith(
      '/dokumentasi/xray-3d',
      expect.objectContaining({ method: 'PUT', token: TOKEN }),
    );
  });

  it('Hapus → ya: DELETE + pesan sukses; tidak: batal tanpa request', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockKirim.mockResolvedValue({ ok: true } as never);
    await renderDashboard();

    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);
    expect(konfirmasi).toHaveBeenCalledWith(expect.stringContaining('Deteksi X-Ray 3D'));
    expect(mockKirim).toHaveBeenCalledWith(
      '/dokumentasi/xray-3d',
      expect.objectContaining({ method: 'DELETE', token: TOKEN }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('dihapus');

    konfirmasi.mockReturnValue(false);
    mockKirim.mockClear();
    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);
    expect(mockKirim).not.toHaveBeenCalled();
    konfirmasi.mockRestore();
  });

  it('aksi tulis 401 → keluar otomatis ke layar login + pesan sesi berakhir', async () => {
    const err401 = Object.assign(new Error('Belum login'), { status: 401 });
    mockKirim.mockRejectedValue(err401 as never);
    await renderDashboard();

    fireEvent.click(screen.getAllByRole('button', { name: 'Ubah' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('heading', { name: 'Masuk Admin' })).toBeInTheDocument();
    expect(localStorage.getItem(KEY_TOKEN_ADMIN)).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('Sesi berakhir');
  });

  it('tombol Keluar → token dihapus, kembali ke layar login', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    expect(screen.getByRole('heading', { name: 'Masuk Admin' })).toBeInTheDocument();
    expect(localStorage.getItem(KEY_TOKEN_ADMIN)).toBeNull();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('form dokumentasi memakai input FILE gambar (bukan URL)', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));
    const input = screen.getByLabelText(/gambar/i);
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', expect.stringContaining('image/png'));
  });

  it('simpan dengan file → unggah dulu, URL hasil masuk body', async () => {
    mockUnggah.mockResolvedValue({ url: '/uploads/abc.png' });
    mockKirim.mockResolvedValue({ ...DOK, slug: 'karya-baru', judul: 'Karya Baru' } as never);
    await renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));
    fireEvent.change(screen.getByLabelText(/^Judul/), { target: { value: 'Karya Baru' } });
    fireEvent.change(screen.getByLabelText(/^Tanggal/), { target: { value: '2026-10-02' } });
    isiKategoriSendiri('Project');
    fireEvent.change(screen.getByLabelText(/^Deskripsi/), { target: { value: 'Deskripsi karya.' } });
    const file = new File([new Uint8Array([1])], 'foto.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/gambar/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockUnggah).toHaveBeenCalledWith('/admin/upload', file, { token: TOKEN });
    expect(mockKirim).toHaveBeenCalledWith(
      '/dokumentasi',
      expect.objectContaining({ body: expect.objectContaining({ gambar: '/uploads/abc.png' }) }),
    );
  });

  it('unggah file gagal → pesan error, tanpa simpan, form tetap terbuka', async () => {
    mockUnggah.mockRejectedValue(new Error('Ukuran file melebihi 2 MB') as never);
    await renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));
    fireEvent.change(screen.getByLabelText(/^Judul/), { target: { value: 'Karya Baru' } });
    fireEvent.change(screen.getByLabelText(/^Tanggal/), { target: { value: '2026-10-02' } });
    isiKategoriSendiri('Project');
    fireEvent.change(screen.getByLabelText(/^Deskripsi/), { target: { value: 'Deskripsi.' } });
    const file = new File([new Uint8Array([1])], 'foto.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/gambar/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ukuran file melebihi 2 MB');
    // Gagal unggah → tak pernah kirim body; form tetap terbuka; sesi tidak ikut keluar.
    expect(mockKirim).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument();
    expect(localStorage.getItem(KEY_TOKEN_ADMIN)).toBe(TOKEN);
  });

  it('berita: tambah baru → POST /berita dengan penulis, ringkasan, isi', async () => {
    mockKirim.mockResolvedValue({ ...BERITA, judul: 'Berita Baru' } as never);
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/berita' ? [BERITA] : [DOK, DOK2],
    );
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Berita' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));
    fireEvent.change(screen.getByLabelText(/^Judul/), { target: { value: 'Berita Baru' } });
    fireEvent.change(screen.getByLabelText(/^Tanggal/), { target: { value: '2026-10-03' } });
    fireEvent.change(screen.getByLabelText(/^Penulis/), { target: { value: 'Humas' } });
    fireEvent.change(screen.getByLabelText(/^Ringkasan/), { target: { value: 'Ringkasan baru.' } });
    fireEvent.change(screen.getByLabelText(/^Isi/), { target: { value: 'Isi lengkap baru.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Berita Baru');
    expect(mockKirim).toHaveBeenCalledWith(
      '/berita',
      expect.objectContaining({
        method: 'POST',
        token: TOKEN,
        body: expect.objectContaining({
          judul: 'Berita Baru',
          penulis: 'Humas',
          ringkasan: 'Ringkasan baru.',
          isi: 'Isi lengkap baru.',
        }),
      }),
    );
  });
});

describe('Admin — tab Kursus', () => {
  it('tab Kursus → daftar kursus dimuat & tampil', async () => {
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/kursus' ? [KURSUS] : [DOK, DOK2],
    );
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    expect(await screen.findByText('Dasar ML')).toBeInTheDocument();
    expect(mockDaftar).toHaveBeenCalledWith('/kursus', []);
  });

  it('tambah kursus + modul → POST /kursus dengan modul terisi', async () => {
    mockDaftar.mockResolvedValue([]);
    mockKirim.mockResolvedValue({ ...KURSUS, kode: 'M01', judul: 'Kursus Baru' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    // Target berupa dropdown → kode terisi otomatis (daftar masih kosong → M01).
    fireEvent.change(screen.getByLabelText(/^Target peserta/), { target: { value: 'Mahasiswa' } });
    expect(screen.getByLabelText(/^Kode/)).toHaveValue('M01');
    expect(screen.getByLabelText(/^Kode/)).toHaveAttribute('readonly');
    fireEvent.change(screen.getByLabelText('Judul *'), { target: { value: 'Kursus Baru' } });
    fireEvent.change(screen.getByLabelText(/deskripsi singkat/i), {
      target: { value: 'Deskripsi.' },
    });
    fireEvent.change(screen.getByLabelText(/tentang kursus/i), { target: { value: 'Tentang.' } });
    fireEvent.change(screen.getByLabelText(/durasi/i), { target: { value: '2 sesi' } });
    fireEvent.change(screen.getByLabelText(/level/i), { target: { value: 'Pemula' } });
    fireEvent.change(screen.getByLabelText(/format/i), { target: { value: 'Online' } });
    fireEvent.change(screen.getByLabelText('Instruktur *'), { target: { value: 'Tim' } });
    fireEvent.change(screen.getByLabelText(/peran instruktur/i), { target: { value: 'Pengajar' } });
    fireEvent.change(screen.getByLabelText(/inisial/i), { target: { value: 'T' } });
    fireEvent.change(screen.getByLabelText(/hasil belajar/i), { target: { value: 'Hasil 1' } });
    fireEvent.change(screen.getByLabelText('Judul modul 1'), { target: { value: 'M1' } });
    fireEvent.change(screen.getByLabelText('Meta modul 1'), { target: { value: '2 video' } });
    fireEvent.change(screen.getByLabelText('Deskripsi modul 1'), { target: { value: 'D1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockKirim).toHaveBeenCalledWith(
      '/kursus',
      expect.objectContaining({
        method: 'POST',
        token: TOKEN,
        body: expect.objectContaining({
          kode: 'M01',
          target: ['Mahasiswa'],
          modul: [
            { judul: 'M1', deskripsi: 'D1', meta: '2 video', video: null, quiz: [] },
          ],
        }),
      }),
    );
  });

  it('isi video + kuis → body membawa video & quiz; soal kosong dibuang', async () => {
    mockDaftar.mockResolvedValue([]);
    mockKirim.mockResolvedValue({ ...KURSUS, kode: 'M01' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    fireEvent.change(screen.getByLabelText(/^Target peserta/), { target: { value: 'Mahasiswa' } });
    fireEvent.change(screen.getByLabelText('Judul *'), { target: { value: 'Kursus Video' } });
    fireEvent.change(screen.getByLabelText(/deskripsi singkat/i), { target: { value: 'D.' } });
    fireEvent.change(screen.getByLabelText(/tentang kursus/i), { target: { value: 'T.' } });
    fireEvent.change(screen.getByLabelText(/durasi/i), { target: { value: '2 sesi' } });
    fireEvent.change(screen.getByLabelText(/level/i), { target: { value: 'Pemula' } });
    fireEvent.change(screen.getByLabelText(/format/i), { target: { value: 'Online' } });
    fireEvent.change(screen.getByLabelText('Instruktur *'), { target: { value: 'Tim' } });
    fireEvent.change(screen.getByLabelText(/peran instruktur/i), { target: { value: 'Pengajar' } });
    fireEvent.change(screen.getByLabelText(/inisial/i), { target: { value: 'T' } });
    fireEvent.change(screen.getByLabelText(/hasil belajar/i), { target: { value: 'Hasil 1' } });
    fireEvent.change(screen.getByLabelText('Judul modul 1'), { target: { value: 'M1' } });
    fireEvent.change(screen.getByLabelText('Meta modul 1'), { target: { value: '2 video' } });
    fireEvent.change(screen.getByLabelText('Deskripsi modul 1'), { target: { value: 'D1' } });
    fireEvent.change(screen.getByLabelText('Video modul 1'), {
      target: { value: 'https://youtu.be/abc12345' },
    });

    // Soal 1 diisi lengkap; soal 2 sengaja dibiarkan kosong (harus dibuang).
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah soal' }));
    fireEvent.change(screen.getByLabelText('Pertanyaan 1 modul 1'), {
      target: { value: 'Apa kata kunci yang baik?' },
    });
    fireEvent.change(screen.getByLabelText('Opsi 1 soal 1 modul 1'), {
      target: { value: 'Spesifik' },
    });
    fireEvent.change(screen.getByLabelText('Opsi 2 soal 1 modul 1'), {
      target: { value: 'Umum' },
    });
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah soal' }));

    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockKirim).toHaveBeenCalledWith(
      '/kursus',
      expect.objectContaining({
        body: expect.objectContaining({
          modul: [
            {
              judul: 'M1',
              deskripsi: 'D1',
              meta: '2 video',
              video: 'https://youtu.be/abc12345',
              quiz: [{ pertanyaan: 'Apa kata kunci yang baik?', opsi: ['Spesifik', 'Umum'], kunci: 0 }],
            },
          ],
        }),
      }),
    );
  });

  it('tambah modul → baris modul 2 muncul', async () => {
    mockDaftar.mockResolvedValue([]);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah modul' }));
    expect(screen.getByLabelText('Judul modul 2')).toBeInTheDocument();
  });

  it('kode auto dari peserta: Guru → G01, ganti target → M01 (input read-only)', async () => {
    mockDaftar.mockResolvedValue([]);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    // Belum ada peserta → kode masih kosong (placeholder "Pilih target peserta dulu").
    const dropdown = screen.getByLabelText(/^Target peserta/);
    expect(dropdown.tagName).toBe('SELECT');
    expect(screen.getByLabelText(/^Kode/)).toHaveValue('');

    fireEvent.change(dropdown, { target: { value: 'Guru' } });
    expect(screen.getByLabelText(/^Kode/)).toHaveValue('G01');
    expect(screen.getByLabelText(/^Kode/)).toHaveAttribute('readonly');

    fireEvent.change(dropdown, { target: { value: 'Mahasiswa' } });
    expect(screen.getByLabelText(/^Kode/)).toHaveValue('M01');
    expect(dropdown).toHaveValue('Mahasiswa');
  });

  it('kode lanjut dari nomor terpakai (M01 → M02); kode lama R01 tidak ikut dihitung', async () => {
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/kursus' ? [{ ...KURSUS, kode: 'M01' }] : [DOK, DOK2],
    );
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    expect(await screen.findByText('Dasar ML')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    fireEvent.change(screen.getByLabelText(/^Target peserta/), { target: { value: 'Mahasiswa' } });
    expect(screen.getByLabelText(/^Kode/)).toHaveValue('M02');
  });

  it('data lama multi-target → pilihan pertama dipilih + catatan simpan jadi 1 target', async () => {
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/kursus'
        ? [{ ...KURSUS, target: ['Mahasiswa', 'Dosen', 'Masyarakat umum'] }]
        : [DOK, DOK2],
    );
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    expect(await screen.findByText('Dasar ML')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ubah' })[0]);

    expect(screen.getByLabelText(/^Target peserta/)).toHaveValue('Mahasiswa');
    expect(screen.getByText(/data lama punya 3 target/i)).toBeInTheDocument();
  });

  it('tanpa target peserta → Simpan menampilkan error eksplisit tanpa request', async () => {
    mockDaftar.mockResolvedValue([]);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    // Semua field wajib lain diisi lebih dulu supaya guard target yang teruji.
    fireEvent.change(screen.getByLabelText('Judul *'), { target: { value: 'Kursus Baru' } });
    fireEvent.change(screen.getByLabelText(/deskripsi singkat/i), {
      target: { value: 'Deskripsi.' },
    });
    fireEvent.change(screen.getByLabelText(/tentang kursus/i), { target: { value: 'Tentang.' } });
    fireEvent.change(screen.getByLabelText(/durasi/i), { target: { value: '2 sesi' } });
    fireEvent.change(screen.getByLabelText(/level/i), { target: { value: 'Pemula' } });
    fireEvent.change(screen.getByLabelText(/format/i), { target: { value: 'Online' } });
    fireEvent.change(screen.getByLabelText('Instruktur *'), { target: { value: 'Tim' } });
    fireEvent.change(screen.getByLabelText(/peran instruktur/i), { target: { value: 'Pengajar' } });
    fireEvent.change(screen.getByLabelText(/inisial/i), { target: { value: 'T' } });
    fireEvent.change(screen.getByLabelText(/hasil belajar/i), { target: { value: 'Hasil 1' } });
    fireEvent.change(screen.getByLabelText('Judul modul 1'), { target: { value: 'M1' } });
    fireEvent.change(screen.getByLabelText('Meta modul 1'), { target: { value: '2 video' } });
    fireEvent.change(screen.getByLabelText('Deskripsi modul 1'), { target: { value: 'D1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Target peserta wajib dipilih');
    expect(mockKirim).not.toHaveBeenCalled();
  });

  it('Ubah kursus → form terisi, kode terkunci, Simpan → PUT /kursus/:kode', async () => {
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/kursus' ? [KURSUS] : [DOK, DOK2],
    );
    mockKirim.mockResolvedValue({ ...KURSUS, judul: 'Dasar ML Revisi' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    // Tunggu daftar kursus termuat dulu (muat async) sebelum aksi baris.
    expect(await screen.findByText('Dasar ML')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ubah' })[0]);

    expect(screen.getByLabelText('Judul *')).toHaveValue('Dasar ML');
    // Kode adalah kunci: tidak boleh diganti saat edit; target awal terpilih.
    expect(screen.getByLabelText(/^Kode/)).toBeDisabled();
    expect(screen.getByLabelText(/^Target peserta/)).toHaveValue('Mahasiswa');
    expect(screen.getByText(/kode kunci tidak bisa diganti/i)).toBeInTheDocument();
    // Fixture cuma 1 target → catatan "data lama" tidak ikut muncul.
    expect(screen.queryByText(/data lama punya/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(await screen.findByRole('status')).toHaveTextContent('diperbarui');
    expect(mockKirim).toHaveBeenCalledWith(
      '/kursus/R01',
      expect.objectContaining({
        method: 'PUT',
        token: TOKEN,
        body: expect.objectContaining({ kode: 'R01' }),
      }),
    );
  });

  it('Hapus kursus → ya: DELETE /kursus/:kode + pesan; tidak: batal tanpa request', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/kursus' ? [KURSUS] : [DOK, DOK2],
    );
    mockKirim.mockResolvedValue({ ok: true } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    expect(await screen.findByText('Dasar ML')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);

    expect(konfirmasi).toHaveBeenCalledWith(expect.stringContaining('Dasar ML'));
    expect(mockKirim).toHaveBeenCalledWith(
      '/kursus/R01',
      expect.objectContaining({ method: 'DELETE', token: TOKEN }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('dihapus');

    konfirmasi.mockReturnValue(false);
    mockKirim.mockClear();
    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);
    expect(mockKirim).not.toHaveBeenCalled();
    konfirmasi.mockRestore();
  });

  it('aksi kursus 401 → keluar otomatis + pesan sesi berakhir', async () => {
    const err401 = Object.assign(new Error('Belum login'), { status: 401 });
    mockKirim.mockRejectedValue(err401 as never);
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/kursus' ? [KURSUS] : [DOK, DOK2],
    );
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    expect(await screen.findByText('Dasar ML')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ubah' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('heading', { name: 'Masuk Admin' })).toBeInTheDocument();
    expect(localStorage.getItem(KEY_TOKEN_ADMIN)).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('Sesi berakhir');
  });
});

// — Prioritas 2: tab Tim & Profil + pembersih file tidak terpakai ——————————

describe('Admin — tab Tim (Prioritas 2)', () => {
  const daftarTim = () => {
    mockDaftar.mockImplementation(
      async (path: string) => (path === '/tim' ? [ANGGOTA] : [DOK, DOK2]) as never,
    );
  };

  it('tab Tim → GET /tim dimuat & baris anggota tampil', async () => {
    daftarTim();
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Tim' }));
    expect(await screen.findByText('Dr. Contoh Saja')).toBeInTheDocument();
    expect(mockDaftar).toHaveBeenCalledWith('/tim', []);
  });

  it('tambah anggota → form muncul, Simpan → POST /tim dengan urutan', async () => {
    daftarTim();
    mockKirim.mockResolvedValue({ ...ANGGOTA, id: 5, nama: 'Dr. Baru' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Tim' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    fireEvent.change(screen.getByLabelText(/^Nama/), { target: { value: 'Dr. Baru' } });
    fireEvent.change(screen.getByLabelText(/^Peran/), { target: { value: 'Anggota' } });
    fireEvent.change(screen.getByLabelText(/^Urutan/), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockKirim).toHaveBeenCalledWith('/tim', {
      method: 'POST',
      body: { nama: 'Dr. Baru', peran: 'Anggota', kredensial: '', foto: '', urutan: 3 },
      token: TOKEN,
    });
  });

  it('ubah anggota → form terisi dari item, Simpan → PUT /tim/:id', async () => {
    daftarTim();
    mockKirim.mockResolvedValue(ANGGOTA as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Tim' }));
    expect(await screen.findByText('Dr. Contoh Saja')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ubah' })[0]);

    expect((screen.getByLabelText(/^Nama/) as HTMLInputElement).value).toBe('Dr. Contoh Saja');
    fireEvent.change(screen.getByLabelText(/^Peran/), { target: { value: 'Wakil Ketua' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('diperbarui');
    expect(mockKirim).toHaveBeenCalledWith('/tim/1', {
      method: 'PUT',
      body: {
        nama: 'Dr. Contoh Saja',
        peran: 'Wakil Ketua',
        kredensial: 'Ph.D.',
        foto: '/tim/contoh.jpg',
        urutan: 0,
      },
      token: TOKEN,
    });
  });

  it('hapus anggota → confirm + DELETE /tim/:id', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(true);
    daftarTim();
    mockKirim.mockResolvedValue({ ok: true } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Tim' }));
    expect(await screen.findByText('Dr. Contoh Saja')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);

    expect(konfirmasi).toHaveBeenCalledWith(expect.stringContaining('Dr. Contoh Saja'));
    expect(mockKirim).toHaveBeenCalledWith(
      '/tim/1',
      expect.objectContaining({ method: 'DELETE', token: TOKEN }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('dihapus');
    konfirmasi.mockRestore();
  });

  it('aksi tim 401 → keluar otomatis + pesan sesi berakhir', async () => {
    const err401 = Object.assign(new Error('Belum login'), { status: 401 });
    mockKirim.mockRejectedValue(err401 as never);
    daftarTim();
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Tim' }));
    expect(await screen.findByText('Dr. Contoh Saja')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));
    fireEvent.change(screen.getByLabelText(/^Nama/), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/^Peran/), { target: { value: 'Y' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('heading', { name: 'Masuk Admin' })).toBeInTheDocument();
    expect(localStorage.getItem(KEY_TOKEN_ADMIN)).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('Sesi berakhir');
  });
});

describe('Admin — tab Profil (Prioritas 2)', () => {
  it('tab Profil → GET /profil mengisi form (visi & misi ikut)', async () => {
    mockAmbilJson.mockResolvedValue(PROFIL as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Profil' }));

    expect(mockAmbilJson).toHaveBeenCalledWith('/profil', null);
    const nama = (await screen.findByLabelText(/Nama lembaga/)) as HTMLInputElement;
    await waitFor(() => expect(nama.value).toBe(PROFIL.nama));
    expect((screen.getByLabelText(/^Misi/) as HTMLTextAreaElement).value).toBe(PROFIL.misi);
    expect((screen.getByLabelText(/^Visi/) as HTMLTextAreaElement).value).toBe(PROFIL.visi);
  });

  it('Simpan → PUT /profil dengan seluruh field teks', async () => {
    mockAmbilJson.mockResolvedValue(PROFIL as never);
    mockKirim.mockResolvedValue(PROFIL as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Profil' }));

    const nama = (await screen.findByLabelText(/Nama lembaga/)) as HTMLInputElement;
    await waitFor(() => expect(nama.value).toBe(PROFIL.nama));
    fireEvent.change(nama, { target: { value: 'AI Center Ubaya' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan profil' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Profil disimpan.');
    expect(mockKirim).toHaveBeenCalledWith('/profil', {
      method: 'PUT',
      body: {
        nama: 'AI Center Ubaya',
        tagline: PROFIL.tagline,
        ringkasan: PROFIL.ringkasan,
        alamat: PROFIL.alamat,
        email: PROFIL.email,
        telepon: PROFIL.telepon,
        visi: PROFIL.visi,
        misi: PROFIL.misi,
      },
      token: TOKEN,
    });
  });

  it('simpan gagal (400 dari server) → pesan role alert tampil', async () => {
    mockAmbilJson.mockResolvedValue(PROFIL as never);
    mockKirim.mockRejectedValue(
      new Error('Field "telepon" maksimal 50 karakter') as never,
    );
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Profil' }));
    await screen.findByLabelText(/Nama lembaga/);
    fireEvent.click(screen.getByRole('button', { name: 'Simpan profil' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('maksimal 50 karakter');
  });
});

describe('Admin — tab Inference', () => {
  it('tab Inference → GET /inference mengisi form (kebutuhan, alur & contoh ikut)', async () => {
    mockAmbilJson.mockResolvedValue(KONTEN_INFERENCE as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Inference' }));

    expect(mockAmbilJson).toHaveBeenCalledWith('/inference', null);
    const judul = (await screen.findByLabelText(/Judul panel/)) as HTMLInputElement;
    await waitFor(() => expect(judul.value).toBe(KONTEN_INFERENCE.judulApaItu));
    expect((screen.getByLabelText(/Deskripsi panel/) as HTMLTextAreaElement).value).toBe(
      KONTEN_INFERENCE.deskripsiApaItu,
    );
    expect((screen.getByLabelText(/Kapan dibutuhkan/) as HTMLTextAreaElement).value).toBe(
      KONTEN_INFERENCE.kebutuhan.join('\n'),
    );
    expect((screen.getByLabelText('Judul langkah 1') as HTMLInputElement).value).toBe('Konsultasi');
    expect((screen.getByLabelText('Judul langkah 2') as HTMLInputElement).value).toBe('Deployment');
    expect((screen.getByLabelText('Slug contoh 1') as HTMLInputElement).value).toBe('algae-finder');
  });

  it('Simpan → PUT /inference dengan daftar kebutuhan dipecah per baris', async () => {
    mockAmbilJson.mockResolvedValue(KONTEN_INFERENCE as never);
    mockKirim.mockResolvedValue(KONTEN_INFERENCE as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Inference' }));

    const judul = (await screen.findByLabelText(/Judul panel/)) as HTMLInputElement;
    await waitFor(() => expect(judul.value).toBe(KONTEN_INFERENCE.judulApaItu));
    fireEvent.change(judul, { target: { value: 'Apa itu Inference?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan inference' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Konten inference disimpan.');
    expect(mockKirim).toHaveBeenCalledWith('/inference', {
      method: 'PUT',
      body: {
        judulApaItu: 'Apa itu Inference?',
        deskripsiApaItu: KONTEN_INFERENCE.deskripsiApaItu,
        kebutuhan: KONTEN_INFERENCE.kebutuhan,
        alur: KONTEN_INFERENCE.alur,
        contohIntro: KONTEN_INFERENCE.contohIntro,
        contoh: KONTEN_INFERENCE.contoh,
      },
      token: TOKEN,
    });
  });

  it('kebutuhan kosong → pesan validasi lokal, tanpa request PUT', async () => {
    mockAmbilJson.mockResolvedValue(KONTEN_INFERENCE as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Inference' }));

    const kebutuhan = (await screen.findByLabelText(/Kapan dibutuhkan/)) as HTMLTextAreaElement;
    await waitFor(() => expect(kebutuhan.value).not.toBe(''));
    fireEvent.change(kebutuhan, { target: { value: '   \n  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan inference' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('minimal 1 poin');
    expect(mockKirim).not.toHaveBeenCalled();
  });

  it('tambah langkah → baris baru; tombol hapus muncul saat lebih dari 1 langkah', async () => {
    mockAmbilJson.mockResolvedValue(KONTEN_INFERENCE as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Inference' }));
    await screen.findByLabelText('Judul langkah 1');

    fireEvent.click(screen.getByRole('button', { name: '+ Tambah langkah' }));
    expect(screen.getByLabelText('Judul langkah 3')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Hapus langkah ini' })).toHaveLength(3);

    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus langkah ini' })[2]);
    expect(screen.queryByLabelText('Judul langkah 3')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Hapus langkah ini' })).toHaveLength(2);
  });

  it('simpan gagal (400 dari server) → pesan role alert tampil', async () => {
    mockAmbilJson.mockResolvedValue(KONTEN_INFERENCE as never);
    mockKirim.mockRejectedValue(
      new Error('Field "kebutuhan" maksimal 300 karakter per item') as never,
    );
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Inference' }));
    await screen.findByLabelText(/Judul panel/);
    fireEvent.click(screen.getByRole('button', { name: 'Simpan inference' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('maksimal 300 karakter');
  });
});

describe('Admin — tab Testimoni & tab Hero (lengkapi CRUD admin)', () => {
  /** Fixture testimoni dari backend (membawa id & urutan). */
  const TESTIMONI: Testimoni = {
    id: 4,
    nama: 'Peserta Pelatihan ML',
    peran: 'Mahasiswa',
    kutipan: 'Materi pelatihan runtut.',
    urutan: 0,
  };
  /** Fixture slide hero dari backend (membawa id & urutan + field opsional). */
  const SLIDE: HeroSlide = {
    id: 1,
    urutan: 0,
    eyebrow: 'AI Center Ubaya',
    judul: 'Kami membangun',
    judulAksen: 'solusi AI',
    sub: 'Riset, pelatihan & inference.',
    ctaPrimer: { label: 'Konsultasi', to: 'https://wa.me/6289563422240' },
    ctaSekunder: { label: 'Layanan Kami', to: '/layanan' },
    badgeJudul: 'Ubaya',
    badgeSub: 'Surabaya',
    image: '/hero/ai-center.jpg',
    srcSet: '/hero/ai-center-800.webp 800w, /hero/ai-center-1600.webp 1600w',
    sizes: '(max-width: 768px) 100vw, 50vw',
    layout: 'image-left',
  };
  const SLIDE_2: HeroSlide = { ...SLIDE, id: 2, urutan: 1, judul: 'Slide Kedua' };

  /** Daftar per endpoint: /testimoni & /hero-slides dibedakan dari jenis lain. */
  const daftarBaru = (): void => {
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/testimoni'
        ? ([TESTIMONI] as never)
        : path === '/hero-slides'
          ? ([SLIDE, SLIDE_2] as never)
          : ([DOK, DOK2] as never),
    );
  };

  it('tab Testimoni → GET /testimoni dimuat & baris tampil', async () => {
    daftarBaru();
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Testimoni' }));
    expect(await screen.findByText('Peserta Pelatihan ML')).toBeInTheDocument();
    expect(mockDaftar).toHaveBeenCalledWith('/testimoni', []);
  });

  it('tambah testimoni → Simpan → POST /testimoni dengan urutan', async () => {
    daftarBaru();
    mockKirim.mockResolvedValue({ ...TESTIMONI, id: 9, nama: 'Testimoni Baru' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Testimoni' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    fireEvent.change(screen.getByLabelText(/^Nama/), { target: { value: 'Testimoni Baru' } });
    fireEvent.change(screen.getByLabelText(/^Peran/), { target: { value: 'Dosen' } });
    fireEvent.change(screen.getByLabelText(/^Kutipan/), { target: { value: 'Bagus sekali.' } });
    fireEvent.change(screen.getByLabelText(/^Urutan/), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockKirim).toHaveBeenCalledWith('/testimoni', {
      method: 'POST',
      body: { nama: 'Testimoni Baru', peran: 'Dosen', kutipan: 'Bagus sekali.', urutan: 2 },
      token: TOKEN,
    });
  });

  it('ubah & hapus testimoni → PUT /testimoni/:id lalu DELETE', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(true);
    daftarBaru();
    mockKirim.mockResolvedValue(TESTIMONI as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Testimoni' }));
    expect(await screen.findByText('Peserta Pelatihan ML')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Ubah' })[0]);
    expect((screen.getByLabelText(/^Kutipan/) as HTMLTextAreaElement).value).toBe(
      'Materi pelatihan runtut.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(await screen.findByRole('status')).toHaveTextContent('diperbarui');
    expect(mockKirim).toHaveBeenCalledWith('/testimoni/4', {
      method: 'PUT',
      body: {
        nama: 'Peserta Pelatihan ML',
        peran: 'Mahasiswa',
        kutipan: 'Materi pelatihan runtut.',
        urutan: 0,
      },
      token: TOKEN,
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);
    expect(konfirmasi).toHaveBeenCalledWith(expect.stringContaining('Peserta Pelatihan ML'));
    expect(mockKirim).toHaveBeenCalledWith(
      '/testimoni/4',
      expect.objectContaining({ method: 'DELETE', token: TOKEN }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('dihapus');
    konfirmasi.mockRestore();
  });

  it('tab Hero → GET /hero-slides dimuat & dua slide tampil', async () => {
    daftarBaru();
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Hero' }));
    expect(await screen.findByText('Kami membangun solusi AI')).toBeInTheDocument();
    expect(screen.getByText(/Slide Kedua/)).toBeInTheDocument();
    expect(mockDaftar).toHaveBeenCalledWith('/hero-slides', []);
  });

  it('ubah slide → Simpan → PUT /hero-slides/:id dengan objek CTA & field opsional', async () => {
    daftarBaru();
    mockKirim.mockResolvedValue(SLIDE as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Hero' }));
    expect(await screen.findByText('Kami membangun solusi AI')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ubah' })[0]);

    expect((screen.getByLabelText(/^Judul/) as HTMLInputElement).value).toBe('Kami membangun');
    fireEvent.change(screen.getByLabelText(/^Subjudul/), { target: { value: 'Sub baru.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('diperbarui');
    expect(mockKirim).toHaveBeenCalledWith('/hero-slides/1', {
      method: 'PUT',
      body: {
        urutan: 0,
        eyebrow: 'AI Center Ubaya',
        judul: 'Kami membangun',
        judulAksen: 'solusi AI',
        sub: 'Sub baru.',
        badgeJudul: 'Ubaya',
        badgeSub: 'Surabaya',
        ctaPrimer: { label: 'Konsultasi', to: 'https://wa.me/6289563422240' },
        ctaSekunder: { label: 'Layanan Kami', to: '/layanan' },
        image: '/hero/ai-center.jpg',
        srcSet: '/hero/ai-center-800.webp 800w, /hero/ai-center-1600.webp 1600w',
        sizes: '(max-width: 768px) 100vw, 50vw',
        layout: 'image-left',
      },
      token: TOKEN,
    });
  });

  it('tambah slide: layout kosong → null; file baru → unggah & srcSet dikosongkan', async () => {
    daftarBaru();
    mockUnggah.mockResolvedValue({ url: '/uploads/hero-baru.jpg' } as never);
    mockKirim.mockResolvedValue({ ...SLIDE, id: 3 } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Hero' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    fireEvent.change(screen.getByLabelText(/^Urutan/), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/^Eyebrow/), { target: { value: 'AI Center' } });
    fireEvent.change(screen.getByLabelText(/^Judul \*/), { target: { value: 'Slide Baru' } });
    fireEvent.change(screen.getByLabelText(/^Aksen judul/), { target: { value: 'untuk semua' } });
    fireEvent.change(screen.getByLabelText(/^Subjudul/), { target: { value: 'Sub.' } });
    fireEvent.change(screen.getByLabelText('CTA utama — label *'), {
      target: { value: 'Mulai' },
    });
    fireEvent.change(screen.getByLabelText('CTA utama — tautan *'), {
      target: { value: '/pelatihan' },
    });
    fireEvent.change(screen.getByLabelText('CTA sekunder — label *'), {
      target: { value: 'Kontak' },
    });
    fireEvent.change(screen.getByLabelText('CTA sekunder — tautan *'), {
      target: { value: '/kontak' },
    });
    fireEvent.change(screen.getByLabelText('Badge — judul *'), { target: { value: 'Ubaya' } });
    fireEvent.change(screen.getByLabelText('Badge — keterangan *'), {
      target: { value: 'Surabaya' },
    });

    // Pilih file gambar → varian srcSet lama harus ikut dikosongkan.
    fireEvent.change(screen.getByLabelText(/^Srcset/), {
      target: { value: '/hero/lama-800.webp 800w' },
    });
    const file = new File(['isi'], 'hero-baru.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText(/^Gambar slide/), { target: { files: [file] } });
    expect((screen.getByLabelText(/^Srcset/) as HTMLInputElement).value).toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockUnggah).toHaveBeenCalledWith('/admin/upload', file, { token: TOKEN });
    expect(mockKirim).toHaveBeenCalledWith('/hero-slides', {
      method: 'POST',
      body: {
        urutan: 0,
        eyebrow: 'AI Center',
        judul: 'Slide Baru',
        judulAksen: 'untuk semua',
        sub: 'Sub.',
        badgeJudul: 'Ubaya',
        badgeSub: 'Surabaya',
        ctaPrimer: { label: 'Mulai', to: '/pelatihan' },
        ctaSekunder: { label: 'Kontak', to: '/kontak' },
        image: '/uploads/hero-baru.jpg',
        srcSet: '',
        sizes: '',
        layout: null,
      },
      token: TOKEN,
    });
  });

  it('slide terakhir tidak bisa dihapus (tombol Hapus dinonaktifkan)', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(true);
    daftarBaru();
    mockKirim.mockResolvedValue({ ok: true } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Hero' }));
    expect(await screen.findByText('Kami membangun solusi AI')).toBeInTheDocument();
    const tombol = screen.getAllByRole('button', { name: 'Hapus' });
    expect(tombol.every((b) => !(b as HTMLButtonElement).disabled)).toBe(true);

    // Hapus satu slide → tersisa satu → tombol Hapus mati (hero tidak boleh kosong).
    fireEvent.click(tombol[0]);
    expect(await screen.findByRole('status')).toHaveTextContent('dihapus');
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/hero-slides' ? ([SLIDE] as never) : ([DOK, DOK2] as never),
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Profil' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Hero' }));
    expect(await screen.findByText('Kami membangun solusi AI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hapus' })).toBeDisabled();
    konfirmasi.mockRestore();
  });
});

describe('Admin — bersihkan gambar tidak terpakai (Prioritas 2)', () => {
  it('konfirmasi → POST /admin/uploads/bersihkan + jumlah file di pesan', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockKirim.mockResolvedValue({ kering: false, items: ['a.jpg', 'b.jpg'] } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Bersihkan gambar tidak terpakai' }));

    expect(konfirmasi).toHaveBeenCalled();
    expect(mockKirim).toHaveBeenCalledWith('/admin/uploads/bersihkan', {
      method: 'POST',
      body: {},
      token: TOKEN,
    });
    expect(await screen.findByRole('status')).toHaveTextContent('2 gambar tidak terpakai dihapus');
    konfirmasi.mockRestore();
  });

  it('tidak ada file tersisa → pesan "Semua gambar masih dipakai"', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockKirim.mockResolvedValue({ kering: false, items: [] } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Bersihkan gambar tidak terpakai' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Semua gambar masih dipakai');
    konfirmasi.mockRestore();
  });

  it('konfirmasi ditolak → request tidak dikirim', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Bersihkan gambar tidak terpakai' }));

    expect(mockKirim).not.toHaveBeenCalled();
    konfirmasi.mockRestore();
  });
});

describe('Admin — dropdown Kategori dokumentasi (opsi umum + bebas)', () => {
  it('membuka form: dropdown berisi opsi umum + "Lainnya (ketik sendiri)"', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    const pilihan = screen.getByLabelText(/^Kategori/);
    expect(pilihan.tagName).toBe('SELECT');
    const daftarOpsi = within(pilihan)
      .getAllByRole('option')
      .map((opsi) => opsi.textContent);
    expect(daftarOpsi).toEqual(['— pilih kategori —', ...OPSI_KATEGORI, 'Lainnya (ketik sendiri)']);
    expect(screen.queryByLabelText('Tulis kategori sendiri')).not.toBeInTheDocument();
  });

  it('pilih opsi umum → input custom tidak muncul, Simpan memakai nilai opsi', async () => {
    mockKirim.mockResolvedValue({ ...DOK, kategori: 'Kunjungan' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    fireEvent.change(screen.getByLabelText(/^Kategori/), { target: { value: 'Kunjungan' } });
    fireEvent.change(screen.getByLabelText(/^Judul/), { target: { value: 'Karya Baru' } });
    fireEvent.change(screen.getByLabelText(/^Tanggal/), { target: { value: '2026-10-02' } });
    fireEvent.change(screen.getByLabelText(/^Deskripsi/), { target: { value: 'Deskripsi.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(screen.queryByLabelText('Tulis kategori sendiri')).not.toBeInTheDocument();
    expect(mockKirim).toHaveBeenCalledWith(
      '/dokumentasi',
      expect.objectContaining({ body: expect.objectContaining({ kategori: 'Kunjungan' }) }),
    );
  });

  it('pilih "Lainnya" → input custom muncul, nilai ketikan yang terkirim', async () => {
    mockKirim.mockResolvedValue({ ...DOK, kategori: 'Riset Komputasi' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    isiKategoriSendiri('Riset Komputasi');
    fireEvent.change(screen.getByLabelText(/^Judul/), { target: { value: 'Karya Baru' } });
    fireEvent.change(screen.getByLabelText(/^Tanggal/), { target: { value: '2026-10-02' } });
    fireEvent.change(screen.getByLabelText(/^Deskripsi/), { target: { value: 'Deskripsi.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockKirim).toHaveBeenCalledWith(
      '/dokumentasi',
      expect.objectContaining({ body: expect.objectContaining({ kategori: 'Riset Komputasi' }) }),
    );
  });
});

describe('Admin — batas panjang field (Prioritas 2)', () => {
  it('input teks memakai maxLength yang disejajarkan dengan server', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));
    expect(screen.getByLabelText('Judul *')).toHaveAttribute('maxlength', '200');
    // Kategori kini dropdown — maxLength melekat di input custom saat
    // "Lainnya (ketik sendiri)" dipilih (server tetap membatasi 100).
    expect(screen.getByLabelText(/^Kategori/)).toHaveAttribute('required');
    isiKategoriSendiri('x'.repeat(100));
    expect(screen.getByLabelText('Tulis kategori sendiri')).toHaveAttribute('maxlength', '100');
  });

  it('tab Tim: input nama maks 200 & urutan dibatasi 0-9999', async () => {
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Tim' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    expect(screen.getByLabelText(/^Nama/)).toHaveAttribute('maxlength', '200');
    expect(screen.getByLabelText(/^Urutan/)).toHaveAttribute('max', '9999');
  });
});

describe('Admin — tab Layanan (CRUD layanan)', () => {
  /** Fixture layanan dari backend (kunci baris = slug hasil slugDariJudul). */
  const LAYANAN: Layanan = {
    slug: 'pelatihan',
    nama: 'Pelatihan',
    tagline: 'Pelatihan AI yang benar-benar dipakai sehari-hari.',
    deskripsi: 'Ubaya AI Center mendampingi belajar AI dari dasar.',
    fitur: ['Workshop terjadwal', 'Sertifikat'],
  };

  /** Daftar per endpoint: /layanan dibedakan dari jenis lain. */
  const daftarLayanan = (): void => {
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/layanan' ? ([LAYANAN] as never) : ([DOK, DOK2] as never),
    );
  };

  it('tab Layanan → GET /layanan dimuat & baris tampil (nama, slug, jumlah fitur)', async () => {
    daftarLayanan();
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Layanan' }));
    expect(await screen.findByText('Pelatihan')).toBeInTheDocument();
    expect(screen.getByText(/\/pelatihan · 2 fitur/)).toBeInTheDocument();
    expect(mockDaftar).toHaveBeenCalledWith('/layanan', []);
  });

  it('tambah layanan + baris fitur → Simpan → POST /layanan dengan daftar fitur', async () => {
    mockDaftar.mockResolvedValue([] as never);
    mockKirim.mockResolvedValue({ ...LAYANAN, slug: 'layanan-baru', nama: 'Layanan Baru' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Layanan' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    fireEvent.change(screen.getByLabelText(/^Nama/), { target: { value: 'Layanan Baru' } });
    fireEvent.change(screen.getByLabelText(/^Tagline/), { target: { value: 'Tagline baru.' } });
    fireEvent.change(screen.getByLabelText(/^Deskripsi/), { target: { value: 'Deskripsi.' } });
    fireEvent.change(screen.getByLabelText('Fitur 1'), { target: { value: 'Poin satu' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah fitur' }));
    fireEvent.change(screen.getByLabelText('Fitur 2'), { target: { value: 'Poin dua' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockKirim).toHaveBeenCalledWith('/layanan', {
      method: 'POST',
      body: {
        nama: 'Layanan Baru',
        tagline: 'Tagline baru.',
        deskripsi: 'Deskripsi.',
        fitur: ['Poin satu', 'Poin dua'],
      },
      token: TOKEN,
    });
  });

  it('ubah & hapus layanan → PUT /layanan/:slug (slug tetap) lalu DELETE', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(true);
    daftarLayanan();
    mockKirim.mockResolvedValue(LAYANAN as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Layanan' }));
    expect(await screen.findByText('Pelatihan')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Ubah' })[0]);
    expect((screen.getByLabelText(/^Tagline/) as HTMLInputElement).value).toBe(LAYANAN.tagline);
    expect((screen.getByLabelText('Fitur 1') as HTMLInputElement).value).toBe('Workshop terjadwal');
    expect((screen.getByLabelText('Fitur 2') as HTMLInputElement).value).toBe('Sertifikat');
    fireEvent.change(screen.getByLabelText(/^Tagline/), { target: { value: 'Tagline singkat.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('diperbarui');
    expect(mockKirim).toHaveBeenCalledWith('/layanan/pelatihan', {
      method: 'PUT',
      body: {
        nama: 'Pelatihan',
        tagline: 'Tagline singkat.',
        deskripsi: 'Ubaya AI Center mendampingi belajar AI dari dasar.',
        fitur: ['Workshop terjadwal', 'Sertifikat'],
      },
      token: TOKEN,
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);
    expect(konfirmasi).toHaveBeenCalledWith(expect.stringContaining('Pelatihan'));
    expect(mockKirim).toHaveBeenCalledWith(
      '/layanan/pelatihan',
      expect.objectContaining({ method: 'DELETE', token: TOKEN }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('dihapus');
    konfirmasi.mockRestore();
  });
});
