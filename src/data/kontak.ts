// Info kontak resmi AI Center — satu sumber kebenaran untuk Footer dan Tentang Kami.
// KEPUTUSAN (28 Sep 2026): kontak — khususnya nomor WA & pesan pembawa — diambil
// dari situs lama dan dipertahankan STATIS; TIDAK di-wire ke GET /api/profil.
// Sumber: section Kontak di situs lama (index.html) — nomor & greeting persis
// link wa.me di sana (62895634222240).

export interface Kontak {
  /** Email resmi AI Center. */
  email: string;
  /** Nomor WhatsApp untuk ditampilkan (format lokal). */
  whatsappDisplay: string;
  /** Nomor WhatsApp mentah untuk dibangun menjadi link wa.me. */
  whatsappNumber: string;
  /** Pesan pembawa otomatis di WhatsApp. */
  whatsappGreeting: string;
  /** URL situs profil AI Center. */
  websiteUrl: string;
  /** Label tampilan tautan website. */
  websiteLabel: string;
  /** URL Instagram resmi (placeholder — konfirmasi handle asli).
   * TODO_KONTEN: ganti dengan handle Instagram resmi setelah dikonfirmasi. */
  instagramUrl: string;
  /** Label tampilan tautan Instagram. */
  instagramLabel: string;
  /** Alamat fisik, per baris. */
  alamat: string[];
  /** Koordinat pin Google Maps (pitch gedung, bukan hasil search teks). */
  latitude: number;
  /** Koordinat pin Google Maps (pitch gedung, bukan hasil search teks). */
  longitude: number;
  /** Deskripsi singkat profil AI Center (Tentang Kami). */
  deskripsiSingkat: string;
  /** Deskripsi ringkas untuk Footer. */
  deskripsiFooter: string;
}

export const kontakDummy: Kontak = {
  email: 'aicenter@unit.ubaya.ac.id',
  whatsappDisplay: '0895-6342-22240',
  whatsappNumber: '0895-6342-22240',
  whatsappGreeting: 'Halo Ubaya AI Center, saya ingin berdiskusi mengenai layanan/kerja sama AI.',
  websiteUrl: 'https://lppm.ubaya.ac.id/aicenter',
  websiteLabel: 'lppm.ubaya.ac.id/aicenter',
  // TODO_KONTEN: placeholder — ganti dengan handle Instagram resmi setelah dikonfirmasi.
  instagramUrl: 'https://instagram.com/aicenter_ubaya',
  instagramLabel: '@aicenter_ubaya',
  alamat: ['Gedung Fakultas Teknik · TA 1.2', 'Jalan Raya Kalirungkut, Tenggilis, Surabaya'],
  // TODO_KONTEN: pin presisi dari user (Sep 2026) — verifikasi ulang bila gedung pindah.
  latitude: -7.321919965577327,
  longitude: 112.76790932621508,
  deskripsiSingkat:
    'Ubaya AI Center adalah AI Solution Factory — ruang di mana riset, talenta, dan komputasi performa tinggi ' +
    'bertemu untuk menghasilkan produk dan dampak nyata bagi akademik, industri, dan masyarakat.',
  deskripsiFooter: 'Pusat riset dan layanan kecerdasan artifisial Universitas Surabaya.',
};

/**
 * Bangun link WhatsApp (wa.me) dari nomor Indonesia dan pesan pembawa.
 * Nomor diawali `0` dikonversi ke format internasional `62…`; digit lain (mis. `62…`)
 * dipertahankan.
 *
 * @throws {Error} bila nomor tidak berisi digit sama sekali.
 */
export function buildWaLink(nomor: string, pesan?: string): string {
  const digits = nomor.replace(/\D/g, '');
  if (!digits) {
    throw new Error('Nomor WhatsApp kosong atau tidak berisi digit');
  }
  const international = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  const base = `https://wa.me/${international}`;
  return pesan ? `${base}?text=${encodeURIComponent(pesan)}` : base;
}

/** Link WhatsApp lengkap dari data kontak (nomor + pesan pembawa). */
export function waLinkKontak(kontak: Kontak): string {
  return buildWaLink(kontak.whatsappNumber, kontak.whatsappGreeting);
}

/**
 * Link compose Gmail langsung (bukan `mailto:`) — klik membuka tab tulis Gmail
 * dengan tujuan, subjek & pesan pembawa terisi otomatis, meniru pengalaman
 * link WhatsApp (wa.me + greeting). Dipakai agar pengunjung tanpa aplikasi
 * email desktop tetap langsung sampai ke form pengiriman (konsul: email
 * "langsung arah ke email, kayak WA" — ternyata `mailto:` tidak membuka
 * apa-apa bila tidak ada mail client terdaftar, jadi ganti ke Gmail web).
 *
 * @throws {Error} bila email kosong.
 */
export function mailLinkKontak(
  kontak: Kontak,
  subjek = 'Kolaborasi dengan AI Center Ubaya',
): string {
  if (!kontak.email.trim()) {
    throw new Error('Email kontak kosong');
  }
  return (
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(kontak.email)}` +
    `&su=${encodeURIComponent(subjek)}` +
    `&body=${encodeURIComponent(kontak.whatsappGreeting)}`
  );
}

/**
 * URL Google Maps yang terkunci ke pin koordinat kontak
 * (mode search resmi `api=1&query=lat,lng` — tepat di titik, bukan hasil search teks).
 */
export function petaUrlKontak(kontak: Kontak): string {
  if (!Number.isFinite(kontak.latitude) || !Number.isFinite(kontak.longitude)) {
    throw new Error('Koordinat kontak tidak valid');
  }
  return `https://www.google.com/maps/search/?api=1&query=${kontak.latitude},${kontak.longitude}`;
}
