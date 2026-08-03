-- Marketplace: a platform customer's own (garage-agnostic) vehicles.
CREATE TABLE IF NOT EXISTS "customer_vehicles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" varchar NOT NULL,
  "make" varchar(100) NOT NULL,
  "model" varchar(100),
  "year" integer,
  "vin" varchar(100),
  "license_plate" varchar(50),
  "color" varchar(50),
  "mileage" integer,
  "engine_type" varchar(100),
  "transmission_type" varchar(50),
  "insurance_provider" varchar(255),
  "insurance_policy_number" varchar(100),
  "insurance_expiry" timestamp,
  "license_doc_url" text,
  "insurance_doc_url" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "customer_vehicles" ADD CONSTRAINT "customer_vehicles_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_vehicles_customer_idx" ON "customer_vehicles" ("customer_id");
