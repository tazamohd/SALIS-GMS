# Story 1.1: Establish request Tenant Scope

Status: review

<!-- Validation optional. Epic 1, foundation story — everything in Epic 1 builds on this. -->

## Story

As an Engineer,
I want every authenticated request to carry a resolved Tenant Scope in request-scoped context,
so that the data layer can enforce isolation without any endpoint passing `garageId` by hand.

## Acceptance Criteria

1. **Given** an authenticated request from a user with Role Bindings in Garage A, **When** `tenantContextMiddleware` runs after authentication, **Then** an AsyncLocalStorage store holds `{ userId, garageId, branchIds, isPlatformPrincipal, impersonation }` derived from `req.user` and `user_role_branch`.
2. **And** the scope is readable by the data layer for the full async lifetime of the request, including across `await` boundaries and `/ws/chat` message handlers.
3. **And** a request with no resolvable scope (unauthenticated / public route) yields an explicit anonymous scope (no `garageId`, empty `branchIds`) — never a defaulted real Garage.
4. **And** the mechanism introduces no behavioral change to existing endpoints in this story (consumption of the scope to filter queries is Story 1.2).

## Tasks / Subtasks

- [x] Task 1: Tenant context store (AC: 1, 2, 3)
  - [x] Create `server/tenancy/tenant-context.ts` with `TenantScope` type, `tenantContextStorage` (AsyncLocalStorage), `runWithTenantScope`, `getTenantScope`, `requireTenantScope`, `getCurrentGarageId`, `hasTenantScope`, and `ANONYMOUS_SCOPE`.
- [x] Task 2: Scope resolver (AC: 1, 3)
  - [x] Create `server/tenancy/tenant-scope.ts` → `resolveTenantScope(req)` reading `req.user.garageId` and branch ids from `req.userRoles` (preloaded) or a `user_role_branch` query; platform principal = no garageId.
- [x] Task 3: Middleware (AC: 1, 2)
  - [x] Create `server/tenancy/tenant-context.middleware.ts` → enters the store via `tenantContextStorage.run(scope, () => next())`.
  - [x] Wire `app.use("/api", tenantContextMiddleware)` in `server/routes/index.ts` immediately after `setupAuth`/`markAuthInitialized`.
- [x] Task 4: WebSocket propagation (AC: 2)
  - [x] Wrap authenticated `/ws/chat` message dispatch in `runWithTenantScope` in `server/websocket.ts`.
- [x] Task 5: Tests (AC: 2, 3)
  - [x] `server/tenancy/__tests__/tenant-context.test.ts` — DB-free unit tests: undefined outside context; set/read inside; survives `await`; `requireTenantScope` throws outside; nested isolation; anonymous scope shape.

## Dev Notes

- **AsyncLocalStorage** (`node:async_hooks`) is the confirmed scope-propagation mechanism (architecture AD-1). Enter the store once in middleware via `storage.run(scope, () => next())`; Express's downstream chain and async continuations retain the context. [Source: architecture.md#AD-1]
- **Scope source of truth:** `req.user.garageId` (the Garage / Tenant) and `user_role_branch` rows for the user (branch ids). `loadUserPermissions` (`server/rbac-middleware.ts`) already loads `req.userRoles` with `branchId`, but it is **not** globally mounted, so the resolver must fall back to a direct indexed `user_role_branch` query keyed on `userId`. [Source: server/rbac-middleware.ts#loadUserPermissions, shared/schema.ts#userRoleBranch]
- **Platform Principal** = a Super Admin not bound to a single Garage; there is no explicit flag in `users`, so `isPlatformPrincipal = !garageId`. `[ASSUMPTION — confirm in a later story if an explicit super-admin flag is added.]` [Source: prd.md#Glossary, shared/schema.ts#users]
- **Wiring point:** `server/routes/index.ts` line ~118, right after `markAuthInitialized()` and before the modular route mounts, so `req.user` is populated. Applies to `/api` only (Vite/static untouched). [Source: server/routes/index.ts]
- **WebSocket:** auth happens via an in-band `auth` message; once `ws.userId`/`ws.garageId` are set, wrap `handleMessage` in `runWithTenantScope` (branchIds empty for WS in v1). [Source: server/websocket.ts#handleAuth]
- **No deny-by-default here.** This story only *establishes* the scope. Removing the "no garageId ⇒ return all" fallback and applying the filter is Story 1.2. Keep this change behavior-neutral.

### Project Structure Notes

- New module dir `server/tenancy/` matches the architecture source-tree layout. [Source: architecture.md#Project Structure]
- IDs are UUID strings (`users.garageId`, `branches.id`); `userRoleBranch.branchId` is `NOT NULL`.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#AD-1, #AD-2, #Project Structure]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- [Source: server/routes/index.ts, server/auth.ts, server/rbac-middleware.ts, server/websocket.ts, shared/schema.ts]

## Dev Agent Record

### Agent Model Used

claude (BMAD bmad-dev-story, Fast path)

### Debug Log References

- `npx tsc --noEmit` on new tenancy modules — passes (see Completion Notes).
- DB-free unit test executed via standalone runner (vitest globalSetup requires Postgres not available in this sandbox).

### Completion Notes List

- Implemented `server/tenancy/{tenant-context,tenant-scope,tenant-context.middleware}.ts` + WS wrap + route wiring.
- Behavior-neutral: scope is established but not yet consumed by queries (Story 1.2).
- branchIds resolved eagerly via indexed `user_role_branch` lookup; can be cached in a later story if profiling shows overhead.

### File List

- A server/tenancy/tenant-context.ts
- A server/tenancy/tenant-scope.ts
- A server/tenancy/tenant-context.middleware.ts
- A server/tenancy/__tests__/tenant-context.test.ts
- M server/routes/index.ts
- M server/websocket.ts

### Change Log

- 2026-06-13: Story 1.1 implemented (tenant context via AsyncLocalStorage).
