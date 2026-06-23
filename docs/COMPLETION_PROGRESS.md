# SALIS AUTO — Completion Program Progress

A running log of the continuous multi-agent completion program driving SALIS AUTO toward 100%.
Branch: `claude/wonderful-dijkstra-8684ic` · PR #61.

## Program at a glance

- **Goal:** finish every stubbed/unfinished feature, fix, test, and review the system toward 100%.
- **Model:** phased **waves** with a CI/review **checkpoint** between each (one PR, must be green
  before the next wave starts). Scope = everything (all 104 modules / 8 phases).
- **Quality gates (every wave):** `npm run check` (tsc) · `npm run lint` · `npm test` /
  `test:coverage` · `npm run build` · server integration tests under real Postgres in CI.
- Full agent/wave design lives in the planning doc (the 17-agent continuous program).

## Baseline (established by exploration)

- ~60-70% functionally complete. Solid: Phases 1-2, Saudi/ZATCA compliance (Phase 8), 94
  refactored routes.
- Unfinished: Phase 5-7 business logic, dead/stub route domains, the 22k-line `server/routes.ts`
  monolith, ~8 mock-data pages, external integration wiring.
- Quality risk: ~20-30% coverage, 0% client tests, ESLint config missing, no coverage/lint/build
  gates in CI.

## Completed waves

### Wave 0 — Foundation & guardrails ✅ (commit `039e8e9`, CI green)
The gating layer every later wave depends on.
- **ESLint fixed:** added flat `eslint.config.js` + toolchain; `npm run lint` was broken (no config).
  Real bugs = errors, noise = warnings → 0 errors / ~1002 warnings.
- **Coverage gate:** vitest v8 coverage with a non-zero floor (ratchets toward 70% in Wave 6).
- **Client test harness (closed the 0% gap):** first tests — `Button` component (jsdom) + pure
  utils (`cn`, `isUnauthorizedError`). Migrated off Vitest-4-removed `environmentMatchGlobs`
  (node default + `// @vitest-environment jsdom` opt-in) and enabled the automatic JSX runtime.
- **CI hardened:** `.github/workflows/test.yml` now runs type-check → lint → build → test+coverage.

### Wave 1 — Empty domains & consolidation ✅ (commit `903b838`, CI green)
A consolidation, not "fill 4 stubs."
- **Deleted 3 dead skeletons** (`fleet.routes.ts`, `reports.routes.ts`, `misc.routes.ts`) — not
  imported anywhere; real impls already mounted (`fleet.ts`/`reports.ts`), and the misc paths are
  served by the legacy monolith (clean extraction deferred to Wave 7).
- **Implemented `settings.routes.ts`:** real `GET`/`PATCH /api/settings` backed by
  `storage.getUserSettings`/`updateUserSettings` (upsert-on-first-access). Left `/api/feature-flags`
  to the existing module.
- **Filled real test-expected gaps:** `GET`/`POST /api/fleet/groups` (in `fleet.ts`) and
  `GET /api/reports/overview` (in `reports.ts`), both auth-guarded.
- **Hardened tests:** fleet/reports/settings integration tests upgraded from 404-tolerant smoke
  checks to real 200 gates (+ validation, persistence, auth-guard) — green under real Postgres.

### Wave 2 — Phase 5 Operations: type-safety & correctness ✅ (local gates green)
Direct exploration overturned the original "Phase 5 is 50% stubbed" assessment:
- The service `server/phase5-operations-service.ts` (all 5 modules — scheduling optimizer, parts
  auto-reorder, multi-location routing, time-clock/payroll, equipment calibration) is **fully
  implemented** with real DB logic.
- BUT it carried `// @ts-nocheck`, which hid **real bugs**: the auto-reorder and calibration
  queries referenced **non-existent columns** (`spareParts.partName/partNumber/quantityInStock/
  garageId`, `tools.toolName/toolNumber`) — they would throw at runtime and silently return `[]`
  via catch blocks.
- **Fix:** removed `@ts-nocheck`; rewrote auto-reorder to join `sparePartInventories` for stock
  (garage scoping via `autoReorderRules.garageId`) and use `spareParts.name`/`.sku`; fixed
  calibration to use `tools.name` (dropped nonexistent `toolNumber`); typed the scheduling
  optimizer callbacks. `phase5-operations-service.ts` is now under the type-check gate.
- Local gates: tsc CLEAN, lint 0 errors, build PASS.

### Wave 3 — Phase 6 verified + phase-service type-safety hardening ✅ (local gates green)
- **Phase 6 (Compliance & Quality):** the service `phase6-compliance-service.ts` (environmental,
  ISO 9001 quality, safety incidents, insurance claims) is **already fully implemented AND
  type-safe** (no `@ts-nocheck`). Its HTTP exposure has the same mock-shadowing / missing-route
  issues as Phase 5 (mock handlers at routes.ts ~14053; real `phase6Service` handlers at ~15629/
  ~18463 on different paths; insurance-claims & ISO-quality have no real route) → Wave 7.
- **Cleared the remaining `@ts-nocheck` landmines** (same bug class as Phase 5):
  - `phase3-integrations-service.ts`: removed `@ts-nocheck`; fixed 10 errors (Stripe apiVersion
    cast, typed drizzle `where` callbacks, typed a `.filter`).
  - `phase7-hardware-service.ts`: removed `@ts-nocheck`; fixed the barcode-scan query's
    nonexistent `spareParts.partName`/`tools.toolName` → `.name` (silent-`[]` bug), typed a filter.
  - **All `server/phase*-service.ts` are now type-checked** (zero `@ts-nocheck` remaining).
- Local gates: tsc CLEAN, lint 0 errors, build PASS.

### Wave — Mock-route shadowing fix (Phase 5 & 6) ✅ (local gates green; CI-gated)
The biggest user-facing defect: the monolith served **mock data** for Phase 5/6 endpoints
because hardcoded mock handlers were registered before the real service-backed ones.
- Replaced the Phase 5 mock block (routes.ts ~13984) and Phase 6 mock block (~14052) with
  real `phase5Service`/`phase6Service` calls — **same paths**, so no client breakage, just real data:
  calibration records/reminders, routing routes, clock-out, payroll calc; environmental, ISO
  quality checklists/non-conformances, safety incidents, insurance claims (GET reads + POST creates,
  with `garageId` injected from session and date/number coercion).
- Removed the 4 true-shadow mocks (auto-reorder rules GET/POST, auto-reorder history, timeclock
  clock-in) so the dedicated real handlers downstream serve them.
- New test `server/__tests__/phase5-6-unshadow.test.ts` asserts each endpoint returns real data
  (empty DB → `[]`) with **no mock fingerprint** (`Oil Filter`, `SI-2024-001`, …) + an auth guard.
- Local gates: tsc CLEAN, build PASS (validates monolith syntax — `routes.ts` is `@ts-nocheck`),
  lint 0 errors. Endpoint behavior gated by CI (real Postgres).

### Phase 7 (Hardware) — verified already real ✅
Phase 7 routes (barcode scans, signage, cameras, LPR, kiosk, vehicle entry logs) **already call
`phase7Service`** directly (routes.ts ~14581+) — no mock shadowing. Wave 3 already fixed the
service's underlying `partName`/`toolName` bug, so these endpoints now return correct data. No
further work needed.

### Test coverage increments (client + shared) ✅
- `roleAccess.test.ts`, `hijriDateFormatter.test.ts` (Wave 6 start).
- `shared/plans.test.ts` (plan-gating `meetsMinPlan` + hierarchy).
- `client/src/hooks/use-mobile.test.tsx` (first hook test via `renderHook`).
- Client+shared suite: **64 passing**; tsc CLEAN, lint 0 errors.

### Tooling setup (commits `1c34614`, `5362484`, `d7c9fed`)
- Installed the ruflo agent harness (`.claude/`, `.claude-flow/`, `.mcp.json`, `CLAUDE.md`).
- Initialized the memory DB and seeded SALIS architecture/conventions/commands/compliance.
- Gitignored runtime artifacts (`.swarm/`, `*.db`, `coverage/`, `pg-test-data/`).

## Status board

| Wave | Scope | Status |
|------|-------|--------|
| 0 | Foundation: ESLint, coverage, CI gates, client harness | ✅ CI green |
| 1 | Empty domains & consolidation (settings/fleet-groups/reports-overview) | ✅ CI green |
| 2 | Phase 5 Operations: type-safety & query correctness (logic was already implemented) | ✅ local gates green |
| 3 | Phase 6 verified + phase-service type-safety hardening (phase3/phase7) | ✅ local gates green |
| 4 | Phase 7 Hardware feature/route completion (service now type-safe) | pending |
| 5 | External integrations (ZATCA Fatoora, accounting OAuth, comms) | pending |
| 6 | Test/coverage backfill → ratchet to target | pending |
| 7 | Monolith retirement (`server/routes.ts`) | pending |
| 8 | Hardening: security audit, perf budgets, E2E, emerging-tech | pending |

## Known defects (deferred to Wave 7 — monolith retirement)
- **Phase 5 route shadowing:** in `server/routes.ts`, a block of hardcoded **mock** handlers
  (~lines 13985–14040, "Module 82–85": `/api/auto-reorder/*`, `/api/timeclock/*`, `/api/payroll/*`,
  `/api/calibration/*`, `/api/routing/routes`) is registered **before** the real
  `phase5Service`-backed handlers (~line 15439+). Express uses the first match, so these endpoints
  currently return **mock data** instead of the real (now-corrected) service. Resolving this means
  deleting the mock block and wiring any mock-only paths (e.g. `GET /api/calibration/records`,
  `/api/payroll/periods`, `/api/timeclock/clock-out`, `/api/routing/routes`) to the service —
  monolith surgery best done in Wave 7 with parity tests.
- **Phase 6 route shadowing / missing routes** (same class as Phase 5): mock handlers at
  routes.ts ~14053 vs real `phase6Service` handlers at ~15629/~18463; `/api/insurance-claims` and
  ISO-quality have only mock routes — reconcile in Wave 7.

## Notes
- Server tests can't run in the dev sandbox (Postgres won't run as root); they are validated by
  CI on the PR, which provides a Postgres 16 service container.
- This container is ephemeral — work is preserved by committing/pushing to the branch each wave.
