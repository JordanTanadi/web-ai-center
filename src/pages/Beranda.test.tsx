import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Beranda from './Beranda.tsx';
import { beritaDummy } from '../data/berita.ts';
import { dokumentasiDummy } from '../data/dokumentasi.ts';

// Stub GET /testimoni: kirim 5 testimoni (urutan menurun) untuk membuktikan
// beranda hanya memakai 3 teratas — item lama turun, tidak ada yang dihapus.
const { testimoniBanyak } = vi.hoisted(() => ({
  testimoniBanyak: [
    { id: 5, nama: 'Testimoni Paling Baru', peran: 'Mitra', kutipan: 'Kutipan 1.', urutan: 0 },
    { id: 4, nama: 'Testimoni Kedua', peran: 'Dosen', kutipan: 'Kutipan 2.', urutan: 1 },
    { id: 3, nama: 'Testimoni Ketiga', peran: 'Mahasiswa', kutipan: 'Kutipan 3.', urutan: 2 },
    { id: 2, nama: 'Testimoni Keempat', peran: 'Alumni', kutipan: 'Kutipan 4.', urutan: 3 },
    { id: 1, nama: 'Testimoni Kelima', peran: 'Umum', kutipan: 'Kutipan 5.', urutan: 4 },
  ],
}));

vi.mock('../lib/useApiData.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/useApiData.ts')>();
  return {
    ...actual,
    useApiDaftar: <T,>(path: string, fallback: T[]): T[] =>
      path === '/testimoni'
        ? (testimoniBanyak as unknown as T[])
        : actual.useApiDaftar(path, fallback),
  };
});

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

  it('kartu layanan bernomor mono 01/02 (aksen Figma, tidak polos)', () => {
    renderBeranda();

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
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

  it('testimoni tampil tepat 3: yang baru jadi #1, lama turun (tak ada yang dihapus)', () => {
    renderBeranda();

    const testi = screen.getByRole('heading', { name: 'Apa Kata Mereka?' }).closest('section');
    // Slider menampilkan 3 teratas (counter "1 / 3" — bukan 5): indeks 4 & 3
    // tetap tersimpan di backend, hanya tidak tampil di beranda.
    expect(testi?.textContent).toContain('1 / 3');
    expect(testi?.textContent).not.toContain('1 / 5');
    // Slide pertama = testimoni berurutan 0 (paling baru masuk via admin).
    expect(testi?.textContent).toContain('Testimoni Paling Baru');
  });

  it('highlight dokumentasi & berita membatasi 3 card per section (article: 2 layanan + min(3,dok) + min(3,berita); carousel klien ikut dikomentari)', () => {
    renderBeranda();

    // Kebijakan konten Okt 2026: berita tinggal 1 entri asli, dokumentasi 6 karya.
    const jmlDok = Math.min(3, dokumentasiDummy.length);
    const jmlBerita = Math.min(3, beritaDummy.length);
    expect(screen.getAllByRole('article')).toHaveLength(2 + jmlDok + jmlBerita);
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
    // Urut tanggal turun: karya X-Ray (15 Sep) → implan (20 Agu) → algae (28 Jul).
    expect(screen.getByText('Klasifikasi X-Ray Pneumonia')).toBeInTheDocument();
    expect(screen.getByText('Rekomendasi Implan Gigi Otomatis')).toBeInTheDocument();
    expect(screen.getByText('Algae Finder')).toBeInTheDocument();
    // Karya terlama (15 Apr) tidak ikut — membatasi 3 card terbaru.
    expect(screen.queryByText('Deteksi Kesegaran Ikan')).not.toBeInTheDocument();
  });

  it('transisi antar section dihaluskan (fade -z; gradasi berita menyambung footer)', () => {
    renderBeranda();

    // Section layanan/dokumentasi ber-isolate agar fade & cincin dekoratif (-z-10)
    // berada di bawah konten, di atas background section.
    const layanan = screen.getByRole('heading', { name: 'Pilih Jalur Kolaborasimu' }).closest('section');
    expect(layanan?.className).toContain('isolate');
    expect(layanan?.querySelectorAll('div[style*="linear-gradient"]')).toHaveLength(1);

    const dok = screen.getByRole('heading', { name: 'Dokumentasi Kegiatan' }).closest('section');
    expect(dok?.className).toContain('isolate');
    expect(dok?.className).toContain('bg-gradient-to-br');
    expect(dok?.querySelectorAll('div[style*="linear-gradient"]')).toHaveLength(2);

    // Section berita tetap berakhir navy (sesuai referensi), dengan sky di tengah
    // sedikit diredam (via-sky/70) agar tidak terlalu gradasi.
    const berita = screen.getByRole('heading', { name: 'Berita Terkini' }).closest('section');
    expect(berita?.className).toContain('to-navy');
    expect(berita?.className).toContain('via-sky/70');
  });
});
