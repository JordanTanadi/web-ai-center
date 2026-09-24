import { useSearchParams } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading.tsx';
import TeamCard from '../components/TeamCard.tsx';
import { timDummy } from '../data/tim.ts';

// Pola halaman mengikuti halaman Berita/Dokumentasi (heading → pencarian → grid card).
export default function Tim() {
  // State pencarian disimpan di URL (?q=) agar hasil bisa dibagikan/di-bookmark.
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const setQ = (value: string) => setSearchParams(value ? { q: value } : {}, { replace: true });
  const query = q.toLowerCase();
  const items = timDummy.filter(
    (a) => !query || a.nama.toLowerCase().includes(query) || a.peran.toLowerCase().includes(query),
  );
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {/* Copy tanpa label "data dummy" — hanya untuk pengguna. TODO_BACKEND di komentar. */}
      <SectionHeading kicker="Tim" title="Tim Kami" sub="Struktur tim AI Center Universitas Surabaya." level="h1" />
      {/* TODO_BACKEND: daftar + pencarian server-side via GET /api/tim?q= */}
      <div className="mx-auto mt-6 max-w-md">
        <label htmlFor="cari-tim" className="sr-only">
          Cari anggota tim
        </label>
        <input
          id="cari-tim"
          type="search"
          name="q"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari anggota tim…"
          className="w-full rounded-lg border border-line px-4 py-2"
        />
      </div>
      {/* Hasil berubah saat mengetik → aria-live agar screen reader mengumumkan perubahan. */}
      <div aria-live="polite">
        {items.length === 0 ? (
          <p className="mt-8 text-center text-muted">Tidak ada anggota tim yang cocok.</p>
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
