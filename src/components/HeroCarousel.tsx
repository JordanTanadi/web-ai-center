import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { HeroSlide } from '../data/hero.ts';
import { aset, srcSetBerbasis } from '../lib/basis.ts';
import { prefersReducedMotion } from '../lib/prefersReducedMotion.ts';
import { useT } from '../lib/i18n.tsx';

// Tombol CTA hero: primer memakai aksen konversi oranye; tujuan eksternal
// (http…) dirender sebagai <a> tab baru (mis. link konsultasi WhatsApp),
// internal tetap <Link> agar SPA + akses keyboard tetap benar.
function CtaButton({ cta, aksen = false }: { cta: HeroSlide['ctaPrimer']; aksen?: boolean }) {
  const t = useT();
  const cls = aksen
    ? 'btn-accent rounded-lg px-6 py-3 font-display text-sm font-bold'
    : 'rounded-lg border border-white px-6 py-3 font-display text-sm font-bold text-white hover:bg-white hover:text-ink';
  if (/^https?:\/\//i.test(cta.to)) {
    return (
      <a href={cta.to} target="_blank" rel="noreferrer" className={cls}>
        {t(cta.label)}
      </a>
    );
  }
  return (
    <Link to={cta.to} className={cls}>
      {t(cta.label)}
    </Link>
  );
}

// Slider hero otomatis + dots, diadaptasi dari hero di beranda/index.html
// (interval 7 detik, dots bar di bawah).
// Hanya satu slide yang di-mount dalam satu waktu agar tidak ada duplikat
// heading/link tersembunyi bagi keyboard & screen reader.
// Animasi (motion): background fade + teks naik halus saat slide masuk.
export default function HeroCarousel({ slides, intervalMs = 7000 }: { slides: HeroSlide[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [imgOk, setImgOk] = useState<Record<number, boolean>>({});
  const t = useT();

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || paused || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, paused, intervalMs]);

  if (slides.length === 0) return null;
  const current = slides[index % slides.length];
  // Animasi entrance dimatikan bila pengguna meminta reduced motion.
  const hematGerak = prefersReducedMotion();

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('Sorotan AI Center')}
      className="relative overflow-hidden bg-navy text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Background: min-height dicadangkan agar tidak layout-shift (CLS) */}
      <div className="relative min-h-[520px] md:min-h-[560px]">
        <motion.div
          key={index % slides.length}
          initial={hematGerak ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          aria-roledescription="slide"
          aria-label={t(`Slide ${index + 1} dari ${slides.length}`)}
          /* flex items-center: konten teks vertikal-centered di dalam min-height hero */
          className="absolute inset-0 flex items-center"
        >
            {current.image && imgOk[index] !== false && (
              <div className="absolute inset-0" aria-hidden="true">
                <img
                  src={current.image ? aset(current.image) : undefined}
                  srcSet={srcSetBerbasis(current.srcSet)}
                  sizes={current.sizes}
                  alt=""
                  width="1600"
                  height="900"
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                  onError={() => setImgOk((m) => ({ ...m, [index]: false }))}
                />
              </div>
            )}
            {/* Overlay gelap agar kontras teks ≥ 4.5:1 di atas foto */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/60 to-brand-bright/40"
              aria-hidden="true"
            />
            {/* w-full: anak flex butuh lebar penuh agar max-w-6xl + mx-auto tetap center */}
            <div className="relative z-10 w-full mx-auto max-w-6xl px-6 py-20 md:py-24">
              <motion.div
                initial={hematGerak ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
              >
                <span className="inline-block rounded-full border border-white/30 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.18em] text-[#ccd7ff]">
                  {t(current.eyebrow)}
                </span>
                <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-white md:text-5xl">
                  {t(current.judul)} <span className="text-yellow">{t(current.judulAksen)}</span>
                </h1>
                <p className="mt-4 max-w-xl text-[#e8eaf6]">{t(current.sub)}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <CtaButton cta={current.ctaPrimer} aksen />
                  <CtaButton cta={current.ctaSekunder} />
                </div>
                {/* Tagpill ala situs patokan: emblem + judul tebal + sub mono. */}
                <p className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-left shadow-lg">
                  <img
                    src={aset('/AI-Center_Logo.png')}
                    alt=""
                    aria-hidden="true"
                    width="440"
                    height="116"
                    className="h-8 w-auto"
                  />
                  <span>
                    <b className="block font-display text-sm font-bold text-brand">{t(current.badgeJudul)}</b>
                    <small className="block font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                      {t(current.badgeSub)}
                    </small>
                  </span>
                </p>
              </motion.div>
            </div>
          </motion.div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2" role="tablist" aria-label={t('Pilih slide')}>
          {slides.map((s, i) => (
            <button
              key={s.judul}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={t(`Tampilkan slide ${i + 1}`)}
              onClick={() => setIndex(i)}
              className="flex h-11 min-w-11 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={`h-[5px] w-[34px] rounded transition-colors ${
                  i === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        {t(`Slide ${index + 1} dari ${slides.length}`)}
      </p>
    </section>
  );
}
