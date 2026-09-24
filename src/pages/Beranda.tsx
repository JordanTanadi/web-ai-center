import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import SectionHeading from '../components/SectionHeading.tsx';
import HeroCarousel from '../components/HeroCarousel.tsx';
import NewsCard from '../components/NewsCard.tsx';
import DokumentasiCard from '../components/DokumentasiCard.tsx';
import TestimoniSlider from '../components/TestimoniSlider.tsx';
import { heroSlidesDummy } from '../data/hero.ts';
import { layananDummy } from '../data/layanan.ts';
import { prefersReducedMotion } from '../lib/prefersReducedMotion.ts';
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
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <SectionHeading kicker={kicker} title={title} sub={sub} align="left" tone={dark ? 'dark' : 'light'} />
      <Link
        to={actionTo}
        className={`shrink-0 rounded-lg px-5 py-2.5 font-display text-sm font-bold ${
          dark
            ? 'border border-white text-white hover:bg-white hover:text-brand'
            : 'bg-brand text-white hover:bg-brand-dark'
        }`}
      >
        {actionLabel}
      </Link>
    </div>
  );
}

// Struktur section mengikuti beranda/index.html (hero carousel → layanan →
// dokumentasi → testimoni → berita), konten di-rewrite
// untuk AI Center Ubaya. File lama tetap ada sebagai referensi di ./beranda/index.html.
export default function Beranda() {
  const location = useLocation();

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

      <section id="layanan" className="scroll-mt-20 bg-soft py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading kicker="Layanan" title="Pilih Jalur Kolaborasimu" sub="Pelatihan dan inference solution untuk kebutuhan nyata." />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {layananDummy.map((c) => (
              <article key={c.slug} className="flex flex-col rounded-2xl border border-line bg-white p-6 text-center">
                <h3 className="font-display font-bold">{c.nama}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{c.tagline}</p>
                <Link
                  to={`/layanan/${c.slug}`}
                  className="mx-auto mt-4 inline-block rounded-lg border border-brand px-5 py-2 text-sm font-bold text-brand hover:bg-brand hover:text-white"
                >
                  Detail Layanan →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* aria-label langsung pada <section> (jadi region bernama); tanpa wrapper div. */}
      <section aria-label="Dokumentasi Kegiatan" className="bg-brand py-16 text-white">
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

      <section aria-label="Testimoni" className="bg-soft py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <SectionHeading kicker="Testimoni" title="Apa Kata Mereka?" sub="Cerita peserta dan mitra AI Center." />
          {/* TODO_BACKEND: testimoni dari GET /api/testimoni */}
          <TestimoniSlider items={testimoniDummy} dark={false} />
        </div>
      </section>

      <section aria-label="Berita Terkini" className="py-16">
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
