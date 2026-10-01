// Ikon brand/kontak inline SVG (tanpa dependensi ikon eksternal).
// Gaya stroke konsisten (1.8) mengikuti ikon globe di LanguageToggle.
// Selalu dekoratif (`aria-hidden`) — label aksesibel datang dari elemen
// induk (aria-label pada link/tombol).
export type NamaIkon = 'instagram' | 'whatsapp' | 'email' | 'globe';

const jalur: Record<NamaIkon, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
      <path d="M9 8.8c.3-.7 1.4-.8 1.7-.1l.7 1.6c.2.4 0 .9-.3 1.2l-.7.7c.6 1.4 1.8 2.6 3.2 3.2l.7-.7c.3-.3.8-.5 1.2-.3l1.6.7c.7.3.6 1.4-.1 1.7-2.9 1.4-7.3-.3-9.4-4.6-.5-1-.7-2-.5-2.6" />
    </>
  ),
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </>
  ),
};

export default function Ikon({ nama, className = 'h-5 w-5' }: { nama: NamaIkon; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {jalur[nama]}
    </svg>
  );
}
