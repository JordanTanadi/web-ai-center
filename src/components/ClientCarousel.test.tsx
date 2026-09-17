import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClientCarousel from './ClientCarousel.tsx';
import type { Klien } from '../data/klien.ts';

const items: Klien[] = [
  { nama: 'Klien A', bidang: 'Teknologi' },
  { nama: 'Klien B', bidang: 'Data' },
  { nama: 'Klien C', bidang: 'Pemerintahan' },
  { nama: 'Klien D', bidang: 'Edukasi' },
];

function renderCarousel(list: Klien[] = items, intervalMs = 1000) {
  return render(
    <MemoryRouter>
      <ClientCarousel items={list} perPage={3} intervalMs={intervalMs} />
    </MemoryRouter>,
  );
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

describe('ClientCarousel', () => {
  it('halaman pertama + dots, tanpa tombol panah', () => {
    renderCarousel();
    expect(screen.getByText('Klien A')).toBeInTheDocument();
    expect(screen.getByText('Klien C')).toBeInTheDocument();
    expect(screen.queryByText('Klien D')).not.toBeInTheDocument();
    const tabs = screen.getByRole('tablist', { name: /pilih halaman klien/i });
    expect(within(tabs).getAllByRole('tab')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /sebelumnya|berikutnya/i })).toBeNull();
  });

  it('halaman berganti sendiri tiap interval dan wrap-around', () => {
    renderCarousel();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Klien D')).toBeInTheDocument();
    expect(screen.queryByText('Klien A')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Klien A')).toBeInTheDocument();
  });

  it('klik dot melompat ke halaman terkait', () => {
    renderCarousel();
    fireEvent.click(screen.getByRole('tab', { name: 'Tampilkan halaman 2' }));
    expect(screen.getByText('Klien D')).toBeInTheDocument();
  });

  it('edge case: prefers-reduced-motion mematikan autoplay', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    );
    renderCarousel();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Klien A')).toBeInTheDocument();
    expect(screen.queryByText('Klien D')).not.toBeInTheDocument();
  });

  it('edge case: list kosong tampilkan empty state', () => {
    renderCarousel([]);
    expect(screen.getByText(/belum ada data klien/i)).toBeInTheDocument();
  });

  it('edge case: item <= perPage tampilkan semua tanpa dots', () => {
    renderCarousel(items.slice(0, 2));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Klien A')).toBeInTheDocument();
    expect(screen.getByText('Klien B')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).toBeNull();
  });
});
