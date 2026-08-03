-- Platform SuperAdmin: garage onboarding applications (self-register -> approve).
CREATE TABLE IF NOT EXISTS "garage_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_name" varchar(255) NOT NULL,
  "owner_name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(50),
  "city" varchar(100),
  "country" varchar(100),
  "requested_plan" varchar(20) DEFAULT 'STARTER' NOT NULL,
  "notes" text,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "reviewed_by" varchar,
  "reviewed_at" timestamp,
  "rejection_reason" text,
  "provisioned_garage_id" uuid,
  "provisioned_user_id" varchar,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "garage_applications" ADD CONSTRAINT "garage_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "garage_applications" ADD CONSTRAINT "garage_applications_provisioned_garage_id_garages_id_fk" FOREIGN KEY ("provisioned_garage_id") REFERENCES "garages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "garage_applications" ADD CONSTRAINT "garage_applications_provisioned_user_id_users_id_fk" FOREIGN KEY ("provisioned_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "garage_applications_status_idx" ON "garage_applications" ("status");
