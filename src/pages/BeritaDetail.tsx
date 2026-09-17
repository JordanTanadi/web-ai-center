import { Link, useParams } from 'react-router-dom';
import { getBeritaBySlug } from '../data/berita.ts';
import { formatTanggal } from '../lib/formatTanggal.ts';

export default function BeritaDetail() {
  const { slug = '' } = useParams();
  const item = getBeritaBySlug(slug);
  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-display text-2xl font-bold">Berita tidak ditemukan</h1>
        <Link to="/berita" className="mt-4 inline-block text-sm font-bold text-brand hover:underline">
          ← Kembali ke daftar berita
        </Link>
      </div>
    );
  }
  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-sm text-muted">
        <time dateTime={item.tanggal}>{formatTanggal(item.tanggal)}</time> · {item.penulis}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold">{item.judul}</h1>
      <p className="mt-2 font-medium text-muted">{item.ringkasan}</p>
      <p className="mt-6">{item.isi}</p>
      {/* TODO_BACKEND: isi detail diambil dari GET /api/berita/:slug */}
      <Link to="/berita" className="mt-8 inline-block text-sm font-bold text-brand hover:underline">
        ← Kembali ke daftar berita
      </Link>
    </article>
  );
}
