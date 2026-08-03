-- C3: public provider profiles + customer reviews.
ALTER TABLE "garages" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN IF NOT EXISTS "phone" varchar(50);
--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN IF NOT EXISTS "email" varchar(255);
--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN IF NOT EXISTS "address" text;
--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN IF NOT EXISTS "photo_url" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "provider_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider_id" uuid NOT NULL,
  "customer_id" varchar NOT NULL,
  "rating" integer NOT NULL,
  "comment" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_provider_id_garages_id_fk" FOREIGN KEY ("provider_id") REFERENCES "garages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "provider_reviews_provider_customer_unique" ON "provider_reviews" ("provider_id", "customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_reviews_provider_idx" ON "provider_reviews" ("provider_id");
