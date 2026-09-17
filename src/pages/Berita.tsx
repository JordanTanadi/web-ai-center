import { useState } from 'react';
import SectionHeading from '../components/SectionHeading.tsx';
import NewsCard from '../components/NewsCard.tsx';
import { beritaDummy } from '../data/berita.ts';

export default function Berita() {
  const [q, setQ] = useState('');
  const items = beritaDummy.filter(
    (b) => !q || b.judul.toLowerCase().includes(q.toLowerCase()) || b.ringkasan.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <SectionHeading kicker="Konten" title="Berita" sub="Kabar terbaru AI Center (data dummy)." />
      {/* TODO_BACKEND: daftar + pencarian server-side via GET /api/berita?q= */}
      <div className="mx-auto mt-6 max-w-md">
        <label htmlFor="cari-berita" className="sr-only">
          Cari berita
        </label>
        <input
          id="cari-berita"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari berita…"
          className="w-full rounded-lg border border-line px-4 py-2"
        />
      </div>
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
  );
}
