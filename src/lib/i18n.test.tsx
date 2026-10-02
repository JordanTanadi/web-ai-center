import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  KEY_BAHASA,
  PenyediaBahasa,
  terjemah,
  useBahasa,
  useT,
} from './i18n.tsx';
import { kamusBahasa } from './kamusBahasa.ts';

// Probe kecil: menampilkan hasil t() + tombol ganti bahasa agar bisa divalidasi.
function Probe({ teks }: { teks: string }) {
  const t = useT();
  const { bahasa, setBahasa } = useBahasa();
  return (
    <div>
      <span data-testid="hasil">{t(teks)}</span>
      <span data-testid="bahasa">{bahasa}</span>
      <button type="button" onClick={() => setBahasa(bahasa === 'id' ? 'en' : 'id')}>
        ganti bahasa
      </button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('kamusBahasa', () => {
  it('setiap entri punya kunci & nilai tidak kosong', () => {
    const entri = Object.entries(kamusBahasa);
    expect(entri.length).toBeGreaterThan(50);
    for (const [kunci, nilai] of entri) {
      expect(kunci.trim(), `kunci kosong`).not.toBe('');
      expect(nilai.trim(), `nilai kosong untuk "${kunci}"`).not.toBe('');
    }
  });

  it('tidak ada nilai EN yang masih berupa teks Indonesia salah ketik (duplikat key identik)', () => {
    // Kunci unik sudah dijamin Record; cek target: tak ada nilai berupa kalimat
    // panjang yang identik dengan kuncinya (kecuali nama propre seperti 'Algae Finder').
    for (const [kunci, nilai] of Object.entries(kamusBahasa)) {
      if (kunci === nilai) {
        expect(kunci.length, `"${kunci}" seharusnya punya terjemahan`).toBeLessThan(40);
      }
    }
  });
});

describe('terjemah', () => {
  it('bahasa id: selalu mengembalikan teks apa adanya', () => {
    expect(terjemah('Beranda', 'id')).toBe('Beranda');
    expect(terjemah('Teks yang tidak ada di kamus', 'id')).toBe('Teks yang tidak ada di kamus');
  });

  it('bahasa en: cocok persis di kamus → padanan EN', () => {
    expect(terjemah('Beranda', 'en')).toBe('Home');
    expect(terjemah('Layanan', 'en')).toBe('Services');
    expect(terjemah('Apa Kata Mereka?', 'en')).toBe('What They Say?');
  });

  it('bahasa en: teks tak dikenal jatuh ke teks ID (fallback eksplisit)', () => {
    expect(terjemah('Belum diterjemahkan sama sekali', 'en')).toBe(
      'Belum diterjemahkan sama sekali',
    );
  });

  it('pola dinamis: angka & satuan tetap diterjemahkan', () => {
    expect(terjemah('Lesson 1 dari 4', 'en')).toBe('Lesson 1 of 4');
    expect(terjemah('Modul 03', 'en')).toBe('Module 03');
    expect(terjemah('Durasi: 4 video · 35 menit', 'en')).toBe('Duration: 4 video · 35 minutes');
    expect(terjemah('3 modul', 'en')).toBe('3 modules');
    expect(terjemah('4 sesi', 'en')).toBe('4 sessions');
    expect(terjemah('75% selesai', 'en')).toBe('75% complete');
  });

  it('pola bulan: tanggal formatTanggal otomatis EN (tanpa entri per tanggal)', () => {
    expect(terjemah('12 Januari 2025', 'en')).toBe('12 January 2025');
    expect(terjemah('5 Desember 2026', 'en')).toBe('5 December 2026');
    // Bulan berbahasa Inggris tetap sama.
    expect(terjemah('17 April 2026', 'en')).toBe('17 April 2026');
  });
});

describe('PenyediaBahasa & useT', () => {
  it('default id; ganti ke en mengubah hasil t() + tersimpan di localStorage', () => {
    render(
      <PenyediaBahasa>
        <Probe teks="Beranda" />
      </PenyediaBahasa>,
    );
    expect(screen.getByTestId('bahasa')).toHaveTextContent('id');
    expect(screen.getByTestId('hasil')).toHaveTextContent('Beranda');

    fireEvent.click(screen.getByRole('button', { name: 'ganti bahasa' }));
    expect(screen.getByTestId('bahasa')).toHaveTextContent('en');
    expect(screen.getByTestId('hasil')).toHaveTextContent('Home');
    expect(localStorage.getItem(KEY_BAHASA)).toBe('en');
  });

  it('preferensi tersimpan dibaca ulang saat mount (en → langsung en)', () => {
    localStorage.setItem(KEY_BAHASA, 'en');
    render(
      <PenyediaBahasa>
        <Probe teks="Tim" />
      </PenyediaBahasa>,
    );
    expect(screen.getByTestId('bahasa')).toHaveTextContent('en');
    expect(screen.getByTestId('hasil')).toHaveTextContent('Team');
  });

  it('tanpa provider: bahasa id (aman untuk unit test lain)', () => {
    render(<Probe teks="Kontak" />);
    expect(screen.getByTestId('bahasa')).toHaveTextContent('id');
    expect(screen.getByTestId('hasil')).toHaveTextContent('Kontak');
  });
});
