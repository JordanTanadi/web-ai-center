# Data asli kursus — template isian (TODO_KONTEN)

Teks kursus (judul, deskripsi, modul, hasil) **migrasi dari situs lama**
(`pelatihan.html` + `detail-kursus.html`) — copy-nya asli milik web Ubaya, tapi
banyak detail adalah **placeholder** yang perlu Anda konfirmasi. Isi kolom
"Diisi dengan" di bawah (tulis langsung di file ini atau kirim lewat chat);
saya yang memperbarui `src/data/pelatihan.ts` + seed database + fallback.

Saat ini di kode:

- Level & format **"Pemula"/"Online mandiri" untuk semua kursus** (dari default
  situs lama — kemungkinan bukan kondisi sebenarnya)
- Instruktur berupa **tim generik** ("Tim Riset Ubaya AI Center", inisial RA),
  bukan nama dosen/penyelenggara asli
- Sidebar detail kursus menampilkan **"Sertifikat: Tersedia"** — belum ada
  sistem sertifikat di web; konfirmasi apakah program aslinya memberi sertifikat
- Meta modul ("4 video · 35 menit") adalah **teks**; video & kuis per modul
  **belum ada isinya** (sistemnya sudah saya siapkan — tinggal isi)

## Cara mengisi

1. **Masih berjalan?** — ya / tidak (kalau tidak: kita hapus dari katalog).
2. **Level** — Pemula / Menengah / Lanjutan (atau teks lain).
3. **Format** — mis. "Tatap muka", "Online mandiri", "Hybrid".
4. **Durasi** — jumlah sesi + jam total bila diketahui (mis. "4 sesi · 3 jam").
5. **Instruktur** — nama asli + peran + inisial huruf (untuk avatar).
6. **Sertifikat** — ya/tidak.
7. **Video per modul** — unggah ke YouTube (boleh unlisted) lalu tempel URL-nya;
   kosongkan bila belum ada (tampil penanda "video menyusul").
8. **Kuis per modul** — minimal 1 pertanyaan: rumuskan 2–4 opsi + tandai jawaban
   benar; kosongkan bila belum ada (checkpoint dummy tetap tampil).

## R01 — AI untuk Mencari dan Mengelola Referensi Jurnal

| Field | Sekarang | Diisi dengan |
|---|---|---|
| Masih berjalan? | (asumsi: ya) | |
| Level | Pemula | |
| Format | Online mandiri | |
| Durasi | 4 sesi | |
| Instruktur | Tim Riset Ubaya AI Center (RA) | |
| Sertifikat | sidebar: "Tersedia" | |

Modul (isi video URL + kuis per baris; kosongkan bila belum ada):

| # | Modul | URL video | Kuis (pertanyaan · opsi · jawaban benar) |
|---|---|---|---|
| 1 | Merumuskan pertanyaan dan kata kunci riset (4 video · 35 menit) | | |
| 2 | Mencari jurnal ilmiah dengan Semantic Scholar (5 video · 48 menit) | | |
| 3 | Menguji relevansi dengan Consensus dan Elicit (4 video · 42 menit) | | |
| 4 | Meringkas jurnal dan mengelola sitasi (5 video · 55 menit) | | |

## E01 — Merancang Pembelajaran dengan AI

| Field | Sekarang | Diisi dengan |
|---|---|---|
| Masih berjalan? | (asumsi: ya) | |
| Level | Pemula | |
| Format | Online mandiri | |
| Durasi | 3 sesi | |
| Instruktur | Tim Edukasi Ubaya AI Center (ED) | |
| Sertifikat | sidebar: "Tersedia" | |

| # | Modul | URL video | Kuis |
|---|---|---|---|
| 1 | Memetakan kebutuhan belajar dan tujuan kelas (4 video · 35 menit) | | |
| 2 | Menyusun materi serta aktivitas pembelajaran (5 video · 45 menit) | | |
| 3 | Membuat asesmen dan rubrik dengan AI (4 video · 40 menit) | | |

## P01 — Produktivitas Akademik dengan AI

| Field | Sekarang | Diisi dengan |
|---|---|---|
| Masih berjalan? | (asumsi: ya) | |
| Level | Pemula | |
| Format | Online mandiri | |
| Durasi | 3 sesi | |
| Instruktur | Tim Talenta Ubaya AI Center (TA) | |
| Sertifikat | sidebar: "Tersedia" | |

| # | Modul | URL video | Kuis |
|---|---|---|---|
| 1 | Brainstorming dan perencanaan tugas (4 video · 32 menit) | | |
| 2 | Menulis, menyunting, dan memeriksa ide (5 video · 46 menit) | | |
| 3 | Menganalisis data dan menyajikan temuan (4 video · 43 menit) | | |

## Kursus tambahan (kalau ada)

Daftar program lain yang ditawarkan AI Center (baru/belum tampil di web):

| Kode (opsional) | Judul | Target | Durasi | Instruktur | Modul |
|---|---|---|---|---|---|
| | | | | | |

> Kode kursus bisa dikosongkan — sistem menghitung sendiri (prefiks M/D/G/U dari
> target peserta + nomor berikutnya) saat Anda simpan lewat tab **Kursus** di
> `/admin`.
