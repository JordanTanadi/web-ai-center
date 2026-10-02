import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import PelatihanDetail from './PelatihanDetail.tsx';
import { kursusDummy, waTanyaProgram } from '../data/pelatihan.ts';
import { KEY_BAHASA, PenyediaBahasa } from '../lib/i18n.tsx';

function renderKode(kode: string) {
  return render(
    <MemoryRouter initialEntries={[`/layanan/pelatihan/${kode}`]}>
      <Routes>
        <Route path="/layanan/pelatihan/:kode" element={<PelatihanDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

// State LMS tersimpan di localStorage per browser — reset antar test agar
// test lama (mis. hitung jumlah heading) tidak terpengaruh test enroll.
beforeEach(() => {
  localStorage.clear();
});

describe('PelatihanDetail', () => {
  it('hero menampilkan kode + audiens, judul, deskripsi, dan fakta level/durasi/format', () => {
    renderKode('R01');
    const r01 = kursusDummy[0];

    expect(screen.getByRole('heading', { level: 1, name: r01.judul })).toBeInTheDocument();
    expect(screen.getByText('R01 · Mahasiswa · Dosen · Umum')).toBeInTheDocument();
    expect(screen.getByText(r01.deskripsi)).toBeInTheDocument();
    expect(screen.getByText('Pemula')).toBeInTheDocument();
    expect(screen.getByText('4 sesi')).toBeInTheDocument();
    expect(screen.getByText('Online mandiri')).toBeInTheDocument();
  });

  it('kode huruf kecil dari URL lama (r01) tetap cocok', () => {
    renderKode('r01');
    expect(screen.getByRole('heading', { level: 1, name: kursusDummy[0].judul })).toBeInTheDocument();
  });

  it('menampilkan Tentang kursus, daftar hasil, materi bernomor, instruktur, dan Informasi kursus', () => {
    renderKode('E01');
    const e01 = kursusDummy[1];

    expect(screen.getByRole('heading', { name: 'Tentang kursus ini' })).toBeInTheDocument();
    expect(screen.getByText(e01.tentang)).toBeInTheDocument();
    for (const hasil of e01.hasil) {
      expect(screen.getByText(hasil)).toBeInTheDocument();
    }

    expect(screen.getByRole('heading', { name: 'Materi yang akan dipelajari' })).toBeInTheDocument();
    // h3 = tiap modul + instruktur + Informasi kursus
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(e01.modul.length + 2);
    for (const m of e01.modul) {
      expect(screen.getByRole('heading', { name: m.judul })).toBeInTheDocument();
      expect(screen.getByText(`${m.meta} · Video, latihan, dan kuis`)).toBeInTheDocument();
    }

    expect(screen.getByRole('heading', { name: e01.instruktur })).toBeInTheDocument();
    expect(screen.getByText(e01.peran)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Informasi kursus' })).toBeInTheDocument();
    expect(screen.getByText('Ubaya AI Center')).toBeInTheDocument();
    expect(screen.getByText('Tersedia')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
  });

  it('kartu akses memakai WhatsApp dengan konteks kode & judul kursus', () => {
    renderKode('P01');
    const cta = screen.getByRole('link', { name: /tanya & daftar via whatsapp/i });

    expect(cta).toHaveAttribute('href', waTanyaProgram('P01', 'Produktivitas Akademik dengan AI'));
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta.getAttribute('rel')).toContain('noreferrer');
  });

  it('tautan kembali mengarah ke katalog pelatihan', () => {
    renderKode('R01');
    const links = screen.getAllByRole('link', { name: /kembali ke katalog kursus/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute('href', '/layanan/pelatihan');
  });

  it('kode tidak dikenal menampilkan pesan tidak ditemukan + jalan kembali', () => {
    renderKode('ZZZ');
    expect(screen.getByRole('heading', { name: /kursus tidak ditemukan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /kembali ke katalog kursus/i })).toHaveAttribute(
      'href',
      '/layanan/pelatihan',
    );
  });
});

describe('PelatihanDetail — LMS (Ruang belajar)', () => {
  it('sebelum enroll: ruang belajar tidak ada, kartu akses "Preview tersedia" + 0% selesai', () => {
    renderKode('R01');

    expect(screen.queryByRole('region', { name: 'Ruang belajar' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Preview tersedia' })).toBeInTheDocument();
    expect(screen.getByText('Belum dimulai')).toBeInTheDocument();
    expect(screen.getByText('0% selesai')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('klik "Mulai belajar" → ruang belajar muncul, status "Sedang belajar", state tersimpan', () => {
    renderKode('R01');

    fireEvent.click(screen.getByRole('button', { name: 'Mulai belajar' }));

    expect(screen.getByRole('region', { name: 'Ruang belajar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bangun kemampuanmu bertahap.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sedang belajar' })).toBeInTheDocument();

    const tersimpan = JSON.parse(localStorage.getItem('ubaya-learning-R01') || '{}');
    expect(tersimpan.enrolled).toBe(true);
    expect(tersimpan.activeModule).toBe(0);
  });

  it('alur satu modul: tonton → checkpoint → selesai; progress 20% & modul 2 terbuka', () => {
    renderKode('R01');
    fireEvent.click(screen.getByRole('button', { name: 'Mulai belajar' }));

    fireEvent.click(screen.getByRole('button', { name: 'Mulai lesson' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Terapkan konsep pada masalah nyata lalu uji hasilnya' }),
    );
    expect(screen.getByRole('button', { name: 'Selesaikan modul' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Selesaikan modul' }));

    // Modul 01 selesai → status + progres 1/5 = 20% + modul 02 tidak terkunci
    expect(screen.getByText('20% selesai')).toBeInTheDocument();
    // Dua progress bar (kartu akses + ruang belajar) — keduanya harus 20.
    for (const bar of screen.getAllByRole('progressbar')) {
      expect(bar).toHaveAttribute('aria-valuenow', '20');
    }
    expect(screen.getByText('Lesson 2 dari 4')).toBeInTheDocument();

    const tersimpan = JSON.parse(localStorage.getItem('ubaya-learning-R01') || '{}');
    expect(tersimpan.completed).toEqual([true, false, false, false]);
    expect(tersimpan.watched[0]).toBe(true);
    expect(tersimpan.quizPassed[0]).toBe(true);
  });

  it('state LMS bertahan antar kunjungan (localStorage dibaca ulang saat render)', () => {
    // Simulasikan peserta yang sudah enroll dari kunjungan sebelumnya.
    localStorage.setItem(
      'ubaya-learning-E01',
      JSON.stringify({ enrolled: true, activeModule: 1, completed: [true, false, false] }),
    );

    renderKode('E01');

    expect(screen.getByRole('region', { name: 'Ruang belajar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sedang belajar' })).toBeInTheDocument();
    expect(screen.getByText('Lesson 2 dari 3')).toBeInTheDocument();
  });
});

describe('PelatihanDetail — mode EN', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(KEY_BAHASA, 'en');
  });

  it('judul, audiens, label fakta, dan label kartu akses memakai padanan EN', () => {
    render(
      <MemoryRouter initialEntries={['/layanan/pelatihan/R01']}>
        <PenyediaBahasa>
          <Routes>
            <Route path="/layanan/pelatihan/:kode" element={<PelatihanDetail />} />
          </Routes>
        </PenyediaBahasa>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'AI for Finding and Managing Journal References' }),
    ).toBeInTheDocument();
    expect(screen.getByText('R01 · Students · Lecturers · General public')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getAllByText('4 sessions').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Self-paced online').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Start learning' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'About this course' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What you will learn' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Course information' })).toBeInTheDocument();
  });

  it('pola dinamis: "Lesson 1 dari N" & "% selesai" diterjemahkan di mode EN', () => {
    localStorage.clear();
    localStorage.setItem(KEY_BAHASA, 'en');
    render(
      <MemoryRouter initialEntries={['/layanan/pelatihan/R01']}>
        <PenyediaBahasa>
          <Routes>
            <Route path="/layanan/pelatihan/:kode" element={<PelatihanDetail />} />
          </Routes>
        </PenyediaBahasa>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start learning' }));

    expect(screen.getByText('Lesson 1 of 4')).toBeInTheDocument();
    expect(screen.getByText('0% complete')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Learning workspace' })).toBeInTheDocument();
  });
});
