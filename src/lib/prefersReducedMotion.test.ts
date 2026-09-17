import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion } from './prefersReducedMotion.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('prefersReducedMotion', () => {
  it('false bila matchMedia tidak tersedia', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('mengikuti hasil matchMedia', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    );
    expect(prefersReducedMotion()).toBe(true);
  });

  it('edge case: query yang dipakai adalah prefers-reduced-motion: reduce', () => {
    const mq = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    vi.stubGlobal('matchMedia', mq);
    prefersReducedMotion();
    expect(mq).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});
