import { Link } from 'react-router-dom';
import type { DokumentasiItem } from '../data/dokumentasi.ts';
import { formatTanggal } from '../lib/formatTanggal.ts';
import { useT } from '../lib/i18n.tsx';
import { aksenKategori, CardImage } from './NewsCard.tsx';

export default function DokumentasiCard({
  item,
  showLink = true,
}: {
  item: DokumentasiItem;
  showLink?: boolean;
}) {
  const t = useT();
  const aksen = aksenKategori(item.kategori);
  return (
    <article className="card-accent flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <CardImage src={item.gambar} alt={item.judul} aksen={aksen} label={item.kategori} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] ${aksen}`}
          >
            {t(item.kategori)}
          </span>
          <time
            dateTime={item.tanggal}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
          >
            {t(formatTanggal(item.tanggal))}
          </time>
        </div>
        <h3 className="mt-2 font-display font-bold">{t(item.judul)}</h3>
        <p className="mt-2 flex-1 text-sm text-muted">{t(item.deskripsi)}</p>
        {showLink ? (
          <Link to={`/dokumentasi/${item.slug}`} className="mt-4 text-sm font-bold text-brand hover:underline">
            {t('Lihat detail →')}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
