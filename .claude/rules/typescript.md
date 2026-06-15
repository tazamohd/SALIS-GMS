# SALIS — TypeScript Rules

> Extends `~/.claude/rules/ecc/typescript/*` and `ecc/common/coding-style.md`.
> This file only records what is **specific to SALIS AUTO**.

## Hard rules

- `tsconfig.json` is `strict` + `noEmit`. **Never** relax `strict`,
  `noImplicitAny`, or add `// @ts-ignore` / `as any` to silence the checker.
  Fix the type, or narrow with a real type guard.
- ESM only (`"type": "module"`). Use `import`, include extensions where the
  resolver needs them, never `require()`.
- `npm run check` must stay green. Run it before declaring any `.ts` change done.

## Server (Express) specifics

- Validate every inbound payload at the route boundary with Zod / `drizzle-zod`
  before trusting it. No raw `req.body` access in business logic.
- Async route handlers must propagate errors to the error middleware — never
  leave a rejected promise unhandled. No empty `catch {}` (see `silent-failure-hunter`).
- Keep money and tax math in integer minor units or Drizzle `numeric`. Never
  `parseFloat` a currency/VAT value.

## Async correctness

- `await` every promise or explicitly mark fire-and-forget with a comment + a
  `.catch` that logs. Webhook/payment paths must not swallow rejections.

## When changing `.ts`

Run the `typescript-reviewer` agent; for payment/auth/PII paths also run
`security-reviewer`.
