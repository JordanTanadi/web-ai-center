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
| `/` → `/beranda` | Hero carousel (2 slide foto), Layanan (2 kartu), highlight Dokumentasi (3 card), Testimoni, highlight Berita (3 card) |
| `/tim` | Daftar tim + pencarian |
| `/tentang-kami` | Profil, alamat |
| `/berita`, `/berita/:slug` | Daftar + pencarian, detail |
| `/dokumentasi`, `/dokumentasi/:slug` | Daftar + pencarian, detail |

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

## Backend `server/` (baru)

API **read-only** — Bun + Elysia + Drizzle ORM + PostgreSQL. Dev lokal tidak butuh
instalasi Postgres: kosongkan `DATABASE_URL` → otomatis memakai **PGlite**
(Postgres in-process, data di `server/.pglite/`, di-gitignore). Isi `.env` dari
`server/.env.example` untuk koneksi PostgreSQL asli (nilai dummy saja di sana).

```bash
cd server
bun install
bun run db:migrate      # jalankan migrasi SQL (drizzle/)
bun run db:seed         # isi data dummy (idempoten)
bun run dev             # http://localhost:3000/api/health (watch)
bun test                # unit test backend (bun:test)
bun run typecheck       # tsc --noEmit
bun run db:generate     # generate migrasi — hanya setelah ubah schema.ts
```

### Endpoint

| Endpoint | Query | Catatan |
|---|---|---|
| `GET /api/health` | — | `{ status: "ok" }` |
| `GET /api/berita` | `q`, `page`, `limit`, `order` | `{ items }`; highlight beranda: `?limit=3` |
| `GET /api/berita/:slug` | — | 404 `{ error }` bila tidak ada |
| `GET /api/dokumentasi` | `q`, `kategori`, `page`, `limit`, `order` | `{ items }` |
| `GET /api/dokumentasi/:slug` | — | 404 `{ error }` |
| `GET /api/tim` | `q`, `page`, `limit` | `{ items }` |
| `GET /api/layanan` · `/:slug` | — | `{ items }` / 404 |
| `GET /api/hero-slides` · `/api/klien` · `/api/testimoni` | — | `{ items }` |
| `GET /api/profil` | — | Tentang Kami + kontak footer; 404 bila belum di-seed |

CORS: whitelist origin lewat `CORS_ORIGIN` (default `http://localhost:5173`).

### Status integrasi frontend

Frontend **masih memakai data dummy** (penanda `TODO_BACKEND` di `src/data/*.ts`
dan halaman). Endpoint di atas sudah siap menggantikannya lewat
`VITE_API_BASE_URL` (`http://localhost:3000/api`). CRUD admin belum dikerjakan
(scope backend saat ini baru API baca).

## Ringkasan pengerjaan

1. Scaffold Vite React-TS + Tailwind + motion + Vitest + router; desain diadaptasi dari rapat sebelumnya.
2. Komponen reusable: layout header/footer (logo Ubaya → AI Center, dropdown Konten), hero carousel + client carousel otomatis (dots, jeda saat hover/fokus, hormat reduced-motion), slider testimoni, card berita/dokumentasi/tim dengan slot gambar.
3. Data dummy bertanda backend untuk hero, berita, dokumentasi, tim, klien, testimoni.
4. Optimasi Lighthouse hingga desktop 100/100/100/100 dan mobile 95/100/100/100 (robots.txt, dimensi gambar, target sentuh, kompresi + WebP responsif, code-splitting route, preload LCP).
5. Keputusan rapat 16 Sept: layanan tinggal 2 (Pelatihan + Inference Solution), Our Client dikomentari (kode dipertahankan), testimoni naik ke posisi Our Client dengan background `bg-soft`, kontak footer/Tentang Kami disentralisasi di `src/data/kontak.ts` (email `aicenter@unit.ubaya.ac.id`, WA 0895-6342-22240, website LPPM).
6. Unit test frontend ditulis ulang: **87 test / 15 file** (lib, data, komponen, halaman, routing); backend **76 test**. `tsc` bersih di dua sisi.

### Penanda TODO

- `TODO_BACKEND` — bagian ini baru dummy; backend wajib mengisi (endpoint contoh tertulis di komentar).
- `TODO_ASSET` — file aset perlu diganti/ditambah di `public/`.
- `TODO_KONTEN` — teks menyusul dari dokumen resmi (mis. visi/misi dari PDF rapat 16 Sept 2026).
