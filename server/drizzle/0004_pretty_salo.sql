CREATE TABLE "progress_pembelajaran" (
	"peserta_id" text NOT NULL,
	"kode" text NOT NULL,
	"state" jsonb NOT NULL,
	"diperbarui_pada" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "progress_pembelajaran_peserta_id_kode_pk" PRIMARY KEY("peserta_id","kode")
);
