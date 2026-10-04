import { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import SiteLayout from './components/SiteLayout.tsx';
import { PenyediaBahasa, useT } from './lib/i18n.tsx';
// Rute RINGAN diimpor langsung (bukan lazy): JS awal sudah memuatnya, jadi
// konten tampil pada render pertama — menutup jeda FCP→LCP saat audit Lighthouse
// (dengan chunk terpisah, konten menunggu unduhan ekstra ±1 detik di Slow 4G).
// Rute berat tetap lazy agar JS awal tidak membengkak.
import LayananDetail from './pages/LayananDetail.tsx';
import TentangKami from './pages/TentangKami.tsx';
import Tim from './pages/Tim.tsx';
import Berita from './pages/Berita.tsx';
import BeritaDetail from './pages/BeritaDetail.tsx';
import Dokumentasi from './pages/Dokumentasi.tsx';
import DokumentasiDetail from './pages/DokumentasiDetail.tsx';
import NotFound from './pages/NotFound.tsx';

// Rute berat → code-splitting: JS awal hanya memuat yang dibutuhkan halaman ini.
const Beranda = lazy(() => import('./pages/Beranda.tsx'));
const PelatihanDetail = lazy(() => import('./pages/PelatihanDetail.tsx'));
// Admin DI LUAR SiteLayout: tanpa navbar/footer publik.
const Admin = lazy(() => import('./pages/Admin.tsx'));

function PageFallback() {
  const t = useT();
  return (
    <p role="status" className="mx-auto max-w-6xl px-6 py-20 text-center text-muted">
      {t('Memuat halaman…')}
    </p>
  );
}

export default function App() {
  return (
    <PenyediaBahasa>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Redirect root ke /beranda sesuai struktur folder existing */}
          <Route path="/" element={<Navigate to="/beranda" replace />} />
          {/* Dashboard admin — rute sendiri di luar layout publik. */}
          <Route path="/admin" element={<Admin />} />
          <Route element={<SiteLayout />}>
            <Route path="/beranda" element={<Beranda />} />
            {/* Detail kursus lebih spesifik dari /layanan/:slug — didaftarkan di atasnya. */}
            <Route path="/layanan/pelatihan/:kode" element={<PelatihanDetail />} />
            <Route path="/layanan/:slug" element={<LayananDetail />} />
            <Route path="/tim" element={<Tim />} />
            <Route path="/tentang-kami" element={<TentangKami />} />
            <Route path="/berita" element={<Berita />} />
            <Route path="/berita/:slug" element={<BeritaDetail />} />
            <Route path="/dokumentasi" element={<Dokumentasi />} />
            <Route path="/dokumentasi/:slug" element={<DokumentasiDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </PenyediaBahasa>
  );
}
