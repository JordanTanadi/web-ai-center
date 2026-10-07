# Web AI Center — Frontend

CMS frontend AI Center Universitas Surabaya. Terhubung ke backend
(`VITE_API_BASE_URL`, lihat `.env.example`) — bila backend mati, env kosong, atau
mode test, semua halaman otomatis memakai data dummy (lihat `src/lib/api.ts`).

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

- `TODO_BACKEND` — bagian yang **sengaja belum diintegrasikan** + alasannya di komentar (menunggu keputusan konten/endpoint/akun). Sebagian besar endpoint sudah terintegrasi lewat `src/lib/useApiData.ts`.
- `TODO_ASSET` — file aset (mis. foto hero) perlu diganti/ditambah di `public/`.
- Limit 3 card hanya di highlight beranda; halaman `/berita` dan `/dokumentasi` me-render semua data tanpa batas.

## File `.test.tsx` / `.test.ts`

Unit test kecil per unit (input → output + 1–2 edge case). Dijalankan via `npm test`. Bukan integration/e2e test.

Catatan keputusan: 50 file test (36 frontend + 14 backend) **sengaja ikut
di-commit** walaupun aturan kerja awal menyebut file test lokal saja — supaya bukti
unit test ikut terlihat di repo untuk laporan KP dan gerbang bisa dijalankan di
mesin lain.

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

Menjalankan **dengan data dari database**: salin `.env.example` → `.env`, jalankan
backend `server/` (bagian bawah) dulu, baru `npm run dev`. Tanpa `.env`, web tetap
jalan penuh dengan data dummy.

## Deployment (produksi)

Ringkas: **frontend = file statis `dist/`**, **backend = proses Bun + PostgreSQL**.
Keduanya boleh beda domain — `src/lib/gambar.ts` otomatis menempelkan path
`/uploads/…` ke origin backend, jadi gambar unggahan tetap termuat.

### Backend

1. Isi `server/.env` (salin `server/.env.example`) — semua wajib di produksi:
   `DATABASE_URL` (PostgreSQL asli), `CORS_ORIGIN` (origin frontend produksi,
   pisah koma), `ADMIN_PASSWORD` (**jangan** sampai fallback `admin-dev`),
   `PORT`, `UPLOAD_DIR` (folder persistent di luar repo, writable).
2. ```bash
   cd server
   bun install            # lockfile: server/bun.lock
   bun run db:migrate     # migrasi SQL ke DB produksi
   bun run db:seed        # sekali saja — konten awal (idempoten)
   bun run start          # tanpa watch; jalankan di balik systemd/PM2/nginx
   ```
3. Verifikasi: `GET <api>/api/health` → `{"status":"ok","db":"ok"}`, lalu uji
   login `POST /api/admin/login`.
4. Backup: folder `UPLOAD_DIR` + database secara terpisah. Token admin berlaku
   6 jam (di memori proses); login di-rate-limit 5 gagal / 10 menit per IP.

### Frontend

1. Isi `.env` root **sebelum build** (nilainya di-bake ke `dist/`):
   `VITE_API_BASE_URL=https://<api-domain>/api` — kosongkan bila ingin situs
   berjalan murni dengan data dummy.
2. ```bash
   npm install
   npm test && npx tsc -b --noEmit   # gerbang wajib lulus dulu
   npm run build                     # hasil ke dist/
   ```
3. Salin isi `dist/` ke web server statis. **Path dasar** saat ini
   `/coding/Web-AI-Center/` (konstanta `BASE` di `vite.config.ts`) — bila deploy
   di root/subfolder lain, ubah `BASE` **dan** path preload hero di `index.html`
   (`l.href` + `imagesrcset`), lalu build ulang. Untuk rute SPA di Nginx: tambah
   fallback `try_files $uri /coding/Web-AI-Center/index.html`.
4. Setelah domain fix: isi `VITE_SITE_URL`, daftarkan sitemap di
   `public/robots.txt`, ukur ulang Lighthouse terhadap build hasil deploy.

Catatan: CORS backend **hanya** menerima origin terdaftar di `CORS_ORIGIN` — lupa
mengisi membuat fetch frontend ditolak (halaman tetap tampil, tapi dengan data
dummy, jadi gampang tidak ketahuan; cek tab Network saat verifikasi).

### Checklist sebelum final

- [ ] Gerbang: `npm test` → `npx tsc -b --noEmit` → `npm run build`; di `server/`:
      `bun run typecheck` + `bun test`
- [ ] Lighthouse terhadap build produksi (`npm run preview`) — semua skor ≥ 90
- [ ] Backend sehat: `GET :3000/api/health` → `{"status":"ok","db":"ok"}`
- [ ] Demo: `http://localhost:5173/coding/Web-AI-Center/beranda` + login `/admin`
      memakai `ADMIN_PASSWORD` dari `server/.env`
- [ ] Repo bersih: `git status -sb` tidak ada perubahan menggantung

## Backend `server/` (baru)

API **baca publik + tulis admin** — Bun + Elysia + Drizzle ORM + PostgreSQL. Dev
lokal tidak butuh
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

Cakupan test backend: 14 dari 15 unit logika punya `*.test.ts` di sebelah file
yang diuji. Pengecualian sadar: `server/src/repositories/drizzle.ts` (lapisan SQL)
— mengujinya butuh database, sementara aturan kerja melarang test integration;
lapisan ini diverifikasi lewat E2E manual tiap putaran (curl + browser), sedangkan
kontrak di atasnya diuji dengan fake repository (`app.test.ts`) plus
`schema`/`mappers`/`seed` yang punya test sendiri.

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
| `GET /api/kursus` · `/api/kursus/:kode` | `q`, `page`, `limit` | `{ items }` / 404; kode case-insensitive (`r01`) |
| `GET /api/hero-slides` · `/api/klien` · `/api/testimoni` | — | `{ items }` |
| `GET /api/profil` | — | Tentang Kami + kontak footer; 404 bila belum di-seed |
| `GET /api/inference` | — | konten halaman Inference; 404 bila belum di-seed |
| `POST /api/admin/login` | body `{ password }` | rate-limit 5 gagal / 10 menit per IP → 429; balikan `{ token }` |
| `POST` · `PUT` · `DELETE /api/dokumentasi[/:slug]` | — | butuh `Authorization: Bearer <token>`; 400/404/409 eksplisit |
| `POST` · `PUT` · `DELETE /api/berita[/:slug]` | — | idem; slug dibuat server dari judul |
| `POST` · `PUT` · `DELETE /api/kursus[/:kode]` | — | idem; `kode` jadi kunci unik |
| `PUT /api/profil` | — | profil baris tunggal (id = 1); kolom `statistik` dipertahankan |
| `PUT /api/inference` | — | konten halaman inference (id = 1); wajib ≥1 item tiap daftar |
| `POST` · `PUT` · `DELETE /api/tim[/:id]` | — | kunci `id` numerik; `urutan` = posisi tampil |
| `POST` · `PUT` · `DELETE /api/testimoni[/:id]` | — | idem (tab Testimoni di `/admin`); `kutipan` ≤ 1000 |
| `POST` · `PUT` · `DELETE /api/hero-slides[/:id]` | — | idem (tab Hero); `layout` hanya `default`/`image-left`/`teks-kanan` |
| `POST /api/admin/upload` | multipart `gambar` | file ≤ 2 MB (jpg/png/webp) → `{ url }` `/uploads/<nama>` |
| `POST /api/admin/uploads/bersihkan` | `{ kering? }` | hapus file unggahan yang tidak dirujuk kolom manapun (gambar tidak terpakai); `kering: true` = mode uji |

Semua field teks punya batas panjang di `server/src/lib/tulis.ts` (Prioritas 2) —
body yang lewat batas ditolak 400 dengan pesan menyebut field + batasnya.

CORS: whitelist origin lewat `CORS_ORIGIN` (default `http://localhost:5173`).

### Status integrasi frontend

Sudah terintegrasi lewat `src/lib/useApiData.ts` (`useApiDaftar`/`useApiObjek`) —
setiap halaman selalu punya fallback data dummy bila `VITE_API_BASE_URL` kosong,
backend mati, respons gagal, atau saat unit test:

- Beranda: hero, layanan, testimoni, highlight berita & dokumentasi
- `/berita` + `/berita/:slug`, `/dokumentasi` + `/:slug`, `/tim`
- `/layanan/:slug`, katalog kursus + detail (`/api/kursus`, `/api/kursus/:kode`);
  konten inference (panel "Apa itu", kebutuhan, alur, contoh) dari `GET /api/inference`
- `/tentang-kami` visi/misi (`GET /api/profil` → pemetaan `petakanProfilApi`)

Kontak footer/WA **sengaja statis** dari situs lama (nomor + pesan persis link
`wa.me` di sana) — bukan bagian dari integrasi backend, lihat `src/data/kontak.ts`.

Masih `TODO_BACKEND` (sadar — menunggu keputusan, bukan lupa):

- video lesson + progress LMS per peserta — butuh konten video & akun peserta
- section Our Client — endpoint `/api/klien` sudah siap, section dikomentari (rapat)

CRUD admin sudah lengkap (Prioritas 2): dokumentasi, berita, kursus — lalu
**profil** (`PUT /api/profil` + tab Profil di `/admin`) dan **tim**
(CRUD `/api/tim` + tab Tim), batas panjang semua field teks, serta pembersih
file gambar tidak terpakai (`POST /api/admin/uploads/bersihkan` + tombol
"Bersihkan gambar tidak terpakai" di dashboard admin). Lanjutannya: konten halaman **Inference**
(`GET`/`PUT /api/inference` + tab Inference di `/admin`) kini ikut dikelola
lewat database, bukan lagi hardcode; **testimoni** & **slide hero** juga bisa
diedit dari `/admin` (tab Testimoni & Hero, CRUD `id` + `urutan`) — jadi semua
konten yang tampil di beranda dikelola lewat CMS. Yang sengaja TIDAK diedit:
layanan (copy disetujui rapat) dan klien (section Our Client dikomentari).

Catatan khusus tab Hero: memilih file gambar baru mengosongkan `srcSet`
otomatis (varian lama menunjuk file lain — kalau dibiarkan, slide tetap tampil
gambar lama), dan tombol Hapus dinonaktifkan saat tersisa 1 slide (hero
beranda jadi kosong). `srcSet` juga ikut dihitung oleh pembersih gambar tidak terpakai.

## Ringkasan pengerjaan

1. Scaffold Vite React-TS + Tailwind + motion + Vitest + router; desain diadaptasi dari rapat sebelumnya.
2. Komponen reusable: layout header/footer (logo Ubaya → AI Center, dropdown Konten), hero carousel + client carousel otomatis (dots, jeda saat hover/fokus, hormat reduced-motion), slider testimoni, card berita/dokumentasi/tim dengan slot gambar.
3. Data dummy bertanda backend untuk hero, berita, dokumentasi, tim, klien, testimoni.
4. Optimasi Lighthouse hingga desktop 100/100/100/100 dan mobile 95/100/100/100 (robots.txt, dimensi gambar, target sentuh, kompresi + WebP responsif, code-splitting route, preload LCP).
5. Keputusan rapat 16 Sept: layanan tinggal 2 (Pelatihan + Inference Solution), Our Client dikomentari (kode dipertahankan), testimoni naik ke posisi Our Client dengan background `bg-soft`, kontak footer/Tentang Kami disentralisasi di `src/data/kontak.ts` (email `aicenter@unit.ubaya.ac.id`, WA 0895-6342-22240, website LPPM).
6. Unit test: frontend **238 test / 30 file** (lib, data, komponen, halaman, routing); backend **86 test**. `tsc` bersih di dua sisi.
7. Integrasi frontend↔backend: tabel + route `GET /api/kursus` (+ migrasi `0001`), lapisan `src/lib/api.ts` + hook `useApiData`, wiring semua halaman konten; seed disinkronkan dengan data frontend (tim 6 anggota, teks layanan, gambar hero).
8. Prioritas 2 (CRUD profil & tim, batas panjang field, pembersih gambar tidak terpakai) lalu konten halaman **Inference** pindah ke CMS: tabel `inference` (+ migrasi `0003`), `GET`/`PUT /api/inference`, tab Inference di `/admin`, dan `LayananDetail` memakai `useApiObjek('/inference', …)`.
9. Lengkapi CRUD admin: **testimoni** & **slide hero** (`POST`/`PUT`/`DELETE /api/testimoni[/:id]` dan `/api/hero-slides[/:id]`, tab Testimoni & Hero di `/admin`) — `id` & `urutan` ikut kontrak respons `GET`-nya, lalu `referensiGambar` juga membaca `image`/`srcSet` hero supaya pembersih gambar tidak terpakai tidak menghapus varian slide. Istilah "gambar yatim" diganti jadi **"gambar tidak terpakai"** (UI, kode: `lib/orphanUpload.ts` + `findOrphanUploads`, dan README). Gerbang saat ini: frontend **381 test / 36 file**, backend **221 test / 14 file**, `tsc` bersih di dua sisi + build produksi OK.
10. Audit backend terhadap 10 aturan kerja (`docs/prompt-persiapan-opencode.md`) — semua
    terpenuhi kecuali dua keputusan sadar yang dicatat di README ini: file test
    ikut repo, dan `drizzle.ts` tanpa unit test. Lalu putaran persiapan final:
    `UPLOAD_DIR` didokumentasikan di `server/.env.example`, penanda
    `TODO_BACKEND` di `robots.txt` diganti catatan deploy (penanda hanya untuk
    bagian yang butuh backend), `VITE_SITE_URL` dijelaskan fungsinya, serta
    section **Deployment (produksi)** + checklist sebelum final di README.

### Penanda TODO

- `TODO_BACKEND` — bagian yang sengaja belum diintegrasikan + alasannya (lihat "Status integrasi frontend").
- `TODO_ASSET` — file aset perlu diganti/ditambah di `public/`.
- `TODO_KONTEN` — teks menyusul dari dokumen resmi (mis. visi/misi dari PDF rapat 16 Sept 2026).
