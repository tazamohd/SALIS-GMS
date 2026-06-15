# Story 3.1: Endpoint policy registry + shared authorize middleware (foundation)

Status: review (foundation only — see scope)

## Story

As an Engineer,
I want roles/permissions available on every request and a place to declare endpoint policies,
so that consistent RBAC enforcement can be applied — built on the existing seeded permissions.

## Decision (from authorization-matrix Q3)
Enforce the **existing seeded RBAC** (`roles`/`permissions`/`role_permissions` + `seed-rbac.ts`) as the base, then refine to the "best combination". This story lays the safe foundation; the deny-by-default flip (Story 3.2) is deliberately separate and incremental.

## What landed (foundation)
- `loadUserPermissions` (from `server/rbac-middleware.ts`) is now globally mounted on `/api`, **before** `tenantContextMiddleware`, in `server/routes/index.ts`.
  - Populates `req.userRoles` / `req.userPermissions` (5-min cached) for every request — additive, never denies.
  - Also fixes the review's "req.userRoles never populated → extra per-request query" finding: `resolveTenantScope` now reuses the preloaded role bindings instead of issuing its own `user_role_branch` query.

## Deliberately deferred to Story 3.2 (high-risk, incremental)
- The **deny-by-default flip**: applying `requirePermission`/a policy registry across the ~860 endpoints. A blanket flip would lock users out wherever the seeded permissions are incomplete. Plan: introduce a policy registry, enforce module-by-module with CI between each, and surface a coverage report.

## Coverage measured (Story 3.2 input, 2026-06-15)
A scan (`rbac-coverage-report.md`) quantifies the gap: **767 mutation endpoints, only 9 role-guarded, 758 auth-only**. Confirms deny-by-default must be applied per-endpoint with a product-defined required-role matrix — a blind flip across 758 endpoints would lock users out. Enforcement (3.2) is therefore gated on that matrix; the report is the worksheet.

## Dev Notes
- Mount order matters: permissions load → tenant scope → routes. [Source: server/routes/index.ts]
- `requirePermission` (rbac-middleware) previously 500'd with "Permissions not loaded" because nothing mounted `loadUserPermissions` globally — now resolved.

### References
- [Source: epics.md#Story 3.1/3.2; server/rbac-middleware.ts, server/rbac-config.ts, server/seed-rbac.ts; code-review-findings-2026-06-13.md]

## Dev Agent Record
### File List
- M server/routes/index.ts (global loadUserPermissions mount)
### Change Log
- 2026-06-14: Story 3.1 foundation — global permission loading; scope reuses preloaded roles.
