# Production Activation Matrix (Phase D.1)

A **mandatory section of the Production Readiness Report.** No production
deployment proceeds until every **Required** external dependency below is
`License ✓ · Credentials ✓ · Production-Approved ✓ · Verified ✓`.

> **Scope & honesty.** Claude Code can verify and wire the **code + config
> detection + health reporting** for each integration. It **cannot** sign a
> commercial license, obtain an API key, complete a merchant/KYC onboarding, or
> grant a production approval — those are procurement/ops actions for the
> business owner. Every "Status" below reflects the **code-verifiable** state
> (is it integrated? does config detect it? does health surface it?), and names
> the credential/approval owner for the parts Claude cannot do. The credential
> columns are ☐ until the owner confirms them in the deployment environment.

_Source of truth in code: `server/config.ts` (`OPTIONAL_INTEGRATIONS`,
`PAYMENT_GATEWAY_KEYS`), and `GET /api/platform-admin/system-health`
(`server/modules/administration`) which reports each integration's `configured`
flag live from its env keys._

---

## 1. Master activation table

Legend — **Code**: integration implemented in the repo · **Cfg**: detected by
`config.ts`/health · **Cred/Approval**: owner action (☐ until confirmed in the
deploy env) · **Status**: `Integrated` (code complete, awaiting creds) /
`Config-only` (env wired, client not implemented) / `Not integrated` (planned).

| # | Service | Required | Code | Cfg | Cred | Prod-Approved | Status |
|---|---------|----------|------|-----|------|---------------|--------|
| 1 | **TecDoc** (parts catalog / VIN) | Yes ⭐ | ⚠ partial | ✅ | ☐ | ☐ | **Config-only** — `TECDOC_API_KEY/URL` wired in `config.ts`; no dedicated client service yet |
| 2 | HaynesPro (repair/labor) | Optional | ❌ | ❌ | ☐ | ☐ | Not integrated (Planned) |
| 3 | ALLDATA | Optional | ❌ | ❌ | ☐ | ☐ | Not integrated (Planned) |
| 4 | AutoData | Optional | ❌ | ❌ | ☐ | ☐ | Not integrated (Planned) |
| 5 | VIN decoder (NHTSA/Wathq/…) | Yes | ⚠ | ✅ | ☐ | ☐ | Wathq business-verify integrated; dedicated VIN provider TBD |
| 6 | **Google Maps / Places** | Yes | ❌ | ❌ | ☐ | ☐ | Not integrated (Planned) — no `MAPS_API_KEY` in code |
| 7 | **SMS gateway** (Twilio) | Yes | ✅ | ✅ | ☐ | ☐ | Integrated (`smsService.ts`, `twilioClient.ts`); awaiting sender ID + prod |
| 8 | **WhatsApp Business** | Yes | ✅ | ✅ | ☐ | ☐ | Integrated (`routes/whatsapp.ts`, webhook + `WHATSAPP_*`); awaiting Meta verification + templates |
| 9 | **Email provider** (GetResponse) | Yes | ✅ | ⚠ | ☐ | ☐ | Integrated (`emailService.ts` → GetResponse API); SPF/DKIM/DMARC are DNS/ops |
| 10 | Push (Firebase/FCM/APNs) | Optional | ❌ | ❌ | ☐ | ☐ | Not integrated (Planned) |
| 11 | **Payment gateway** | Yes | ✅×7 | ✅ | ☐ | ☐ | Integrated: Moyasar, HyperPay, Tap, Tabby, Tamara, PayPal, Stripe (`services/payments/providers/*`, unified webhook-verify); awaiting merchant + prod approval |
| 12 | **ZATCA e-invoicing** (KSA) | Yes (KSA) | ✅ | ✅ | ☐ | ☐ | Integrated (`zatca-phase2.ts`, `zatca-signing.ts`, QR/XML); awaiting CSID onboarding + certificates |
| 13 | **OpenAI** (AI features) | Optional | ✅ | ✅ | ☐ | ☐ | Integrated (`ai` module, `OPENAI_API_KEY`); degrades to 500/preset without key |
| 14 | Cloud storage (S3/Azure/GCS/R2) | Optional | ❌ | ❌ | ☐ | ☐ | Not integrated (local FS today) |
| 15 | **Redis** (cache/queue) | Optional | ❌ | ❌ | ☐ | ☐ | Not integrated — no Redis client; sessions/cache on PG today |
| 16 | **PostgreSQL** | Yes | ✅ | ✅ | ☐ | n/a | Integrated (`DATABASE_URL`, Drizzle); required — validated at boot |
| 17 | OCR (Google Vision / OpenAI Vision) | Optional | ✅ | ✅ | ☐ | ☐ | Integrated (`services/ocr/imageOcr.ts`, `GOOGLE_VISION_API_KEY`) |
| 18 | Identity providers (OAuth) | Optional | ⚠ | ⚠ | ☐ | ☐ | Local Passport auth today; external OAuth not wired |
| 19 | Analytics (GA/Clarity/…) | Optional | ❌ | ❌ | ☐ | ☐ | Not integrated (client-side, if any) |
| 20 | **Error monitoring** (Sentry) | Optional | ✅ | ✅ | ☐ | ☐ | Integrated (`instrument.ts`, `SENTRY_DSN`) |
| 21 | Feature flags (LaunchDarkly/…) | Optional | ➖ | ➖ | n/a | n/a | **Own** feature-flag system (`platform` module) — no external SaaS needed |
| 22 | Search (Elastic/Meili/Algolia) | Optional | ❌ | ❌ | ☐ | ☐ | Not integrated — PG-based search (`routes/search.ts`) |
| 23 | CDN (Cloudflare/CloudFront/…) | Optional | ➖ | ➖ | ☐ | ☐ | Deploy/infra concern, not app code |
| 24 | Backup service | Yes | ✅ | ✅ | ☐ | ☐ | Integrated (`platform` backup module, `BACKUP_ENABLED`); destination/retention = ops |
| 25 | Monitoring (Datadog/Prometheus/…) | Optional | ❌ | ❌ | ☐ | ☐ | Not integrated — Sentry only |
| — | Wathq CR registry (KSA) | Yes (KSA) | ✅ | ✅ | ☐ | ☐ | Integrated (`services/verification/businessVerification.ts`) |
| — | Google My Business | Optional | ✅ | ✅ | ☐ | ☐ | Integrated (`services/gmb-sync.ts`) |

Payment sub-gateway detail is reported live at boot by
`server/config.ts › PAYMENT_GATEWAY_KEYS` (7 gateways + always-on manual/cash).

---

## 2. Required-for-go-live gate

Production is **blocked** until each of these is `Verified`:

| Service | What "Verified" means (owner action) |
|---------|--------------------------------------|
| PostgreSQL | `DATABASE_URL` reachable, SSL on, migrations applied |
| Payment gateway (≥1) | Merchant account live, keys set, webhook signing verified, a real test charge + refund pass |
| ZATCA (KSA) | CSID onboarded, certificates installed, a cleared/reported invoice round-trips |
| SMS (Twilio) | Sender ID approved, balance funded, a real message delivered |
| WhatsApp Business | Meta business verified, number + token live, templates approved |
| Email (GetResponse) | API key live, SPF/DKIM/DMARC DNS records published |
| TecDoc ⭐ | License signed **and** the client service implemented (see §4 gap) |
| Backup | Destination + credentials set, a restore drill validated |

Optional services (OpenAI, Sentry, OCR, GMB) degrade gracefully when unset and
do **not** block go-live.

---

## 3. Verification procedure (per integration)

For each row above, record evidence in the Production Readiness Report:

1. **Config detection** — boot the app; confirm `config.ts` boot log +
   `GET /api/platform-admin/system-health` report the service `configured: true`.
2. **Authentication** — a minimal authenticated call to the provider succeeds.
3. **Core function** — one real round-trip (charge/refund, invoice clearance,
   message delivery, parts lookup) captured as a log/screenshot.
4. **Webhook** (where applicable) — signed webhook received + signature verified
   (`services/payments/webhook-verify.ts`, ZATCA reporting).
5. **Failure mode** — with the key unset, the feature degrades as designed
   (no crash, no fabricated data).

---

## 4. Known integration gaps (code work, not procurement)

These are **code** gaps — the credential is not the blocker, the client is:

- **TecDoc ⭐** — `config.ts` declares `TECDOC_API_KEY/URL` and `OPTIONAL_INTEGRATIONS`
  lists it, but there is **no `tecdoc` client/service** implementing auth /
  article lookup / VIN / images / cross-references. **Execution package:**
  `INT-P1-TECDOC` — a `tecdoc` integration service + a health probe, behind the
  existing config seam. Required for go-live per the matrix.
- **Google Maps** — no `MAPS_API_KEY` usage; geocoding/places/directions not
  wired. **Execution package:** `INT-P2-MAPS` if maps are a launch feature.
- **VIN decoder** — no dedicated provider; decide TecDoc-VIN vs NHTSA/JATO and
  wire one behind a `vin-decode` seam.
- **Redis / cloud storage / external search / external monitoring** — not
  integrated; only add when a migrated domain demonstrably needs them (Technical
  Debt TD-5: no speculative infrastructure).

---

## 5. Internal License Management — current state vs. spec

**Much of the requested "internal licensing subsystem" already exists** as the
SaaS **subscription + entitlement** system — reuse before rebuild:

| Spec requirement | Exists today | Where |
|------------------|-------------|-------|
| Subscription plans | ✅ STARTER/PRO/ENTERPRISE | `shared/plans.ts` |
| Trial licenses | ✅ `status: "trialing"` | subscription status model |
| Expiration / renewal | ✅ `active/past_due/canceled/unpaid` + period math | `subscriptions` module |
| Feature flags by plan | ✅ `PLAN_FEATURE_CATEGORIES` + `requirePlan` | `plans.ts`, `middleware/requirePlan.ts` |
| User / branch / storage / jobs limits | ✅ defined per tier | `plans.ts › limits` |
| Plan-gated RBAC | ✅ | `requirePlan`, `platform` feature-flags |
| Activation/deactivation audit | ✅ general audit | `auditMiddleware`, `services/audit-trail.ts` |
| **License-key / activation-key generation** | ❌ | — (SaaS uses subscription records, not keys) |
| **Offline grace period** | ❌ | — |
| **Hard quota enforcement** (limits are "soft") | ⚠ partial | `plans.ts › limits` are display/soft today |
| **Per-plan garage/vehicle/API quotas** | ⚠ partial | branches/users/jobs modeled; API-usage quota not enforced |

**Genuine gap vs. a full licensing subsystem** = license-key issuance/activation,
offline grace, and hard quota enforcement. Whether to build these depends on the
**licensing paradigm** (SaaS subscription vs. distributable license keys) — a
product decision, surfaced to the owner rather than assumed. See the follow-up
question accompanying this document.

---

## 6. Go / No-Go rule

> **No production deployment** proceeds until every **Required** row in §1 is
> `Verified` per §3, the TecDoc client gap (§4) is closed, and the entitlement/
> quota-enforcement decision (§5) is made. This matrix is re-checked and its
> evidence attached at each release gate.
