// Sematan peta Google Maps tanpa API key (mode `output=embed`).
// Koordinat dari data kontak agar pin selalu sama dengan link "alamat".
// iframe langsung dipasang (tanpa facade klik) sesuai permintaan — peta
// terlihat begitu halaman dibuka; loading="lazy" agar tidak menghambat
// render awal (LCP) karena posisinya di bawah lipatan.
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
  const src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;
  const bingkai = tone === 'dark' ? 'border-white/10 bg-white/5' : 'border-line bg-soft';
  const tinggi = mini ? 'min-h-[160px]' : 'min-h-[320px]';
  return (
    <div className={`overflow-hidden rounded-2xl border ${bingkai} ${className}`}>
      <iframe
        title={label}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className={`h-full w-full ${tinggi}`}
        style={{ border: 0 }}
      />
    </div>
  );
}
