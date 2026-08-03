-- Marketplace: customer bookings with providers (service + optional vehicle).
CREATE TABLE IF NOT EXISTS "marketplace_bookings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" varchar NOT NULL,
  "provider_id" uuid NOT NULL,
  "service_template_id" uuid,
  "customer_vehicle_id" uuid,
  "service_name" varchar(255),
  "vehicle_make" varchar(100),
  "vehicle_model" varchar(100),
  "vehicle_year" integer,
  "vehicle_plate" varchar(50),
  "preferred_date" timestamp,
  "notes" text,
  "status" varchar(20) DEFAULT 'requested' NOT NULL,
  "provider_notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "marketplace_bookings" ADD CONSTRAINT "marketplace_bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "marketplace_bookings" ADD CONSTRAINT "marketplace_bookings_provider_id_garages_id_fk" FOREIGN KEY ("provider_id") REFERENCES "garages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "marketplace_bookings" ADD CONSTRAINT "marketplace_bookings_service_template_id_service_templates_id_fk" FOREIGN KEY ("service_template_id") REFERENCES "service_templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "marketplace_bookings" ADD CONSTRAINT "marketplace_bookings_customer_vehicle_id_customer_vehicles_id_fk" FOREIGN KEY ("customer_vehicle_id") REFERENCES "customer_vehicles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "marketplace_bookings_customer_idx" ON "marketplace_bookings" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "marketplace_bookings_provider_idx" ON "marketplace_bookings" ("provider_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "marketplace_bookings_status_idx" ON "marketplace_bookings" ("status");
