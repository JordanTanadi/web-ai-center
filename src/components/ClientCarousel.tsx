import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { Klien } from '../data/klien.ts';
import { prefersReducedMotion } from '../lib/prefersReducedMotion.ts';

// Carousel otomatis ala hero di beranda/index.html: halaman berganti sendiri,
// indikator dots bar (tanpa tombol panah). Hormati prefers-reduced-motion dan
// jeda saat di-hover/fokus. Pindah halaman dianimasikan fade + naik halus.
export default function ClientCarousel({
  items,
  perPage = 3,
  intervalMs = 5000,
}: {
  items: Klien[];
  perPage?: number;
  intervalMs?: number;
}) {
  const safePerPage = Math.max(1, perPage);
  const pageCount = Math.max(1, Math.ceil(items.length / safePerPage));
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  // Animasi pindah halaman dimatikan bila pengguna meminta reduced motion.
  const hematGerak = prefersReducedMotion();

  useEffect(() => {
    if (items.length <= safePerPage || paused || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      setPage((p) => (p + 1) % pageCount);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, safePerPage, pageCount, paused, intervalMs]);

  if (items.length === 0) {
    return <p className="mt-8 text-center text-muted">Belum ada data klien.</p>;
  }

  const currentPage = page % pageCount;
  const start = currentPage * safePerPage;
  const visible = items.slice(start, start + safePerPage);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div role="region" aria-roledescription="carousel" aria-label="Daftar klien AI Center">
        <motion.div
          key={currentPage}
          initial={hematGerak ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mt-8 grid gap-5 md:grid-cols-3"
        >
          {visible.map((k) => (
            <article
              key={k.nama}
              role="group"
              aria-roledescription="slide"
              className="card-accent rounded-2xl border border-line bg-surface p-6 text-center"
            >
              <div
                aria-hidden="true"
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-soft font-display text-xl font-bold text-brand"
              >
                {k.nama.charAt(0) || '?'}
              </div>
              <h3 className="mt-3 font-display font-bold">{k.nama}</h3>
              <p className="text-sm text-muted">{k.bidang}</p>
            </article>
          ))}
        </motion.div>
      </div>
      {pageCount > 1 && (
        <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Pilih halaman klien">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === currentPage}
              aria-label={`Tampilkan halaman ${i + 1}`}
              onClick={() => setPage(i)}
              className="flex h-11 min-w-11 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={`h-[5px] w-[34px] rounded transition-colors ${
                  i === currentPage ? 'bg-brand' : 'bg-line hover:bg-muted'
                }`}
              />
            </button>
          ))}
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        Halaman {currentPage + 1} dari {pageCount}
      </p>
    </div>
  );
}
