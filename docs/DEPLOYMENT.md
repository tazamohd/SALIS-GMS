# Deployment & Release Runbook

Operational guide for deploying SALIS-GMS to production. The app is a single
Node process that serves both the API and the built SPA.

## 1. Prerequisites

- Node 20+ and npm 10+
- PostgreSQL 16 (Neon or self-managed; the driver auto-detects Neon via `neon.tech` in the URL)
- A reverse proxy terminating HTTPS in front of the app (nginx / Caddy / a managed LB)

## 2. Environment

Validated at boot by `server/config.ts` — the process **exits non-zero** if a
required variable is missing, and (in production) if a hard security check fails.

**Required**

| Var | Notes |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | **≥ 32 random chars.** A short or well-known value is fatal in production. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |

**Production hardening (checked at boot)**

| Var | Expectation in production |
|---|---|
| `NODE_ENV` | `production` |
| `SESSION_COOKIE_SECURE` | `true` (Secure cookies over HTTPS) — warned if not |
| `AUTH_BYPASS` | must be **unset/false** — enabling it in production is a fatal error |
| `PORT` | defaults to `5000` |
| `APP_URL` | public base URL for generated links |

**Optional integrations** (features degrade to mock/503 if unset; surfaced at boot):
`STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, `TWILIO_*`, `GETRESPONSE_API_KEY`, `TECDOC_*`,
`ZATCA_*`, and payment gateways `MOYASAR_SECRET_KEY` / `HYPERPAY_*` / `TAP_SECRET_KEY` /
`TABBY_*` / `TAMARA_API_TOKEN` / `PAYPAL_*`. Manual (cash) payment is always available.

Never commit secrets. Inject via the platform's secret manager / CI secrets.

## 3. Build & release

```bash
npm ci                 # reproducible install
npm run typecheck      # tsc, 0 errors
npm run build          # vite build + esbuild bundle → dist/
npm run db:migrate     # apply pending migrations (idempotent; safe to re-run)
npm run start          # NODE_ENV=production node dist/index.js
```

Migrations are journalled under `migrations/` and applied in order by
`server/scripts/migrate.ts`. `npm run db:check-drift` fails if `shared/schema.ts`
has drifted from the committed snapshots — keep it green.

> Do **not** run `npm run db:push` against production — it is a dev-only schema
> sync that can drop objects. Use `db:migrate`.

## 4. Health probes

Wire these into the load balancer / orchestrator:

| Path | Purpose |
|---|---|
| `GET /api/health/live` | Liveness — process is up (no dependency checks) |
| `GET /api/health/ready` (alias `GET /api/ready`) | Readiness — dependencies (DB) reachable; gate traffic on this |
| `GET /api/health` | Combined health summary |

## 5. Blue/green & rollback

- **Blue/green:** bring up the new version, wait for `/api/health/ready` to pass,
  then shift traffic at the proxy. Keep the previous version warm until the new
  one is confirmed healthy.
- **App rollback:** shift traffic back to the previous release (previous
  `dist/` / container image). The app is stateless apart from Postgres + the
  session store.
- **DB rollback:** migrations are additive and reviewed per PR. If a specific
  migration must be reversed, apply the inverse DDL as a new forward migration
  (do not hand-edit applied history). Take a database snapshot/backup **before**
  applying migrations so a point-in-time restore is available.

## 6. Backups

- Enable automated Postgres backups / PITR at the database provider.
- Verify restores periodically against a throwaway database.

## 7. Release checklist

- [ ] CI green on the merge commit (typecheck · test + coverage gate · build · migrations apply + idempotency · drift · CVE audit)
- [ ] `SESSION_SECRET` set to a ≥32-char random value in the target environment
- [ ] `NODE_ENV=production`, `SESSION_COOKIE_SECURE=true`, `AUTH_BYPASS` unset
- [ ] Database backup / snapshot taken immediately before `db:migrate`
- [ ] `npm run db:migrate` applied; `npm run db:check-drift` green
- [ ] `/api/health/ready` passing on the new instances before traffic shift
- [ ] Previous release kept warm for fast rollback
- [ ] Smoke test: log in, load the dashboard, create+read one record
