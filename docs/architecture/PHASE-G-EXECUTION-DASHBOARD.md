# Phase G — Execution Packages & Live Dashboard

Converts the confirmed audit findings and the Phase E roadmap into independent,
traceable **execution packages**. Every package maps to a confirmed finding, is
independently executable and reversible, keeps the repo buildable after each
logical change, and produces evidence. This document is the **live dashboard**;
it is updated at the close of every package.

> **Grounding note (honesty first).** The original security audit's Critical (P0)
> and High (P1) findings are **already remediated** (see the Resolution Matrix).
> The remaining open work is **architectural debt** (all P2/P3), tracked in
> `TECHNICAL-DEBT.md`. Phase G does not invent new P0/P1 packages; it packages
> the real backlog — chiefly the monolith burn-down (TD-1) — and drives it to the
> Program Completion Criteria with evidence.

_Last updated: provider domain extraction (PR #123, in review)._

---

## 1. Master Execution Dashboard

| Phase | Status | Progress |
|-------|--------|----------|
| Phase A – Roadmap | ✅ Complete | 100% |
| Phase B – Sprint Planning | ✅ Complete | 100% |
| Phase C – Regression Framework | ✅ Complete | 100% |
| Phase D – Release Checklist | ✅ Complete | 100% |
| Phase E – Architecture (modular monolith) | ⏳ In Progress | ~24 domains extracted; monolith burn-down ongoing |
| Phase F – Re-Audit | 🟡 Automated gates PASS; interactive browser phases partial | ~80% |
| Phase G – Execution Packages | ⏳ Active | Tracks packages below |

**Live architecture metrics** (measured this cycle, not asserted):

| Signal | Now | Target |
|--------|-----|--------|
| Domain modules (`server/modules/*`) | 24 | full domain coverage |
| Monolith endpoints (`server/routes.ts`) | 993 | → 0 (served by modules) |
| DI registrations (composition root) | 79 | all domains wired |
| `lint:arch` violations | 0 | 0 (hold) |
| `tsc --noEmit` errors | 0 | 0 (hold) |
| `eslint` errors | 0 | 0 (hold) |
| Full suite | 1283 passing | green, no regressions |

---

## 2. Audit Findings Resolution Matrix

Traceability from every confirmed finding to its resolution + evidence.

| Finding | Sev | Title | Status | Evidence |
|---------|-----|-------|--------|----------|
| C-1 | P0 | Customer/staff tenant-isolation lockout | ✅ Resolved | `requireStaffByDefault`; `c1-c2-customer-staff-lockout.test.ts` |
| C-2 | P0 | Cross-tenant data reachable on staff endpoints | ✅ Resolved | tenant-scope middleware; same suite |
| H-1 | P1 | Implicit permissive default role | ✅ Resolved | role default removed; auth tests |
| H-2 | P1 | Missing by-id ownership guards | ✅ Resolved | `requireResourceOwnership` on `:id` routes across modules |
| H-3 | P1 | CSRF not fail-safe-on | ✅ Resolved | CSRF fail-safe-on; security-config tests |
| Sprints 2/5/6/8 | P1–P2 | Availability, validation, N+1, hardening | ✅ Resolved | sprint tasks closed; suite green |
| TD-1 | P2 | Oversized monolith (`routes.ts`/`storage.ts`) | ⏳ In progress | burn-down 993 endpoints; 24 modules |
| TD-2 | P2 | Deferred domain sub-surfaces | 🟢 Mostly closed | marketplace write-path (#122), AI `/api/ai/*` (all 26, #115–#120), provider (#123) done/in-review |
| TD-3 | P3 | Repositories delegate to `storage` | ⏳ Opportunistic | newer modules query `db` directly |
| TD-4 | P3 | Dual response representations | 🔵 Deferred | pending versioned `/api/v2` |
| TD-5 | P3 | Cross-cutting layers not built | 🔵 Deferred by design | add per demonstrated need |
| TD-6 | P3 | Startup route-inventory `console.log` drift | 🟠 Open | one-line cleanup package below |
| TD-7 | P2 | Test-env fragility (`SESSION_SECRET`/DB) | 🟠 Open | committed test env + globalSetup package below |
| TD-8 | P3 | Root stray `_*.md` files | 🟠 Open | move-to-docs/delete package below |

**P0 open: 0 · P1 open: 0.** Remaining packages are all P2/P3 architectural/infra.

---

## 3. Execution-Package Register

Each package is independently executable, reversible, and traceable. Status:
✅ done · 🔵 in review · 🟠 ready · ⏳ rolling · 🔒 blocked.

### Completed (this program)

| Task ID | Cat | Finding | Package | Status |
|---------|-----|---------|---------|--------|
| SEC-P0-001 | Security | C-1/C-2 | Tenant-isolation `requireStaffByDefault` | ✅ |
| SEC-P1-002 | Security | H-1 | Remove implicit permissive role default | ✅ |
| SEC-P1-003 | Security | H-2 | By-id `requireResourceOwnership` guards | ✅ |
| SEC-P1-004 | Security | H-3 | CSRF fail-safe-on | ✅ |
| ARCH-P2-001…021 | Architecture | TD-1/TD-2 | Domain extractions: customers, vehicles, appointments, garage, jobcards, estimates, invoices, payments, inventory (+dash/ops), suppliers, procurement, ai (3 route files), platform (+backup), subscriptions, crm, insurance, fleet (+mgmt/tracking), analytics, hr, reports, marketplace (public) | ✅ |
| ARCH-P2-022 | Architecture | TD-2 (AI) | 26 monolith `/api/ai/*` folded into `ai` (#115–#120) | ✅ |
| ARCH-P2-023 | Architecture | TD-2 (mkt) | Marketplace authenticated write-path (#122) | ✅ |
| ARCH-P2-024 | Architecture | TD-1 | Provider marketplace surface (#123) | 🔵 |

### Open / ready (priority order)

| Task ID | Pri | Cat | Finding | Objective | Status |
|---------|-----|-----|---------|-----------|--------|
| ARCH-P2-025 | P2 | Architecture | TD-1 | Extract next monolith domain (administration / system-health) | 🟠 |
| INFRA-P2-101 | P2 | Infrastructure | TD-7 | Committed test env + `globalSetup` exporting `DATABASE_URL`/`SESSION_SECRET`; CI Postgres service | 🟠 |
| ARCH-P3-102 | P3 | Architecture | TD-6 | Refresh Hybrid Router startup `console.log` route inventory (drop retired file names) | 🟠 |
| DOC-P3-103 | P3 | Documentation | TD-8 | Relocate/delete root stray `_*.md` (owner-confirmed) | 🟠 |
| ARCH-P3-104 | P3 | Architecture | TD-1 | Continue domain burn-down until `routes.ts` → 0 (rolling) | ⏳ |
| ARCH-P3-105 | P3 | Architecture | TD-3 | Replace `storage.*` with direct Drizzle inside repositories (opportunistic) | ⏳ |
| ARCH-P3-106 | P3 | Architecture | TD-4/TD-5 | Versioned `/api/v2` envelope + cross-cutting layers on demonstrated need | 🔵 |

Dependency order: ARCH-P2-024 (in review) → ARCH-P2-025. INFRA/DOC/ARCH-P3
packages are independent and may run in parallel with the burn-down.

---

## 4. Next Package (fully specified per the Standard Template)

### INFRA-P2-101 — Deterministic test environment

- **Priority / Sprint / Category:** P2 · Phase G · Infrastructure
- **Objective:** Make the full suite runnable without manual env export, closing
  the one environmental load-failure (`security-config.test.ts`).
- **Background / finding:** TD-7. The suite needs `DATABASE_URL` +
  `SESSION_SECRET` exported and Postgres on `:5432`; `security-config.test.ts`
  `process.exit(1)`s at import when `SESSION_SECRET` is unset, and the runner's
  Postgres is periodically recycled. Environmental, not a code defect — but it
  weakens the regression signal.
- **Problem:** A fresh checkout cannot run `vitest run` green without out-of-band
  setup; one file fails to *load*.
- **Root cause:** No committed test env / `globalSetup`; a hard `process.exit` on
  a missing secret at import time.
- **Files:** `vitest.config.ts` (add `globalSetup`), a new
  `server/__tests__/globalSetup.ts` (export defaults for test only), CI workflow
  (Postgres service container), `docs/architecture/TECHNICAL-DEBT.md` (close TD-7).
- **Dependencies:** Independent.
- **Implementation plan:**
  1. Add `server/__tests__/globalSetup.ts` that sets `SESSION_SECRET` (≥32-char
     test constant) and `DATABASE_URL`/`TEST_DATABASE_URL` defaults **only when
     unset**, guarded to `NODE_ENV==='test'`.
  2. Wire `globalSetup` in `vitest.config.ts`.
  3. Add a CI Postgres service + `TEST_DATABASE_URL` to the workflow.
  4. Update `TECHNICAL-DEBT.md` burn-down (close TD-7).
- **Acceptance criteria:** ✓ `vitest run` green from a clean shell (no manual
  export) ✓ 0 test-load failures ✓ `tsc`/`eslint`/`lint:arch` clean ✓ no
  behavior change to app code.
- **Testing:** Static (tsc/eslint) + full `vitest run` from an unexported shell.
- **Regression:** Existing PASS · new setup PASS · no app-code change → no
  regression risk.
- **Deliverables:** globalSetup, vitest config, CI service, doc update.
- **Commit:** `test(env): committed globalSetup + CI Postgres for a deterministic suite`
- **Rollback:** Revert the commit; suite reverts to manual-export behavior
  (current state). No schema, no data, no runtime app change.

> Remaining open packages carry the same structure; they are expanded to full
> template form at pick-up time, one at a time (never mixed), per the operating
> rules.

---

## 5. Sprint / Coverage Snapshot

| Signal | Value |
|--------|-------|
| Planned packages (open) | 7 |
| Completed packages | 27 (4 security + 23 architecture increments) |
| Blocked | 0 |
| Regression status | ✅ full suite 1283 passing |
| Audit coverage (P0/P1) | ✅ 100% resolved |
| Architecture compliance | ✅ `lint:arch`/`tsc`/`eslint` 0; 24/24 modules consistent |
| Production-readiness (honest) | ~85% — security & modular-arch guarantees met on migrated surface; open items are monolith burn-down + test-env + perf-target evidence |

---

## 6. Program Completion Criteria

| Criterion | Status | Note |
|-----------|--------|------|
| 0 Critical (P0) remain | ✅ | Resolution Matrix |
| 0 High (P1) remain | ✅ | Resolution Matrix |
| 20/20 audit acceptance tests pass | 🟡 | Automated acceptance green; full 20/20 browser matrix is Phase F partial |
| All automated tests pass, no regressions | ✅ | 1283 passing |
| All re-audit phases pass | 🟡 | Automated PASS; interactive browser phases partial (Phase F) |
| Multi-tenant isolation verified | ✅ | C-1/C-2 suites + by-id guards |
| DB indexing / query perf meets targets | 🟠 | Needs a benchmark-evidence package (not yet run this program) |
| Approved modular enterprise architecture followed | ⏳ | On migrated surface ✅; monolith burn-down ongoing (TD-1) |
| Deployment / monitoring / rollback validated | 🟡 | `DEPLOYMENT.md` + release checklist exist; ops drill evidence pending |
| Documentation reflects final implementation | ✅ | ADRs + architecture docs kept current each increment |

**Program is NOT yet complete.** Blocking-for-completion items: finish TD-1
burn-down, produce DB perf-benchmark evidence, complete the Phase F interactive
matrix, and validate an ops rollback drill. None are open P0/P1.

---

## 7. Final Outcome (Execution Completion Package — to be produced at close)

At Phase G close, produce: Executive Summary · Audit Findings Resolution Matrix
(this §2) · Sprint Completion Reports · Regression Verification Results ·
Architecture Compliance Report (exists) · Performance Benchmark Report (pending
package) · Production Readiness Report · Re-Audit Certification (Phase F) ·
Deployment Runbook (`DEPLOYMENT.md`) · Final Go/No-Go Recommendation.

**Current Go/No-Go:** 🟡 **Conditional Go** for the modularized surface;
**No-Go for "program complete"** until the four blocking-for-completion items
above carry evidence.
