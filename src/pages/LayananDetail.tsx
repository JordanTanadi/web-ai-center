import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLayananBySlug, type Layanan } from '../data/layanan.ts';
import { useT } from '../lib/i18n.tsx';
import { useApiDaftar, useApiObjek } from '../lib/useApiData.ts';
import {
  alurInference,
  apaItuInference,
  contohInference,
  contohInferenceIntro,
  kebutuhanInference,
  waDiskusiInference,
} from '../data/inference.ts';
import {
  aksiHeroPelatihan,
  institusiPelatihan,
  katalogIntro,
  kategoriKursus,
  kursusCocokFilter,
  kursusDummy,
  modulUnggulan,
  panelCaraBelajar,
  statsPelatihan,
  waPelatihanInstitusi,
  waTanyaProgram,
} from '../data/pelatihan.ts';

/** Katalog kursus + filter kategori (khusus layanan pelatihan). */
function KatalogKursus() {
  const [filter, setFilter] = useState('all');
  const t = useT();
  // Katalog dari GET /api/kursus; filter kategori tetap client-side.
  const daftarKursus = useApiDaftar('/kursus', kursusDummy);
  const terlihat = daftarKursus.filter((k) => kursusCocokFilter(k, filter));

  return (
    <section id="katalog" aria-labelledby="katalog-heading" className="mt-12">
      <div className="text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-brand">
          {t(katalogIntro.eyebrow)}
        </p>
        <h2 id="katalog-heading" className="mt-2 font-display text-xl font-bold">
          {t(katalogIntro.judul)}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-muted">{t(katalogIntro.sub)}</p>
      </div>

      <div
        role="group"
        aria-label={t('Filter kategori kursus')}
        className="mt-5 flex flex-wrap justify-center gap-2"
      >
        {kategoriKursus.map((kat) => (
          <button
            key={kat.nilai}
            type="button"
            aria-pressed={filter === kat.nilai}
            onClick={() => setFilter(kat.nilai)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === kat.nilai
                ? 'bg-brand text-white'
                : 'border border-line bg-white text-ink transition-colors hover:border-brand hover:bg-soft hover:text-brand'
            }`}
          >
            {t(kat.label)}
          </button>
        ))}
      </div>

      {terlihat.length === 0 ? (
        <p className="mt-6 text-center text-muted">{t(katalogIntro.kosong)}</p>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {terlihat.map((k) => (
            <li key={k.kode} className="flex flex-col rounded-2xl border border-line bg-white p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-soft px-2 py-0.5 font-body text-xs font-bold text-brand">
                  {k.kode}
                </span>
                <span className="text-xs text-muted">{k.target.map(t).join(' · ')}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold">
                <Link to={`/layanan/pelatihan/${k.kode}`} className="hover:text-brand">
                  {t(k.judul)}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-muted">{t(k.deskripsi)}</p>
              <p className="mt-3 text-xs text-muted">
                Ubaya AI Center · {t(k.durasi)} · {t(`${k.modul.length} modul`)} · {t('Sertifikat')}
              </p>
              <p className="mt-1 text-xs text-muted">
                {t('Instruktur:')} {t(k.instruktur)} — {t(k.peran)}
              </p>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-medium text-brand">{t('Lihat rincian modul')}</summary>
                <ul className="mt-2 space-y-2">
                  {k.modul.map((m, idx) => (
                    <li key={m.judul}>
                      <p className="font-medium">
                        {idx + 1}. {t(m.judul)}
                      </p>
                      <p className="text-xs text-muted">
                        {t(m.deskripsi)} ({t(m.meta)})
                      </p>
                    </li>
                  ))}
                </ul>
              </details>
              <Link
                to={`/layanan/pelatihan/${k.kode}`}
                className="btn-primary mt-4 block rounded-lg px-4 py-2 text-center text-sm font-bold text-white"
              >
                {t('Lihat detail kursus')}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Blok Modul unggulan R01 (khusus layanan pelatihan). */
function ModulUnggulan() {
  const t = useT();
  return (
    <section aria-labelledby="modul-unggulan-heading" className="mt-12 rounded-2xl border border-line bg-white p-6 text-center md:p-8">
      <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-brand">
        {t(modulUnggulan.eyebrow)}
      </p>
      <h2 id="modul-unggulan-heading" className="mt-2 font-display text-xl font-bold">
        {t(modulUnggulan.judul)}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-muted">{t(modulUnggulan.deskripsi)}</p>
      <ul className="mx-auto mt-4 max-w-md space-y-2 text-left">
        {modulUnggulan.topik.map((topik) => (
          <li key={topik} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 text-brand">
              ✦
            </span>
            <span>{t(topik)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm font-medium">{t(modulUnggulan.catatan)}</p>
      <p className="mx-auto mt-1 max-w-2xl text-xs text-muted">{t(modulUnggulan.catatanDetail)}</p>
      <a
        href={waTanyaProgram('R01', modulUnggulan.judul)}
        target="_blank"
        rel="noreferrer"
        className="btn-primary mt-4 inline-block rounded-lg px-6 py-3 font-display text-sm font-bold text-white"
      >
        {t('Tanyakan program ini')}
      </a>
    </section>
  );
}

/** Panel penjelasan "Apa itu Inference Solution?" (khusus layanan inference). */
function ApaItuInference() {
  const t = useT();
  return (
    <section
      aria-labelledby="apa-itu-inference-heading"
      className="mt-8 rounded-2xl border border-line bg-soft p-6 text-center md:p-8"
    >
      <h2 id="apa-itu-inference-heading" className="font-display text-xl font-bold">
        {t(apaItuInference.judul)}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-muted">{t(apaItuInference.deskripsi)}</p>
      <p className="mt-5 font-body text-xs font-bold uppercase tracking-[0.16em] text-brand">
        {t('Kapan Anda membutuhkannya?')}
      </p>
      <ul className="mx-auto mt-3 max-w-2xl space-y-2 text-left">
        {kebutuhanInference.map((k) => (
          <li key={k} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 text-brand">
              ✦
            </span>
            <span>{t(k)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Alur kerja layanan inference — 5 langkah (khusus layanan inference). */
function AlurKerjaInference() {
  const t = useT();
  return (
    <section aria-labelledby="alur-kerja-heading" className="mt-12 text-center">
      <h2 id="alur-kerja-heading" className="font-display text-xl font-bold">
        {t('Bagaimana cara kerjanya?')}
      </h2>
      <ol className="mt-5 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {alurInference.map((l) => (
          <li key={l.nomor} className="rounded-2xl border border-line bg-white p-5">
            <p className="font-display text-lg font-bold text-brand">{l.nomor}</p>
            <h3 className="mt-1 font-display font-bold">{t(l.judul)}</h3>
            <p className="mt-1 text-sm text-muted">{t(l.deskripsi)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Contoh penerapan dari portofolio + CTA (khusus layanan inference). */
function ContohPenerapanInference() {
  const t = useT();
  return (
    <section
      aria-labelledby="contoh-penerapan-heading"
      className="mt-12 rounded-2xl border border-line bg-white p-6 text-center md:p-8"
    >
      <h2 id="contoh-penerapan-heading" className="font-display text-xl font-bold">
        {t('Contoh penerapan')}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-muted">{t(contohInferenceIntro)}</p>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {contohInference.map((c) => (
          <li
            key={c.slug}
            className="rounded-full border border-line bg-soft px-3 py-1 text-sm font-medium"
          >
            {t(c.judul)}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link
          to="/dokumentasi"
          className="rounded-lg border border-brand px-6 py-3 font-display text-sm font-bold text-brand hover:bg-brand hover:text-white"
        >
          {t('Lihat portofolio lengkap')}
        </Link>
        <a
          href={waDiskusiInference()}
          target="_blank"
          rel="noreferrer"
          className="btn-primary rounded-lg px-6 py-3 font-display text-sm font-bold text-white"
        >
          {t('Diskusikan kebutuhan Anda')}
        </a>
      </div>
    </section>
  );
}

/** Blok penutup "Untuk institusi" (khusus layanan pelatihan). */
function UntukInstitusi() {
  const t = useT();
  return (
    <section id="layanan-kustom" aria-labelledby="institusi-heading" className="mt-12 rounded-2xl bg-soft p-6 text-center md:p-8">
      <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-brand">
        {t(institusiPelatihan.kicker)}
      </p>
      <h2 id="institusi-heading" className="mt-2 font-display text-xl font-bold">
        {t(institusiPelatihan.judul)}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-muted">{t(institusiPelatihan.deskripsi)}</p>
      <a
        href={waPelatihanInstitusi()}
        target="_blank"
        rel="noreferrer"
        className="btn-primary mt-4 inline-block rounded-lg px-6 py-3 font-display text-sm font-bold text-white"
      >
        {t(institusiPelatihan.cta)}
      </a>
    </section>
  );
}

export default function LayananDetail() {
  const t = useT();
  const { slug = '' } = useParams();
  // Detail dari GET /api/layanan/:slug; slug kosong → path 404 (lihat BeritaDetail).
  const item = useApiObjek<Layanan>(
    `/layanan/${encodeURIComponent(slug || 'tidak-ada')}`,
    getLayananBySlug(slug),
  );

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14 text-center">
        <h1 className="font-display text-2xl font-bold">{t('Layanan tidak ditemukan')}</h1>
        <Link to="/beranda#layanan" className="mt-4 inline-block text-sm font-bold text-brand hover:underline">
          {t('← Kembali ke daftar layanan')}
        </Link>
      </div>
    );
  }

  const isPelatihan = item.slug === 'pelatihan';
  const isInference = item.slug === 'inference-solution';

  return (
    // Pelatihan memakai container lebar agar katalog kursus muat 2 kolom;
    // layanan lain tetap sempit seperti sebelumnya.
    <div className={`mx-auto px-6 py-14 ${isPelatihan ? 'max-w-6xl' : 'max-w-3xl'}`}>
      {isPelatihan ? (
        <>
          <section aria-labelledby="pelatihan-heading" className="rounded-xl bg-navy text-white">
            <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:items-center md:p-10">
              <header>
                <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-yellow">
                  {t('Program Pembelajaran AI')}
                </p>
                <h1 id="pelatihan-heading" className="mt-3 font-display text-3xl font-bold md:text-4xl">
                  {t(item.nama)}
                </h1>
                <p className="mt-3 text-lg text-white/85">{t(item.tagline)}</p>
                <p className="mt-4 max-w-2xl text-white/75">{t(item.deskripsi)}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {aksiHeroPelatihan.map((aksi, index) => (
                    <a
                      key={aksi.href}
                      href={aksi.href}
                      className={
                        index === 0
                          ? 'btn-accent rounded-lg px-5 py-3 font-display text-sm font-bold'
                          : 'rounded-lg border border-white/70 px-5 py-3 font-display text-sm font-bold text-white hover:bg-white hover:text-navy'
                      }
                    >
                      {t(aksi.label)}
                    </a>
                  ))}
                </div>
              </header>
              <aside className="rounded-lg bg-white p-6 text-ink md:p-7">
                <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  {t(panelCaraBelajar.kicker)}
                </p>
                <h2 className="mt-2 font-display text-xl font-bold">{t(panelCaraBelajar.judul)}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{t(panelCaraBelajar.deskripsi)}</p>
              </aside>
            </div>
          </section>
          <ul aria-label={t('Ringkasan program')} className="mt-6 grid gap-4 sm:grid-cols-3">
            {statsPelatihan.map((stat) => (
              <li key={stat.label} className="border-l-2 border-brand py-1 pl-4">
                <p className="font-display font-bold text-brand">{t(stat.nilai)}</p>
                <p className="mt-1 text-sm text-muted">{t(stat.label)}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <header className="text-center">
            <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-brand">{t('Layanan')}</p>
            <h1 className="mt-2 font-display text-3xl font-bold">{t(item.nama)}</h1>
            <p className="mt-2 font-medium text-muted">{t(item.tagline)}</p>
          </header>
          <p className="mx-auto mt-6 max-w-2xl text-center">{t(item.deskripsi)}</p>
        </>
      )}

      {/* Penjelasan inference: apa itu + tanda kebutuhan, mengikuti ritme center halaman. */}
      {isInference && <ApaItuInference />}

      <h2 className="mt-8 text-center font-display text-xl font-bold">{t('Yang Anda dapatkan')}</h2>
      <ul className="mx-auto mt-4 max-w-md space-y-3">
        {item.fitur.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
              className="mt-1 shrink-0 text-brand"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{t(f)}</span>
          </li>
        ))}
      </ul>

      {isInference && (
        <>
          <AlurKerjaInference />
          <ContohPenerapanInference />
        </>
      )}

      {isPelatihan && (
        <>
          <KatalogKursus />
          <ModulUnggulan />
          <UntukInstitusi />
        </>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/beranda#kontak"
          className="btn-primary rounded-lg px-6 py-3 font-display text-sm font-bold text-white"
        >
          {t('Hubungi Kami')}
        </Link>
        <Link
          to="/beranda#layanan"
          className="rounded-lg border border-brand px-6 py-3 font-display text-sm font-bold text-brand hover:bg-brand hover:text-white"
        >
          {t('← Semua Layanan')}
        </Link>
      </div>
    </div>
  );
}
