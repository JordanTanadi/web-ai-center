import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import SectionHeading from '../components/SectionHeading.tsx';
import HeroCarousel from '../components/HeroCarousel.tsx';
import NewsCard from '../components/NewsCard.tsx';
import DokumentasiCard from '../components/DokumentasiCard.tsx';
import TestimoniSlider from '../components/TestimoniSlider.tsx';
import { heroSlidesDummy } from '../data/hero.ts';
import { layananDummy } from '../data/layanan.ts';
import { portofolioDummy } from '../data/portofolio.ts';
import { fasilitasDummy } from '../data/fasilitas.ts';
import { prefersReducedMotion } from '../lib/prefersReducedMotion.ts';
import { useT } from '../lib/i18n.tsx';
import { beritaDummy } from '../data/berita.ts';
import { dokumentasiDummy } from '../data/dokumentasi.ts';
import { testimoniDummy } from '../data/testimoni.ts';

function SectionBar({
  kicker,
  title,
  sub,
  actionTo,
  actionLabel,
  dark = false,
}: {
  kicker: string;
  title: string;
  sub?: string;
  actionTo: string;
  actionLabel: string;
  dark?: boolean;
}) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <SectionHeading
        kicker={t(kicker)}
        title={t(title)}
        sub={sub ? t(sub) : undefined}
        align="left"
        tone={dark ? 'dark' : 'light'}
      />
      <Link
        to={actionTo}
        className={`shrink-0 rounded-lg px-5 py-2.5 font-display text-sm font-bold ${
          dark
            ? 'border border-white text-white hover:bg-white hover:text-brand'
            : 'btn-primary text-white'
        }`}
      >
        {t(actionLabel)}
      </Link>
    </div>
  );
}

// Struktur section mengikuti beranda/index.html (hero carousel → layanan →
// portofolio → fasilitas → dokumentasi → testimoni → berita), konten di-rewrite
// untuk AI Center Ubaya. File lama tetap ada sebagai referensi di ./beranda/index.html.
export default function Beranda() {
  const location = useLocation();
  const t = useT();

  // Klik "Layanan" di navbar/footer (/beranda#layanan) scroll ke section layanan.
  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }, [location]);

  return (
    <div>
      {/* TODO_BACKEND: slide hero dari GET /api/hero-slides */}
      <HeroCarousel slides={heroSlidesDummy} />

      <section id="layanan" className="scroll-mt-20 bg-sky py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading kicker={t('Layanan')} title={t('Pilih Jalur Kolaborasimu')} sub={t('Pelatihan dan inference solution untuk kebutuhan nyata.')} />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {layananDummy.map((c) => (
              <article key={c.slug} className="flex flex-col rounded-2xl border border-line bg-white p-6 text-center">
                <h3 className="font-display font-bold">{t(c.nama)}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{t(c.tagline)}</p>
                <Link
                  to={`/layanan/${c.slug}`}
                  className="mx-auto mt-4 inline-block rounded-lg border border-brand px-5 py-2 text-sm font-bold text-brand hover:bg-brand hover:text-white"
                >
                  {t('Detail Layanan →')}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Portofolio: 6 karya dari index.html situs lama (#portofolio). */}
      <section id="portofolio" aria-label={t('Portofolio')} className="scroll-mt-20 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            kicker={t('Karya Kami')}
            title={t('Portofolio produk AI')}
            sub={t('Sebagian solusi AI yang telah dikembangkan Ubaya AI Center untuk berbagai bidang.')}
          />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {portofolioDummy.map((k) => (
              <li key={k.slug} className="overflow-hidden rounded-2xl border border-line bg-white">
                <img
                  src={k.gambar}
                  alt={k.alt}
                  width={k.lebar}
                  height={k.tinggi}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand">
                    {t(`${k.kategori} · ${k.teknologi}`)}
                  </p>
                  <h3 className="mt-2 font-display font-bold">{t(k.judul)}</h3>
                  <p className="mt-2 text-sm text-muted">{t(k.deskripsi)}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-muted">
            {t('Ingin membangun solusi AI seperti ini untuk organisasi Anda?')}{' '}
            <Link to="/tentang-kami" className="font-bold text-brand hover:underline">
              {t('Hubungi kami →')}
            </Link>
          </p>
        </div>
      </section>

      {/* Fasilitas: 3 ruang dari index.html situs lama (#fasilitas). */}
      <section aria-label={t('Fasilitas')} className="bg-soft py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            kicker={t('Lihat Ruangnya')}
            title={t('Fasilitas yang dirancang untuk berkarya')}
            sub={t('Ruang demo, ruang pelatihan, dan ruang diskusi — dilengkapi untuk presentasi, kelas, dan kerja tim.')}
          />
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {fasilitasDummy.map((r) => (
              <li key={r.slug} className="overflow-hidden rounded-2xl border border-line bg-white">
                <img
                  src={r.gambar}
                  alt={r.alt}
                  width={r.lebar}
                  height={r.tinggi}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand">{t(r.label)}</p>
                  <h3 className="mt-1 font-display font-bold">{t(r.judul)}</h3>
                  <p className="mt-2 text-sm text-muted">{t(r.deskripsi)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* aria-label langsung pada <section> (jadi region bernama); tanpa wrapper div. */}
      <section aria-label={t('Dokumentasi Kegiatan')} className="bg-brand py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          {/* 3 card penampung highlight; TODO_BACKEND: backend yang menentukan limit/isi 3 highlight */}
          <SectionBar
            kicker="Kegiatan"
            title="Dokumentasi Kegiatan"
            sub="Sorotan kegiatan terbaru AI Center."
            actionTo="/dokumentasi"
            actionLabel="Lihat Semua →"
            dark
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {dokumentasiDummy.slice(0, 3).map((d) => (
              <DokumentasiCard key={d.slug} item={d} showLink={false} />
            ))}
          </div>
        </div>
      </section>

      {/* Our Client sementara dikomentari; komponen dan data dipertahankan untuk diaktifkan kembali. */}
      {/*
      <section aria-label="Our Client" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading kicker="Dipercaya" title="Our Client" sub="Mitra yang berkolaborasi dengan AI Center." />
          // TODO_BACKEND: daftar klien dari GET /api/klien
          <ClientCarousel items={klienDummy} perPage={3} />
        </div>
      </section>
      */}

      <section aria-label={t('Testimoni')} className="bg-soft py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <SectionHeading kicker={t('Testimoni')} title={t('Apa Kata Mereka?')} sub={t('Cerita peserta dan mitra AI Center.')} />
          {/* TODO_BACKEND: testimoni dari GET /api/testimoni */}
          <TestimoniSlider items={testimoniDummy} dark={false} />
        </div>
      </section>

      <section aria-label={t('Berita Terkini')} className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          {/* 3 card penampung highlight; TODO_BACKEND: backend yang menentukan limit/isi 3 highlight */}
          <SectionBar
            kicker="Berita"
            title="Berita Terkini"
            sub="Kabar terbaru AI Center."
            actionTo="/berita"
            actionLabel="Lihat Semua →"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {beritaDummy.slice(0, 3).map((b) => (
              <NewsCard key={b.slug} item={b} showLink={false} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
