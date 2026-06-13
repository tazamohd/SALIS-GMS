# Story 1.6: Postgres Row-Level Security backstop

Status: prepared — requires staging DB validation before apply (not active)

## Story

As a Security officer,
I want the database itself to enforce the Garage boundary,
so that even a missed application-layer filter cannot leak data across tenants.

## Acceptance Criteria

1. RLS enabled + forced on tenant-bearing tables with policies keyed on `app.current_garage`. **(SQL prepared; not applied)**
2. App issues `set_config('app.current_garage', …)` inside a transaction before tenant queries. **(helper prepared; not wired)**
3. A separate privileged DB role can bypass RLS; the app role cannot. **(documented in the migration)**
4. Works under Neon serverless pooling (GUC + query in one transaction). **(requires staging validation)**

## Why this ships PREPARED, not active

RLS cannot be safely validated in this environment (no real Neon/Postgres with the app running), and an
active RLS migration would make every un-instrumented query return zero rows — an app-wide outage if the
GUC plumbing isn't wired everywhere first. The architecture sequences RLS as a **backstop after** the
app-layer scoping (Stories 1.2/1.3/1.5, which ARE active and CI-verified). So 1.6 delivers reviewed
artifacts gated behind explicit staging validation, not a live flip.

Notably, CI builds the schema via `drizzle-kit push --force` from `shared/schema.ts` and never executes
files under `migrations/` — so the manual SQL here is inert until deliberately applied.

## Tasks / Subtasks

- [x] `migrations/manual/0001_enable_rls.sql` — ENABLE/FORCE RLS + `tenant_isolation` policy (USING + WITH CHECK on `current_setting('app.current_garage', true)`) for core tables (job_cards, vehicles, invoices, appointments, suppliers); app vs `BYPASSRLS` role guidance; `users`/auth explicitly excluded; rollback notes. Placed in `migrations/manual/` — outside the drizzle chain.
- [x] `server/tenancy/rls.ts` — `withGarageRLS(fn)` runs work in a transaction after `set_config('app.current_garage', <garage>, true)` (fail-closed empty when unscoped); Neon-pooling-safe pattern documented.
- [ ] **Staging:** apply migration, wire tenant queries through `withGarageRLS`, run full suite + isolation harness, verify pooling + bypass role.
- [ ] **Extend** RLS to every `garage_id` table once validated.
- [ ] **Production** enable.

## Dev Notes

- `current_setting('app.current_garage', true)` returns NULL when unset → policy matches nothing → fail-closed. [Source: migrations/manual/0001_enable_rls.sql]
- `set_config(name, value, is_local := true)` is parameterizable and transaction-scoped — required so the GUC and the query share one pooled Neon connection. [Source: server/tenancy/rls.ts, architecture.md#AD-3]
- `users` is excluded: auth (login / `deserializeUser`) reads users with no garage GUC; an RLS policy there would break login. Cover it later with an auth-aware policy + bypass role. [Source: server/auth.ts]

### References
- [Source: architecture.md#AD-3; epics.md#Story 1.6; prd.md#Open Questions Q2]

## Dev Agent Record

### Agent Model Used
claude (BMAD bmad-dev-story, Fast path)

### Completion Notes List
- RLS migration + GUC transaction helper prepared and documented; NOT activated.
- Active isolation remains the CI-verified app-layer scoping; RLS is the staged backstop.

### File List
- A migrations/manual/0001_enable_rls.sql
- A server/tenancy/rls.ts

### Change Log
- 2026-06-13: Story 1.6 — RLS backstop prepared (gated on staging validation).
