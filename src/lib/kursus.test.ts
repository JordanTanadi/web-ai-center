import { describe, expect, it } from 'vitest';
import { labelDurasiTotal, menitDariMeta, totalMenitKursus } from './kursus.ts';

describe('menitDariMeta', () => {
  it('meta standar "N video · M menit" → M', () => {
    expect(menitDariMeta('4 video · 35 menit')).toBe(35);
    expect(menitDariMeta('1 video · 8 menit')).toBe(8);
  });

  it('huruf besar/kecil "Menit" tetap terbaca', () => {
    expect(menitDariMeta('2 video · 12 MENIT')).toBe(12);
  });

  it('tanpa angka menit → 0 (gagal eksplisit, bukan NaN)', () => {
    expect(menitDariMeta('Tanpa durasi')).toBe(0);
    expect(menitDariMeta('')).toBe(0);
  });
});

describe('totalMenitKursus', () => {
  it('menjumlahkan semua modul yang punya menit', () => {
    const modul = [{ meta: '4 video · 35 menit' }, { meta: '5 video · 48 menit' }, { meta: '4 video · 42 menit' }];
    expect(totalMenitKursus(modul)).toBe(125);
  });

  it('modul tanpa menit diabaikan tanpa merusak total', () => {
    expect(totalMenitKursus([{ meta: '35 menit' }, { meta: 'tanpa angka' }])).toBe(35);
  });

  it('daftar kosong → 0', () => {
    expect(totalMenitKursus([])).toBe(0);
  });
});

describe('labelDurasiTotal', () => {
  it('<60 menit → "±N menit"', () => {
    expect(labelDurasiTotal([{ meta: '4 video · 42 menit' }])).toBe('±42 menit');
  });

  it('kelipatan 60 → "±J jam" tanpa sisa', () => {
    expect(labelDurasiTotal([{ meta: '· 120 menit' }])).toBe('±2 jam');
  });

  it('jam + sisa → "±J jam M menit"', () => {
    const modul = [{ meta: '· 70 menit' }, { meta: '· 20 menit' }];
    expect(labelDurasiTotal(modul)).toBe('±1 jam 30 menit');
  });

  it('tidak ada menit sama sekali → null (tampilan menyembunyikan)', () => {
    expect(labelDurasiTotal([{ meta: 'tanpa durasi' }])).toBeNull();
    expect(labelDurasiTotal([])).toBeNull();
  });
});
