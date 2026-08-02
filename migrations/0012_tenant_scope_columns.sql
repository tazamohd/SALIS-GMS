-- Tenant-scope the structurally tenant-less tables (deep-audit blocker B5).
-- These tables had no garage_id, so every list over them returned all garages'
-- rows (cross-tenant leak). Add a nullable garage_id (legacy rows stay NULL and
-- simply fall outside any garage-scoped list) plus a lookup index. New rows are
-- pinned to the session garage by enforceTenantOnBody + the scoped routes.
ALTER TABLE "currency_transactions" ADD COLUMN IF NOT EXISTS "garage_id" uuid;
ALTER TABLE "document_library_items" ADD COLUMN IF NOT EXISTS "garage_id" uuid;
ALTER TABLE "fleet_accounts" ADD COLUMN IF NOT EXISTS "garage_id" uuid;

CREATE INDEX IF NOT EXISTS "currency_transactions_garage_idx" ON "currency_transactions" ("garage_id");
CREATE INDEX IF NOT EXISTS "document_library_items_garage_idx" ON "document_library_items" ("garage_id");
CREATE INDEX IF NOT EXISTS "fleet_accounts_garage_idx" ON "fleet_accounts" ("garage_id");
