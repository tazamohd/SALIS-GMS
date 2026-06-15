# Story 3.2: Deny-by-default RBAC across both route layers

Status: review (coarse-role enforcement, approved matrix)

## Decision (approved 2026-06-15)
Axis: **coarse roles** now (fine-grained `permissions` later). Matrix: approved with the stricter variants (exports ADMIN-only; admin/config ADMIN-only). See `rbac-policy-matrix-PROPOSAL.md`.

## What landed
- `server/authz/policy-registry.ts` — declarative `RBAC_POLICIES`: mutation route-group patterns → allowed coarse roles (financial→ACCOUNTANT/MANAGER; ops→ADVISOR/MANAGER; procurement/inventory→MANAGER; HR→ACCOUNTANT/MANAGER, deletes ADMIN; config/admin→ADMIN).
- `server/authz/authorize.middleware.ts` — `authorizeByPolicy`: on mutating `/api` requests, matches the registry and enforces (ADMIN bypass). Mounted **without** a path prefix (so `req.path` keeps `/api`) after `loadUserPermissions`, before tenant context — so **both** the modular and legacy route layers get the same decision.
- Test `server/__tests__/rbac-authorize.test.ts` — ADVISOR denied invoices/settings, allowed job-cards; ADMIN bypasses; reads not gated.

## Scope & safety
- **Deny-by-default for the mapped groups**; unmapped mutations still pass (incremental rollout) — expand `RBAC_POLICIES` over time toward full coverage (track via `rbac-coverage-report.md`).
- No regression: all existing tests authenticate as ADMIN (bypass); enforcement bites only non-admins. The previously-unused `loginAsUser` (ADVISOR) now exercises real denial.
- TECHNICIAN own-record scoping (stricter variant) is NOT in this middleware (needs per-record ownership checks) — tracked as a refinement; TECHNICIAN is simply excluded from general mutation groups by the matrix.

### References
- [Source: rbac-policy-matrix-PROPOSAL.md; rbac-coverage-report.md; architecture.md#AD-6; epics.md#Story 3.2]

## Dev Agent Record
### File List
- A server/authz/policy-registry.ts
- A server/authz/authorize.middleware.ts
- M server/routes/index.ts (mount authorizeByPolicy)
- A server/__tests__/rbac-authorize.test.ts
### Change Log
- 2026-06-15: Story 3.2 — coarse-role deny-by-default for mapped mutation groups across both route layers.
