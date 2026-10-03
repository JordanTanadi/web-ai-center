import { Link, useParams } from 'react-router-dom';
import { getBeritaBySlug, type BeritaItem } from '../data/berita.ts';
import { CardImage } from '../components/NewsCard.tsx';
import { formatTanggal } from '../lib/formatTanggal.ts';
import { useT } from '../lib/i18n.tsx';
import { useApiObjek } from '../lib/useApiData.ts';

export default function BeritaDetail() {
  const t = useT();
  const { slug = '' } = useParams();
  // Detail dari GET /api/berita/:slug; slug kosong sengaja diarahkan ke path
  // yang pasti 404 supaya respons daftar tidak pernah terbaca sebagai detail.
  const item = useApiObjek<BeritaItem>(
    `/berita/${encodeURIComponent(slug || 'tidak-ada')}`,
    getBeritaBySlug(slug),
  );
  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14 text-center">
        <h1 className="font-display text-2xl font-bold">{t('Berita tidak ditemukan')}</h1>
        <Link to="/berita" className="mt-4 inline-block text-sm font-bold text-brand hover:underline">
          {t('← Kembali ke daftar berita')}
        </Link>
      </div>
    );
  }
  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      {/* Meta + judul dipusatkan seperti halaman lain; isi artikel tetap rata kiri
          agar tetap enak dibaca saat konten backend nanti panjang. */}
      <header className="text-center">
        <p className="text-sm text-muted">
          <time dateTime={item.tanggal}>{t(formatTanggal(item.tanggal))}</time> · {t(item.penulis)}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">{t(item.judul)}</h1>
        <p className="mt-2 font-medium text-muted">{t(item.ringkasan)}</p>
      </header>
      {/* Banner visual: foto asli bila ada, panel gradient branded bila tidak. */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-line">
        <CardImage src={item.gambar} alt={item.judul} label="Berita" />
      </div>
      <p className="mt-6">{t(item.isi)}</p>
      <div className="mt-8 text-center">
        <Link to="/berita" className="inline-block text-sm font-bold text-brand hover:underline">
          {t('← Kembali ke daftar berita')}
        </Link>
      </div>
    </article>
  );
}
