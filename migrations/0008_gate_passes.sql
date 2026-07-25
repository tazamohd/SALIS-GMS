-- Gate passes: a QR/short-code a customer shows to collect their vehicle once
-- the invoice is paid; gate staff scan it to verify and release.
CREATE TABLE IF NOT EXISTS "gate_passes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "garage_id" uuid REFERENCES "garages"("id"),
  "customer_id" varchar,
  "vehicle_id" uuid,
  "pass_code" varchar(20) NOT NULL UNIQUE,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "issued_by" varchar,
  "issued_at" timestamp NOT NULL DEFAULT now(),
  "expires_at" timestamp,
  "used_at" timestamp,
  "used_by" varchar,
  "notes" text
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gate_passes_invoice" ON "gate_passes" ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gate_passes_code" ON "gate_passes" ("pass_code");
