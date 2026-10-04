import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import TentangKami from './TentangKami.tsx';
import { kontakDummy } from '../data/kontak.ts';
import { profilDummy } from '../data/profil.ts';

function renderPage(ui: React.ReactElement = <TentangKami />) {
  return render(
    <MemoryRouter>{ui}</MemoryRouter>,
  );
}

describe('TentangKami', () => {
  it('menampilkan judul halaman serta heading Visi & Misi', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Tentang Kami' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Visi & Misi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Visi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Misi' })).toBeInTheDocument();
  });

  it('PROGRESS 2: hero band bg-soft + blok CTA penutup ke layanan & tim', () => {
    renderPage();

    // Hero band bertema soft; heading h1 tetap (diuji test sebelumnya).
    const hero = screen.getByRole('heading', { level: 1, name: 'Tentang Kami' }).closest('section');
    expect(hero?.className).toContain('bg-soft');

    // Blok CTA penutup: region bernama + link ke layanan (beranda) & tim.
    const cta = screen.getByRole('region', { name: 'Langkah Selanjutnya' });
    expect(cta).toBeInTheDocument();
    // Aliran biru ala referensi: gradasi brand → navy, bukan bidang datar.
    expect(cta.className).toContain('bg-gradient-to-br');
    expect(cta.className).toContain('from-brand');
    expect(cta.className).toContain('to-navy');
    expect(screen.getByRole('link', { name: 'Lihat Layanan' })).toHaveAttribute(
      'href',
      '/beranda#layanan',
    );
    expect(screen.getByRole('link', { name: 'Kenali Tim Kami' })).toHaveAttribute('href', '/tim');
  });

  it('menampilkan teks visi & misi resmi (judul, deskripsi, 5 poin, intro)', () => {
    renderPage();

    expect(screen.getByText(profilDummy.introVisiMisi)).toBeInTheDocument();
    expect(screen.getByText(profilDummy.visi.judul)).toBeInTheDocument();
    expect(screen.getByText(profilDummy.visi.deskripsi)).toBeInTheDocument();
    for (const poin of profilDummy.misi) {
      expect(screen.getByText(poin)).toBeInTheDocument();
    }
  });

  it('kontak tidak dobel di halaman (hanya di footer): tanpa email/WA/web', () => {
    renderPage();

    expect(screen.queryByText(kontakDummy.email)).toBeNull();
    expect(screen.queryByText(new RegExp(kontakDummy.whatsappDisplay))).toBeNull();
    expect(screen.queryByText(new RegExp(kontakDummy.websiteLabel))).toBeNull();
  });

  it('alamat tidak dobel di halaman (hanya di footer sebagai link Maps)', () => {
    renderPage();

    expect(screen.queryByText(kontakDummy.alamat.join(', '))).toBeNull();
  });

  it('paragraf pembuka dipusatkan (mx-auto + text-center), tidak menempel kiri', () => {
    renderPage();

    const paragraf = screen.getByText(kontakDummy.deskripsiSingkat);
    expect(paragraf.parentElement?.className).toContain('mx-auto');
    expect(paragraf.parentElement?.className).toContain('text-center');
  });

  it('edge: misi kosong menampilkan empty state, bukan daftar kosong', () => {
    renderPage(<TentangKami profil={{ ...profilDummy, misi: [] }} />);

    expect(screen.getByText('Misi belum tersedia.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('hanya satu peta di halaman (milik footer, tidak duplikat di konten)', () => {
    renderPage();

    expect(screen.queryByTitle('Peta lokasi AI Center')).toBeNull();
  });
});
