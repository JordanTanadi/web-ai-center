import { describe, expect, it } from 'vitest';
import { aset, basisUrl, srcSetBerbasis } from './basis.ts';

describe('basisUrl', () => {
  it('diakhiri garis miring agar bisa digabung path', () => {
    expect(basisUrl().endsWith('/')).toBe(true);
  });
});

describe('aset', () => {
  it('mengawali path root-absolut dengan basis', () => {
    expect(aset('/tim/farid-naufal.jpg')).toBe(`${basisUrl()}tim/farid-naufal.jpg`);
  });

  it('mengawali path relatif dengan basis', () => {
    expect(aset('tim/x.jpg')).toBe(`${basisUrl()}tim/x.jpg`);
  });

  it('melewatkan URL eksternal & data URI tanpa diubah', () => {
    expect(aset('https://contoh.id/gambar.jpg')).toBe('https://contoh.id/gambar.jpg');
    expect(aset('//cdn.contoh.id/g.jpg')).toBe('//cdn.contoh.id/g.jpg');
    expect(aset('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
  });

  it('idempoten: path yang sudah berawalan basis tidak digandakan', () => {
    const sekali = aset('/tim/x.jpg');
    expect(aset(sekali)).toBe(sekali);
  });

  it('melempar Error untuk path kosong (bukan gagal diam-diam)', () => {
    expect(() => aset('')).toThrow(Error);
    expect(() => aset('   ')).toThrow(Error);
  });
});

describe('srcSetBerbasis', () => {
  it('menerapkan basis pada tiap URL kandidat', () => {
    expect(srcSetBerbasis('/hero-1-800.webp 800w, /hero-1-1600.webp 1600w')).toBe(
      `${basisUrl()}hero-1-800.webp 800w, ${basisUrl()}hero-1-1600.webp 1600w`,
    );
  });

  it('mengembalikan undefined/string kosong apa adanya', () => {
    expect(srcSetBerbasis(undefined)).toBeUndefined();
    expect(srcSetBerbasis('')).toBe('');
  });
});
