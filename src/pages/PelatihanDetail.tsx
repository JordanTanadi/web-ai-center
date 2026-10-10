import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LearningWorkspace from '../components/LearningWorkspace.tsx';
import { useT } from '../lib/i18n.tsx';
import {
  aksesKursus,
  audienceLabel,
  infoKursus,
  kursusDariKode,
  waTanyaProgram,
  type Kursus,
} from '../data/pelatihan.ts';
import { useApiObjek } from '../lib/useApiData.ts';
import { labelDurasiTotal } from '../lib/kursus.ts';
import {
  bacaStateBelajar,
  hitungProgressBelajar,
  kurangiStateBelajar,
  labelAksesKursus,
  simpanStateBelajar,
  stateAwalBelajar,
  type Aksi,
  type StateBelajar,
} from '../lib/pembelajaran.ts';

/**
 * Halaman detail kursus — struktur mengikuti detail-kursus.html situs lama:
 * hero (kode + audiens + judul + fakta + kartu akses), Tentang kursus,
 * Materi yang akan dipelajari, Instruktur, sidebar Informasi kursus,
 * lalu Ruang belajar (LMS) setelah peserta enroll.
 */
export default function PelatihanDetail() {
  const { kode = '' } = useParams();
  const t = useT();
  // Detail dari GET /api/kursus/:kode; kode kosong → path 404 (lihat BeritaDetail).
  const kursus = useApiObjek<Kursus>(
    `/kursus/${encodeURIComponent(kode || 'tidak-ada')}`,
    kursusDariKode(kode),
  );

  // State belajar per kursus (localStorage, persis situs lama);
  // TODO_BACKEND: progress per user tersimpan di backend + akun peserta.
  const [belajar, setBelajar] = useState<StateBelajar>(() =>
    kursus ? bacaStateBelajar(kursus.kode, kursus.modul.length) : stateAwalBelajar(0),
  );
  useEffect(() => {
    if (kursus) setBelajar(bacaStateBelajar(kursus.kode, kursus.modul.length));
  }, [kursus]);

  if (!kursus) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14 text-center">
        <h1 className="font-display text-2xl font-bold">{t('Kursus tidak ditemukan')}</h1>
        <p className="mt-2 text-muted">{t('Kode kursus tidak tersedia. Silakan pilih program lain dari katalog.')}</p>
        <Link
          to="/layanan/pelatihan"
          className="mt-4 inline-block text-sm font-bold text-brand hover:underline"
        >
          {t('← Kembali ke katalog kursus')}
        </Link>
      </div>
    );
  }

  const totalModul = kursus.modul.length;
  const progress = hitungProgressBelajar(belajar, totalModul);
  const label = labelAksesKursus(belajar, progress);
  // Estimasi durasi total ("±2 jam 40 menit") dari meta modul — pola Coursera.
  const estimasiBelajar = labelDurasiTotal(kursus.modul);

  /** Terapkan aksi LMS + simpan ke localStorage dalam satu update. */
  const kirimAksi = (aksi: Aksi) => {
    setBelajar((sebelum) => {
      const berikut = kurangiStateBelajar(sebelum, aksi, totalModul);
      simpanStateBelajar(kursus.kode, berikut);
      return berikut;
    });
  };

  /** Tombol "Mulai belajar": enroll lalu scroll ke ruang belajar. */
  const mulaiBelajar = () => {
    kirimAksi({ type: 'enroll' });
    requestAnimationFrame(() => {
      document
        .getElementById('learning-workspace')
        ?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <article>
      {/* Hero rata kiri (aturan layout: hero → kiri) dengan kartu akses di kanan. */}
      <section className="bg-sky">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
          <div>
            <Link to="/layanan/pelatihan" className="text-sm font-bold text-brand hover:underline">
              {t('← Kembali ke katalog kursus')}
            </Link>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-brand">
              {kursus.kode} · {audienceLabel(kursus).split(' · ').map(t).join(' · ')}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{t(kursus.judul)}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">{t(kursus.deskripsi)}</p>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <li>
                <p className="font-bold">{t(kursus.level)}</p>
                <p className="text-xs uppercase tracking-wide text-muted">{t('Level')}</p>
              </li>
              <li>
                <p className="font-bold">{t(kursus.durasi)}</p>
                <p className="text-xs uppercase tracking-wide text-muted">{t('Durasi')}</p>
              </li>
              <li>
                <p className="font-bold">{t(kursus.format)}</p>
                <p className="text-xs uppercase tracking-wide text-muted">{t('Format belajar')}</p>
              </li>
              {/* Estimasi total ala Coursera — dihitung dari meta modul; disembunyikan
                  bila tidak ada satupun modul yang mencantumkan menit. */}
              {estimasiBelajar === null ? null : (
                <li>
                  <p className="font-bold">{t(estimasiBelajar)}</p>
                  <p className="text-xs uppercase tracking-wide text-muted">{t('Estimasi belajar')}</p>
                </li>
              )}
            </ul>
          </div>
          {/* Progress/status belajar dari state LMS (localStorage); TODO_BACKEND:
              progress per user + rating dari backend ketika akun peserta ada. */}
          <aside className="h-fit rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{t(aksesKursus.label)}</p>
            <h2 className="mt-2 font-display text-xl font-bold">{t(label.judul)}</h2>
            {belajar.ratingSubmitted ? (
              <p className="mt-2 text-sm" aria-label={t(`Rating kursus ${belajar.rating} dari 5`)}>
                <span className="font-bold text-brand">
                  {'★'.repeat(belajar.rating)}
                  {'☆'.repeat(5 - belajar.rating)}
                </span>
                <span className="ml-2 text-muted">{belajar.rating}.0 · {t('1 ulasan')}</span>
              </p>
            ) : null}
            {belajar.enrolled ? null : (
              <p className="mt-3 text-sm text-muted">{t(aksesKursus.catatan)}</p>
            )}
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-label={t('Progress kursus')}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span
                className="block h-2 rounded-full bg-brand transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-bold">{t(label.status)}</span>
              <span className="text-muted">{t(label.jumlah)}</span>
            </div>
            <button
              type="button"
              onClick={mulaiBelajar}
              className="btn-primary mt-4 block w-full rounded-lg px-4 py-3 text-center text-sm font-bold text-white"
            >
              {t('Mulai belajar')}
            </button>
            <a
              href={waTanyaProgram(kursus.kode, kursus.judul)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-center text-sm font-bold text-brand hover:underline"
            >
              {t(aksesKursus.cta)}
            </a>
          </aside>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          <section aria-labelledby="tentang-heading">
            <h2 id="tentang-heading" className="font-display text-xl font-bold">
              {t('Tentang kursus ini')}
            </h2>
            <p className="mt-3 text-muted">{t(kursus.tentang)}</p>
            <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {kursus.hasil.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm">
                  <span aria-hidden="true" className="font-bold text-brand">
                    ✓
                  </span>
                  <span>{t(h)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="materi-heading" className="mt-10">
            <h2 id="materi-heading" className="font-display text-xl font-bold">
              {t('Materi yang akan dipelajari')}
            </h2>
            <ol className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {kursus.modul.map((m, idx) => (
                <li key={m.judul} className="flex gap-4 p-5">
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky text-xs font-bold text-brand"
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display font-bold">{t(m.judul)}</h3>
                    <p className="mt-1 text-sm text-muted">{t(m.deskripsi)}</p>
                    <p className="mt-1 text-xs text-muted">
                      {t(m.meta)} · {t('Video, latihan, dan kuis')}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="instruktur-heading" className="mt-10 border-t border-line pt-8">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand/10 font-display font-bold text-brand"
              >
                {kursus.inisial}
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">{t('Instruktur')}</p>
                <h3 id="instruktur-heading" className="font-display font-bold">
                  {t(kursus.instruktur)}
                </h3>
                <p className="text-sm text-muted">{t(kursus.peran)}</p>
              </div>
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="info-heading"
          className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24"
        >
          <h3 id="info-heading" className="font-display text-lg font-bold">
            {t('Informasi kursus')}
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {infoKursus.map((i) => (
              <li
                key={i.label}
                className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0"
              >
                <span className="text-muted">{t(i.label)}</span>
                <span className="font-bold">{t(i.nilai)}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Ruang belajar (LMS) — muncul setelah enroll, mengikuti detail-kursus.html. */}
      {belajar.enrolled ? (
        <LearningWorkspace kursus={kursus} state={belajar} onAction={kirimAksi} />
      ) : null}

      <div className="mx-auto max-w-6xl px-6 pb-14 text-center">
        <Link to="/layanan/pelatihan" className="text-sm font-bold text-brand hover:underline">
          {t('← Kembali ke katalog kursus')}
        </Link>
      </div>
    </article>
  );
}
