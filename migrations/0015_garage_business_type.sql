-- Marketplace: generalize the business/tenant root to all provider kinds.
ALTER TABLE "garages" ADD COLUMN IF NOT EXISTS "business_type" varchar(30) DEFAULT 'garage' NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "garages_business_type_idx" ON "garages" ("business_type");
