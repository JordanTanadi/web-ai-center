import { describe, expect, it } from 'vitest';
import { petakanProfilApi, profilDummy, type ProfilApi } from './profil.ts';

describe('profilDummy (visi & misi resmi)', () => {
  it('visi punya judul dan deskripsi resmi terisi', () => {
    expect(profilDummy.visi.judul.trim()).not.toBe('');
    expect(profilDummy.visi.judul).toContain('AI Solution Factory terdepan');
    expect(profilDummy.visi.deskripsi.trim()).not.toBe('');
  });

  it('misi tepat 5 poin, unik, dan tiap poin terisi', () => {
    expect(profilDummy.misi).toHaveLength(5);
    for (const poin of profilDummy.misi) {
      expect(poin.trim()).not.toBe('');
      // Poin tidak boleh membawa nomor prefix (penomoran urusan render)
      expect(poin).not.toMatch(/^\d{2}[\.\)]\s/);
    }
    expect(new Set(profilDummy.misi).size).toBe(profilDummy.misi.length);
  });

  it('edge: intro section tidak boleh kosong', () => {
    expect(profilDummy.introVisiMisi.trim()).not.toBe('');
  });
});

const apiLengkap: ProfilApi = {
  nama: 'AI Center Universitas Surabaya',
  tagline: 'Tagline',
  ringkasan: 'Ringkasan',
  alamat: 'Gedung Fakultas Teknik · TA 1.2',
  email: 'aicenter@unit.ubaya.ac.id',
  telepon: '0895-6342-22240',
  visi: 'Judul Visi — Deskripsi visi yang panjang.',
  misi: 'Poin pertama.\nPoin kedua.\nPoin ketiga.',
};

describe('petakanProfilApi', () => {
  it('memecah visi "judul — deskripsi" dan misi per baris', () => {
    const hasil = petakanProfilApi(apiLengkap);
    expect(hasil.visi).toEqual({ judul: 'Judul Visi', deskripsi: 'Deskripsi visi yang panjang.' });
    expect(hasil.misi).toEqual(['Poin pertama.', 'Poin kedua.', 'Poin ketiga.']);
    // intro tidak ada di backend → selalu dari profilDummy
    expect(hasil.introVisiMisi).toBe(profilDummy.introVisiMisi);
  });

  it('deskripsi berisi " — " tambahan tidak terpotong (split pertama saja)', () => {
    const hasil = petakanProfilApi({ ...apiLengkap, visi: 'Judul — bagian A — bagian B' });
    expect(hasil.visi).toEqual({ judul: 'Judul', deskripsi: 'bagian A — bagian B' });
  });

  it('edge: visi kosong → pakai profilDummy.visi (kartu tidak kosong)', () => {
    expect(petakanProfilApi({ ...apiLengkap, visi: undefined }).visi).toEqual(profilDummy.visi);
    expect(petakanProfilApi({ ...apiLengkap, visi: '   ' }).visi).toEqual(profilDummy.visi);
  });

  it('edge: misi null/kosong → [] (empty-state "Misi belum tersedia." tampil)', () => {
    expect(petakanProfilApi({ ...apiLengkap, misi: undefined }).misi).toEqual([]);
    expect(petakanProfilApi({ ...apiLengkap, misi: '\n \n' }).misi).toEqual([]);
  });
});
