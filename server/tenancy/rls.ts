/**
 * SALIS-GMS — Postgres Row-Level Security plumbing (Story 1.6 / AD-3)
 *
 * Defense-in-depth backstop: even if an app-layer query forgets to scope, the
 * database refuses cross-tenant rows. This helper runs work inside a transaction
 * with the `app.current_garage` GUC set from the Tenant Scope, which the RLS
 * policies in `migrations/manual/0001_enable_rls.sql` read.
 *
 * ⚠️ NOT YET WIRED INTO THE DATA LAYER. RLS is enabled by a MANUAL migration
 * that is intentionally outside the drizzle-kit push chain (so it cannot activate
 * un-validated). Activation sequence — do NOT skip:
 *   1. Apply the migration in STAGING.
 *   2. Route tenant reads/writes through `withGarageRLS` (or set the GUC per
 *      request via a connection hook) and run the full suite + isolation harness.
 *   3. Confirm Neon pooling behaves (GUC + query share one pooled connection
 *      inside the transaction) and that auth/platform paths use the bypass role.
 *   4. Only then enable in production.
 * Until then the active protection is the app-layer scoping (Stories 1.2/1.3/1.5).
 */
import { sql } from "drizzle-orm";
import { db } from "../db";
import { getTenantScope } from "./tenant-context";

/**
 * Execute `fn` in a transaction with `app.current_garage` set (transaction-local)
 * from the current Tenant Scope. When no garage resolves, the GUC is set empty so
 * RLS policies deny all rows (fail-closed).
 */
export async function withGarageRLS<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
  const scope = getTenantScope();
  const garageId = scope?.impersonation?.targetGarageId ?? scope?.garageId ?? "";
  // @ts-expect-error drizzle transaction typing varies by driver (node-postgres vs neon)
  return db.transaction(async (tx) => {
    // set_config(name, value, is_local=true) is parameterizable and transaction-scoped,
    // which is required for safe use under Neon serverless connection pooling.
    await tx.execute(sql`SELECT set_config('app.current_garage', ${garageId}, true)`);
    return fn(tx);
  });
}
