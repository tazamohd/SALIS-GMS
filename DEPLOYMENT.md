# SLIS-GMS Deployment Guide

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 9+
- **PostgreSQL** 15+ (local, Docker, or managed like Neon/Supabase)

---

## 1. Local Development

```bash
# Clone and install
git clone <repo-url> && cd SLIS-GMS
npm install

# Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL and SESSION_SECRET at minimum

# Push schema to database
npm run db:push

# Seed initial data (roles, feature flags, admin user, sample data)
npm run db:seed

# Start dev server (hot reload)
npm run dev
# App runs at http://localhost:5000
```

### Embedded Postgres (no install needed)

If you don't have PostgreSQL installed, the project includes `embedded-postgres` as a dev dependency:

```bash
# Start embedded Postgres (creates ./pg-data, runs on port 5432)
node -e "
const { default: EP } = await import('embedded-postgres');
const pg = new EP({ databaseDir: './pg-data', user: 'postgres', password: 'postgres', port: 5432, persistent: true });
await pg.initialise();
await pg.start();
await pg.createDatabase('slis_gms');
console.log('Postgres running on port 5432');
"

# Then push schema, seed, and start dev server as above
npm run db:migrate   # production-safe; replays versioned files in migrations/
npm run db:seed
npm run dev
```

> **Note**: Embedded Postgres must be started before `npm run dev`. It persists data in `./pg-data/`.

### Default Credentials

After seeding:
- **Admin**: `admin@slis.sa` / `admin123`
- **Technician**: `tech@salisauto.com` / `tech123`

---

## 2. Docker

### Single container (requires external PostgreSQL)

```bash
docker build -t slis-gms .
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/slis_gms" \
  -e SESSION_SECRET="your-random-64-char-string" \
  -e NODE_ENV=production \
  slis-gms
```

### Docker Compose (app + PostgreSQL)

```bash
# Copy .env.example to .env and configure
cp .env.example .env

docker-compose up -d
# App: http://localhost:5000
# PostgreSQL: localhost:5432 (postgres/postgres)
```

The compose file includes a PostgreSQL 16 container with a health check. The app container waits for the database to be ready before starting.

After first start, push the schema and seed:

```bash
docker-compose exec app node -e "/* or run db:push from host against localhost:5432 */"
# Or from host with DATABASE_URL pointing to localhost:5432:
npm run db:migrate   # production-safe; replays versioned files in migrations/
npm run db:seed
```

---

## 3. Render

The repo includes `render.yaml` for Blueprint deploys.

### Steps

1. Push code to GitHub/GitLab
2. In Render dashboard: **New > Blueprint** and connect the repo
3. Render reads `render.yaml` and provisions:
   - A **web service** (`slis-gms`) with `npm ci && npm run build` / `node dist/index.js`
   - A **PostgreSQL database** (`slis-gms-db`, free plan)
4. Add these environment variables in the Render dashboard:
   - `SESSION_SECRET` -- required, generate a random 64-char string
   - `APP_URL` -- your Render service URL (e.g. `https://slis-gms.onrender.com`)
   - Any optional keys (see Environment Variables section below)

`DATABASE_URL` and `NODE_ENV=production` are set automatically by the blueprint.

### Post-deploy

Use Render's Shell tab to run:

```bash
npm run db:migrate   # production-safe; replays versioned files in migrations/
npm run db:seed
```

---

## 4. Railway

The repo includes `railway.json` with Nixpacks builder config and a `/api/health` healthcheck.

### Steps

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Set environment variables
railway variables set SESSION_SECRET="your-random-64-char-string"
railway variables set APP_URL="https://your-app.up.railway.app"
# DATABASE_URL is auto-injected by the PostgreSQL plugin

# Deploy
railway up
```

Railway will build with Nixpacks and run `npm run build && node dist/index.js` (from `railway.json`).

### Post-deploy

```bash
railway run npm run db:push
railway run npm run db:seed
```

---

## 5. Neon (Staging / Production Database)

The project is designed for [Neon](https://neon.tech) serverless PostgreSQL. The `server/db.ts` auto-detects Neon URLs and uses the serverless WebSocket driver.

### Setup

1. Create a Neon project at [console.neon.tech](https://console.neon.tech)
2. Copy the connection string (starts with `postgresql://...@...neon.tech/...`)
3. Set it as `DATABASE_URL` in your `.env` or hosting provider
4. Push schema and seed:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/slis_gms?sslmode=require" npm run db:push
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/slis_gms?sslmode=require" npm run db:seed
```

### Branching (Staging)

Neon supports database branching for staging environments:

1. In Neon console: **Branches > Create Branch** from `main`
2. Use the branch connection string as `DATABASE_URL` for your staging deployment
3. Schema and data are cloned instantly — no separate seed needed

---

## 6. Vercel

**Not recommended.** Vercel is optimized for serverless/edge functions and does not natively support a long-running Express server. If you must use Vercel:

- Deploy only the Vite frontend to Vercel
- Host the Express API separately (Railway, Render, or a VPS)
- Update the frontend API base URL to point to your API host
- Handle CORS accordingly

---

## 7. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/slis_gms`) |
| `SESSION_SECRET` | Yes | Random string for signing session cookies (64+ chars recommended) |
| `NODE_ENV` | No | `development` or `production` (default: `development`) |
| `PORT` | No | Server port (default: `5000`) |
| `APP_URL` | No | Public URL of the app (used for callbacks, links) |
| `CORS_ORIGIN` | No | Allowed CORS origin in production (default: same-origin) |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features (chatbot, diagnostics) |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | No | Custom OpenAI-compatible API base URL |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | No | API key for the custom AI endpoint |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for payment processing |
| `TWILIO_ACCOUNT_SID` | No | Twilio account SID for SMS/WhatsApp |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | No | Twilio sender phone number (e.g. `+966...`) |
| `GETRESPONSE_API_KEY` | No | GetResponse API key for email marketing |
| `TECDOC_API_URL` | No | TecDoc API URL for auto parts catalog |
| `TECDOC_API_KEY` | No | TecDoc API key |
| `ZATCA_API_URL` | No | ZATCA e-invoicing API URL (Saudi tax compliance) |
| `ZATCA_CSID` | No | ZATCA certificate/security identifier |

Only `DATABASE_URL` and `SESSION_SECRET` are required. All other integrations are optional and features degrade gracefully without them.

---

## 8. Post-Deploy Checklist

### Health checks

```bash
# Basic health (should return {"status":"ok",...})
curl https://your-app.com/api/health

# Readiness probe -- verifies DB connectivity
curl https://your-app.com/api/health/ready
# Returns {"ready":true,"db":"connected"} when healthy

# Liveness probe (for k8s/container orchestrators)
curl https://your-app.com/api/health/live
```

### Database setup

```bash
# Apply versioned migrations from migrations/ (production-safe, forward-only)
npm run db:migrate

# Seed roles, feature flags, admin user, and sample data (15% Saudi VAT)
npm run db:seed

# Verify database tables exist
npm run db:verify
```

### `db:migrate` vs `db:push` — when to use which

| Command | Use case | Idempotent? | Source-of-truth |
|---|---|---|---|
| `npm run db:migrate` | **Production deploys, CI.** Runs the SQL files in `migrations/` in order; records each in `__drizzle_migrations`. | Yes — re-runs skip already-applied files. | `migrations/*.sql` |
| `npm run db:push` | **Local dev only.** Interactively diffs the live DB against `shared/schema.ts` and prompts for destructive changes. | No — interactive. Will block in CI. | `shared/schema.ts` |

In containerised deploys the Dockerfile entrypoint runs `npm run db:migrate && node dist/index.js`, so the migration history is replayed before the server boots. To generate a new migration after editing `shared/schema.ts` locally:

```bash
npx drizzle-kit generate --name=<short_description>
# Review the generated SQL in migrations/, commit it, then `npm run db:migrate`
```

### Promoting the first admin

The seed script creates `admin@slis.sa / admin123` as a SUPERADMIN-equivalent. In production, after running `db:seed`, log in once and change the password. To promote an additional admin without re-seeding:

```bash
psql "$DATABASE_URL" -c "UPDATE users SET role='ADMIN' WHERE email='you@example.com'"
```

Or via the platform admin UI (`/platform-admin/users` once logged in as ADMIN).

### SSL / reverse proxy

The Express server does NOT terminate TLS itself. Front it with one of:

- **Render / Railway**: TLS is handled automatically by the platform load balancer.
- **Self-hosted**: Use nginx, Caddy, or Traefik in front of the container. Example nginx snippet:

  ```nginx
  server {
    listen 443 ssl http2;
    server_name gms.example.com;

    ssl_certificate     /etc/letsencrypt/live/gms.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gms.example.com/privkey.pem;

    location / {
      proxy_pass http://localhost:5000;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Request-ID $request_id;   # surfaces in error responses
    }
  }
  ```

The app's HSTS header (set by `helmet`) only takes effect over HTTPS; serving via plain HTTP in production will leak sessions.

### Verify login

1. Open the app URL in a browser
2. Log in with the admin credentials created by the seed script
3. Confirm the dashboard loads and shows sample data

---

## 9. Monitoring and Troubleshooting

### Health endpoints

| Endpoint | Purpose | Expected |
|----------|---------|----------|
| `GET /api/health` | Basic health + uptime + version | `{"status":"ok"}` |
| `GET /api/health/ready` | DB connectivity check | `{"ready":true,"db":"connected"}` |
| `GET /api/health/live` | Liveness probe | `{"alive":true}` |

### Common issues

| Problem | Cause | Fix |
|---------|-------|-----|
| `503` on `/api/health/ready` | Database unreachable | Check `DATABASE_URL`, ensure PostgreSQL is running, verify network/firewall |
| Session errors / logout loops | Missing or weak `SESSION_SECRET` | Set a strong random 64+ char `SESSION_SECRET` |
| Build fails on `bcrypt` | Native module compilation | Ensure `node-gyp` build tools are installed, or use the Docker build |
| Port conflict | Port 5000 already in use | Set `PORT` env var to a different port |
| Missing tables after deploy | Migrations not applied | Run `npm run db:migrate` against the production database |
| Empty dashboard | No seed data | Run `npm run db:seed` |

### Logs

- **Render**: Dashboard > Service > Logs tab
- **Railway**: `railway logs` or Dashboard > Deployments > Logs
- **Docker**: `docker logs <container-id>` or `docker-compose logs -f app`
- **Local**: stdout in terminal, watch for `Server running on port 5000`

---

## Build Reference

```bash
npm run build    # Vite (frontend) + esbuild (server) -> dist/
npm run start    # Production: node dist/index.js
npm run dev      # Development: tsx with hot reload
npm run check    # TypeScript type checking
npm run test     # Run test suite (vitest)
npm run db:push  # Push Drizzle schema to database
npm run db:seed  # Seed initial data
npm run db:verify # Verify database tables
```
