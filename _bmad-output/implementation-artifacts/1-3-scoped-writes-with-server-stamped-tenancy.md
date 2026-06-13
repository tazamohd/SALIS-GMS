# Story 1.3: Scoped writes with server-stamped tenancy

Status: review

## Story

As a Garage Owner,
I want creates/updates/deletes to act only on my Garage's data and ignore any client-supplied tenant id,
so that no one can write into or alter another tenant's records.

## Acceptance Criteria

1. **Given** a Garage A request, **When** I `POST` a record whose body specifies `garageId` of Garage B, **Then** the server stamps the record with Garage A and ignores the body value.
2. **And When** I `PATCH`/`DELETE` a record owned by Garage B, **Then** no mutation occurs (0 rows affected) and the handler can return 404/403 (404 semantics: Story 1.5).
3. **And** a cross-tenant write attempt emits an Isolation-Leak signal (durable Audit Event persistence: Story 5.1).

## Tasks / Subtasks

- [x] Task 1: Server-stamped create primitive (AC: 1, 3)
  - [x] `stampGarageId(data, table?)` in `tenant-guard.ts` — overrides any client-supplied `garageId` with the resolved scope; records an Isolation-Leak attempt on mismatch; preserves provided value when no scope (background jobs).
  - [x] `recordIsolationLeakAttempt(detail)` — structured `[ISOLATION-LEAK]` warning; single hook Story 5.1 routes into the immutable audit pipeline.
- [x] Task 2: Scope create payloads (AC: 1)
  - [x] `createJobCard`, `createVehicle`, `createSupplier`, `createInvoice`, `createAppointment` → `stampGarageId(...)`.
- [x] Task 3: Scope update/delete WHERE (AC: 2)
  - [x] `updateJobCard/Vehicle/Supplier/Invoice/Appointment` and `deleteVehicle/Supplier/Invoice/Appointment` → `and(eq(id), garageScope(table.garageId))` so a cross-tenant id affects 0 rows.
- [x] Task 4: Tests (AC: 1, 2, 3)
  - [x] `tenant-guard.test.ts` — stamping overrides client id, flags mismatch, no-flag on match, preserves on no-scope.

## Scope of this story (and what is deferred)

Covers the same 7 core entities as Story 1.2 (writes for job cards, vehicles, suppliers, invoices,
appointments; customers are `users` rows created via the registration flow and are stamped there —
flagged for the tail). The remaining write methods are closed universally by RLS `WITH CHECK` /
`USING` policies (Story 1.6) and caught by the CI guard (Story 6.2).

## Dev Notes

- **No client-controlled tenancy (FR-2):** `stampGarageId` resolves the garage from the request's Tenant Scope and ignores the body value; the resolver already prefers context over any passed id, so even a forwarded client `garageId` cannot cross tenants. [Source: architecture.md#AD-2, server/tenancy/tenant-guard.ts]
- **Cross-tenant mutation = no-op:** update/delete now `and(eq(id), garageScope(table.garageId))`. When the id belongs to another garage the predicate matches 0 rows, the method returns `undefined`/void, and the route surfaces 404 (existence-hiding lands fully in Story 1.5). [Source: epics.md#Story 1.5]
- **Audit event (AC #3):** emitted now as a structured, monitorable `[ISOLATION-LEAK]` event for the precise, unambiguous case — a create whose client-supplied `garageId` differs from scope. The ambiguous update/delete 0-row case is left to the 404 path; durable immutable Audit Events for all privileged actions are Story 5.1, which wires the `recordIsolationLeakAttempt` hook into the audit pipeline. [Source: epics.md#Story 5.1]

### References

- [Source: architecture.md#AD-2; epics.md#Story 1.3, #Story 1.5, #Story 1.6, #Story 5.1]
- [Source: server/storage.ts, server/tenancy/tenant-guard.ts]

## Dev Agent Record

### Agent Model Used

claude (BMAD bmad-dev-story, Fast path)

### Debug Log References

- `node --experimental-strip-types --check server/storage.ts` — OK.
- Stamping logic mirror-smoke 5/5; committed `tenant-guard.test.ts` covers real import in CI.

### Completion Notes List

- 5 creates server-stamped; 5 updates + 4 deletes scoped to the caller's garage.
- Isolation-Leak hook in place; durable audit persistence deferred to Story 5.1.
- Customer (users) write-stamping deferred to the registration path / tail.

### File List

- M server/tenancy/tenant-guard.ts
- M server/tenancy/__tests__/tenant-guard.test.ts
- M server/storage.ts

### Change Log

- 2026-06-13: Story 1.3 implemented (server-stamped creates; scoped update/delete).
