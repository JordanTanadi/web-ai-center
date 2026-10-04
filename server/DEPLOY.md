# Checklist Deploy — AI Center Ubaya

Langkah menyalakan aplikasi di server produksi. Semua nilai contoh = **DUMMY** —
isi dengan milik Anda sendiri, dan **jangan pernah** menaruh kredensial asli di
`.env.example` atau di repo.

## 1. Siapkan PostgreSQL

- Buat database (mis. `ai_center`) + user khusus dengan password kuat.
- Catat URL koneksi: `postgres://USER:PASSWORD@HOST:5432/ai_center`

## 2. Environment backend (folder `server/`)

Salin `.env.example` → `.env` lalu isi:

| Variabel | Contoh (DUMMY) | Keterangan |
| --- | --- | --- |
| `PORT` | `3000` | Port HTTP backend. |
| `DATABASE_URL` | `postgres://user:pass@host:5432/ai_center` | **WAJIB** di produksi. Tanpa ini backend memakai PGlite (dev). |
| `CORS_ORIGIN` | `https://domain-anda.com` | Origin frontend yang diizinkan, dipisah koma. |
| `ADMIN_PASSWORD` | `ganti-dengan-password-kuat` | Login dashboard `/admin`. Jangan pakai fallback `admin-dev`. |

Aturan: `.env` di-gitignore (tidak ikut ter-commit).

## 3. Migrasi + seed (sekali di awal)

```bash
cd server
bun run db:migrate   # terapkan 3 file migrasi skema
bun run db:seed      # HATI-HATI: menghapus SEMUA isi tabel lama
```

`db:seed` hanya untuk **setup awal / reset total**. Setelah ada konten yang
diubah lewat dashboard admin, **jangan** dijalankan lagi — konten admin ikut
hilang.

## 4. Jalankan backend

```bash
cd server
bun install
bun run start
```

- Folder `uploads/` (gambar hasil upload admin) harus **persisten** — jangan di
  path yang dibersihkan otomatis.
- Cek sehat: `GET /api/health` → `200 {"status":"ok","db":"ok"}`.
  Bila `503 {"error":"Database tidak terjangkau"}` → `DATABASE_URL` /
  jaringan DB bermasalah.

## 5. Frontend

- Set `VITE_API_BASE_URL` = root API termasuk `/api`
  (mis. `https://api.domain.com/api`) di env build frontend.
- `npm run build` → arsip `dist/` diserve oleh web server (nginx/hostpanel).
- Tambahkan origin frontend (mis. `https://domain-anda.com`) ke `CORS_ORIGIN`
  backend.

## 6. Smoke test setelah online

- [ ] `GET /api/health` → `200 {"status":"ok","db":"ok"}`
- [ ] Halaman beranda menampilkan data asli (bukan salinan "(data dummy)")
- [ ] Login `/admin` dengan password produksi → sukses
- [ ] Login salah 5× berturut → `429` + header `Retry-After` (rate-limit aktif)
- [ ] Tambah/hapus konten lewat admin → tampil di halaman publik
- [ ] Upload gambar lewat admin → muncul di halaman publik
