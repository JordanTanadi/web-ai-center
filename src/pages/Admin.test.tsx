import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Admin, { KATEGORI_LAINNYA, KEY_TOKEN_ADMIN, OPSI_KATEGORI } from './Admin.tsx';
import { ambilDaftar, kirimFileAdmin, kirimJsonAdmin } from '../lib/api.ts';
import { within } from '@testing-library/react';
import type { DokumentasiItem } from '../data/dokumentasi.ts';
import type { BeritaItem } from '../data/berita.ts';
import type { Kursus } from '../data/pelatihan.ts';
import type { Testimoni } from '../data/testimoni.ts';
import type { AnggotaTim } from '../data/tim.ts';

// Mock modul api: test deterministik tanpa backend (Admin memakai ambilDaftar
// untuk daftar, kirimJsonAdmin/kirimFileAdmin untuk write).
vi.mock('../lib/api.ts', () => ({
  ambilDaftar: vi.fn(),
  ambilJson: vi.fn(),
  kirimJsonAdmin: vi.fn(),
  kirimFileAdmin: vi.fn(),
}));

const mockDaftar = vi.mocked(ambilDaftar);
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

  it('tombol Keluar (konfirmasi "Yakin keluar?") → token dihapus, kembali ke layar login', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    expect(konfirmasi).toHaveBeenCalledWith('Yakin keluar dari dashboard admin?');
    expect(screen.getByRole('heading', { name: 'Masuk Admin' })).toBeInTheDocument();
    expect(localStorage.getItem(KEY_TOKEN_ADMIN)).toBeNull();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    konfirmasi.mockRestore();
  });

  it('tombol Keluar dibatalkan di konfirmasi → tetap di dashboard (token aman)', async () => {
    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    expect(screen.queryByRole('heading', { name: 'Masuk Admin' })).not.toBeInTheDocument();
    expect(localStorage.getItem(KEY_TOKEN_ADMIN)).toBe(TOKEN);
    konfirmasi.mockRestore();
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

  it('inisial dikosongkan → otomatis 2 huruf pertama nama instruktur', async () => {
    mockDaftar.mockResolvedValue([]);
    mockKirim.mockResolvedValue({ ...KURSUS, kode: 'M01' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    fireEvent.change(screen.getByLabelText(/^Target peserta/), { target: { value: 'Mahasiswa' } });
    fireEvent.change(screen.getByLabelText('Judul *'), { target: { value: 'Kursus Inisial' } });
    fireEvent.change(screen.getByLabelText(/deskripsi singkat/i), { target: { value: 'D.' } });
    fireEvent.change(screen.getByLabelText(/tentang kursus/i), { target: { value: 'T.' } });
    fireEvent.change(screen.getByLabelText(/durasi/i), { target: { value: '2 sesi' } });
    fireEvent.change(screen.getByLabelText(/level/i), { target: { value: 'Pemula' } });
    fireEvent.change(screen.getByLabelText(/format/i), { target: { value: 'Online' } });
    fireEvent.change(screen.getByLabelText('Instruktur *'), { target: { value: 'Budi Santoso' } });
    fireEvent.change(screen.getByLabelText(/peran instruktur/i), { target: { value: 'Pengajar' } });
    // Inisial sengaja dibiarkan kosong.
    fireEvent.change(screen.getByLabelText(/hasil belajar/i), { target: { value: 'Hasil 1' } });
    fireEvent.change(screen.getByLabelText('Judul modul 1'), { target: { value: 'M1' } });
    fireEvent.change(screen.getByLabelText('Meta modul 1'), { target: { value: '2 video' } });
    fireEvent.change(screen.getByLabelText('Deskripsi modul 1'), { target: { value: 'D1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockKirim).toHaveBeenCalledWith(
      '/kursus',
      expect.objectContaining({
        body: expect.objectContaining({ inisial: 'BS', instruktur: 'Budi Santoso' }),
      }),
    );
  });

  it('inisial diisi manual → nilai user dipakai (tanpa dioverride)', async () => {
    mockDaftar.mockResolvedValue([]);
    mockKirim.mockResolvedValue({ ...KURSUS, kode: 'M01' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    fireEvent.change(screen.getByLabelText(/^Target peserta/), { target: { value: 'Mahasiswa' } });
    fireEvent.change(screen.getByLabelText('Judul *'), { target: { value: 'Kursus Inisial' } });
    fireEvent.change(screen.getByLabelText(/deskripsi singkat/i), { target: { value: 'D.' } });
    fireEvent.change(screen.getByLabelText(/tentang kursus/i), { target: { value: 'T.' } });
    fireEvent.change(screen.getByLabelText(/durasi/i), { target: { value: '2 sesi' } });
    fireEvent.change(screen.getByLabelText(/level/i), { target: { value: 'Pemula' } });
    fireEvent.change(screen.getByLabelText(/format/i), { target: { value: 'Online' } });
    fireEvent.change(screen.getByLabelText('Instruktur *'), { target: { value: 'Budi Santoso' } });
    fireEvent.change(screen.getByLabelText(/peran instruktur/i), { target: { value: 'Pengajar' } });
    fireEvent.change(screen.getByLabelText(/inisial/i), { target: { value: 'BSant' } });
    fireEvent.change(screen.getByLabelText(/hasil belajar/i), { target: { value: 'Hasil 1' } });
    fireEvent.change(screen.getByLabelText('Judul modul 1'), { target: { value: 'M1' } });
    fireEvent.change(screen.getByLabelText('Meta modul 1'), { target: { value: '2 video' } });
    fireEvent.change(screen.getByLabelText('Deskripsi modul 1'), { target: { value: 'D1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockKirim).toHaveBeenCalledWith(
      '/kursus',
      expect.objectContaining({ body: expect.objectContaining({ inisial: 'BSant' }) }),
    );
  });

  it('form kursus terbagi 5 bagian bernomor + video/kuis di balik disclosure', async () => {
    mockDaftar.mockResolvedValue([]);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    for (const judul of [
      '1. Audiens & kode',
      '2. Isi kursus',
      '3. Detail tampilan',
      '4. Instruktur',
      '5. Modul & materi',
    ]) {
      expect(screen.getByRole('heading', { name: judul })).toBeInTheDocument();
    }

    // Video & kuis dibalik <details> — default tertutup, ringkasan status tampil.
    const details = document.querySelector('form details');
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute('open');
    expect(details?.querySelector('summary')?.textContent).toContain('Video & kuis modul');
    expect(screen.getByText('tanpa video · tanpa kuis')).toBeInTheDocument();
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

  it('tambah anggota → field urutan TIDAK tampil, Simpan → POST /tim (urutan 0 = paling atas)', async () => {
    daftarTim();
    mockKirim.mockResolvedValue({ ...ANGGOTA, id: 5, nama: 'Dr. Baru' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Tim' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    // Item baru tidak perlu menentukan urutan — otomatis paling atas.
    expect(screen.queryByLabelText(/^Urutan/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^Nama/), { target: { value: 'Dr. Baru' } });
    fireEvent.change(screen.getByLabelText(/^Peran/), { target: { value: 'Anggota' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockKirim).toHaveBeenCalledWith('/tim', {
      method: 'POST',
      body: { nama: 'Dr. Baru', peran: 'Anggota', kredensial: '', foto: '', urutan: 0 },
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

describe('Admin — tab Testimoni (lengkapi CRUD admin)', () => {
  /** Fixture testimoni dari backend (membawa id & urutan). */
  const TESTIMONI: Testimoni = {
    id: 4,
    nama: 'Peserta Pelatihan ML',
    peran: 'Mahasiswa',
    kutipan: 'Materi pelatihan runtut.',
    urutan: 0,
  };

  /** Daftar per endpoint: /testimoni dibedakan dari jenis lain. */
  const daftarBaru = (): void => {
    mockDaftar.mockImplementation(async (path: string) =>
      path === '/testimoni' ? ([TESTIMONI] as never) : ([DOK, DOK2] as never),
    );
  };

  it('tab Testimoni → GET /testimoni dimuat & baris tampil', async () => {
    daftarBaru();
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Testimoni' }));
    expect(await screen.findByText('Peserta Pelatihan ML')).toBeInTheDocument();
    expect(mockDaftar).toHaveBeenCalledWith('/testimoni', []);
  });

  it('tambah testimoni → field urutan TIDAK tampil, Simpan → POST (urutan 0 = #1)', async () => {
    daftarBaru();
    mockKirim.mockResolvedValue({ ...TESTIMONI, id: 9, nama: 'Testimoni Baru' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Testimoni' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    // Testimoni baru tidak perlu menentukan urutan — otomatis jadi #1.
    expect(screen.queryByLabelText(/^Urutan/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^Nama/), { target: { value: 'Testimoni Baru' } });
    fireEvent.change(screen.getByLabelText(/^Peran/), { target: { value: 'Dosen' } });
    fireEvent.change(screen.getByLabelText(/^Kutipan/), { target: { value: 'Bagus sekali.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('tersimpan');
    expect(mockKirim).toHaveBeenCalledWith('/testimoni', {
      method: 'POST',
      body: { nama: 'Testimoni Baru', peran: 'Dosen', kutipan: 'Bagus sekali.', urutan: 0 },
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

  it('tab Tim: nama maks 200; urutan disembunyikan saat tambah & dibatasi 0-9999 saat ubah', async () => {
    mockDaftar.mockResolvedValue([ANGGOTA] as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Tim' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    expect(screen.getByLabelText(/^Nama/)).toHaveAttribute('maxlength', '200');
    // Saat tambah urutan tidak diisi manual — item baru otomatis paling atas.
    expect(screen.queryByLabelText(/^Urutan/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    // Tunggu daftar selesai dimuat sebelum mencari tombol Ubah.
    expect(await screen.findByText('Dr. Contoh Saja')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ubah' })[0]);
    expect(screen.getByLabelText(/^Urutan/)).toHaveAttribute('max', '9999');
  });
});
