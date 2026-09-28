CREATE TABLE "kursus" (
	"id" serial PRIMARY KEY NOT NULL,
	"kode" text NOT NULL,
	"target" jsonb NOT NULL,
	"judul" text NOT NULL,
	"deskripsi" text NOT NULL,
	"tentang" text NOT NULL,
	"durasi" text NOT NULL,
	"level" text NOT NULL,
	"format" text NOT NULL,
	"instruktur" text NOT NULL,
	"peran" text NOT NULL,
	"inisial" text NOT NULL,
	"hasil" jsonb NOT NULL,
	"modul" jsonb NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "kursus_kode_unique" UNIQUE("kode")
);
