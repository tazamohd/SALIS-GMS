---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-SALIS-GMS-2026-06-12/prd.md
  - _bmad-output/planning-artifacts/prds/prd-SALIS-GMS-2026-06-12/addendum.md
  - _bmad-output/project-context.md
  - docs/source-tree-analysis.md
workflowType: 'architecture'
project_name: 'SALIS-GMS'
user_name: 'Root'
date: '2026-06-13'
lastStep: 8
status: 'complete'
completedAt: '2026-06-13'
scope: 'Multi-Tenant Isolation & Security Hardening'
---

# Architecture Decision Document — Multi-Tenant Isolation & Security Hardening

_This document builds on the PRD `prds/prd-SALIS-GMS-2026-06-12/prd.md` and its `addendum.md`. It is the single source of truth for HOW the isolation & security FRs are implemented, so AI agents and engineers build consistently across SALIS-GMS's hybrid route layers. Glossary terms are inherited verbatim from PRD §3._

> **Run note:** Produced via `bmad-create-architecture` in Fast-path (autonomous) mode, matching how the PRD was authored. A/P/C menus were auto-advanced with [C]. Decisions confirmed with the user are marked **(confirmed)**; inferred ones are tagged `[ASSUMPTION]` and indexed at the end.

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements (from PRD):** 11 FRs across 6 features — enforced tenant scoping (FR-1/2/3), safe-by-default developer mechanism (FR-4) + isolation test harness (FR-8), authentication hardening (FR-5/6), RBAC consistency (FR-7), MFA completion (FR-11), auditability & audited impersonation (FR-9/10). Architecturally these collapse into one spine: **every data access must be constrained to the caller's Tenant Scope, deny-by-default, enforced at two layers (app + database), and every privileged action must be auditable.**

**Non-Functional Requirements that shape the design:**
- **Security:** deny-by-default everywhere; existence-hiding (404 over 403) for cross-tenant reads; no client-controlled tenancy; fail-closed.
- **Performance:** ≤10ms p95 scoping overhead `[ASSUMPTION]`; lean on existing `garageId`/`branchId` indexes.
- **Compliance:** PDPL (Saudi), ZATCA tax-record integrity, SOC 2-style controls (audit-ready, not audited in v1).
- **Compatibility:** existing customer/technician portals, `/ws/chat` WebSocket, reports, and exports must keep working within scope.

### Scale & Complexity

- **Primary domain:** full-stack multi-tenant ERP (Express API + React/Vite SPA).
- **Complexity level:** **enterprise** — multi-tenancy + regulatory compliance + ~860 endpoints across a hybrid (modular + legacy monolith) routing surface.
- **Estimated architectural components touched:** request-context layer, data-access layer (`storage.ts`), DB schema (RLS policies), auth/session config, RBAC policy registry, MFA flow, audit pipeline, CI test harness.

### Technical Constraints & Dependencies

- **Fixed stack (brownfield):** Node/Express, Drizzle ORM on **Neon serverless Postgres**, Passport LocalStrategy + bcrypt, `connect-pg-simple` session store (`sessions` table), `speakeasy` TOTP, React + Vite + TanStack Query. No new framework/runtime is introduced — this initiative selects *patterns*, not technologies.
- **Neon serverless pooling** is the single most important constraint for the RLS decision: transaction-scoped `SET LOCAL` GUCs require the query and its `SET` to run on the same pooled connection inside one transaction.
- **`server/storage.ts` is currently `@ts-nocheck`** — the new scoped surface must be typed even if the rest stays loose.
- **Hybrid routing:** modular `server/routes/*.routes.ts` mounted first, legacy `server/routes.ts` (~760 endpoints) as fallback. Any mechanism must wrap **both**.

### Cross-Cutting Concerns Identified

Tenant scoping, authentication/session integrity, authorization (RBAC), audit logging, and fail-closed error handling all span every feature and every endpoint — they are implemented as shared middleware/primitives, never per-endpoint.

---

## Existing Stack Baseline (Starter Equivalent)

No greenfield starter template applies. The "starter" is the **existing SALIS-GMS codebase**; the following are treated as already-decided and are NOT re-litigated here:

| Concern | Locked baseline |
|---|---|
| Runtime / API | Node.js + Express (TypeScript) |
| ORM / DB | Drizzle ORM + Neon serverless Postgres |
| Schema source of truth | `shared/schema.ts` (Drizzle) |
| Auth | Passport LocalStrategy + bcrypt |
| Sessions | `connect-pg-simple` → `sessions` table, 7-day TTL |
| MFA backend | `speakeasy` TOTP + `mfaStatuses` table |
| Frontend | React + Vite + Wouter + TanStack Query |
| Audit tables | `activityLogs`, `sessionLogs`, `auditTrail` + `auditMiddleware` |

Version verification: current major versions of Drizzle (RLS supported), `connect-pg-simple`, and `speakeasy` are compatible with this design; no upgrade is required to proceed `[ASSUMPTION]`.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical (block implementation):** AD-1 tenant context, AD-2 scoped data-access primitive, AD-3 Postgres RLS backstop, AD-5 auth-bypass guard.
**Important (shape architecture):** AD-4 cross-tenant error semantics, AD-6 RBAC policy registry, AD-7 audit/impersonation, AD-8 MFA enforcement, AD-9 isolation test harness.
**Deferred (post-MVP, per PRD):** hash-chained tamper-evident audit, physical per-tenant DB separation, SSO/IdP, full legacy-endpoint migration tail, customer PDPL self-service.

### AD-1 — Tenant Context via AsyncLocalStorage **(confirmed)**

A request-scoped **AsyncLocalStorage** store (`server/tenancy/tenant-context.ts`) holds the resolved **Tenant Scope**: `{ garageId, branchIds: number[], isPlatformPrincipal, impersonation?: { actorUserId, targetGarageId } }`. Populated by `tenantContextMiddleware` immediately after authentication, derived from the user's `user_role_branch` Role Bindings. The data layer reads scope implicitly — no endpoint passes `garageId` by hand, so an engineer **cannot forget** to scope (realizes FR-4 "safe by default").
- **Rationale:** ergonomics + safety-by-default beat the explicit-parameter alternative; the refactor surface is the middleware + `storage.ts`, not every call site.
- **Risk handled:** async-boundary loss and WebSocket (`/ws/chat`) — the store is entered per HTTP request and re-established for each WS message handler; a unit test asserts context survives `await` boundaries.

### AD-2 — Scoped Data-Access Primitive (app layer) **(confirmed)**

A scoped query surface in `server/storage.ts` derives `WHERE garageId = $scope` (and `branchId IN $scope` where branch-scoped) from the AsyncLocalStorage store on every read/write.
- **Deny-by-default:** if no Tenant Scope is present, scoped methods return empty/deny — **never all rows.** This deletes the existing "missing `garageId` ⇒ return everything" fallback (HR module, global search, et al.) — the central PRD defect.
- **No client-controlled tenancy:** on create, the server stamps `garageId` from scope and ignores any body-supplied value (FR-2).
- **Escape hatch:** `unsafeCrossTenant(reason: string, fn)` is the *only* sanctioned bypass (platform analytics, support). It is greppable, requires a reason, and emits an audit event. A CI guard flags raw tenant-bearing Drizzle queries that skip the primitive `[ASSUMPTION: AST/lint guard is best-effort in v1]`.
- **Typing:** the scoped surface is explicitly typed despite the file's `@ts-nocheck`.

### AD-3 — Postgres Row-Level Security backstop (DB layer) **(confirmed)**

Defense-in-depth: even a missed app-layer call cannot leak.
- `ALTER TABLE … ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY` on every tenant-bearing table; `USING`/`WITH CHECK` policies of the form `garage_id = current_setting('app.current_garage')::int`.
- Per request, the data layer opens a transaction and issues `SET LOCAL app.current_garage = $garageId` before queries — **transaction-scoped** so it is safe under Neon connection pooling (the GUC and the query share one connection within the transaction).
- A **separate privileged DB role** (used only for migrations, seeding, and explicit platform/impersonation paths) can `BYPASSRLS`; the normal application role cannot.
- Branch-level filtering remains in the app layer (AD-2); RLS enforces the garage boundary as the hard backstop.
- **Neon constraint documented:** all tenant queries must run inside the scoping transaction; the pooler mode and Drizzle transaction usage are called out as implementation-critical.

### AD-4 — Cross-tenant error semantics: 404 existence-hiding

Cross-tenant **reads** of a known-id resource return **404** (body indistinguishable from a non-existent id) so existence is not revealed. **403** is reserved for in-scope-but-role-forbidden (an authorization failure, not isolation). Cross-tenant **writes** return 404/403 and emit an Isolation-Leak audit event. Centralized in an error helper so behavior is identical across both route layers.

### AD-5 — Auth-bypass elimination + session hardening (FR-5, FR-6)

- `server/config.ts` gains a **startup safety check**: if `AUTH_BYPASS` is truthy while `NODE_ENV === 'production'`, the process **fails to boot** (fail-closed). Bypass is honored only in non-prod and logs a loud warning. A regression test asserts production-boot-with-bypass fails.
- Session hardening: rotate session id on login (fixation defense), `httpOnly` + `secure` (prod) + `sameSite` cookies, preserve the `sessions` store (never dropped), enforce TTL including re-auth for `/ws/chat`. bcrypt work factor retained or raised per review `[ASSUMPTION]`.

### AD-6 — RBAC policy registry, deny-by-default (FR-7)

A single **endpoint → required-role policy registry** (`server/authz/policy-registry.ts`) is consumed by a shared authorization middleware applied to **both** the modular and legacy layers, so the same rule yields the same decision everywhere. Privileged endpoints with no registry entry are **denied** (deny-by-default) and surfaced by a coverage report (SM-5). `requireRole`/`requirePlan` are refactored to read from the registry; plan-gating stays orthogonal to role-gating.

### AD-7 — Audit pipeline & audited impersonation (FR-9, FR-10)

- Extend `auditMiddleware` / `audit-trail` so every **Privileged Action** (auth/identity, role/permission, impersonation start/stop, exports, cross-tenant ops) writes an immutable Audit Event capturing actor, action, target, Tenant Scope, timestamp, source IP, and impersonation flag.
- **Impersonation** is an explicit session for Platform Principals: start/stop are audited, all actions carry the impersonation flag + target scope, the principal cannot exceed the target Tenant Scope, and timeout auto-terminates (logged system-terminated).
- **Immutability v1:** application append-only + DB grants that deny `UPDATE`/`DELETE` on audit tables to the app role. Hash-chain tamper-evidence is deferred.

### AD-8 — MFA enforcement (FR-11)

Complete the existing `speakeasy`/`mfaStatuses` backend with a frontend enroll → verify → recovery-codes flow and an `mfaEnforcementMiddleware` that challenges TOTP at login when MFA is enabled. **Required** for Garage Owner / Super Admin / Accountant, optional for others in v1 `[ASSUMPTION]`. Recovery codes are single-use; admin reset is audited.

### AD-9 — Automated isolation test harness (FR-8)

A Vitest integration suite seeds ≥2 garages (reuse `server/seed.ts`), parameterized over a route table, asserting (a) zero cross-tenant rows in lists/search/aggregates, (b) 404 on cross-tenant detail, (c) no mutation on cross-tenant writes. Wired as a **required CI check**. v1 covers the shared mechanism + a defined high-risk endpoint set; the legacy tail is phased.

### Decision Impact Analysis

**Implementation sequence (dependency order):**
1. AD-1 tenant-context + `tenantContextMiddleware` → 2. AD-2 scoped primitive in `storage.ts` (remove fallbacks) → 3. AD-3 RLS migration + scoping transaction → 4. AD-5 auth-bypass guard + session hardening → 5. AD-6 RBAC registry → 6. AD-7 audit + impersonation → 7. AD-8 MFA → 8. AD-9 harness in CI (developed alongside, gates each phase).

**Cross-component dependencies:** AD-2/AD-3 both consume AD-1's scope; AD-4 error helper used by AD-2 and AD-6; AD-7 audit consumes AD-1 scope + AD-2 escape-hatch events; AD-9 validates AD-1/2/3/4.

---

## Implementation Patterns (rules AI agents MUST follow)

1. **Never write a raw tenant filter.** Read/write tenant data only through the AD-2 scoped primitive. The scope comes from context, not from request params or body.
2. **Never trust client-supplied `garageId`/`branchId`.** Server stamps tenancy from scope on create; ignores client values.
3. **No-scope means deny, not all.** Any code path that could run without a Tenant Scope must return empty/deny. There is no "return everything" branch.
4. **Cross-tenant access = 404 for reads** (existence-hiding); 403 only for in-scope role denial. Use the shared error helper.
5. **Cross-tenant bypass requires `unsafeCrossTenant(reason)`** — and is audited. Anything else is a bug the CI guard should catch.
6. **Every tenant query runs inside the scoping transaction** that issues `SET LOCAL app.current_garage` (RLS contract). Do not query tenant tables outside it.
7. **Authorize via the policy registry**, applied in both route layers. New privileged endpoints must register a required role or they are denied by default.
8. **Privileged actions emit an Audit Event** with full actor/target/scope/impersonation fields. Append-only — never update/delete audit rows.
9. **No production auth bypass.** Never reintroduce an env path that disables auth under `NODE_ENV=production`.
10. **New endpoints ship with an isolation test** (or are covered by the parameterized harness) before merge.

---

## Project Structure (where things live)

```
server/
  tenancy/
    tenant-context.ts          # AD-1 AsyncLocalStorage store + accessors
    tenant-context.middleware.ts
    tenant-scope.ts            # resolve Tenant Scope from user_role_branch
  authz/
    policy-registry.ts         # AD-6 endpoint -> required role map
    authorize.middleware.ts    # shared, applied to both route layers
  auth/
    mfa-enforcement.middleware.ts   # AD-8
    session-hardening.ts            # AD-5 cookie/rotation config
  storage.ts                   # AD-2 scoped data-access primitive (+ unsafeCrossTenant)
  config.ts                    # AD-5 startup auth-bypass guard
  middleware/                  # existing auditMiddleware extended (AD-7)
  routes/*.routes.ts           # wrapped by tenant-context + authorize
  routes.ts                    # legacy monolith — same wrappers applied
  seed.ts                      # multi-garage seeding for harness
  __tests__/isolation/         # AD-9 parameterized cross-tenant suite
shared/
  schema.ts                    # tenant tables + RLS policies (migration) + audit grants
migrations/
  NNNN_enable_rls.sql          # AD-3 ENABLE/FORCE RLS + policies + app/privileged roles
_bmad-output/planning-artifacts/
  architecture.md              # THIS document
```

New modules are additive; existing files (`storage.ts`, `config.ts`, `routes.ts`, `schema.ts`, `seed.ts`) are modified in place along the AD sequence.

---

## Validation Against PRD

| PRD FR | Covered by | Validated by |
|---|---|---|
| FR-1 scoped reads | AD-1, AD-2, AD-3 | AD-9 (lists/search/aggregates), 404 check |
| FR-2 scoped writes | AD-2 (server-stamped), AD-3 | AD-9 cross-tenant write = no mutation |
| FR-3 branch scoping | AD-1 (branchIds), AD-2 | harness branch cases |
| FR-4 safe-by-default primitive | AD-1, AD-2, patterns | CI guard + harness |
| FR-5 no prod auth bypass | AD-5 startup guard | regression test (prod boot fails) |
| FR-6 session/credential security | AD-5 | session-fixation + cookie tests |
| FR-7 RBAC consistency | AD-6 registry | coverage report (SM-5), parity test both layers |
| FR-8 isolation test suite | AD-9 | runs in CI as required check |
| FR-9 privileged-action audit | AD-7 | audit-completeness assertion (SM-3) |
| FR-10 audited impersonation | AD-7 | impersonation start/stop + scope-bound tests |
| FR-11 MFA | AD-8 | enroll/verify/recovery + enforcement tests |

**Self-validation result:** every FR maps to at least one decision and one validation path; no decision contradicts an accepted PRD assumption; Glossary terms used verbatim. Open items remain the PRD's Open Questions (esp. the branch-vs-garage resource matrix #1, high-risk endpoint set #3, perf budget #6) — carried forward to epics/stories, not blockers for this architecture.

---

## Assumptions Index (this document)

- Performance budget ≤10ms p95 (inherited from PRD; confirm against RLS-transaction overhead on Neon).
- Current Drizzle/`connect-pg-simple`/`speakeasy` versions support this design without upgrade.
- CI AST/lint guard for raw tenant queries is best-effort in v1 (harness is the hard gate).
- bcrypt work factor retained or raised per review.
- MFA required for Garage Owner / Super Admin / Accountant; optional otherwise in v1.

---

## Next Steps

Architecture complete. Recommended next BMAD phase: **`bmad-create-epics-and-stories`** to break AD-1…AD-9 into the implementation sequence above, then `bmad-sprint-planning`. Suggested first epic boundary follows the dependency order: *Epic 1 — Tenant Context & Scoped Data Access (AD-1/2/3/4)* as the foundation everything else builds on.
