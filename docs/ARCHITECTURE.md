# SALIS-GMS Architecture

SALIS-GMS is a multi-tenant **garage / auto-workshop management system** for the Saudi market (ZATCA e-invoicing, 15% VAT, Hijri dates, Arabic/English i18n). It's a single TypeScript monorepo: a React SPA, an Express API, and a shared layer that both sides import.

> Audience: engineers new to the codebase. This describes how the pieces fit, not every feature.

## 1. Repository layout

```
client/      React 18 SPA (Vite) — pages, components, hooks, i18n, contexts
server/      Express API — hybrid router, storage layer, engine, integrations
shared/      Code imported by BOTH client and server (schema, plans, utils)
migrations/  drizzle-kit generated SQL
e2e/         Playwright end-to-end tests
scripts/     one-off migration / seed / verification scripts
docs/        documentation (this file lives here)
```

Build: `vite build` (client) + `esbuild` bundles `server/index.ts` → `dist/`. Dev: `tsx server/index.ts` runs the API and mounts Vite in middleware mode (one process serves both).

## 2. The stack

| Layer | Tech |
|---|---|
| Frontend | React 18, **wouter** (routing), **TanStack Query** (server state), Radix UI + Tailwind, `react-i18next` (8 locales) |
| Backend | Express, **Drizzle ORM**, PostgreSQL (`@neondatabase/serverless`), passport + express-session |
| Shared | `shared/schema.ts` — **406 `pgTable` definitions**, the single source of truth for DB + types |
| Tooling | Vite, esbuild, Vitest (+ embedded-postgres / `TEST_DATABASE_URL`), Playwright, drizzle-kit |

## 3. Backend: the hybrid router (the most important thing to understand)

`server/index.ts` boots Express (security headers, rate limiters, request logging) and calls `registerRoutes(app)` from **`server/routes/index.ts`** — the *hybrid router*. It mounts routes in two tiers:

1. **Modular routers** (`server/routes/*.ts`, ~50 files) — mounted first, one feature per file (`customers.routes.ts`, `invoices.routes.ts`, `subscriptions.ts`, …).
2. **The monolith** — `server/routes.ts` (~22k lines) is mounted **last** via `registerLegacyRoutes(app)`.

Because Express matches the **first** registered handler for a given method+path, **modular routers win over the monolith**, and within the monolith the **earlier line wins**. This ordering is load-bearing:

- Some modular routers are *intentionally not mounted* (see the comments in `routes/index.ts` for `estimates`, `supplier-portal`, `misc.routes`) because their in-memory/stub handlers would shadow the monolith's real DB-backed CRUD.
- The flip side: the monolith registers **27 paths more than once** internally, so the later copies are dead code. That's tracked in **issue #35** (audit) — a direct consequence of this hybrid design.

**Takeaway:** when adding/finding an endpoint, remember registration order decides which handler runs. Prefer adding new endpoints as modular routers.

### Storage layer

All DB access goes through **`server/storage.ts`** — a `DatabaseStorage` class implementing the `IStorage` interface, exported as a singleton `storage`. Routes call `storage.someMethod(...)`; the class wraps Drizzle queries against `shared/schema.ts`. (Note: this file had 10 duplicate method collisions — two features sharing a name, one silently shadowing the other — fixed in PR #32. Same root cause as the route duplicates.)

### Cross-cutting middleware

- **Auth** — `server/auth.ts`: passport LocalStrategy + express-session stored in Postgres (`connect-pg-simple`). `SESSION_SECRET` required. `isAuthenticated` gates protected routes.
- **RBAC** — `rbac-config.ts` / `rbac-middleware.ts`: role/permission gating (`requireRole`, `requirePermission`). 2FA via `speakeasy`.
- **Subscription tiers** — `server/middleware/requirePlan.ts`: `requirePlan("PRO")` returns 402 with an upgrade payload when a garage is below tier. Plan definitions live in `shared/plans.ts` (STARTER/PRO/ENTERPRISE).
- **Multi-tenancy** — most data is scoped by `garageId` taken from `req.user`, never the request body.

### The Engine (`server/engine/`)

A lightweight workflow layer initialized once at startup (`initializeEngine()`):
- **event-bus** — `emit()`/subscribe; awaited via `Promise.allSettled`.
- **workflow-engine + state-machines** — valid transitions for jobCard/appointment/invoice/PO/estimate.
- **triggers** — e.g. `job.completed` → notification.
- **scheduled-checks** — runs every 15 min across all active garages; cleaned up on SIGTERM/SIGINT.

### Integrations (optional, env-gated)

Stripe, PayPal, OpenAI (via Replit AI Integrations), Twilio SMS, GetResponse email, TecDoc parts catalog, ZATCA e-invoicing, WhatsApp, OBD-II. Each degrades to mock/preset behavior when its env var is unset; the boot log lists which are disabled. Several SDK clients are constructed at import — they must not throw when unconfigured (guarded with placeholders / `TEST_DATABASE_URL`-style shims so tests can boot the full route tree).

## 4. Frontend (`client/src/`)

- **`App.tsx`** — wraps the app in `QueryClientProvider`, `AuthProvider`, `TooltipProvider`, `FeatureFlagProvider`, then a wouter `<Switch>` of ~255 `<Route>`s (250 page files, lazy-loaded).
- **Layouts** — distinct shells per persona: `Layout` (staff), `CustomerPortalLayout`, `TechnicianLayout`, `PurchaseAgentLayout`.
- **Gating** — three layered gates: `RoleGate` (RBAC), `FeatureFlagContext` ("coming soon" toggles), and `PlanGate`/`usePlan` (subscription tier → upgrade CTA). `ProtectedRoute` composes tier-first, flag-second.
- **Data** — TanStack Query against `/api/*`; `lib/queryClient.ts` centralizes fetch + auth handling.
- **i18n** — `client/src/i18n/`, 8 locales; `en`/`ar` at full key parity, others fall back. RTL for Arabic.

## 5. Shared layer (`shared/`)

Imported by both sides, so it must be **browser-safe** (guard `process.env` behind `typeof process` checks — see `plans.ts`):
- **`schema.ts`** — Drizzle tables + inferred types + drizzle-zod insert schemas. The contract for the whole app.
- **`plans.ts`** — subscription tiers, limits, feature-category mapping.
- **`workflows.ts`** — workflow/state definitions shared with the engine.
- **Saudi utils** — `zatcaUtils`, `vatUtils` (15%), `hijriUtils`, `vehicleCatalogs` (each with co-located `*.test.ts`).

## 6. Testing & CI

- **Vitest** — server tests boot the **full production route tree** via `registerRoutes` (so import-time crashes surface in tests). `server/__tests__/globalSetup.ts` provisions the DB: embedded-postgres by default, or a real Postgres when `TEST_DATABASE_URL` is set (required on Windows, used in CI). It drops/recreates the `public` schema per run and seeds an ENTERPRISE subscription so `requirePlan` routes don't 402.
- **CI** — `.github/workflows/test.yml`: a Postgres 16 service container runs `drizzle-kit push --force` then `npm test`. `main` is branch-protected and requires the `Build, Lint & Test` and `Vitest (Postgres 16)` checks.
- **E2E** — Playwright in `e2e/`.

Run locally:
```bash
npm run dev      # API + Vite on one process
npm run check    # tsc
npm test         # vitest (set TEST_DATABASE_URL for a real PG)
npm run build    # client + server bundle → dist/
```

## 7. Known architectural debt

- **Duplicate route registrations** in `routes.ts` (27, later copies dead) — issue #35.
- **Hybrid-router shadowing** — some modular routers can't be mounted until they're DB-backed (estimates, supplier-portal, misc).
- **`@ts-nocheck`** still present in a few server files (e.g. parts of the engine, business-intelligence).
- **ESLint** isn't migrated to flat config (`eslint.config.js`), so `npm run lint` is currently a no-op in CI.

---

_Generated from a structural read of the codebase. Treat sections 3 and 7 as the highest-signal parts for new contributors._
