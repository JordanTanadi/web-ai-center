/**
 * Konteks bahasa situs — pengganti toggle `ubaya-language` situs lama.
 *
 * Strategi: kunci kamus = teks Indonesia yang tampil di UI, nilai = padanan
 * Inggris. Tanpa pasangan di kamus, teks tetap Indonesia (situs lama juga
 * berperilaku begitu). Tanpa provider (mis. unit test), bahasa default 'id'.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { kamusBahasa } from './kamusBahasa.ts';

export type Bahasa = 'id' | 'en';

/** Key localStorage sama dengan situs lama agar preferensi user lama terbawa. */
export const KEY_BAHASA = 'ubaya-language';

/**
 * Pola dinamis yang tak bisa jadi key statis (angka di tengah kalimat) —
 * mengikuti regex halaman lama ('Lesson $1 dari $2' → 'Lesson $1 of $2', dst.).
 * Bulan ikut dipolakan agar formatTanggal terjemah otomatis di mode EN.
 */
const BULAN_EN: Record<string, string> = {
  Januari: 'January',
  Februari: 'February',
  Maret: 'March',
  Mei: 'May',
  Juni: 'June',
  Juli: 'July',
  Agustus: 'August',
  Oktober: 'October',
  November: 'November',
  Desember: 'December',
};

const POLA_EN: Array<[RegExp, string | ((pendukung: string) => string)]> = [
  [/Lesson (\d+) dari (\d+)/g, 'Lesson $1 of $2'],
  [/Slide (\d+) dari (\d+)/g, 'Slide $1 of $2'],
  [/Tampilkan slide (\d+)/g, 'Show slide $1'],
  [/Durasi:/g, 'Duration:'],
  [/\bModul (\d{2})\b/g, 'Module $1'],
  [/(\d+) modul\b/g, '$1 modules'],
  [/(\d+) sesi\b/g, '$1 sessions'],
  [/(\d+) menit/g, '$1 minutes'],
  [/(\d+)% selesai/g, '$1% complete'],
  [/Rating (\d+) dari (\d+)/g, 'Rating $1 of $2'],
  [
    /\b(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b/g,
    (bulan: string) => BULAN_EN[bulan] ?? bulan,
  ],
];

interface KonteksBahasa {
  bahasa: Bahasa;
  setBahasa: (bahasa: Bahasa) => void;
}

const Konteks = createContext<KonteksBahasa>({
  bahasa: 'id',
  // Tanpa provider: perubahan bahasa diabaikan eksplisit (test tetap di ID).
  setBahasa: () => {},
});

export function PenyediaBahasa({ children }: { children: ReactNode }) {
  const [bahasa, setBahasaState] = useState<Bahasa>(() =>
    localStorage.getItem(KEY_BAHASA) === 'en' ? 'en' : 'id',
  );

  const value = useMemo<KonteksBahasa>(
    () => ({
      bahasa,
      setBahasa: (berikut: Bahasa) => {
        setBahasaState(berikut);
        localStorage.setItem(KEY_BAHASA, berikut);
      },
    }),
    [bahasa],
  );

  return <Konteks.Provider value={value}>{children}</Konteks.Provider>;
}

export function useBahasa(): KonteksBahasa {
  return useContext(Konteks);
}

/**
 * Terjemah teks UI: cocok persis di kamus → hasil; belum ada → coba pola
 * dinamis (EN); tetap tak ada → teks Indonesia apa adanya (fallback eksplisit).
 */
export function terjemah(teksId: string, bahasa: Bahasa): string {
  if (bahasa === 'id') return teksId;
  const pasangan = kamusBahasa[teksId];
  if (pasangan) return pasangan;
  let hasil = teksId;
  for (const [pola, ganti] of POLA_EN) {
    // Narrowing eksplisit: replace menerima string XOR fungsi replacer.
    hasil = typeof ganti === 'function' ? hasil.replace(pola, ganti) : hasil.replace(pola, ganti);
  }
  return hasil;
}

/** Hook translate untuk teks tampil: `const t = useT(); {t('Beranda')}`. */
export function useT(): (teksId: string) => string {
  const { bahasa } = useBahasa();
  return useMemo(() => (teksId: string) => terjemah(teksId, bahasa), [bahasa]);
}
