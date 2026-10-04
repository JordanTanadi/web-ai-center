import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Admin, { KEY_TOKEN_ADMIN } from './Admin.tsx';
import { ambilDaftar, kirimFileAdmin, kirimJsonAdmin } from '../lib/api.ts';
import type { DokumentasiItem } from '../data/dokumentasi.ts';
import type { BeritaItem } from '../data/berita.ts';
import type { Kursus } from '../data/pelatihan.ts';

// Mock modul api: test deterministik tanpa backend (Admin hanya memakai
// ambilDaftar untuk read & kirimJsonAdmin/kirimFileAdmin untuk write).
vi.mock('../lib/api.ts', () => ({
  ambilDaftar: vi.fn(),
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

/** Render dengan sesi sudah ada di localStorage (langsung ke dashboard). */
async function renderDashboard(): Promise<void> {
  localStorage.setItem(KEY_TOKEN_ADMIN, TOKEN);
  render(<Admin />);
  await screen.findByRole('heading', { name: 'Dashboard Admin' });
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
    fireEvent.change(screen.getByLabelText(/^Kategori/), { target: { value: 'Project' } });
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
    expect(screen.getByLabelText(/^Kategori/)).toHaveValue('Project');

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
    fireEvent.change(screen.getByLabelText(/^Kategori/), { target: { value: 'Project' } });
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
    fireEvent.change(screen.getByLabelText(/^Kategori/), { target: { value: 'Project' } });
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
    mockKirim.mockResolvedValue({ ...KURSUS, kode: 'P02', judul: 'Kursus Baru' } as never);
    await renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: 'Kursus' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tambah baru' }));

    fireEvent.change(screen.getByLabelText(/kode/i), { target: { value: 'P02' } });
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
    fireEvent.change(screen.getByLabelText(/target peserta/i), { target: { value: 'Mahasiswa' } });
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
          kode: 'P02',
          target: ['Mahasiswa'],
          modul: [{ judul: 'M1', deskripsi: 'D1', meta: '2 video' }],
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
    // Kode adalah kunci: tidak boleh diganti saat edit.
    expect(screen.getByLabelText(/^Kode/)).toBeDisabled();
    expect(screen.getByText(/kode kunci tidak bisa diganti/i)).toBeInTheDocument();

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
