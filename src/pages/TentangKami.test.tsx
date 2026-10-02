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
