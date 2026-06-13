# Addendum — Technical Depth & Options (Multi-Tenant Isolation & Security)

*Implementation "how", rejected alternatives, and mechanism decisions that belong downstream (architecture/solution design), captured during PRD discovery so they are not lost. Not part of the PRD's capability contract.*

## Current-state facts (from codebase analysis)

- **Tenancy model:** `garages` (tenant) → `branches` → `users`; authorization scope via `user_role_branch` (Role Binding, `isPrimaryRole`). Subscription plan enriched onto user at login from the garage.
- **The leak:** several queries scope by `garageId` but **fall back to returning all records when `garageId` is absent** (called out in `replit.md` for the HR module; global search is another risk surface). This is the central defect FR-1/FR-2 close.
- **Auth bypass:** `AUTH_BYPASS=true` disables `isAuthenticated` (dev convenience on Replit). No code currently prevents it in production — FR-5.
- **Auth stack:** Passport LocalStrategy + bcrypt; sessions in PostgreSQL via `connect-pg-simple` (`sessions` table, `createTableIfMissing`), 7-day TTL, httpOnly cookies, `trust proxy` set.
- **MFA:** `mfaStatuses` table + `speakeasy` (TOTP) on the backend; frontend pages partial/optional — FR-11 completes it.
- **Audit:** `activityLogs`, `sessionLogs`, `auditTrail` tables + `auditMiddleware` + `audit-trail` service already log actions and impersonation flags — FR-9/FR-10 formalize coverage + immutability.
- **Routing reality:** hybrid — modular `server/routes/*.routes.ts` mounted first, legacy `server/routes.ts` (~760 endpoints) as fallback; ~860 total. Any isolation mechanism must wrap both.
- **Middleware present:** `requireRole`, `requirePlan`, `validate` (Zod). Indexes on `garageId`/`status`/`createdAt` already exist (helps FR-1 perf budget).

## Mechanism options for Scoped Data Access (FR-4) — for architecture to decide

1. **Enforcing middleware that injects Tenant Scope + scoped query helpers in `server/storage.ts`.**
   - Pro: single choke point; storage layer already centralizes DB access.
   - Con: `storage.ts` is `// @ts-nocheck` today — type-safety of the scoped API needs attention.
2. **Repository wrapper / query builder that *requires* a Tenant Scope argument (no default).**
   - Pro: compile-time pressure to pass scope; greppable `unsafeCrossTenant(reason)` escape hatch.
   - Con: larger refactor of call sites, especially legacy.
3. **Postgres Row-Level Security (RLS) with a per-request `SET app.current_garage`.**
   - Pro: enforcement in the database — strongest guarantee, covers even missed app paths.
   - Con: requires session/transaction-scoped settings, careful connection pooling (Neon serverless), and Drizzle integration work; impersonation/platform paths need a bypass role.
   - Recommendation note: RLS as a defense-in-depth backstop *plus* app-layer scoping is the strongest posture; sequencing TBD by architecture.

## Existence-hiding (404 vs 403)
Default 404 for cross-tenant reads to avoid confirming record existence. 403 acceptable where the resource is in-scope but the action is role-forbidden (an authorization, not isolation, failure). Open Question #7.

## Auth-bypass removal (FR-5) approach
- Gate any bypass strictly on `NODE_ENV !== 'production'` AND an explicit separate flag; add a startup safety check in `server/config.ts` (which already fail-fast validates env) that hard-fails if bypass is enabled under production. Add a regression test asserting production boot + bypass ⇒ failure.

## Isolation test harness (FR-8)
- Extend existing Vitest integration tests (`server/routes/__tests__`) + Playwright. Seed ≥2 garages (reuse `server/seed.ts`), parameterize a harness over a route table, assert zero cross-tenant leakage and 404 on cross-tenant detail. Wire into CI as a required check. A lint/AST guard flagging tenant-bearing queries that skip the primitive is a stretch (FR-4 consequence).

## Audit immutability (FR-9)
- v1: application append-only + restricted DB grants (no UPDATE/DELETE on audit tables for app role). Fast-follow: hash-chain / tamper-evidence. Define retention (≥1yr assumed) + archival.

## Rejected / deferred alternatives
- **Physical per-tenant databases or schemas** — rejected for v1: large infra/migration cost; logical isolation + (optional) RLS judged sufficient. Revisit if a data class demands hard separation (Open Question #2).
- **Replacing Passport with an external IdP/SSO** — deferred to a separate initiative; not required to close the isolation gap.
- **Field-level encryption / DLP** — out of scope; isolation + audit first.

## Performance
- Lean on existing `garageId`/`branchId` indexes; review N+1 and aggregate/report queries for added predicates; hold to ≤10ms p95 budget (Open Question #6).
