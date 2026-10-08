import { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import SiteLayout from './components/SiteLayout.tsx';
import { PenyediaBahasa, useT } from './lib/i18n.tsx';
// Rute 404 diimpor langsung (kecil, tampil seketika tanpa menunggu chunk).
// SEMUA rute lain code-splitting: JS awal hanya shell + layout, sisanya diunduh
// per rute lewat `window.__PETA_CHUNK` (modulepreload di index.html) sehingga
// chunk sudah terunduh saat React merender — konten tetap tampil pada render
// pertama, sementara JS awal jauh lebih kecil (skor Lighthouse: "reduce unused
// JavaScript" turun drastis karena halaman lain tidak ikut terunduh).
import NotFound from './pages/NotFound.tsx';

const Beranda = lazy(() => import('./pages/Beranda.tsx'));
const PelatihanDetail = lazy(() => import('./pages/PelatihanDetail.tsx'));
const LayananDetail = lazy(() => import('./pages/LayananDetail.tsx'));
const TentangKami = lazy(() => import('./pages/TentangKami.tsx'));
const Tim = lazy(() => import('./pages/Tim.tsx'));
const Berita = lazy(() => import('./pages/Berita.tsx'));
const BeritaDetail = lazy(() => import('./pages/BeritaDetail.tsx'));
const Dokumentasi = lazy(() => import('./pages/Dokumentasi.tsx'));
const DokumentasiDetail = lazy(() => import('./pages/DokumentasiDetail.tsx'));
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
