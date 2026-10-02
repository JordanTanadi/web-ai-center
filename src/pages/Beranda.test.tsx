import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Beranda from './Beranda.tsx';

function renderBeranda() {
  return render(
    <MemoryRouter initialEntries={['/beranda']}>
      <Beranda />
    </MemoryRouter>,
  );
}

describe('Beranda — keputusan rapat', () => {
  it('menampilkan tepat dua layanan (Pelatihan & Inference Solution), tanpa GPU Rental', () => {
    renderBeranda();

    expect(screen.getByRole('heading', { name: 'Pelatihan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Inference Solution' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'GPU Rental' })).not.toBeInTheDocument();
    expect(screen.getAllByText('Detail Layanan →')).toHaveLength(2);
  });

  it('section Our Client dikomentari sesuai briefing (tidak tampil, kode dipertahankan)', () => {
    renderBeranda();

    expect(screen.queryByRole('heading', { name: 'Klien Kami' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'FTB' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'CAW' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ubaya' })).not.toBeInTheDocument();
  });

  it('testimoni menempati slot Our Client (langsung setelah dokumentasi)', () => {
    renderBeranda();

    const dok = screen.getByRole('heading', { name: 'Dokumentasi Kegiatan' }).closest('section');
    const testi = screen.getByRole('heading', { name: 'Apa Kata Mereka?' }).closest('section');

    // Tidak ada section di antara dokumentasi dan testimoni (Our Client dikomentari).
    expect(dok).not.toBeNull();
    expect(testi).not.toBeNull();
    expect(dok?.nextElementSibling).toBe(testi);
  });

  it('kartu layanan memakai aksen hover ala situs patokan', () => {
    renderBeranda();

    const layanan = screen.getByRole('heading', { name: 'Pilih Jalur Kolaborasimu' });
    const section = layanan.closest('section');
    expect(section?.querySelectorAll('article.card-accent')).toHaveLength(2);
  });

  it('CTA kartu layanan memakai aksen konversi (btn-accent)', () => {
    renderBeranda();

    for (const link of screen.getAllByText('Detail Layanan →')) {
      expect(link.className).toContain('btn-accent');
    }
  });

  it('section testimoni muncul setelah dokumentasi dan sebelum berita', () => {
    renderBeranda();

    const testi = screen.getByRole('heading', { name: 'Apa Kata Mereka?' });
    const berita = screen.getByRole('heading', { name: 'Berita Terkini' });
    const dokumentasi = screen.getByRole('heading', { name: 'Dokumentasi Kegiatan' });

    const mendahului = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

    // Urutan DOM: dokumentasi → testimoni → berita
    expect(mendahului(dokumentasi, testi)).toBe(true);
    expect(mendahului(testi, berita)).toBe(true);
  });

  it('section testimoni memakai background terang (bg-soft), bukan background gelap', () => {
    renderBeranda();

    const heading = screen.getByRole('heading', { name: 'Apa Kata Mereka?' });
    const section = heading.closest('section');
    expect(section).not.toBeNull();
    expect(section?.className).toContain('bg-soft');
    expect(section?.className).not.toContain('bg-brand');
  });

  it('highlight dokumentasi & berita membatasi 3 card (8 article: 2 layanan + 3 + 3; carousel klien ikut dikomentari)', () => {
    renderBeranda();

    expect(screen.getAllByRole('article')).toHaveLength(8);
    // role="group" hanya datang dari ClientCarousel — dipakai saat Our Client diaktifkan.
    expect(screen.queryAllByRole('group')).toHaveLength(0);
  });
});

describe('Beranda — PROGRESS 2 (konsul 2 Okt)', () => {
  it('hero tanpa tombol CTA & tagpill logo', () => {
    renderBeranda();

    const hero = document.querySelector('section[aria-roledescription="carousel"]');
    expect(hero).not.toBeNull();
    expect(hero?.querySelectorAll('a')).toHaveLength(0);
    expect(hero?.innerHTML).not.toContain('AI-Center_Logo');
    expect(screen.queryByRole('link', { name: 'Jadwalkan Konsultasi AI' })).not.toBeInTheDocument();
  });

  it('Tentang Kami, Portofolio, Fasilitas, Kontak tidak tampil di home (andalan navbar/footer)', () => {
    renderBeranda();

    expect(screen.queryByRole('heading', { name: 'Tentang Kami' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Portofolio produk AI' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Fasilitas yang dirancang untuk berkarya' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Kontak' })).not.toBeInTheDocument();
    // Anchor lama #portofolio ikut hilang — tautan "Lihat portofolio lengkap" dialihkan ke /dokumentasi.
    expect(document.getElementById('portofolio')).toBeNull();
  });

  it('urutan section baru: layanan → dokumentasi → testimoni → berita', () => {
    renderBeranda();

    const layanan = screen.getByRole('heading', { name: 'Pilih Jalur Kolaborasimu' });
    const dokumentasi = screen.getByRole('heading', { name: 'Dokumentasi Kegiatan' });
    const testimoni = screen.getByRole('heading', { name: 'Apa Kata Mereka?' });
    const berita = screen.getByRole('heading', { name: 'Berita Terkini' });
    const mendahului = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

    expect(mendahului(layanan, dokumentasi)).toBe(true);
    expect(mendahului(dokumentasi, testimoni)).toBe(true);
    expect(mendahului(testimoni, berita)).toBe(true);
  });

  it('highlight dokumentasi menampilkan 3 terbaru (karya portofolio ikut tercampur)', () => {
    renderBeranda();

    const heading = screen.getByRole('heading', { name: 'Dokumentasi Kegiatan' });
    const section = heading.closest('section');
    expect(section?.querySelectorAll('article')).toHaveLength(3);
    // Urut tanggal turun: karya X-Ray (15 Sep) → demo (28 Agu) → karya implan (20 Agu).
    expect(screen.getByText('Klasifikasi X-Ray Pneumonia')).toBeInTheDocument();
    expect(screen.getByText('Demo Inference Solution untuk Mitra')).toBeInTheDocument();
    expect(screen.getByText('Rekomendasi Implan Gigi Otomatis')).toBeInTheDocument();
    expect(screen.queryByText('Workshop Pengenalan GPU Lab')).not.toBeInTheDocument();
  });
});
