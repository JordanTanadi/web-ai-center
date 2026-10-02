import { useSearchParams } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading.tsx';
import TeamCard from '../components/TeamCard.tsx';
import type { AnggotaTim } from '../data/tim.ts';
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
  // Hierarki visual berbasis peran (bukan urutan array, supaya tetap benar
  // walau data backend diurutkan ulang):
  //   0 = Ketua (baris paling atas, tunggal)
  //   1 = Koordinator & Tim Riset (sejajar di baris kedua)
  //   2 = anggota lain (grid seragam baris ketiga)
  const tingkat = (a: AnggotaTim): 0 | 1 | 2 =>
    a.peran === 'Ketua'
      ? 0
      : a.peran.startsWith('Koordinator') || a.peran === 'Tim Riset'
        ? 1
        : 2;
  const ketua = items.filter((a) => tingkat(a) === 0);
  const sejajar = items.filter((a) => tingkat(a) === 1);
  const sisanya = items.filter((a) => tingkat(a) === 2);
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
          <div className="mt-8 space-y-5">
            {/* Baris 1 — Ketua: kartu tunggal di kolom tengah (paling atas). */}
            {ketua.length > 0 && (
              <div className="grid gap-5 md:grid-cols-3">
                <div className="md:col-start-2">
                  {ketua.map((a) => (
                    <TeamCard key={a.nama} anggota={a} />
                  ))}
                </div>
              </div>
            )}
            {/* Baris 2 — Koordinator & Tim Riset sejajar (2 kolom). */}
            {sejajar.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {sejajar.map((a) => (
                  <TeamCard key={a.nama} anggota={a} />
                ))}
              </div>
            )}
            {/* Baris 3 — anggota lain seragam (3 kolom), sesuai urutan data. */}
            {sisanya.length > 0 && (
              <div className="grid gap-5 md:grid-cols-3">
                {sisanya.map((a) => (
                  <TeamCard key={a.nama} anggota={a} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
