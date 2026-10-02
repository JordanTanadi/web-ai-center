import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Ikon, { type NamaIkon } from './Ikon.tsx';

const semua: NamaIkon[] = ['instagram', 'whatsapp', 'email', 'globe'];

describe('Ikon', () => {
  it.each(semua)('varian "%s" render svg dekoratif', (nama) => {
    const { container } = render(<Ikon nama={nama} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.querySelectorAll('*').length).toBeGreaterThan(0);
  });

  it('className kustom diteruskan (pewaris ukuran/warna)', () => {
    const { container } = render(<Ikon nama="instagram" className="h-11 w-11" />);
    expect(container.querySelector('svg')?.className.baseVal ?? '').toContain('h-11');
  });

  it('edge case: viewBox + stroke konsisten untuk semua varian', () => {
    for (const nama of semua) {
      const { container, unmount } = render(<Ikon nama={nama} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      unmount();
    }
  });
});
