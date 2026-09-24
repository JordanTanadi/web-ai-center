// Info kontak resmi AI Center — satu sumber kebenaran untuk Footer dan Tentang Kami.
// TODO_BACKEND: ganti dengan GET /api/profil (field kontak) ketika backend terintegrasi.
// Sumber: kontak yang tercantum di web AI Center (lppm.ubaya.ac.id/aicenter).

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
  whatsappGreeting: 'Halo Ubaya AI Center, saya ingin berdiskusi mengenai layanan AI Center.',
  websiteUrl: 'https://lppm.ubaya.ac.id/aicenter',
  websiteLabel: 'lppm.ubaya.ac.id/aicenter',
  alamat: ['Gedung Perpustakaan LT.4', 'Jalan Raya Kalirungkut, Tenggilis, Surabaya'],
  deskripsiSingkat:
    'AI Center Universitas Surabaya adalah pusat riset dan layanan kecerdasan artifisial ' +
    'yang mendukung pendidikan, penelitian, dan pengabdian masyarakat dalam ekosistem ' +
    'LPPM Universitas Surabaya.',
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
