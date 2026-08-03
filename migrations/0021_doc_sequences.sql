-- Per-garage sequential document counters (ZATCA-friendly numbering).
CREATE TABLE IF NOT EXISTS "doc_sequences" (
  "garage_id" uuid NOT NULL,
  "doc_type" varchar(30) NOT NULL,
  "next_value" bigint DEFAULT 0 NOT NULL,
  CONSTRAINT "doc_sequences_garage_id_doc_type_pk" PRIMARY KEY ("garage_id", "doc_type")
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "doc_sequences" ADD CONSTRAINT "doc_sequences_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "garages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
