import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import TestimoniSlider from './TestimoniSlider.tsx';
import type { Testimoni } from '../data/testimoni.ts';

const items: Testimoni[] = [
  { nama: 'Andi', peran: 'Mahasiswa', kutipan: 'Kutipan pertama' },
  { nama: 'Budi', peran: 'Mitra', kutipan: 'Kutipan kedua' },
];

function renderSlider(list: Testimoni[] = items, intervalMs = 1000) {
  return render(<TestimoniSlider items={list} dark={false} intervalMs={intervalMs} />);
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

describe('TestimoniSlider', () => {
  it('menampilkan kutipan pertama + counter', () => {
    render(<TestimoniSlider items={items} dark={false} />);
    expect(screen.getByText(/Kutipan pertama/)).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('Berikutnya/Sebelumnya berpindah dan wrap-around', () => {
    render(<TestimoniSlider items={items} dark={false} />);
    fireEvent.click(screen.getByRole('button', { name: /testimoni berikutnya/i }));
    expect(screen.getByText(/Kutipan kedua/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /testimoni berikutnya/i }));
    expect(screen.getByText(/Kutipan pertama/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /testimoni sebelumnya/i }));
    expect(screen.getByText(/Kutipan kedua/)).toBeInTheDocument();
  });

  it('prop dark mengubah gaya tombol (tema gelap memakai bg-white/10)', () => {
    const { rerender } = render(<TestimoniSlider items={items} dark />);
    expect(screen.getByRole('button', { name: /testimoni berikutnya/i }).className).toContain('bg-white/10');
    rerender(<TestimoniSlider items={items} dark={false} />);
    expect(screen.getByRole('button', { name: /testimoni berikutnya/i }).className).toContain('border-brand');
  });

  it('baris navigasi flex-wrap + counter tabular-nums (aman di layar ~360px)', () => {
    const { container } = render(<TestimoniSlider items={items} dark={false} />);
    const nav = screen.getByRole('button', { name: /testimoni sebelumnya/i }).parentElement;
    expect(nav?.className).toContain('flex-wrap');
    expect(container.querySelector('p.tabular-nums')).not.toBeNull();
  });

  it('edge case: list kosong tampilkan empty state tanpa tombol', () => {
    const { container } = render(<TestimoniSlider items={[]} dark={false} />);
    expect(screen.getByText(/belum ada testimoni/i)).toBeInTheDocument();
    expect(container.querySelector('button')).toBeNull();
  });

  it('edge case: satu item tidak tampilkan navigasi', () => {
    const { container } = render(<TestimoniSlider items={items.slice(0, 1)} dark={false} />);
    expect(screen.getByText(/Kutipan pertama/)).toBeInTheDocument();
    expect(container.querySelector('button')).toBeNull();
  });

  it('autoplay: berpindah sendiri tiap interval dan wrap-around', () => {
    renderSlider();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Kutipan kedua/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Kutipan pertama/)).toBeInTheDocument();
  });

  it('jeda saat hover, lanjut setelah mouse pergi', () => {
    const { container } = renderSlider();
    const wrapper = container.firstElementChild;
    fireEvent.mouseEnter(wrapper!);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/Kutipan pertama/)).toBeInTheDocument();
    fireEvent.mouseLeave(wrapper!);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Kutipan kedua/)).toBeInTheDocument();
  });

  it('edge case: reduced-motion mematikan autoplay (konten tetap tampil)', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    );
    renderSlider();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/Kutipan pertama/)).toBeInTheDocument();
  });
});
