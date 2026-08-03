-- Automated business verification + provider generalization for onboarding.
ALTER TABLE "garage_applications" ADD COLUMN IF NOT EXISTS "provider_type" varchar(30) DEFAULT 'garage' NOT NULL;
--> statement-breakpoint
ALTER TABLE "garage_applications" ADD COLUMN IF NOT EXISTS "tax_number" varchar(20);
--> statement-breakpoint
ALTER TABLE "garage_applications" ADD COLUMN IF NOT EXISTS "commercial_registration" varchar(20);
--> statement-breakpoint
ALTER TABLE "garage_applications" ADD COLUMN IF NOT EXISTS "is_demo" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "garage_applications" ADD COLUMN IF NOT EXISTS "verification_status" varchar(20) DEFAULT 'unverified' NOT NULL;
--> statement-breakpoint
ALTER TABLE "garage_applications" ADD COLUMN IF NOT EXISTS "verification_details" jsonb;
--> statement-breakpoint
ALTER TABLE "garage_applications" ADD COLUMN IF NOT EXISTS "auto_approved" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "garage_applications" ADD COLUMN IF NOT EXISTS "owner_password_hash" varchar(255);
