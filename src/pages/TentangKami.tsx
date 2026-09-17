import SectionHeading from '../components/SectionHeading.tsx';

export default function TentangKami() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <SectionHeading kicker="Tentang" title="Tentang Kami" sub="AI Center Universitas Surabaya." />
      <div className="mt-6 max-w-3xl space-y-4">
        <p>
          AI Center Universitas Surabaya adalah pusat riset dan layanan kecerdasan artifisial yang mendukung
          pendidikan, penelitian, dan pengabdian masyarakat.
        </p>
        <p>
          Layanan utama: pelatihan AI/ML, penyewaan GPU lab, dan solusi inference untuk industri.
          {/* TODO_BACKEND: profil dinamis (visi/misi/statistik) diambil dari GET /api/profil */}
        </p>
        <address className="not-italic text-sm text-muted">
          Jl. Tenggilis Mejoyo, Kali Rungkut, Kec. Rungkut, Surabaya, Jawa Timur 60293
        </address>
      </div>
    </div>
  );
}
