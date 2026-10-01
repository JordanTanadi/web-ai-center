// Penanganan scroll navigasi SPA — dipanggil SiteLayout setiap location berubah.
// Dulu tiap halaman mengurus hash sendiri (Beranda) dan NavLink ke rute yang sama
// tanpa hash tidak menggulir apa pun; kini satu tempat untuk semua rute.

import { prefersReducedMotion } from './prefersReducedMotion.ts';

/** Penanda muat dokumen pertama — posisi awal diserahkan ke browser. */
let dokumenBaru = true;

/** Khusus unit test: kembalikan penanda "dokumen baru dimuat". */
export function resetFreshDocument(): void {
  dokumenBaru = true;
}

/**
 * Gulir mengikuti hasil navigasi rute.
 * - Ada hash → `scrollIntoView` ke elemen dengan id tersebut (block start; perilaku
 *   smooth/auto ikut preferensi reduced motion). Jika id tidak ditemukan, fallback
 *   ke atas agar pengguna tidak tertinggal di posisi lama.
 * - Tanpa hash → `window.scrollTo(0, 0)`.
 * - Panggilan pertama setelah dokumen dimuat tanpa hash dilewati, supaya restorasi
 *   posisi scroll bawaan browser (mis. setelah reload) tidak tertimpa.
 *
 * @param hash `location.hash` dari react-router ('' bila tanpa hash, '#id' bila ada).
 */
export function scrollForRoute(hash: string): void {
  const id = hash.startsWith('#') ? hash.slice(1) : '';
  if (id) {
    dokumenBaru = false; // ada hash → ini navigasi; penanda tak berlaku lagi
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
      return;
    }
    // Id tidak ada di halaman ini — jatuh ke bawah: ke atas.
  } else if (dokumenBaru) {
    dokumenBaru = false;
    return;
  }
  window.scrollTo(0, 0);
}
