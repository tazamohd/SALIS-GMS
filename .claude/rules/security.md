# SALIS — Security Rules (HIGHEST PRIORITY)

> Extends `~/.claude/rules/ecc/common/security.md` and `ecc/web/security.md`.
> SALIS is a financial + regulated (Saudi ZATCA/VAT) app — treat security as
> blocking, not advisory.

## Secrets & sensitive data

- Never log, print, or commit: secrets/API keys, card data, TRNs (15-digit tax
  numbers), or full customer PII. `.env`, `.env.*`, `*.key`, `*.pem`, and
  `user_credentials.csv` are gitignored and read-denied in `.claude/settings.json`
  — keep it that way.
- Load all secrets from env / secret manager; validate required ones at startup.

## Payments (Stripe / PayPal — `server/paypal.ts`)

- Verify webhook signatures before acting on any payment event. No trust without
  verification.
- Payment/refund handlers must not swallow errors or fall back silently — a
  failed charge must surface, never be treated as success.
- Reconcile amounts in integer minor units; never float currency.

## Auth, RBAC, 2FA

- Gate every new/changed route through `server/rbac-middleware.ts`. Do not invent
  a parallel auth check or bypass RBAC.
- 2FA/TOTP logic lives in `server/twoFactorAuth.ts`; changes there require a
  `security-reviewer` pass.
- Sessions: secure, httpOnly, sameSite cookies; never expose session secrets.

## Input handling

- Validate and sanitize all external input (API, webhooks, file uploads) at the
  boundary. Parameterized queries only — Drizzle, never string-built SQL.

## Mandatory review trigger

Any change to auth, RBAC, 2FA, payments, API routes, PII, or ZATCA/VAT data:
**STOP and run the `security-reviewer` agent (or `/security-review`) before commit.**
