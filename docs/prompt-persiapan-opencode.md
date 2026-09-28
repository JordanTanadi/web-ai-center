# Prompt Awal Persiapan Opencode

Dokumen ini **rekonstruksi** dari riwayat sesi kerja proyek Web AI Center Ubaya
(disusun 28 September 2026). Prompt asli tidak tersimpan di disk, jadi teks di
bawah disusun ulang mendekati urutan kerja yang benar-benar dijalankan —
silakan koreksi/tambahkan bila menyimpan teks aslinya.

**Cara pakai:** tempel blok prompt ke sesi opencode baru sesuai tahap yang mau
dilanjutkan. Bagian 0 (aturan kerja) wajib disertakan di setiap prompt.

---

## 0. Aturan kerja — selalu ikut di setiap prompt

```
Aturan kerja proyek Web-AI-Center (wajib dipatuhi):
1. Unit test kecil wajib per unit dan harus pass sebelum lanjut ke tahap berikutnya
   (frontend: npm test / vitest; backend: bun test). Tanpa integration/e2e test.
2. Tidak ada secret/kredensial asli di kode, test, atau .env.example — nilai dummy
   saja; file .env lokal di-gitignore.
3. Jangan ubah struktur folder yang sudah ada tanpa konfirmasi; test baru ditaruh
   sebelah file yang diuji; file *.test.ts(x) tetap di-gitignore (lokal saja).
4. Identifier kode Bahasa Inggris (kecuali nama yang sudah ada konsisten),
   komentar Bahasa Indonesia; error handling eksplisit; hindari dependency baru
   tanpa alasan jelas.
5. Penanda TODO_BACKEND hanya untuk bagian yang benar-benar butuh backend, lengkap
   dengan alasannya; data dummy dulu; teks "(data dummy)" tidak boleh tampil di UI.
6. WordPress dilarang — nol referensi WordPress di kode baru.
7. Konten lama/LPPM yang belum ada di web baru harus ditanyakan dulu sebelum diterapkan.
8. Pesan WhatsApp & output model dummy tetap Bahasa Indonesia (i18n v1); data dinamis
   tanpa entri kamus tampil apa adanya.
9. Layout mengikuti Figma: paragraf/header center (kecuali artikel panjang & hero → kiri);
   mobile = burger, desktop = navbar (fine-pointer).
10. Sebelum lapor selesai: jalankan npm test, npx tsc -b --noEmit, npm run build
    (di workdir repo, bukan folder induk).
```

---

## 1. Orientasi proyek & verifikasi stack

```
Kenali dulu proyek ini sebelum mengubah apa pun: baca README.md, package.json,
struktur src/, dan server/. Laporkan: tech stack, cara menjalankan dev/test/build,
halaman yang ada, penanda TODO di kode, dan bagian mana yang masih data dummy.
Jangan mengubah file apa pun pada tahap ini.
```

## 2. Audit UI terhadap Web Design Guidelines

```
Audit seluruh halaman frontend terhadap skill web-design-guidelines
(aksesibilitas, kontras warna, ukuran target sentuh, struktur heading, label form).
Daftarkan temuan per halaman beserta file:baris, urutkan dari yang paling berdampak,
lalu terapkan perbaikan satu per satu dengan unit test yang relevan tetap pass.
```

## 3. Terapkan keputusan rapat 16 September 2026

```
Terapkan keputusan rapat ke kode (identifikasi dulu file terkait, baru ubah):
- Layanan tinggal 2: Pelatihan + Inference Solution (hapus/hide GPU Rental).
- Section "Our Client" dikomentari — KODE DIPERTAHANKAN, jangan dihapus.
- Testimoni naik ke posisi Our Client; sesuaikan background section.
- Lengkapi footer & deskripsi sesuai web LPPM; visi-misi "Tentang Kami" = dokumen resmi.
- Warna & font persis Figma: brand #2547F4, brand-bright #0674FD, navy #0A2240,
  soft #FAF7F0, sky #D8EBF8, yellow #F3D502; font self-host di public/fonts/.
Jalankan npm test + tsc + build setelah selesai. (Sebagian keputusan ternyata sudah
diterapkan sebelumnya — verifikasi dulu, jangan ulangi kerja.)
```

## 4. Migrasi konten situs lama → data dummy

```
Migrasikan konten dari situs lama lokal (folder ubaya-ai-center) ke struktur data
baru di src/data/: pelatihan.html + detail-kursus.html → pelatihan.ts, portofolio,
fasilitas, inference, berita, dokumentasi. Semua jadi array dummy berinterface TS
dengan penanda TODO_BACKEND beserta endpoint yang diharapkan (mis. GET /api/berita).
Copy "(data dummy)" tidak boleh tampil. Test data per file (validasi field + edge case).
```

## 5. Setup backend read-only

```
Siapkan backend di server/: Bun + Elysia + Drizzle ORM + PostgreSQL, API baca saja
(contract { items: T[] }, detail → 404 { error }). Dev lokal cukup PGlite
(kosongkan DATABASE_URL, data di server/.pglite/ yang di-gitignore). Sertakan:
schema tabel per interface frontend, repository + mapper, route, migrasi SQL
(drizzle-kit generate), seed yang MENYALIN data dummy frontend, CORS whitelist origin
5173, dan unit test per unit (route dengan fake repository, tanpa DB). bun test wajib pass.
```

## 6. Integrasi frontend ↔ backend

```
Integrasikan frontend ke backend secara bertahap:
1. Tambah tabel/route yang belum ada (kursus: GET /api/kursus + /:kode case-insensitive).
2. Buat lapisan fetch di src/lib/api.ts (VITE_API_BASE_URL, validasi bentuk respons,
   console.error eksplisit, SELALU fallback ke data dummy) + hook useApiDaftar/useApiObjek.
3. Ganti pemakaian data dummy di halaman satu per satu (kandidat duluan: endpoint yang
   routes-nya sudah ada). Mode test tidak boleh pernah fetch agar unit test deterministik.
4. Sinkronkan seed dengan data frontend supaya tampilan tidak berubah saat integrasi menyala.
Verifikasi: npm test, tsc, build, lalu uji di browser (resource timing → request ke :3000).
```

## 7. Uji Lighthouse & SEO

```
Ukur dengan Lighthouse terhadap build produksi (npm run build && npm run preview),
bukan dev server. Fokus SEO + accessibility + best practices; catat artefak JSON di
lighthouse_report/. Optimasi sesuai temuan (meta description, robots, preload LCP,
dimensi gambar) tanpa mengubah desain.
```

## 8. Verifikasi visual ke Figma (butuh akses)

```
Bandingkan hasil render tiap halaman dengan frame Figma (benchmark Angel).
Butuh: akses link Figma ATAU screenshot di jendela browser. Laporkan selisih
layout/spacing/warna per halaman sebelum mengubah CSS — jangan ubah layout tanpa
daftar selisih yang dikonfirmasi.
```
