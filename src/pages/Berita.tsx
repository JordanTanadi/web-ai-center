import { useSearchParams } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading.tsx';
import NewsCard from '../components/NewsCard.tsx';
import { beritaDummy } from '../data/berita.ts';
import { useT } from '../lib/i18n.tsx';
import { useApiDaftar } from '../lib/useApiData.ts';

export default function Berita() {
  // State pencarian disimpan di URL (?q=) agar hasil bisa dibagikan/di-bookmark.
  const [searchParams, setSearchParams] = useSearchParams();
  const t = useT();
  const q = searchParams.get('q') ?? '';
  const setQ = (value: string) => setSearchParams(value ? { q: value } : {}, { replace: true });
  // Daftar dari GET /api/berita; pencarian masih client-side di atas daftar
  // lengkap (endpoint mendukung ?q= bila nanti ingin pencarian server-side).
  const semuaBerita = useApiDaftar('/berita', beritaDummy);
  const items = semuaBerita.filter(
    (b) => !q || b.judul.toLowerCase().includes(q.toLowerCase()) || b.ringkasan.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {/* Copy tanpa label "data dummy" — hanya untuk pengguna. */}
      <SectionHeading kicker={t('Konten')} title={t('Berita')} sub={t('Kabar terbaru dan informasi terkini dari AI Center.')} level="h1" />
      <div className="mx-auto mt-6 max-w-md">
        <label htmlFor="cari-berita" className="sr-only">
          {t('Cari berita')}
        </label>
        <input
          id="cari-berita"
          type="search"
          name="q"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('Cari berita…')}
          className="w-full rounded-lg border border-line px-4 py-2"
        />
      </div>
      {/* Hasil berubah saat mengetik → aria-live agar screen reader mengumumkan perubahan. */}
      <div aria-live="polite">
        {items.length === 0 ? (
          <p className="mt-8 text-center text-muted">{t('Tidak ada berita yang cocok.')}</p>
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
