---
name: running-dev-cycle
description: Running the gated implementation cycle for SALIS-GMS — implement a planned feature task-by-task through ordered quality gates (TDD, typecheck, RBAC, review, validation) for the TypeScript/Express/React/Drizzle stack. Use when starting or resuming implementation of a feature that has a plan or task list. Each task closes only when all gates pass. Skip for one-line fixes (just TDD + commit) or planning (use planning-features).
---

# Running the Dev Cycle (SALIS-GMS)

Adapted from Ring's `running-dev-cycle`. Drives a planned feature to done one
task at a time, never skipping gates. Works against this repo's real commands.

## Inputs

- A task list / plan (from `planning-features`) — or an explicit list of changes.
- If there's no plan and the work touches >1 file or adds a route/table, stop and
  run `planning-features` first.

## Per-task gates (in order)

For **each** task, do not advance until the current gate passes.

### Gate 0 — Implement with TDD
Follow `test-driven-development`. RED (failing test, pasted) → GREEN → REFACTOR.
- Backend route/service work → think like the `backend-ts` agent.
- React/UI work → think like the `frontend-react` agent.

### Gate 1 — Typecheck clean
Run `npm run check`. Zero errors. No new `any`. Fix before continuing.

### Gate 2 — Tests green
Run the narrowest suite that covers the change, then the full one:
- `npx vitest run <file>` → `npm run test:server` / `npm test`.
- Server tests require Postgres + pushed schema (see CLAUDE.md).

### Gate 3 — Security & contract checks (for any route/data change)
- New/changed API route is **RBAC-protected** (auth + role middleware).
- Input validated with **Zod at the boundary** before the service layer.
- DB access via **Drizzle** only; no string-built SQL with user input.
- Errors return a consistent JSON shape and correct status codes.
- No secrets/PII logged.

### Gate 4 — Compliance (when touching financial/invoice/date logic)
Reuse the tested utilities in `shared/` — `vatUtils`, `zatcaUtils`, `hijriUtils`,
`saudi-compliance`. Never re-derive VAT (15%), ZATCA QR, TRN, or Hijri logic.

### Gate 5 — Format
`npm run format` (prettier: single quotes, semicolons, trailing commas, width 100).

## Epic cadence (after a group of related tasks)

When a coherent slice is done (an "epic"), before merge:
- Run `reviewing-code` over the cumulative diff (parallel reviewers).
- Resolve every blocking finding, re-run Gates 1–2.
- Commit with `committing-changes` (atomic conventional commits).

## Definition of Done (the whole feature)

- [ ] Every task's tests written test-first and passing.
- [ ] `npm run check` clean.
- [ ] Full suite green locally and in CI (`.github/workflows/test.yml`).
- [ ] New routes RBAC-protected, inputs Zod-validated.
- [ ] Compliance utils reused, not reimplemented.
- [ ] `reviewing-code` run; no unresolved blockers.
- [ ] Conventional commits, one concern each.

## Anti-patterns

- Marking a task done with a failing/`skip`ped test → not done.
- "Typecheck errors are unrelated" → fix or file them; never merge red.
- Batching ten files then writing tests → that's not TDD; reset to Gate 0.
- Adding a route without RBAC "for now" → that's a shipped security hole.
