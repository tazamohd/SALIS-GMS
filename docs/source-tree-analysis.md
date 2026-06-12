# SALIS-GMS - Source Tree Analysis

**Date:** 2026-06-12

## Overview

SALIS-GMS is a single-repository, full-stack TypeScript monorepo with three first-class code areas — `client/` (React SPA), `server/` (Express API), and `shared/` (Drizzle schema + domain utilities used by both sides). It is not an npm-workspaces monorepo; separation is by directory. The Express server is the single process: it serves both the REST/WebSocket API and the built SPA on port 5000.

## Complete Directory Structure

```
SALIS-GMS/
├── client/                      # React 18 frontend (SPA)
│   ├── index.html               # Vite root HTML (loads /src/main.tsx)
│   └── src/
│       ├── main.tsx             # ENTRY: React 18 root render into #root
│       ├── App.tsx              # Root component: Router (wouter) + AuthProvider
│       ├── pages/               # Route-level page components (Dashboard, JobCards, …)
│       │   ├── technician/      # Technician portal pages
│       │   ├── customer/        # Customer portal pages
│       │   └── mobile/          # Mobile-optimized pages
│       ├── components/          # Reusable components
│       │   ├── ui/              # shadcn/ui library (Radix-based)
│       │   ├── Layout.tsx       # App shell, role-based navigation
│       │   ├── ErrorBoundary.tsx
│       │   ├── CustomerPortalLayout.tsx / TechnicianLayout.tsx
│       │   └── customer/        # Domain components
│       ├── hooks/               # Custom hooks (useAuth, …)
│       ├── lib/                 # queryClient, registerSW (PWA), export/PDF/Excel utils
│       ├── contexts/            # React contexts
│       ├── i18n/
│       │   ├── config.ts        # i18next setup + language detection
│       │   └── locales/         # en, ar (RTL), fr, es, de, zh, hi JSON
│       ├── styles/ / index.css  # Tailwind imports + global CSS
│       └── test/                # Vitest client setup
│
├── server/                      # Express backend
│   ├── index.ts                 # ENTRY: Express app, security/rate-limit, Vite/static, port 5000
│   ├── config.ts                # Centralized env config; validates DATABASE_URL & SESSION_SECRET (fail-fast)
│   ├── db.ts                    # Drizzle ORM connection (Neon serverless or local pool)
│   ├── auth.ts                  # Passport LocalStrategy, session setup, bcrypt
│   ├── storage.ts               # DB access layer (// @ts-nocheck bridge; runtime-validated)
│   ├── routes.ts                # LEGACY monolithic router (~22k lines, ~760 endpoints) — fallback
│   ├── routes/
│   │   ├── index.ts             # Hybrid mount: modular domain routers first, then legacy routes.ts
│   │   ├── technicians.routes.ts / jobcards.routes.ts / customers.routes.ts
│   │   ├── vehicles.routes.ts / inventory.routes.ts / invoices.routes.ts
│   │   ├── scheduling.routes.ts / misc.routes.ts
│   │   ├── fleet.routes.ts / reports.routes.ts / settings.routes.ts  (skeletons)
│   │   ├── auth.ts / public.ts  # auth + public endpoints
│   │   └── …                    # AI, payments, marketing, etc.
│   ├── middleware/              # requireRole, requirePlan, validate (Zod), …
│   ├── services/                # Business logic: saudi-compliance, zatca-phase2, smsService,
│   │                            #   aiChatbot, predictive-maintenance, audit-trail, …
│   ├── websocket.ts             # WebSocket server (/ws/chat: chat, notifications)
│   ├── engine.ts                # Workflow/state-machine engine
│   ├── auditMiddleware.ts       # Action logging
│   ├── seed.ts                  # Database seeding
│   └── __tests__/               # Server unit/integration tests + globalSetup
│
├── shared/                      # Code shared by client & server
│   ├── schema.ts                # Drizzle ORM schema (~10,961 lines, 400+ tables) + Zod schemas
│   ├── schema-guide.ts          # Schema usage guidance
│   ├── workflows.ts / workflow-engine.test.ts
│   ├── vatUtils.ts              # 15% VAT calculation (+ test)
│   ├── zatcaUtils.ts            # ZATCA QR / e-invoicing (+ test)
│   ├── hijriUtils.ts            # Hijri calendar conversion (+ test)
│   ├── saudi-compliance.test.ts
│   ├── vehicleCatalogs.ts       # Makes/models/years/colors
│   └── plans.ts                 # Subscription plan definitions
│
├── migrations/                  # Drizzle SQL migrations (+ meta/)
├── e2e/                         # Playwright specs (auth, workflow)
├── public/                      # PWA manifest.json + icons
├── docs/                        # Documentation (01-project … 10-technical) + generated docs
├── scripts/                     # Utility/DB scripts (verify-db, …)
│
├── package.json                 # Dependencies + npm scripts
├── tsconfig.json                # Strict TS, path aliases @/, @shared/, @assets/
├── vite.config.ts               # Vite (React, aliases, vendor code-splitting)
├── vitest.config.ts             # Vitest (per-glob env: node/jsdom)
├── playwright.config.ts         # Playwright (baseURL :5000, reuseExistingServer)
├── drizzle.config.ts            # Drizzle schema → migrations config
├── tailwind.config.ts           # Tailwind + SALIS brand palette
├── components.json              # shadcn/ui registry
├── .prettierrc                  # Prettier (no ESLint config present)
├── Dockerfile / docker-compose.yml  # node:20-alpine build + postgres:16-alpine
├── render.yaml / railway.json / .replit  # deployment targets
├── REFACTORING_CHECKLIST.md / ROUTES_REFACTORING_SUMMARY.md
└── README.md / replit.md
```

## Critical Directories

### `client/src/`

**Purpose:** React 18 single-page application (functional components + hooks).
**Contains:** route pages, shadcn/ui components, hooks, query client, i18n, PWA registration.
**Entry Points:** `client/src/main.tsx` (root render), `client/index.html` (Vite host).
**Integration:** Talks to the server via REST (`/api/*`, through TanStack Query) and WebSocket (`/ws/chat`). Imports shared types/schemas from `@shared/*`.

### `server/`

**Purpose:** Express REST + WebSocket API and SPA host.
**Contains:** app bootstrap (`index.ts`), hybrid routing (`routes/` + legacy `routes.ts`), services, middleware, auth, DB access.
**Entry Points:** `server/index.ts`.
**Integration:** Reads/writes PostgreSQL via Drizzle (`db.ts` → `shared/schema.ts`); serves built client from `dist/public` in production.

### `shared/`

**Purpose:** Single source of truth for the data model and domain math shared across client/server.
**Contains:** Drizzle schema + Zod schemas, VAT/ZATCA/Hijri utilities, plans, vehicle catalogs.
**Integration:** Imported via `@shared/*` by both client and server — change here ripples both ways.

### `migrations/`

**Purpose:** Drizzle-generated SQL migrations applied with `npm run db:push`.
**Note:** Forward-only; no automated rollback.

## Entry Points

- **Server (main):** `server/index.ts` — Express on port 5000 (API + static SPA).
- **Client:** `client/src/main.tsx` — React 18 root into `#root`; host HTML `client/index.html`.
- **WebSocket:** `server/websocket.ts` — `/ws/chat`.

## File Organization Patterns

- Components `PascalCase.tsx`; utilities/services `camelCase.ts`; route modules `kebab-case.routes.ts`; shared schema `schema.ts`.
- Co-located tests (`*.test.ts` / `*.spec.ts`) next to source; E2E isolated in `e2e/`.
- Path aliases (`@/`, `@shared/`, `@assets/`) instead of deep relative imports.

## Configuration Files

- **`tsconfig.json`** — strict TypeScript, ES2022, path aliases.
- **`vite.config.ts`** — React plugin, aliases, vendor chunk splitting.
- **`vitest.config.ts`** — per-glob environments (node for server/shared, jsdom for client), single fork, global DB setup.
- **`playwright.config.ts`** — baseURL `http://localhost:5000`, `reuseExistingServer: true`.
- **`drizzle.config.ts`** — schema source and migration output.
- **`tailwind.config.ts`** — SALIS monochrome palette + vendor chunk hints.
- **`.prettierrc`** — formatting (semi, single quotes, trailing-comma all, width 100). There is a `lint` npm script (`eslint .`) but no ESLint config file at the repo root.
- **`Dockerfile` / `docker-compose.yml`** — multi-stage `node:20-alpine` build; `postgres:16-alpine` service.

## Notes for Development

- One process, one port (5000) for both API and SPA — don't expect a separate frontend dev port.
- `dist/` is gitignored; always `npm run build` before Docker build or deploy.
- Set `.env` (`DATABASE_URL`, `SESSION_SECRET`) before any command — config validation exits otherwise.
- When adding endpoints, prefer the modular `server/routes/*.routes.ts`; the legacy `server/routes.ts` is a shrinking fallback.

---

_Generated using BMAD Method `document-project` workflow (executed autonomously)._
