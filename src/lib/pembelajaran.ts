/**
 * Logika LMS halaman detail kursus — port dari detail-kursus.html situs lama.
 *
 * State disimpan di localStorage dengan key `ubaya-learning-{kode}` (situs lama
 * memakai `ubaya-learning-{courseParam}`); progres = (modul selesai + prototipe)
 * dibagi (jumlah modul + 1). Semua fungsi murni dan mudah diuji per unit.
 */

/** Data lembar kerja prototipe (form akhir kursus). */
export interface PrototypeState {
  started?: boolean;
  problem?: string;
  user?: string;
  solution?: string;
  tools?: string;
  link?: string;
}

export interface StateBelajar {
  enrolled: boolean;
  completed: boolean[];
  watched: boolean[];
  quizPassed: boolean[];
  /** Index modul yang sedang dibuka di panel lesson; null = belum ada. */
  activeModule: number | null;
  prototype: PrototypeState;
  prototypeComplete: boolean;
  /** Rating 0 (belum) s.d. 5. */
  rating: number;
  review: string;
  ratingSubmitted: boolean;
}

export type Aksi =
  | { type: 'enroll' }
  | { type: 'pilihModul'; index: number }
  | { type: 'tontonLesson' }
  | { type: 'lulusQuiz' }
  | { type: 'toggleModulSelesai'; index: number }
  | { type: 'mulaiPrototipe' }
  | { type: 'simpanPrototipe'; data: PrototypeState }
  | { type: 'kirimRating'; rating: number; review: string };

/** State awal (belum enroll) untuk sejumlah modul. */
export function stateAwalBelajar(jumlahModul: number): StateBelajar {
  return {
    enrolled: false,
    completed: Array(jumlahModul).fill(false),
    watched: Array(jumlahModul).fill(false),
    quizPassed: Array(jumlahModul).fill(false),
    activeModule: null,
    prototype: {},
    prototypeComplete: false,
    rating: 0,
    review: '',
    ratingSubmitted: false,
  };
}

/** Key storage per kursus (kode huruf kecil agar 'r01'/'R01' sama). */
export function storageKeyBelajar(kode: string): string {
  return `ubaya-learning-${kode.trim().toUpperCase()}`;
}

/**
 * Baca state dari localStorage. Data korup/di luar pola di-normalisasi ke
 * state awal (gagal eksplisit, bukan crash) persis perilaku situs lama.
 */
export function bacaStateBelajar(kode: string, jumlahModul: number): StateBelajar {
  const awal = stateAwalBelajar(jumlahModul);
  try {
    const mentah: Record<string, unknown> = JSON.parse(
      localStorage.getItem(storageKeyBelajar(kode)) || '{}',
    );
    const daftarBool = (kunci: string): boolean[] =>
      Array.from(
        { length: jumlahModul },
        (_, i) => Boolean(Array.isArray(mentah[kunci]) && mentah[kunci][i]),
      );
    const aktif = mentah.activeModule;
    const proto = (mentah.prototype ?? {}) as PrototypeState;
    const rating = Number(mentah.rating);
    return {
      enrolled: Boolean(mentah.enrolled),
      completed: daftarBool('completed'),
      watched: daftarBool('watched'),
      quizPassed: daftarBool('quizPassed'),
      activeModule: Number.isInteger(aktif) ? (aktif as number) : null,
      prototype: proto,
      prototypeComplete: Boolean(mentah.prototypeComplete),
      rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : 0,
      review: typeof mentah.review === 'string' ? mentah.review : '',
      ratingSubmitted: Boolean(mentah.ratingSubmitted),
    };
  } catch {
    return awal;
  }
}

export function simpanStateBelajar(kode: string, state: StateBelajar): void {
  localStorage.setItem(storageKeyBelajar(kode), JSON.stringify(state));
}

/** Progres persen: (modul selesai + prototipe selesai) / (jumlah modul + 1). */
export function hitungProgressBelajar(state: StateBelajar, jumlahModul: number): number {
  const selesai = state.completed.filter(Boolean).length;
  const prototipe = state.prototypeComplete ? 1 : 0;
  return Math.round(((selesai + prototipe) / (jumlahModul + 1)) * 100);
}

/** Modul terkunci bila modul sebelumnya belum selesai (modul 0 selalu terbuka). */
export function modulTerkunci(index: number, completed: boolean[]): boolean {
  return index > 0 && !completed[index - 1];
}

/** Syarat 'Selesaikan modul': lesson ditonton DAN checkpoint lulus. */
export function modulBisaSelesai(state: StateBelajar, index: number): boolean {
  return Boolean(state.watched[index] && state.quizPassed[index]);
}

/** Label dinamis kartu akses (judul & baris progress) — persis situs lama. */
export function labelAksesKursus(state: StateBelajar, progress: number): {
  judul: string;
  status: string;
  jumlah: string;
} {
  const judul = state.prototypeComplete ? 'Kursus selesai' : state.enrolled ? 'Sedang belajar' : 'Preview tersedia';
  const status = state.prototypeComplete ? 'Kursus selesai' : state.enrolled ? 'Sedang belajar' : 'Belum dimulai';
  return { judul, status, jumlah: `${progress}% selesai` };
}

/**
 * Reducer state belajar. Guard eksplisit: toggle selesai hanya terjadi jika
 * watched + quizPassed (sama dengan situs lama); aksi tak valid = state berubah.
 */
export function kurangiStateBelajar(state: StateBelajar, aksi: Aksi, jumlahModul: number): StateBelajar {
  switch (aksi.type) {
    case 'enroll':
      return {
        ...state,
        enrolled: true,
        activeModule: state.activeModule ?? 0,
      };
    case 'pilihModul': {
      if (aksi.index < 0 || aksi.index >= jumlahModul || modulTerkunci(aksi.index, state.completed)) {
        return state;
      }
      return { ...state, activeModule: aksi.index };
    }
    case 'tontonLesson': {
      if (state.activeModule === null) return state;
      const watched = [...state.watched];
      watched[state.activeModule] = true;
      return { ...state, watched };
    }
    case 'lulusQuiz': {
      if (state.activeModule === null) return state;
      const quizPassed = [...state.quizPassed];
      quizPassed[state.activeModule] = true;
      return { ...state, quizPassed };
    }
    case 'toggleModulSelesai': {
      const { index } = aksi;
      if (index < 0 || index >= jumlahModul || !modulBisaSelesai(state, index)) return state;
      const completed = [...state.completed];
      completed[index] = !completed[index];
      const activeModule = completed[index] ? Math.min(index + 1, jumlahModul - 1) : index;
      return { ...state, completed, activeModule };
    }
    case 'mulaiPrototipe':
      return { ...state, prototype: { ...state.prototype, started: true } };
    case 'simpanPrototipe':
      return {
        ...state,
        prototype: { ...aksi.data, started: true },
        prototypeComplete: true,
      };
    case 'kirimRating': {
      const ratingValid = aksi.rating >= 1 && aksi.rating <= 5;
      return {
        ...state,
        rating: ratingValid ? aksi.rating : 0,
        review: aksi.review.trim(),
        ratingSubmitted: ratingValid,
      };
    }
    default:
      return state;
  }
}

export type TugasModel = 'summarize' | 'classify' | 'ideate';

/**
 * Simulasi inference dummy di browser (detail-kursus.html, `runDummyModel`) —
 * output berbasis aturan, tanpa model AI eksternal.
 * TODO_BACKEND: ganti dengan POST /api/inference ketika backend tersedia.
 */
export function jalankanModelDummy(tugas: TugasModel, input: string): string {
  const bersih = input.trim();
  if (!bersih) return 'Masukkan input terlebih dahulu.';

  if (tugas === 'classify') {
    const hurufKecil = bersih.toLowerCase();
    const label =
      hurufKecil.includes('jurnal') || hurufKecil.includes('belajar')
        ? 'PENDIDIKAN / RISET'
        : hurufKecil.includes('jualan') || hurufKecil.includes('usaha')
          ? 'PRODUKTIVITAS / BISNIS'
          : 'UMUM';
    const kata = bersih.split(/\s+/).slice(0, 5).join(', ');
    return (
      `LABEL: ${label}\nKATA KUNCI: ${kata}\nCONFIDENCE: 0.82\n\n` +
      'Catatan: ini classifier dummy berbasis aturan untuk menguji alur model.'
    );
  }

  if (tugas === 'ideate') {
    return (
      `IDE SOLUSI UNTUK:\n${bersih}\n\n` +
      '1. Formulasikan input pengguna dalam satu kalimat.\n' +
      '2. Beri rekomendasi langkah berikutnya yang dapat diuji.\n' +
      '3. Simpan hasil dan minta umpan balik pengguna.\n\n' +
      'CATATAN MODEL: simulasi ideasi lokal, belum memakai model AI eksternal.'
    );
  }

  const kata = bersih.split(/\s+/).filter(Boolean);
  const ringkasan = kata.length > 18 ? `${kata.slice(0, 18).join(' ')}...` : bersih;
  return (
    `RINGKASAN:\n${ringkasan}\n\nTOKEN YANG DIEKSTRAK: ${kata.length}\n\n` +
    'CATATAN MODEL: simulasi peringkas lokal untuk menguji input → inferensi → output.'
  );
}
