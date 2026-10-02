import { beforeEach, describe, expect, it } from 'vitest';
import {
  bacaStateBelajar,
  hitungProgressBelajar,
  jalankanModelDummy,
  labelAksesKursus,
  kurangiStateBelajar,
  modulBisaSelesai,
  modulTerkunci,
  simpanStateBelajar,
  stateAwalBelajar,
} from './pembelajaran.ts';

// Kursus R01 punya 4 modul — dipakai sebagai fixture umum.
const N = 4;

beforeEach(() => {
  localStorage.clear();
});

describe('state awal & storage', () => {
  it('state awal: belum enroll, semua array false, tanpa modul aktif', () => {
    const s = stateAwalBelajar(N);
    expect(s.enrolled).toBe(false);
    expect(s.completed).toHaveLength(N);
    expect(s.completed.every((v) => v === false)).toBe(true);
    expect(s.activeModule).toBeNull();
    expect(s.ratingSubmitted).toBe(false);
  });

  it('simpan lalu baca kembali: state utuh (round-trip localStorage)', () => {
    const s = stateAwalBelajar(N);
    const termutakhir = kurangiStateBelajar(kurangiStateBelajar(s, { type: 'enroll' }, N), { type: 'tontonLesson' }, N);
    simpanStateBelajar('r01', termutakhir);

    const hasil = bacaStateBelajar('R01', N); // kode beda huruf, key sama
    expect(hasil.enrolled).toBe(true);
    expect(hasil.watched[0]).toBe(true);
    expect(hasil.activeModule).toBe(0);
  });

  it('edge: data korup di localStorage jatuh ke state awal, tidak crash', () => {
    localStorage.setItem('ubaya-learning-R01', '{bukan json');
    expect(() => bacaStateBelajar('R01', N)).not.toThrow();
    const hasil = bacaStateBelajar('R01', N);
    expect(hasil.enrolled).toBe(false);
    expect(hasil.completed).toHaveLength(N);
  });

  it('edge: jumlah modul berubah (data lama) → array dinormalisasi ke panjang baru', () => {
    simpanStateBelajar('R01', { ...stateAwalBelajar(2), enrolled: true, completed: [true, true] });
    const hasil = bacaStateBelajar('R01', N);
    expect(hasil.completed).toEqual([true, true, false, false]);
    expect(hasil.watched).toHaveLength(N);
  });
});

describe('progres, kunci modul, dan label akses', () => {
  it('progres: 0% awal; 1 dari 4 modul = 20%; + prototipe = 40%', () => {
    let s = stateAwalBelajar(N);
    expect(hitungProgressBelajar(s, N)).toBe(0);

    s = kurangiStateBelajar(s, { type: 'enroll' }, N);
    s = { ...s, completed: [true, false, false, false] };
    expect(hitungProgressBelajar(s, N)).toBe(20);

    s = { ...s, prototypeComplete: true };
    expect(hitungProgressBelajar(s, N)).toBe(40);
  });

  it('kunci: modul 0 selalu terbuka; modul >0 terkunci sampai pendahulunya selesai', () => {
    const completed = [true, false, false, false];
    expect(modulTerkunci(0, completed)).toBe(false);
    expect(modulTerkunci(1, completed)).toBe(false);
    expect(modulTerkunci(2, completed)).toBe(true);
  });

  it('label akses: Preview tersedia → Sedang belajar → Kursus selesai', () => {
    const awal = stateAwalBelajar(N);
    expect(labelAksesKursus(awal, 0)).toEqual({
      judul: 'Preview tersedia',
      status: 'Belum dimulai',
      jumlah: '0% selesai',
    });

    const enrolled = kurangiStateBelajar(awal, { type: 'enroll' }, N);
    expect(labelAksesKursus(enrolled, 20).judul).toBe('Sedang belajar');
    expect(labelAksesKursus(enrolled, 20).status).toBe('Sedang belajar');

    const selesai = { ...enrolled, prototypeComplete: true };
    expect(labelAksesKursus(selesai, 100).judul).toBe('Kursus selesai');
    expect(labelAksesKursus(selesai, 100).jumlah).toBe('100% selesai');
  });
});

describe('reducer alur belajar', () => {
  it('enroll: enrolled=true + modul aktif 0 (sekali enroll saja aman)', () => {
    let s = stateAwalBelajar(N);
    s = kurangiStateBelajar(s, { type: 'enroll' }, N);
    expect(s.activeModule).toBe(0);

    // Buka modul 1 (modul 0 sudah selesai agar tidak terkunci), lalu enroll ulang.
    s = { ...s, completed: [true, false, false, false] };
    s = kurangiStateBelajar(s, { type: 'pilihModul', index: 1 }, N);
    s = kurangiStateBelajar(s, { type: 'enroll' }, N);
    expect(s.enrolled).toBe(true);
    expect(s.activeModule).toBe(1); // enroll ulang tidak mereset modul aktif
  });

  it('selesai modul butuh watched + quiz; tanpa keduanya state tidak berubah', () => {
    let s = kurangiStateBelajar(stateAwalBelajar(N), { type: 'enroll' }, N);
    const sebelum = s;
    s = kurangiStateBelajar(s, { type: 'toggleModulSelesai', index: 0 }, N);
    expect(s).toBe(sebelum); // guard eksplisit: tidak ada perubahan

    s = kurangiStateBelajar(s, { type: 'tontonLesson' }, N);
    s = kurangiStateBelajar(s, { type: 'lulusQuiz' }, N);
    expect(modulBisaSelesai(s, 0)).toBe(true);
    s = kurangiStateBelajar(s, { type: 'toggleModulSelesai', index: 0 }, N);
    expect(s.completed[0]).toBe(true);
    expect(s.activeModule).toBe(1); // otomatis lanjut ke modul berikutnya
  });

  it('toggle "Tandai belum selesai" mengembalikan modul & fokus ke modul itu', () => {
    let s = kurangiStateBelajar(stateAwalBelajar(N), { type: 'enroll' }, N);
    s = {
      ...s,
      completed: [true, true, false, false],
      watched: [true, true, false, false],
      quizPassed: [true, true, false, false],
    };
    s = kurangiStateBelajar(s, { type: 'toggleModulSelesai', index: 0 }, N);
    s = kurangiStateBelajar(s, { type: 'toggleModulSelesai', index: 1 }, N);
    expect(s.completed).toEqual([false, false, false, false]);
    expect(s.activeModule).toBe(1);
  });

  it('pilihModul menolak modul terkunci (guard, bukan hanya UI)', () => {
    const s = kurangiStateBelajar(stateAwalBelajar(N), { type: 'enroll' }, N);
    const hasil = kurangiStateBelajar(s, { type: 'pilihModul', index: 3 }, N);
    expect(hasil).toBe(s);
  });

  it('alur akhir: semua modul → prototipe → rating (valid & tidak valid)', () => {
    let s = kurangiStateBelajar(stateAwalBelajar(N), { type: 'enroll' }, N);
    s = { ...s, watched: Array(N).fill(true), quizPassed: Array(N).fill(true) };
    s = kurangiStateBelajar(s, { type: 'mulaiPrototipe' }, N);
    expect(s.prototypeComplete).toBe(false);
    expect(s.prototype.started).toBe(true);

    s = kurangiStateBelajar(
      s,
      { type: 'simpanPrototipe', data: { problem: 'A', user: 'B', solution: 'C', tools: 'D' } },
      N,
    );
    expect(s.prototypeComplete).toBe(true);
    expect(s.prototype.problem).toBe('A');

    s = kurangiStateBelajar(s, { type: 'kirimRating', rating: 5, review: '  Mantap  ' }, N);
    expect(s.ratingSubmitted).toBe(true);
    expect(s.rating).toBe(5);
    expect(s.review).toBe('Mantap'); // trim eksplisit

    const gagal = kurangiStateBelajar(s, { type: 'kirimRating', rating: 0, review: '' }, N);
    expect(gagal.ratingSubmitted).toBe(false);
    expect(gagal.rating).toBe(0);
  });
});

describe('jalankanModelDummy', () => {
  it('input kosong → pesan eksplisit (gagal eksplisit)', () => {
    expect(jalankanModelDummy('summarize', '   ')).toBe('Masukkan input terlebih dahulu.');
  });

  it('summarize: potong >18 kata + hitung token', () => {
    const panjang = Array.from({ length: 25 }, (_, i) => `kata${i}`).join(' ');
    const hasil = jalankanModelDummy('summarize', panjang);
    expect(hasil).toContain('RINGKASAN:');
    expect(hasil).toContain('...');
    expect(hasil).toContain('TOKEN YANG DIEKSTRAK: 25');
  });

  it('classify: aturan label (jurnal → PENDIDIKAN / RISET; umum → UMUM)', () => {
    expect(jalankanModelDummy('classify', 'cari jurnal skripsi')).toContain('PENDIDIKAN / RISET');
    expect(jalankanModelDummy('classify', 'belanja sayur')).toContain('LABEL: UMUM');
    expect(jalankanModelDummy('classify', 'jual gorengan')).not.toContain('PRODUKTIVITAS / BISNIS');
    expect(jalankanModelDummy('classify', 'buka usaha gorengan')).toContain('PRODUKTIVITAS / BISNIS');
  });

  it('ideate: output berisi ide + catatan simulasi lokal', () => {
    const hasil = jalankanModelDummy('ideate', 'mahasiswa kesulitan merangkum jurnal');
    expect(hasil).toContain('IDE SOLUSI UNTUK:');
    expect(hasil).toContain('simulasi ideasi lokal');
  });
});
