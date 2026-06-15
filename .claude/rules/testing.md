# SALIS — Testing Rules

> Extends `~/.claude/rules/ecc/common/testing.md` plus the `tdd-workflow`,
> `verification-loop`, and `react-testing` skills.

## Tooling

- **Vitest** for unit + integration (`server/__tests__`, `server/routes/__tests__`,
  `shared/*.test.ts`).
- **Playwright** for e2e (`e2e/`).
- Coverage via `npm run test:coverage` — target ECC's 80%+ on changed code.

## TDD workflow

1. Write the failing test first (RED) — use `tdd-guide` / `/react-test`.
2. Implement the minimum to pass (GREEN).
3. Refactor (keep green).

## What must have tests

- Compliance math: ZATCA, VAT, Zakat, Hijri (`shared/*Utils.ts`) — these already
  have suites; extend them, never regress them.
- Payment, RBAC, auth, and webhook paths — behavioral tests, not just happy path.
- New API routes — integration test through the route boundary.

## Critical e2e flows (Playwright)

Checkout/payment, invoice + ZATCA QR generation, login + 2FA. Use the
`e2e-runner` agent for new/maintained journeys; avoid flaky timeout-based waits.

## Gate before commit

`npm run check && npm test` (plus relevant e2e) must pass.
