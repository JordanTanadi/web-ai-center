# Web AI Center — Frontend

CMS frontend AI Center Universitas Surabaya. Data masih dummy; backend belum terintegrasi.

## Tech stack

- React 19 + TypeScript + Vite 7 (SPA, React Router v7)
- Tailwind CSS v4 + `motion` (animasi carousel)
- Vitest + Testing Library + jsdom (unit test)
- Node.js ≥ 20

## Halaman

| Rute | Isi |
|---|---|
| `/` → `/beranda` | Hero carousel (2 slide foto), Layanan, highlight Dokumentasi (3 card), Our Client (carousel otomatis), Testimoni, highlight Berita (3 card) |
| `/tim` | Daftar tim + pencarian |
| `/tentang-kami` | Profil, alamat |
| `/berita`, `/berita/:slug` | Daftar + pencarian, detail |
| `/dokumentasi`, `/dokumentasi/:slug` | Daftar + pencarian, detail |
|lainnya | 404 |

## Arti penanda di kode

- `TODO_BACKEND` — bagian ini baru dummy; backend wajib mengisi (endpoint contoh tertulis di komentar, mis. `GET /api/berita`).
- `TODO_ASSET` — file aset (mis. foto hero) perlu diganti/ditambah di `public/`.
- Limit 3 card hanya di highlight beranda; halaman `/berita` dan `/dokumentasi` me-render semua data tanpa batas.

## File `.test.tsx` / `.test.ts`

Unit test kecil per unit (input → output + 1–2 edge case). Dijalankan via `npm test`. Bukan integration/e2e test.

## Folder `lighthouse_report/`

Arsip hasil ukur Lighthouse (JSON mentah). File `prod*-*.json` = hasil build produksi (acuan skor). Ukur ulang selalu terhadap build produksi, bukan dev server.

## Menjalankan di laptop lain

```bash
npm install
npm run dev      # development (http://localhost:5173)
npm test         # unit test
npm run build    # build produksi ke dist/
npm run preview  # sajikan hasil build (http://localhost:4173)
```

Catatan: butuh Node ≥ 20 dan akses internet (instalasi pertama). Nilai asli (API key dsb.) hanya di `.env` lokal — lihat `.env.example`, jangan commit `.env`.

## Ringkasan pengerjaan

1. Scaffold Vite React-TS + Tailwind + motion + Vitest + router; desain diadaptasi dari `beranda/index.html`, konten di-rewrite untuk AI Center Ubaya.
2. Komponen reusable: layout header/footer (logo Ubaya → AI Center, dropdown Konten), hero carousel + client carousel otomatis (dots, jeda saat hover/fokus, hormat reduced-motion), slider testimoni, card berita/dokumentasi/tim dengan slot gambar.
3. Data dummy bertanda backend untuk hero, berita, dokumentasi, tim, klien, testimoni.
4. Optimasi Lighthouse hingga desktop 100/100/100/100 dan mobile 95/100/100/100 (robots.txt, dimensi gambar, target sentuh, kompresi + WebP responsif, code-splitting route, preload LCP).
5. 64 unit test, semua pass; `tsc` bersih.
