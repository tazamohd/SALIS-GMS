# Phase E — Enterprise Architecture Transformation: Execution Plan

**Status:** In progress · **Strategy:** incremental (strangler-fig), never big-bang.

This is the concrete, sequenced plan for evolving SALIS-GMS from a partially
modular monolith into a **Domain-Driven Modular Monolith**. It is designed to be
executed one domain at a time, keeping the build, tests, and production behavior
green after every step.

## Guiding constraints

1. **Preserve public API behavior** unless a breaking change is explicitly
   approved. Existing endpoints keep their exact wire shapes during migration.
2. **Migrate one domain at a time.** Each domain is validated independently.
3. **Remove legacy code only after parity is confirmed** by tests.
4. **Every step compiles, lints, and passes tests** before it is committed.

## Target layout (north star) vs. current landing

The vision uses top-level `apps/`, `packages/`, `modules/`, `infrastructure/`.
Reaching that literal layout requires moving the repo to a workspace/monorepo
build — itself a later phase. To make progress **without** a big-bang build
change, the same architecture lands under `server/` today and is relocated once
the monorepo tooling is in place:

| North-star            | Lands today as                         |
| --------------------- | -------------------------------------- |
| `infrastructure/*`    | `server/infrastructure/*`              |
| `packages/permissions`| `server/infrastructure/permissions`    |
| `packages/validation` | `server/modules/*/validators` + Zod    |
| `modules/<domain>/*`  | `server/modules/<domain>/*`            |
| `apps/{api,worker,…}` | future — extract once modules are clean |

## What is delivered now (foundation + reference domain)

### Foundation — `server/infrastructure/`
- **errors/** — `DomainError` hierarchy (E12): NotFound / Validation / Auth(z) /
  BusinessRule / Conflict / Infrastructure, each with code, HTTP status,
  details, correlation id, and structured context.
- **http/response.ts** — standard success/error envelope + safe error mapping
  (E10). Adopted for new/opt-in endpoints; existing contracts preserved.
- **events/event-bus.ts** — in-process event bus (E7): idempotent delivery,
  retry-with-backoff, dead-letter capture, per-subscriber isolation.
- **di/** — typed DI container + composition root (E3).
- **repository/base-repository.ts** — repository contracts (E4).
- **permissions/registry.ts** — central RBAC registry with role grants,
  policy overrides, tenant/ownership guards, and an Express `authorize` guard (E8).

### Reference domain — `server/modules/customers/`
The copyable template every future domain follows. Layered per E2:

```
customers/
  controllers/   # thin HTTP adapters; no business rules, no data layer
  services/      # business rules, tenant scoping, events (E5)
  repositories/  # the only data-layer access (E4) — wraps `storage` (seam)
  validators/    # Zod schemas (E9)
  domain/        # entity/domain types
  dto/           # wire-shape mappers (E10)
  events/        # published event contract + handlers (E7)
  __tests__/     # unit tests (DB-free)
  index.ts       # DI assembly → Express Router
```

Dependency direction is enforced: `controller → service → repository → storage`.
The customer repository **delegates to the legacy `storage` facade** — a
strangler-fig seam that establishes the boundary now; its internals move to
direct Drizzle queries later with no caller change. Behavior is identical to the
retired `server/routes/customers.ts`.

## Governance (E14)

- `scripts/check-architecture.mjs` (`npm run lint:arch`) fails CI if a controller
  or service imports the data layer directly, or a module imports another
  module's repository.
- ESLint `no-restricted-imports` surfaces the same at edit time.
- ADRs under `docs/adr/` record significant decisions.

## Domain migration sequence (repeatable playbook)

For each domain: **Extract → Compile → Test → Verify parity → Commit.**

1. customers ✅ (reference)
2. vehicles ✅ (list + `/vehicles/:id/*` maintenance reads; `requireResourceOwnership` preserved)
3. garage ✅ (garages list/detail/branches + role catalog; `requireManagerOrAbove` / `requireResourceOwnership` preserved) · appointments ✅ (tenant-pinned list + by-id 404)
4. jobcards ✅ (read surface: list + detail/details + parts/tasks; `/parts`
   Drizzle query absorbed into the repository) → estimates ✅ (**first monolith
   extraction**: 9 endpoints — reads, writes, stats SQL, and the two conversion
   workflows; `estimate.converted_to_{job_card,invoice}` events wired through the
   bus — the first write-path events) → invoices → payments (continue the
   write-heavy, event-rich core; `InvoiceCreated → InventoryReserved →
   StockUpdated → AccountingPosted → CustomerNotified` extends from here)
5. inventory / procurement / suppliers
6. crm / insurance / fleet / marketplace
7. hr / reports / analytics / ai / platform / administration

Cross-cutting layers (caching E11, telemetry/metrics/audit E13, CQRS E6 for
accounting/reporting/analytics) are introduced as the domains that need them are
migrated — not up front.

## Quality gates (per step)

- `npm run typecheck` — 0 errors
- `npm run lint` + `npm run lint:arch` — clean
- `npm run test` — green (unit + integration)
- `npm run db:check-drift` — green when schema is touched
- No unresolved circular dependencies; dependency direction respected.
