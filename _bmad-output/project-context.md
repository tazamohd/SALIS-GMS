---
project_name: 'SALIS-GMS'
user_name: 'Root'
date: '2026-06-12'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'critical_rules']
existing_patterns_found: 20
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

**Project:** SALIS-GMS ("SALIS AUTO") — an automotive ERP / Garage Management System. Full-stack TypeScript monorepo (React client + Express server + shared schema), PostgreSQL via Drizzle ORM, multi-tenant (garage → branch), Saudi-market compliance (ZATCA e-invoicing, VAT, Zakat, Hijri calendar), 7 UI languages.

---

## Technology Stack & Versions

| Layer | Tech | Version |
|-------|------|---------|
| Language | TypeScript | 5.6.3 (strict mode) |
| Runtime | Node.js | 20 (Alpine in Docker) |
| Frontend | React | 18.3.1 |
| Client router | wouter | 3.3.5 |
| Server state | @tanstack/react-query | 5.60.5 |
| Build (client) | Vite | 5.4.15 |
| Build (server) | esbuild | 0.25.0 |
| Backend | Express.js | 4.21.2 |
| Database | PostgreSQL | 16 (Neon serverless `@neondatabase/serverless` 0.10.4 or local) |
| ORM | Drizzle ORM / drizzle-kit | 0.39.1 / 0.30.4 |
| Validation | Zod | 3.24.2 |
| Auth | Passport (local) + bcrypt | 0.7.0 / 6.0.0 |
| Sessions | express-session + connect-pg-simple | 1.18.1 / 10.0.0 |
| Realtime | ws | 8.18.0 |
| UI | shadcn/ui + Radix UI | — |
| CSS | Tailwind CSS | 3.4.17 |
| Forms | react-hook-form + @hookform/resolvers | 7.55.0 / 3.10.0 |
| i18n | react-i18next / i18next | 16.1.0 / 25.6.0 |
| Unit tests | Vitest | 4.0.15 |
| E2E tests | Playwright | (in `e2e/`) |

**Optional integrations (guarded by env vars):** Stripe 19.1.0, PayPal SDK 1.1.0, Twilio 5.10.3, OpenAI 6.3.0, googleapis 163.0.0, speakeasy 2.0.0 (2FA), @zxing/library 0.21.3 (barcode), qrcode 1.5.4.

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **`strict: true`** is enabled in `tsconfig.json`. No `any`, `as any`, or `// @ts-ignore` without strong justification — `npm run check` (tsc) is a build blocker.
- **Use path aliases, never deep relative imports.** `@/*` → `client/src/*`, `@shared/*` → `shared/*`, `@assets/*` → `attached_assets/*` (defined in both `tsconfig.json` and `vite.config.ts`). Example: `import { User } from "@shared/schema"` — NOT `../../../shared/schema`. Relative cross-package imports break the ESM/esbuild build.
- Target ES2022, module ESNext, `allowImportingTsExtensions: true`. `noEmit: true` — TypeScript only type-checks; esbuild does the actual transpile.
- **`server/storage.ts` carries `// @ts-nocheck`.** It is the bridging layer between ORM and routes; type safety there is enforced at runtime via Zod, not the compiler. Don't assume its types are checked.

### Framework-Specific Rules

- **Client routing is `wouter`, not react-router.** Use wouter's `<Route>`, `<Link>`, `useLocation`. Don't pull in react-router.
- **Server state goes through React Query (`@tanstack/react-query` v5).** Auth state lives in a React Context (`AuthProvider` / `useAuth`). Don't add a separate global store (Redux/Zustand) for server data.
- **Forms = react-hook-form + Zod resolver.** Client validation schemas mirror the server-side Zod schemas derived from the Drizzle schema.
- **Express routing is hybrid (modular + legacy).** `server/routes/index.ts` mounts the newer domain route files (`*.routes.ts`: technicians, jobcards, customers, vehicles, inventory, invoices, scheduling, misc, fleet, reports, settings) FIRST, then falls back to the legacy monolith `server/routes.ts` (~22k lines, ~760 endpoints). When adding/editing an endpoint: prefer the modular domain file; if the same path exists in both, the modular route wins. Check both before changing behavior.
- All server routes are `async/await`; rely on the centralized error middleware in `server/index.ts` (returns JSON `{message, status}`).
- **`ErrorBoundary` only catches render errors**, not async ones. Handle API/promise errors via try/catch or React Query error states.

### Testing Rules

- Unit tests run on **Vitest** (`*.test.ts` / `*.spec.ts`) co-located with source: `shared/*.test.ts`, `server/__tests__/`, `server/services/__tests__/`, `client/src/**`. E2E tests are **Playwright** in `e2e/` (excluded from Vitest).
- Vitest uses a **single fork** (order-sensitive) with per-glob environments: `node` for `server/` & `shared/`, `jsdom` for `client/`. Global DB setup is `server/__tests__/globalSetup.ts`.
- Commands: `npm run test` (all once), `test:watch`, `test:server`, `test:integration`, `test:coverage`.
- Playwright config has `reuseExistingServer: true` against `http://localhost:5000` — ensure only ONE `npm run dev` is running or E2E gets flaky.
- Seeded test credentials exist (e.g. `admin@salisauto.com` / `admin123`). Use seeded users; don't hardcode new ones.

### Code Quality & Style Rules

- **Prettier** governs formatting: semicolons on, single quotes, trailing commas `all`, print width 100, tab width 2. Run `npm run format`.
- There is an `npm run lint` script (`eslint .`), but **no ESLint config file exists at the repo root** — so `lint` will use ESLint defaults / may not be configured. Day-to-day quality is enforced by TS strict mode + Prettier; don't assume a custom lint ruleset.
- File naming: components `PascalCase.tsx`; utils/services `camelCase.ts`; route files `kebab-case.routes.ts`; shared schema `schema.ts`. Functional React components only (no class components).
- Layering: business logic → `server/services/`; cross-cutting concerns → `server/middleware/`; shared domain types/schemas → `shared/`.

### Development Workflow Rules

- **`server/config.ts` validates env at startup and fail-fast `process.exit(1)`** if `DATABASE_URL` or `SESSION_SECRET` are missing. Always set `.env` before running anything.
- DB workflow: `npm run db:push` (drizzle-kit push — applies schema to `DATABASE_URL`), `db:seed` seeds data, `db:verify` checks schema. **`db:push` syncs the schema directly; migration SQL is forward-only** — no rollback command; reverse manually. Review schema changes carefully before push.
- Dev: `npm run dev` (tsx watches `server/index.ts`, Vite HMR integrated, all on **port 5000**). Build: `npm run build` (Vite → `dist/public`, esbuild → `dist/index.js`). Prod: `npm start`. `dist/` is gitignored — CI/deploy must build.
- Deploy targets: Docker (`node:20-alpine`, `docker-compose.yml` with `postgres:16-alpine`), Render (`render.yaml`), Replit (`.replit`).
- Branch for this work: `claude/vigilant-hamilton-nuyvvs`.

### Critical Don't-Miss Rules

1. **`AUTH_BYPASS=true` disables authentication** (Replit dev convenience). MUST be false/unset in production — the code does not otherwise prevent unauthenticated access.
2. **Multi-tenant isolation is NOT enforced in dev.** Without `garageId`, some queries (e.g. HR/staff) return ALL records. Production code must filter by `user.garageId`. Treat tenant scoping as a security requirement on every new query.
3. **Do NOT drop the `sessions` table.** It's the Passport/express-session store (auto-created via `createTableIfMissing`). Dropping it logs everyone out / breaks auth.
4. **OpenAI key aliasing:** `config.ts` maps `AI_INTEGRATIONS_OPENAI_API_KEY` → `OPENAI_API_KEY`. Respect this fallback when touching AI config.
5. **i18n keys must be added to ALL 7 locale files** (`client/src/i18n/locales/{en,ar,fr,es,de,zh,hi}.json`) simultaneously. Missing key → falls back to the raw key path. `en.json` is the source of truth (~2545 keys). Arabic (`ar`) is RTL — verify layout.
6. **Saudi compliance tables must be seeded** (ZATCA/VAT/Zakat configs) or QR generation & tax calc fail silently. Use `shared/zatcaUtils.ts`, `shared/vatUtils.ts`, `shared/hijriUtils.ts`, `server/services/saudi-compliance.ts` — don't reinvent VAT (15%) or ZATCA QR logic.
7. **Rate limiting is global per-IP** (200 req/15min API, 10 req/15min auth). `trust proxy` is set. High-frequency clients can be throttled — design batch endpoints accordingly.
8. **WebSocket (`/ws/chat`) auth piggybacks on the express session.** Session expiry drops the socket; clients must reconnect after re-auth.
9. **Dark/monochrome design is enforced** (SALIS palette: black/gray/white). Avoid introducing white backgrounds or off-palette colors.
10. **Feature flags are garage-scoped** (`featureFlags` table). Check the flag before rendering experimental features; unset defaults to disabled.

---

_Generated by BMAD Method `generate-project-context` workflow (executed autonomously)._
