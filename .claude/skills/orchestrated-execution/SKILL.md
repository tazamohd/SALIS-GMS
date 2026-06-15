---
name: orchestrated-execution
description: The 4-phase execution loop (IMPLEMENT → VALIDATE → ADVERSARIAL REVIEW → COMMIT) run per work unit in SALIS-GMS. Use when implementing any planned work unit so each change is independently verified before it lands.
---

# Orchestrated Execution — the 4-phase loop

Run this once per **work unit** (a small, independently testable slice with a declared
file scope and Definition of Done). The orchestrator drives it and verifies every
phase independently — **never trusting a subagent's self-report**.

## Phase 1 — IMPLEMENT

- Delegate to `coder` (and `test-engineer` for test work). Stay within the unit's
  declared file scope.
- TDD where practical: write/extend the failing test first for `shared/` domain logic
  and route handlers, then implement.
- Reuse shared Zod schemas and `shared/*Utils.ts`; add routes under modular
  `server/routes/`.

## Phase 2 — VALIDATE (orchestrator runs these itself)

```bash
npm run check                 # zero TS errors
npm test                      # or scoped: npm run test:server / test:integration
npm run lint                  # clean for touched files
```

If the unit touches covered code, also `npm run coverage:gate`. Do not proceed while
red. Inspect `git diff` — confirm the change matches the plan and nothing leaked
outside scope.

## Phase 3 — ADVERSARIAL REVIEW

- Delegate to `adversarial-reviewer` (a different agent than the writer). Add
  `security-auditor` if the unit touches auth, RBAC, payments, PII, tenant data, or
  integrations.
- Reviewer must produce `file:line` evidence and re-run gates. Verdict APPROVE or
  REQUEST CHANGES against `.claude/rubrics/`.
- On REQUEST CHANGES: loop back to Phase 1. After **3** failed iterations on the same
  unit, escalate to the human.

## Phase 4 — COMMIT

- Only after an APPROVE. Commit with a clear, scoped message describing the unit.
- Update the TodoWrite checklist to reflect the unit as done.
- Move to the next unit. When all units are done, run the **Final Review** (full
  `npm test` + `npm run coverage:gate` + `npm run lint` + `npm run check`) before PR.

## Invariants

- Tenant isolation (`garageId`) and RBAC preserved.
- No edits to vendor-locked `server/paypal.ts`.
- Each commit leaves the tree green.
