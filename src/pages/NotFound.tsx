import { Link } from 'react-router-dom';
import { useT } from '../lib/i18n.tsx';

export default function NotFound() {
  const t = useT();
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">{t('404 — Halaman tidak ditemukan')}</h1>
      <p className="mt-2 text-muted">{t('Alamat yang kamu tuju tidak tersedia.')}</p>
      <Link to="/beranda" className="btn-primary mt-6 inline-block rounded-lg px-6 py-3 text-sm font-bold text-white">
        {t('Kembali ke Beranda')}
      </Link>
    </div>
  );
}
