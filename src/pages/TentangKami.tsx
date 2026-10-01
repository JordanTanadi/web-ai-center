import SectionHeading from '../components/SectionHeading.tsx';
import { kontakDummy } from '../data/kontak.ts';
import {
  petakanProfilApi,
  profilDummy,
  type Profil,
  type ProfilApi,
} from '../data/profil.ts';
import { useT } from '../lib/i18n.tsx';
import { useApiObjek } from '../lib/useApiData.ts';

export default function TentangKami({ profil: profilOverride }: { profil?: Profil }) {
  const t = useT();
  // Visi/misi dari GET /api/profil (petakanProfilApi); prop `profil` eksplisit
  // (untuk test/konteks khusus) menang atas data API.
  const profilApi = useApiObjek<ProfilApi>('/profil', undefined);
  const profil: Profil =
    profilOverride ?? (profilApi !== undefined ? petakanProfilApi(profilApi) : profilDummy);
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
    </div>
  );
}
