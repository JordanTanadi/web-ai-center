import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Admin, { KEY_TOKEN_ADMIN } from './Admin.tsx';
import { ambilDaftar, kirimJsonAdmin } from '../lib/api.ts';
import type { DokumentasiItem } from '../data/dokumentasi.ts';
import type { BeritaItem } from '../data/berita.ts';

// Mock modul api: test deterministik tanpa backend (Admin hanya memakai
// ambilDaftar untuk read & kirimJsonAdmin untuk write).
vi.mock('../lib/api.ts', () => ({
  ambilDaftar: vi.fn(),
  kirimJsonAdmin: vi.fn(),
}));

const mockDaftar = vi.mocked(ambilDaftar);
const mockKirim = vi.mocked(kirimJsonAdmin);

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
});
