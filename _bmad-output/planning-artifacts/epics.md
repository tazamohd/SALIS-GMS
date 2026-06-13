---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-SALIS-GMS-2026-06-12/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/project-context.md
project_name: 'SALIS-GMS'
workflowType: 'epics-and-stories'
status: 'complete'
date: '2026-06-13'
scope: 'Multi-Tenant Isolation & Security Hardening'
---

# SALIS-GMS — Epic Breakdown (Multi-Tenant Isolation & Security Hardening)

## Overview

This document decomposes the PRD (`prds/prd-SALIS-GMS-2026-06-12/prd.md`) and Architecture
(`architecture.md`) into implementable epics and stories. Epics are organized by **user value** and
ordered by the architecture's dependency sequence; stories are sized for a single dev-agent session and
never depend on a *later* story in the same epic. Glossary terms (Garage, Branch, Tenant Scope,
Role Binding, Scoped Data Access, Isolation Leak, etc.) are used verbatim from PRD §3.

> Produced via `bmad-create-epics-and-stories` (Fast path). Architecture decisions are referenced as
> AD-1…AD-9; PRD requirements as FR-1…FR-11.

## Requirements Inventory

### Functional Requirements
- **FR-1** Scoped reads — every list/detail/search/aggregate/export limited to Tenant Scope.
- **FR-2** Scoped writes — create/update/delete only within scope; server-stamped tenancy.
- **FR-3** Branch-level scoping — branch-scoped roles see only their Branch.
- **FR-4** Safe-by-default developer primitive — shared scoped access, escape hatch audited.
- **FR-5** No production auth bypass.
- **FR-6** Session & credential security.
- **FR-7** Consistent, deny-by-default RBAC across both route layers.
- **FR-8** Automated cross-tenant isolation test suite in CI.
- **FR-9** Privileged-action audit (immutable).
- **FR-10** Audited impersonation.
- **FR-11** MFA enrollment & enforcement.

### NonFunctional Requirements
- Deny-by-default & fail-closed everywhere; existence-hiding (404) for cross-tenant reads.
- ≤10ms p95 scoping overhead (indexed `garageId`/`branchId`); Neon transaction-scoped RLS.
- PDPL / ZATCA / SOC 2-ready controls; audit append-only.
- Backward compatible with customer/technician portals, `/ws/chat`, reports, exports.

### Additional Requirements (from Architecture)
- AD-1 AsyncLocalStorage tenant context; AD-2 scoped primitive in `storage.ts`; AD-3 Postgres RLS
  backstop; AD-4 404 semantics; AD-5 startup auth-bypass guard + session hardening; AD-6 RBAC policy
  registry; AD-7 audit + impersonation; AD-8 MFA enforcement; AD-9 isolation harness.
- Must wrap BOTH the modular `server/routes/*.routes.ts` and legacy `server/routes.ts` layers.

### UX Design Requirements
None ingested (no UX spec for this initiative). The only user-facing surface is the **MFA enrollment
flow** (Epic 4); all other work is backend/infra. A UX pass for MFA screens can follow if desired.

### FR Coverage Map
- FR-1 → Epic 1 (scoped reads, RLS)
- FR-2 → Epic 1 (scoped writes, server-stamped tenancy)
- FR-3 → Epic 1 (branch scoping)
- FR-4 → Epic 1 (scoped primitive + escape hatch)
- FR-8 → Epic 1 (core harness) + Epic 6 (scale + CI gate)
- FR-5 → Epic 2 (no prod bypass)
- FR-6 → Epic 2 (session/credential security)
- FR-7 → Epic 3 (RBAC policy registry)
- FR-11 → Epic 4 (MFA)
- FR-9 → Epic 5 (privileged-action audit)
- FR-10 → Epic 5 (audited impersonation)

## Epic List

### Epic 1: Provable Tenant Data Isolation
A Garage's data is invisible and untouchable to every other tenant, enforced at both the application
and database layers, and proven by an automated test. Delivers the core security guarantee.
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-8 (core)

### Epic 2: Hardened Authentication & Sessions
Authentication cannot be disabled in production and sessions are secure against fixation/hijacking.
**FRs covered:** FR-5, FR-6

### Epic 3: Consistent Authorization (RBAC)
Every privileged endpoint enforces the same deny-by-default role policy across both route layers.
**FRs covered:** FR-7

### Epic 4: Multi-Factor Authentication
Privileged users protect their accounts with a second factor and can recover access if a device is lost.
**FRs covered:** FR-11

### Epic 5: Audit & Accountable Impersonation
Every privileged action and every support impersonation is captured in an immutable, tenant-attributed log.
**FRs covered:** FR-9, FR-10

### Epic 6: Isolation Assurance at Scale
Isolation is continuously verified across the high-risk endpoint surface and regressions are blocked in CI.
**FRs covered:** FR-8 (scale + CI gate)

---

## Epic 1: Provable Tenant Data Isolation

Establish the Tenant Scope, route all data access through a deny-by-default scoped primitive, back it
with Postgres RLS, hide cross-tenant existence, and prove it with a test. After this epic, a Garage
Owner sees only their own Garage's data everywhere (UJ-1).

### Story 1.1: Establish request Tenant Scope

As an Engineer,
I want every authenticated request to carry a resolved Tenant Scope in request-scoped context,
So that the data layer can enforce isolation without any endpoint passing `garageId` by hand.

**Acceptance Criteria:**

**Given** an authenticated request from a user with Role Bindings in Garage A
**When** `tenantContextMiddleware` runs after authentication
**Then** an AsyncLocalStorage store holds `{ garageId, branchIds, isPlatformPrincipal, impersonation }` derived from `user_role_branch`
**And** the scope is readable by the data layer for the full async lifetime of the request, including across `await` boundaries and `/ws/chat` message handlers
**And** a request with no resolvable scope yields an empty/undefined scope (never a default Garage).

### Story 1.2: Scoped reads with no "return-all" fallback

As a Garage Owner,
I want every list, detail, search, and aggregate to return only my Garage's records,
So that I never see another tenant's data. (Realizes FR-1, UJ-1)

**Acceptance Criteria:**

**Given** a valid Garage A token
**When** I call any collection endpoint (customers, vehicles, job cards, inventory, invoices, HR, reports, global search)
**Then** zero Garage B records are returned, and aggregates/counts exclude Garage B rows
**And** when no Tenant Scope is present the scoped primitive returns an empty set — the legacy "missing `garageId` ⇒ return all records" branch (HR module, global search) is removed
**And** the scoped read path adds ≤10ms p95 overhead using existing `garageId` indexes.

### Story 1.3: Scoped writes with server-stamped tenancy

As a Garage Owner,
I want creates/updates/deletes to act only on my Garage's data and ignore any client-supplied tenant id,
So that no one can write into or alter another tenant's records. (Realizes FR-2)

**Acceptance Criteria:**

**Given** a Garage A token
**When** I `POST` a new record with a body that specifies `garageId` of Garage B
**Then** the server stamps the record with Garage A and ignores the body value
**And When** I `PATCH`/`DELETE` a record owned by Garage B
**Then** no mutation occurs and the response is 404/403
**And** the attempt emits an Isolation-Leak audit event.

### Story 1.4: Branch-level scoping for branch-scoped roles

As a branch-scoped Service Advisor,
I want to see only my Branch's operational data,
So that I work within my location while Garage-level roles still see all Branches. (Realizes FR-3)

**Acceptance Criteria:**

**Given** a user whose primary Role Binding is branch-scoped to Branch X of Garage A
**When** they list branch-scoped resources (e.g., job cards)
**Then** only Branch X records appear, excluding other Branches of Garage A
**And Given** a Garage Owner of Garage A
**When** they list the same resource
**Then** records from all Branches of Garage A appear, and none from any other Garage.

### Story 1.5: Existence-hiding error semantics

As a Garage Owner,
I want a request for another tenant's record to look identical to a request for a non-existent record,
So that the platform never reveals that another tenant's data exists. (Realizes AD-4, UJ-1 edge case)

**Acceptance Criteria:**

**Given** a Garage A token and a record id owned by Garage B
**When** I `GET` that id
**Then** the response is 404 with a body indistinguishable from a truly non-existent id
**And** a 403 is returned only for in-scope-but-role-forbidden actions, via a single shared error helper used by both route layers.

### Story 1.6: Postgres Row-Level Security backstop

As a Security officer,
I want the database itself to enforce the Garage boundary,
So that even a missed application-layer filter cannot leak data across tenants. (Realizes AD-3)

**Acceptance Criteria:**

**Given** RLS is enabled and forced on tenant-bearing tables with policies keyed on `current_setting('app.current_garage')`
**When** the application issues a tenant query
**Then** it runs inside a transaction that first executes `SET LOCAL app.current_garage = <garageId>`, and rows outside that Garage are invisible even if the SQL omits a `garageId` predicate
**And** a separate privileged DB role (migrations/seed/platform) can bypass RLS while the normal app role cannot
**And** the scoping works correctly under Neon serverless connection pooling (GUC and query share one pooled connection within the transaction).

### Story 1.7: Cross-tenant isolation test harness (core)

As an Engineer,
I want an automated test that proves Garage A cannot reach Garage B data,
So that this epic ships with verified isolation. (Realizes FR-8 core, AD-9)

**Acceptance Criteria:**

**Given** a Vitest suite that seeds ≥2 Garages via `server/seed.ts`
**When** it exercises a representative endpoint set with a Garage A token against Garage B data
**Then** it asserts zero cross-tenant rows in lists/search/aggregates, 404 on cross-tenant detail, and no mutation on cross-tenant writes
**And** the suite fails on any Isolation Leak and runs in CI.

---

## Epic 2: Hardened Authentication & Sessions

Make it impossible to disable authentication in production and harden the session lifecycle.

### Story 2.1: Block AUTH_BYPASS in production

As a Security officer,
I want the application to refuse to run with authentication disabled in production,
So that there is no path to an unauthenticated production system. (Realizes FR-5)

**Acceptance Criteria:**

**Given** `NODE_ENV=production`
**When** the process starts with any truthy `AUTH_BYPASS`
**Then** the `server/config.ts` startup safety check fails the boot (fail-closed)
**And Given** a non-production env with bypass enabled
**Then** the app boots but logs a loud warning on every start
**And** a request without a valid session to any `/api/*` route outside the public allowlist returns 401.

### Story 2.2: Session and cookie hardening

As a Garage Owner,
I want my session to resist fixation and hijacking,
So that my authenticated access cannot be stolen or replayed. (Realizes FR-6)

**Acceptance Criteria:**

**Given** a successful login
**When** the session is established
**Then** the session id is rotated (fixation defense) and the cookie is `httpOnly`, `secure` in production, and `sameSite`-set
**And** the `sessions` table store is preserved (never dropped) and TTL is enforced, requiring re-auth after expiry including for `/ws/chat`
**And** passwords remain bcrypt-hashed at the documented minimum work factor.

---

## Epic 3: Consistent Authorization (RBAC)

A single policy registry drives deny-by-default authorization identically across both route layers.

### Story 3.1: Endpoint policy registry + shared authorize middleware

As an Engineer,
I want one registry mapping endpoints to required roles, consumed by a shared middleware,
So that authorization is defined once and applied consistently. (Realizes FR-7)

**Acceptance Criteria:**

**Given** the policy registry (`server/authz/policy-registry.ts`) and `authorize` middleware
**When** a request hits a privileged endpoint
**Then** the decision is computed from the caller's Role Bindings and the registry entry
**And** `requirePlan` plan-gating remains independent of and additional to role checks.

### Story 3.2: Deny-by-default across both route layers

As a Security officer,
I want any privileged endpoint without an explicit policy to be denied,
So that forgetting to register a policy fails safe rather than open. (Realizes FR-7)

**Acceptance Criteria:**

**Given** the shared `authorize` middleware applied to both `server/routes/*.routes.ts` and legacy `server/routes.ts`
**When** a privileged endpoint has no registry entry
**Then** non-privileged roles are denied (deny-by-default)
**And** the same authorization rule yields the same decision in either layer
**And** a coverage report lists every privileged endpoint and whether it has a policy (supports SM-5).

---

## Epic 4: Multi-Factor Authentication

Complete the TOTP MFA into an enrollable, enforceable second factor for privileged roles.

### Story 4.1: MFA enrollment with recovery codes

As a Garage Owner,
I want to enroll a TOTP authenticator and receive recovery codes,
So that I can add a second factor and still regain access if I lose my device. (Realizes FR-11)

**Acceptance Criteria:**

**Given** an authenticated privileged user on the MFA settings screen
**When** they enroll
**Then** a QR/secret is shown (existing `speakeasy` backend, `mfaStatuses`), a verifying TOTP is required to activate, and single-use recovery codes are issued
**And** using a recovery code at login consumes it and lets the user authenticate.

### Story 4.2: MFA enforcement at login

As a Security officer,
I want privileged roles to be challenged for TOTP at login,
So that a stolen password alone cannot grant access. (Realizes FR-11)

**Acceptance Criteria:**

**Given** a user in Garage Owner, Super Admin, or Accountant role with MFA enabled
**When** they log in with a correct password
**Then** `mfaEnforcementMiddleware` requires a valid TOTP (or recovery code) before the session is authorized
**And** non-privileged roles may enroll optionally in v1
**And** an admin-initiated MFA reset is audited.

---

## Epic 5: Audit & Accountable Impersonation

Every privileged action and every impersonation is captured immutably with full tenant attribution.

### Story 5.1: Privileged-action audit events

As a Compliance officer,
I want every privileged action recorded in an immutable log,
So that I can demonstrate to auditors who did what, to which tenant, and when. (Realizes FR-9)

**Acceptance Criteria:**

**Given** the extended `auditMiddleware`/`audit-trail`
**When** a Privileged Action occurs (auth/identity change, role/permission change, export, cross-tenant op, impersonation start/stop)
**Then** an Audit Event records actor, action, target, Tenant Scope, timestamp, source IP, and impersonation flag
**And** audit rows are append-only — the app DB role is denied `UPDATE`/`DELETE` on audit tables.

### Story 5.2: Audited impersonation sessions

As a Super Admin,
I want to support a tenant through an explicit, scoped, audited impersonation session,
So that support is possible without becoming an unaudited cross-tenant backdoor. (Realizes FR-10, UJ-2)

**Acceptance Criteria:**

**Given** a Platform Principal starts impersonation scoped to Garage A
**When** they act during the session
**Then** start and stop are Audit Events, every action carries the impersonation flag and Garage A scope, and they cannot exceed Garage A's Tenant Scope
**And When** the session times out
**Then** impersonation ends automatically and is logged as system-terminated.

---

## Epic 6: Isolation Assurance at Scale

Extend verification across the high-risk endpoint surface and block regressions in CI.

### Story 6.1: Extend isolation harness to high-risk endpoints + CI gate

As an Engineer,
I want the isolation suite to cover the defined high-risk endpoint set and gate merges,
So that cross-tenant regressions are caught before they ship. (Realizes FR-8 scale, SM-1)

**Acceptance Criteria:**

**Given** the parameterized harness from Story 1.7
**When** it is extended over the high-risk endpoint table (incl. legacy `routes.ts` endpoints)
**Then** each endpoint is asserted for zero cross-tenant leakage and 404 on cross-tenant detail
**And** the suite is a required CI check that blocks merge on any leak.

### Story 6.2: CI guard against unscoped tenant queries

As an Engineer,
I want CI to flag tenant-bearing queries that bypass the scoped primitive,
So that new code is safe-by-default and the escape hatch is visible in review. (Realizes FR-4)

**Acceptance Criteria:**

**Given** a lint/AST guard over `server/**`
**When** code issues a raw tenant-table query that does not go through the scoped primitive and is not wrapped in `unsafeCrossTenant(reason)`
**Then** CI flags it
**And** every `unsafeCrossTenant` call is greppable and emits an Audit Event at runtime.

---

## Coverage Verification

All FR-1…FR-11 are mapped to at least one story (see FR Coverage Map). Epic order follows the
architecture dependency sequence: Epic 1 is the foundation; Epics 2–5 build on it and each other but
stand alone; Epic 6 hardens the assurance net. No story depends on a later story within its epic.

**Next:** `bmad-sprint-planning` to sequence these into sprints, or `bmad-create-story` to expand
**Story 1.1** into a fully contextualized dev-ready spec and begin implementation.
