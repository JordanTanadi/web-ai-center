import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading.tsx';
import HeroCarousel from '../components/HeroCarousel.tsx';
import NewsCard from '../components/NewsCard.tsx';
import DokumentasiCard from '../components/DokumentasiCard.tsx';
import ClientCarousel from '../components/ClientCarousel.tsx';
import TestimoniSlider from '../components/TestimoniSlider.tsx';
import { heroSlidesDummy } from '../data/hero.ts';
import { beritaDummy } from '../data/berita.ts';
import { dokumentasiDummy } from '../data/dokumentasi.ts';
import { klienDummy } from '../data/klien.ts';
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
// dokumentasi → our client carousel → testimoni → berita), konten di-rewrite
// untuk AI Center Ubaya. File lama tetap ada sebagai referensi di ./beranda/index.html.
export default function Beranda() {
  return (
    <div>
      {/* TODO_BACKEND: slide hero dari GET /api/hero-slides */}
      <HeroCarousel slides={heroSlidesDummy} />

      <section id="layanan" className="scroll-mt-20 bg-soft py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading kicker="Layanan" title="Pilih Jalur Kolaborasimu" sub="Pelatihan, GPU rental, dan inference solution." />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { t: 'Pelatihan', d: 'Pelatihan AI/ML untuk mahasiswa, dosen, dan umum.' },
              { t: 'GPU Rental', d: 'Sewa akses GPU lab untuk riset dan tugas akhir.' },
              { t: 'Inference Solution', d: 'Solusi deployment model untuk kebutuhan industri.' },
            ].map((c) => (
              <article key={c.t} className="rounded-2xl border border-line bg-white p-6 text-center">
                <h3 className="font-display font-bold">{c.t}</h3>
                <p className="mt-2 text-sm text-muted">{c.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="dok-heading" className="bg-brand py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          {/* 3 card penampung highlight; TODO_BACKEND: backend yang menentukan limit/isi 3 highlight */}
          <div id="dok-heading">
            <SectionBar
              kicker="Kegiatan"
              title="Dokumentasi Kegiatan"
              sub="Sorotan kegiatan terbaru AI Center."
              actionTo="/dokumentasi"
              actionLabel="Lihat Semua →"
              dark
            />
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {dokumentasiDummy.slice(0, 3).map((d) => (
              <DokumentasiCard key={d.slug} item={d} showLink={false} />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="klien-heading" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div id="klien-heading">
            <SectionHeading kicker="Dipercaya" title="Our Client" sub="Mitra yang berkolaborasi dengan AI Center (data dummy)." />
          </div>
          {/* TODO_BACKEND: daftar klien dari GET /api/klien */}
          <ClientCarousel items={klienDummy} perPage={3} />
        </div>
      </section>

      <section aria-labelledby="testi-heading" className="bg-brand py-16 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div id="testi-heading">
            <SectionHeading kicker="Testimoni" title="Apa Kata Mereka?" sub="Cerita peserta dan mitra AI Center." tone="dark" />
          </div>
          {/* TODO_BACKEND: testimoni dari GET /api/testimoni */}
          <TestimoniSlider items={testimoniDummy} />
        </div>
      </section>

      <section aria-labelledby="berita-heading" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          {/* 3 card penampung highlight; TODO_BACKEND: backend yang menentukan limit/isi 3 highlight */}
          <div id="berita-heading">
            <SectionBar
              kicker="Berita"
              title="Berita Terkini"
              sub="Kabar terbaru AI Center."
              actionTo="/berita"
              actionLabel="Lihat Semua →"
            />
          </div>
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
