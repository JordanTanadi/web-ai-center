CREATE TABLE "inference" (
	"id" integer PRIMARY KEY NOT NULL,
	"judul_apa_itu" text NOT NULL,
	"deskripsi_apa_itu" text NOT NULL,
	"kebutuhan" jsonb NOT NULL,
	"alur" jsonb NOT NULL,
	"contoh_intro" text NOT NULL,
	"contoh" jsonb NOT NULL
);
