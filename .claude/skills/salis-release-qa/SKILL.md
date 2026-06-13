---
name: salis-release-qa
description: "End-to-end release QA and launch-readiness gate for the SALIS AUTO ERP (TypeScript full-stack: React/Vite client, Express/Drizzle server). Covers type-checks, lint/format, unit + integration + E2E tests, DB migrations, RBAC/2FA security checks, and Saudi ZATCA/VAT compliance verification. Run before every deploy or after any major change."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-06-13"
tags: [qa, testing, release, typescript, drizzle, playwright, vitest, rbac, zatca, saudi, compliance, deployment]
tools: [claude, claude-code]
version: 1.0.0
---

# SALIS AUTO — Release QA & Launch Gate

The end-to-end "definition of done" for shipping SALIS AUTO. Run this before every production
deployment, or after any major change to the server, schema, RBAC config, or compliance logic.

> Stack: React 18 + Vite client, Express + Drizzle ORM server, PostgreSQL, Vitest (unit/integration),
> Playwright (E2E), TypeScript end-to-end. Saudi-market compliance: 15% VAT, ZATCA e-invoicing, TRN.

---

## When to Use

- Before any deploy to Railway / Render / Docker.
- After changing `shared/schema.ts`, running new migrations, or editing RBAC (`server/rbac-config.ts`,
  `server/rbac-middleware.ts`).
- After touching auth/2FA (`server/auth.ts`, `server/twoFactorAuth.ts`) or audit logging
  (`server/auditMiddleware.ts`).
- After any change to ZATCA / VAT / TRN logic (`shared/zatcaUtils.ts`, `server/services/zatca-phase2.ts`,
  `server/routes/saudi.ts`).

---

## The Validation Sequence

Run in order. **Stop and fix on the first failure** before continuing — a green later step does not
excuse a red earlier one.

```bash
# 1. TypeScript — must be zero errors (project guarantees "Zero TypeScript Errors")
npm run check

# 2. Lint + format
npm run lint
npm run format -- --check    # or `npm run format` to auto-fix

# 3. Unit + integration tests
npm run test                 # full Vitest suite
# Narrower targets when iterating:
#   npm run test:server       # server/__tests__
#   npm run test:integration  # server/routes/__tests__
npm run test:coverage        # confirm coverage hasn't regressed

# 4. Database schema + migrations
npm run db:push              # apply Drizzle schema to the target DB
npm run db:verify            # scripts/verify-db.ts — confirm schema integrity

# 5. Production build (client + server bundle)
npm run build

# 6. E2E smoke (Playwright; auto-starts `npm run dev` on :5000)
npx playwright test          # e2e/auth.spec.ts, e2e/workflow.spec.ts
```

---

## Security Checklist (must pass before release)

- [ ] **RBAC** — every new route is wrapped with the correct permission middleware; no route is
      unintentionally public. Cross-check `server/rbac-config.ts` and `server/routes/*`.
- [ ] **AuthN/2FA** — protected endpoints require a valid session; 2FA-gated actions stay gated.
- [ ] **Audit trail** — state-changing endpoints flow through `server/auditMiddleware.ts`.
- [ ] **Secrets** — no secrets committed; all config read from env (see `.env.example`).
      Diff against `.env.example` for any new required vars.
- [ ] **Tenancy** — multi-tenant queries are scoped by tenant; no cross-tenant data leakage.

For deeper checks use the companion skills: `container-security-hardening` (Docker), `bumblebee` /
`skill-audit` (supply chain), and `security/*` (cloud/secrets).

---

## Saudi / ZATCA Compliance Gate

If the change touches invoicing, tax, or customer/tax identifiers, verify:

- [ ] **15% VAT** computed correctly on taxable lines; rounding matches ZATCA rules.
- [ ] **ZATCA e-invoice** payload + QR (TLV) generated and validated — run the ZATCA unit tests:
      ```bash
      npx vitest run shared/zatcaUtils.test.ts
      ```
- [ ] **TRN** validated as 15 digits where required.
- [ ] **Hijri dates / Arabic RTL** unaffected by the change where surfaced in invoices.

Reference: `shared/zatcaUtils.ts`, `server/services/zatca-phase2.ts`, `server/routes/saudi.ts`.

---

## Definition of Done

A change is release-ready only when:

1. `npm run check` → **0 errors**
2. `npm run lint` → clean; formatting applied
3. `npm run test` + `npm run test:coverage` → green, coverage not regressed
4. `npm run db:push` + `npm run db:verify` → schema consistent
5. `npm run build` → succeeds
6. `npx playwright test` → E2E green
7. Security checklist → all boxes checked
8. ZATCA/VAT gate → passing when invoicing/tax touched
9. `git status` → only intended files changed; no stray secrets or build artifacts
