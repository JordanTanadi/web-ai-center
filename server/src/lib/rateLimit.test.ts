/**
 * Unit test rate-limit login: logika jendela fixed-window + parsing kunci IP.
 * Jam disuntik lewat opsi `sekarang` — tanpa jeda waktu nyata.
 */
import { describe, expect, test } from 'bun:test';
import { buatRateLimitLogin, kunciIpDariRequest } from './rateLimit';

const JENDELA_MS = 60_000;

/** Buat limiter dengan jam semu + penggeser waktu. */
function buatLimiter(batas = 3) {
  let now = 1_000_000;
  const limiter = buatRateLimitLogin({
    batasPercobaan: batas,
    jendelaMs: JENDELA_MS,
    sekarang: () => now,
  });
  return {
    limiter,
    maju: (ms: number) => {
      now += ms;
    },
  };
}

describe('buatRateLimitLogin', () => {
  test('opsi tidak valid → lempar error eksplisit', () => {
    expect(() => buatRateLimitLogin({ batasPercobaan: 0, jendelaMs: 1000 })).toThrow();
    expect(() => buatRateLimitLogin({ batasPercobaan: 3, jendelaMs: 0 })).toThrow();
  });

  test('awalnya diizinkan penuh; tiap gagal mengurangi sisa kuota', () => {
    const { limiter } = buatLimiter(3);
    expect(limiter.periksa('ip')).toEqual({ diizinkan: true, sisaPercobaan: 3 });
    limiter.catatGagal('ip');
    expect(limiter.periksa('ip')).toEqual({ diizinkan: true, sisaPercobaan: 2 });
    limiter.catatGagal('ip');
    expect(limiter.periksa('ip')).toEqual({ diizinkan: true, sisaPercobaan: 1 });
  });

  test('mencapai batas → diblokir dengan detikTersisa di dalam jendela', () => {
    const { limiter } = buatLimiter(3);
    for (let i = 0; i < 3; i++) limiter.catatGagal('ip');
    const putusan = limiter.periksa('ip');
    expect(putusan.diizinkan).toBe(false);
    if (!putusan.diizinkan) {
      expect(putusan.detikTersisa).toBeGreaterThan(0);
      expect(putusan.detikTersisa).toBeLessThanOrEqual(60);
    }
  });

  test('jendela kedaluwarsa → diizinkan lagi, hitungan mulai ulang', () => {
    const { limiter, maju } = buatLimiter(3);
    for (let i = 0; i < 3; i++) limiter.catatGagal('ip');
    expect(limiter.periksa('ip').diizinkan).toBe(false);
    maju(JENDELA_MS);
    expect(limiter.periksa('ip')).toEqual({ diizinkan: true, sisaPercobaan: 3 });
  });

  test('reset (login sukses) mengembalikan kuota penuh', () => {
    const { limiter } = buatLimiter(3);
    limiter.catatGagal('ip');
    limiter.catatGagal('ip');
    limiter.reset('ip');
    expect(limiter.periksa('ip')).toEqual({ diizinkan: true, sisaPercobaan: 3 });
  });

  test('kunci terpisah: lock satu IP tidak mempengaruhi IP lain', () => {
    const { limiter } = buatLimiter(1);
    limiter.catatGagal('a');
    expect(limiter.periksa('a').diizinkan).toBe(false);
    expect(limiter.periksa('b').diizinkan).toBe(true);
  });

  test('entri kadaluwarsa dibersihkan saat peta melebihi 256 kunci', () => {
    const { limiter, maju } = buatLimiter(3);
    for (let i = 0; i < 300; i++) limiter.catatGagal(`ip-${i}`);
    // Masih dalam jendela → tidak ada yang dibuang.
    expect(limiter.jumlahKunci()).toBe(300);
    maju(JENDELA_MS);
    // Lewat ambang + semua kadaluwarsa → tersisa kunci baru saja dicatat.
    limiter.catatGagal('ip-baru');
    expect(limiter.jumlahKunci()).toBe(1);
  });
});

describe('kunciIpDariRequest', () => {
  test('X-Forwarded-For berantai → pakai nilai pertama', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': ' 203.0.113.9 , 10.0.0.1' },
    });
    expect(kunciIpDariRequest(req)).toBe('203.0.113.9');
  });

  test('tanpa XFF → X-Real-IP; tanpa keduanya → "langsung"', () => {
    const real = new Request('http://localhost/', { headers: { 'x-real-ip': '198.51.100.4' } });
    expect(kunciIpDariRequest(real)).toBe('198.51.100.4');
    expect(kunciIpDariRequest(new Request('http://localhost/'))).toBe('langsung');
  });
});
