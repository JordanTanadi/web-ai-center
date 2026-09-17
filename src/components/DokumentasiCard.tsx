import { Link } from 'react-router-dom';
import type { DokumentasiItem } from '../data/dokumentasi.ts';
import { formatTanggal } from '../lib/formatTanggal.ts';
import { CardImage } from './NewsCard.tsx';

export default function DokumentasiCard({
  item,
  showLink = true,
}: {
  item: DokumentasiItem;
  showLink?: boolean;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <CardImage src={item.gambar} alt={item.judul} />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs text-muted">
          {item.kategori} · <time dateTime={item.tanggal}>{formatTanggal(item.tanggal)}</time>
        </p>
        <h3 className="mt-2 font-display font-bold text-brand">{item.judul}</h3>
        <p className="mt-2 flex-1 text-sm text-muted">{item.deskripsi}</p>
        {showLink ? (
          <Link to={`/dokumentasi/${item.slug}`} className="mt-4 text-sm font-bold text-brand hover:underline">
            Lihat detail →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
