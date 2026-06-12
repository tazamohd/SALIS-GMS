# SALIS-GMS — Architecture Overview

## System Style

SALIS-GMS is a **monolithic full-stack TypeScript application** deployed as a single Node.js process that serves both an Express REST API and the compiled React SPA. There is no microservices split at runtime; all business domains share one process, one database connection pool, and one session store.

```
Browser (React SPA)
      |
      | HTTP/REST (/api/*)
      | WebSocket (ws://)
      v
Express Server (port 5000)
      |
      +-- Hybrid Router (server/routes/index.ts)
      |       |-- Modular routes (server/routes/*.routes.ts + feature files)
      |       `-- Legacy monolith (server/routes.ts) — registered last
      |
      +-- Middleware stack
      |       requestId → rate limit → security headers → session/Passport → RBAC
      |
      +-- Service layer (server/services/)
      |
      +-- Workflow engine (server/engine/)
      |
      +-- WebSocket server (server/websocket.ts)
      |
      `-- Drizzle ORM
              |
              v
         PostgreSQL (Neon serverless)
```

## Three-Module Boundary

The codebase enforces a strict three-module boundary:

```
client/src/    <----(imports)----  shared/
                                      ^
server/        <----(imports)----  shared/
```

- `shared/` is the **only** directory that both sides may import.
- The client never imports from `server/`.
- The server never imports from `client/`.
- All database schema definitions and compliance utilities live in `shared/` to ensure both sides share identical type definitions.

## Design Patterns

**Repository / Storage pattern**: `server/storage.ts` is a single module exposing all data access functions. Route handlers and services call storage functions; they do not write raw SQL or Drizzle queries inline. This decouples business logic from persistence details.

**RBAC middleware chain**: Every authenticated route passes through `isAuthenticated` (Passport session check) and optionally through `requireRole` or fine-grained permission checks from `server/rbac-middleware.ts`. Roles and permission sets are declared in `server/rbac-config.ts`.

**Workflow engine**: `server/engine/` implements an internal event bus and state machine runner. Job card status transitions and appointment state changes are driven through state machines rather than ad-hoc conditional updates. The engine also runs scheduled checks for reminders and alerts.

**TanStack Query as the client state boundary**: The client does not maintain a separate client-side store (no Redux, no Zustand). All server state is managed through TanStack Query v5. Local UI state uses React `useState`/`useReducer` within components or pages.

**Zod for schema validation at both boundaries**: `shared/schema.ts` generates Zod insert/select schemas via `drizzle-zod`. The client uses Zod for form validation (via react-hook-form). The server uses Zod schemas in middleware (`server/middleware/validate.ts`) for request body validation.

## Route Architecture — Hybrid (In-Progress Refactoring)

The route layer is undergoing an incremental migration from a single monolithic file (`server/routes.ts`, ~4400+ lines) to domain-specific modular files in `server/routes/`.

Current state:
- **Fully extracted** (8 domains, ~94 endpoints): customers, vehicles, job cards, technicians, inventory, invoices, scheduling, settings
- **Skeleton files** (pending extraction): fleet, reports
- **Intentionally unmounted**: `misc.routes.ts` (in-memory stubs conflict with monolith handlers), `estimates.ts` (in-memory store shadowed DB-backed monolith)
- **Legacy monolith**: `server/routes.ts` remains active and is registered last; it handles all domains not yet extracted

`server/routes/index.ts` is the single registration point. Modular handlers are mounted before the legacy monolith, so they take priority for overlapping paths. This enables zero-downtime extraction: a new `.routes.ts` file shadows the legacy handler as soon as it is mounted.

**Long-term trajectory**: deprecate and remove `server/routes.ts` once all domains are extracted to modular files.

## Real-Time Communication

`server/websocket.ts` establishes a `ws` WebSocket server attached to the same HTTP server. It handles:
- In-app chat between staff
- Push notifications to connected clients
- Service bay tracking events (vehicle arrival, status changes)

The client connects via native WebSocket and receives typed event messages.

## Saudi Compliance Layer

Compliance is implemented as shared utilities plus a server-side service:
- `shared/vatUtils.ts` — VAT 15% calculation and rounding
- `shared/zatcaUtils.ts` — ZATCA QR payload encoding and invoice field mapping
- `shared/hijriUtils.ts` — Hijri/Gregorian date conversion
- `server/services/zatca-phase2.ts` — ZATCA Phase 2 e-invoice generation and submission
- `server/services/saudi-compliance.ts` — Aggregated compliance business rules

These are intentionally isolated so the compliance layer can be updated independently of product features.
