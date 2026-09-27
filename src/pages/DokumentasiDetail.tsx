import { Link, useParams } from 'react-router-dom';
import { getDokumentasiBySlug } from '../data/dokumentasi.ts';
import { formatTanggal } from '../lib/formatTanggal.ts';
import { useT } from '../lib/i18n.tsx';

export default function DokumentasiDetail() {
  const t = useT();
  const { slug = '' } = useParams();
  const item = getDokumentasiBySlug(slug);
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
      <p className="mt-6">{t(item.deskripsi)}</p>
      {/* TODO_BACKEND: detail dokumentasi dari GET /api/dokumentasi/:slug */}
      <div className="mt-8 text-center">
        <Link to="/dokumentasi" className="inline-block text-sm font-bold text-brand hover:underline">
          {t('← Kembali ke daftar dokumentasi')}
        </Link>
      </div>
    </article>
  );
}
