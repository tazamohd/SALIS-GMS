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
   bus — the first write-path events) → invoices ✅ (**8 endpoints** incl. the
   184-line server-side `from-job` calculation across 8 tables, status-transition
   workflow, and role-gated delete; `invoice.created` events on every creation
   path — the head of the `InvoiceCreated → …` chain; non-contiguous monolith
   removal preserving the reconciliation handler) → payments ✅ (garage-scoped
   join list, atomic `recordPayment` create and role-gated `reversePayment`
   delete; `payment.received` / `payment.reversed` events; gateway + supplier
   payments left as separate domains) — **financial core complete**
5. inventory ✅ (items core: spare-parts list/by-id + per-garage inventories; **dashboards**: overview/items/low-stock/reorder/suppliers/turnover/valuation — repository owns all aggregation SQL + PO writes, service owns the analytics math, graceful-degradation defaults preserved; **stock-alerts** (4), **inventory-audit-trail** (2), **inventory-transfers** (6, dual-garage from/to ownership) ✅ — non-contiguous monolith removal keeping reorder-settings/pricing-history) / procurement / **suppliers** ✅ (core: suppliers list/by-id + supplier price lists list/by-id/compare; purchase-orders + purchase-tasks, deliveries, reorder-settings, pricing-history ✅ — extracted into a `procurement` module; PO/PO-item/task **writes** (create/with-items/update/delete, incl. the parent-scoped item-delete ownership guard and the task-parts loop) migrated too — procurement fully owns its surface)
6. crm ✅ (customer-360 list/detail, segments, loyalty summary + award-points, retention analytics, campaigns — raw-SQL read model moved wholesale into a `crm` module: repository owns every `db.execute(sql…)`, service owns the tier/segment/loyalty/retention math, controller keeps the garage-required 403 and graceful-degradation defaults) · insurance ✅ (claims create/list, status update with `requireResourceOwnership`, trailing-year analytics — first monolith extraction delegating through the `phase6-compliance-service` facade; DTO→persistence mapping in the service, `validatePatchBody` boundary in the controller) · fleet ✅ (fleet-accounts surface: account list/detail/create, vehicles, maintenance schedule, analytics roll-ups — extracted from `server/routes/fleet.ts`; the account/vehicle view mappers + tenant-scope filter + analytics math in the service, `resolveGarageScope` + create-validation boundary in the controller; the monolith fleet-management block ✅ (25 endpoints — groups/vehicles/contracts/pricing-tiers/maintenance-schedules CRUD in a dedicated `fleet-management` module, all parent-scoped `requireResourceOwnership` guards + `/group/:fleetGroupId`-before-`/:id` ordering preserved, non-contiguous removal) and the fleet-tracking block ✅ (12 endpoints — vehicle telemetry (locations), geofence zones/events, route planning; the per-vehicle tenant-ownership checks + geofence/route 404/403 rules moved into the service as domain errors, the `requireResourceOwnership` guards on the geofence/route mutations preserved; contiguous removal) — **fleet fully modularized**) · marketplace ✅ (public provider-discovery reads: providers list/detail, smart `/find` search, provider reviews — non-contiguous monolith removal; the four intentionally-unauthenticated reads delegate to `storage`, service holds the 404 + review cap, controller keeps the `/find` min-length 400; the authenticated parts-marketplace (search/orders/track) and `/my/reviews` submission stay in the monolith for follow-ons)
7. hr ✅ (hr-payroll surface: employee directory (raw SQL, manager+ gated), employee detail/create with Saudi-compliance (GOSI/end-of-service/vacation) + duplicate-email 409, attendance synthesis, leave-request workflow, payroll summary + pay slip (ADMIN/MANAGER/ACCOUNTANT gated) — extracted from `server/routes/hr-payroll.ts`; repository owns the raw SQL + leave storage, service owns the compliance/payroll math with domain errors, controller keeps the role guards + graceful-degradation defaults) · reports ✅ (management reporting: revenue (VAT-exclusive, groupBy day/week/month), technician-performance, inventory-turnover, customer-analytics, executive-summary — extracted from `server/routes/reports.ts`; repository owns the aggregate SQL, service owns the groupBy→TO_CHAR mapping + summary number extraction, controller keeps the financial/management role guards + session-garage 403) · analytics ✅ (full `/api/analytics/*` surface — performance report (target synthesis/retention/MoM + management fail-closed 403), dashboard-metrics, custom-reports stubs, profit-analysis, customer-LTV, heat-maps; consolidated the `analytics-performance.ts` route file + 7 monolith handlers into one `analytics` module; repository delegates to the `analytics-service`/`business-intelligence` facades + the two direct performance queries, service owns the snake→camel transforms + roll-ups) / ai / platform / administration

Cross-cutting layers (caching E11, telemetry/metrics/audit E13, CQRS E6 for
accounting/reporting/analytics) are introduced as the domains that need them are
migrated — not up front.

## Quality gates (per step)

- `npm run typecheck` — 0 errors
- `npm run lint` + `npm run lint:arch` — clean
- `npm run test` — green (unit + integration)
- `npm run db:check-drift` — green when schema is touched
- No unresolved circular dependencies; dependency direction respected.
