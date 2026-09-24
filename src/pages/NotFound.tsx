import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">404 — Halaman tidak ditemukan</h1>
      <p className="mt-2 text-muted">Alamat yang kamu tuju tidak tersedia.</p>
      <Link to="/beranda" className="btn-primary mt-6 inline-block rounded-lg px-6 py-3 text-sm font-bold text-white">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
