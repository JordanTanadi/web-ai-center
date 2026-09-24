import SectionHeading from '../components/SectionHeading.tsx';
import { kontakDummy, waLinkKontak } from '../data/kontak.ts';
import { profilDummy, type Profil } from '../data/profil.ts';

// TODO_BACKEND: profil (visi/misi/deskripsi/statistik) diambil dari GET /api/profil.
export default function TentangKami({ profil = profilDummy }: { profil?: Profil }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <SectionHeading kicker="Tentang" title="Tentang Kami" sub="AI Center Universitas Surabaya." />
      <div className="mt-6 max-w-3xl space-y-4">
        <p>{kontakDummy.deskripsiSingkat}</p>
        <p>Layanan utama kami adalah pelatihan AI/ML dan inference solution untuk sivitas akademika serta mitra industri.</p>
      </div>

      {/* Visi & Misi — layout mengikuti referensi "Arah Kami": kartu visi gelap + daftar misi bernomor */}
      <section aria-labelledby="visi-misi-heading" className="mt-12">
        <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-brand">Arah Kami</span>
        <h2 id="visi-misi-heading" className="mt-2 font-display text-2xl font-bold md:text-3xl">
          Visi &amp; Misi
        </h2>
        <p className="mt-2 max-w-3xl text-muted">{profil.introVisiMisi}</p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl bg-[#14173a] p-6 text-white md:p-8">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[#93a3ff]">
              <span aria-hidden="true">// </span>Visi
            </h3>
            <p className="mt-3 font-display text-xl font-bold">{profil.visi.judul}</p>
            <p className="mt-3 text-sm text-[#dbe3ff]">{profil.visi.deskripsi}</p>
          </article>

          <article className="rounded-2xl border border-line bg-soft p-6 md:p-8">
            <h3 className="font-display text-xl font-bold">Misi</h3>
            {profil.misi.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Misi belum tersedia.</p>
            ) : (
              <ol className="mt-2 divide-y divide-line">
                {profil.misi.map((poin, i) => (
                  <li key={poin} className="flex gap-4 py-3">
                    <span className="font-display font-bold text-brand" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm">{poin}</span>
                  </li>
                ))}
              </ol>
            )}
          </article>
        </div>
      </section>

      <address className="mt-10 block max-w-3xl not-italic text-sm text-muted">
        {kontakDummy.alamat.join(', ')}
        <br />
        <a href={`mailto:${kontakDummy.email}`} className="text-brand hover:underline">
          {kontakDummy.email}
        </a>
        <br />
        <a href={waLinkKontak(kontakDummy)} target="_blank" rel="noreferrer" className="text-brand hover:underline">
          WhatsApp {kontakDummy.whatsappDisplay} ↗
        </a>
        <br />
        <a href={kontakDummy.websiteUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">
          {kontakDummy.websiteLabel} ↗
        </a>
      </address>
    </div>
  );
}
