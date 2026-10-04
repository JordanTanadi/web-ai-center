import type { AnggotaTim } from '../data/tim.ts';
import { urlGambar } from '../lib/gambar.ts';
import { useT } from '../lib/i18n.tsx';

export default function TeamCard({ anggota }: { anggota: AnggotaTim }) {
  const t = useT();
  const initial = anggota.nama.charAt(0) || '?';
  const foto = urlGambar(anggota.foto);
  return (
    <article className="card-accent rounded-2xl border border-line bg-surface p-6 text-center">
      {foto ? (
        // Foto UTUH tanpa potong: bingkai aspect-[4/5] persis rasio foto asli
        // (520×650) + object-cover, jadi tidak ada crop; object-top menjaga
        // kepala bila foto backend nanti rasionya sedikit berbeda.
        // Ukuran dibatasi max-w-56 agar tidak terlalu besar.
        <img
          src={foto}
          alt={anggota.nama}
          width={520}
          height={650}
          loading="lazy"
          className="mx-auto aspect-[4/5] w-full max-w-56 rounded-xl bg-soft object-cover object-top ring-1 ring-line"
        />
      ) : (
        <div
          aria-hidden="true"
          className="mx-auto flex aspect-[4/5] w-full max-w-56 items-center justify-center rounded-xl bg-gradient-to-br from-navy via-brand to-brand-bright font-display text-5xl font-extrabold text-white/90"
        >
          {initial}
        </div>
      )}
      <div className="mt-4">
        <h3 className="font-display font-bold">{t(anggota.nama)}</h3>
        <p className="text-sm text-brand">{t(anggota.peran)}</p>
        {anggota.kredensial ? <p className="text-xs text-muted">{t(anggota.kredensial)}</p> : null}
      </div>
    </article>
  );
}
