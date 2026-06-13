---
title: SALIS-GMS Multi-Tenant Isolation & Security Hardening
status: draft
created: 2026-06-12
updated: 2026-06-12
---

# PRD: Multi-Tenant Isolation & Security Hardening
*Working title — confirm.*

## 0. Document Purpose

This PRD is for the SALIS-GMS product owner, the engineering lead driving the security workstream, and the downstream BMAD workflows (architecture → epics/stories → sprint planning). It defines **what** the initiative must achieve — verifiable tenant isolation, hardened authentication/authorization, completed MFA, and audit/compliance controls — not **how** to build it (implementation choices live in `addendum.md`). Vocabulary is anchored in the Glossary (§3); features are grouped with globally-numbered FRs nested under them; inferred decisions are tagged `[ASSUMPTION]` inline and indexed in §9. It builds on the codebase grounding in `_bmad-output/project-context.md` and `docs/source-tree-analysis.md` — read those for the current architecture rather than duplicating it here.

Because this is a **brownfield security initiative on a production-bound system**, the discovery was grounded in a full read-only codebase analysis rather than a blank-slate ideation. Where a target/threshold could not be confirmed from the code, it is tagged `[ASSUMPTION]` for your correction.

## 1. Vision

SALIS-GMS is a multi-tenant automotive ERP: a **Garage** (organization) owns **Branches** and **Users**, and the entire platform — ~860 API endpoints across customers, vehicles, job cards, inventory, invoicing, HR, and Saudi tax compliance — operates on shared infrastructure. Today, tenant separation is a *convention*, not a *guarantee*: queries scope by `garageId` in many places but fall back to returning **all** records when `garageId` is absent (notably in dev mode and parts of the HR module), and a single `AUTH_BYPASS` flag can disable authentication wholesale. For a system that will hold competitors' customer lists, pricing, payroll, and tax records side by side, an isolation gap is not a bug — it is a breach.

This initiative makes tenant isolation **provable and enforced by default**: every data access is scoped to the caller's authorized garage/branch, deny-by-default, with no silent "return everything" path; authentication and authorization are hardened (no production auth bypass, completed MFA, consistent RBAC across both the modular and legacy route layers); and every privileged action is auditable. The outcome is a platform that a franchise network — and a Saudi regulator under PDPL — can trust to keep one tenant's data invisible to another.

It matters now because SALIS-GMS is approaching production readiness and onboarding multiple garages onto shared infrastructure. The cost of retrofitting isolation rises with every new endpoint added to the legacy monolith; closing the gap before multi-tenant go-live is far cheaper than after an incident.

## 2. Target User

### 2.1 Jobs To Be Done

- **As a Garage Owner / franchise operator**, I need certainty that no other tenant — including a competing garage on the same platform — can see or touch my customers, pricing, payroll, or financials, so I can adopt SALIS-GMS without legal/competitive risk.
- **As a Platform / Super Admin**, I need legitimate cross-tenant operations (support, impersonation, platform analytics) to be *explicit, scoped, and audited*, not an accidental side effect of a missing filter.
- **As a Security/Compliance officer**, I need to demonstrate to auditors (PDPL, SOC 2-style controls) that access is deny-by-default, that privileged actions are logged immutably, and that there is no production path that disables auth.
- **As an Engineer extending the platform**, I need isolation to be enforced by a shared mechanism so that writing a new endpoint is *safe by default* and I cannot accidentally leak cross-tenant data.
- **As a Branch-scoped staff member** (e.g., Service Advisor at one location), I need to see only my branch's operational data where the role demands it, without manual filtering.

### 2.2 Non-Users (v1)

- End **customers** of a garage (the consumer portal) — their data-subject access is in scope only insofar as isolation protects it; customer-facing privacy self-service (data export/erasure UX) is **not** built here. `[ASSUMPTION: PDPL data-subject request tooling is deferred to a separate compliance initiative.]`
- External auditors as direct system users — they consume exported audit reports, not a live console, in v1.

### 2.3 Key User Journeys

- **UJ-1. Owner Layla onboards onto shared infrastructure and never sees a competitor's data.**
  - **Persona + context:** Layla owns a 3-branch garage in Riyadh; a rival garage already uses SALIS-GMS on the same deployment. She is risk-averse about cloud platforms.
  - **Entry state:** Authenticated as Garage Owner, primary role bound to her garage via `user_role_branch`.
  - **Path:** She opens Customers, Inventory, and Financial reports; runs a global search; exports an invoice list.
  - **Climax:** Every list, search result, and export contains only her garage's records — the rival's identical-VIN vehicle or same-name customer never appears. The system enforces this at the data layer, not the UI.
  - **Resolution:** Layla trusts the platform enough to migrate all branches. Realizes FR-1, FR-2, FR-7.
  - **Edge case:** She requests a record by a guessed ID belonging to another tenant → system returns 404 (not 403), revealing nothing about the record's existence.

- **UJ-2. Super Admin Omar supports a tenant via explicit, audited impersonation.**
  - **Persona + context:** Omar is platform support; a garage reports a billing bug.
  - **Entry state:** Authenticated as Super Admin (platform scope, not bound to one garage).
  - **Path:** Omar starts an impersonation session scoped to that garage, reproduces the issue, ends the session.
  - **Climax:** A banner shows he is impersonating; the start/stop and every action are written to an immutable audit log with the impersonation flag set.
  - **Resolution:** The tenant can later be shown exactly what support accessed. Realizes FR-3, FR-9, FR-10.
  - **Edge case:** Omar's session times out mid-support → impersonation ends automatically and is logged as system-terminated.

- **UJ-3. Engineer Maya ships a new endpoint that is isolated by default.**
  - **Persona + context:** Maya adds a "warranty claims" endpoint to a modular route file.
  - **Entry state:** Working in `server/routes/*.routes.ts`, using the shared tenant-scoped data access helper.
  - **Path:** She queries via the scoped repository/middleware; she writes no manual `garageId` filter and cannot bypass it without an explicit, reviewed escape hatch.
  - **Climax:** An automated isolation test suite runs her endpoint with a cross-tenant token and asserts zero leakage before merge.
  - **Resolution:** The endpoint is safe by construction. Realizes FR-4, FR-8.
  - **Edge case:** Maya forgets to use the scoped helper → CI isolation test (or a lint/guard) fails the build.

## 3. Glossary

- **Tenant** — A **Garage**: the top-level isolation boundary. All non-platform data belongs to exactly one Garage.
- **Garage** — The tenant organization. Identified by `garageId`. Owns Branches and Users. Cardinality: 1 Garage → many Branches, many Users.
- **Branch** — A physical location belonging to one Garage. Some data and some roles are further scoped to a Branch. Cardinality: 1 Branch → 1 Garage.
- **User** — An authenticated staff principal. Bound to one or more (Role, Branch) pairs via the **Role Binding**. A User belongs to one Garage (except Platform principals).
- **Role Binding** — A row in `user_role_branch` linking a User to a Role within a Branch, with an `isPrimaryRole` marker. The source of truth for authorization scope.
- **Role** — A named permission set (e.g., Garage Owner, Manager, Service Advisor, Technician, Parts Manager, Accountant, Super Admin). ~24 exist today.
- **Platform Principal** — A Super Admin not bound to a single Garage; may perform explicit cross-tenant operations. Distinct from a Garage-scoped User.
- **Tenant Scope** — The set of (Garage, Branch) a request is authorized to access, derived from the authenticated User's Role Bindings.
- **Scoped Data Access** — The mandatory mechanism (middleware/repository layer) that constrains every query to the request's Tenant Scope. Deny-by-default.
- **Isolation Leak** — Any response, export, search result, count, or side effect that exposes or mutates data outside the request's Tenant Scope.
- **Impersonation** — A Platform Principal acting within a specific Tenant Scope, explicitly initiated and fully audited.
- **MFA** — Multi-factor authentication (TOTP via the existing `mfaStatuses` table / speakeasy), a second factor beyond the password.
- **Audit Event** — An immutable record of a privileged or security-relevant action (actor, action, target, Tenant Scope, timestamp, impersonation flag).
- **Auth Bypass** — The current `AUTH_BYPASS` flag that disables authentication; to be eliminated in production environments.
- **Privileged Action** — Any auth/identity change, role/permission change, impersonation, data export, or cross-tenant operation.

## 4. Features

### 4.1 Enforced Tenant Scoping (Data Layer)

**Description:** Every data read and write is constrained to the request's **Tenant Scope** by a shared **Scoped Data Access** mechanism, deny-by-default. The current behavior where a missing `garageId` yields all records is removed: absence of scope means *no* records (or 404), never *all* records. This must cover **both** the modular `server/routes/*.routes.ts` layer and the legacy `server/routes.ts` monolith — an endpoint is not "done" until it routes through scoped access. Cross-tenant reads return **404** (existence-hiding), cross-tenant writes return **404/403** and are logged as Isolation Leak attempts. Uses Glossary terms exactly. Realizes UJ-1, UJ-3.

**Functional Requirements:**

#### FR-1: Scoped reads

A User can read only records within their Tenant Scope, across every list, detail, search, count, aggregate, and export endpoint. Realizes UJ-1.

**Consequences (testable):**
- A request with a valid token for Garage A returns zero records belonging to Garage B for every collection endpoint (customers, vehicles, job cards, inventory, invoices, HR, reports, global search).
- A detail request (`GET /api/<resource>/:id`) for an ID owned by another Garage returns **404**, with a body indistinguishable from a non-existent ID.
- Aggregate/count/report endpoints compute over the Tenant Scope only; totals for Garage A exclude Garage B rows.
- When no Tenant Scope can be derived, endpoints return an empty set or 401/403 — **never** the full table. The legacy "return all records when `garageId` is absent" path is removed.

#### FR-2: Scoped writes

A User can create, update, or delete only within their Tenant Scope; new records are stamped with the User's Garage (and Branch where applicable) server-side, ignoring any client-supplied `garageId`.

**Consequences (testable):**
- `POST`/`PATCH`/`DELETE` against a resource owned by another Garage returns 404/403 and performs no mutation.
- On create, server-assigned `garageId` equals the authenticated User's Garage even if the request body specifies a different one (no client-controlled tenancy).
- A cross-tenant write attempt emits an Audit Event flagged as an Isolation Leak attempt.

#### FR-3: Branch-level scoping

Where a Role is Branch-scoped, the User sees only their Branch's data for the relevant resources; Garage-level roles see all Branches in their Garage.

**Consequences (testable):**
- A Branch-scoped Service Advisor's job-card list excludes other Branches in the same Garage.
- A Garage Owner's list spans all Branches of their Garage and no others.
- `[ASSUMPTION: which resources are Branch-scoped vs Garage-scoped follows the existing role→navigation mapping; the exact per-resource matrix is confirmed in architecture.]`

**Feature-specific NFRs:**
- Scoping adds ≤ `[ASSUMPTION: 10ms]` p95 overhead per request and must use indexed `garageId`/`branchId` columns (indexes already exist on key tables).

### 4.2 Safe-by-Default Developer Mechanism

**Description:** Isolation is enforced through a single shared mechanism so that the *default* way to write an endpoint is the *safe* way. Manual `garageId` filtering is discouraged; bypassing scope requires an explicit, reviewed, audited escape hatch. Realizes UJ-3.

**Functional Requirements:**

#### FR-4: Shared scoped-access primitive

An Engineer can perform tenant-bound data access through a shared primitive (scoped repository/query helper and/or enforcing middleware) without writing manual tenant filters.

**Consequences (testable):**
- A new endpoint using the primitive is isolated with no endpoint-specific filter code.
- Bypassing the primitive requires a named, explicit escape hatch (e.g., `unsafeCrossTenant(reason)`) that emits an Audit Event and is greppable for review.
- `[ASSUMPTION: a CI guard (lint rule or test) flags raw tenant-bearing queries that don't go through the primitive.]`

#### FR-8: Automated isolation test suite

The system provides an automated test suite that asserts cross-tenant isolation for endpoints, runnable in CI.

**Consequences (testable):**
- The suite seeds ≥2 Garages and asserts that Garage A tokens cannot read/write Garage B data across a representative endpoint set.
- The suite fails the build on any Isolation Leak.
- New endpoints are covered by a reusable harness (parameterized by route) rather than bespoke tests each time.

**Notes:** `[NOTE FOR PM] The legacy monolith has ~760 endpoints; full per-endpoint coverage is a migration effort. v1 targets the shared mechanism + a high-risk endpoint set; see §6.`

### 4.3 Authentication Hardening

**Description:** Eliminate the production auth-bypass path, enforce session security, and ensure unauthenticated requests cannot reach tenant data. Builds on existing Passport local + PostgreSQL session store. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-5: No production auth bypass

The system must make it impossible to disable authentication in a production environment.

**Consequences (testable):**
- With `NODE_ENV=production`, any `AUTH_BYPASS` value is ignored; protected routes still require a valid session. `[ASSUMPTION: bypass remains available only in explicitly non-production envs, and startup logs a loud warning when active.]`
- A startup safety check refuses to boot (or hard-fails the check) if auth bypass is somehow enabled under production. 
- A request without a valid session to any `/api/*` route except the public allowlist returns 401.

#### FR-6: Session & credential security

Sessions and credentials follow hardened defaults.

**Consequences (testable):**
- Session cookies are httpOnly, `secure` in production, `sameSite` set; session fixation is prevented (session ID rotates on login).
- The `sessions` table is preserved and used as the session store (never dropped); session TTL is enforced and re-auth required after expiry, including for WebSocket (`/ws/chat`).
- Passwords are bcrypt-hashed (existing); a documented minimum work factor is enforced. `[ASSUMPTION: current bcrypt rounds are retained or raised per architecture review.]`

### 4.4 Authorization & RBAC Consistency

**Description:** Role checks are applied consistently across both route layers, deny-by-default, driven by Role Bindings. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-7: Consistent role enforcement

A User can invoke only the actions permitted by their Role Binding(s); every privileged endpoint enforces a role/permission check.

**Consequences (testable):**
- Endpoints default to authenticated + authorized; an endpoint with no explicit role policy is denied to non-privileged roles (deny-by-default) rather than open. `[ASSUMPTION: a policy registry maps endpoints→required roles; unmapped privileged endpoints are flagged.]`
- The same authorization rule yields the same decision whether the endpoint lives in the modular or legacy layer.
- Plan-gating (`requirePlan`) remains independent of and additional to role checks.

### 4.5 Multi-Factor Authentication (Complete the Rollout)

**Description:** Finish the existing TOTP MFA (backend `mfaStatuses`/speakeasy present, frontend partial) into an enrollable, enforceable second factor. Realizes UJ-2.

**Functional Requirements:**

#### FR-11: MFA enrollment & verification

A User can enroll a TOTP authenticator and is challenged for it at login when MFA is enabled.

**Consequences (testable):**
- A User can enroll (QR + secret), verify, and receive recovery codes; login then requires a valid TOTP.
- Recovery codes are single-use and let a User regain access if the device is lost.
- `[ASSUMPTION: MFA is enforced (required) for privileged roles — Garage Owner, Super Admin, Accountant — and optional for others in v1.]`

### 4.6 Auditability & Privileged-Action Logging

**Description:** Every Privileged Action and Impersonation produces an immutable, tenant-attributed Audit Event, building on the existing `activityLogs`/`sessionLogs`/`auditTrail` + `auditMiddleware`. Realizes UJ-2.

**Functional Requirements:**

#### FR-9: Privileged-action audit

The system records an Audit Event for every Privileged Action (auth/identity changes, role/permission changes, impersonation start/stop, data exports, cross-tenant operations).

**Consequences (testable):**
- Each Audit Event captures actor, action, target, Tenant Scope, timestamp, source IP, and impersonation flag.
- Audit Events are append-only/immutable (no in-place edit or silent delete) and survive a tenant's normal data operations. `[ASSUMPTION: immutability via application-enforced append-only + restricted DB grants; tamper-evidence (hash chain) is a possible later enhancement.]`

#### FR-10: Audited impersonation

A Platform Principal can impersonate within a Tenant Scope only through an explicit, audited session.

**Consequences (testable):**
- Impersonation start and stop are Audit Events; all actions during the session carry the impersonation flag and the impersonated Tenant Scope.
- The impersonating principal cannot exceed the target Tenant Scope.
- Sessions auto-terminate on timeout, logged as system-terminated (UJ-2 edge case).

## 5. Non-Goals (Explicit)

- Not re-architecting the data model into physically separate databases/schemas per tenant — v1 enforces logical isolation on the shared schema. `[ASSUMPTION: row-level/logical isolation is the chosen model; physical separation is out.]`
- Not building customer-facing PDPL data-subject self-service (export/erasure UX).
- Not replacing Passport/session auth with a new IdP/SSO in v1 (SSO is a separate dependency).
- Not rewriting the legacy monolith; isolation is retrofitted through the shared mechanism, with full endpoint migration tracked separately.
- Not introducing field-level encryption or full DLP.
- Not building a live auditor console (reports/exports only).

## 6. MVP Scope

### 6.1 In Scope

- Shared Scoped Data Access primitive + deny-by-default behavior (FR-1, FR-2, FR-4).
- Removal of the "no scope ⇒ all records" fallback everywhere it exists, starting with the HR module and global search.
- Production auth-bypass elimination + session hardening (FR-5, FR-6).
- Deny-by-default RBAC with a policy registry and consistent enforcement across both route layers (FR-7).
- Automated cross-tenant isolation test harness in CI, covering a defined high-risk endpoint set (FR-8).
- Privileged-action audit + audited impersonation (FR-9, FR-10).
- MFA enrollment/enforcement for privileged roles (FR-11).
- Branch-level scoping for the resources where roles are Branch-scoped today (FR-3).

### 6.2 Out of Scope for MVP

- Full per-endpoint isolation coverage of all ~760 legacy endpoints — phased post-MVP; v1 covers the shared mechanism + high-risk set. `[NOTE FOR PM] The long tail is emotionally load-bearing for a true security guarantee; flag for fast-follow.]`
- Tamper-evident audit (hash-chaining) — deferred; append-only first.
- Physical tenant DB separation — deferred (see Non-Goals).
- SSO/enterprise IdP integration — separate initiative.
- Customer PDPL self-service tooling — separate initiative.

## 7. Success Metrics

**Primary**
- **SM-1**: **Isolation leak rate** — number of cross-tenant leaks detected by the automated suite + production monitoring. Target: **0** across the covered endpoint set at GA. Validates FR-1, FR-2, FR-8.
- **SM-2**: **Production auth-bypass exposure** — environments where auth can be disabled in production. Target: **0**. Validates FR-5.
- **SM-3**: **Privileged-action audit coverage** — % of Privileged Actions producing a complete Audit Event. Target: **100%**. Validates FR-9, FR-10.

**Secondary**
- **SM-4**: **MFA adoption among privileged roles** — % of Garage Owner/Super Admin/Accountant accounts with MFA enrolled. Target: `[ASSUMPTION: ≥95% within 30 days of enforcement]`. Validates FR-11.
- **SM-5**: **Deny-by-default coverage** — % of privileged endpoints with an explicit role policy in the registry. Target: 100% of in-scope endpoints. Validates FR-7.
- **SM-6**: **Scoping performance overhead** — p95 latency added by Scoped Data Access. Target: ≤ `[ASSUMPTION: 10ms]`. Validates FR-1.

**Counter-metrics (do not optimize)**
- **SM-C1**: **False-deny rate / legitimate-access friction** — rate at which authorized Users are wrongly denied or see empty results. Must stay near zero; counterbalances SM-1/SM-5 (don't achieve "isolation" by breaking legitimate access).
- **SM-C2**: **Support-impersonation latency** — time for support to begin a legitimate impersonation session. Don't make support unusable in the name of audit; counterbalances SM-3.

## 8. Cross-Cutting NFRs

- **Security:** Deny-by-default everywhere; existence-hiding (404 over 403) for cross-tenant reads; no client-controlled tenancy; secrets via env (`SESSION_SECRET`, `DATABASE_URL` validated at startup).
- **Reliability:** Isolation enforcement must not introduce a single point of failure that takes down all tenants; failures fail *closed* (deny), not open.
- **Performance:** Scoping leverages existing `garageId`/`branchId` indexes; ≤ `[ASSUMPTION: 10ms]` p95 overhead.
- **Observability:** Isolation-leak attempts and auth failures are monitorable/alertable in production.
- **Compatibility:** Existing legitimate flows (customer/technician portals, WebSocket chat, reports, exports) continue to work within scope.

## 9. Risk and Mitigations

- **R1 — Legacy monolith coverage gap:** ~760 endpoints may not all route through scoped access at GA. *Mitigation:* shared primitive + CI guard + phased migration with a high-risk-first order; track coverage as SM-5.
- **R2 — Breaking legitimate cross-Branch/Garage flows:** over-tight scoping denies valid access (SM-C1). *Mitigation:* per-resource scope matrix confirmed in architecture; canary on internal tenants; false-deny monitoring.
- **R3 — Performance regression from added filters:** *Mitigation:* indexed columns, query review, p95 budget (SM-6).
- **R4 — Audit log growth/immutability:** volume and tamper-resistance. *Mitigation:* append-only + restricted grants now, retention policy, hash-chain as fast-follow.
- **R5 — MFA lockout / support burden:** lost devices. *Mitigation:* single-use recovery codes + audited admin reset.
- **R6 — Incomplete removal of `AUTH_BYPASS`:** a stray check remains. *Mitigation:* startup safety check + test that production boot with bypass fails.

## 10. Compliance & Regulatory

- **PDPL (Saudi Personal Data Protection Law):** tenant isolation, access control, and audit trails are core controls; this initiative is a prerequisite for PDPL alignment. `[NOTE FOR PM] Confirm whether a formal PDPL assessment is required before multi-tenant GA.]`
- **ZATCA / tax-record integrity:** invoice and VAT records must remain tenant-isolated and audit-attributed (existing ZATCA/VAT logic unchanged, but access-scoped).
- **SOC 2-style controls** (access control, audit logging, deny-by-default) are advanced by FR-5/7/9/10. `[ASSUMPTION: no formal SOC 2 audit is contracted for v1; controls are built to be audit-ready.]`

## 11. Data Governance

- **Classification:** customer PII, payroll/HR, financial/tax data are the highest-sensitivity classes and the primary isolation targets.
- **Retention:** Audit Events retained per `[ASSUMPTION: a defined retention window, e.g., ≥1 year]`; confirm with compliance.
- **Residency:** `[ASSUMPTION: Saudi data residency may be required for PDPL]` — flag for architecture/infra; no code-level decision here.

## 12. Rollout & Change Management

- **Phasing:** (1) shared mechanism + auth-bypass removal + audit, on internal/canary tenants; (2) high-risk endpoint coverage + MFA enforcement for privileged roles; (3) phased legacy-endpoint migration to full coverage.
- **Validation gate:** the automated isolation suite must pass before each phase's production rollout.
- **Comms/Training:** privileged users notified before MFA enforcement; engineers onboarded to the scoped-access primitive (reference `_bmad-output/project-context.md`).
- **Rollback:** fail-closed design means a rollback restores prior access only via deliberate, audited config change.

## 13. Open Questions

1. What is the authoritative per-resource **Branch-scoped vs Garage-scoped** matrix? (drives FR-3)
2. Is logical (row-level) isolation on the shared schema the accepted model, or is physical separation required for any data class? (drives Non-Goals, R1)
3. Which exact endpoint set is the **high-risk** MVP coverage target, and what is the migration order for the legacy tail? (drives FR-8, §6)
4. Is a formal **PDPL/SOC 2** assessment required before multi-tenant GA, and what retention/residency constraints apply? (drives §10–§11)
5. MFA policy: which roles are **required** vs optional, and is SMS/email a fallback factor or TOTP-only? (drives FR-11)
6. Target **performance budget** for scoping overhead — is 10ms p95 acceptable? (drives SM-6, NFRs)
7. Should cross-tenant reads always return **404**, or 403 in some authenticated-but-unauthorized cases? (drives FR-1)

## 14. Assumptions Index

- §2.2 — PDPL data-subject request tooling is deferred to a separate initiative.
- §4.1 FR-3 — Branch vs Garage scoping follows the existing role→navigation mapping; exact matrix confirmed in architecture.
- §4.1 NFR / §8 / SM-6 — Scoping overhead budget assumed ≤10ms p95.
- §4.2 FR-4 — A CI guard (lint/test) flags raw tenant-bearing queries bypassing the primitive.
- §4.3 FR-5 — Auth bypass remains only in explicitly non-production envs with a loud startup warning.
- §4.3 FR-6 — Current bcrypt work factor retained or raised per architecture review.
- §4.4 FR-7 — An endpoint→required-role policy registry exists; unmapped privileged endpoints are flagged.
- §4.5 FR-11 — MFA required for Garage Owner/Super Admin/Accountant, optional for others in v1; TOTP-based.
- §4.6 FR-9 — Audit immutability via application append-only + restricted DB grants; hash-chain deferred.
- §5 — Logical/row-level isolation on shared schema is the chosen model; physical separation out.
- §7 SM-4 — ≥95% MFA adoption among privileged roles within 30 days of enforcement.
- §10 — No formal SOC 2 audit contracted for v1; controls built audit-ready.
- §11 — Audit retention ≥1 year; Saudi data residency may be required (flag for infra).

---

*Downstream: this PRD feeds `bmad-create-architecture` (isolation mechanism, policy registry, audit design) and then `bmad-create-epics-and-stories`. Technical "how" and rejected alternatives live in `addendum.md`.*
