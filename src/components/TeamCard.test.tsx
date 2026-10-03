import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TeamCard from './TeamCard.tsx';
import { timDummy } from '../data/tim.ts';
import { aset } from '../lib/basis.ts';

describe('TeamCard', () => {
  it('menampilkan foto (src+alt dari data), nama, dan peran', () => {
    const anggota = timDummy[0];
    render(<TeamCard anggota={anggota} />);

    const foto = screen.getByRole('img', { name: anggota.nama });
    expect(foto).toHaveAttribute('src', aset(anggota.foto!));
    expect(foto).toHaveAttribute('alt', anggota.nama);
    expect(foto).toHaveAttribute('loading', 'lazy');
    expect(screen.getByRole('heading', { name: anggota.nama })).toBeInTheDocument();
    expect(screen.getByText(anggota.peran)).toBeInTheDocument();
  });

  it('kredensial tampil bila ada, tanpa elemen kosong bila tidak', () => {
    const denganKredensial = timDummy.find((a) => a.kredensial);
    render(<TeamCard anggota={denganKredensial!} />);
    expect(screen.getByText(denganKredensial!.kredensial!)).toBeInTheDocument();
  });

  it('tanpa foto → avatar inisial (fallback, bukan gambar rusak)', () => {
    render(<TeamCard anggota={{ nama: 'Budi Santoso', peran: 'Tim Software' }} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('foto tampil utuh tanpa potong (bingkai 4/5 + object-top, bukan lingkaran crop)', () => {
    const anggota = timDummy[0];
    render(<TeamCard anggota={anggota} />);

    const foto = screen.getByRole('img', { name: anggota.nama });
    expect(foto.className).toContain('aspect-[4/5]');
    expect(foto.className).toContain('object-top');
    expect(foto.className).not.toContain('rounded-full');
  });
});
