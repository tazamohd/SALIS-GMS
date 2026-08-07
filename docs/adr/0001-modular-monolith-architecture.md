# ADR-0001: Domain-Driven Modular Monolith

**Status:** Accepted · **Phase:** E1–E5

## Context

The backend grew into a partial modular monolith with two large monoliths
remaining: `server/routes.ts` (~22k lines) and `server/storage.ts` (~15k lines).
Route modules under `server/routes/` reach directly into the shared `storage`
facade, so there are no real domain boundaries, data access is centralized in one
file, and business rules live in route handlers.

## Decision

Adopt a **Domain-Driven Modular Monolith**. Each domain owns a layered slice:

```
controller → service → repository → database
```

- **Controllers** are thin HTTP adapters — no business rules, no data access.
- **Services** hold business rules, tenant scoping, and emit domain events.
- **Repositories** are the only place that touches the data layer.
- Dependencies flow one direction; repositories never call controllers, and
  controllers never touch the database.

Modules are wired via a small **DI container + composition root** so services are
constructed from abstractions and are trivially testable with fakes.

To avoid a big-bang rewrite, a new domain repository initially **delegates to the
legacy `storage` facade** (strangler-fig). The boundary is enforced immediately;
the repository's internals migrate to direct Drizzle queries later without
changing any caller.

The target north-star layout (`apps/`, `packages/`, `modules/`, `infrastructure/`)
lands under `server/` for now and relocates when the build moves to a monorepo
workspace (a later phase). See `docs/architecture/PHASE-E-EXECUTION-PLAN.md`.

## Consequences

- Domains migrate one at a time; the app stays shippable throughout.
- New code is testable without a database (services use repository fakes).
- Some indirection is added versus calling `storage` directly — accepted for
  boundaries, testability, and swappability.
- The `customers` module is the reference implementation for all future domains.
