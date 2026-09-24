CREATE TABLE "berita" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"judul" text NOT NULL,
	"ringkasan" text NOT NULL,
	"isi" text NOT NULL,
	"tanggal" date NOT NULL,
	"gambar" text,
	"penulis" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "berita_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dokumentasi" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"judul" text NOT NULL,
	"deskripsi" text NOT NULL,
	"tanggal" date NOT NULL,
	"kategori" text NOT NULL,
	"gambar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dokumentasi_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hero_slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"eyebrow" text NOT NULL,
	"judul" text NOT NULL,
	"judul_aksen" text NOT NULL,
	"sub" text NOT NULL,
	"cta_primer" jsonb NOT NULL,
	"cta_sekunder" jsonb NOT NULL,
	"badge_judul" text NOT NULL,
	"badge_sub" text NOT NULL,
	"image" text,
	"src_set" text,
	"sizes" text
);
--> statement-breakpoint
CREATE TABLE "klien" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"bidang" text NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "layanan" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nama" text NOT NULL,
	"tagline" text NOT NULL,
	"deskripsi" text NOT NULL,
	"fitur" jsonb NOT NULL,
	CONSTRAINT "layanan_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "profil" (
	"id" integer PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"tagline" text NOT NULL,
	"ringkasan" text NOT NULL,
	"alamat" text NOT NULL,
	"email" text NOT NULL,
	"telepon" text NOT NULL,
	"visi" text,
	"misi" text,
	"statistik" jsonb
);
--> statement-breakpoint
CREATE TABLE "testimoni" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"peran" text NOT NULL,
	"kutipan" text NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tim" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"peran" text NOT NULL,
	"kredensial" text,
	"foto" text,
	"urutan" integer DEFAULT 0 NOT NULL
);
