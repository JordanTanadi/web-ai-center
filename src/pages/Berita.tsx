import { useSearchParams } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading.tsx';
import NewsCard from '../components/NewsCard.tsx';
import { beritaDummy } from '../data/berita.ts';

export default function Berita() {
  // State pencarian disimpan di URL (?q=) agar hasil bisa dibagikan/di-bookmark.
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const setQ = (value: string) => setSearchParams(value ? { q: value } : {}, { replace: true });
  const items = beritaDummy.filter(
    (b) => !q || b.judul.toLowerCase().includes(q.toLowerCase()) || b.ringkasan.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {/* Copy tanpa label "data dummy" — hanya untuk pengguna. TODO_BACKEND di komentar. */}
      <SectionHeading kicker="Konten" title="Berita" sub="Kabar terbaru dan informasi terkini dari AI Center." level="h1" />
      {/* TODO_BACKEND: daftar + pencarian server-side via GET /api/berita?q= */}
      <div className="mx-auto mt-6 max-w-md">
        <label htmlFor="cari-berita" className="sr-only">
          Cari berita
        </label>
        <input
          id="cari-berita"
          type="search"
          name="q"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari berita…"
          className="w-full rounded-lg border border-line px-4 py-2"
        />
      </div>
      {/* Hasil berubah saat mengetik → aria-live agar screen reader mengumumkan perubahan. */}
      <div aria-live="polite">
        {items.length === 0 ? (
          <p className="mt-8 text-center text-muted">Tidak ada berita yang cocok.</p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {items.map((b) => (
              <NewsCard key={b.slug} item={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
