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

## Known follow-ups (deliberately deferred)

- **Stripe Checkout** — `change-plan` currently does an in-DB upgrade because Stripe Checkout session creation isn't wired yet (`stripeReady` flag in the response signals when env is set). One follow-up PR.
- **Forecasting demand 500 on empty parts inventory** — flagged with a `TODO(real bug)` in `completed-pages-authed.test.ts`; fix in `getPartsForecastSnapshot`. Small follow-up.
- **Vite HMR "Failed to parse JSON file" noise** — cosmetic, from the runtime-error overlay plugin trying to load a missing source-map JSON. Doesn't affect functionality.
