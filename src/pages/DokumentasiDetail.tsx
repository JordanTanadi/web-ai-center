import { Link, useParams } from 'react-router-dom';
import { getDokumentasiBySlug } from '../data/dokumentasi.ts';
import { formatTanggal } from '../lib/formatTanggal.ts';

export default function DokumentasiDetail() {
  const { slug = '' } = useParams();
  const item = getDokumentasiBySlug(slug);
  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-display text-2xl font-bold">Dokumentasi tidak ditemukan</h1>
        <Link to="/dokumentasi" className="mt-4 inline-block text-sm font-bold text-brand hover:underline">
          ← Kembali ke daftar dokumentasi
        </Link>
      </div>
    );
  }
  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-sm text-muted">
        {item.kategori} · <time dateTime={item.tanggal}>{formatTanggal(item.tanggal)}</time>
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold">{item.judul}</h1>
      <p className="mt-6">{item.deskripsi}</p>
      {/* TODO_BACKEND: detail dokumentasi dari GET /api/dokumentasi/:slug */}
      <Link to="/dokumentasi" className="mt-8 inline-block text-sm font-bold text-brand hover:underline">
        ← Kembali ke daftar dokumentasi
      </Link>
    </article>
  );
}
