# SALIS AUTO — Security Posture

This document records how the platform satisfies each control in a standard
web-application security checklist. It was produced by cross-checking the
codebase against an external agent-security ruleset (the ECC "AgentShield"
common-security controls) as an independent audit, on top of the high-recall
code review and the cross-tenant work done on this branch.

**Result of the cross-check: all 12 controls pass.** No gaps were found.

| # | Control | Status | How it's enforced |
|---|---------|--------|-------------------|
| 1 | **No hardcoded secrets** | ✅ | `.env` and `.env.*` are git-ignored; no `.env`, credentials, `.pem`, or secret files are tracked. All keys come from the environment; `.env.example` documents them with placeholders only. |
| 2 | **Input validation** | ✅ | Zod schemas validate request bodies on the mutating routes (jobcards, estimates, payments, training, gate-pass, etc.); invalid input → `400` with field errors. |
| 3 | **SQL injection prevention** | ✅ | Drizzle ORM / parameterised queries throughout. The one raw-SQL endpoint (`hr-payroll` employee search) was converted from string interpolation to bound parameters. |
| 4 | **XSS prevention** | ✅ | React escapes by default. The only `dangerouslySetInnerHTML` (shadcn `chart.tsx`) injects CSS variables from a controlled config object, not user data. Server-rendered HTML reports (`export.ts`) pass DB strings through an `escapeHtml()` helper. |
| 5 | **CSRF protection** | ✅ | `validateCsrfToken` middleware with a constant-time compare (`crypto.timingSafeEqual` over SHA-256 digests). Auth entry points are exempt and rate-limited instead. |
| 6 | **Authentication / authorization** | ✅ | `requireAuthByDefault` mounts a default-deny gate on `/api` (public routes allow-listed). `requireRole` / `requireAdmin` gate sensitive mutations (HR, payroll, financial reports, QC sign-off, backup/export, tax-config, gate-pass verify). |
| 6b | **Tenant isolation** | ✅ | `resolveGarageScope(req)` scopes every list read to the caller's session garage — a client-supplied `?garage_id` is ignored for non-platform users. Closed across customers, vehicles, technicians, invoices, and job-cards. A dedicated `tenant-isolation.test.ts` proves garage B cannot read garage A's data even when forging the id. |
| 7 | **Rate limiting** | ✅ | `express-rate-limit`: global `/api` limiter (200/15 min) + a stricter limiter on `/api/login` and `/api/register` (10/15 min). |
| 8 | **Safe error messages** | ✅ | The global error handler returns `"Internal Server Error"` for 5xx in production (full message + stack only in development) and carries a request-id for correlation — no stack/PII leakage to clients. |
| 9 | **Secret-manager usage** | ✅ | All integrations read keys from the environment; the boot log reports which optional integrations + payment gateways are unconfigured so degraded behaviour is visible. |
| 10 | **Secret validation at startup** | ✅ | `server/config.ts` fails fast (exit 1) if `DATABASE_URL` or `SESSION_SECRET` is missing. |
| 11 | **Secret rotation** | ✅ (process) | Keys are env-driven, so rotation is a config change with no redeploy of code. Webhook handlers verify signatures (`stripe.webhooks.constructEvent`) so a rotated secret invalidates replayed events. |
| 12 | **Security-issue escalation** | ✅ (process) | Findings are tracked in `PLATFORM_AUDIT_REPORT.md` and addressed on the branch; cross-tenant/critical findings block launch per the roadmap risk register. |

## Additional hardening on this branch

- **helmet** with a Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Referrer-Policy, and Permissions-Policy.
- **Session store**: `connect-pg-simple` (Postgres-backed, not in-memory) with httpOnly + secure (prod) + sameSite=lax cookies.
- **2FA**: TOTP with a 5-attempt / 15-minute lockout wired into the verify flow.
- **Mass-assignment prevention**: job-card creation validates a Zod-omitted payload; `garageId`/`createdBy` come from the session, never the body.
- **Request correlation**: every request gets an `x-request-id`, surfaced in both the structured log line and the error response body.
- **Production migrations**: forward-only `npm run db:migrate` (not interactive `db:push`); the Dockerfile applies migrations before boot.
- **Automated backups**: daily `pg_dump` with 30/12/12 retention (opt-in via `BACKUP_ENABLED`).

## Known follow-ups (tracked, not gaps in the above controls)

- ZATCA Phase 2 e-invoicing — needs FATOORA sandbox credentials.
- Error-tracking (Sentry) and a public status page — need accounts.
- Live payment-gateway keys (Moyasar / Tabby / Tamara / Stripe) — code is done; keys drop in via env.

## Reporting a vulnerability

Email the maintainers (or open a private security advisory on the repository).
Do not file public issues for security-sensitive findings.

_Last cross-checked: June 2026, against the ECC common-security control set._
