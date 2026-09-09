# Cloudflare Setup

Companion to [../DEPLOYMENT.md](../DEPLOYMENT.md), covering the four Cloudflare
surfaces this app uses: **R2** object storage, **DNS + CDN** for the public
domain, **Tunnel** for origins with no public IP, and **hosting**.

Account id `18a80452ad` (the segment in your `dash.cloudflare.com/…` URL) is the
value for `R2_ACCOUNT_ID` and for every `wrangler --account-id` flag below.

> **What this doc can and cannot do for you.** Everything in §1 is code and ships
> in the repo. §2–§4 are account actions — creating a bucket, moving
> nameservers, issuing a tunnel token — that require a logged-in session, so
> they are written as exact steps for you to run, not as something automation
> can do on your behalf. Nothing here was applied to your account.

---

## 1. R2 object storage — uploads

**Status: integrated in code, awaiting a bucket + token.**

`server/services/storage/objectStore.ts` puts one interface in front of two
drivers, chosen by `STORAGE_DRIVER`:

| Driver | Where files live | When to use |
|---|---|---|
| `local` (default) | disk under `UPLOAD_DIR` | single long-lived VM with a real disk |
| `r2` | a Cloudflare R2 bucket | **anything with an ephemeral filesystem** — containers, PaaS, autoscaled instances |

On any container host the local driver silently loses every upload on redeploy.
That is why row 14 of the
[activation matrix](../architecture/PRODUCTION-ACTIVATION-MATRIX.md) is marked
`Optional ⚠` rather than plain optional.

### Why downloads still go through the app

`GET /api/uploads/:id` streams R2 objects back through Express. The bucket stays
private: no public `r2.dev` domain, no presigned URLs. A presigned link is a
bearer token for the object — whoever holds it reads the file, and the
tenant check in `server/routes/uploads.ts` (cross-garage access must look like a
404) would no longer be on the path. The extra hop costs bandwidth; it buys the
multi-tenant isolation the app is built on. Don't turn it into a redirect
without replacing the guard.

### Create the bucket and token

1. **R2 → Create bucket.** Name `salis-gms-uploads`. Location: **Automatic**, or
   pin the jurisdiction if Saudi data-residency terms require it — note that R2
   has no KSA region today, so if residency is contractual, this is a decision to
   settle before go-live, not after.
2. Leave public access **disabled**. The app never needs it (see above).
3. **R2 → Manage R2 API Tokens → Create API token.**
   - Permission: **Object Read & Write**
   - Scope it to the single bucket, not "all buckets"
   - Copy the **Access Key ID** and **Secret Access Key** — the secret is shown once
4. Set these in the deploy environment:

```bash
STORAGE_DRIVER=r2
R2_ACCOUNT_ID=18a80452ad
R2_BUCKET=salis-gms-uploads
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
# R2_PREFIX=uploads/     # only if the bucket holds more than uploads
```

With `STORAGE_DRIVER=r2` and any of the four required vars missing, **the server
refuses to boot** and names what is missing. That is deliberate: falling back to
a disk that a redeploy will erase is the failure mode this driver exists to
prevent.

Confirm at boot — the app logs one of:

```
📦 Uploads: Cloudflare R2 (bucket salis-gms-uploads)
📦 Uploads: local disk (/app/uploads) — set STORAGE_DRIVER=r2 for object storage
```

### Migrating files already on disk

The stored key (`documents.fileUrl`) is identical across drivers, so moving
hosts is a file copy with no database migration:

```bash
# rclone remote: type=s3, provider=Cloudflare,
# endpoint=https://18a80452ad.r2.cloudflarestorage.com, region=auto
rclone copy ./uploads r2:salis-gms-uploads --exclude ".staging/**"
```

Exclude `.staging/` — it holds in-flight multipart temp files, never stored objects.

### Lifecycle and cost

R2 has no egress fee, which is the main reason it beats S3 here. Two settings
worth applying on day one:

- **Bucket → Settings → Object lifecycle rules**: abort incomplete multipart
  uploads after 1 day, so failed uploads don't accrue storage forever.
- Uploads are capped at 10MB each and rate-limited to 30 per user per 15 min
  (`server/routes/uploads.ts`), so storage growth is bounded by user count.

---

## 2. DNS + CDN — `salis-auto.com`

**Status: account action, nothing in code.**

### Move the zone

1. **Add a site → `salis-auto.com`**, pick a plan (Free is sufficient to start).
2. Cloudflare scans existing records — **check them against your current DNS
   before continuing.** The scanner routinely misses `TXT` and `MX`; a missed
   record means mail or domain verification breaks the moment nameservers cut over.
3. Replace the nameservers at your registrar with the two Cloudflare gives you.
   Propagation is usually minutes, up to 24h.

### Records

| Type | Name | Content | Proxy | Notes |
|---|---|---|---|---|
| `A` / `CNAME` | `app` | origin IP / host | 🟠 Proxied | main app |
| `CNAME` | `www` | `salis-auto.com` | 🟠 Proxied | |
| `A` | `@` | origin IP | 🟠 Proxied | or redirect to `app` |
| `MX` | `@` | mail provider | ⚪ DNS only | **must not be proxied** |
| `TXT` | `@` | `v=spf1 …` | n/a | SPF — required for outbound mail |
| `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=…` | n/a | start at `p=none`, tighten later |
| `TXT` | selector`._domainkey` | DKIM key | n/a | from GetResponse |

`emailService.ts` sends through GetResponse, and row 9 of the activation matrix
flags SPF/DKIM/DMARC as the ops half of that integration — **this table is where
that gets done.** Without them, transactional mail lands in spam.

If you use a Tunnel (§3), skip the `A` record: `cloudflared` creates its own
proxied CNAME.

### SSL/TLS

- Mode: **Full (strict)**. Not "Flexible" — Flexible sends plain HTTP to your
  origin while showing the user a padlock, which is a downgrade attack wearing a
  disguise. Behind a Tunnel this is moot (the tunnel is encrypted end to end).
- **Always Use HTTPS**: on.
- **HSTS**: enable once you are certain every subdomain serves HTTPS. Start with
  a short `max-age`; it is hard to walk back.
- Minimum TLS: **1.2**.

### Caching

The SPA is content-hashed by Vite (`dist/public/assets/*`), so its assets are
safe to cache hard while HTML and the API must never be cached.

| Rule | Match | Setting |
|---|---|---|
| Static assets | `/assets/*` | Cache everything, Edge TTL 1 year |
| API | `/api/*` | **Bypass cache** |
| SPA shell | `/index.html`, `/` | Cache everything, Edge TTL 0, revalidate |

Caching `/api/*` even briefly will serve one tenant's response to another —
this is the single most damaging misconfiguration available on this page. Set
the bypass rule before you send production traffic.

- **Brotli**: on. **Auto Minify**: off (Vite already minified; double-minifying
  breaks source maps for Sentry).
- **WebSockets**: on — the app uses a same-origin socket.

### Security

- **WAF managed rules**: on.
- Rate limiting: the app already limits per-IP (`RATE_LIMIT_MAX`,
  `AUTH_RATE_LIMIT_MAX`), but an edge rule on `/api/auth/*` stops credential
  stuffing before it reaches Node.
- **Bot Fight Mode**: leave **off** if a mobile app calls the API — it
  challenges non-browser clients and will break them.
- If you serve assets from a separate Cloudflare domain, add it to
  `CSP_EXTRA_IMG` / `CSP_EXTRA_CONNECT` (see DEPLOYMENT.md) or CSP blocks it.

---

## 3. Cloudflare Tunnel

**Status: config ships in the repo; the token is an account action.**

A tunnel dials out to Cloudflare's edge, so the origin needs no public IP, no
port-forward, and no inbound firewall rule. Two ways to run it:

### Token-based (recommended)

Ingress lives in the dashboard; the origin holds only a token.

1. **Zero Trust → Networks → Tunnels → Create a tunnel** → Cloudflared → name it
   `salis-gms`. Copy the token.
2. Add a **Published application route**: hostname `app.salis-auto.com` →
   service `http://app:5000`.
3. Run it:

```bash
export CLOUDFLARE_TUNNEL_TOKEN=<token>
docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d
```

[`docker-compose.tunnel.yml`](../../docker-compose.tunnel.yml) adds the
`cloudflared` service and flips `SESSION_COOKIE_SECURE=true` (correct here — the
browser always speaks HTTPS to the edge). Express already runs with
`trust proxy = 1`, so `X-Forwarded-Proto` is honoured and Secure cookies are set.

**Close the direct port.** The base compose file still publishes `5000` on the
host, so the app stays reachable on the LAN, bypassing the tunnel and every
edge rule with it. Once the tunnel is the intended entry point, drop that
mapping (`ports: !reset []` on Compose v2.24+).

### Config-file based

For ingress rules in git, use
[`cloudflared/config.example.yml`](../../cloudflared/config.example.yml). Copy to
`config.yml` and fill in the tunnel UUID. **Both `config.yml` and the credentials
JSON are secrets** and are already git-ignored.

---

## 4. Hosting the app on Cloudflare

**Status: assessed, and the honest answer is a split.**

### The client — Pages works today

`vite build` emits a static SPA to `dist/public`. That deploys to Pages as-is:

| Setting | Value |
|---|---|
| Build command | `npx vite build` |
| Build output directory | `dist/public` |
| Root directory | `/` |

SPA routing needs a catch-all rewrite — add `client/public/_redirects`:

```
/*  /index.html  200
```

and API calls need to reach the Node origin, via a Pages Function proxy or by
pointing the client at `api.salis-auto.com`.

### The server — Workers is a port, not a deploy

This is the part worth being blunt about before you spend time on it. Measured
in this repo:

- **436 TypeScript files / ~81,000 lines** under `server/`
- **Express 4** with a middleware stack Workers does not run natively
- **`express-session` + `connect-pg-simple` + Passport** — server-side sessions
  backed by a Postgres table, relying on Node's `http` objects
- **`multer` + `fs`** for uploads — Workers has no filesystem
- **`@neondatabase/serverless` is already a dependency**, which is the one piece
  that *is* Workers-ready

Getting this onto Workers means replacing the HTTP layer (Hono or itty-router),
replacing session handling (signed cookies or KV/Durable Objects instead of
`connect-pg-simple`), and rewriting the upload path against R2 bindings. That is
a multi-week migration with real regression risk across payments, ZATCA signing,
and the tenant guard — not a deployment task, and not something to fold into
this setup.

### Recommended topology

Keep the Node server where it runs well and let Cloudflare do what it is good at:

```
Browser
  └── Cloudflare edge (DNS, TLS, WAF, cache)   ← §2
        ├── /assets/*  → cached at the edge
        └── /*, /api/* → Tunnel → Node origin  ← §3
                            └── uploads → R2   ← §1
```

This gets you the CDN, the WAF, managed TLS, no exposed origin, and durable
object storage — every practical benefit of Cloudflare — without touching
81,000 lines of working server code. Revisit Workers only if you later split a
genuinely edge-shaped service (image resizing, a public status page) out of the
monolith.

---

## Checklist

- [ ] R2 bucket `salis-gms-uploads` created, public access **off**
- [ ] R2 API token (Object Read & Write, single bucket) issued
- [ ] `STORAGE_DRIVER=r2` + four `R2_*` vars set in the deploy env
- [ ] Boot log shows `📦 Uploads: Cloudflare R2`
- [ ] Existing `uploads/` copied to the bucket (if migrating)
- [ ] Zone added; **MX/TXT records verified by hand** before nameserver cutover
- [ ] Nameservers moved at the registrar
- [ ] SSL mode **Full (strict)**, Always Use HTTPS on
- [ ] Cache rule: **`/api/*` bypass** ← do this before production traffic
- [ ] SPF / DKIM / DMARC published (unblocks activation-matrix row 9)
- [ ] Tunnel created and running; direct port 5000 closed
- [ ] `APP_URL` matches the public hostname
