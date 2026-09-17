import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TestimoniSlider from './TestimoniSlider.tsx';
import type { Testimoni } from '../data/testimoni.ts';

const items: Testimoni[] = [
  { nama: 'Andi', peran: 'Mahasiswa', kutipan: 'Kutipan pertama' },
  { nama: 'Budi', peran: 'Mitra', kutipan: 'Kutipan kedua' },
];

describe('TestimoniSlider', () => {
  it('menampilkan kutipan pertama + counter', () => {
    render(<TestimoniSlider items={items} />);
    expect(screen.getByText(/Kutipan pertama/)).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('Berikutnya/Sebelumnya berpindah dan wrap-around', () => {
    render(<TestimoniSlider items={items} />);
    fireEvent.click(screen.getByRole('button', { name: /testimoni berikutnya/i }));
    expect(screen.getByText(/Kutipan kedua/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /testimoni berikutnya/i }));
    expect(screen.getByText(/Kutipan pertama/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /testimoni sebelumnya/i }));
    expect(screen.getByText(/Kutipan kedua/)).toBeInTheDocument();
  });

  it('edge case: list kosong tampilkan empty state tanpa tombol', () => {
    const { container } = render(<TestimoniSlider items={[]} />);
    expect(screen.getByText(/belum ada testimoni/i)).toBeInTheDocument();
    expect(container.querySelector('button')).toBeNull();
  });

  it('edge case: satu item tidak tampilkan navigasi', () => {
    const { container } = render(<TestimoniSlider items={items.slice(0, 1)} />);
    expect(screen.getByText(/Kutipan pertama/)).toBeInTheDocument();
    expect(container.querySelector('button')).toBeNull();
  });
});
