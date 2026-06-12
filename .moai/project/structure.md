# SALIS-GMS — Directory Structure and Module Organization

## Top-Level Layout

```
SALIS-GMS/
├── client/                  # React SPA (Vite root)
├── server/                  # Express API server (Node.js entry)
├── shared/                  # Code shared between client and server
├── migrations/              # SQL migration files (drizzle-kit)
├── e2e/                     # Playwright end-to-end tests
├── scripts/                 # One-off utility scripts (DB verify, etc.)
├── public/                  # Static landing page assets (served at /public)
├── docs/                    # Project-level documentation
├── dist/                    # Build output (gitignored)
│   ├── index.js             # Bundled server (esbuild)
│   └── public/              # Bundled client (Vite)
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Local dev stack (app + PostgreSQL)
├── railway.json             # Railway deployment config
├── render.yaml              # Render deployment config
├── vite.config.ts           # Vite build configuration
├── drizzle.config.ts        # Drizzle ORM / drizzle-kit config
├── vitest.config.ts         # Vitest test runner config
├── playwright.config.ts     # Playwright e2e config
├── tsconfig.json            # TypeScript project config
└── package.json             # Monorepo-style single package (ESM)
```

---

## `client/` — React SPA

```
client/
└── src/
    ├── main.tsx             # React DOM root, ErrorBoundary, i18n init, PWA SW
    ├── App.tsx              # Route table (wouter Switch/Route), auth guard
    ├── index.css            # Global CSS and Tailwind base
    ├── components/          # Shared UI components
    │   ├── Layout.tsx       # Main authenticated shell (sidebar, topbar)
    │   ├── TechnicianLayout.tsx
    │   ├── CustomerPortalLayout.tsx
    │   ├── PurchaseAgentLayout.tsx
    │   ├── ErrorBoundary.tsx
    │   └── ui/              # shadcn/ui primitives (button, dialog, table, etc.)
    ├── pages/               # ~202 page-level components, one per route
    │   ├── Dashboard.tsx
    │   ├── JobCards.tsx
    │   ├── Customers.tsx
    │   ├── Invoices.tsx
    │   ├── technician/      # Technician sub-portal pages
    │   └── mobile/          # Mobile layout pages
    ├── hooks/               # Custom React hooks
    │   └── useAuth.tsx      # Auth context and session hook
    ├── contexts/            # React context providers
    ├── lib/                 # Utilities and API client helpers
    │   ├── queryClient.ts   # TanStack Query client instance and fetch wrapper
    │   ├── registerSW.ts    # PWA service worker registration
    │   ├── authUtils.ts     # Auth-related utility functions
    │   └── utils.ts         # General utility helpers
    ├── config/              # Client-side config constants
    ├── styles/              # Additional CSS modules
    └── i18n/
        ├── config.ts        # i18next initialization (7 locales, fallbackLng: 'en')
        └── locales/
            ├── en.json      # English translations (fallback locale)
            ├── ar.json      # Arabic translations
            ├── fr.json      # French translations
            ├── es.json      # Spanish translations
            ├── de.json      # German translations
            ├── zh.json      # Chinese translations
            └── hi.json      # Hindi translations
```

**Routing**: `App.tsx` defines all routes using `wouter`. Authentication state is read via `useQuery` against `/api/user`; unauthenticated users are redirected to `/login`. Multiple layout shells (`Layout`, `TechnicianLayout`, `CustomerPortalLayout`) wrap sub-sections of the route tree.

---

## `server/` — Express API Server

```
server/
├── index.ts                 # Entry point: Express app setup, rate limits,
│                            # security headers, Vite integration, port 5000
├── auth.ts                  # Passport.js setup, session configuration
├── routes/
│   ├── index.ts             # Hybrid router: mounts all modular + legacy routes
│   │                        # (see Route Architecture below)
│   │
│   │  --- Modular domain files (extracted from monolith) ---
│   ├── customers.routes.ts  # Customer CRUD + notes
│   ├── vehicles.routes.ts   # Vehicle CRUD, service history, catalogs, VIN
│   ├── jobcards.routes.ts   # Job card lifecycle, tasks, parts, tracking
│   ├── technicians.routes.ts# Technician profiles, time-clock
│   ├── inventory.routes.ts  # Spare parts and inventory records
│   ├── invoices.routes.ts   # Invoices, payments, refunds, tax calc
│   ├── scheduling.routes.ts # Appointments, availability, time slots
│   ├── settings.routes.ts   # Application settings (skeleton)
│   ├── fleet.routes.ts      # Fleet (skeleton, pending extraction)
│   ├── reports.routes.ts    # Reports (skeleton, pending extraction)
│   ├── misc.routes.ts       # Misc stubs (not mounted; conflicts with monolith)
│   │
│   │  --- Feature-specific modular route files ---
│   ├── auth.ts              # /api/login, /api/logout, /api/register, /api/user
│   ├── public.ts            # Unauthenticated public endpoints
│   ├── health.ts            # /api/health (no auth, pre-auth mount)
│   ├── dashboard.ts         # Dashboard aggregation
│   ├── predictive-maintenance.ts
│   ├── parts-recommendations.ts
│   ├── reports.ts           # Advanced reports
│   ├── notifications.ts     # Notification center
│   ├── audit.ts             # Audit trail
│   ├── marketing.ts         # Marketing hub
│   ├── crm.ts               # CRM and loyalty
│   ├── hr-payroll.ts        # HR and payroll
│   ├── inventory-management.ts
│   ├── quality-control.ts   # (mounted at /api/qc)
│   ├── warranty.ts
│   ├── kiosk.ts
│   ├── fleet.ts             # Fleet management (legacy)
│   ├── whatsapp.ts
│   ├── sms-campaigns.ts
│   ├── documents.ts
│   ├── currency.ts
│   ├── backup.ts
│   ├── export.ts
│   ├── feature-flags.ts
│   ├── financial.ts
│   └── ...                  # Additional feature routes
│
├── routes.ts                # LEGACY MONOLITH: ~22,000+ line single-file route
│                            # handler for all remaining domains not yet
│                            # extracted. Registered last via registerLegacyRoutes.
│
├── middleware/
│   ├── requireRole.ts       # RBAC middleware (checks user role)
│   ├── requirePlan.ts       # SaaS plan entitlement gate (uses shared/plans.ts)
│   ├── defaultAuth.ts       # isAuthenticated guard
│   ├── validate.ts          # Zod request body validation middleware
│   ├── cache.ts             # Response caching middleware
│   ├── csrf.ts              # CSRF protection
│   └── requestId.ts         # Per-request UUID injection
│
├── services/                # Business logic services
│   ├── aiChatbot.ts         # OpenAI chatbot integration
│   ├── predictive-maintenance.ts
│   ├── parts-recommender.ts
│   ├── scheduling-optimizer.ts
│   ├── saudi-compliance.ts  # Saudi-specific business rules
│   ├── zatca-phase2.ts      # ZATCA e-invoice generation
│   ├── audit-trail.ts       # Audit event recording
│   ├── notification-center.ts
│   ├── emailService.ts
│   ├── twilioClient.ts
│   └── smsService.ts
│
├── engine/                  # Workflow engine (state machines, event bus)
│   ├── index.ts             # Engine bootstrap
│   ├── workflow-engine.ts   # Orchestrator
│   ├── state-machines.ts    # Job card and appointment state machines
│   ├── event-bus.ts         # Internal event pub/sub
│   ├── triggers.ts          # Cross-module trigger handlers
│   └── scheduled-checks.ts  # Time-based checks (reminders, alerts)
│
├── ai/                      # AI integration modules
├── integrations/            # Third-party integration adapters
├── schemas/                 # Server-side Zod schemas (request validation)
├── utils/                   # Server utility functions
├── db.ts                    # Drizzle ORM client (Neon PostgreSQL)
├── storage.ts               # Data access layer (repository pattern)
├── websocket.ts             # WebSocket server (chat, notifications, bay tracking)
├── rbac-config.ts           # RBAC role/permission definitions
├── rbac-middleware.ts       # Fine-grained permission checks
├── logger.ts                # Structured logger
├── config.ts                # Environment variable validation (fails fast)
└── vite.ts                  # Vite dev-server integration (dev only)
```

### Route Architecture — Hybrid Registration

`server/routes/index.ts` implements a hybrid registration strategy:

1. **Pre-auth routes** (health, public) — mounted before Passport session setup
2. **Auth middleware** — `setupAuth(app)` initializes Passport sessions
3. **Modular routes** — feature and domain route files mounted at `/api`
4. **Legacy monolith** — `server/routes.ts` registered last via `registerLegacyRoutes()`

This ordering ensures modular handlers shadow the legacy handler when both cover the same path, allowing incremental extraction without breaking API compatibility.

**Refactoring trajectory**: The project is actively migrating routes from `server/routes.ts` into domain-specific `server/routes/*.routes.ts` files. Eight core domains (customers, vehicles, job cards, technicians, inventory, invoices, scheduling, settings) have been extracted. Three domains (fleet, reports, settings) have skeleton files awaiting full extraction. The miscellaneous stubs are intentionally unmounted until DB-backed implementations replace the in-memory placeholders.

---

## `shared/` — Cross-Boundary Code

```
shared/
├── schema.ts           # Single source of truth for all DB table definitions
│                       # (Drizzle ORM, 400+ tables; exported Zod insert/select schemas)
├── vatUtils.ts         # VAT 15% calculation helpers
├── zatcaUtils.ts       # ZATCA QR code and invoice field helpers
├── hijriUtils.ts       # Hijri / Gregorian calendar conversion
├── plans.ts            # SaaS plan definitions (STARTER, PRO, ENTERPRISE)
├── workflows.ts        # Workflow type definitions and transition maps
├── vehicleCatalogs.ts  # Static vehicle make/model/year catalog data
├── schema-guide.ts     # Schema documentation helpers
└── *.test.ts           # Unit tests for shared utilities
```

Both `server/` and `client/src/` import from `shared/` via the `@shared` path alias (configured in `vite.config.ts` and `tsconfig.json`).

---

## `migrations/`

Three SQL migration files managed by drizzle-kit:
- `0001_cultured_apocalypse.sql` — initial schema
- `0002_real_daredevil.sql` — schema additions
- `0003_add_performance_indexes.sql` — index optimization pass

Production schema changes use `npm run db:push` (drizzle-kit push). The migration files serve as a baseline reference.

---

## Key File Locations Quick Reference

| Purpose | Path |
|---------|------|
| Server entry point | `server/index.ts` |
| Client entry point | `client/src/main.tsx` |
| Route registration hub | `server/routes/index.ts` |
| Legacy monolith routes | `server/routes.ts` |
| Database schema | `shared/schema.ts` |
| Auth setup | `server/auth.ts` |
| RBAC config | `server/rbac-config.ts` |
| WebSocket server | `server/websocket.ts` |
| Data access layer | `server/storage.ts` |
| Workflow engine | `server/engine/index.ts` |
| ZATCA compliance | `shared/zatcaUtils.ts`, `server/services/zatca-phase2.ts` |
| VAT utilities | `shared/vatUtils.ts` |
| Hijri calendar | `shared/hijriUtils.ts` |
| i18n locales | `client/src/i18n/locales/` (en, ar, fr, es, de, zh, hi) |
| Vite config | `vite.config.ts` |
| Docker build | `Dockerfile` |
| Railway deploy | `railway.json` |
| Render deploy | `render.yaml` |
