import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PetaEmbed from './PetaEmbed.tsx';
import { kontakDummy } from '../data/kontak.ts';

describe('PetaEmbed', () => {
  it('iframe memakai mode embed + pin koordinat kontak', () => {
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
});
