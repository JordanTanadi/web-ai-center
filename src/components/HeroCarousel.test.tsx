import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeroCarousel from './HeroCarousel.tsx';
import type { HeroSlide } from '../data/hero.ts';
import { srcSetBerbasis } from '../lib/basis.ts';

const slides: HeroSlide[] = [
  {
    eyebrow: 'Eyebrow 1',
    judul: 'Judul Satu',
    judulAksen: 'Aksen Satu',
    sub: 'Sub satu',
    ctaPrimer: { label: 'Primer 1', to: '/tentang-kami' },
    ctaSekunder: { label: 'Sekunder 1', to: '/berita' },
    badgeJudul: 'Badge 1',
    badgeSub: 'Sub badge 1',
  },
  {
    eyebrow: 'Eyebrow 2',
    judul: 'Judul Dua',
    judulAksen: 'Aksen Dua',
    sub: 'Sub dua',
    ctaPrimer: { label: 'Primer 2', to: '/dokumentasi' },
    ctaSekunder: { label: 'Sekunder 2', to: '/tim' },
    badgeJudul: 'Badge 2',
    badgeSub: 'Sub badge 2',
  },
];

function renderHero(list: HeroSlide[] = slides, intervalMs = 7000) {
  return render(
    <MemoryRouter>
      <HeroCarousel slides={list} intervalMs={intervalMs} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('HeroCarousel', () => {
  it('render slide pertama + dots', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Judul Satu');
    const tabs = screen.getByRole('tablist', { name: /pilih slide/i });
    expect(within(tabs).getAllByRole('tab')).toHaveLength(2);
  });

  it('reduced-motion: konten tetap tampil penuh tanpa animasi entrance', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    );
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Judul Satu');
    expect(screen.getByText('Sub satu')).toBeInTheDocument();
  });

  it('meneruskan srcset/sizes responsif ke img bila tersedia', () => {
    renderHero([
      { ...slides[0], image: '/hero-1-1600.webp', srcSet: '/hero-1-800.webp 800w', sizes: '100vw' },
    ]);
    const img = document.querySelector('section img');
    expect(img?.getAttribute('srcset')).toBe(srcSetBerbasis('/hero-1-800.webp 800w'));
    expect(img?.getAttribute('sizes')).toBe('100vw');
  });

  it('PROGRESS 2: tombol CTA & tagpill logo dicabut (data cta/badge di data tak dirender)', () => {
    renderHero([slides[0]]);
    const section = document.querySelector('section');
    expect(section).not.toBeNull();
    // Tidak ada satu pun link di dalam hero (CTA dihapus).
    expect(section?.querySelectorAll('a')).toHaveLength(0);
    // Emblem logo + badge tak lagi ditampilkan.
    expect(section?.innerHTML).not.toContain('AI-Center_Logo');
    expect(screen.queryByText('Badge 1')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Primer 1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sekunder 1' })).not.toBeInTheDocument();
    // Eyebrow, judul, dan sub tetap tampil.
    expect(screen.getByText('Sub satu')).toBeInTheDocument();
  });

  it('img hero punya width/height eksplisit (hindari CLS) dan konten di-center', () => {
    renderHero([
      { ...slides[0], image: '/hero-1-1600.webp' },
    ]);
    const img = document.querySelector('section img');
    expect(img?.getAttribute('width')).toBe('1600');
    expect(img?.getAttribute('height')).toBe('900');
    const slideLayer = document.querySelector('section [aria-roledescription="slide"]');
    expect(slideLayer?.className).toContain('flex');
    expect(slideLayer?.className).toContain('items-center');
  });

  it("layout 'teks-kanan' (konsul 2 Okt): teks ke kanan & gradient dibalik agar foto kiri terlihat", () => {
    const pertama = renderHero([{ ...slides[0], layout: 'teks-kanan' }]);
    const teks = screen.getByRole('heading', { level: 1 }).parentElement;
    expect(teks?.className).toContain('md:ml-auto');
    expect(teks?.className).toContain('md:max-w-2xl');
    const overlay = [...document.querySelectorAll('section div')].find((el) =>
      el.className.includes('bg-gradient'),
    );
    expect(overlay?.className).toContain('md:bg-gradient-to-l');
    // Slide default (tanpa layout) tetap teks kiri — arah gradient tak berubah.
    pertama.unmount();
    renderHero([slides[0]]);
    const teksDefault = screen.getByRole('heading', { level: 1 }).parentElement;
    expect(teksDefault?.className ?? '').not.toContain('md:ml-auto');
  });

  it('slide berganti sendiri tiap interval dan wrap-around', () => {
    renderHero(slides, 1000);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Judul Dua');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Judul Satu');
  });

  it('klik dot melompat ke slide terkait', () => {
    renderHero();
    fireEvent.click(screen.getByRole('tab', { name: 'Tampilkan slide 2' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Judul Dua');
  });

  it('edge case: prefers-reduced-motion mematikan autoplay', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    );
    renderHero(slides, 1000);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Judul Satu');
  });

  it('edge case: tanpa slide tidak render apa-apa', () => {
    const { container } = renderHero([]);
    expect(container.querySelector('section')).toBeNull();
  });

  it('edge case: satu slide tanpa dots', () => {
    renderHero(slides.slice(0, 1));
    expect(screen.queryByRole('tablist')).toBeNull();
  });

  it('dekorasi atmosfer referensi: 2 glow radial + 2 cincin, semua aria-hidden', () => {
    renderHero();
    const section = document.querySelector('section');
    expect(section).not.toBeNull();
    const dekor = [...(section?.querySelectorAll('div') ?? [])].filter((el) =>
      el.className.includes('pointer-events-none'),
    );
    expect(dekor).toHaveLength(4);
    for (const d of dekor) expect(d).toHaveAttribute('aria-hidden', 'true');
    // Dekorasi tak menambah tautan (hero tetap tanpa CTA) dan heading tetap utuh.
    expect(section?.querySelectorAll('a')).toHaveLength(0);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
