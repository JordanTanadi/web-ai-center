import SectionHeading from '../components/SectionHeading.tsx';
import { kontakDummy, waLinkKontak } from '../data/kontak.ts';
import { profilDummy, type Profil } from '../data/profil.ts';
import { useT } from '../lib/i18n.tsx';

// TODO_BACKEND: profil (visi/misi/deskripsi/statistik) diambil dari GET /api/profil.
export default function TentangKami({ profil = profilDummy }: { profil?: Profil }) {
  const t = useT();
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <SectionHeading kicker={t('Tentang')} title={t('Tentang Kami')} sub={t('AI Center Universitas Surabaya.')} level="h1" />
      {/* Paragraf pembuka dipusatkan agar sejajar heading (bukan menempel tepi kiri) */}
      <div className="mx-auto mt-6 max-w-3xl space-y-4 text-center">
        <p>{t(kontakDummy.deskripsiSingkat)}</p>
        <p>{t('Layanan utama kami adalah pelatihan AI/ML dan inference solution untuk sivitas akademika serta mitra industri.')}</p>
      </div>

      {/* Visi & Misi — layout mengikuti referensi "Arah Kami": kartu visi gelap + daftar misi bernomor */}
      <section aria-label={t('Visi & Misi')} className="mt-14">
        <SectionHeading kicker={t('Arah Kami')} title={t('Visi & Misi')} sub={t(profil.introVisiMisi)} />

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl bg-navy p-6 text-white md:p-8">
            <h3 className="font-body text-xs font-bold uppercase tracking-[0.16em] text-yellow">
              <span aria-hidden="true">// </span>{t('Visi')}
            </h3>
            <p className="mt-3 font-display text-xl font-bold">{t(profil.visi.judul)}</p>
            <p className="mt-3 text-sm text-[#dbe3ff]">{t(profil.visi.deskripsi)}</p>
          </article>

          <article className="rounded-2xl border border-line bg-soft p-6 md:p-8">
            <h3 className="font-display text-xl font-bold">{t('Misi')}</h3>
            {profil.misi.length === 0 ? (
              <p className="mt-3 text-sm text-muted">{t('Misi belum tersedia.')}</p>
            ) : (
              <ol className="mt-2 divide-y divide-line">
                {profil.misi.map((poin, i) => (
                  <li key={poin} className="flex gap-4 py-3">
                    <span className="font-body font-bold text-brand" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm">{t(poin)}</span>
                  </li>
                ))}
              </ol>
            )}
          </article>
        </div>
      </section>

      {/* Kontak dipusatkan mengikuti ritme halaman; tetap elemen <address> semantik */}
      <address className="mx-auto mt-12 block max-w-3xl text-center not-italic text-sm text-muted">
        {kontakDummy.alamat.map(t).join(', ')}
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
