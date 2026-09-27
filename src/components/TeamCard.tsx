import type { AnggotaTim } from '../data/tim.ts';
import { useT } from '../lib/i18n.tsx';

export default function TeamCard({ anggota }: { anggota: AnggotaTim }) {
  const t = useT();
  const initial = anggota.nama.charAt(0) || '?';
  return (
    <article className="rounded-2xl border border-line bg-white p-6 text-center">
      <div
        aria-hidden="true"
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-soft font-display text-2xl font-bold text-brand"
      >
        {initial}
      </div>
      <h3 className="mt-3 font-display font-bold">{t(anggota.nama)}</h3>
      <p className="text-sm text-brand">{t(anggota.peran)}</p>
      {anggota.kredensial ? <p className="text-xs text-muted">{t(anggota.kredensial)}</p> : null}
    </article>
  );
}
