import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import LanguageToggle from './LanguageToggle.tsx';
import { KEY_BAHASA, PenyediaBahasa } from '../lib/i18n.tsx';

function renderToggle() {
  return render(
    <PenyediaBahasa>
      <LanguageToggle />
    </PenyediaBahasa>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('LanguageToggle', () => {
  it('label menampilkan bahasa TUJUAN: ID → "EN"', () => {
    renderToggle();
    const tombol = screen.getByRole('button', { name: 'Switch language' });
    expect(tombol).toHaveTextContent('EN');
    expect(tombol).toHaveAttribute('title', 'Bahasa / Language');
    // Ikon globe dekoratif, bukan gambar bernama.
    expect(tombol.querySelector('svg')).not.toBeNull();
  });

  it('klik sekali → label "ID" + tersimpan ubaya-language=en', () => {
    renderToggle();
    const tombol = screen.getByRole('button', { name: 'Switch language' });

    fireEvent.click(tombol);

    expect(tombol).toHaveTextContent('ID');
    expect(localStorage.getItem(KEY_BAHASA)).toBe('en');
  });

  it('klik dua kali → kembali ke ID dan tersimpan id', () => {
    renderToggle();
    const tombol = screen.getByRole('button', { name: 'Switch language' });

    fireEvent.click(tombol);
    fireEvent.click(tombol);

    expect(tombol).toHaveTextContent('EN');
    expect(localStorage.getItem(KEY_BAHASA)).toBe('id');
  });

  it('tanpa provider (unit test lain): klik tidak crash (no-op eksplisit)', () => {
    render(<LanguageToggle />);
    const tombol = screen.getByRole('button', { name: 'Switch language' });
    expect(() => fireEvent.click(tombol)).not.toThrow();
    expect(blokirLocalStorageTersimpan()).toBeNull();
  });
});

/** Helper: key bahasa tidak boleh tercatat saat provider tidak ada. */
function blokirLocalStorageTersimpan(): string | null {
  return localStorage.getItem(KEY_BAHASA);
}
