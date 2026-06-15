# Rubric: Test Coverage & Quality

Coverage is a floor, not a goal. Meaningful tests beat high percentages.

## Hard gate

- `npm run coverage:gate` passes against `.coverage-thresholds.json` (global + the
  per-path floors for `shared/vatUtils.ts`, `zatcaUtils.ts`, `hijriUtils.ts`).
- New domain logic in `shared/` ships with unit tests covering edge cases.
- A bug fix ships with a regression test that fails before the fix.

## Quality bar (a reviewer rejects coverage-padding)

- Each test asserts real behavior/output, not just "did not throw".
- Route/integration tests assert status codes, RBAC enforcement, `garageId`
  isolation, and Zod-validation rejections — not only happy paths.
- Tests are deterministic: no real clock/network/order dependence; seed fixed data.
- One behavior per test; names describe the behavior.

## Domain edge cases to cover

- **VAT**: rounding at fils precision; zero/negative; inclusive vs exclusive.
- **ZATCA**: TLV/QR encoding correctness; required fields present; base64 output.
- **Hijri**: Gregorian↔Hijri boundary dates; month-length edge cases.
- **Zakat**: 2.5% rate; nisab thresholds where applicable.
- **TRN**: 15-digit validation; reject malformed.

## When a path is genuinely untestable

Don't weaken assertions. Either refactor for testability or exclude it in
`vitest.config.ts` coverage `exclude` with a one-line reason, and record a `decision`
in the knowledge base.
