-- =============================================================================
-- Story 1.6 / AD-3 — Postgres Row-Level Security backstop  (MANUAL migration)
-- =============================================================================
-- ⚠️ NOT auto-applied. This directory is OUTSIDE the drizzle-kit push/migrate
-- chain on purpose: enabling RLS before the GUC plumbing (server/tenancy/rls.ts)
-- is wired and validated would make every un-instrumented query return zero rows.
--
-- Apply ONLY in this order (see server/tenancy/rls.ts):
--   1) staging  2) route tenant queries through withGarageRLS + run the harness
--   3) verify Neon pooling + bypass role  4) production
--
-- Policy model: a row is visible/writable iff its garage_id matches the
-- transaction-local GUC `app.current_garage`. current_setting(..., true) returns
-- NULL when unset, so an un-scoped query matches NOTHING (fail-closed).
-- =============================================================================

-- 1. Roles -------------------------------------------------------------------
-- The application connects as a NON-bypassing role so policies apply. Migrations,
-- seeds, auth/session lookups, and explicit platform/impersonation paths use a
-- BYPASSRLS role. (Names illustrative — match to your Neon roles.)
--   CREATE ROLE salis_app      LOGIN;                 -- subject to RLS
--   CREATE ROLE salis_platform LOGIN BYPASSRLS;       -- migrations / platform ops
-- NOTE: `users` (auth) is intentionally NOT covered here — login/deserialize read
-- users without a garage GUC; cover it only with an auth-aware policy + bypass role.

-- 2. Helper: apply tenant policy to a garage_id table ------------------------
CREATE OR REPLACE FUNCTION salis_apply_tenant_rls(tbl regclass) RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', tbl);
  EXECUTE format($f$
    DROP POLICY IF EXISTS tenant_isolation ON %s;
    CREATE POLICY tenant_isolation ON %s
      USING (garage_id::text = current_setting('app.current_garage', true))
      WITH CHECK (garage_id::text = current_setting('app.current_garage', true));
  $f$, tbl, tbl);
END;
$$ LANGUAGE plpgsql;

-- 3. Apply to the core tenant-bearing operational tables ---------------------
-- Extend this list to every table with a garage_id column once validated.
SELECT salis_apply_tenant_rls('job_cards');
SELECT salis_apply_tenant_rls('vehicles');
SELECT salis_apply_tenant_rls('invoices');
SELECT salis_apply_tenant_rls('appointments');
SELECT salis_apply_tenant_rls('suppliers');

-- 4. (Rollback) --------------------------------------------------------------
-- SELECT format('ALTER TABLE %s DISABLE ROW LEVEL SECURITY', tbl) ...
-- DROP POLICY tenant_isolation ON <table>; per table, then DROP FUNCTION salis_apply_tenant_rls.
