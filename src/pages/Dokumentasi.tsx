import { useSearchParams } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading.tsx';
import DokumentasiCard from '../components/DokumentasiCard.tsx';
import { dokumentasiDummy } from '../data/dokumentasi.ts';
import { useT } from '../lib/i18n.tsx';

// Pola halaman mengikuti halaman Berita (heading → pencarian → grid card).
export default function Dokumentasi() {
  // State pencarian disimpan di URL (?q=) agar hasil bisa dibagikan/di-bookmark.
  const [searchParams, setSearchParams] = useSearchParams();
  const t = useT();
  const q = searchParams.get('q') ?? '';
  const setQ = (value: string) => setSearchParams(value ? { q: value } : {}, { replace: true });
  const query = q.toLowerCase();
  const items = dokumentasiDummy.filter(
    (d) =>
      !query ||
      d.judul.toLowerCase().includes(query) ||
      d.deskripsi.toLowerCase().includes(query) ||
      d.kategori.toLowerCase().includes(query),
  );
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {/* Copy tanpa label "data dummy" — hanya untuk pengguna. TODO_BACKEND di komentar. */}
      <SectionHeading
        kicker={t('Konten')}
        title={t('Dokumentasi')}
        sub={t('Dokumentasi kegiatan, workshop, dan kolaborasi AI Center.')}
        level="h1"
      />
      {/* TODO_BACKEND: daftar + pencarian server-side via GET /api/dokumentasi?q= */}
      <div className="mx-auto mt-6 max-w-md">
        <label htmlFor="cari-dokumentasi" className="sr-only">
          {t('Cari dokumentasi')}
        </label>
        <input
          id="cari-dokumentasi"
          type="search"
          name="q"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('Cari dokumentasi…')}
          className="w-full rounded-lg border border-line px-4 py-2"
        />
      </div>
      {/* Hasil berubah saat mengetik → aria-live agar screen reader mengumumkan perubahan. */}
      <div aria-live="polite">
        {items.length === 0 ? (
          <p className="mt-8 text-center text-muted">{t('Tidak ada dokumentasi yang cocok.')}</p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {items.map((d) => (
              <DokumentasiCard key={d.slug} item={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
