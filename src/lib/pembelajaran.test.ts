import { beforeEach, describe, expect, it } from 'vitest';
import {
  bacaStateBelajar,
  gabungStateBelajar,
  hitungProgressBelajar,
  jalankanModelDummy,
  jejakStateBelajar,
  labelAksesKursus,
  kurangiStateBelajar,
  modulBisaSelesai,
  modulTerkunci,
  normalisasiStateBelajar,
  simpanStateBelajar,
  stateAwalBelajar,
  stateBelajarTerisi,
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

describe('normalisasiStateBelajar (mentah dari localStorage/backend)', () => {
  it('objek tak dikenal / bukan objek → jatuh ke state awal, tidak crash', () => {
    expect(normalisasiStateBelajar(null, N)).toEqual(stateAwalBelajar(N));
    expect(normalisasiStateBelajar([1, 2], N)).toEqual(stateAwalBelajar(N));
    expect(normalisasiStateBelajar('kacau', N)).toEqual(stateAwalBelajar(N));
    expect(normalisasiStateBelajar({ completed: 'bukan-array', rating: 'banyak' }, N)).toEqual(
      stateAwalBelajar(N),
    );
  });

  it('field sah dipertahankan; rating di luar 1-5 di-reset ke 0', () => {
    const hasil = normalisasiStateBelajar(
      {
        enrolled: true,
        completed: [true, false],
        watched: [true, true],
        quizPassed: [true, false],
        activeModule: 1,
        prototype: { problem: 'Masalah' },
        prototypeComplete: false,
        rating: 9,
        review: '  Bagus  ',
        ratingSubmitted: true,
      },
      N,
    );
    expect(hasil.enrolled).toBe(true);
    expect(hasil.completed).toEqual([true, false, false, false]);
    expect(hasil.watched).toEqual([true, true, false, false]);
    expect(hasil.activeModule).toBe(1);
    expect(hasil.prototype.problem).toBe('Masalah');
    expect(hasil.rating).toBe(0); // 9 di luar rentang 1-5
    expect(hasil.review).toBe('  Bagus  '); // dinormalisasi membaca, trim urusan reducer
  });
});

describe('gabungStateBelajar (lokal vs salinan backend)', () => {
  it('progres server lebih tinggi (localStorage terhapus) → server menang', () => {
    const lokal = stateAwalBelajar(N);
    const server: typeof lokal = { ...stateAwalBelajar(N), enrolled: true, completed: [true, true, false, false] };
    expect(gabungStateBelajar(lokal, server, N)).toBe(server);
  });

  it('progres lokal lebih tinggi (sempat offline, POST gagal) → lokal menang', () => {
    const server = { ...stateAwalBelajar(N), enrolled: true, completed: [true, false, false, false] };
    const lokal = { ...stateAwalBelajar(N), enrolled: true, completed: [true, true, true, false] };
    expect(gabungStateBelajar(lokal, server, N)).toBe(lokal);
  });

  it('seri progres → yang jejak belajarnya lebih banyak menang; seri penuh → lokal', () => {
    // Server masih menyimpan enroll + lesson ditonton; lokal hanya enroll.
    const lokal = { ...stateAwalBelajar(N), enrolled: true };
    const server = {
      ...stateAwalBelajar(N),
      enrolled: true,
      watched: [true, false, false, false],
    };
    expect(gabungStateBelajar(lokal, server, N)).toBe(server);

    // Jejak sama → lokal dipakai (aksi terakhir di browser ini).
    const lokalSeri = { ...stateAwalBelajar(N), enrolled: true, watched: [true, false, false, false] };
    expect(gabungStateBelajar(lokalSeri, server, N)).toBe(lokalSeri);
    expect(gabungStateBelajar(lokal, { ...stateAwalBelajar(N), enrolled: true }, N)).toBe(lokal);
  });
});

describe('jejakStateBelajar (penentu seri + gerbang sinkron)', () => {
  it('state awal = 0; tiap bukti aktivitas menambah jejak', () => {
    expect(jejakStateBelajar(stateAwalBelajar(N))).toBe(0);
    expect(jejakStateBelajar({ ...stateAwalBelajar(N), activeModule: 0 })).toBe(0);
    expect(jejakStateBelajar({ ...stateAwalBelajar(N), enrolled: true })).toBe(1);
    expect(
      jejakStateBelajar({
        ...stateAwalBelajar(N),
        completed: [true, false, false, false],
        watched: [true, true, false, false],
        quizPassed: [true, false, false, false],
      }),
    ).toBe(4);
    expect(
      jejakStateBelajar({
        ...stateAwalBelajar(N),
        prototype: { problem: 'Masalah' },
        prototypeComplete: true,
        rating: 4,
        review: 'Keren',
      }),
    ).toBe(4);
    // Review hanya-spasi & nilai prototipe kosong tidak dihitung.
    expect(
      jejakStateBelajar({ ...stateAwalBelajar(N), review: '   ', prototype: { problem: '' } }),
    ).toBe(0);
  });
});

describe('stateBelajarTerisi (gerbang sinkron backend)', () => {
  it('state awal kosong → TIDAK layak dikirim (tak membuat baris percuma)', () => {
    expect(stateBelajarTerisi(stateAwalBelajar(N))).toBe(false);
    expect(stateBelajarTerisi({ ...stateAwalBelajar(N), activeModule: 0 })).toBe(false);
  });

  it('jejak belajar apa pun → layak dikirim', () => {
    expect(stateBelajarTerisi({ ...stateAwalBelajar(N), enrolled: true })).toBe(true);
    expect(stateBelajarTerisi({ ...stateAwalBelajar(N), completed: [false, true, false, false] })).toBe(true);
    expect(stateBelajarTerisi({ ...stateAwalBelajar(N), watched: [true, false, false, false] })).toBe(true);
    expect(stateBelajarTerisi({ ...stateAwalBelajar(N), quizPassed: [true, false, false, false] })).toBe(true);
    expect(stateBelajarTerisi({ ...stateAwalBelajar(N), prototypeComplete: true })).toBe(true);
    expect(stateBelajarTerisi({ ...stateAwalBelajar(N), prototype: { problem: 'X' } })).toBe(true);
    expect(stateBelajarTerisi({ ...stateAwalBelajar(N), rating: 5, ratingSubmitted: true })).toBe(true);
    expect(stateBelajarTerisi({ ...stateAwalBelajar(N), review: 'Keren' })).toBe(true);
    // Review hanya-spasi tidak dianggap jejak.
    expect(stateBelajarTerisi({ ...stateAwalBelajar(N), review: '   ' })).toBe(false);
  });
});
