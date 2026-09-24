import { Link } from 'react-router-dom';
import type { BeritaItem } from '../data/berita.ts';
import { formatTanggal } from '../lib/formatTanggal.ts';

// Slot gambar 16:9 di atas card; bila item belum punya gambar,
// tampilkan blok penampung (placeholder) agar layout tetap stabil.
export function CardImage({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width="640"
        height="360"
        loading="lazy"
        className="aspect-video w-full bg-soft object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-soft to-line"
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4a5878" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.5-3.5a1.5 1.5 0 0 0-2 0L6 21" />
      </svg>
    </div>
  );
}

export default function NewsCard({ item, showLink = true }: { item: BeritaItem; showLink?: boolean }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <CardImage src={item.gambar} alt={item.judul} />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs text-muted">
          <time dateTime={item.tanggal}>{formatTanggal(item.tanggal)}</time> · {item.penulis}
        </p>
        <h3 className="mt-2 font-display font-bold">{item.judul}</h3>
        <p className="mt-2 flex-1 text-sm text-muted">{item.ringkasan}</p>
        {showLink ? (
          <Link to={`/berita/${item.slug}`} className="mt-4 text-sm font-bold text-brand hover:underline">
            Baca selengkapnya →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
