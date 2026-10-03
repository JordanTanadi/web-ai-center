import { Link, useParams } from 'react-router-dom';
import { getDokumentasiBySlug, type DokumentasiItem } from '../data/dokumentasi.ts';
import { aksenKategori, CardImage } from '../components/NewsCard.tsx';
import { formatTanggal } from '../lib/formatTanggal.ts';
import { useT } from '../lib/i18n.tsx';
import { useApiObjek } from '../lib/useApiData.ts';

export default function DokumentasiDetail() {
  const t = useT();
  const { slug = '' } = useParams();
  // Detail dari GET /api/dokumentasi/:slug; slug kosong → path 404 (lihat BeritaDetail).
  const item = useApiObjek<DokumentasiItem>(
    `/dokumentasi/${encodeURIComponent(slug || 'tidak-ada')}`,
    getDokumentasiBySlug(slug),
  );
  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14 text-center">
        <h1 className="font-display text-2xl font-bold">{t('Dokumentasi tidak ditemukan')}</h1>
        <Link to="/dokumentasi" className="mt-4 inline-block text-sm font-bold text-brand hover:underline">
          {t('← Kembali ke daftar dokumentasi')}
        </Link>
      </div>
    );
  }
  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      {/* Meta + judul dipusatkan seperti halaman lain; deskripsi tetap rata kiri
          agar tetap enak dibaca saat konten backend nanti panjang. */}
      <header className="text-center">
        <p className="text-sm text-muted">
          {t(item.kategori)} · <time dateTime={item.tanggal}>{t(formatTanggal(item.tanggal))}</time>
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">{t(item.judul)}</h1>
      </header>
      {/* Banner visual: foto asli bila ada, panel gradient branded bila tidak. */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-line">
        <CardImage
          src={item.gambar}
          alt={item.judul}
          aksen={aksenKategori(item.kategori)}
          label={item.kategori}
        />
      </div>
      <p className="mt-6">{t(item.deskripsi)}</p>
      <div className="mt-8 text-center">
        <Link to="/dokumentasi" className="inline-block text-sm font-bold text-brand hover:underline">
          {t('← Kembali ke daftar dokumentasi')}
        </Link>
      </div>
    </article>
  );
}
