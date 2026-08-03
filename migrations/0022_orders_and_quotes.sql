-- Marketplace C2: product orders (parts stores) + insurance-quote requests.
CREATE TABLE IF NOT EXISTS "provider_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" varchar NOT NULL,
  "provider_id" uuid NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "total_amount" numeric(10, 2) DEFAULT 0 NOT NULL,
  "currency" varchar(10) DEFAULT 'SAR' NOT NULL,
  "notes" text,
  "provider_notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "provider_order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "offering_id" uuid,
  "name" varchar(255) NOT NULL,
  "unit_price" numeric(10, 2) DEFAULT 0 NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insurance_quotes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" varchar NOT NULL,
  "provider_id" uuid NOT NULL,
  "offering_id" uuid,
  "plan_name" varchar(255),
  "customer_vehicle_id" uuid,
  "vehicle_make" varchar(100),
  "vehicle_model" varchar(100),
  "vehicle_year" integer,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "quoted_premium" numeric(10, 2),
  "currency" varchar(10) DEFAULT 'SAR' NOT NULL,
  "quote_notes" text,
  "valid_until" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "provider_orders" ADD CONSTRAINT "provider_orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "provider_orders" ADD CONSTRAINT "provider_orders_provider_id_garages_id_fk" FOREIGN KEY ("provider_id") REFERENCES "garages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "provider_order_items" ADD CONSTRAINT "provider_order_items_order_id_provider_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "provider_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "provider_order_items" ADD CONSTRAINT "provider_order_items_offering_id_provider_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "provider_offerings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "insurance_quotes" ADD CONSTRAINT "insurance_quotes_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "insurance_quotes" ADD CONSTRAINT "insurance_quotes_provider_id_garages_id_fk" FOREIGN KEY ("provider_id") REFERENCES "garages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "insurance_quotes" ADD CONSTRAINT "insurance_quotes_offering_id_provider_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "provider_offerings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "insurance_quotes" ADD CONSTRAINT "insurance_quotes_customer_vehicle_id_customer_vehicles_id_fk" FOREIGN KEY ("customer_vehicle_id") REFERENCES "customer_vehicles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_orders_customer_idx" ON "provider_orders" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_orders_provider_idx" ON "provider_orders" ("provider_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insurance_quotes_customer_idx" ON "insurance_quotes" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insurance_quotes_provider_idx" ON "insurance_quotes" ("provider_id");
