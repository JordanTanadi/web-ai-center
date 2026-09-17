import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Beranda from './Beranda.tsx';
import Tim from './Tim.tsx';
import Berita from './Berita.tsx';
import BeritaDetail from './BeritaDetail.tsx';
import Dokumentasi from './Dokumentasi.tsx';
import DokumentasiDetail from './DokumentasiDetail.tsx';
import { beritaDummy } from '../data/berita.ts';
import { dokumentasiDummy } from '../data/dokumentasi.ts';

function renderWithRouter(ui: React.ReactNode, initial = '/') {
  return render(<MemoryRouter initialEntries={[initial]}>{ui}</MemoryRouter>);
}

describe('Beranda', () => {
  it('render hero carousel AI Center dan daftar layanan', () => {
    renderWithRouter(<Beranda />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Pusat Riset/);
    expect(screen.getByRole('tablist', { name: /pilih slide/i })).toBeInTheDocument();
    expect(screen.getByText('GPU Rental')).toBeInTheDocument();
  });

  it('urutan section: layanan → dokumentasi → our client → testimoni → berita', () => {
    renderWithRouter(<Beranda />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      'Pilih Jalur Kolaborasimu',
      'Dokumentasi Kegiatan',
      'Our Client',
      'Apa Kata Mereka?',
      'Berita Terkini',
    ]);
  });

  it('highlight dokumentasi & berita: 3 card statis + button kanan atas, tanpa link per-card', () => {
    const { container } = renderWithRouter(<Beranda />);
    // Tepat 3 card dokumentasi (tanpa link) dan 3 card berita (tanpa "Baca selengkapnya")
    const dokSection = screen.getByText('Dokumentasi Kegiatan').closest('section')!;
    expect(within(dokSection).getAllByRole('article')).toHaveLength(3);
    expect(within(dokSection).queryByRole('link', { name: /lihat detail/i })).toBeNull();
    // Slot gambar masih placeholder (dummy belum punya gambar)
    expect(within(dokSection).queryByRole('img')).toBeNull();
    expect(within(dokSection).getByRole('link', { name: /lihat semua/i })).toHaveAttribute('href', '/dokumentasi');

    const beritaSection = screen.getByText('Berita Terkini').closest('section')!;
    expect(within(beritaSection).getAllByRole('article')).toHaveLength(3);
    expect(within(beritaSection).queryByRole('link', { name: /baca selengkapnya/i })).toBeNull();
    // Slot gambar masih placeholder (dummy belum punya gambar)
    expect(within(beritaSection).queryByRole('img')).toBeNull();
    expect(within(beritaSection).getByRole('link', { name: /lihat semua/i })).toHaveAttribute('href', '/berita');
    expect(container).toBeInTheDocument();
  });

  it('our client carousel dots tanpa tombol panah dan testimoni tampil', () => {
    renderWithRouter(<Beranda />);
    const klienSection = screen.getByText('Our Client').closest('section')!;
    expect(within(klienSection).getByRole('region', { name: /daftar klien/i })).toBeInTheDocument();
    expect(within(klienSection).getByRole('tablist', { name: /pilih halaman klien/i })).toBeInTheDocument();
    expect(within(klienSection).queryByRole('button', { name: /sebelumnya|berikutnya/i })).toBeNull();
    expect(screen.getByRole('button', { name: /testimoni berikutnya/i })).toBeInTheDocument();
  });
});

describe('Tim', () => {
  it('render semua anggota dummy', () => {
    renderWithRouter(<Tim />);
    for (const name of ['Kepala AI Center', 'Koordinator Riset']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('filter pencarian menyaring anggota (edge: query tanpa hasil)', () => {
    renderWithRouter(<Tim />);
    fireEvent.change(screen.getByLabelText(/cari anggota tim/i), { target: { value: 'riset' } });
    expect(screen.getByText('Koordinator Riset')).toBeInTheDocument();
    expect(screen.queryByText('Koordinator Pelatihan')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/cari anggota tim/i), { target: { value: 'zz-tidak-ada-zz' } });
    expect(screen.getByText(/tidak ada anggota tim yang cocok/i)).toBeInTheDocument();
  });
});

describe('Berita', () => {
  it('render SEMUA item tanpa batas 3 (limit hanya untuk highlight beranda)', () => {
    renderWithRouter(<Berita />);
    for (const b of beritaDummy) {
      expect(screen.getByText(b.judul)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('article')).toHaveLength(beritaDummy.length);
  });

  it('filter pencarian menyaring daftar (edge: query tanpa hasil)', () => {
    renderWithRouter(<Berita />);
    expect(screen.getByText(beritaDummy[0].judul)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/cari berita/i), { target: { value: 'zz-tidak-ada-zz' } });
    expect(screen.getByText(/tidak ada berita yang cocok/i)).toBeInTheDocument();
  });
});

describe('BeritaDetail', () => {
  function renderDetail(slug: string) {
    return render(
      <MemoryRouter initialEntries={[`/berita/${slug}`]}>
        <Routes>
          <Route path="/berita/:slug" element={<BeritaDetail />} />
        </Routes>
      </MemoryRouter>,
    );
  }
  it('render detail untuk slug valid', () => {
    renderDetail(beritaDummy[0].slug);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(beritaDummy[0].judul);
  });
  it('edge case: slug tidak dikenal tampilkan state tidak ditemukan', () => {
    renderDetail('slug-aneh');
    expect(screen.getByText(/tidak ditemukan/i)).toBeInTheDocument();
  });
});

describe('Dokumentasi', () => {
  it('render daftar dengan slot gambar dan link detail tiap card', () => {
    renderWithRouter(<Dokumentasi />);
    expect(screen.getByText('Workshop Pengenalan GPU Lab')).toBeInTheDocument();
    // Tiap card punya slot gambar (placeholder karena dummy belum punya gambar)
    // dan link "Lihat detail" ke halaman detailnya
    const cards = screen.getAllByRole('article');
    // Tanpa batas 3: jumlah card = jumlah data (limit hanya untuk highlight beranda)
    expect(cards).toHaveLength(dokumentasiDummy.length);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getAllByRole('link', { name: /lihat detail/i })).toHaveLength(3);
  });

  it('filter pencarian menyaring daftar (edge: query tanpa hasil)', () => {
    renderWithRouter(<Dokumentasi />);
    expect(screen.getByText('Workshop Pengenalan GPU Lab')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/cari dokumentasi/i), { target: { value: 'workshop' } });
    expect(screen.getByText('Workshop Pengenalan GPU Lab')).toBeInTheDocument();
    expect(screen.queryByText('Kunjungan Industri Semester Genap')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/cari dokumentasi/i), { target: { value: 'zz-tidak-ada-zz' } });
    expect(screen.getByText(/tidak ada dokumentasi yang cocok/i)).toBeInTheDocument();
  });

  it('render detail valid', () => {
    render(
      <MemoryRouter initialEntries={['/dokumentasi/workshop-pengenalan-gpu-lab']}>
        <Routes>
          <Route path="/dokumentasi/:slug" element={<DokumentasiDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Workshop Pengenalan GPU Lab/i);
  });

  it('edge case: slug dokumentasi tidak dikenal', () => {
    render(
      <MemoryRouter initialEntries={['/dokumentasi/xxx']}>
        <Routes>
          <Route path="/dokumentasi/:slug" element={<DokumentasiDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/tidak ditemukan/i)).toBeInTheDocument();
  });
});
