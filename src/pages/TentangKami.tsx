import SectionHeading from '../components/SectionHeading.tsx';
import { kontakDummy, waLinkKontak } from '../data/kontak.ts';

// TODO_BACKEND: profil (visi/misi/deskripsi/statistik) diambil dari GET /api/profil.
// TODO_KONTEN: teks visi & misi di bawah masih sementara — ganti dengan teks resmi
// dari web LPPM / dokumen rapat 16 Sept 2026 setelah tersedia.
export default function TentangKami() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <SectionHeading kicker="Tentang" title="Tentang Kami" sub="AI Center Universitas Surabaya." />
      <div className="mt-6 max-w-3xl space-y-4">
        <p>{kontakDummy.deskripsiSingkat}</p>
        <p>
          Layanan utama kami adalah pelatihan AI/ML dan inference solution untuk sivitas akademika serta mitra
          industri.
        </p>
        <div className="grid gap-5 pt-4 md:grid-cols-2">
          <section className="rounded-2xl border border-line bg-soft p-6">
            <h2 className="font-display text-xl font-bold">Visi</h2>
            <p className="mt-3 text-sm text-muted">
              Menjadi pusat unggulan kecerdasan artifisial yang berdampak bagi pendidikan, penelitian, dan masyarakat.
            </p>
          </section>
          <section className="rounded-2xl border border-line bg-soft p-6">
            <h2 className="font-display text-xl font-bold">Misi</h2>
            <p className="mt-3 text-sm text-muted">
              Mengembangkan talenta, riset terapan, dan kolaborasi AI yang bertanggung jawab bersama sivitas
              akademika dan mitra.
            </p>
          </section>
        </div>
        <address className="not-italic text-sm text-muted">
          {kontakDummy.alamat.join(', ')}
          <br />
          <a href={`mailto:${kontakDummy.email}`} className="text-brand hover:underline">
            {kontakDummy.email}
          </a>
          <br />
          <a
            href={waLinkKontak(kontakDummy)}
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:underline"
          >
            WhatsApp {kontakDummy.whatsappDisplay} ↗
          </a>
          <br />
          <a
            href={kontakDummy.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:underline"
          >
            {kontakDummy.websiteLabel} ↗
          </a>
        </address>
      </div>
    </div>
  );
}
