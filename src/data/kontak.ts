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
  /** Alamat fisik, per baris. */
  alamat: string[];
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
  alamat: ['Gedung Fakultas Teknik · TA 1.2', 'Jalan Raya Kalirungkut, Tenggilis, Surabaya'],
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
