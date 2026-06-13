# Story 1.5: Existence-hiding error semantics

Status: review

## Story

As a Garage Owner,
I want a request for another tenant's record to look identical to a request for a non-existent record,
so that the platform never reveals that another tenant's data exists.

## Acceptance Criteria

1. **Given** a Garage A request and a record id owned by Garage B, **When** I `GET` that id, **Then** the response is 404 with a body indistinguishable from a truly non-existent id.
2. **And** 403 is reserved for in-scope-but-role-forbidden actions.
3. **And** the behavior is consistent (a single shared helper) and works in both route layers.

## Tasks / Subtasks

- [x] Task 1: Scope the by-id detail reads (AC: 1)
  - [x] `getJobCard`, `getAppointment`, `getCustomer`, `getVehicle`, `getSupplier`, `getInvoice` → `and(eq(id), garageScope(table.garageId))` so a cross-tenant id resolves to `undefined`; the existing route `if (!record) 404` then hides existence.
- [x] Task 2: Shared helper (AC: 2, 3)
  - [x] `server/tenancy/http.ts` → `sendTenantNotFound(res)` (neutral 404) and `sendForbidden(res)` (403 for authorization, not isolation).
- [x] Task 3: Refine `garageScope` semantics (correctness)
  - [x] Distinguish "scope established but no garage → deny (`false`)" from "no scope at all (background jobs/engine) → do not restrict (`true`)", so scoping the widely-used by-id getters does not break non-request callers. Every `/api` request always has a scope (Story 1.1), so request-path leaks stay closed.
- [x] Task 4: Tests
  - [x] `tenant-guard.test.ts` updated: scope-no-garage denies; no-scope is unrestricted; explicit id honored in background.

## Dev Notes

- **Why getter-scoping = existence-hiding:** routes already branch `if (!record) return 404`. By making the data layer return `undefined` for a cross-tenant id, the 404 is produced uniformly for both "missing" and "another tenant's" — without editing every route. [Source: architecture.md#AD-4]
- **404 over 403:** a 403 on a cross-tenant id would confirm the row exists somewhere; 404 does not. `sendForbidden` exists for the genuine authorization case (in your tenant, but your role can't). [Source: prd.md#FR-1]
- **garageScope refinement is load-bearing:** the by-id getters are called from background contexts (workflow engine, seeds) with no request scope. The refined helper does not restrict when no scope exists, preserving those paths while enforcing isolation for every `/api` request (which always carries a scope). [Source: server/tenancy/tenant-guard.ts, server/tenancy/tenant-context.ts]

### References

- [Source: architecture.md#AD-4; epics.md#Story 1.5; server/storage.ts; server/tenancy/{tenant-guard,http}.ts]

## Dev Agent Record

### Agent Model Used
claude (BMAD bmad-dev-story, Fast path)

### Completion Notes List
- 6 by-id detail getters scoped; shared 404/403 helpers added.
- Refined `garageScope` to be safe for background callers (no-scope = unrestricted).
- Validated by CI (Vitest on Postgres 16); local node_modules/DB unavailable.

### File List
- M server/storage.ts
- M server/tenancy/tenant-guard.ts
- M server/tenancy/__tests__/tenant-guard.test.ts
- A server/tenancy/http.ts

### Change Log
- 2026-06-13: Story 1.5 — existence-hiding via scoped by-id reads + shared helper + garageScope refinement.
