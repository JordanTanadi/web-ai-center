import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LearningWorkspace from './LearningWorkspace.tsx';
import { kursusDummy } from '../data/pelatihan.ts';
import { stateAwalBelajar, type StateBelajar } from '../lib/pembelajaran.ts';

const R01 = kursusDummy[0]; // 4 modul

/** Prasyarat panel prototipe: semua modul sudah selesai (watched+quiz+completed). */
const LENGKAP = {
  completed: Array(4).fill(true),
  watched: Array(4).fill(true),
  quizPassed: Array(4).fill(true),
};

function stateProps(over: Partial<StateBelajar> = {}): StateBelajar {
  return { ...stateAwalBelajar(R01.modul.length), enrolled: true, activeModule: 0, ...over };
}

function renderWorkspace(state: StateBelajar, onAction = vi.fn()) {
  render(<LearningWorkspace kursus={R01} state={state} onAction={onAction} />);
  return onAction;
}

describe('LearningWorkspace — grid modul', () => {
  it('render 4 kartu modul; modul 2+ terkunci sampai pendahulunya selesai', () => {
    renderWorkspace(stateProps());

    expect(screen.getByText('Modul 01')).toBeInTheDocument();
    expect(screen.getByText('Modul 04')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Mulai modul' })).toHaveLength(1);
    const terkunci = screen.getAllByRole('button', { name: 'Selesaikan modul sebelumnya' });
    expect(terkunci).toHaveLength(3);
    for (const tombol of terkunci) expect(tombol).toBeDisabled();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('kartu yang selesai menampilkan status Selesai + tombol Ulangi', () => {
    renderWorkspace(
      stateProps({ completed: [true, false, false, false], watched: [true, false, false, false] }),
    );

    expect(screen.getByText('Selesai')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Ulangi' })).toHaveLength(1);
  });
});

describe('LearningWorkspace — panel lesson & checkpoint', () => {
  it('satu lesson aktif: eyebrow, blok durasi, dan status tonton/checkpoint', () => {
    renderWorkspace(stateProps());

    expect(screen.getByText('Lesson 1 dari 4')).toBeInTheDocument();
    expect(screen.getByText('Durasi: 4 video · 35 menit')).toBeInTheDocument();
    expect(screen.getByText('Belum ditonton · Checkpoint belum dikerjakan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mulai lesson' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Selesaikan modul' })).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'Rangkaian kursus' })).toBeInTheDocument();
  });

  it('jawaban salah → feedback eksplisit; jawaban benar → dispatch lulusQuiz', () => {
    const onAction = renderWorkspace(stateProps());

    fireEvent.click(
      screen.getByRole('button', { name: 'Pilih tools sebanyak mungkin tanpa menguji hasil' }),
    );
    expect(
      screen.getByText('Belum tepat. Pikirkan bagaimana konsep ini diterapkan dan diuji pada masalah nyata.'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Terapkan konsep pada masalah nyata lalu uji hasilnya' }),
    );
    expect(onAction).toHaveBeenCalledWith({ type: 'lulusQuiz' });
  });

  it('quizPassed=true → opsi benar berubah jadi penanda "Jawaban benar"', () => {
    renderWorkspace(stateProps({ quizPassed: [true, false, false, false] }));

    expect(
      screen.getByText('✓ Jawaban benar: terapkan konsep pada masalah nyata'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Checkpoint lulus/)).toBeInTheDocument();
  });

  it('watched + quiz lulus → tombol Selesaikan modul aktif dan mengirim toggle', () => {
    const onAction = renderWorkspace(
      stateProps({ watched: [true, false, false, false], quizPassed: [true, false, false, false] }),
    );

    const tombol = screen.getByRole('button', { name: 'Selesaikan modul' });
    expect(tombol).toBeEnabled();
    fireEvent.click(tombol);
    expect(onAction).toHaveBeenCalledWith({ type: 'toggleModulSelesai', index: 0 });
  });
});

describe('LearningWorkspace — video & kuis dari backend', () => {
  /** Kursus tiruan: modul 0 punya video YouTube + kuis nyata (modul lain tetap dummy). */
  const KURSUS_VIDEO_QUIZ = {
    ...R01,
    modul: R01.modul.map((m, i) =>
      i === 0
        ? {
            ...m,
            video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            quiz: [
              {
                pertanyaan: 'Apa kata kunci yang baik untuk riset?',
                opsi: ['Kata kunci spesifik', 'Kata umum sekali'],
                kunci: 0,
              },
            ],
          }
        : m,
    ),
  };

  function renderKhusus(state: StateBelajar, onAction = vi.fn()) {
    render(<LearningWorkspace kursus={KURSUS_VIDEO_QUIZ} state={state} onAction={onAction} />);
    return onAction;
  }

  it('modul dengan video → iframe embed nocookie + tombol tandai ditonton', () => {
    renderKhusus(stateProps());

    expect(screen.getByTitle('Video modul 1')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
    expect(screen.getByRole('button', { name: 'Tandai lesson ditonton' })).toBeInTheDocument();
    // Blok placeholder "Mulai lesson" tidak ikut tampil saat video tersedia.
    expect(screen.queryByRole('button', { name: 'Mulai lesson' })).not.toBeInTheDocument();
  });

  it('kuis nyata: belum semua terjawab → tombol kirim mati', () => {
    renderKhusus(stateProps());

    expect(screen.getByText('Kuis modul')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kirim jawaban' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Kata kunci spesifik' }));
    expect(screen.getByRole('button', { name: 'Kirim jawaban' })).toBeEnabled();
  });

  it('jawaban salah → nilai jujur + opsi benar disorot, tanpa lulusQuiz', () => {
    const onAction = renderKhusus(stateProps());

    fireEvent.click(screen.getByRole('radio', { name: 'Kata umum sekali' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kirim jawaban' }));

    expect(screen.getByText(/Benar 0 dari 1/)).toBeInTheDocument();
    expect(onAction).not.toHaveBeenCalledWith({ type: 'lulusQuiz' });
    // Opsi benar (kunci) disorot biru meski tidak dipilih.
    const radioBenar = screen.getByRole('radio', { name: 'Kata kunci spesifik' });
    expect(radioBenar.closest('label')?.className).toContain('border-brand');
    // Setelah dikirim, pilihan dikunci (tidak bisa mengubah jawaban).
    expect(screen.getByRole('radio', { name: 'Kata umum sekali' })).toBeDisabled();
  });

  it('semua soal benar → dispatch lulusQuiz + pesan lulus', () => {
    const onAction = renderKhusus(stateProps());

    fireEvent.click(screen.getByRole('radio', { name: 'Kata kunci spesifik' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kirim jawaban' }));

    expect(onAction).toHaveBeenCalledWith({ type: 'lulusQuiz' });
    expect(screen.getByText(/Benar semua \(1\/1\)/)).toBeInTheDocument();
  });

  it('quizPassed=true → checkpoint ditandai lulus tanpa form ulang', () => {
    renderKhusus(stateProps({ quizPassed: [true, false, false, false] }));

    expect(screen.getByText('✓ Checkpoint sudah lulus')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Kirim jawaban' })).not.toBeInTheDocument();
  });
});

describe('LearningWorkspace — prototipe & rating', () => {
  it('semua modul belum selesai → lembar prototipe terkunci dengan pesan jelas', () => {
    renderWorkspace(stateProps());
    expect(
      screen.getByText(
        'Selesaikan semua modul terlebih dahulu untuk membuka lembar kerja prototipe.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mulai prototyping' })).not.toBeInTheDocument();
  });

  it('semua modul selesai → tombol Mulai prototyping mengirim aksi mulaiPrototipe', () => {
    const onAction = renderWorkspace(stateProps(LENGKAP));

    const tombol = screen.getByRole('button', { name: 'Mulai prototyping' });
    fireEvent.click(tombol);
    expect(onAction).toHaveBeenCalledWith({ type: 'mulaiPrototipe' });
  });

  it('form prototipe terisi → submit mengirim simpanPrototipe dengan data form', () => {
    const onAction = renderWorkspace(stateProps({ ...LENGKAP, prototype: { started: true } }));

    fireEvent.change(screen.getByLabelText('Masalah yang ingin diselesaikan'), {
      target: { value: 'Jurnal sulit dirangkum' },
    });
    fireEvent.change(screen.getByLabelText('Target pengguna'), {
      target: { value: 'Mahasiswa' },
    });
    fireEvent.change(screen.getByLabelText('Solusi prototipe'), {
      target: { value: 'Rangkuman otomatis' },
    });
    fireEvent.change(screen.getByLabelText('Tools yang digunakan'), {
      target: { value: 'ChatGPT' },
    });
    const form = document.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(onAction).toHaveBeenCalledWith({
      type: 'simpanPrototipe',
      data: {
        problem: 'Jurnal sulit dirangkum',
        user: 'Mahasiswa',
        solution: 'Rangkuman otomatis',
        tools: 'ChatGPT',
        link: '',
      },
    });
  });

  it('model lab: input kosong → pesan eksplisit; ringkas → output RINGKASAN', () => {
    renderWorkspace(stateProps({ ...LENGKAP, prototype: { started: true } }));

    fireEvent.click(screen.getByRole('button', { name: 'Jalankan model' }));
    expect(screen.getByText('Masukkan input terlebih dahulu.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Input model'), {
      target: { value: 'Mahasiswa butuh cara cepat memahami jurnal ilmiah' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Jalankan model' }));
    expect(screen.getByText(/RINGKASAN:/)).toBeInTheDocument();
  });

  it('prototipe selesai → form rating muncul; submit kirim rating valid', () => {
    const onAction = renderWorkspace(
      stateProps({
        ...LENGKAP,
        prototypeComplete: true,
        prototype: { started: true, problem: 'X' },
      }),
    );

    expect(screen.getByRole('heading', { name: 'Proyekmu sudah dicatat.' })).toBeInTheDocument();
    expect(screen.getByText('Kursus selesai · Progress 100%')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Rating'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Ulasan'), { target: { value: 'Materi jelas' } });
    fireEvent.submit(document.querySelector('form') as HTMLFormElement);

    expect(onAction).toHaveBeenCalledWith({
      type: 'kirimRating',
      rating: 5,
      review: 'Materi jelas',
    });
  });

  it('rating sudah dikirim → ringkasan bintang + ulasan tampil (bukan form lagi)', () => {
    renderWorkspace(
      stateProps({
        ...LENGKAP,
        prototypeComplete: true,
        rating: 4,
        review: 'Bagus',
        ratingSubmitted: true,
      }),
    );

    expect(screen.getByText(/Rating kamu: ★★★★☆/)).toBeInTheDocument();
    expect(screen.getByText('Bagus')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Kirim rating' })).not.toBeInTheDocument();
  });
});
