import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PetaEmbed from './PetaEmbed.tsx';
import { kontakDummy } from '../data/kontak.ts';

describe('PetaEmbed', () => {
  it('iframe langsung tampil memakai mode embed + pin koordinat kontak', () => {
    render(<PetaEmbed latitude={kontakDummy.latitude} longitude={kontakDummy.longitude} />);
    const frame = screen.getByTitle('Peta lokasi AI Center');
    expect(frame).toHaveAttribute(
      'src',
      `https://maps.google.com/maps?q=${kontakDummy.latitude},${kontakDummy.longitude}&z=17&output=embed`,
    );
  });

  it('aksesibel & hemat kuota: title + loading lazy', () => {
    render(<PetaEmbed latitude={kontakDummy.latitude} longitude={kontakDummy.longitude} />);
    const frame = screen.getByTitle('Peta lokasi AI Center');
    expect(frame.tagName.toLowerCase()).toBe('iframe');
    expect(frame).toHaveAttribute('loading', 'lazy');
  });

  it('tone dark memakai bingkai putih transparan (latar navy)', () => {
    const { container } = render(
      <PetaEmbed latitude={kontakDummy.latitude} longitude={kontakDummy.longitude} tone="dark" />,
    );
    expect(container.firstElementChild?.className).toContain('border-white/10');
  });

  it('mini memakai tinggi minimum 160px (peta kecil footer)', () => {
    const { container } = render(
      <PetaEmbed latitude={kontakDummy.latitude} longitude={kontakDummy.longitude} mini />,
    );
    expect(container.querySelector('iframe')?.className).toContain('min-h-[160px]');
  });

  it('melempar Error untuk koordinat invalid (bukan iframe rusak)', () => {
    expect(() => render(<PetaEmbed latitude={Number.NaN} longitude={0} />)).toThrow(/Koordinat/);
    expect(() => render(<PetaEmbed latitude={0} longitude={Number.POSITIVE_INFINITY} />)).toThrow(
      /Koordinat/,
    );
  });

  it('deferred: tanpa IntersectionObserver iframe langsung; dengan IO menunggu terlihat', () => {
    // Path fallback (tanpa IO — kondisi jsdom) sudah tercakup test pertama;
    // di sini kita mock IO untuk membuktikan iframe ditahan sampai area terlihat.
    let pengamat: ((entries: { isIntersecting: boolean }[]) => void)[] = [];
    class IO_Palsu {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        pengamat.push(cb);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', IO_Palsu);
    try {
      const { container } = render(
        <PetaEmbed latitude={kontakDummy.latitude} longitude={kontakDummy.longitude} />,
      );
      // Sebelum terlihat: belum ada iframe (placeholder aria-hidden).
      expect(container.querySelector('iframe')).toBeNull();
      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
      // Area masuk viewport → iframe terpasang.
      act(() => {
        pengamat.forEach((cb) => cb([{ isIntersecting: true }]));
      });
      expect(container.querySelector('iframe')).not.toBeNull();
    } finally {
      vi.unstubAllGlobals();
      pengamat = [];
    }
  });
});
