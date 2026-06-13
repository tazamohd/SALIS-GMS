# Security Review — SALIS-GMS (server-side)

**Date:** 2026-06-13
**Scope:** `server/` and `shared/` — authentication, session management, RBAC/authorization, injection, CSRF, payment integrity, secrets/config, SSRF, input validation, rate limiting, sensitive-data exposure.
**Method:** manual, evidence-based code review. Findings were verified against the actual source before remediation. The contained, low-regression fixes were applied in the same change set as this report; the full test suite (40 files / 227 tests) passes with the fixes in place.

> Approach to remediation: fixes that are well-contained and verifiable were applied directly. Fixes that are **architectural** — requiring coordinated client and test changes (global CSRF enforcement, RBAC middleware wiring, the 2FA login flow) — are documented as staged follow-ups rather than half-applied, because a partial rollout would break the running client and the test suite without actually improving security.

---

## Executive summary

SALIS-GMS has solid security scaffolding (bcrypt password hashing, parameterized Drizzle queries, a constant-time CSRF token comparator, an RBAC engine, security headers, audit-log redaction, required `SESSION_SECRET`/`DATABASE_URL` at boot). The dominant risk pattern is **security controls that are defined but not wired in**, plus **authorization that trusts client-supplied identifiers**. The most serious issues — an unauthenticated, unverified Stripe webhook; tenant isolation keyed on a client-controlled `garage_id`; unauthenticated document endpoints; and unauthenticated payment routes — were directly exploitable. These have been remediated. CSRF enforcement, RBAC middleware activation, and 2FA-at-login remain as staged follow-ups.

**Overall risk before this change: CRITICAL. After the applied fixes: MEDIUM** — the unauthenticated/cross-tenant/payment-integrity and CSRF issues are resolved; residual risk is concentrated in 2FA-at-login (F6, needs client) and the default-deny safety net (F15, needs a route audit).

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
| F2 | CSRF middleware defined but never mounted | Critical | ✅ Fixed |
| F10 | Cross-tenant bulk export/backup (no garage scoping) | High | ✅ Fixed |
| F17 | Raw `error.message` returned to clients in some payment/2FA handlers | Low | ✅ Fixed |
| F19 | Dead `customer-portal.ts` defines unauth IDOR endpoints (not mounted) | Info | ✅ Removed |
| F6 | 2FA never enforced during login | High | ⏳ Follow-up (needs client) |
| F12 | 2FA secret + backup codes stored in plaintext | Medium | ⏳ Follow-up (with F6) |
| F15 | `requireAuthByDefault` gate never mounted (fail-open default) | Medium | ⏳ Follow-up (route audit) |
| F16 | `requireRole` uses an unmanaged `user.role` string parallel to RBAC tables | Medium | ⏳ Follow-up (refactor) |
| F5 | RBAC `loadUserPermissions` never mounted → `requirePermission` inert | High | N/A — dead code (0 usages) |
| F18 | `loadUserPermissions` fails open on DB error | Low | N/A — dead code (0 usages) |

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

### F2 — CSRF protection mounted and enforced (Critical)
`generateCsrfToken` + `validateCsrfToken` are now mounted in `setupAuth` (after `passport.session`, before routes) and `GET /api/csrf-token` is exposed. Design choice: the validator only enforces a token for requests **authenticated via the passport session cookie** — the only credential a cross-site attacker can ride. Public endpoints, server-to-server webhooks, the separately-authenticated customer portal, and kiosk walk-ins carry no ambient session and are therefore not subject to CSRF, which avoids a fragile public-route allowlist. Logout is exempt (forced logout is a nuisance, not a breach). The React client installs a global `fetch` interceptor (`client/src/lib/csrf.ts`, wired in `main.tsx`) that fetches the per-session token once and attaches `x-csrf-token` to every same-origin mutating request — covering both `apiRequest` and direct `fetch`. Authenticated test agents carry the token (`server/__tests__/helpers.ts`); `server/__tests__/csrf.test.ts` locks in the contract.

### F10 — Export/backup scoped to the tenant (High)
`server/routes/export.ts` (`/export/csv/:type`) and `server/routes/backup.ts` (`/backup/export/:type`) now derive `garageId` from `req.user` (403 if absent) and filter every tenant-scoped query (`users`, `invoices`, `jobCards`, `vehicles`, `appointments`) by garage. `spareParts` is a shared, non-PII catalog (no `garage_id`) and is intentionally not filtered.

### F17 — Generic error responses (Low)
The Stripe payment-intent handler and the four 2FA handlers (`setup`/`enable`/`verify`/`disable`) no longer echo `error.message` to clients; details are logged server-side only.

### F19 — Dead unauthenticated IDOR file removed (Info)
`server/routes/customer-portal.ts` — an unmounted file defining unauthenticated `/api/portal/*` endpoints keyed only on a path `customerId` — has been deleted. (The live portal is the inline, `portalAuth`-gated `/api/customer-portal/*` in `routes.ts`.)

---

## Remaining follow-ups (deliberately not auto-applied)

These require either browser end-to-end verification (which the server test suite cannot provide) or a product decision, so they are documented rather than pushed blind.

### F6 / F12 — Enforce and protect 2FA (High / Medium) — needs client
Login (`server/routes.ts`) authenticates on password alone; 2FA is never checked. Enforcing it needs a pending-2FA session state **and** a coordinated client login step (a 2FA challenge screen). Enabling server enforcement without the client change would lock out every 2FA-enabled user with no way to complete the challenge. Bundle with F12: encrypt the TOTP secret at rest (with a backward-compatible read path for any legacy plaintext) and store only hashes of backup codes.

### F15 — Default-deny gate (Medium) — needs a route audit
`requireAuthByDefault` (`server/middleware/defaultAuth.ts`) would add defense-in-depth, but mounting it globally requires a complete public-route allowlist. Concrete gaps found in the current allowlist that would break if it were mounted as-is: `/api/stripe/webhook` (server-to-server), `/api/login` & `/api/register` (legacy), `/api/plans`, `/api/customer-portal/*` (separate auth), and the public `/api/kiosk/check-in` / `/api/kiosk/walk-in`. Because a missed public route fails silently (users break, server tests stay green), this needs a deliberate audit before mounting.

### F16 — Consolidate the role model (Medium) — refactor
Authorization actually runs through `server/middleware/requireRole.ts` (a string `user.role`), which is functional. The richer RBAC tables are a parallel model; consolidating onto them is a non-trivial refactor, not a point fix.

### F5 / F18 — RBAC permission engine (N/A — dead code)
`server/rbac-middleware.ts` (`loadUserPermissions` / `requirePermission`) has **zero call sites** in the route tree (verified by grep). It is unused scaffolding, not an active gap — wiring it would be net-new feature work, not a fix. Either adopt it deliberately across routes or remove it.

---

## Positives confirmed during review
- Passwords hashed with bcrypt; login returns a constant 401 (no user enumeration).
- DB access uses Drizzle parameter binding / tagged `sql` templates — no SQL injection found.
- CSRF token comparison is constant-time.
- Session cookies are `httpOnly`, `secure` in production, `sameSite=lax`.
- WebSocket auth unsigns the cookie and validates the session against the DB.
- Audit logging redacts a sensible sensitive-field list.
- `SESSION_SECRET` / `DATABASE_URL` are required at boot; no hardcoded secrets in source.
