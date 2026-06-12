# SALIS-GMS — Module Descriptions and Responsibilities

## Server Modules

### `server/routes/index.ts` — Hybrid Router
Registers all route handlers onto the Express app in order. Serves as the single authoritative mount point. Handles static file serving, bot SSR, pre-auth routes, auth setup, all modular route imports, and finally the legacy monolith registration. See `codemaps/overview.md` for mount order rationale.

### `server/routes.ts` — Legacy Monolith
The original single-file route handler covering all domains not yet extracted. Approximately 22,000+ lines. It calls `setupAuth` itself but skips re-initialization when the flag `markAuthInitialized()` has been called. Actively being decomposed into domain route files. Do not add new routes here; use or create a domain-specific file instead.

### `server/routes/*.routes.ts` — Extracted Domain Routes
Each file owns one business domain:

| File | Domain | Endpoints |
|------|--------|-----------|
| `customers.routes.ts` | Customer CRUD, notes | 10 |
| `vehicles.routes.ts` | Vehicle CRUD, service history, catalogs, VIN decode | 24 |
| `jobcards.routes.ts` | Job card lifecycle, tasks, parts, ETA, tracking events | 16 |
| `technicians.routes.ts` | Technician profiles, time-clock | 9 |
| `inventory.routes.ts` | Spare parts, inventory records | 12 |
| `invoices.routes.ts` | Invoices, payments, refunds, tax calculation | 10 |
| `scheduling.routes.ts` | Appointments, availability, calendar, time slots | 13 |
| `settings.routes.ts` | Application settings (skeleton) | 1 |
| `fleet.routes.ts` | Fleet (skeleton) | — |
| `reports.routes.ts` | Reports (skeleton) | — |

Public interfaces: each file exports a named Router constant (`customerRoutes`, `vehicleRoutes`, etc.) consumed only by `server/routes/index.ts`.

### `server/routes/auth.ts` — Authentication Routes
Handles `/api/login`, `/api/logout`, `/api/register`, `/api/user`, `/api/change-password`. Delegates to Passport.js local strategy configured in `server/auth.ts`.

### `server/auth.ts` — Authentication Setup
Configures Passport.js: local strategy using bcrypt password comparison, session serialization/deserialization, and `connect-pg-simple` session store backed by PostgreSQL. Called once on startup via `setupAuth(app)`.

### `server/storage.ts` — Data Access Layer
Central repository module. All database queries (Drizzle ORM) are written here. Route handlers and services call exported async functions (`getCustomers`, `createJobCard`, etc.) rather than constructing queries inline. Encapsulates all Drizzle table references and join logic.

### `server/db.ts` — Database Client
Exports a single Drizzle ORM instance connected to PostgreSQL via the Neon serverless driver. All other server modules import `db` from here.

### `server/websocket.ts` — WebSocket Server
Attaches a `ws.Server` to the HTTP server. Manages connected client registry, broadcasts typed events (chat messages, notifications, bay status), and handles client authentication via session cookie validation on upgrade.

### `server/engine/` — Workflow Engine
Implements domain-agnostic state machine execution and an internal event bus.
- `workflow-engine.ts`: coordinates state machine instances and event routing
- `state-machines.ts`: defines job card and appointment state transition maps
- `event-bus.ts`: pub/sub for cross-module events (e.g., job card closed triggers invoice draft)
- `triggers.ts`: maps event types to handler functions
- `scheduled-checks.ts`: timer-driven checks for service reminders, overdue jobs

### `server/middleware/` — Middleware Modules

| File | Responsibility |
|------|----------------|
| `defaultAuth.ts` | `isAuthenticated` guard — rejects unauthenticated requests with 401 |
| `requireRole.ts` | Role-based authorization — checks `req.user.role` against allowed roles |
| `requirePlan.ts` | SaaS plan entitlement gate — rejects requests below the minimum plan tier (uses `shared/plans.ts`) |
| `validate.ts` | Zod schema validation middleware factory for request bodies |
| `cache.ts` | Response caching for expensive read endpoints |
| `csrf.ts` | CSRF token validation for state-mutating requests |
| `requestId.ts` | Attaches a UUID to every request for log correlation |

### `server/services/` — Business Logic Services
Stateless service modules called by route handlers for complex operations:

| File | Responsibility |
|------|----------------|
| `aiChatbot.ts` | OpenAI integration for service advisor chatbot |
| `assignmentAI.ts` | AI-driven technician assignment recommendations |
| `predictive-maintenance.ts` | Maintenance prediction models |
| `parts-recommender.ts` | AI-driven parts suggestions |
| `scheduling-optimizer.ts` | Appointment slot optimization |
| `saudi-compliance.ts` | Saudi regulatory business rules |
| `zatca-phase2.ts` | ZATCA Phase 2 e-invoice generation |
| `audit-trail.ts` | Audit event persistence |
| `notification-center.ts` | Multi-channel notification dispatch |
| `emailService.ts` | GetResponse API email integration (api.getresponse.com/v3, GETRESPONSE_API_KEY) |
| `twilioClient.ts` | Twilio SMS client |

Gmail integration (Google Gmail API via `googleapis`) lives in `server/integrations/gmail.ts`, not in `emailService.ts`.

### `server/rbac-config.ts` + `server/rbac-middleware.ts` — RBAC
`rbac-config.ts` declares role hierarchy and permission sets (e.g., `GARAGE_MANAGER`, `TECHNICIAN`, `ACCOUNTANT`). `rbac-middleware.ts` provides factory functions returning Express middleware that check specific permissions on the authenticated user.

---

## Shared Modules

### `shared/schema.ts` — Database Schema
Defines all PostgreSQL tables using Drizzle ORM column builders. Also exports Zod insert/select schemas generated by `drizzle-zod`. This is the single source of truth for data shapes across client, server, and migrations. The schema covers 400+ tables spanning all business domains.

### `shared/vatUtils.ts`
Exports functions for VAT 15% calculation, inclusive/exclusive price conversion, and VAT summary aggregation used in invoice generation.

### `shared/zatcaUtils.ts`
Exports helpers for ZATCA QR code payload encoding (TLV format), invoice UUID generation, and invoice field validation per ZATCA specifications.

### `shared/hijriUtils.ts`
Exports Hijri/Gregorian bidirectional date conversion functions used in the UI and compliance reports.

### `shared/plans.ts`
Defines SaaS plan tiers (STARTER, PRO, ENTERPRISE) and their feature entitlements. Used by `server/middleware/requirePlan.ts` to gate features.

### `shared/workflows.ts`
Type definitions and transition maps for workflow states (job card lifecycle, appointment status). Referenced by both the workflow engine and client UI state indicators.

---

## Client Modules

### `client/src/App.tsx` — Route Table
Defines the complete client-side route tree via `wouter`. Wraps authenticated routes in layout shells. Checks session via `/api/user` query; redirects unauthenticated users to `/login`.

### `client/src/lib/queryClient.ts` — TanStack Query Client
Exports the configured `QueryClient` instance. Default stale time and retry policy are set here. All API calls from the client go through `useQuery` / `useMutation` hooks backed by this client.

### `client/src/hooks/useAuth.tsx` — Auth Context
Provides `AuthProvider` and `useAuth` hook. Wraps the `/api/user` query result and exposes `user`, `isLoading`, and `logout` to all child components.

### `client/src/components/ui/` — shadcn/ui Component Library
Auto-generated Radix UI + Tailwind components (button, dialog, select, table, etc.). These are project-local copies, not re-exported from a package. Modifications go here; do not edit node_modules originals.

### `client/src/i18n/` — Internationalization
`config.ts` initializes i18next with browser language detector and registers 7 locale files (en, ar, fr, es, de, zh, hi) as i18next resources, with `fallbackLng: 'en'` backed by `locales/en.json`. All supported languages have dedicated JSON translation files in `locales/`.

### `client/src/pages/` — Page Components
Approximately 202 page components. Each corresponds to one or more routes in `App.tsx`. Pages are co-located with their route, not split into containers/presenters. Data fetching via `useQuery` is done directly within page components or in child components.
