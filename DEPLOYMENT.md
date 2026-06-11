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

## 10. Production VPS Deployment (Docker + Caddy)

Self-hosted production stack for the Saudi market: `docker-compose.prod.yml`
runs Caddy (automatic HTTPS) → app (Express :5000) → PostgreSQL 16 + Redis 7,
plus a one-shot migration service and an optional daily-backup sidecar.
Postgres and Redis are **not** exposed to the host — Caddy is the only public
entrypoint.

> **KSA data residency**: with this stack the database lives in a Docker
> volume on your VPS, so all customer/invoice data stays on the server you
> choose (pick a KSA or GCC region provider if residency matters to you).
> Alternative: point `DATABASE_URL` at Neon instead of the compose `postgres`
> service — simpler ops, but data then resides in Neon's cloud region
> (currently no KSA region), which may not fit your residency requirements.

### 10.1 Provision the VPS

- 2 vCPU / 4 GB RAM / 40 GB SSD is a comfortable baseline.
- Open ports **22, 80, 443** only (cloud firewall or `ufw allow 22,80,443/tcp`).

**DNS for salisauto.com** (registrar/DNS: domain.com nameservers):

| Record | Name | Value | When |
|---|---|---|---|
| A | `salisauto.com` (apex) | VPS IP | **At cutover** — it currently points to `34.111.179.208` (existing hosting); keep it there until the VPS stack passes its smoke test |
| A | `www.salisauto.com` | VPS IP (or CNAME → `salisauto.com`) | Anytime — Caddy 308-redirects www → apex |
| A | `status.salisauto.com` | VPS IP | Anytime — serves the Uptime Kuma UI (§10.10) |

**Zero-downtime cutover:** 24h before switching, lower the apex A-record TTL
to 300s. Bring the full stack up on the VPS and verify with a Host-header
probe before touching DNS:
`curl -fk --resolve salisauto.com:443:<VPS_IP> https://salisauto.com/api/health/ready`
(Let's Encrypt issuance for the apex only succeeds after DNS points at the
VPS — expect a self-signed/issuance-pending cert until then, hence `-k`.)
Then repoint the apex A record and watch traffic arrive in Caddy's logs.
Old hosting stays live as instant rollback: change the A record back.

### 10.2 Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out/in afterwards
docker --version && docker compose version
```

### 10.3 Clone and configure

```bash
git clone <repo-url> && cd SLIS-GMS

cp .env.production.example .env.production
chmod 600 .env.production
```

Edit `.env.production` and set at minimum:

| Variable | How |
|---|---|
| `DOMAIN` | Your bare hostname, e.g. `gms.example.com` |
| `POSTGRES_PASSWORD` | `openssl rand -hex 24` |
| `DATABASE_URL` | `postgresql://postgres:<POSTGRES_PASSWORD>@postgres:5432/slis_gms` (write the password out — env files don't interpolate) |
| `SESSION_SECRET` | `openssl rand -hex 32` |
| `APP_URL` / `PUBLIC_APP_URL` | `https://<DOMAIN>` |

Integrations (ZATCA, Sentry, Moyasar/Stripe/PayPal, Twilio, GetResponse) are
optional and key-deferred — see the comments in `.env.production.example`.

### 10.4 Start the stack

```bash
# --env-file is REQUIRED on every compose command: it feeds ${DOMAIN} and
# ${POSTGRES_PASSWORD} into the compose file itself.
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Watch the rollout: migrate must exit 0, then app starts, then caddy.
docker compose -f docker-compose.prod.yml --env-file .env.production ps
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f migrate app
```

The `migrate` service replays `migrations/*.sql` once and exits; the app only
starts after it succeeds.

### 10.5 Seed and secure the admin account

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec app npm run db:seed
```

The seed script creates initial roles and an admin account with a known
development password. **Immediately** log in at `https://<DOMAIN>` and change
the admin password to a strong generated one (e.g. `openssl rand -base64 24`
as a starting point for a password manager entry). Do not leave any seeded
password in place on a production system.

### 10.6 Verify health

```bash
curl -fsS https://<DOMAIN>/api/health          # {"status":"ok",...}
curl -fsS https://<DOMAIN>/api/health/ready    # {"ready":true,"db":"connected"}
curl -fsS https://<DOMAIN>/api/health/live     # {"alive":true}

# HTTPS + security headers (HSTS, nosniff, referrer-policy):
curl -sI https://<DOMAIN> | grep -iE 'strict-transport|content-type-options|referrer'
# HTTP→HTTPS redirect (Caddy default):
curl -sI http://<DOMAIN> | head -3
```

### 10.7 Backups

**Option A — sidecar (compose-managed):** start the stack with the `backup`
profile; it runs `scripts/backup-db.sh` daily at `BACKUP_HOUR_UTC`
(default 02:00 UTC ≈ 05:00 KSA):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production \
  --profile backup up -d
```

**Option B — host cron (recommended for precise scheduling):**

```cron
0 2 * * * cd /opt/SLIS-GMS && docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres sh /scripts/backup-db.sh >> /var/log/gms-backup.log 2>&1
```

Dumps are custom-format (`pg_restore`-able), written to `./backups/` on the
host, retain the newest 30 (`BACKUP_KEEP`), and upload to S3 when
`AWS_S3_BUCKET` is set and the AWS CLI is available.

**Backup drill (run once now, then quarterly):**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec postgres sh /scripts/backup-db.sh
ls -lh backups/    # expect a fresh gms-YYYYMMDD-HHMMSS.dump
```

### 10.8 Restore drill

Prove the dump is restorable **into a scratch database** without touching
production data:

```bash
# 1. Create a scratch DB inside the postgres container
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec postgres createdb -U postgres slis_gms_drill

# 2. Restore the latest dump into it (FORCE=1 skips the interactive prompt)
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec -e FORCE=1 \
  -e DATABASE_URL="postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5432/slis_gms_drill" \
  postgres sh /scripts/restore-db.sh /backups/<latest>.dump

# 3. Spot-check, then drop the scratch DB
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec postgres psql -U postgres -d slis_gms_drill -c "SELECT count(*) FROM users;"
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec postgres dropdb -U postgres slis_gms_drill
```

A real disaster recovery uses the same `restore-db.sh` against the production
`DATABASE_URL` (stop the `app` service first, restore, then start it again).

### 10.9 Updating the app

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
# migrate re-runs (idempotent — already-applied files are skipped), app restarts.
curl -fsS https://<DOMAIN>/api/health/ready
```

### 10.10 Monitoring and alerting (Uptime Kuma)

The stack includes a self-hosted [Uptime Kuma](https://github.com/louislam/uptime-kuma)
service. It sits on the compose network (so it can probe the app container
directly) and its UI is exposed **only** through Caddy at
`https://status.<DOMAIN>` — no host port.

**Prerequisite:** a second DNS **A record**, `status.<DOMAIN>` → the same VPS
IP, created before first start (Caddy gets its own Let's Encrypt cert for it).

**First-run setup (do this immediately after `up -d`):**

1. Open `https://status.<DOMAIN>` — the first visit shows the admin-account
   creation form. Anyone who reaches it first owns the instance, so create
   the admin right away (strong password, password manager).
2. Add three monitors (type **HTTP(s)**, check interval **60s**, retries **3**):

   | Monitor | URL | What it proves |
   |---|---|---|
   | App ready (DB) | `http://app:5000/api/health/ready` | App up **and** Postgres reachable |
   | App live | `http://app:5000/api/health/live` | Process alive (catches DB-only outages by diffing against "ready") |
   | Public site | `https://<DOMAIN>/api/health` | Full path: DNS → TLS cert → Caddy → app, as customers see it |

   The first two probe the container directly and keep working even if Caddy
   or DNS breaks; the third is the outside view. "Ready" failing while "live"
   is green points at the database, not the app.

**Alert channels (Kuma → Settings → Notifications)** — practical picks for a
solo operator in KSA:

- **Telegram** (recommended primary): free, instant, works fine in Saudi.
  Create a bot with @BotFather, paste the bot token + your chat ID into
  Kuma's Telegram notification type. Two minutes of setup.
- **Email (SMTP)**: use any mailbox you already own as a slower fallback
  channel; attach it to the same monitors.
- **WhatsApp**: Kuma has no native WhatsApp type — use its generic
  **Webhook** notification pointing at a WhatsApp gateway (e.g. CallMeBot,
  or your own Twilio WhatsApp sender already configured via
  `TWILIO_*` vars). Treat this as optional polish, not the primary channel.

Attach the notification(s) to all three monitors and use **Test** on each.

> **Sentry complements, not duplicates, these probes:** Kuma tells you the
> app is *down*; Sentry (key-deferred via `SENTRY_DSN` / `VITE_SENTRY_DSN`
> in `.env.production.example`) tells you it is *erroring while up*. Once a
> DSN is set, add a Sentry alert rule for a 5xx/error-rate spike so the two
> systems cover both failure modes.

Kuma's own data (monitors, history, notification config) lives in the
`kuma_data` volume and is **not** part of the Postgres backups — after
changing monitor config, grab a copy via *Settings → Backup → Export*.

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
