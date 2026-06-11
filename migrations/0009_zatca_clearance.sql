-- ZATCA Phase 2 (Fatoora) e-invoicing clearance tracking columns on invoices.
-- Idempotent (IF NOT EXISTS) so it is safe to re-run.
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "zatca_clearance_status" varchar(20);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "zatca_clearance_id" varchar(100);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "zatca_invoice_hash" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "zatca_qr_code" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "zatca_cleared_at" timestamp;
