# Rule: Testing

Always-on testing discipline for SALIS-GMS.

- New behavior ships with a test; bug fixes ship with a regression test that
  fails before the fix and passes after.
- Test runner is **Vitest**. Scopes:
  - `npm test` — full unit/all suite (`vitest run`).
  - `npm run test:server` — server unit tests (`server/__tests__`).
  - `npm run test:integration` — route integration tests
    (`server/routes/__tests__`).
- Integration/CI tests need a reachable Postgres (`TEST_DATABASE_URL` /
  `DATABASE_URL`). CI pushes the Drizzle schema (`drizzle-kit push --force`)
  before running tests — do the same locally when schema changed.
- Shared compliance helpers (`shared/zatcaUtils`, `vatUtils`, `hijriUtils`,
  `saudi-compliance`) are heavily relied on — keep their tests green and extend
  them when changing VAT/ZATCA/Hijri logic.
- e2e specs live in `e2e/` (Playwright). Run them when changing auth or
  end-to-end workflows.
- Do not weaken or delete a failing assertion to make a suite pass — fix the
  cause or surface the failure.
