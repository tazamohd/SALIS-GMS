# Security Review — SALIS-GMS (server-side)

**Date:** 2026-06-13
**Scope:** `server/` and `shared/` — authentication, session management, RBAC/authorization, injection, CSRF, payment integrity, secrets/config, SSRF, input validation, rate limiting, sensitive-data exposure.
**Method:** manual, evidence-based code review. Findings were verified against the actual source before remediation. The contained, low-regression fixes were applied in the same change set as this report; the full test suite (40 files / 227 tests) passes with the fixes in place.

> Approach to remediation: fixes that are well-contained and verifiable were applied directly. Fixes that are **architectural** — requiring coordinated client and test changes (global CSRF enforcement, RBAC middleware wiring, the 2FA login flow) — are documented as staged follow-ups rather than half-applied, because a partial rollout would break the running client and the test suite without actually improving security.

---

## Executive summary

SALIS-GMS has solid security scaffolding (bcrypt password hashing, parameterized Drizzle queries, a constant-time CSRF token comparator, an RBAC engine, security headers, audit-log redaction, required `SESSION_SECRET`/`DATABASE_URL` at boot). The dominant risk pattern is **security controls that are defined but not wired in**, plus **authorization that trusts client-supplied identifiers**. The most serious issues — an unauthenticated, unverified Stripe webhook; tenant isolation keyed on a client-controlled `garage_id`; unauthenticated document endpoints; and unauthenticated payment routes — were directly exploitable. These have been remediated. CSRF enforcement, RBAC middleware activation, and 2FA-at-login remain as staged follow-ups.

**Overall risk before this change: CRITICAL. After the applied fixes: HIGH** (residual risk concentrated in the staged CSRF/RBAC/2FA items).

---

## Findings & status

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| F1 | Stripe webhook performed no signature verification — anyone could mark any invoice paid | Critical | ✅ Fixed |
| F3 | Tenant isolation keyed on client-controlled `garage_id` query param (cross-tenant read) | Critical | ✅ Fixed (customers) |
| F4 | IDOR: customer object-by-ID endpoints did no ownership check | High | ✅ Fixed (customers) |
| F8 | PayPal order/capture/setup routes were unauthenticated | High | ✅ Fixed |
| F9 | `documents` router had no auth on any route (incl. DELETE) | High | ✅ Fixed |
| F7 | Free plan upgrade: `change-plan` applied paid tiers with no payment | High | ✅ Hardened (blocked in production) |
| F11 | No password complexity check on `/api/register` | Medium | ✅ Fixed |
| F13 | Strict auth rate limiter missed the modular `/api/auth/*` + customer-portal login | Medium | ✅ Fixed |
| F14 | Request logger serialized full response bodies (incl. auth) to logs | Medium | ✅ Fixed (sensitive paths redacted) |
| F2 | CSRF middleware defined but never mounted | Critical | ⏳ Follow-up |
| F5 | RBAC `loadUserPermissions` never mounted → `requirePermission` inert | High | ⏳ Follow-up |
| F6 | 2FA never enforced during login | High | ⏳ Follow-up |
| F15 | `requireAuthByDefault` gate never mounted (fail-open default) | Medium | ⏳ Follow-up |
| F10 | Cross-tenant bulk export/backup (no garage scoping) | High | ⏳ Follow-up |
| F16 | `requireRole` uses an unmanaged `user.role` string parallel to RBAC tables | Medium | ⏳ Follow-up |
| F12 | 2FA secret + backup codes stored in plaintext | Medium | ⏳ Follow-up |
| F17 | Raw `error.message` returned to clients in some payment/2FA handlers | Low | ⏳ Follow-up |
| F18 | `loadUserPermissions` fails open on DB error | Low | ⏳ Follow-up |
| F19 | Dead `customer-portal.ts` defines unauth IDOR endpoints (not mounted) | Info | ⏳ Follow-up |

---

## Fixed in this change set

### F1 — Stripe webhook signature verification (Critical)
`server/routes.ts` `/api/stripe/webhook` previously trusted `req.body` directly, so a forged `payment_intent.succeeded` POST could mark any invoice paid. Now:
- The raw request body is captured via an `express.json({ verify })` hook (`server/index.ts`).
- The handler calls `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)` and **fails closed** if the secret is unset or the signature is missing/invalid.
- `STRIPE_WEBHOOK_SECRET` documented in `.env.example`.

### F3 / F4 — Customer tenant isolation & IDOR (Critical / High)
`server/routes/customers.routes.ts` no longer reads `garage_id` from the query string. The tenant is derived strictly from `req.user.garageId`. A `loadOwnedCustomer()` helper confirms the target customer belongs to the caller's garage before returning the customer or any of its sub-resources (vehicles, job cards, invoices, payments, notes). `POST /customers` binds the new customer to the session garage and ignores any client-supplied garage id.

### F8 — PayPal routes authentication (High)
`server/routes.ts` — `/paypal/setup`, `/paypal/order`, and `/paypal/order/:orderID/capture` now require `isAuthenticated`. (`server/paypal.ts` itself is a vendor-locked blueprint and was not modified.)

### F9 — Documents router authentication (High)
`server/routes/documents.ts` — every route now requires `isAuthenticated`. Applied per-route (not via `router.use`) because the router is mounted on `/api`; a router-level guard would have gated the entire API.

### F7 — Free plan upgrade (High)
`server/routes/subscriptions.ts` — the direct in-DB upgrade is dev scaffolding that charges nothing. It is now blocked in production (`NODE_ENV === 'production'`) for any non-STARTER plan, returning `402` until a real checkout flow gates it. Dev/test behavior is unchanged.

### F11 — Registration password policy (Medium)
`server/routes.ts` `/api/register` now requires ≥8 characters with at least one letter and one digit.

### F13 — Auth rate-limiter coverage (Medium)
`server/index.ts` binds the strict `authLimiter` to `/api/auth/login`, `/api/auth/register`, and `/api/customer-portal/login` in addition to the legacy `/api/login` and `/api/register`.

### F14 — Sensitive response bodies in logs (Medium)
`server/index.ts` — the request logger no longer serializes response bodies for auth/security/payment paths (`/api/login`, `/api/register`, `/api/auth`, `/api/customer-portal/login`, `/api/security`, `/api/stripe`, `/paypal`).

---

## Staged follow-ups (require coordinated client + test changes)

These are real and should be prioritized, but cannot be safely landed in isolation.

### F2 — Mount CSRF protection (Critical)
`server/middleware/csrf.ts` is complete but never mounted. Enforcing it requires:
1. `app.use(generateCsrfToken)` after session init and `app.use(validateCsrfToken)` before routes, plus exposing `csrfTokenRoute` at `/api/csrf-token`.
2. The React client (central fetch/`queryClient`) must fetch the token and send it as `x-csrf-token` on all mutating requests.
3. The test helpers (`server/__tests__/helpers.ts`) must fetch and attach the token for authenticated agents.
Landing only step 1 would 403 every mutating request from the client **and** turn the test suite red — hence it is staged.

### F5 / F15 — Activate RBAC and default-deny (High / Medium)
`loadUserPermissions` (`server/rbac-middleware.ts`) and `requireAuthByDefault` (`server/middleware/defaultAuth.ts`) are never mounted, so `requirePermission`/`requireRole` from the RBAC module cannot function and the API is fail-open. Mounting them globally requires auditing every route for the permissions it should enforce and providing an explicit public allowlist, or it will break legitimate access.

### F6 / F12 — Enforce and protect 2FA (High / Medium)
Login (`server/routes.ts`) authenticates on password alone; 2FA is never checked. Enforcing it needs a pending-2FA session state and a coordinated client login step. Separately, TOTP secrets and backup codes are stored in plaintext — encrypt the secret at rest and store only hashes of backup codes.

### F10 — Scope export/backup to the tenant (High)
`server/routes/export.ts` and `server/routes/backup.ts` select across all garages. Scope every query to `req.user.garageId`; reserve any cross-tenant export for a true platform-admin role.

### F16 — Consolidate the role model (Medium)
`server/middleware/requireRole.ts` derives roles from a free-form `user.role` string, parallel to (and weaker than) the RBAC tables. Consolidate on the DB-backed RBAC roles.

### F17 / F18 / F19 — Hardening (Low / Info)
Return generic error messages (log details server-side); decide whether `loadUserPermissions` should fail closed once wired; delete the dead `server/routes/customer-portal.ts` (or secure it before it is ever mounted).

---

## Positives confirmed during review
- Passwords hashed with bcrypt; login returns a constant 401 (no user enumeration).
- DB access uses Drizzle parameter binding / tagged `sql` templates — no SQL injection found.
- CSRF token comparison is constant-time.
- Session cookies are `httpOnly`, `secure` in production, `sameSite=lax`.
- WebSocket auth unsigns the cookie and validates the session against the DB.
- Audit logging redacts a sensible sensitive-field list.
- `SESSION_SECRET` / `DATABASE_URL` are required at boot; no hardcoded secrets in source.
