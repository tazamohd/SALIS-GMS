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
| 3 | Phase 6 Compliance & Quality (ISO, environmental, safety, insurance) | pending |
| 4 | Phase 7 Hardware (barcode, signage, camera, LPR, AR) | pending |
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
- **Other phase services still `@ts-nocheck`:** `phase3-integrations-service.ts`,
  `phase7-hardware-service.ts` (address in their respective waves).

## Notes
- Server tests can't run in the dev sandbox (Postgres won't run as root); they are validated by
  CI on the PR, which provides a Postgres 16 service container.
- This container is ephemeral — work is preserved by committing/pushing to the branch each wave.
