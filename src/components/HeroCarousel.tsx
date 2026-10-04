import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { HeroSlide } from '../data/hero.ts';
import { aset, srcSetBerbasis } from '../lib/basis.ts';
import { prefersReducedMotion } from '../lib/prefersReducedMotion.ts';
import { useT } from '../lib/i18n.tsx';

// Slider hero otomatis + dots, diadaptasi dari hero di beranda/index.html
// PROGRESS 2: tombol CTA & tagpill logo dicabut dari tampilan (data cta/badge di
// `hero.ts` dipertahankan agar bisa dipakai lagi tanpa migrasi seed).
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
  const isImageLeft = (current.layout ?? 'default') === 'image-left';
  // 'teks-kanan' (konsul 2 Okt): teks dipindah ke samping kanan pada area foto
  // yang kosong — subjek/kiri background tetap terlihat, tanpa memecah jadi kolom.
  const teksKanan = (current.layout ?? 'default') === 'teks-kanan';

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
        {/* Atmosfer gradasi ala referensi desain: glow radial biru + cincin konsentris
            (dekoratif, aria-hidden; di belakang lapisan slide sehingga teks tak terganggu). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(75% 65% at 15% 0%, rgb(37 71 244 / 0.4), transparent 62%)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(65% 55% at 90% 25%, rgb(6 116 253 / 0.25), transparent 65%)' }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-36 h-96 w-96 rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-10 h-[460px] w-[460px] rounded-full border border-white/10" />
        <motion.div
          key={index % slides.length}
          initial={hematGerak ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          aria-roledescription="slide"
          aria-label={t(`Slide ${index + 1} dari ${slides.length}`)}
          className={isImageLeft ? 'absolute inset-0 flex items-stretch' : 'absolute inset-0 flex items-center'}
        >
            {isImageLeft ? (
              // Layout image-left: grid dengan gambar di kiri (40%), teks di kanan (60%)
              <>
                {current.image && imgOk[index] !== false && (
                  // Sembunyikan kolom gambar di layar kecil — ruang teks jangan sampai sempit.
                  <div className="hidden w-2/5 flex-shrink-0 md:block" aria-hidden="true">
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
                <div className="flex-1 flex items-center bg-gradient-to-r from-navy via-navy/80 to-navy/60">
                  <div className="relative z-10 w-full max-w-2xl px-6 py-20 md:py-24 ml-auto">
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
                    </motion.div>
                  </div>
                </div>
              </>
            ) : (
              // Layout default: gambar sebagai background overlay, teks di atas
              <>
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
                {/* Overlay gelap agar kontras teks ≥ 4.5:1 di atas foto —
                    arahnya mengikuti posisi teks (teks kanan → gelap di kanan);
                    di layar kecil tetap kiri-kanan seperti default (teks full-width). */}
                <div
                  className={`absolute inset-0 ${
                    teksKanan
                      ? 'bg-gradient-to-r md:bg-gradient-to-l from-navy/90 via-navy/60 to-brand-bright/40'
                      : 'bg-gradient-to-r from-navy/90 via-navy/60 to-brand-bright/40'
                  }`}
                  aria-hidden="true"
                />
                {/* w-full: anak flex butuh lebar penuh agar max-w-6xl + mx-auto tetap center */}
                <div className="relative z-10 w-full mx-auto max-w-6xl px-6 py-20 md:py-24">
                  <motion.div
                    className={teksKanan ? 'md:ml-auto md:max-w-2xl' : undefined}
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
                  </motion.div>
                </div>
              </>
            )}
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
