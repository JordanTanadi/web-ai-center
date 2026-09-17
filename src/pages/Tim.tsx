import { useState } from 'react';
import SectionHeading from '../components/SectionHeading.tsx';
import TeamCard from '../components/TeamCard.tsx';
import { timDummy } from '../data/tim.ts';

// Pola halaman mengikuti halaman Berita/Dokumentasi (heading → pencarian → grid card).
export default function Tim() {
  const [q, setQ] = useState('');
  const query = q.toLowerCase();
  const items = timDummy.filter(
    (a) => !query || a.nama.toLowerCase().includes(query) || a.peran.toLowerCase().includes(query),
  );
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <SectionHeading kicker="Tim" title="Tim Kami" sub="Struktur tim AI Center Universitas Surabaya (data dummy)." />
      {/* TODO_BACKEND: daftar + pencarian server-side via GET /api/tim?q= */}
      <div className="mx-auto mt-6 max-w-md">
        <label htmlFor="cari-tim" className="sr-only">
          Cari anggota tim
        </label>
        <input
          id="cari-tim"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari anggota tim…"
          className="w-full rounded-lg border border-line px-4 py-2"
        />
      </div>
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
  );
}
