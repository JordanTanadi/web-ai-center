import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SiteLayout, { Footer, Header } from './SiteLayout.tsx';
import { kontakDummy, petaUrlKontak, waLinkKontak } from '../data/kontak.ts';
import { resetFreshDocument } from '../lib/routeScroll.ts';
import { KEY_BAHASA, PenyediaBahasa } from '../lib/i18n.tsx';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Footer', () => {
  it('menampilkan deskripsi dan alamat dari data kontak', () => {
    renderWithRouter(<Footer />);

    expect(screen.getByText(kontakDummy.deskripsiFooter)).toBeInTheDocument();
    for (const baris of kontakDummy.alamat) {
      expect(screen.getByText(new RegExp(baris))).toBeInTheDocument();
    }
  });

  it('tautan email, WhatsApp, dan website memakai nilai dari data kontak', () => {
    renderWithRouter(<Footer />);

    expect(screen.getByRole('link', { name: kontakDummy.email })).toHaveAttribute(
      'href',
      `mailto:${kontakDummy.email}`,
    );
    expect(screen.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute(
      'href',
      waLinkKontak(kontakDummy),
    );
    expect(screen.getByRole('link', { name: new RegExp(kontakDummy.websiteLabel) })).toHaveAttribute(
      'href',
      kontakDummy.websiteUrl,
    );
  });

  it('footer memuat link Instagram dari data kontak (target blank + noreferrer)', () => {
    renderWithRouter(<Footer />);

    const ig = screen.getByRole('link', { name: /Instagram/ });
    expect(ig).toHaveAttribute('href', kontakDummy.instagramUrl);
    expect(ig).toHaveAttribute('target', '_blank');
    expect(ig.getAttribute('rel')).toContain('noreferrer');
  });

  it('alamat footer link ke Google Maps (target blank + noreferrer)', () => {
    renderWithRouter(<Footer />);

    const alamat = screen.getByRole('link', { name: /Gedung Fakultas Teknik/ });
    expect(alamat).toHaveAttribute('href', petaUrlKontak(kontakDummy));
    expect(alamat).toHaveAttribute('target', '_blank');
    expect(alamat.getAttribute('rel')).toContain('noreferrer');
  });

  it('tautan kontak footer memakai ikon dekoratif (email, WA, web, IG)', () => {
    renderWithRouter(<Footer />);

    const address = document.querySelector('footer address');
    expect(address?.querySelectorAll('svg[aria-hidden="true"]').length).toBe(4);
  });

  it('peta tampil di bawah grid footer dengan pin koordinat', () => {
    renderWithRouter(<Footer />);

    const frame = screen.getByTitle('Peta lokasi AI Center');
    expect(frame.closest('footer')).not.toBeNull();
    expect(frame).toHaveAttribute(
      'src',
      expect.stringContaining(`${kontakDummy.latitude},${kontakDummy.longitude}`),
    );
  });

  it('peta footer kecil di sebelah kolom Layanan (mini, sesudah nav Layanan)', () => {
    renderWithRouter(<Footer />);

    const frame = screen.getByTitle('Peta lokasi AI Center');
    expect(frame.className).toContain('min-h-[160px]');
    const navLayanan = screen.getByRole('navigation', { name: 'Layanan AI Center' });
    expect(navLayanan.parentElement?.contains(frame)).toBe(true);
    expect(Boolean(navLayanan.compareDocumentPosition(frame) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(
      true,
    );
  });

  it('menautkan halaman populer dan layanan (Pelatihan + Inference Solution saja)', () => {
    renderWithRouter(<Footer />);

    const navPopuler = screen.getByRole('navigation', { name: 'Halaman populer' });
    expect(navPopuler).toHaveTextContent('Beranda');

    const navLayanan = screen.getByRole('navigation', { name: 'Layanan AI Center' });
    expect(navLayanan).toHaveTextContent('Pelatihan');
    expect(navLayanan).toHaveTextContent('Inference Solution');
    expect(navLayanan).not.toHaveTextContent('GPU Rental');
  });

  it('link layanan menunjuk halaman detail (/layanan/:slug), bukan dua-duanya ke #layanan', () => {
    renderWithRouter(<Footer />);

    const navLayanan = screen.getByRole('navigation', { name: 'Layanan AI Center' });
    expect(navLayanan).toHaveTextContent('Pelatihan');
    expect(screen.getByRole('link', { name: 'Pelatihan' })).toHaveAttribute('href', '/layanan/pelatihan');
    expect(screen.getByRole('link', { name: 'Inference Solution' })).toHaveAttribute(
      'href',
      '/layanan/inference-solution',
    );
  });
});

describe('Header', () => {
  it('menyediakan navigasi utama dan tombol kontrol menu seluler', () => {
    renderWithRouter(<Header />);

    expect(screen.getByRole('navigation', { name: 'Navigasi utama' })).toBeInTheDocument();
    const tombolMenu = screen.getByRole('button', { name: 'Buka menu' });
    expect(tombolMenu).toHaveAttribute('aria-expanded', 'false');
  });

  it('navbar desktop aktif untuk pointer presisi (desktop); burger untuk layar sentuh/sempit', () => {
    renderWithRouter(<Header />);

    // ≥1024px (lg) selalu navbar; 768–1023px navbar hanya untuk desktop
    // (fine-pointer) dalam mode kompak; sisanya burger.
    const nav = screen.getByRole('navigation', { name: 'Navigasi utama' });
    expect(nav.className).toContain('md:fine-pointer:max-lg:flex');
    expect(nav.className).toContain('lg:flex');

    const tombolMenu = screen.getByRole('button', { name: 'Buka menu' });
    expect(tombolMenu.className).toContain('md:fine-pointer:hidden');
    expect(tombolMenu.className).toContain('lg:hidden');
  });
});

describe('SiteLayout — mode EN', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(KEY_BAHASA, 'en');
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('preferensi en tersimpan: nav & footer memakai padanan EN', () => {
    renderWithRouter(
      <PenyediaBahasa>
        <Header />
        <Footer />
      </PenyediaBahasa>,
    );

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveTextContent('Home');
    expect(screen.getByRole('navigation', { name: 'Popular pages' })).toHaveTextContent(
      'Documentation',
    );
    expect(screen.getByRole('navigation', { name: 'AI Center Services' })).toHaveTextContent(
      'Training',
    );
  });

  it('LanguageToggle di header mengganti ID ↔ EN secara langsung', () => {
    localStorage.clear(); // mulai dari ID
    renderWithRouter(
      <PenyediaBahasa>
        <Header />
      </PenyediaBahasa>,
    );

    expect(screen.getByRole('navigation', { name: 'Navigasi utama' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Switch language' })).toHaveTextContent('EN');

    fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveTextContent('Home');
    expect(screen.getByRole('button', { name: 'Switch language' })).toHaveTextContent('ID');
    expect(localStorage.getItem(KEY_BAHASA)).toBe('en');
  });
});

describe('SiteLayout — gulir mengikuti navigasi', () => {
  beforeEach(() => {
    resetFreshDocument();
    vi.mocked(window.scrollTo).mockClear();
  });

  function renderLayout(awal = '/beranda') {
    return render(
      <MemoryRouter initialEntries={[awal]}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/beranda" element={<p>halaman beranda</p>} />
            <Route path="/tentang-kami" element={<p>halaman tentang kami</p>} />
            <Route path="/tim" element={<p>halaman tim</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  }

  it('muat awal tanpa hash tidak memaksa scroll (posisi diserahkan ke browser)', () => {
    renderLayout('/beranda');

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('navigasi antar rute mengembalikan scroll ke atas', () => {
    renderLayout('/beranda');

    fireEvent.click(screen.getByRole('link', { name: 'Tim' }));

    expect(screen.getByText('halaman tim')).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('klik Kontak di halaman yang sama tetap menggulir ke footer #kontak', () => {
    renderLayout('/tentang-kami');
    const footer = document.getElementById('kontak');
    expect(footer).not.toBeNull();
    const spy = vi.fn();
    (footer as HTMLElement).scrollIntoView = spy;

    fireEvent.click(screen.getByRole('link', { name: 'Kontak' }));

    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('StrictMode: efek mount ganda tidak membuat scroll dipanggil dua kali', () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/beranda']}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/beranda" element={<p>halaman beranda</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    );

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
