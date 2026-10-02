import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router-dom';
import Tim from './Tim.tsx';
import Berita from './Berita.tsx';
import BeritaDetail from './BeritaDetail.tsx';
import Dokumentasi from './Dokumentasi.tsx';
import DokumentasiDetail from './DokumentasiDetail.tsx';
import LayananDetail from './LayananDetail.tsx';
import { beritaDummy } from '../data/berita.ts';
import { timDummy } from '../data/tim.ts';
import { KEY_BAHASA, PenyediaBahasa } from '../lib/i18n.tsx';

function renderWithRouter(ui: React.ReactNode, initial = '/') {
  return render(<MemoryRouter initialEntries={[initial]}>{ui}</MemoryRouter>);
}

describe('Tim', () => {
  it('render semua anggota tim', () => {
    renderWithRouter(<Tim />);
    for (const a of timDummy) {
      expect(screen.getByText(a.nama)).toBeInTheDocument();
    }
  });

  it('hierarki: Ketua di baris paling atas, Koordinator & Tim Riset sejajar, sisanya seragam', () => {
    renderWithRouter(<Tim />);

    const kartu = (n: string) => screen.getByText(n).closest('article');
    const ketua = kartu('Dr. Mohammad Farid Naufal');
    const koordinator = kartu('Dr. Monica Widiasri');
    const riset = kartu('Prof. Joko Siswantoro');
    const lain = kartu('Marco Ariano Kristyanto');
    const mendahului = (a: Element | null, b: Element | null) =>
      Boolean(a && b && a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

    // Baris 1: Ketua tunggal (paling atas di DOM).
    expect(ketua?.parentElement?.querySelectorAll('article')).toHaveLength(1);
    expect(mendahului(ketua, koordinator)).toBe(true);

    // Baris 2: Koordinator & Tim Riset sejajar — satu baris, grid 2 kolom.
    expect(koordinator?.parentElement).toBe(riset?.parentElement);
    expect(koordinator?.parentElement?.querySelectorAll('article')).toHaveLength(2);
    expect(koordinator?.parentElement?.className).toContain('md:grid-cols-2');

    // Baris 3: sisanya seragam — baris terpisah, grid 3 kolom.
    expect(koordinator?.parentElement).not.toBe(lain?.parentElement);
    expect(lain?.parentElement?.querySelectorAll('article')).toHaveLength(3);
    expect(lain?.parentElement?.className).toContain('md:grid-cols-3');
  });

  it('filter pencarian menyaring anggota (edge: query tanpa hasil)', () => {
    renderWithRouter(<Tim />);
    fireEvent.change(screen.getByLabelText(/cari anggota tim/i), { target: { value: 'riset' } });
    expect(screen.getByText('Koordinator Riset & Edukasi')).toBeInTheDocument();
    expect(screen.getByText('Tim Riset')).toBeInTheDocument();
    expect(screen.queryByText('Ketua')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/cari anggota tim/i), { target: { value: 'zz-tidak-ada-zz' } });
    expect(screen.getByText(/tidak ada anggota tim yang cocok/i)).toBeInTheDocument();
  });

  it('punya tepat satu h1 dan copy tanpa label "data dummy"', () => {
    renderWithRouter(<Tim />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByText(/data dummy/i)).not.toBeInTheDocument();
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

  it('punya tepat satu h1 dan copy tanpa label "data dummy"', () => {
    renderWithRouter(<Berita />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByText(/data dummy/i)).not.toBeInTheDocument();
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

  it('header (meta + judul + ringkasan) dipusatkan, link kembali ikut center', () => {
    renderDetail(beritaDummy[0].slug);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.parentElement?.className).toContain('text-center');
    const kembali = screen.getByRole('link', { name: /kembali ke daftar berita/i });
    expect(kembali.parentElement?.className).toContain('text-center');
  });

  it('edge case: slug tidak dikenal tampilkan state tidak ditemukan', () => {
    renderDetail('slug-aneh');
    expect(screen.getByText(/tidak ditemukan/i)).toBeInTheDocument();
  });
});

describe('Dokumentasi', () => {
  it('tanpa pencarian hanya menampilkan 3 dokumentasi terbaru (urut tanggal turun)', () => {
    renderWithRouter(<Dokumentasi />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
    expect(screen.getAllByRole('link', { name: /lihat detail/i })).toHaveLength(3);
    // 3 terbaru dari 9 entri (3 kegiatan + 6 karya portofolio) — karya & kegiatan tercampur.
    expect(screen.getByText('Klasifikasi X-Ray Pneumonia')).toBeInTheDocument();
    expect(screen.getByText('Demo Inference Solution untuk Mitra')).toBeInTheDocument();
    expect(screen.getByText('Rekomendasi Implan Gigi Otomatis')).toBeInTheDocument();
    // Entri lebih lama baru muncul lewat pencarian.
    expect(screen.queryByText('Workshop Pengenalan GPU Lab')).not.toBeInTheDocument();
  });

  it('filter pencarian menelusuri seluruh arsip (edge: query tanpa hasil)', () => {
    renderWithRouter(<Dokumentasi />);
    fireEvent.change(screen.getByLabelText(/cari dokumentasi/i), { target: { value: 'workshop' } });
    expect(screen.getByText('Workshop Pengenalan GPU Lab')).toBeInTheDocument();
    expect(screen.queryByText('Kunjungan Industri Semester Genap')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/cari dokumentasi/i), { target: { value: 'zz-tidak-ada-zz' } });
    expect(screen.getByText(/tidak ada dokumentasi yang cocok/i)).toBeInTheDocument();
  });

  it('punya tepat satu h1 dan copy tanpa label "data dummy"', () => {
    renderWithRouter(<Dokumentasi />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByText(/data dummy/i)).not.toBeInTheDocument();
  });
});

describe('DokumentasiDetail', () => {
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

describe('LayananDetail', () => {
  it('render detail layanan pelatihan (fitur + CTA)', () => {
    render(
      <MemoryRouter initialEntries={['/layanan/pelatihan']}>
        <Routes>
          <Route path="/layanan/:slug" element={<LayananDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Pelatihan');
    expect(screen.getByRole('heading', { name: 'Yang Anda dapatkan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /hubungi kami/i })).toHaveAttribute('href', '/beranda#kontak');
    // Hero pelatihan memakai komposisi rata kiri; CTA penutup tetap terpusat.
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.parentElement?.tagName).toBe('HEADER');
    expect(h1.closest('section')?.className).toContain('bg-navy');
    const cta = screen.getByRole('link', { name: /hubungi kami/i });
    expect(cta.parentElement?.className).toContain('justify-center');
  });

  it('edge case: slug layanan tidak dikenal (mis. layanan yang dihapus)', () => {
    render(
      <MemoryRouter initialEntries={['/layanan/gpu-rental']}>
        <Routes>
          <Route path="/layanan/:slug" element={<LayananDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/layanan tidak ditemukan/i)).toBeInTheDocument();
  });

  it('pelatihan: menampilkan stats, katalog kursus, modul unggulan, dan blok institusi', () => {
    render(
      <MemoryRouter initialEntries={['/layanan/pelatihan']}>
        <Routes>
          <Route path="/layanan/:slug" element={<LayananDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    // Ringkasan program
    expect(screen.getByText('Materi bertahap')).toBeInTheDocument();
    // Katalog: intro + ketiga kursus nyata (R01/E01/P01)
    expect(screen.getByRole('heading', { name: 'Pilih program sesuai kebutuhan' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'AI untuk Mencari dan Mengelola Referensi Jurnal' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Merancang Pembelajaran dengan AI' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Produktivitas Akademik dengan AI' })).toBeInTheDocument();
    // Modul unggulan + institusi
    expect(screen.getByRole('heading', { name: 'AI untuk mencari referensi jurnal' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Butuh pelatihan yang sesuai kebutuhan tim?' })).toBeInTheDocument();
    // CTA tiap kartu membuka halaman detail kursusnya
    const ctaKartu = screen.getAllByRole('link', { name: /lihat detail kursus/i });
    expect(ctaKartu.map((a) => a.getAttribute('href'))).toEqual([
      '/layanan/pelatihan/R01',
      '/layanan/pelatihan/E01',
      '/layanan/pelatihan/P01',
    ]);
    // Judul kartu juga bisa diklik menuju halaman detail
    expect(
      screen.getByRole('link', { name: 'AI untuk Mencari dan Mengelola Referensi Jurnal' }),
    ).toHaveAttribute('href', '/layanan/pelatihan/R01');
    // Blok Modul unggulan tetap memakai CTA WhatsApp
    const ctaUnggulan = screen.getByRole('link', { name: /tanyakan program ini/i });
    expect(ctaUnggulan.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//);
    // Konten inference tidak bocor ke halaman pelatihan
    expect(screen.queryByRole('heading', { name: 'Apa itu Inference Solution?' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Bagaimana cara kerjanya?' })).not.toBeInTheDocument();
  });

  it('pelatihan: filter kategori menyaring kartu kursus (Guru → hanya E01, reset ke semua)', () => {
    render(
      <MemoryRouter initialEntries={['/layanan/pelatihan']}>
        <Routes>
          <Route path="/layanan/:slug" element={<LayananDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Guru' }));
    expect(screen.getByRole('heading', { name: 'Merancang Pembelajaran dengan AI' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Produktivitas Akademik dengan AI' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guru' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Semua program' }));
    expect(screen.getByRole('heading', { name: 'Produktivitas Akademik dengan AI' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI untuk Mencari dan Mengelola Referensi Jurnal' })).toBeInTheDocument();
  });

  it('inference-solution: tanpa katalog/modul pelatihan (section khusus pelatihan saja)', () => {
    render(
      <MemoryRouter initialEntries={['/layanan/inference-solution']}>
        <Routes>
          <Route path="/layanan/:slug" element={<LayananDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Inference Solution');
    expect(screen.queryByRole('heading', { name: 'Pilih program sesuai kebutuhan' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Butuh pelatihan yang sesuai kebutuhan tim?' })).not.toBeInTheDocument();
    // Konten hero khusus pelatihan juga tidak bocor
    expect(screen.queryByRole('heading', { name: 'Dari konsep menuju penerapan.' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Lihat program pelatihan' })).not.toBeInTheDocument();
  });

  it('inference-solution: panel "Apa itu", alur 5 langkah, dan contoh penerapan tampil', () => {
    render(
      <MemoryRouter initialEntries={['/layanan/inference-solution']}>
        <Routes>
          <Route path="/layanan/:slug" element={<LayananDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    // Panel penjelasan + tanda kebutuhan
    expect(screen.getByRole('heading', { name: 'Apa itu Inference Solution?' })).toBeInTheDocument();
    expect(screen.getByText(/Inference adalah tahap menjalankan model/i)).toBeInTheDocument();
    expect(screen.getByText('Kapan Anda membutuhkannya?')).toBeInTheDocument();
    // Alur kerja: heading + langkah pertama & terakhir
    expect(screen.getByRole('heading', { name: 'Bagaimana cara kerjanya?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Konsultasi & audit kebutuhan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Operasional & purna implementasi' })).toBeInTheDocument();
    // Contoh penerapan: chip karya + tautan portofolio + CTA WhatsApp
    expect(screen.getByRole('heading', { name: 'Contoh penerapan' })).toBeInTheDocument();
    expect(screen.getByText('Algae Finder')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat portofolio lengkap' })).toHaveAttribute(
      'href',
      '/dokumentasi',
    );
    expect(screen.getByRole('link', { name: 'Diskusikan kebutuhan Anda' }).getAttribute('href')).toMatch(
      /^https:\/\/wa\.me\//,
    );
  });

  it('inference-solution: penjelasan & alur diterjemahkan ke EN', () => {
    localStorage.setItem(KEY_BAHASA, 'en');
    render(
      <PenyediaBahasa>
        <MemoryRouter initialEntries={['/layanan/inference-solution']}>
          <Routes>
            <Route path="/layanan/:slug" element={<LayananDetail />} />
          </Routes>
        </MemoryRouter>
      </PenyediaBahasa>,
    );
    expect(screen.getByRole('heading', { name: 'What is an Inference Solution?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How does it work?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Discuss your needs' })).toBeInTheDocument();
    localStorage.clear();
  });

  it('pelatihan: panel pendekatan dan tombol hero mengarah ke bagian yang tepat', () => {
    render(
      <MemoryRouter initialEntries={['/layanan/pelatihan']}>
        <Routes>
          <Route path="/layanan/:slug" element={<LayananDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Pendekatan belajar')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dari konsep menuju penerapan.' })).toBeInTheDocument();
    expect(screen.getByText(/setiap program memadukan konsep inti/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat program pelatihan' })).toHaveAttribute('href', '#katalog');
    expect(screen.getByRole('link', { name: 'Konsultasi pelatihan tim' })).toHaveAttribute(
      'href',
      '#layanan-kustom',
    );
    expect(document.getElementById('katalog')).not.toBeNull();
    expect(document.getElementById('layanan-kustom')).not.toBeNull();
  });

  it('pelatihan: panel dan tombol hero diterjemahkan ke EN', () => {
    localStorage.setItem(KEY_BAHASA, 'en');
    render(
      <PenyediaBahasa>
        <MemoryRouter initialEntries={['/layanan/pelatihan']}>
          <Routes>
            <Route path="/layanan/:slug" element={<LayananDetail />} />
          </Routes>
        </MemoryRouter>
      </PenyediaBahasa>,
    );
    expect(
      screen.getByRole('heading', { name: 'From concepts to application.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore training programs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Discuss team training' })).toBeInTheDocument();
    localStorage.clear();
  });
});

/** Probe lokasi: menampilkan nilai param ?q= untuk memverifikasi state tersimpan di URL. */
function QProbe() {
  const [params] = useSearchParams();
  return <span data-testid="q-probe">{params.get('q') ?? ''}</span>;
}

describe('pencarian halaman list tersimpan di URL (?q=)', () => {
  it('deep-link: ?q= dari URL langsung memfilter hasil dan mengisi input', () => {
    renderWithRouter(<Tim />, '/tim?q=riset');
    expect(screen.getByText('Koordinator Riset & Edukasi')).toBeInTheDocument();
    expect(screen.queryByText('Ketua')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/cari anggota tim/i)).toHaveValue('riset');
  });

  it('deep-link edge: ?q= tanpa hasil langsung menampilkan empty state', () => {
    renderWithRouter(<Berita />, '/berita?q=zz-tidak-ada-zz');
    expect(screen.getByText(/tidak ada berita yang cocok/i)).toBeInTheDocument();
  });

  it('mengetik memperbarui param q di URL + input beratribut search & hasil aria-live', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/tim']}>
        <Tim />
        <QProbe />
      </MemoryRouter>,
    );
    const input = screen.getByLabelText(/cari anggota tim/i);
    expect(input).toHaveAttribute('type', 'search');
    expect(input).toHaveAttribute('name', 'q');
    expect(input).toHaveAttribute('autocomplete', 'off');

    fireEvent.change(input, { target: { value: 'riset' } });
    expect(screen.getByTestId('q-probe')).toHaveTextContent('riset');
    // Wrapper hasil memakai aria-live agar screen reader mengumumkan perubahan
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull();
  });
});
