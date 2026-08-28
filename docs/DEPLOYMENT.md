# Deployment Guide

SALIS GMS can deploy to any Node.js host with PostgreSQL. This doc covers the
supported targets, required environment variables, and the migration strategy.

## Environment Variables

### Required (app crashes without these)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Random 64+ char string for express-session signing |

### App Config (optional, sensible defaults)

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `production` enables security headers, minified errors |
| `PORT` | `5000` | HTTP listen port |
| `APP_URL` | `http://localhost:5000` | Public URL (used in emails, links) |

### Optional Integrations

Each integration degrades gracefully when unconfigured — routes return mock
data or 503. The server logs which integrations are disabled at boot.

| Variable(s) | Feature |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe payments |
| `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` | AI chat, predictions, OCR |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | SMS notifications |
| `GETRESPONSE_API_KEY` | Email marketing campaigns |
| `TECDOC_API_URL`, `TECDOC_API_KEY` | Auto parts catalog |
| `ZATCA_API_URL`, `ZATCA_CSID` | Saudi ZATCA e-invoicing |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | PayPal payments |

## Platform Guides

### Render

Blueprint file: `render.yaml` — includes the web service, Postgres database,
and auto-generated `SESSION_SECRET`.

```bash
# One-click: connect your repo and Render reads render.yaml automatically.
# Manual: set DATABASE_URL (from the Render Postgres addon) and SESSION_SECRET.
```

The `buildCommand` runs `npm ci && npm run build && npx drizzle-kit push --force`
to apply schema changes on every deploy.

### Railway

Config: `railway.json` — Nixpacks builder with health check on `/api/health`.

```bash
# Required env vars (set in Railway dashboard):
DATABASE_URL=<from Railway Postgres plugin>
SESSION_SECRET=<generate: openssl rand -hex 32>
```

Railway auto-detects Node.js. After connecting Postgres, add the env vars above.

### Docker / Docker Compose

```bash
cp .env.example .env          # edit DATABASE_URL and SESSION_SECRET
docker compose up -d           # starts app + Postgres 16
```

The app container runs `npm run build` at image build time and
`node dist/index.js` at runtime. Schema is applied via the app's startup or
manually with `docker compose exec app npx drizzle-kit push --force`.

### Replit

Replit is the primary development target. Environment variables are set in the
Secrets panel. The `.replit` config auto-starts `npm run dev` in development
and `npm run start` in deployment mode.

Required secrets: `DATABASE_URL`, `SESSION_SECRET`.

## Database Migrations

The project uses **Drizzle Kit push** (`npx drizzle-kit push --force`) to apply
schema changes directly from `shared/schema.ts`. This is the current strategy:

- **Pros**: zero migration files, schema.ts is the single source of truth.
- **Cons**: no rollback path, destructive changes (column drops) apply immediately.

For production environments, consider switching to **Drizzle Kit generate**
(`npx drizzle-kit generate`) to produce versioned SQL migration files that can
be reviewed before applying. This is tracked as future work.

### Applying schema changes

```bash
# Development
npx drizzle-kit push

# CI / Production (non-interactive)
npx drizzle-kit push --force
```
