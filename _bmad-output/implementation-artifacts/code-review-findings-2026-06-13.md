# Code Review Findings — Multi-Tenant Isolation & Security (2026-06-13)

Adversarial review of commits `5723b31..HEAD` (Stories 1.1–1.7, 2.1–2.2, 4.2, 5.1–5.2).
Three layers: Blind Hunter, Edge Case Hunter, Acceptance Auditor.

Triage buckets: **[D]** decision-needed · **[P]** patch (unambiguous) · **[Defer]** real but phased/pre-existing · dismissed-as-noise dropped.

## 🔴 Critical — unambiguous patches (NOT part of the documented tail)

- [ ] **[P] Whole-database CSV/report export** — `GET /api/export/csv/:type` and `/api/export/report/:type` run `db.select().from(table).limit(10000)` with **no garage filter**, gated only by `requireAdmin`. Any garage admin exports every tenant's customers/invoices/vehicles/job-cards. [server/routes/export.ts:46,174] (edge)
- [ ] **[P] reports/dashboard raw SQL `garageId || '1'` fallback** — handlers derive `const garageId = req.user?.garageId || '1'` and query via raw `db.execute`, bypassing `garageScope` entirely; a null-garage user reads **garage '1'**'s data. [server/routes/reports.ts, server/routes/dashboard.ts] (edge)
- [ ] **[P] `GET /api/payments` + `getPayments()` leak all tenants** — raw join with no garage WHERE; `getPayments()` keeps the legacy `else return ALL` fallback. [routes/invoices.routes.ts:240, storage.ts:3681] (edge+auditor)
- [ ] **[P] FR-2 not met: customer/user creates not stamped** — `POST /api/customers` inserts body `garageId` raw via `createUser`; Garage-A caller can create a customer in Garage B. Story 1.3 AC overclaims. [routes/customers.routes.ts:20-47, storage.ts:2108] (auditor+edge)
- [ ] **[P] Story 1.7 cross-tenant write test is vacuous** — the PATCH it asserts has no route, so it 404s by absence, not by scoping. False proof of write-isolation. [server/__tests__/tenant-isolation.test.ts] (auditor)
- [ ] **[P] `getJobCardWithDetails(id)` unscoped** — the heavily-used full-job-card getter (+ its child vehicle/tech/invoice/payment reads) leaks by known id. [storage.ts:2224] (edge)
- [ ] **[P] Customer/invoice sub-resource getters unscoped** — `getCustomerVehicles`, `getCustomerJobCards/Invoices/Appointments`, `getInvoiceItems` filter by FK only, ignoring `garageId`. Reachable via `/api/customers/:id/*`, `/api/invoices/:id/items`. [storage.ts:2626,4582-4609,3643] (edge+auditor)

## 🟠 Decision-needed (architecturally significant — need your call)

- [ ] **[D] Platform-principal = "no garageId"** — `isPlatformPrincipal = !garageId`. Any account with a NULL `garageId` (half-provisioned user, detached staff, deleted-garage FK null-out) becomes a super-admin who can impersonate **any** tenant. No explicit super-admin flag. [tenant-scope.ts, impersonation.ts:680] (blind+edge+auditor)
- [ ] **[D] Platform principals bypass the audited impersonation flow** — `resolveScopedGarageId` returns the **client-supplied** `garageId` for platform principals, so they read any tenant via `?garageId=` with no impersonation session and no audit. [tenant-guard.ts:1661-1663] (blind+edge)
- [ ] **[D] `garageScope`/`stampGarageId` fail OPEN with no scope** — return `sql\`true\`` / write client-supplied `garageId` when no ALS scope. Deliberate for background jobs, but the shared storage layer fails open whenever a caller isn't in a request (workflow engine, WS pre-auth, non-`/api` routes). Fail-open vs fail-closed is a design decision. [tenant-guard.ts] (blind+edge)

## 🟡 Important patches

- [ ] **[P] Remaining create paths not stamped** — `createPayment`, `createInvoiceWithItems`, `createEstimate`, `createPurchaseOrder` insert raw. [storage.ts:3691,3661,3728,...] (edge)
- [ ] **[P] FR-9 audit not DB-immutable** — `audit_log` has no `REVOKE UPDATE/DELETE` grants (AD-7 requires them); immutability is convention-only. [services/audit-trail.ts:20-37] (auditor)
- [ ] **[P] Impersonation hardening** — `getGarageById` doesn't check `is_active` (can impersonate a suspended garage); `startedAt` recorded but never enforced (no time-box); `actorUserId` never compared to `req.user.id`. [impersonation.ts, tenant-scope.ts] (edge)

## ⚪ Deferred (real but phased / pre-existing — tracked, not fixed now)

- [x] **[Defer] Long-tail unscoped methods** — estimates, purchase_orders, spare parts, HR detail getters/mutators, job-card sub-resources; legacy `else return ALL` in `getEstimates`/`getPurchaseOrders`. The documented ~170-method tail (RLS 1.6 + CI guard 6.2 + harness 6.1). **Note:** the RLS migration's table list currently omits these too. (edge+auditor)
- [x] **[Defer] MFA not required for privileged un-enrolled roles** — `mfaRequiredForRole` is dead code; documented staged rollout. (blind+edge+auditor)
- [x] **[Defer] 2FA lockout in-memory/per-process + RMW race** — pre-existing in `twoFactorAuth.ts`; bypassable across instances. (edge)
- [x] **[Defer] Isolation-leak audit fires only on create mismatch** — update/delete cross-tenant 0-row case emits no audit (FR-2 AC#3 partial). (auditor+blind)
- [x] **[Defer] WebSocket scope gaps** — platform/branch users get wrong scope; `getChatParticipants` unscoped; pre-auth messages unscoped. (blind+edge)
- [x] **[Defer] `unsafeCrossTenant` escape hatch (AD-2/FR-4) not implemented.** (auditor)
- [x] **[Defer] Audit writes `.catch(()=>{})` swallow failures** on the highest-privilege actions (impersonation/leak). (blind+edge)
- [x] **[Defer] `isBranchRestricted` from single `user.role` string** — ignores actual role bindings (latent; `branchScope` unused). (edge)
- [x] **[Defer] `tenantContextMiddleware` runs before `loadUserPermissions`** — `req.userRoles` never preloaded → extra `user_role_branch` query per request. (edge)
- [x] **[Defer] RLS gated/inert** — `withGarageRLS` unwired; migration omits leaking tables + `users`; empty-string-GUC vs NULL latent. Accurately disclosed by Story 1.6. (blind+edge+auditor)
- [x] **[Defer] Legacy `/api/login` (routes.ts:715) shadowed but un-hardened** — latent fixation/MFA-bypass if mount order changes. (edge)
