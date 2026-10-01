import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading.tsx';
import HeroCarousel from '../components/HeroCarousel.tsx';
import ClientCarousel from '../components/ClientCarousel.tsx';
import NewsCard from '../components/NewsCard.tsx';
import DokumentasiCard from '../components/DokumentasiCard.tsx';
import TestimoniSlider from '../components/TestimoniSlider.tsx';
import { heroSlidesDummy } from '../data/hero.ts';
import { kontakDummy, waLinkKontak } from '../data/kontak.ts';
import { layananDummy } from '../data/layanan.ts';
import { aset } from '../lib/basis.ts';
import Ikon from '../components/Ikon.tsx';
import { portofolioDummy } from '../data/portofolio.ts';
import { fasilitasDummy } from '../data/fasilitas.ts';
import { useT } from '../lib/i18n.tsx';
import { useApiDaftar } from '../lib/useApiData.ts';
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
  const t = useT();

  // Data section diambil dari backend bila VITE_API_BASE_URL diset;
  // kalau tidak (atau gagal) tetap memakai data dummy di src/data/.
  const slidesHero = useApiDaftar('/hero-slides', heroSlidesDummy);
  const daftarLayanan = useApiDaftar('/layanan', layananDummy);
  const highlightDokumentasi = useApiDaftar('/dokumentasi', dokumentasiDummy);
  // Klien dari GET /api/klien; fallback dummy FTB/CAW/Ubaya (lihat src/data/klien.ts).
  const daftarKlien = useApiDaftar('/klien', klienDummy);
  const daftarTestimoni = useApiDaftar('/testimoni', testimoniDummy);
  const highlightBerita = useApiDaftar('/berita', beritaDummy);

  return (
    <div>
      {/* Slide hero — GET /api/hero-slides. */}
      <HeroCarousel slides={slidesHero} />

      <section id="layanan" className="scroll-mt-20 bg-sky py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading kicker={t('Layanan')} title={t('Pilih Jalur Kolaborasimu')} sub={t('Pelatihan dan inference solution untuk kebutuhan nyata.')} />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {daftarLayanan.map((c) => (
              <article key={c.slug} className="card-accent flex flex-col rounded-2xl border border-line bg-white p-6 text-center">
                <h3 className="font-display font-bold">{t(c.nama)}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{t(c.tagline)}</p>
                <Link
                  to={`/layanan/${c.slug}`}
                  className="btn-accent mx-auto mt-4 inline-block rounded-lg px-5 py-2 text-sm font-bold"
                >
                  {t('Detail Layanan →')}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tentang singkat — "Provide what we are, who we are" (statis dari kontakDummy). */}
      <section aria-label={t('Tentang Kami')} className="py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 md:grid-cols-[1.2fr_0.8fr]">
          <SectionHeading
            kicker={t('Siapa Kami')}
            title={t('Tentang Kami')}
            sub={t(kontakDummy.deskripsiSingkat)}
            align="left"
          />
          <div className="md:text-right">
            <Link
              to="/tentang-kami"
              className="btn-primary inline-block rounded-lg px-5 py-2.5 font-display text-sm font-bold text-white"
            >
              {t('Selengkapnya →')}
            </Link>
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
              <li key={k.slug} className="card-accent overflow-hidden rounded-2xl border border-line bg-white">
                <img
                  src={aset(k.gambar)}
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
              <li key={r.slug} className="card-accent overflow-hidden rounded-2xl border border-line bg-white">
                <img
                  src={aset(r.gambar)}
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
          {/* Highlight 3 dokumentasi teratas — GET /api/dokumentasi (limit penampilan di frontend). */}
          <SectionBar
            kicker="Kegiatan"
            title="Dokumentasi Kegiatan"
            sub="Sorotan kegiatan terbaru AI Center."
            actionTo="/dokumentasi"
            actionLabel="Lihat Semua →"
            dark
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {highlightDokumentasi.slice(0, 3).map((d) => (
              <DokumentasiCard key={d.slug} item={d} showLink={false} />
            ))}
          </div>
        </div>
      </section>

      {/* Klien Kami — GET /api/klien (fallback placeholder FTB/CAW/Ubaya). */}
      <section aria-label={t('Klien Kami')} className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading kicker={t('Dipercaya')} title={t('Klien Kami')} sub={t('Mitra yang berkolaborasi dengan AI Center.')} />
          <ClientCarousel items={daftarKlien} perPage={3} />
        </div>
      </section>

      <section aria-label={t('Testimoni')} className="bg-soft py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <SectionHeading kicker={t('Testimoni')} title={t('Apa Kata Mereka?')} sub={t('Cerita peserta dan mitra AI Center.')} />
          {/* Testimoni — GET /api/testimoni. */}
          <TestimoniSlider items={daftarTestimoni} dark={false} />
        </div>
      </section>

      <section aria-label={t('Berita Terkini')} className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          {/* Highlight 3 berita teratas — GET /api/berita (limit penampilan di frontend). */}
          <SectionBar
            kicker="Berita"
            title="Berita Terkini"
            sub="Kabar terbaru AI Center."
            actionTo="/berita"
            actionLabel="Lihat Semua →"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {highlightBerita.slice(0, 3).map((b) => (
              <NewsCard key={b.slug} item={b} showLink={false} />
            ))}
          </div>
        </div>
      </section>

      {/* Kontak ala situs patokan: kartu gradient navy, heading kiri + daftar kanal kanan. */}
      <section aria-label={t('Kontak')} className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-10 rounded-3xl bg-gradient-to-br from-brand to-navy p-8 text-white shadow-xl md:grid-cols-[1.2fr_1fr] md:p-14">
            <SectionHeading
              kicker={t('Hubungi Kami')}
              title={t('Kontak')}
              sub={t('Sapa kami lewat kanal favoritmu.')}
              align="left"
              tone="dark"
            />
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${kontakDummy.email}`}
                  aria-label={t('Email AI Center')}
                  className="flex min-h-11 items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 hover:bg-white/15"
                >
                  <span aria-hidden="true" className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white/15">
                    <Ikon nama="email" className="h-6 w-6" />
                  </span>
                  <span>
                    <small className="block font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#dbe3ff]">
                      Email
                    </small>
                    <b className="block font-body text-base font-bold">{kontakDummy.email}</b>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={waLinkKontak(kontakDummy)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t('WhatsApp AI Center')}
                  className="flex min-h-11 items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 hover:bg-white/15"
                >
                  <span aria-hidden="true" className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#1faa54]">
                    <Ikon nama="whatsapp" className="h-6 w-6" />
                  </span>
                  <span>
                    <small className="block font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#dbe3ff]">
                      WhatsApp
                    </small>
                    <b className="block font-body text-base font-bold">{kontakDummy.whatsappDisplay}</b>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={kontakDummy.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t('Instagram AI Center')}
                  className="flex min-h-11 items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 hover:bg-white/15"
                >
                  <span aria-hidden="true" className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white/15">
                    <Ikon nama="instagram" className="h-6 w-6" />
                  </span>
                  <span>
                    <small className="block font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#dbe3ff]">
                      Instagram
                    </small>
                    <b className="block font-body text-base font-bold">{kontakDummy.instagramLabel}</b>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
