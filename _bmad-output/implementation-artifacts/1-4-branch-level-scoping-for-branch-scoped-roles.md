# Story 1.4: Branch-level scoping for branch-scoped roles

Status: in-progress (mechanism delivered; resource application blocked on PRD Open Question #1)

## Story

As a branch-scoped Service Advisor,
I want to see only my Branch's operational data,
so that I work within my location while Garage-level roles still see all Branches.

## Acceptance Criteria

1. A branch-scoped user's list of branch-scoped resources excludes other Branches of the same Garage. **(BLOCKED — needs the per-resource matrix)**
2. A Garage-level user sees all Branches of their Garage and none of another Garage. **(garage isolation already met by Stories 1.2/1.5; "all branches" preserved by default-no-restriction)**

## Blocking decision

Which resources are **Branch-scoped vs Garage-scoped**, and which roles are Garage-level
vs Branch-restricted, is **PRD Open Question #1** — unresolved. Applying branch restriction to
resources without that matrix risks wrongly denying legitimate access (e.g. restricting a Manager who
should see all branches). So this story delivers the **mechanism** and the scope flag, but deliberately
does **not** wire branch restriction into any resource query yet. No behavior changes for existing users.

## Tasks / Subtasks

- [x] Add `isBranchRestricted` to `TenantScope` (+ `ANONYMOUS_SCOPE`, WS scope literal).
- [x] Resolver computes `isBranchRestricted` from a provisional role classification (`GARAGE_LEVEL_ROLES`), `[ASSUMPTION]` pending the matrix.
- [x] `branchScope(branchColumn)` helper: no restriction for garage-level/platform/background; `inArray(branchIds)` for branch-restricted; deny when branch-restricted with no branches.
- [x] Unit tests for `branchScope`.
- [ ] **Apply `branchScope` to the confirmed branch-scoped resources** — pending the matrix (PRD Open Q #1).

## Dev Notes

- `branchScope` composes with `garageScope`: garage isolation is always enforced; branch restriction is an *additional* narrowing only for branch-restricted users. [Source: server/tenancy/tenant-guard.ts]
- Provisional `GARAGE_LEVEL_ROLES = {ADMIN, MANAGER, OWNER, GARAGE_OWNER, SUPER_ADMIN}`; everyone else with branch bindings is branch-restricted. This drives only the flag today — confirm before applying to resources. [Source: server/tenancy/tenant-scope.ts]

### References
- [Source: epics.md#Story 1.3 (AC for branch scoping), prd.md#Open Questions §13 Q1, architecture.md#AD-1]

## Dev Agent Record

### Agent Model Used
claude (BMAD bmad-dev-story, Fast path)

### Completion Notes List
- Mechanism + scope flag + tests delivered; zero behavior change (no resource wired).
- Resource application intentionally deferred to avoid guessing the branch/garage matrix.

### File List
- M server/tenancy/tenant-context.ts
- M server/tenancy/tenant-scope.ts
- M server/tenancy/tenant-guard.ts
- M server/tenancy/__tests__/tenant-guard.test.ts
- M server/tenancy/__tests__/tenant-context.test.ts
- M server/websocket.ts

### Change Log
- 2026-06-13: Story 1.4 — branchScope mechanism + isBranchRestricted scope flag (resource application deferred to PRD Open Q #1).
