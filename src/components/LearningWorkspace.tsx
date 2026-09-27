import { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading.tsx';
import type { Kursus } from '../data/pelatihan.ts';
import {
  hitungProgressBelajar,
  jalankanModelDummy,
  modulBisaSelesai,
  modulTerkunci,
  type Aksi,
  type StateBelajar,
  type TugasModel,
} from '../lib/pembelajaran.ts';

interface Props {
  kursus: Kursus;
  state: StateBelajar;
  onAction: (aksi: Aksi) => void;
}

const OPSI_QUIZ_BENAR = 'Terapkan konsep pada masalah nyata lalu uji hasilnya';
const OPSI_QUIZ_SALAH = 'Pilih tools sebanyak mungkin tanpa menguji hasil';
const FEEDBACK_SALAH =
  'Belum tepat. Pikirkan bagaimana konsep ini diterapkan dan diuji pada masalah nyata.';

const LABEL_RATING = [
  '★★★★☆ Membantu',
  '★★★☆☆ Cukup membantu',
  '★★☆☆☆ Kurang membantu',
  '★☆☆☆☆ Belum membantu',
];

/**
 * Ruang belajar (LMS) halaman detail kursus — port dari `#learning-workspace`
 * di detail-kursus.html: grid modul berurutan (kunci progresif), panel lesson
 * (tonton + checkpoint), lembar prototipe + model lab dummy, dan rating.
 * Konten muncul setelah peserta enroll; state lewat props dari halaman.
 */
export default function LearningWorkspace({ kursus, state, onAction }: Props) {
  const jumlah = kursus.modul.length;
  const progress = hitungProgressBelajar(state, jumlah);
  const [feedback, setFeedback] = useState('');

  // Feedback checkpoint di-reset saat ganti modul (situs lama: re-render DOM).
  useEffect(() => {
    setFeedback('');
  }, [state.activeModule]);

  const aktif = state.activeModule;
  const modulAktif = aktif !== null ? kursus.modul[aktif] : undefined;

  return (
    <section
      id="learning-workspace"
      aria-label="Ruang belajar"
      className="scroll-mt-20 bg-soft py-12"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            kicker="Ruang belajar"
            title="Bangun kemampuanmu bertahap."
            sub="Selesaikan modul, kerjakan latihan, lalu bawa ide menjadi prototipe."
            align="left"
          />
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">Progress kursus</span>
              <span className="font-display font-bold text-brand">{progress}%</span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-label="Progress kursus"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span
                className="block h-2 rounded-full bg-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {kursus.modul.map((m, i) => {
            const selesai = state.completed[i];
            const terkunci = modulTerkunci(i, state.completed);
            return (
              <li key={m.judul} className="rounded-2xl border border-line bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  Modul {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-2 font-display font-bold">{m.judul}</h3>
                <p className="mt-2 text-sm text-muted">{m.deskripsi}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className={`text-xs font-bold ${selesai ? 'text-brand' : 'text-muted'}`}>
                    {selesai ? 'Selesai' : terkunci ? 'Terkunci' : m.meta}
                  </span>
                  <button
                    type="button"
                    disabled={terkunci}
                    onClick={() => onAction({ type: 'pilihModul', index: i })}
                    className={`rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                      selesai
                        ? 'btn-primary text-white'
                        : terkunci
                          ? 'border border-line bg-white text-muted'
                          : 'border border-brand text-brand hover:bg-brand hover:text-white'
                    }`}
                  >
                    {selesai ? 'Ulangi' : terkunci ? 'Selesaikan modul sebelumnya' : 'Mulai modul'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {aktif !== null && modulAktif ? (
          <article className="mt-8 rounded-2xl border border-line bg-white p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  Lesson {aktif + 1} dari {jumlah}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold">{modulAktif.judul}</h3>

                {/* TODO_BACKEND: video lesson dari backend (module.video_url);
                    selama belum ada, blok ini hanya penanda durasi + tombol tonton. */}
                <div className="mt-4 rounded-xl bg-sky p-4">
                  <p className="font-bold">{modulAktif.judul}</p>
                  <p className="mt-1 text-sm text-muted">Durasi: {modulAktif.meta}</p>
                  <button
                    type="button"
                    onClick={() => onAction({ type: 'tontonLesson' })}
                    className="btn-primary mt-3 rounded-lg px-4 py-2 text-sm font-bold text-white"
                  >
                    {state.watched[aktif] ? 'Lesson sudah ditonton' : 'Mulai lesson'}
                  </button>
                </div>

                <div className="mt-4 rounded-xl border border-line p-4">
                  <p className="font-bold">Checkpoint: apa tujuan utama lesson ini?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback('');
                      onAction({ type: 'lulusQuiz' });
                    }}
                    className={`mt-3 block w-full rounded-lg border px-4 py-2 text-left text-sm ${
                      state.quizPassed[aktif]
                        ? 'border-brand bg-sky font-bold text-brand'
                        : 'border-line hover:border-brand'
                    }`}
                  >
                    {state.quizPassed[aktif]
                      ? '✓ Jawaban benar: terapkan konsep pada masalah nyata'
                      : OPSI_QUIZ_BENAR}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedback(FEEDBACK_SALAH)}
                    className="mt-2 block w-full rounded-lg border border-line px-4 py-2 text-left text-sm hover:border-brand"
                  >
                    {OPSI_QUIZ_SALAH}
                  </button>
                  <p className="mt-2 text-sm font-bold text-brand" aria-live="polite">
                    {feedback}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-muted">
                    {state.watched[aktif] ? 'Lesson selesai' : 'Belum ditonton'} ·{' '}
                    {state.quizPassed[aktif]
                      ? 'Checkpoint lulus'
                      : 'Checkpoint belum dikerjakan'}
                  </span>
                  <button
                    type="button"
                    disabled={!modulBisaSelesai(state, aktif)}
                    onClick={() => onAction({ type: 'toggleModulSelesai', index: aktif })}
                    className="btn-primary rounded-lg px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {state.completed[aktif] ? 'Tandai belum selesai' : 'Selesaikan modul'}
                  </button>
                </div>
              </div>

              <aside aria-label="Rangkaian kursus">
                <h4 className="text-sm font-bold">Rangkaian kursus</h4>
                <ul className="mt-3 space-y-2">
                  {kursus.modul.map((m, i) => {
                    const terkunci = modulTerkunci(i, state.completed);
                    const aktifIni = i === aktif;
                    return (
                      <li key={m.judul}>
                        <button
                          type="button"
                          disabled={terkunci}
                          onClick={() => onAction({ type: 'pilihModul', index: i })}
                          className={`block w-full rounded-lg px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60 ${
                            aktifIni
                              ? 'bg-brand font-bold text-white'
                              : 'border border-line hover:border-brand'
                          }`}
                        >
                          {state.completed[i] ? '✓ ' : terkunci ? '[TERKUNCI] ' : ''}
                          {i + 1}. {m.judul}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            </div>
          </article>
        ) : null}

        <div className="mt-8 rounded-2xl border border-line bg-white p-6">
          <PrototipePanel state={state} onAction={onAction} />
        </div>
      </div>
    </section>
  );
}

/** Panel tahap akhir: kunci → form prototipe (+ model lab) → ringkasan + rating. */
function PrototipePanel({ state, onAction }: { state: StateBelajar; onAction: (aksi: Aksi) => void }) {
  const semuaSelesai = state.completed.every(Boolean);
  const [tugasModel, setTugasModel] = useState<TugasModel>('summarize');
  const [inputModel, setInputModel] = useState('');
  const [outputModel, setOutputModel] = useState('Output model akan muncul di sini.');

  if (state.prototypeComplete) {
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Prototipe selesai</p>
        <h3 className="mt-2 font-display text-xl font-bold">Proyekmu sudah dicatat.</h3>
        <p className="mt-2 text-muted">
          Selamat, seluruh tahapan kursus ini sudah selesai. Kamu bisa kembali kapan saja untuk
          memperbaiki catatan prototipe.
        </p>
        <p className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white">
          Kursus selesai · Progress 100%
        </p>

        {state.ratingSubmitted ? (
          <div className="mt-4 rounded-xl bg-soft p-4">
            <strong>
              Rating kamu: {'★'.repeat(state.rating)}
              {'☆'.repeat(5 - state.rating)}
            </strong>
            <p className="mt-1 text-sm text-muted">
              {state.review || 'Terima kasih sudah memberi penilaian.'}
            </p>
          </div>
        ) : (
          <form
            className="mt-4 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              onAction({
                type: 'kirimRating',
                rating: Number(data.get('rating')),
                review: String(data.get('review') || ''),
              });
            }}
          >
            <h4 className="font-display font-bold">Beri rating kursus ini</h4>
            <p className="text-sm text-muted">Bagikan pengalamanmu setelah menyelesaikan seluruh materi.</p>
            <label className="grid gap-1 text-sm font-bold">
              Rating
              <select
                name="rating"
                required
                defaultValue=""
                className="rounded-lg border border-line bg-white px-3 py-2 font-normal"
              >
                <option value="" disabled>
                  Pilih rating
                </option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n === 5 ? '★★★★★ Sangat membantu' : LABEL_RATING[5 - n]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Ulasan
              <textarea
                name="review"
                rows={3}
                placeholder="Apa yang paling bermanfaat dari kursus ini?"
                className="rounded-lg border border-line px-3 py-2 font-normal"
              />
            </label>
            <button
              type="submit"
              className="btn-primary justify-self-start rounded-lg px-5 py-2.5 text-sm font-bold text-white"
            >
              Kirim rating
            </button>
          </form>
        )}
      </div>
    );
  }

  if (!semuaSelesai) {
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Tahap akhir</p>
        <h3 className="mt-2 font-display text-xl font-bold">Prototyping akhir</h3>
        <p className="mt-2 text-muted">
          Selesaikan semua modul terlebih dahulu untuk membuka lembar kerja prototipe.
        </p>
      </div>
    );
  }

  if (!state.prototype.started) {
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Tahap akhir</p>
        <h3 className="mt-2 font-display text-xl font-bold">Prototyping akhir</h3>
        <p className="mt-2 text-muted">
          Ubah masalah nyata menjadi solusi kecil yang bisa diuji. Isi lembar kerja dan simpan
          hasilnya sebagai proyek akhir.
        </p>
        <button
          type="button"
          onClick={() => onAction({ type: 'mulaiPrototipe' })}
          className="btn-primary mt-4 rounded-lg px-5 py-2.5 text-sm font-bold text-white"
        >
          Mulai prototyping
        </button>
      </div>
    );
  }

  const p = state.prototype;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Tahap akhir</p>
      <h3 className="mt-2 font-display text-xl font-bold">Bangun prototipemu</h3>
      <p className="mt-2 text-muted">
        Jelaskan ide secara singkat, pilih tools yang sesuai, lalu masukkan link demo atau file
        hasil kerja.
      </p>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          onAction({
            type: 'simpanPrototipe',
            data: {
              problem: String(data.get('problem') || ''),
              user: String(data.get('user') || ''),
              solution: String(data.get('solution') || ''),
              tools: String(data.get('tools') || ''),
              link: String(data.get('link') || ''),
            },
          });
        }}
      >
        <label className="grid gap-1 text-sm font-bold">
          Masalah yang ingin diselesaikan
          <input
            name="problem"
            required
            defaultValue={p.problem}
            placeholder="Contoh: mahasiswa kesulitan merangkum jurnal"
            className="rounded-lg border border-line px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Target pengguna
          <input
            name="user"
            required
            defaultValue={p.user}
            placeholder="Contoh: mahasiswa semester akhir"
            className="rounded-lg border border-line px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold sm:col-span-2">
          Solusi prototipe
          <textarea
            name="solution"
            required
            rows={3}
            defaultValue={p.solution}
            placeholder="Apa yang prototipemu lakukan?"
            className="rounded-lg border border-line px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Tools yang digunakan
          <input
            name="tools"
            required
            defaultValue={p.tools}
            placeholder="Contoh: ChatGPT, Figma, Google AI Studio"
            className="rounded-lg border border-line px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Link demo atau file hasil
          <input
            name="link"
            type="url"
            defaultValue={p.link}
            placeholder="https://"
            className="rounded-lg border border-line px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          className="btn-primary justify-self-start rounded-lg px-5 py-2.5 text-sm font-bold text-white sm:col-span-2"
        >
          Simpan prototipe & selesaikan kursus
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-soft p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
          Model lab · dummy inference
        </p>
        <h4 className="mt-1 font-display font-bold">Coba kerangka modelmu</h4>
        <p className="mt-1 text-sm text-muted">
          Masukkan data, pilih tugas model, lalu jalankan simulasi inference di browser.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">
            Tugas model
            <select
              value={tugasModel}
              onChange={(e) => setTugasModel(e.target.value as TugasModel)}
              className="rounded-lg border border-line bg-white px-3 py-2 font-normal"
            >
              <option value="summarize">Ringkas teks</option>
              <option value="classify">Klasifikasi masalah</option>
              <option value="ideate">Buat ide solusi</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Input model
            <textarea
              rows={3}
              value={inputModel}
              onChange={(e) => setInputModel(e.target.value)}
              placeholder="Contoh: Mahasiswa membutuhkan cara cepat memahami jurnal ilmiah."
              className="rounded-lg border border-line px-3 py-2 font-normal"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => setOutputModel(jalankanModelDummy(tugasModel, inputModel))}
          className="btn-primary mt-3 rounded-lg px-5 py-2.5 text-sm font-bold text-white"
        >
          Jalankan model
        </button>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-white p-4 text-sm">
          {outputModel}
        </pre>
      </div>
    </div>
  );
}
