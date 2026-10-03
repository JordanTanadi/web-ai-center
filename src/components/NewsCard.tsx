import { Link } from 'react-router-dom';
import type { BeritaItem } from '../data/berita.ts';
import { urlGambar } from '../lib/gambar.ts';
import { formatTanggal } from '../lib/formatTanggal.ts';
import { useT } from '../lib/i18n.tsx';

// Palet aksen kategori (token Figma): chip & dekorasi placeholder memakai
// warna pelengkap — teks navy di atas kuning/oranye/mint/sky, teks putih di
// atas teal (pasangan yang lolos kontras WCAG AA untuk teks kecil).
export function aksenKategori(kategori: string): string {
  const k = kategori.toLowerCase();
  if (k.includes('workshop') || k.includes('pelatihan')) return 'bg-yellow text-navy';
  if (k.includes('demo')) return 'bg-orange text-navy';
  if (k.includes('kunjung')) return 'bg-mint text-navy';
  if (k.includes('kesehatan') || k.includes('aksesibilitas')) return 'bg-teal text-white';
  if (k.includes('industri') || k.includes('pangan') || k.includes('lingkungan'))
    return 'bg-sky text-navy';
  return 'bg-mint text-navy';
}

// Slot gambar 16:9 di atas card; bila item belum punya gambar, tampilkan panel
// gradient identitas (navy → brand → bright) + pola titik + inisial judul
// (Cabinet Grotesk) + label mono (Geist Mono) agar tidak polos.
export function CardImage({
  src,
  alt,
  aksen = 'bg-mint text-navy',
  label = 'AI Center',
}: {
  src?: string;
  alt: string;
  aksen?: string;
  label?: string;
}) {
  const resolved = urlGambar(src);
  if (resolved) {
    return (
      <img
        src={resolved}
        alt={alt}
        width="640"
        height="360"
        loading="lazy"
        className="aspect-video w-full bg-navy object-cover"
      />
    );
  }
  const inisial = (alt.trim().charAt(0) || 'A').toUpperCase();
  return (
    <div
      aria-hidden="true"
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-brand to-brand-bright"
    >
      {/* Pola titik tech + blob aksen (blur) di atas gradient */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div className={`absolute -right-8 -top-10 h-32 w-32 rounded-full opacity-70 blur-2xl ${aksen.split(' ')[0]}`} />
      <div className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-mint opacity-30 blur-2xl" />
      <div className="relative flex flex-col items-center gap-2.5">
        <span className="font-display text-5xl font-extrabold tracking-tight text-white/90">
          {inisial}
        </span>
        <span
          className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${aksen}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export default function NewsCard({ item, showLink = true }: { item: BeritaItem; showLink?: boolean }) {
  const t = useT();
  return (
    <article className="card-accent flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <CardImage src={item.gambar} alt={item.judul} label="Berita" />
      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          <time dateTime={item.tanggal}>{t(formatTanggal(item.tanggal))}</time> · {t(item.penulis)}
        </p>
        <h3 className="mt-2 font-display font-bold">{t(item.judul)}</h3>
        <p className="mt-2 flex-1 text-sm text-muted">{t(item.ringkasan)}</p>
        {showLink ? (
          <Link to={`/berita/${item.slug}`} className="mt-4 text-sm font-bold text-brand hover:underline">
            {t('Baca selengkapnya →')}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
