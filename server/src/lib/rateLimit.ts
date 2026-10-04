/**
 * Rate-limit percobaan login admin (fixed-window per kunci/IP, in-memory).
 *
 * Sengaja tanpa dependency baru: satu proses Bun cukup untuk menahan
 * brute-force 1 akun admin. Hitungan hilang saat restart server — tidak
 * masalah karena yang dijaga hanya percobaan password, bukan sesi pengguna.
 */

export interface OpsiRateLimitLogin {
  /** Jumlah percobaan gagal yang diizinkan di dalam satu jendela. */
  batasPercobaan: number;
  /** Panjang jendela dalam milidetik. */
  jendelaMs: number;
  /** Jam yang bisa disuntik untuk test (default: Date.now). */
  sekarang?: () => number;
}

/** Hasil periksa: diizinkan (sisa kuota) atau diblokir (detik sampai jendela habis). */
export type KeputusanRateLimit =
  | { diizinkan: true; sisaPercobaan: number }
  | { diizinkan: false; detikTersisa: number };

export interface PenghitungRateLimit {
  periksa: (kunci: string) => KeputusanRateLimit;
  catatGagal: (kunci: string) => void;
  reset: (kunci: string) => void;
  /** Jumlah kunci tersimpan (untuk test & observasi memori). */
  jumlahKunci: () => number;
}

interface JendelaGagal {
  mulai: number;
  gagal: number;
}

/**
 * Kunci per-IP dari request: X-Forwarded-For (nilai pertama bila berantai),
 * lalu X-Real-IP, lalu 'langsung' untuk koneksi tanpa proxy.
 */
export function kunciIpDariRequest(request: Request): string {
  const daftar = [request.headers.get('x-forwarded-for'), request.headers.get('x-real-ip')];
  for (const header of daftar) {
    if (header === null) continue;
    const pertama = header.split(',')[0]?.trim() ?? '';
    if (pertama !== '') return pertama;
  }
  return 'langsung';
}

export function buatRateLimitLogin(opsi: OpsiRateLimitLogin): PenghitungRateLimit {
  const { batasPercobaan, jendelaMs } = opsi;
  if (!Number.isFinite(batasPercobaan) || batasPercobaan < 1) {
    throw new Error('batasPercobaan harus angka >= 1');
  }
  if (!Number.isFinite(jendelaMs) || jendelaMs <= 0) {
    throw new Error('jendelaMs harus angka positif');
  }
  const sekarang = opsi.sekarang ?? Date.now;
  const jendela = new Map<string, JendelaGagal>();

  const kadaluwarsa = (rec: JendelaGagal, now: number): boolean => now - rec.mulai >= jendelaMs;

  /** Buang entri lama saat peta membesar — mencegah pertumbuhan memori tanpa batas. */
  const bersihkan = (now: number): void => {
    if (jendela.size < 256) return;
    for (const [kunci, rec] of jendela) {
      if (kadaluwarsa(rec, now)) jendela.delete(kunci);
    }
  };

  return {
    periksa(kunci) {
      const now = sekarang();
      const rec = jendela.get(kunci);
      if (rec === undefined || kadaluwarsa(rec, now)) {
        if (rec !== undefined) jendela.delete(kunci);
        return { diizinkan: true, sisaPercobaan: batasPercobaan };
      }
      if (rec.gagal >= batasPercobaan) {
        const sisaMs = rec.mulai + jendelaMs - now;
        return { diizinkan: false, detikTersisa: Math.max(1, Math.ceil(sisaMs / 1000)) };
      }
      return { diizinkan: true, sisaPercobaan: batasPercobaan - rec.gagal };
    },
    catatGagal(kunci) {
      const now = sekarang();
      bersihkan(now);
      const rec = jendela.get(kunci);
      if (rec === undefined || kadaluwarsa(rec, now)) {
        jendela.set(kunci, { mulai: now, gagal: 1 });
        return;
      }
      rec.gagal += 1;
    },
    reset(kunci) {
      jendela.delete(kunci);
    },
    jumlahKunci() {
      return jendela.size;
    },
  };
}
