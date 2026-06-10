# Big sweep: orphan cleanup → half-real page completion → role + plan gating → premium landing → SPA bootstrap fix

This branch closes a long arc of work that started as "clean up the orphan pages" and ended as "ship the full subscription tier system, role gating, and a premium marketing landing." Each phase landed as its own commit so the history is bisectable; this PR rolls them up for review.

## Highlights

| Phase | What landed |
|---|---|
| **1 — Orphan cleanup** | Audited 268 page files vs 196 imported in `App.tsx`. Wired 5 real, deleted 27 stubs/duplicates. Single cleanup commit. |
| **2 — Half-real page completion** | Recovered 8 deleted "half-real" pages; built 8 new modular Express routers with DB-backed (statistical) logic; rewired pages to consume real responses. Added `mobile_devices` table + composite perf indexes. |
| **3 — Post-review follow-ups** | Composite indexes on `jobCards`/`invoices`/`mobile_devices`; timezone fix in demand/forecast aggregators; idempotent smart-contracts status timestamps; OBD page hardening (`safeJson`, severity text labels, aria); ProductivityTracker empty-check comment; `enabled: !!user?.id` consistency. |
| **4 — Open-item cleanup** | Ran `mobile_devices` migration; added OBD ingestion endpoint (`POST /api/diagnostics/obd/:vehicleId`); consolidated smart-contracts surfaces (removed `/api/nextgen/smart-contracts`); documented `AI_INTEGRATIONS_OPENAI_API_KEY`; merged 326 Arabic translations across 12 namespaces; stripped `// @ts-nocheck` from all 8 new route files with proper local types; added `completed-pages-authed.test.ts`. |
| **5 — Landing redesign** | `public/index.html` rewritten as a modern SaaS landing: animated gradient mesh, glass-morphism cards, animated dashboard preview with live KPI tickers, infinite-scroll integrations marquee, "How it works" steps, three phone mockups, testimonials, big CTA banner. `client/src/pages/Landing.tsx` (SPA auth gate) brought to the same brand language. |
| **6 — Role infra** | Tracked `RoleGate`, `RoleBadge`, `usePermissions`, `useCrudMutation`, `useTheme` (previously untracked but referenced by HEAD). |
| **7 — Subscription tier system** | `shared/plans.ts` as single source of truth (STARTER/PRO/ENTERPRISE + feature matrix + tier hierarchy + Stripe price ids). `subscriptions` table. Six API endpoints (`/api/plans`, `/api/subscriptions/{current,change-plan,cancel,resume,all,:garageId}`). `requirePlan(min)` middleware applied to AI/forecasting/OBD/smart-contracts routes. Client `usePlan()` + `<PlanGate>` + `ProtectedRoute` extended with `plan` prop. New `/subscriptions` page with comparison table + change flow. Plan pill in header. Billing tab in PlatformAdmin (list every garage's plan + override). Migration script: `scripts/create-subscriptions.mjs`. |
| **8 — SPA bootstrap fix** | `shared/plans.ts` was using a literal `process.env.STRIPE_PRICE_PRO` at top level — Vite ships that file to the browser through the `Subscriptions → usePlan → shared/plans` import chain, so `ReferenceError: process is not defined` crashed the entire module graph and `#root` stayed empty. Guarded with a `typeof process` check (`envOrNull(key)`). Also fixed missing `useQueryClient` import in `PlatformAdmin.tsx` (would have crashed when the billing tab opened). |
| **9 — Test infra (Motaz)** | `TEST_DATABASE_URL` escape hatch so the suite runs on Windows; 10 legacy `fetch('http://localhost:5000')` tests converted to supertest; `.github/workflows/test.yml` with a Postgres 16 service container; `globalSetup.ts` seeds an ENTERPRISE/active subscription on the test garage so `requirePlan()` works in tests. **0 → 227/227 passing on Windows.** |
| **10 — Security review sweep** | High-recall code review at extra-high effort surfaced 15 candidates; 12 confirmed and applied: SQL injection in `hr-payroll` (already addressed in earlier commit), unauthenticated `backup`/`export`/`quality-control`/`estimates` endpoints, jobcards mass-assignment, cache PII leak (`${userId}:${garageId}:url` key), 2FA lockout wired, AR aging filter includes `partially_paid`, CSRF compare uses `crypto.timingSafeEqual`, `event-bus.emit()` awaits `Promise.allSettled`, `retry()` off-by-one, `defaultAuth` missing `return`, `scheduled-checks` runs every 15 min from engine init. Pre-existing schema bugs (7 `varchar("garage_id")` → `uuid`, two partial-index `NOW()` predicates) fixed inline so `npm run db:push` works on a fresh DB. |
| **11 — Boot diagnostics** | `server/config.ts` now lists which optional integrations are disabled (Stripe/OpenAI/Twilio/GetResponse/TecDoc/ZATCA) on startup so the operator knows what will return mock data before the first failed request. Skipped under `NODE_ENV=test`. |
| **12 — Test-app uses production router** | `server/__tests__/setup.ts` was reimplementing session + passport + a partial `registerLegacyRoutes` mount, drifting from prod. Now calls the production `registerRoutes` so tests hit the same route surface the dev server does. |
| **13 — Hybrid-router shadow fix** | Audit found 36 paths registered in BOTH the modular routers and the legacy monolith. Because modular mounts first, in-memory stubs in `./estimates`, `./misc.routes`, `./supplier-portal` were *shadowing* the monolith's DB-backed handlers. Those three stubs are now unmounted (with explanatory comments) so the monolith serves `/api/estimates`, `/api/suppliers`, `/api/search`, `/api/tools`, `/api/service-templates`, `/api/notifications` correctly. |

## DB migrations

Three idempotent migration scripts ship with this PR (CREATE IF NOT EXISTS). Run in any order before the dev server starts:

```bash
node scripts/create-mobile-devices.mjs
node scripts/create-subscriptions.mjs
node scripts/apply-perf-indexes.mjs
```

(Drizzle Kit `db:push` is interactive in this repo due to unrelated drift — these scripts are the unblock.)

## Verification (local)

- `npx tsc --noEmit -p tsconfig.json` — zero new errors
- Dev server boots, every route module logs `Loaded` (incl. `Subscriptions Routes Loaded`)
- `/dashboard` SPA hydrates; sign-in page renders with demo credentials
- `/api/plans` returns 3 plans + 9 category→plan mappings (200, public)
- All authenticated endpoints return 401 logged out, no 500s
- 227/227 vitest passing (per Motaz's CI workflow)

## Test plan for reviewers

- [ ] Browse `/landing` — hero with pulsing pill, animated dashboard preview, marquee, How-it-works, phone mockups, testimonials all render
- [ ] Sign in → header shows plan pill (defaults to STARTER)
- [ ] Visit `/subscriptions` — three-tier comparison; click `Upgrade to Pro` → pill flips to PRO, AI/HR/marketing modules unlock
- [ ] Try to hit an ENTERPRISE-only feature on PRO — server returns 402 with `upgrade: { required, current }` payload; client shows upgrade panel
- [ ] As `PLATFORM_ADMIN`, visit `/platform-admin/billing` — every garage listed with plan/status; click any tier to override
- [ ] `OBDDiagnosticViewer` shows severity badges with text labels (not color-only), JSON snapshot is wrapped in `safeJson`
- [ ] `ProductivityTracker` and `PerformanceAnalytics` show `RoleGate` "access restricted" panel for TECHNICIAN/ADVISOR
- [ ] All Arabic strings render correctly when locale switched to AR (RTL, 326 new keys merged into `ar.json`)

## Session 3 — Closeout work landed in this PR

This sequence of commits brings the branch to a state where it can ship with no known security gaps and a documented production deploy story.

| Tier | Item | Resolution |
|---|---|---|
| T1 | `requireAuthByDefault` was defined but never mounted → `/api` was default-allow on dozens of routes | Mounted with `app.use()` after `setupAuth`. PUBLIC_ROUTES extended to cover monolith login/register, customer-portal login, /api/plans, and self-service /api/kiosk/*. Currency + fleet integration tests updated to login first. |
| T1 | `.github/workflows/ci.yml` existed on disk but untracked | Now committed; GitHub CI will fire on push. |
| T1 | Vitest had never been run end-to-end in this session | Ran against `slis_gms_test`: **227 / 227 passing** (PR claim was accurate). |
| T2 | Missing CSP header; helmet not installed | `helmet` installed; full CSP + HSTS + X-Frame applied via `server/index.ts`. CSP allows Vite HMR in dev, locks down in prod. |
| T2 | Request-id generated but not in error responses or log lines | Global error handler now reads `req.requestId` and surfaces it in both the JSON body and the `[ERROR] [rid=…]` log line. |
| T2 | `.env.example` missing `REDIS_URL`, Stripe webhook vars | Documented. |
| T2 | DEPLOYMENT.md told operators to use `db:push` in production | Rewritten to use `db:migrate` everywhere; added `db:migrate vs db:push` comparison table, SSL/reverse-proxy nginx snippet, first-admin promotion. |
| T3 | No production migration runner | New `server/scripts/migrate.ts` runs `drizzle-orm/node-postgres/migrator` against `migrations/`. `npm run db:migrate` is the production-safe path. Dockerfile entrypoint runs it pre-start. Journal had drift (referenced a missing 0000 file); regenerated to match actual files + auto-generated drift-catchup migration. Verified end-to-end on fresh DB. |
| T3 | No automated backup story | New `scripts/backup-pg-dump.mjs` streams `pg_dump → gzip`, enforces 30 daily / 12 weekly / 12 monthly retention, optional S3 upload via AWS CLI. Engine schedules it daily at 02:00 UTC behind `BACKUP_ENABLED=true` opt-in. Smoke-tested locally. |
| T3 | Vite dev "Failed to parse JSON file" overlay noise | Replit overlay plugins now gated behind `REPL_ID` env var. Silent on non-Replit dev hosts. |
| T3 | `console.*` calls bypass structured logger | Engine layer (event-bus, triggers, scheduled-checks, workflow-engine, engine/index) migrated to `logger.{info,warn,error}`. ~17 sites moved. The remaining ~1,600 sites in routes/services are deferred — they're mostly per-request error logs that would benefit from a proper ts-morph codemod rather than ad-hoc edits. |

## Still deferred to follow-up PRs

- **Stripe Checkout end-to-end** — `change-plan` still does an in-DB upgrade. The Checkout Session creation + `checkout.session.completed` webhook handler need real Stripe API keys to verify, so this needs a dedicated PR with the test card flow.
- **Console-to-logger sweep across routes/services** — ~1,600 sites in non-engine code. Needs a codemod, not manual edits, to avoid mis-typing the `{ extra }` payload shape.
- **Tailwind RTL logical-property migration** — `left-*`/`right-*`/`ml-*`/`mr-*`/`pl-*`/`pr-*` still scattered across ~200 pages. Switching to `tailwindcss-logical` plugin or `rtlcss` PostCSS transform at build time would auto-flip them; either way it's a build-config change worth its own PR.
- **72 orphan client pages** — files exist under `client/src/pages/` but not mounted in `App.tsx`. Mostly emerging-tech showcase pages. Per-page disposition (wire / delete) requires a product decision per module.
- **Routes/services integration test gap** — 60 of 68 routes lack integration tests, 15 of 18 services likewise. E2E golden path covers the core happy paths; expanding coverage is a multi-day exercise.

## Verification (this PR)

- `npx tsc --noEmit` → 0 errors
- `TEST_DATABASE_URL=… npm test` → **227 / 227 passing** (3 prior fails caused by my auth gate now fixed: 2 by adding `/api/kiosk/*` to PUBLIC_ROUTES, 1 by making the currency + fleet integration tests log in first)
- `npm run db:migrate` on a fresh DB → all 4 migrations applied in <5s
- `node scripts/backup-pg-dump.mjs` → produces `.sql.gz`, prunes per retention policy
- `curl /api/ai/insights` anonymous → **401** (was 200 before the auth gate)
- `curl -I /` → CSP, HSTS, X-Frame all set by `helmet`
