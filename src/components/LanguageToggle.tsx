import { useBahasa } from '../lib/i18n.tsx';

/**
 * Tombol ganti bahasa di header — mengikuti `#langtoggle` situs lama
 * (globe SVG + label bahasa TUJUAN: ID → 'EN', EN → 'ID').
 */
export default function LanguageToggle() {
  const { bahasa, setBahasa } = useBahasa();

  return (
    <button
      type="button"
      onClick={() => setBahasa(bahasa === 'id' ? 'en' : 'id')}
      aria-label="Switch language"
      title="Bahasa / Language"
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-xs font-bold text-ink hover:border-brand hover:text-brand"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
      </svg>
      <span>{bahasa === 'id' ? 'EN' : 'ID'}</span>
    </button>
  );
}
