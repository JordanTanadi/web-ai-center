import { useEffect, useState } from 'react';
import type { Testimoni } from '../data/testimoni.ts';
import { prefersReducedMotion } from '../lib/prefersReducedMotion.ts';
import { useT } from '../lib/i18n.tsx';

// Slider testimoni satu kutipan (diadaptasi dari section testimoni di beranda/index.html).
// Berpindah sendiri tiap intervalMs (jeda saat hover/fokus, mati saat reduced-motion);
// tombol manual tetap tersedia sebagai alternatif.
export default function TestimoniSlider({
  items,
  dark = true,
  intervalMs = 7000,
}: {
  items: Testimoni[];
  dark?: boolean;
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const t = useT();

  useEffect(() => {
    if (items.length <= 1 || paused || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, paused, intervalMs]);

  if (items.length === 0) {
    return <p className={`mt-8 text-center ${dark ? 'text-[#dbe3ff]' : 'text-muted'}`}>{t('Belum ada testimoni.')}</p>;
  }

  const current = items[idx % items.length];

  return (
    <div
      className="mx-auto mt-8 max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <figure aria-live="polite" className="min-h-52 rounded-2xl bg-white p-8 text-ink md:p-9">
        <blockquote className="text-base md:text-lg">“{t(current.kutipan)}”</blockquote>
        <figcaption className="mt-4 font-display font-bold">
          {t(current.nama)} <span className="font-body font-normal text-muted">· {t(current.peran)}</span>
        </figcaption>
      </figure>
      {items.length > 1 && (
        /* flex-wrap: baris nav tidak overflow di layar ~360px */
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIdx((i) => (i + items.length - 1) % items.length)}
            aria-label={t('Testimoni sebelumnya')}
            className={`rounded-lg border px-4 py-2 font-display text-sm font-bold ${
              dark
                ? 'border-white bg-white/10 text-white hover:bg-white hover:text-brand'
                : 'border-brand bg-white text-brand hover:bg-brand hover:text-white'
            }`}
          >
            {t('← Sebelumnya')}
          </button>
          <p className={`font-body text-sm tabular-nums ${dark ? 'text-[#dbe3ff]' : 'text-muted'}`}>
            {idx + 1} / {items.length}
          </p>
          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % items.length)}
            aria-label={t('Testimoni berikutnya')}
            className={`rounded-lg border px-4 py-2 font-display text-sm font-bold ${
              dark
                ? 'border-white bg-white/10 text-white hover:bg-white hover:text-brand'
                : 'border-brand bg-white text-brand hover:bg-brand hover:text-white'
            }`}
          >
            {t('Berikutnya →')}
          </button>
        </div>
      )}
    </div>
  );
}
