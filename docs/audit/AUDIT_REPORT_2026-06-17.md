# SalisAuto GMS — Comprehensive Audit Report (Consolidated)
**Date:** 2026-06-17 · **Branch:** pr-branch · **Method:** automated baseline + two multi-agent static-audit passes (per-route deep-trace of 67 files + 6 cross-cutting passes), adversarially verified.

**Run stats:** 268 agents total, ~22.6M analysis tokens, 67 route files traced, 320 raw findings → de-duplicated/verified below.

> ## ⛔ Verdict: NOT RELEASABLE
> ~16 Critical defects block release. The dominant flaw is **systemic missing multi-tenant isolation** in `server/routes/**` — 43 of 67 route files have no/defeated tenant guard, producing live cross-tenant leakage of customer PII, revenue, VAT, audit trails, inventory, and payments. Two declared security controls (fine-grained RBAC, CSRF) are implemented but **never wired into the request path**. The ZATCA/VAT compliance surface is materially incorrect. Per project rules, a missing tenant guard is itself a Critical finding.

---

## 0. Automated Baseline (whole codebase)

| Gate | Command | Result |
|------|---------|--------|
| TypeScript | `npm run check` (`tsc`) | ✅ PASS — zero type errors |
| Build | `vite build && esbuild` | ✅ PASS — exit 0 |
| Tests | `vitest run` (PG16 test DB) | ✅ 266 passed / 0 failed (44 files) |
| Lint | `npm run lint` (`eslint .`) | ❌ BROKEN — eslint not installed; pre-commit gate can't fully run |

- **B-1 (High):** `npm run lint` is non-functional → the mandated `check && lint && test` gate has a hole.
- **B-2 (Medium):** Only ~8 of 67 route files have dedicated tests; ~59 (incl. payments, subscriptions, auth, invoices, crm) have **no direct route tests**. Green ≠ covered.

### 0b. Live E2E (representative smoke, dev server :5000)
Ran the app and drove the critical path (login → dashboard) via the browser. **Login→dashboard works end-to-end** with real seeded data (nav groups, job cards, invoices/payments activity, Arabic toggle); **no client console errors**; `POST /api/login → 200`.
- **LE-1 (High, security):** The login page **renders working demo credentials in the UI** (`admin@salisauto.com / admin123`, `tech@salisauto.com / tech123`). Must be removed/gated for production (`client/src/pages/Login.tsx`).
- **LE-2 (Medium, security):** Boot throws `express-rate-limit` `ERR_ERL_KEY_GEN_IPV6` at `server/routes/uploads.ts:91` — custom keyGenerator uses raw IP without the IPv6 helper → IPv6 clients can bypass the upload rate limit.
- **LE-3 (Info/High-latent):** 4/6 integrations disabled at boot → routes return **mock data or 503**: Twilio SMS, GetResponse email, TecDoc parts, **ZATCA e-invoicing** (corroborates X3/H-x*). OpenAI absent → AI features return mock responses. These are config-gated, but the UI does not signal "mock" to users.
- **LE-4 (Low):** Marketing landing embeds a dashboard mock with mixed real/placeholder metrics (`REVENUE SAR 51,637` but `ACTIVE JOBS 0 / BAYS OPEN 0 / CSAT 0%`).
- **Note:** exhaustive every-button/every-form coverage across 156 modules is not feasible by manual clicking — it should be a generated Playwright suite seeded from §7's recommended tests. This pass verified the critical path + boot health only.

---

## 1. Combined Critical Roll-Up (release-blocking)

### Group A — Tenant isolation / financial access (per-route pass)
| ID | File | Defect |
|----|------|--------|
| C1 | `crm.ts` | All queries unscoped → any staff user reads **all** garages' customer PII, spend, loyalty |
| C2 | `crm.ts:61` | IDOR on `GET /crm/customers/:id` — any UUID returns another tenant's profile + job/invoice history |
| C3 | `reports.ts` | No RBAC on `/reports/revenue|summary|customer-analytics|…` — technician/customer reads garage-wide financials + PII |
| C4 | `audit.ts:7,24,29` | Hardcoded `garageId \|\| '1'` → reads garage 1's audit trail **and** `POST /audit/seed` forges compliance entries |
| C5 | `warranty.ts` | Contracts/claims are global in-memory arrays, no `garageId` — cross-tenant read + claim approval |
| C6 | `whatsapp.ts` | Global in-memory conversations → any user gets every tenant's customer phone PII |
| C7 | `sms-campaigns.ts` | Global in-memory campaigns → cross-tenant send + SMS cost |
| C8 | `inventory-management.ts` | `garageId ? eq(...) : undefined` → null-garage principals get **all** tenants' inventory/costs/prices |
| C9 | `inventory.routes.ts` | id-only `PATCH/DELETE /spare-parts/:id` + client-supplied `garageId` → cross-tenant mutate/delete |
| C10 | `payments.routes.ts` | PK-only storage queries; `payment_plans`/`installments` have no `garageId` → cross-tenant financial IDOR |
| C11 | `export.ts` | `GET /export/csv/:type` — every table exported with no tenant filter |
| C12 | `export.ts` | `GET /export/report/:type` — financial aggregates summed across **all** garages |

### Group B — Unwired security controls & compliance (cross-cutting pass)
| ID | File | Defect |
|----|------|--------|
| X1 | `rbac-middleware.ts` + `rbac-config.ts` | 1,270-line permission matrix is **dead code** — zero call sites, never mounted. `SECURITY.md` falsely claims active |
| X2 | `middleware/csrf.ts` | CSRF implemented but **never mounted** — every state-changing endpoint exposed. Falsely claimed active |
| X3 | `saudi.ts` (ZATCA) | Uses `garages.licenseNumber` as the VAT TRN (no VAT column in schema) → legally-malformed e-invoices, clearance rejection |
| X4 | `client/src/lib/queryClient.ts` callers | `apiRequest(url, method)` arg-order bug across ~12 pages → dozens of mutations silently never hit their endpoint |

---

## 2. Critical Findings — detail (per-route pass)

### C1. CRM: all queries lack tenant scoping — cross-tenant PII + revenue leak
- **Location:** `server/routes/crm.ts` — `/crm/customers` L10-56, `/crm/segments` L136-180, `/crm/loyalty/summary` L185-239, `/crm/retention` L270-379.
- **Evidence:** Router imports only `db`/`sql`, never `resolveGarageScope`; no query references `garage_id`. Global `enforceGarageScopeOnQuery` does nothing because handlers never read the param.
- **Impact:** Any authenticated staff user of garage A receives all garages' customer PII (`full_name`, `email`, `phone`), spend totals, loyalty tiers.
- **Fix:** `resolveGarageScope(req)` + `AND u.garage_id = ${garageId}` on every query/join; reject unresolved scope for non-cross-garage roles.

### C2. CRM: IDOR on `GET /crm/customers/:id`
- **Location:** `crm.ts` L61-131. **Evidence:** `WHERE u.id = ${id}` + history subqueries by `customer_id` with no `garage_id`.
- **Impact:** Garage-A user reads another garage's full customer profile, job/invoice/appointment history by UUID.
- **Fix:** Scope lookup + every subquery with garage id; 404 cross-garage.

### C3. Reports: no RBAC on financial/customer endpoints
- **Location:** `reports.ts` `/reports/revenue` L8, `/technician-performance` L27, `/inventory-turnover` L47, `/customer-analytics` L68, `/summary` L89.
- **Evidence:** No `isAuthenticated`/`requireRole`. Monolith equivalent gates with `requireRole(['ADMIN','MANAGER','ACCOUNTANT'])` (`routes.ts:4688`).
- **Impact:** technician/customer session reads garage-wide financials (incl. tax) and all customer PII.
- **Fix:** Add `isAuthenticated` + role gates; customers must not reach these.

### C4. Audit log: hardcoded `garageId='1'` fallback (read + write)
- **Location:** `audit.ts` L7,24,29 — `(req as any).user?.garageId || '1'`.
- **Impact:** Roleless principal reads garage 1's audit trail; `POST /audit/seed` injects forged records — cross-tenant read **and** write into a compliance log.
- **Fix:** `resolveGarageScope(req)`; 400/403 when undefined; never default to a literal id.

### C5. Warranty: global in-memory contracts/claims, no tenant field
- **Location:** `warranty.ts` arrays L43-127; handlers L132,154,189,203,240,262,285. No `garageId` on either interface.
- **Impact:** Any garage-A user lists/reads/creates claims against/approves garage B's contracts.
- **Fix:** Persist to DB (a `warrantyClaims` table already exists) with `garageId`; scope every query; reject until then.

### C6. WhatsApp: global in-memory store — customer PII leak
- **Location:** `whatsapp.ts` arrays L51-218; handlers L223,286,291,308. **Impact:** any GET returns every tenant's customer names + phones.
- **Fix:** Key store by `garageId` per handler, or DB-scope.

### C7. SMS campaigns: global in-memory state, no tenant scoping
- **Location:** `sms-campaigns.ts` `templates` L40, `campaigns` L123; handlers L238-364. **Impact:** cross-tenant list/read/send + SMS cost.
- **Fix:** Add `garageId` to both types; filter every op; back with tenant-scoped DB.

### C8. Inventory mgmt: unscoped when caller has no garageId
- **Location:** `inventory-management.ts` 5 GET handlers L14-389 — `.where(garageId ? eq(...) : undefined)`; `auth.ts` allows null-garage users.
- **Impact:** null-garage/cross-garage/customer principals receive all tenants' inventory, costs, selling prices, suppliers.
- **Fix:** `resolveGarageScope` + mandatory WHERE; 403 when unresolved and not a cross-garage role.

### C9. Inventory routes: cross-tenant mutate/delete by id
- **Location:** `inventory.routes.ts` `PATCH/DELETE /spare-parts/:id` L68-96, `POST/PATCH /stock-alerts` L169-189 — no ownership filter; client-supplied `garageId`; no zod.
- **Impact:** Any user edits/deletes any tenant's spare parts + stock alerts by enumerating UUIDs.
- **Fix:** Load row → verify `resolveGarageScope` match (404/403); push scope into WHERE; RBAC on delete; validate body; force session `garageId` on create.

### C10. Payments: no tenant scoping — financial IDOR
- **Location:** `payments.routes.ts` all routes L13-83; `storage.ts:5401-5442` filter by PK only; `payment_plans`/`installments` have no `garageId`.
- **Impact:** Any garage-A user GET/PATCHes garage B's payment plans + installments.
- **Fix:** Tenant guard; join `invoiceId → invoices.garageId`, verify before read/mutate; add `garageId` or enforced join filter in storage.

### C11. Export CSV leaks every tenant's data
- **Location:** `export.ts` `GET /export/csv/:type` L46-171 — each branch `.limit(10000)` with no tenant filter; `requireAdmin` passes any per-garage admin.
- **Impact:** Garage-A admin downloads every garage's customers (PII), invoices (amounts), vehicles (VIN/plate), inventory.
- **Fix:** `resolveGarageScope` + `.where(garageId)` on every query; only platform/super admin may export cross-garage.

### C12. Export HTML report aggregates every tenant's financials
- **Location:** `export.ts` `GET /export/report/:type` L174-380 — `financial-summary` sums `totalAmount`/paid/tax across all garages; `customer-list` exposes every garage's users.
- **Fix:** Scope every aggregate + list with `resolveGarageScope`.

---

## 3. Critical Findings — detail (cross-cutting pass)

### X1. Fine-grained RBAC is dead code — never enforced
- **Location:** `server/rbac-middleware.ts` (`loadUserPermissions` L46, `requirePermission` L167, …), `rbac-config.ts` matrix L457-1220.
- **Evidence:** Repo-wide grep returns 8 occurrences, all inside the definition file. Never `app.use`-d, never attached to a route. Authorization falls back to coarse `requireRole`.
- **Fix:** Wire `loadUserPermissions` globally + attach `requirePermission` to sensitive routes, or delete the matrix. Test: role lacking permission → 403.

### X2. CSRF implemented but never mounted
- **Location:** `server/middleware/csrf.ts` (`validateCsrfToken` L38, `generateCsrfToken` L10, `csrfTokenRoute` L17).
- **Evidence:** grep matches only inside `csrf.ts`. No `app.use`; `csrfTokenRoute` never registered. Cookie `sameSite:'lax'` (`auth.ts:40`). `SECURITY.md` L17-18 falsely claims active.
- **Fix:** Mount generate + validate middleware, register `GET /api/csrf-token`; test POST without token → 403.

### X3. ZATCA uses commercial license number as the VAT TRN
- **Location:** `saudi.ts` `/saudi/dashboard` L91, `/zatca/validate-invoice/:id` L203, `/zatca/qr/:invoiceId` L264, `/zatca/submit/:invoiceId` L366.
- **Evidence:** `vatNumber: garage?.licenseNumber ?? ''`. The `garages` table (`schema.ts` L45-59) has no VAT column. `validateZATCACompliance` enforces `/^\d{15}$/`.
- **Fix:** Add a 15-digit `vatNumber`/`taxRegistrationNumber` column; source TRN from it; reject clearance when absent/not 15 digits.

### X4. `apiRequest` argument-order bug breaks dozens of client mutations
- **Location:** def `client/src/lib/queryClient.ts:10` (`apiRequest(method, url, data?)`); callers pass `(url, method, data)` — `ContractManagement.tsx:47,59`, `CustomerFeedback.tsx:110,152,174,197`, `AIAutomation.tsx:204`, `BusinessIntelligenceDashboard.tsx:85`, `EmailMarketingCampaigns.tsx:38`, `FleetTracking.tsx:81`, `FranchiseManagement.tsx:211,225,249`, `VideoConsultations.tsx:37`, `Calendar.tsx:117`, `DashboardWidgets.tsx:225,237`, `Integrations.tsx:44`.
- **Impact:** Affected mutations never reach their endpoint (renewals, feedback, AI automation, BI saves, campaigns, fleet, franchise, video, calendar).
- **Fix:** Normalize to `apiRequest(method, url, data)`; make `method` a strict union so swapped args fail typecheck; add ESLint rule + tests.

---

## 4. High Findings

**Per-route pass**
- **H1.** `ai-insights.ts` router never mounted — `/api/ai/insights`, `/forecast/revenue`, `/forecast/demand` are dead (404). `MASTER_PLAN.md` advertises them live.
- **H2.** `reports.ts` every handler swallows errors → success-shaped empty/zero payloads (HTTP 200). Failed revenue query reports **zero revenue**.
- **H3.** `customer-portal.ts` L18-90 read routes swallow errors as empty 200s (vehicles/jobs/invoices/appointments/history).
- **H4.** `technician-mobile.ts` L25-84 errors swallowed as success-shaped 200s.
- **H5.** `technician-mobile.ts` `POST /technician/parts-request` L61-67 — no-op that fabricates success (no DB write).
- **H6.** `audit.ts` no RBAC on audit read/seed — any user reads trail + injects fabricated entries.
- **H7.** `notifications.ts` IDOR on `:id` mark-read/delete — no `user_id`/`garage_id` filter, sequential int ids.
- **H8.** `dashboard.ts` L68-75 technician-utilization query missing `garage_id` — cross-tenant aggregate leak.
- **H9.** `payments.routes.ts` `getPaymentPlans` returns all tenants' plans when `invoiceId` omitted.
- **H10.** `payments.routes.ts` PATCH spreads unvalidated `req.body` into financial updates (overwrite `totalAmount`/`paidAmount`/`status`).
- **H11.** `inventory-management.ts` DB errors masked as empty/zero 200s (incl. `SAR 0` inventory value).
- **H12.** `feature-flags.ts` POST/PATCH/DELETE not RBAC-gated — low-priv user toggles/deletes garage-wide flags.
- **H13.** `inventory.routes.ts` `POST/PATCH /spare-part-inventories` writes to attacker-chosen `garageId`.
- **H14.** `workflow-hooks.ts` schema mismatch (`toStatus` vs `targetStatus`) makes job-card transition **always 400**.
- **H15.** `predictive-maintenance.ts` errors swallowed as empty 200.

**Cross-cutting pass**
- **H-x1.** `requireRole.ts:13` defaults missing/blank role to `ADVISOR` (fails open); imported by backup/export/hr-payroll/invoices/quality-control/tax-config routes. Hardened deny-by-default copy in `middleware/rbac.ts` is unused.
- **H-x2.** Role taxonomy mismatch: `requireRole` knows 5 hardcoded roles; system assigns 25 (`shared/rbac.ts`) → real managers denied, teams over-grant ADMIN.
- **H-x3.** No ZATCA credit-note/refund/debit-note support — negative documents can't be represented or cleared.
- **H-x4.** ZATCA submit trusts stored VAT/totals — no server-side recomputation before clearance.
- **H-x5.** UBL XML hardcodes 15% Standard for all lines — zero-rated/exempt lines mis-reported.
- **H-x6.** FKs lack covering indexes (870 FKs / ~64 indexes) — slow joins + full-scan cascade deletes.
- **H-x7.** Statutory VAT/GOSI rates stored as `doublePrecision` (binary float) → rounding drift on money/tax.
- **H-x8.** Globally-unique business identifiers (`invoiceNumber`, `jobNumber`, `sku`, …) instead of per-tenant — cross-tenant collision + numbering leak.
- **H-x9.** Email campaign send faked (random delivery counts, no email).
- **H-x10.** Social posting writes 'published' without any platform call.
- **H-x11.** Workflow auto-trigger failures swallowed; transition returns `success:true`.
- **H-x12.** Documented side effects (invoice auto-gen, GL posting on payment, PO suggestion) not implemented.
- **H-x13.** Hijri conversion ~2 days off Umm al-Qura (`shared/hijriUtils.ts`).
- **H-x14.** 1,870 physical LTR-only Tailwind classes vs 2 logical → broken Arabic RTL layout.
- **H-x15.** 337 hardcoded English placeholders bypass i18n (incl. the language-switcher label).
- **H-x16.** Icon-only buttons missing `aria-label`.
- **H-x17.** Form inputs not associated with labels (`htmlFor`/`id`).

---

## 5. Tenant-Guard Coverage (43 of 67 route files flagged)

**Live leaks (fix now):** `crm.ts`, `audit.ts`, `inventory-management.ts`, `inventory.routes.ts`, `payments.routes.ts`, `export.ts`, `warranty.ts`, `whatsapp.ts`, `sms-campaigns.ts`, `notifications.ts` (IDOR), `dashboard.ts` (partial), `predictive-maintenance.ts` (`||'1'`).

**Latent (safe only because unmounted/stubbed — must wire guard now per project rule):** `ai-insights.ts`, `fleet.routes.ts`, `misc.routes.ts`, `reports.routes.ts`, `settings.routes.ts`, `workflow.ts`, `marketing.ts`, `customer-portal.ts` (unmounted dup), `financial.ts`, `fleet.ts`, plus the remaining `*.routes.ts` placeholders (`technicians`, `vehicles`, `customers`, `jobcards`, `invoices`, `scheduling`, `payments-gateway`, `training-lms`, `hr-payroll`, `quality-control`, `backup`, `documents`, `kiosk`, `currency`, `saudi`, `ai-repair-guide`).

> Full per-file status table is in the raw run output (`tasks/wf8qt1554.output`).

---

## 6. Medium & Low Findings (grouped)

> 37 Medium + 22 Low from the route pass, plus 18 Medium + 6 Low from the cross-cutting pass. Headlines below; full list in the raw run outputs (`wf8qt1554.output`, `wm9xajown.output`).

**Silent-failure (≥14 handlers):** `crm.ts`, `ai-insights.ts`, `parts-recommendations.ts`, `dashboard.ts`, `customer-portal.ts`, `predictive-maintenance.ts` return empty/zero 200s on DB error; `notifications.ts` preferences in volatile `Map`; `sms-campaigns.ts` fabricates delivery metrics; `command-center.ts` `dbQueryCount = Math.random()`; `estimates.ts` fabricates `convertedJobCardId`; server-side `event-bus.ts`/`scheduled-checks.ts`/`ai-service.ts`/analytics getters swallow errors.

**Validation:** missing Zod on `crm` loyalty, `workflow`, `parts-recommendations`, `audit` log params, `notifications`, `sms-campaigns`, `feature-flags`, `whatsapp` send, `estimates`, `inventory-management` reorder, `reports` date-range (parsed but never applied).

**Security (injection):** `whatsapp.ts:237-241` user-keyed `new RegExp` → ReDoS/`SyntaxError`; `export.ts:22-43` CSV formula injection (`= + - @` written verbatim).

**Compliance/money:** production `/audit/seed` forges VAT/void entries; `franchise.ts` cross-location financial views with no audit log; `inventory-management.ts:238` hardcoded `* 0.15` VAT bypassing `vatUtils.ts`; in-memory estimate numbers reset on restart → duplicate `EST-2026-####`.

**DB schema:** `payment_plans`/`installments` lack `garageId`; `supplier_performance` lacks `garageId` + read unbounded; currency defaults USD in a SAR ERP; `jobCards.customerId` unreferenced FK; `onDelete` unspecified on most FKs; nullable `payments.status`; index-less hot tables (`appointments`, `accountingTransactions`, `vehicleServiceHistory`).

**React client:** ~35/138 mutation pages lack `onError`; only 4/196 pages handle `isError` (thrown query crashes app via root ErrorBoundary); `setState`-in-render (`CurrencySettings.tsx:164`); `markAsRead` fires per messages-array change + leaked `setTimeout` (`Chat.tsx`); un-debounced `GlobalSearch`; index-as-key; `dangerouslySetInnerHTML` in `ui/chart.tsx` (config-controlled, low).

**a11y/i18n:** inline hardcoded `left/right`; Hijri tests assert ranges only (hides H-x13 drift); status color-only (906 occurrences); dates `en-US` even in Arabic.

---

## 7. Coverage Gaps & Recommended Next Tests

**Not yet audited (gaps):**
1. **`client/**` React layer** — no file-level react-reviewer pass beyond the cross-cutting sample.
2. **a11y / i18n RTL** — only cross-cutting sample; needs a11y-architect review.
3. **`auth.ts` / `rbac-config.ts` / `shared/rbac.ts` internals** — the `deserializeUser` "garageId optionally absent" behavior (`auth.ts:97-98`) is the root enabler of several Criticals.
4. **`server/storage.ts`** — PK-only WHERE pattern recurs; full pass warranted.
5. **`server/routes.ts` monolith** — referenced as the "real" impl for shadowed routes; not traced end-to-end.
6. **PayPal (`paypal.ts`) + ZATCA Phase-2 clearance** — compliance-critical, static-only so far.
7. **Live every-button UI/UX E2E** — not run; needs dev server + seeded DB.

**Highest-priority test suites:**
- **Tenant isolation (P0):** auth as garage A, assert garage-B record → 404/403 for every Critical/High file; add a null-garage principal fixture asserting unscoped endpoints reject.
- **RBAC matrix:** technician/customer → 403 on `reports`, `crm`, `dashboard`, `audit`, `feature-flags` mutations, `warranty` claim approval.
- **Silent-failure:** mock DB failure → assert 500 (not empty/zero 200) on all listed catch-blocks.
- **Mount/regression:** `ai-insights`, `command-center`, `financial` return 401/200 not SPA/404; replace `financial.ts` `expect([200,404])` test.
- **Workflow-hooks:** valid transition → 200 (currently always 400).
- **Validation boundary:** array params, `?limit=abc`, negative/NaN money, bad dates → 400.
- **Injection:** WhatsApp regex metachars → no ReDoS; CSV `=HYPERLINK(...)` name → neutralized.
- **VAT/compliance:** reorder VAT uses `calculateVAT()`; `/audit/seed` unreachable in prod; cross-location financial views write audit log.
- **Transaction:** failing reorder item insert → no orphaned PO header (rollback).
- **a11y:** axe accessible-name checks on icon buttons + label association; RTL visual-regression.
