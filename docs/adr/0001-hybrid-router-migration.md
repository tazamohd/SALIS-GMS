# ADR 0001 — Migrating the Hybrid Router safely

Status: Proposed · Date: 2026-06-12

## Context

The HTTP layer is mid-migration from a monolith to domain modules, and both run
at once:

- `server/routes.ts` — the legacy monolith: **22,257 lines, 1,196 `app.*` handlers**,
  exported as `registerRoutes` (re-exported here as `registerLegacyRoutes`).
- `server/routes/` — **~45 modular domain routers** plus `index.ts` and a
  `REFACTORING_GUIDE.md`.
- `server/storage.ts` — a parallel data-access monolith: **12,129 lines**, with
  **993 `DatabaseStorage` methods implementing a 916-method `IStorage` interface**
  (a 77-method gap that hides duplicates/orphans).

`server/index.ts` boots the **modular** entry (`./routes/index`), which mounts the
domain routers under `/api` **first** and then calls the monolith **last**:

```
routes/index.ts
  app.use("/api", <~45 modular routers>)   // mounted FIRST  (lines ~121–261)
  await registerLegacyRoutes(app)          // monolith mounted LAST (~line 267)
```

### The hazard: first-match precedence + partial reimplementations

Express is first-match-wins. Because modules mount before the monolith, **a mounted
module silently shadows the monolith's handler for the same path.** Some modules
are faithful DB-backed extractions; others are demo/stub reimplementations. The
maintainers already hit this and left landmine comments in `routes/index.ts`
(`estimates`, `supplier-portal`, `misc.routes` are intentionally **not** mounted
because their in-memory stores shadowed real DB handlers).

This is not theoretical. A full enumeration of the booted route tree finds
**1,284 distinct routes and 43 duplicate (method, path) registrations**, including:

- **`POST /api/kiosk/check-in` (live bug):** the mounted `routes/kiosk.ts:88`
  matches against a hardcoded `demoAppointments` array (line 34) and has **no auth
  middleware**; the monolith twin at `routes.ts:16018` is `isAuthenticated` +
  DB-backed. The demo, unauthenticated handler wins — a correctness *and* auth
  regression hiding in plain sight.
- **`GET /api/payroll/periods` (x3)**, `POST /api/login` / `logout` (x2),
  and ~20 HR/loyalty/reports/documents paths.

The same class at the data layer (`IStorage` methods defined twice, the second
silently overriding the first) was the subject of PR #32; the dead-duplicate
route cleanup was PR #38. Three separate sessions rediscovered this class of bug —
evidence it is **systemic and needs a CI-enforced invariant, not one-off cleanups.**

## Decision

Adopt a **parity-gated strangler migration**, not a naive "split the file."

1. **Freeze the monolith.** No new endpoints in `routes.ts`. New routes are modules
   only.
2. **CI guardrail (landed with this ADR).** `server/__tests__/route-parity.test.ts`
   boots the real hybrid tree and fails on any duplicate (method, path) **not** in
   `route-parity.baseline.json`. The baseline captures the current 43 known dupes
   as tracked debt; it must only **shrink**. This converts the entire shadowing
   class into a permanent regression gate.
3. **Migrate one domain at a time, parity-first.** Before mounting/replacing a
   handler: snapshot the monolith handler's behavior with an integration test,
   port to a DB-backed module, prove identical responses, then mount the module
   **and delete the monolith twin in the same PR** — removing its baseline entry.
4. **Audit the already-mounted stub-marked modules** (`kiosk`, `notifications`,
   `warranty`, `quality-control`, `currency`, `sms-campaigns`, `whatsapp`) for
   active shadowing. `kiosk` is confirmed broken (above) and should be first.
5. **`storage.ts`:** diff the 993 implementations against the 916 interface decls
   to find the remaining shadowed/orphan methods (the unaudited tail of #32), then
   split into `server/storage/<domain>.ts` repositories behind the unchanged
   `IStorage` interface.

## Consequences

- New shadowing bugs become impossible to merge silently; the failure message
  names the offending route and forbids adding it to the baseline.
- The baseline is a live debt ledger: as #38 and domain migrations land, entries
  become stale and the test prints a "trim these" warning, keeping it honest.
- Short term, the 43 known dupes remain (documented), and `kiosk` carries a real
  bug that should be fixed promptly.
- Cost: each domain migration now requires a parity test up front. That is the
  point — it is cheaper than the silent regressions this has already produced.

## Verification

`route-parity.test.ts` runs against a real Postgres 16 (`TEST_DATABASE_URL`, matching
CI). Confirmed: passes at the current baseline; fails with the offending path named
when a duplicate is introduced (validated by removing `POST /api/kiosk/check-in`
from the baseline).
