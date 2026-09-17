import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { HeroSlide } from '../data/hero.ts';
import { prefersReducedMotion } from '../lib/prefersReducedMotion.ts';

// Slider hero otomatis + dots, diadaptasi dari hero di beranda/index.html
// (interval 7 detik, dots bar di bawah).
// Hanya satu slide yang di-mount dalam satu waktu agar tidak ada duplikat
// heading/link tersembunyi bagi keyboard & screen reader.
// Animasi (motion): background fade + teks naik halus saat slide masuk.
export default function HeroCarousel({ slides, intervalMs = 7000 }: { slides: HeroSlide[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [imgOk, setImgOk] = useState<Record<number, boolean>>({});

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

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Sorotan AI Center"
      className="relative overflow-hidden bg-[#101330] text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Background: min-height dicadangkan agar tidak layout-shift (CLS) */}
      <div className="relative min-h-[520px] md:min-h-[560px]">
        <motion.div
          key={index % slides.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} dari ${slides.length}`}
          className="absolute inset-0"
        >
            {current.image && imgOk[index] !== false && (
              <div className="absolute inset-0" aria-hidden="true">
                <img
                  src={current.image}
                  srcSet={current.srcSet}
                  sizes={current.sizes}
                  alt=""
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                  onError={() => setImgOk((m) => ({ ...m, [index]: false }))}
                />
              </div>
            )}
            {/* Overlay gelap agar kontras teks ≥ 4.5:1 di atas foto */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#0a0c23]/90 via-[#0a0c23]/60 to-[#1025ac]/40"
              aria-hidden="true"
            />
            <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-24">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
              >
                <span className="inline-block rounded-full border border-white/30 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.18em] text-[#ccd7ff]">
                  {current.eyebrow}
                </span>
                <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-white md:text-5xl">
                  {current.judul} <span className="text-[#93a3ff]">{current.judulAksen}</span>
                </h1>
                <p className="mt-4 max-w-xl text-[#e8eaf6]">{current.sub}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={current.ctaPrimer.to}
                    className="rounded-lg bg-white px-6 py-3 font-display text-sm font-bold text-brand hover:bg-[#e7ecff]"
                  >
                    {current.ctaPrimer.label}
                  </Link>
                  <Link
                    to={current.ctaSekunder.to}
                    className="rounded-lg border border-white px-6 py-3 font-display text-sm font-bold text-white hover:bg-white hover:text-ink"
                  >
                    {current.ctaSekunder.label}
                  </Link>
                </div>
                <p className="mt-8 flex items-center gap-3 text-sm">
                  <span aria-hidden="true" className="text-2xl text-[#93a3ff]">
                    ❖
                  </span>
                  <span className="border-l-[3px] border-brand pl-3">
                    <b>{current.badgeJudul}</b>
                    <br />
                    {current.badgeSub}
                  </span>
                </p>
              </motion.div>
            </div>
          </motion.div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Pilih slide">
          {slides.map((s, i) => (
            <button
              key={s.judul}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Tampilkan slide ${i + 1}`}
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
        Slide {index + 1} dari {slides.length}
      </p>
    </section>
  );
}
