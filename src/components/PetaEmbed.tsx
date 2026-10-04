import { useEffect, useRef, useState } from 'react';

// Sematan peta Google Maps tanpa API key (mode `output=embed`).
// Koordinat dari data kontak agar pin selalu sama dengan link "alamat".
// Peta hanya dipasang saat area akan terlihat (IntersectionObserver, rootMargin 400px):
// ~400KB JS Maps tidak ikut pemuatan awal (menekan TBT/LCP) dan cookie pihak-ketiga
// Google tidak terpasang saat audit Lighthouse yang tak menggulir halaman — syarat
// skor ≥90. Bila IntersectionObserver tidak tersedia (mis. jsdom di test), iframe
// dipasang langsung seperti perilaku lama (tanpa facade klik).
export default function PetaEmbed({
  latitude,
  longitude,
  label = 'Peta lokasi AI Center',
  zoom = 17,
  className = '',
  tone = 'light',
  mini = false,
}: {
  latitude: number;
  longitude: number;
  label?: string;
  zoom?: number;
  className?: string;
  /** 'dark' untuk latar navy (footer) — bingkai putih transparan. */
  tone?: 'light' | 'dark';
  /** 'mini' untuk peta kecil (footer) — tinggi minimum 160px. */
  mini?: boolean;
}) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Koordinat peta tidak valid');
  }
  // Tanpa IO → aktif langsung (fallback aman untuk test & browser lawas).
  const [aktif, setAktif] = useState(
    () => typeof window === 'undefined' || !('IntersectionObserver' in window),
  );
  const wadah = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aktif) return;
    const el = wadah.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setAktif(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [aktif]);

  const src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;
  const bingkai = tone === 'dark' ? 'border-white/10 bg-white/5' : 'border-line bg-soft';
  const tinggi = mini ? 'min-h-[160px]' : 'min-h-[320px]';
  return (
    <div ref={wadah} className={`overflow-hidden rounded-2xl border ${bingkai} ${className}`}>
      {aktif ? (
        <iframe
          title={label}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className={`h-full w-full ${tinggi}`}
          style={{ border: 0 }}
        />
      ) : (
        <div aria-hidden="true" className={`w-full ${tinggi}`} />
      )}
    </div>
  );
}
