# SALIS-GMS — Entry Points

## Server Entry: `server/index.ts`

The single Node.js entry point for both development and production.

**Startup sequence:**

1. Import `server/config.ts` — validates required environment variables, fails fast on missing secrets
2. Create Express app instance
3. Apply global middleware:
   - `requestId` — UUID per request
   - `express.json({ limit: '10mb' })` and `urlencoded`
   - Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.)
   - Global API rate limiter (200 req / 15 min window on `/api/*`)
   - Strict auth rate limiter (10 req / 15 min on `/api/login` and `/api/register`)
   - Request logging middleware (logs `METHOD path status duration` to stdout)
4. Call `registerRoutes(app)` from `server/routes/index.ts` — mounts all API routes, sets up auth
5. Call `initializeChatWebSocket(server)` — attaches WebSocket server to HTTP server
6. Call `initializeEngine()` — boots workflow engine, state machines, event bus, scheduled checks
7. Register global error handler middleware
8. In development: call `setupVite(app, server)` — integrates Vite dev server with HMR
9. In production: call `serveStatic(app)` — serves `dist/public/` as static files
10. Listen on `0.0.0.0:5000`

**Development run**: `npm run dev` → `tsx server/index.ts` with `NODE_ENV=development`. Vite HMR proxy is attached in this mode.

**Production run**: `npm run start` → `node dist/index.js`. The server binary is produced by `esbuild` from `server/index.ts` with `--bundle --packages=external --format=esm`.

---

## Client Entry: `client/src/main.tsx`

The React application bootstrap file.

**Initialization sequence:**

1. Import `App.tsx` (route tree)
2. Import `ErrorBoundary` (global React error boundary)
3. Import `index.css` (Tailwind base + globals)
4. Import `i18n/config` (i18next initialization — must run before render)
5. `createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>)`
6. In production (`import.meta.env.PROD`): call `registerServiceWorker()` and `setupPWAInstallPrompt()`

The `#root` div is in `client/index.html`, which Vite uses as the template for both dev and production builds.

---

## Route Registration: `server/routes/index.ts`

The `registerRoutes(app)` function is the API layer's single assembly point. It returns an `http.Server` instance (created internally by `registerLegacyRoutes`).

**Mount order** (matters for path shadowing):

```
/public/*                    Static assets (landing page)
/landing                     Bot SSR endpoint
/                            Bot/crawler SSR middleware
/api (health only)           Health check — no auth
setupAuth(app)               Passport + session middleware
/api (auth routes)           Login, logout, register, user
/api (feature modules)       predictive-maintenance, parts-recommendations,
                             reports, notification-center, audit, marketing,
                             crm, hr-payroll, inventory-management, dashboard,
                             /api/qc (quality-control), warranty, kiosk,
                             fleet-management, whatsapp, sms-campaigns,
                             documents, currency, api-docs, backup, export,
                             feature-flags
/api (core domain modules)   customers, scheduling, inventory, technicians,
                             vehicles, job-cards, invoices, settings
/api (specialty modules)     mobile-devices, smart-contracts, ai-repair-guide,
                             ai-predictions, analytics-performance,
                             forecasting-demand, productivity, obd-diagnostics,
                             subscriptions
Legacy monolith              server/routes.ts (all remaining domains)
```

Modular handlers are mounted before the legacy monolith. When both define an identical path, Express matches the first-mounted handler — enabling shadow-based extraction with no API breakage.

---

## NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `NODE_ENV=development tsx server/index.ts` | Start dev server with Vite HMR |
| `build` | `vite build && esbuild server/index.ts ...` | Build client + server for production |
| `start` | `NODE_ENV=production node dist/index.js` | Run production build |
| `check` | `tsc` | TypeScript type check (no emit) |
| `db:push` | `drizzle-kit push` | Push schema changes to database |
| `db:seed` | `tsx server/seed.ts` | Seed database with sample data |
| `db:verify` | `tsx scripts/verify-db.ts` | Verify database connectivity and schema |
| `test` | `vitest run` | Run all Vitest tests |
| `test:watch` | `vitest` | Run tests in watch mode |
| `test:server` | `vitest run server/__tests__` | Server unit tests only |
| `test:integration` | `vitest run server/routes/__tests__` | Route integration tests |
| `test:coverage` | `vitest run --coverage` | Tests with v8 coverage report |
| `lint` | `eslint .` | Lint entire codebase |
| `format` | `prettier --write "**/*.{ts,tsx,js,json,css}"` | Auto-format code |

---

## API Route Registration Pattern (Modular Files)

Each extracted domain route file follows this pattern:

```typescript
// server/routes/customers.routes.ts
import { Router } from "express";
import { isAuthenticated } from "../middleware/defaultAuth";
import { storage } from "../storage";

const router = Router();

router.get("/customers", isAuthenticated, async (req, res) => { ... });
router.post("/customers", isAuthenticated, async (req, res) => { ... });
// ...

export { router as customerRoutes };
```

Mounted in `server/routes/index.ts`:
```typescript
import { customerRoutes } from "./customers.routes";
app.use("/api", customerRoutes);
```

All routes use `async/await` with try/catch error propagation to the Express global error handler. All routes require `isAuthenticated` unless explicitly noted as public.
