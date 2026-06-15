---
description: Run the test suite with coverage and enforce the thresholds in .coverage-thresholds.json.
---

Run the coverage quality gate.

1. Ensure the coverage provider is available. If `npm run test:coverage` fails with a
   missing `@vitest/coverage-v8`, install it dev-only first:
   `npm i -D @vitest/coverage-v8` (CI's `quality-gate` workflow does this
   automatically).
2. Run: `npm run coverage:gate`
   (this runs `vitest run --coverage` then `node scripts/coverage-gate.mjs`).
3. Report the PASS/FAIL table. On failure, list exactly which metrics/files are below
   floor.

If coverage is below threshold, do **not** lower the thresholds to pass. Instead,
hand off to the `test-engineer` to add meaningful tests for the uncovered paths
(prioritize domain math in `shared/` and route handlers). Lowering a threshold
requires an explicit recorded decision in `.claude/knowledge/knowledge.jsonl`.
