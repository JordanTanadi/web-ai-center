import { useSearchParams } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading.tsx';
import TeamCard from '../components/TeamCard.tsx';
import { timDummy } from '../data/tim.ts';
import { useT } from '../lib/i18n.tsx';
import { useApiDaftar } from '../lib/useApiData.ts';

// Pola halaman mengikuti halaman Berita/Dokumentasi (heading → pencarian → grid card).
export default function Tim() {
  // State pencarian disimpan di URL (?q=) agar hasil bisa dibagikan/di-bookmark.
  const [searchParams, setSearchParams] = useSearchParams();
  const t = useT();
  const q = searchParams.get('q') ?? '';
  const setQ = (value: string) => setSearchParams(value ? { q: value } : {}, { replace: true });
  const query = q.toLowerCase();
  // Daftar dari GET /api/tim; pencarian masih client-side di atas daftar lengkap.
  const semuaTim = useApiDaftar('/tim', timDummy);
  const items = semuaTim.filter(
    (a) => !query || a.nama.toLowerCase().includes(query) || a.peran.toLowerCase().includes(query),
  );
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {/* Copy tanpa label "data dummy" — hanya untuk pengguna. */}
      <SectionHeading kicker={t('Tim')} title={t('Tim Kami')} sub={t('Struktur tim AI Center Universitas Surabaya.')} level="h1" />
      <div className="mx-auto mt-6 max-w-md">
        <label htmlFor="cari-tim" className="sr-only">
          {t('Cari anggota tim')}
        </label>
        <input
          id="cari-tim"
          type="search"
          name="q"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('Cari anggota tim…')}
          className="w-full rounded-lg border border-line px-4 py-2"
        />
      </div>
      {/* Hasil berubah saat mengetik → aria-live agar screen reader mengumumkan perubahan. */}
      <div aria-live="polite">
        {items.length === 0 ? (
          <p className="mt-8 text-center text-muted">{t('Tidak ada anggota tim yang cocok.')}</p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {items.map((a) => (
              <TeamCard key={a.nama} anggota={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
