-- Unified multi-gateway payment layer: add nullable gateway columns to payments.
-- Idempotent (IF NOT EXISTS) so it is safe to re-run.
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "gateway" varchar(30);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "method_type" varchar(30);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'completed';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "currency" varchar(3) DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "gateway_transaction_id" varchar(255);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "gateway_reference" varchar(255);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "processing_fee" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "failure_reason" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "gateway_metadata" jsonb;
