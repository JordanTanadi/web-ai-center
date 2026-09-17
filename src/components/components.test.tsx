import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SectionHeading from './SectionHeading.tsx';
import NewsCard from './NewsCard.tsx';
import DokumentasiCard from './DokumentasiCard.tsx';
import TeamCard from './TeamCard.tsx';
import { Header, Footer } from './SiteLayout.tsx';

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
        <NewsCard item={{ ...item, gambar: '/hero-1.jpg' }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: 'Judul Uji' })).toHaveAttribute('src', '/hero-1.jpg');
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
        <DokumentasiCard item={{ ...item, gambar: '/hero-2.jpg' }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: 'Dok Uji' })).toHaveAttribute('src', '/hero-2.jpg');
    rerender(
      <MemoryRouter>
        <DokumentasiCard item={item} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('img')).toBeNull();
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
});

describe('Header & Footer', () => {
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

  it('menu utama: Beranda, Layanan, Konten, Tim, Tentang Kami + button Kontak', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: /navigasi utama/i });
    expect(within(nav).getByRole('link', { name: 'Beranda' })).toHaveAttribute('href', '/beranda');
    expect(within(nav).getByRole('link', { name: 'Layanan' })).toHaveAttribute('href', '/beranda#layanan');
    expect(within(nav).getByRole('button', { name: /konten/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Tim' })).toHaveAttribute('href', '/tim');
    expect(within(nav).getByRole('link', { name: 'Tentang Kami' })).toHaveAttribute('href', '/tentang-kami');
    expect(within(nav).getByRole('link', { name: 'Kontak' })).toHaveAttribute('href', '/tentang-kami');
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
    expect(within(mobile).getByRole('link', { name: 'Kontak' })).toHaveAttribute('href', '/tentang-kami');
  });

  it('footer memuat lockup logo, kontak, halaman populer, dan layanan', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Tenggilis Mejoyo/i)).toBeInTheDocument();
    // Lockup logo: Ubaya dulu baru AI Center (seperti referensi)
    expect(screen.getByRole('img', { name: 'Logo Ubaya' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Logo AI Center' })).toBeInTheDocument();
    // Anti-kepotong: logo bisa menyusut (min-w-0/max-w-full) dan lockup boleh melipat
    const aiLogo = screen.getByRole('img', { name: 'Logo AI Center' });
    expect(aiLogo.className).toMatch(/max-w-full/);
    expect(aiLogo.className).toMatch(/min-w-0/);
    const lockup = aiLogo.closest('div');
    expect(lockup?.className).toMatch(/flex-wrap/);
    // Desktop: logo satu baris horizontal
    expect(lockup?.className).toMatch(/lg:flex-nowrap/);
    // Kontak: email + telepon
    expect(screen.getByRole('link', { name: 'info@ai-center.ubaya.ac.id' })).toHaveAttribute(
      'href',
      'mailto:info@ai-center.ubaya.ac.id',
    );
    expect(screen.getByRole('link', { name: '+62 31 298 1000' })).toHaveAttribute('href', 'tel:+62312981000');
    // Halaman populer (5 link) + layanan
    const populer = screen.getByRole('navigation', { name: /halaman populer/i });
    expect(within(populer).getAllByRole('link')).toHaveLength(5);
    expect(within(populer).getByRole('link', { name: 'Hubungi Kami' })).toHaveAttribute('href', '/tentang-kami');
    const layanan = screen.getByRole('navigation', { name: /layanan ai center/i });
    expect(within(layanan).getByRole('link', { name: 'GPU Rental' })).toHaveAttribute('href', '/beranda#layanan');
  });
});
