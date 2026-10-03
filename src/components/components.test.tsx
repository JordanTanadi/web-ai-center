import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SectionHeading from './SectionHeading.tsx';
import NewsCard, { aksenKategori } from './NewsCard.tsx';
import { aset } from '../lib/basis.ts';
import DokumentasiCard from './DokumentasiCard.tsx';
import TeamCard from './TeamCard.tsx';
import { Header, Footer } from './SiteLayout.tsx';
import { kontakDummy } from '../data/kontak.ts';

describe('SectionHeading', () => {
  it('render kicker, title, dan sub', () => {
    render(<SectionHeading kicker="Berita" title="Berita Terkini" sub="Kabar terbaru" />);
    expect(screen.getByText('Berita Terkini')).toBeInTheDocument();
    expect(screen.getByText('Kabar terbaru')).toBeInTheDocument();
  });

  it('edge case: tanpa sub tidak render paragraf sub', () => {
    const { container } = render(<SectionHeading kicker="Tim" title="Tim Kami" />);
    expect(screen.getByText('Tim Kami')).toBeInTheDocument();
    expect(container.querySelectorAll('p').length).toBe(0);
  });

  it('level default h2 (section di dalam halaman)', () => {
    render(<SectionHeading kicker="Berita" title="Berita Terkini" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Berita Terkini' })).toBeInTheDocument();
  });

  it('level="h1" render judul utama halaman (hierarki heading)', () => {
    render(<SectionHeading kicker="Konten" title="Berita" level="h1" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Berita' })).toBeInTheDocument();
  });

  it('kicker memakai font mono (Geist Mono) untuk elemen teknis', () => {
    render(<SectionHeading kicker="Berita" title="Berita Terkini" />);
    expect(screen.getByText('Berita').className).toContain('font-mono');
  });

  it('kicker eyebrow ala situs patokan: dot aksen + uppercase tracking', () => {
    const { container } = render(<SectionHeading kicker="Berita" title="Berita Terkini" />);
    const kicker = screen.getByText('Berita');
    expect(kicker.className).toContain('uppercase');
    const dot = container.querySelector('span span[aria-hidden="true"]');
    expect(dot).not.toBeNull();
    expect(dot?.className).toContain('rounded-full');
  });

  it('tone dark memakai dot kuning agar kontras di navy', () => {
    const { container } = render(<SectionHeading kicker="Kontak" title="Kontak" tone="dark" />);
    const dot = container.querySelector('span span[aria-hidden="true"]');
    expect(dot?.className).toContain('bg-yellow');
  });
});

describe('NewsCard', () => {
  const item = {
    slug: 'uji-coba',
    judul: 'Judul Uji',
    ringkasan: 'Ringkasan uji',
    isi: 'Isi',
    tanggal: '2026-08-01',
    penulis: 'Penulis',
  };

  it('render judul dan link ke detail', () => {
    render(
      <MemoryRouter>
        <NewsCard item={item} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Judul Uji')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /baca selengkapnya/i })).toHaveAttribute('href', '/berita/uji-coba');
  });

  it('showLink=false menyembunyikan link (untuk highlight statis beranda)', () => {
    render(
      <MemoryRouter>
        <NewsCard item={item} showLink={false} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Judul Uji')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('slot gambar: tampilkan img bila ada, placeholder bila kosong', () => {
    const { rerender } = render(
      <MemoryRouter>
        <NewsCard item={{ ...item, gambar: '/hero-1-800.webp' }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: 'Judul Uji' })).toHaveAttribute('src', aset('/hero-1-800.webp'));
    rerender(
      <MemoryRouter>
        <NewsCard item={item} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('DokumentasiCard', () => {
  const item = {
    slug: 'uji-dok',
    judul: 'Dok Uji',
    deskripsi: 'Deskripsi uji',
    tanggal: '2026-07-15',
    kategori: 'Workshop',
  };

  it('render judul dan link ke detail', () => {
    render(
      <MemoryRouter>
        <DokumentasiCard item={item} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Dok Uji')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lihat detail/i })).toHaveAttribute('href', '/dokumentasi/uji-dok');
  });

  it('showLink=false menyembunyikan link (untuk highlight statis beranda)', () => {
    render(
      <MemoryRouter>
        <DokumentasiCard item={item} showLink={false} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('slot gambar: tampilkan img bila ada, placeholder bila kosong', () => {
    const { rerender } = render(
      <MemoryRouter>
        <DokumentasiCard item={{ ...item, gambar: '/hero-2-800.webp' }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: 'Dok Uji' })).toHaveAttribute('src', aset('/hero-2-800.webp'));
    rerender(
      <MemoryRouter>
        <DokumentasiCard item={item} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('chip kategori memakai aksen Figma + font mono (Geist Mono)', () => {
    render(
      <MemoryRouter>
        <DokumentasiCard item={{ ...item, kategori: 'Demo' }} />
      </MemoryRouter>,
    );
    const chip = screen
      .getAllByText('Demo')
      .find((el) => el.tagName === 'SPAN' && el.className.includes('font-mono'));
    expect(chip).not.toBeUndefined();
    expect(chip?.className).toMatch(/bg-orange/);
  });

  it('placeholder tanpa gambar: panel gradient + label kategori (tetap tanpa img)', () => {
    render(
      <MemoryRouter>
        <DokumentasiCard item={item} showLink={false} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('img')).toBeNull();
    // Kategori muncul 2x: chip + label panel placeholder.
    expect(screen.getAllByText('Workshop').length).toBeGreaterThanOrEqual(2);
  });
});

describe('aksenKategori (token Figma)', () => {
  it('memetakan kategori ke warna pelengkap', () => {
    expect(aksenKategori('Workshop')).toContain('bg-yellow');
    expect(aksenKategori('Demo')).toContain('bg-orange');
    expect(aksenKategori('Kunjungan')).toContain('bg-mint');
    expect(aksenKategori('Kesehatan')).toContain('bg-teal');
  });
});

describe('TeamCard', () => {
  it('render nama, peran, dan kredensial opsional', () => {
    render(<TeamCard anggota={{ nama: 'Budi', peran: 'Riset', kredensial: 'M.Kom.' }} />);
    expect(screen.getByText('Budi')).toBeInTheDocument();
    expect(screen.getByText('M.Kom.')).toBeInTheDocument();
  });

  it('edge case: tanpa kredensial tetap render', () => {
    render(<TeamCard anggota={{ nama: 'Ani', peran: 'Pelatihan' }} />);
    expect(screen.getByText('Ani')).toBeInTheDocument();
  });

  it('edge case: nama kosong memakai fallback "?"', () => {
    render(<TeamCard anggota={{ nama: '', peran: 'Riset' }} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});

describe('Header', () => {
  function renderHeader(initial = '/beranda') {
    return render(
      <MemoryRouter initialEntries={[initial]}>
        <Header />
      </MemoryRouter>,
    );
  }

  it('urutan logo: Ubaya dulu baru AI Center', () => {
    renderHeader();
    const brand = screen.getByRole('link', { name: /ai center ubaya beranda/i });
    const imgs = within(brand).getAllByRole('img');
    expect(imgs[0]).toHaveAttribute('alt', 'Logo Ubaya');
    expect(imgs[1]).toHaveAttribute('alt', 'Logo AI Center');
  });

  it('logo header menyesuaikan breakpoint: h-7 di <640 & 768–1023 (kompak), h-9 di 640–767 & ≥1024', () => {
    renderHeader();
    const brand = screen.getByRole('link', { name: /ai center ubaya beranda/i });
    const [ubaya, aiCenter] = within(brand).getAllByRole('img');
    expect(ubaya.className).toMatch(/h-7 w-auto sm:max-md:h-9 lg:h-9/);
    expect(aiCenter.className).toMatch(/h-8 w-auto sm:max-md:h-10 lg:h-10/);
  });

  it('menu utama: Beranda, Layanan, Konten, Tim, Tentang Kami + button Kontak', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: /navigasi utama/i });
    expect(within(nav).getByRole('link', { name: 'Beranda' })).toHaveAttribute('href', '/beranda');
    expect(within(nav).getByRole('link', { name: 'Layanan' })).toHaveAttribute('href', '/beranda#layanan');
    expect(within(nav).getByRole('button', { name: /konten/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Tim' })).toHaveAttribute('href', '/tim');
    expect(within(nav).getByRole('link', { name: 'Tentang Kami' })).toHaveAttribute('href', '/tentang-kami');
    expect(within(nav).getByRole('link', { name: 'Kontak' })).toHaveAttribute('href', '/beranda#kontak');
  });

  it('dropdown Konten menampilkan Berita & Dokumentasi saat dibuka', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: /navigasi utama/i });
    // Tertutup dulu: submenu belum ada
    expect(screen.queryByRole('menu', { name: /submenu konten/i })).not.toBeInTheDocument();
    fireEvent.click(within(nav).getByRole('button', { name: /konten/i }));
    const menu = screen.getByRole('menu', { name: /submenu konten/i });
    expect(within(menu).getByRole('menuitem', { name: 'Berita' })).toHaveAttribute('href', '/berita');
    expect(within(menu).getByRole('menuitem', { name: 'Dokumentasi' })).toHaveAttribute('href', '/dokumentasi');
    // Edge case: Escape menutup dropdown
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu', { name: /submenu konten/i })).not.toBeInTheDocument();
  });

  it('menu seluler: hamburger membuka Konten dengan submenu Berita/Dokumentasi + Kontak', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /buka menu/i }));
    const mobile = screen.getByRole('navigation', { name: /navigasi seluler/i });
    fireEvent.click(within(mobile).getByRole('button', { name: /konten/i }));
    expect(within(mobile).getByRole('link', { name: 'Berita' })).toHaveAttribute('href', '/berita');
    expect(within(mobile).getByRole('link', { name: 'Dokumentasi' })).toHaveAttribute('href', '/dokumentasi');
    expect(within(mobile).getByRole('link', { name: 'Kontak' })).toHaveAttribute('href', '/beranda#kontak');
  });
});

describe('Footer lockup logo', () => {
  it('logo tidak kepotong (max-w-full/min-w-0) dan lockup boleh melipat', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: 'Logo Ubaya' })).toBeInTheDocument();
    const aiLogo = screen.getByRole('img', { name: 'Logo AI Center' });
    expect(aiLogo.className).toMatch(/max-w-full/);
    expect(aiLogo.className).toMatch(/min-w-0/);
    const lockup = aiLogo.closest('div');
    expect(lockup?.className).toMatch(/flex-wrap/);
    // Desktop: logo satu baris horizontal
    expect(lockup?.className).toMatch(/lg:flex-nowrap/);
  });

  it('menampilkan kontak AI Center terbaru (bukan kontak lama)', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: kontakDummy.email })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'info@ai-center.ubaya.ac.id' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /GPU Rental/i })).not.toBeInTheDocument();
  });
});
