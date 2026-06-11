---
description: Security review of SALIS-GMS changes — auth, RBAC, validation, multi-tenant isolation, secrets, ZATCA integrity.
argument-hint: "[optional: path or 'branch']"
allowed-tools: Read, Grep, Glob, Bash
model: inherit
---

# SALIS-GMS Security Review

Audit the changes (or the whole area named in `$ARGUMENTS`) for security issues.
Stack: Express + Passport session auth + Drizzle + Zod. This is a multi-tenant
ERP handling payments and Saudi tax records, so isolation and integrity matter.

## Scope
Default to the branch diff (`git diff main...HEAD`). Read changed handlers,
middleware, and any schema/storage changes in full.

## Threat checklist

### Authentication & sessions
- Every new route requires an authenticated session unless explicitly public
  (`server/routes/public.ts`). Check for missing auth guards.
- Session config: `SESSION_SECRET` required; cookies httpOnly/secure in prod;
  2FA paths not bypassable.

### Authorization (RBAC)
- Permission enforced via `server/rbac-middleware.ts` with the correct role of
  the 7 (Super Admin, Garage Owner, Manager, Service Advisor, Technician, Parts
  Manager, Accountant). Flag any endpoint that trusts a client-supplied role or
  skips the check.

### Multi-tenant isolation
- Every query touching tenant data must filter by garage/branch derived from
  the authenticated user — never from a client-supplied id alone. Flag IDOR:
  reading/updating a record by `:id` without verifying tenant ownership.

### Input validation & injection
- Request bodies/params validated with Zod (`insert*` schemas from
  `@shared/schema`). No string-built SQL — Drizzle parameterized only.
- File uploads / export endpoints: validate type/size; no path traversal.

### Secrets & data exposure
- No secrets, tokens, card data, or PII in logs or error responses. Stripe/
  PayPal/Twilio/OpenAI keys read from env, never hardcoded. Stack traces not
  leaked to clients in prod.

### Financial & ZATCA integrity
- Amounts/VAT computed server-side via `@shared/vatUtils`; invoice totals not
  trusted from the client. ZATCA QR via `@shared/zatcaUtils` — TRN format
  (15-digit) and required fields preserved.
- Webhook handlers (Stripe/PayPal) verify signatures before acting.

### Other
- Rate limiting (`express-rate-limit`) on auth/sensitive endpoints; audit
  logging (`auditMiddleware`) for state-changing actions; no open CORS regress.

## Report
List findings by severity (**Critical / High / Medium / Low**) with `file:line`,
the attack scenario, and the fix. Note residual risks. Don't change code unless
asked to remediate.
