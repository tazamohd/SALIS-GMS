-- Platform SuperAdmin: garage subscription change requests (review + approve).
CREATE TABLE IF NOT EXISTS "subscription_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "garage_id" uuid NOT NULL,
  "current_plan" varchar(20),
  "requested_plan" varchar(20) NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "requested_by" varchar,
  "reviewed_by" varchar,
  "reviewed_at" timestamp,
  "rejection_reason" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "garages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_requests_status_idx" ON "subscription_requests" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_requests_garage_idx" ON "subscription_requests" ("garage_id");
