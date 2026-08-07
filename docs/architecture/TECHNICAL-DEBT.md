# Technical Debt Report

An honest ledger of what Phase E has **deliberately deferred**, why, and what it
would take to close each item. This is not a defect list — everything here is a
conscious trade-off in service of the strangler-fig strategy (ADR-0005).

## Debt register

### TD-1 — The monolith is still large (highest priority)

- **What:** `server/routes.ts` still holds **~1,035 endpoints** (~20k lines) and
  `server/storage.ts` (~15k lines) remains the shared data facade.
- **Why deferred:** big-bang decomposition is high-risk and unreviewable
  (ADR-0005). 22 domains have been peeled off safely; the rest follow the same
  playbook.
- **Impact:** the codebase is a hybrid; new work in un-migrated areas still lands
  in the monolith. Success criterion "oversized monolithic files decomposed" is
  **partially met**.
- **To close:** continue domain-by-domain extraction per the Execution Plan.
  Track burn-down via the Module Migration Matrix.

### TD-2 — Deferred domain sub-surfaces

| Domain | Deferred | To close |
|--------|----------|----------|
| Marketplace | Authenticated parts search/orders/track + `/my/reviews` | Extract the write-path as a `marketplace` follow-on slice |
| AI | The 26 monolith `/api/ai/*` endpoints (chatbot, diagnostics, …) | Consolidate into the `ai` module after the three route files |
| Platform / Admin | System health, backup, subscriptions, broader administration | Extend the `platform` module domain-by-domain |

### TD-3 — Repository seams still delegate to `storage`

- **What:** most repositories delegate to the legacy `storage` facade rather than
  issuing direct Drizzle queries.
- **Why deferred:** ADR-0005 establishes the *boundary* first; internals migrate
  later with no caller change. The seam is already valuable (single data-access
  point per domain).
- **To close:** replace `storage.*` calls with direct Drizzle inside each
  repository, opportunistically, once a domain needs query-level changes. Newer
  modules (`crm`, `analytics`, `platform`) already query `db` directly — the
  target end-state.

### TD-4 — Dual response representations

- **What:** migrated endpoints keep the legacy `{ message }` bodies; only new/
  opt-in endpoints use the `infrastructure/http` envelope (ADR-0002/0006).
- **Why deferred:** byte-for-byte wire compatibility during migration.
- **To close:** introduce a versioned API surface (`/api/v2`) and move the
  envelope there once clients can migrate.

### TD-5 — Cross-cutting layers intentionally not built yet

- **What:** caching (E11), telemetry/metrics/audit (E13), and CQRS (E6) exist as
  *plans*, not code.
- **Why deferred:** they are introduced **only when a migrated domain
  demonstrably needs them** — building them up front is speculative complexity
  the success criteria explicitly warn against.
- **To close:** add per-domain as evidence of need appears (e.g. read-heavy
  analytics → caching + CQRS projection).

### TD-6 — Legacy `console.log` route inventory drift

- **What:** the Hybrid Router's startup `console.log("Feature Routes Loaded …")`
  still names retired files (e.g. `ai-insights`, `feature-flags`).
- **Why deferred:** cosmetic; prior increments left it to avoid noise in
  behavior-focused diffs.
- **To close:** a one-line cleanup pass once extraction slows.

### TD-7 — Test-environment fragility

- **What:** the full suite needs `DATABASE_URL` + `SESSION_SECRET` exported and a
  reachable Postgres on `:5432`; the runner's Postgres is periodically recycled,
  and `security-config.test.ts` fails to *load* when `SESSION_SECRET` is unset.
- **Why deferred:** environmental, not a code defect; unrelated to the domain
  work.
- **To close:** provide a committed test `.env` / CI service container and a
  `globalSetup` that exports `DATABASE_URL` to workers.

### TD-8 — Root stray files

- **What:** `_h2_gap.md`, `_sprint2_gap.md`, `_sprint2_impl.md`, `_sprint5_zod.md`,
  `_sprint6_nplus1.md` sit untracked at the repo root.
- **Why deferred:** pre-existing scratch notes; never staged per project rule.
- **To close:** move into `docs/` or delete after confirming with the owner.

## Burn-down snapshot

| Signal | Now | Target |
|--------|-----|--------|
| Domains modularized | 22 dirs / 21 domains | full domain coverage |
| Monolith endpoints (`routes.ts`) | ~1,035 | → 0 (served by modules) |
| Repositories on direct Drizzle | a growing minority | all |
| `lint:arch` violations | 0 | 0 (hold) |
| Response envelope adoption | new endpoints only | versioned API |
