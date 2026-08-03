-- Marketplace: provider offerings (products for parts stores, plans for insurers).
CREATE TABLE IF NOT EXISTS "provider_offerings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider_id" uuid NOT NULL,
  "kind" varchar(20) DEFAULT 'service' NOT NULL,
  "name" varchar(255) NOT NULL,
  "category" varchar(100),
  "description" text,
  "price" numeric(10, 2),
  "currency" varchar(10) DEFAULT 'SAR',
  "attributes" jsonb,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "provider_offerings" ADD CONSTRAINT "provider_offerings_provider_id_garages_id_fk" FOREIGN KEY ("provider_id") REFERENCES "garages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_offerings_provider_idx" ON "provider_offerings" ("provider_id");
