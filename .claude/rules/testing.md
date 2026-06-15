# Rule: Testing

Always-on testing discipline for SALIS-GMS.

- New behavior ships with a test; bug fixes ship with a regression test that
  fails before the fix and passes after.
- Test runner is **Vitest**. Scope your runs:
  - `npm test` — full suite (`vitest run`).
  - `npm run test:server` — server unit tests (`server/__tests__`).
  - `npm run test:integration` — route/integration tests
    (`server/routes/__tests__`).
- Integration tests need a reachable Postgres. CI provisions Postgres 16 and
  runs `drizzle-kit push --force` before `npm test`; mirror that locally via
  `TEST_DATABASE_URL` / `DATABASE_URL`.
- Shared compliance helpers (`shared/*Utils.ts`: zatca / vat / hijri /
  saudi-compliance) have colocated `*.test.ts` — keep them green; they encode
  legal/financial rules (15% VAT, ZATCA QR, Hijri dates, TRN).
- e2e lives in `e2e/` (Playwright). Don't break `auth.spec.ts` /
  `workflow.spec.ts`.
- A change is not "done" on confidence — it's done on a green `npm run check`
  plus passing tests.
