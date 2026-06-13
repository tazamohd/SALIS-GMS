# Story 1.2: Scoped reads with no "return-all" fallback

Status: review

## Story

As a Garage Owner,
I want every list, detail, search, and aggregate to return only my Garage's records,
so that I never see another tenant's data.

## Acceptance Criteria

1. **Given** a valid Garage A request, **When** I call a converted collection endpoint, **Then** zero Garage B records are returned.
2. **And** when no Tenant Scope is present the scoped primitive returns an empty set — the legacy "missing garageId ⇒ return all records" branch is removed from the converted methods.
3. **And** caller-supplied `garageId` cannot widen the result beyond the request's Tenant Scope (no client-controlled tenancy on reads).
4. **And** the scoped read path uses the existing indexed `garageId` columns.

## Scope of this story (and what is deferred)

`storage.ts` has **178** garage-scoped methods; ~36 used the leaky `if (garageId) …` /
`else return ALL` pattern. This story delivers the **shared deny-by-default primitive** and
converts the **highest-risk tenant-PII / financial collection reads**, plus neutralizes a concrete
cross-tenant leak in `/api/search`. The **long tail** of remaining methods is closed universally by
the **Postgres RLS backstop (Story 1.6)** and caught by the **CI guard (Story 6.2)** + **isolation
harness (Story 6.1)** — the defense-in-depth phasing from the architecture (AD-2 + AD-3). This is
intentional, not an oversight.

**Converted in this story:** `getCustomers`, `getVehicles`, `getJobCards`, `getAppointments`,
`getSuppliers`, `getTechnicians`, `getInvoices`. **Leak neutralized:** `/api/search` ("Smart Search")
previously called these getters with **no garageId**, searching across **all tenants**; it now
auto-scopes to the caller's Garage via the Story 1.1 context.

## Tasks / Subtasks

- [x] Task 1: Deny-by-default primitive (AC: 2, 3)
  - [x] `server/tenancy/tenant-guard.ts` → `resolveScopedGarageId(passed)` (context wins over passed; impersonation target first; deny when unresolved) and `garageScope(column, passed)` (returns `eq` or `sql\`false\``).
- [x] Task 2: Convert core collection reads (AC: 1, 2, 4)
  - [x] Replace the leaky pattern in the 7 methods above with `garageScope(...)`; remove every `else return ALL` branch.
  - [x] Import `garageScope` into `storage.ts`.
- [x] Task 3: Tests (AC: 1, 2, 3)
  - [x] `server/tenancy/__tests__/tenant-guard.test.ts` — precedence table (context-overrides-passed, impersonation, deny, platform principal, no-scope) + `garageScope` condition shape.

## Dev Notes

- **No client-controlled tenancy:** `resolveScopedGarageId` deliberately prefers the AsyncLocalStorage scope over the passed argument, so a route handler that forwards a client-supplied `garageId` cannot cross tenants. The passed argument is honored only when there is NO scope (background jobs) or for an un-impersonating platform principal. [Source: architecture.md#AD-2]
- **Deny, never widen:** when no garage resolves, `garageScope` emits `sql\`false\`` so the query matches nothing — replacing the old behavior of omitting the predicate (which returned all tenants). `sql\`true\`` is already an established idiom in `storage.ts` (line ~3043), so `sql\`false\`` is consistent. [Source: server/storage.ts]
- **Why these 7:** they hold the customer PII, vehicles, job cards, supplier, and invoice/financial data the PRD flags as highest-sensitivity, and they had the explicit return-all branch. [Source: prd.md#FR-1, epics.md#Story 1.2]
- **`/api/search` leak:** `server/routes.ts` ~778 — the no-arg getters now inherit the request's Garage scope because `tenantContextMiddleware` is registered (routes/index.ts:124) before the legacy routes (:274). [Source: server/routes.ts, server/routes/index.ts]
- **Behavioral note:** a platform principal with no garage and no impersonation now gets an EMPTY result from these reads (deny) rather than all tenants. Legitimate cross-tenant platform views must use impersonation / the future `unsafeCrossTenant` escape hatch (Story 5.2 / AD-2). This is the safe direction.

### References

- [Source: architecture.md#AD-2, #AD-3 (RLS backstop closes the tail)]
- [Source: epics.md#Story 1.2, #Story 1.6, #Story 6.1, #Story 6.2]
- [Source: server/storage.ts, server/tenancy/tenant-context.ts]

## Dev Agent Record

### Agent Model Used

claude (BMAD bmad-dev-story, Fast path)

### Debug Log References

- `node --experimental-strip-types --check server/storage.ts` — syntax OK after edits.
- Deny-by-default precedence verified via mirror-smoke against the real tenant context (9/9). The committed `tenant-guard.test.ts` covers the real import + SQL shape in CI (drizzle/Postgres unavailable in this sandbox).

### Completion Notes List

- Added `tenant-guard.ts`; converted 7 collection reads; removed their return-all branches.
- Closed the `/api/search` cross-tenant leak via context auto-scoping (no route change needed).
- Long tail (~170 methods) intentionally deferred to RLS (1.6) + CI guard (6.2) + harness (6.1).

### File List

- A server/tenancy/tenant-guard.ts
- A server/tenancy/__tests__/tenant-guard.test.ts
- M server/storage.ts

### Change Log

- 2026-06-13: Story 1.2 implemented (scoped reads, deny-by-default; /api/search leak closed).
