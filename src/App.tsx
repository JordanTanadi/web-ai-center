import { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import SiteLayout from './components/SiteLayout.tsx';

// Code-splitting per route agar JS awal hanya memuat yang dibutuhkan halaman ini.
const Beranda = lazy(() => import('./pages/Beranda.tsx'));
const LayananDetail = lazy(() => import('./pages/LayananDetail.tsx'));
const PelatihanDetail = lazy(() => import('./pages/PelatihanDetail.tsx'));
const Tim = lazy(() => import('./pages/Tim.tsx'));
const TentangKami = lazy(() => import('./pages/TentangKami.tsx'));
const Berita = lazy(() => import('./pages/Berita.tsx'));
const BeritaDetail = lazy(() => import('./pages/BeritaDetail.tsx'));
const Dokumentasi = lazy(() => import('./pages/Dokumentasi.tsx'));
const DokumentasiDetail = lazy(() => import('./pages/DokumentasiDetail.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));

function PageFallback() {
  return (
    <p role="status" className="mx-auto max-w-6xl px-6 py-20 text-center text-muted">
      Memuat halaman…
    </p>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Redirect root ke /beranda sesuai struktur folder existing */}
        <Route path="/" element={<Navigate to="/beranda" replace />} />
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
  );
}
