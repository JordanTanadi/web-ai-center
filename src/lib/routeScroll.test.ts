import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetFreshDocument, scrollForRoute } from './routeScroll.ts';

/** Pasang elemen ber-id dengan spy scrollIntoView miliknya sendiri. */
function pasangElemen(id: string) {
  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  const spy = vi.fn();
  el.scrollIntoView = spy;
  return { el, spy };
}

beforeEach(() => {
  document.body.innerHTML = '';
  resetFreshDocument();
  vi.mocked(window.scrollTo).mockClear();
});

describe('scrollForRoute', () => {
  it('muat dokumen pertama tanpa hash tidak menggeser posisi browser', () => {
    scrollForRoute('');

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('navigasi tanpa hash (setelah muat awal) mengembalikan scroll ke atas', () => {
    scrollForRoute(''); // panggilan pertama: dilewati
    scrollForRoute(''); // navigasi sesungguhnya

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('hash → scrollIntoView ke elemen target (block start, smooth)', () => {
    const { spy } = pasangElemen('kontak');

    scrollForRoute('#kontak');

    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('muat awal dengan hash tetap menggulir ke target (deep link)', () => {
    const { spy } = pasangElemen('layanan');

    scrollForRoute('#layanan');

    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('memakai behavior auto saat pengguna meminta reduced motion', () => {
    const asli = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { spy } = pasangElemen('kontak');
    try {
      scrollForRoute('#kontak');
    } finally {
      window.matchMedia = asli;
    }

    expect(spy).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });

  it('hash dengan id yang tidak ada → jatuh ke atas', () => {
    scrollForRoute(''); // konsumsi penanda muat awal

    scrollForRoute('#tidak-ada');

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('resetFreshDocument mengembalikan penanda (urutan skenario test independen)', () => {
    scrollForRoute(''); // konsumsi penanda
    resetFreshDocument();

    scrollForRoute('');

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
