import { Link, useParams } from 'react-router-dom';
import { getLayananBySlug } from '../data/layanan.ts';

export default function LayananDetail() {
  const { slug = '' } = useParams();
  const item = getLayananBySlug(slug);

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14 text-center">
        <h1 className="font-display text-2xl font-bold">Layanan tidak ditemukan</h1>
        <Link to="/beranda#layanan" className="mt-4 inline-block text-sm font-bold text-brand hover:underline">
          ← Kembali ke daftar layanan
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      {/* TODO_BACKEND: detail layanan dari GET /api/layanan/:slug */}
      {/* Header + deskripsi dipusatkan (ritme halaman lain); daftar fitur & CTA
          ditata rapi di bawahnya. */}
      <header className="text-center">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-brand">Layanan</p>
        <h1 className="mt-2 font-display text-3xl font-bold">{item.nama}</h1>
        <p className="mt-2 font-medium text-muted">{item.tagline}</p>
      </header>
      <p className="mx-auto mt-6 max-w-2xl text-center">{item.deskripsi}</p>
      <h2 className="mt-8 text-center font-display text-xl font-bold">Yang Anda dapatkan</h2>
      <ul className="mx-auto mt-4 max-w-md space-y-3">
        {item.fitur.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
              className="mt-1 shrink-0 text-brand"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/tentang-kami"
          className="btn-primary rounded-lg px-6 py-3 font-display text-sm font-bold text-white"
        >
          Hubungi Kami
        </Link>
        <Link
          to="/beranda#layanan"
          className="rounded-lg border border-brand px-6 py-3 font-display text-sm font-bold text-brand hover:bg-brand hover:text-white"
        >
          ← Semua Layanan
        </Link>
      </div>
    </div>
  );
}
