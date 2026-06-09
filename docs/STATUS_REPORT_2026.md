# SalisAuto (SALIS‑GMS) — Independent Status Report

**Date:** 2026‑06‑09
**Scope:** Full‑repo audit (backend, frontend, quality/ops) against the actual code, not the marketing docs.
**Method:** Evidence‑based code review with file/line citations and hard counts. Numbers in this report were measured from the codebase, not taken from existing documentation.

---

## 0. Bottom line up front

SalisAuto is a **genuinely large, real product with a working core** — not vaporware, but also not the "175 modules / production‑ready" the legacy docs claim.

> **The core garage workflow works end‑to‑end and is production‑grade. Around it sits a very large "scope shell" — ~250 pages and 406 tables — of which roughly half is read‑only dashboards or demo‑grade scaffolding for advanced features (AI, IoT, blockchain, AR/VR, finance/HR).**

**Functional maturity:** core ≈ 60% production‑ready (backend) / ~95% (frontend core pages); advanced features ≈ 20–35%. Weighted across the whole claimed surface ≈ **35–45% real**.

It is an excellent demo and a deployable MVP for the core service loop, but it is *marketed* as finished when it is actually an ambitious MVP‑plus with a long completion tail.

---

## 1. Ground truth vs. the docs

Documentation is currently the **least reliable artifact in the repo** — numbers contradict each other across `README.md`, `replit.md`, `docs/09-features/PLATFORM_STATUS.md`, and the external `ARCHITECTURE.md` (which actually describes a *fleet‑tracking* app — drivers/routes/geofences/HOS/IFTA — not this garage system).

| Metric | Docs say | **Verified actual** |
|---|---|---|
| DB tables | 70+ / 100+ / 254 / 320+ | **406 `pgTable`** |
| Frontend pages | 60 / 74 / 178 | **250 files, 255 routes** |
| Server endpoints | 250+ / 345 | **~1,400** (212 modular + ~1,196 legacy) |
| Modules | 104 / 121 / 156+ / 175+ | term undefined — no source of truth |
| Arabic i18n | "100%, 2000+ keys" | **Real — ~2,349 keys, EN/AR at parity** |
| TypeScript errors | "0 errors" | plausible, **but 60 files carry `@ts-nocheck`** and CI never runs `tsc` |
| `AUTH_BYPASS=true` | "dev only" | **dead flag — zero references in code; auth is enforced everywhere** |

**Takeaway:** the product is *bigger* than advertised in raw size, but *less finished* than advertised in depth.

---

## 2. What's REAL (production‑grade) ✅

- **Core service loop:** Customers → Vehicles → Appointments → Job Cards → Estimates → Invoices → Payments. Every page has real CRUD (TanStack Query + mutations) wired to a real Drizzle/Postgres storage layer (`server/storage.ts`, ~12K lines).
- **Auth & security:** Passport local strategy, bcrypt (10 rounds), Postgres‑backed sessions (7‑day TTL), security headers (HSTS, X‑Frame‑Options, nosniff), rate limiting (200/15min global, 10/15min auth). **Multi‑tenant isolation via `garageId` is consistently enforced.**
- **Workflow engine** (`server/engine/`): real event bus (pub/sub with pattern matching), state machines (job card, appointment, invoice, PO), event‑driven triggers, 15‑minute scheduled‑checks loop (overdue jobs/invoices, low stock).
- **Saudi compliance core:** VAT (15%), Hijri calendar, ZATCA **QR + UBL 2.1 XML generation** — real and unit‑tested.
- **Bilingual EN/AR + RTL:** real, exact key parity (~2,349 each).
- **Design system:** 7 archetype layout wrappers exist and are used consistently.
- **Technician portal:** time clock, my‑jobs, parts lookup — wired and functional (~85%).

---

## 3. What's PARTIAL (half‑built) 🟡

- **ZATCA Phase 2 e‑invoicing:** XML + hash + QR are real, but **clearance/reporting API submission is stubbed** (`server/services/zatca-phase2.ts` returns a fake `CLEARED` with a `// TODO: uncomment when integrating real ZATCA API`). ~60–75% done.
- **AI features:** real OpenAI SDK calls (chatbot, business‑intelligence) gated behind Replit env vars, but **read‑only in the UI**.
- **RBAC:** a full permission system is *defined* (`rbac-middleware.ts`, 24 roles) but **not enforced on routes** — access is gated by subscription *plan tier* instead. Fine‑grained roles are dormant.
- **Finance / HR / Accounting (~30 pages):** real data displayed, but **read‑only** — GL, balance sheet, journal entries, payroll have no posting/write path.
- **Mobile:** 11 responsive mobile pages exist, but **no PWA** (no manifest, no service worker, no offline).

---

## 4. What's DEMO / ASPIRATIONAL ⚠️

- **IoT dashboard:** hardcoded sensor array, timestamps regenerated per request.
- **SMS campaign metrics:** delivery/click/opt‑out rates faked with `Math.random()`.
- **Blockchain / smart contracts:** stored as plain JSON in Postgres — no chain, no contract execution.
- **Stripe / PayPal payments:** **not implemented** (env placeholder only). Payments are recorded manually (cash/card/transfer/check), not processed.
- **AR/VR, digital twin, drone, neural‑net, quantum, edge computing (~14 pages):** UI shells over mock or single‑seed endpoints.
- **Intentionally disabled modules:** `estimates.ts`, `supplier-portal.ts`, `misc.routes.ts` are not mounted because their in‑memory demo data shadowed the real DB routes — correctly disabled, but tech debt.

---

## 5. Engineering & ops posture

| Dimension | State | Notes |
|---|---|---|
| **Tests** | 🟡 server‑heavy | 42 files / ~263 cases, real assertions via supertest + real Postgres. **0 client/React tests.** E2E = 2 Playwright files, ~51 lines. |
| **CI** | 🟡 partial gate | One workflow runs `vitest` on PG16. **No `tsc`, no lint, no build, no coverage gate.** Doesn't block merges. |
| **Type safety** | 🟢/🟡 | `strict: true`, but **60 `@ts-nocheck` files** (incl. monolith & storage) and no CI typecheck. **No ESLint config at all.** |
| **Schema/migrations** | 🟡 | 406 tables; only 3 SQL migrations + reliance on `drizzle-kit push --force` → **no real rollback path**. |
| **Refactor** | 🟡 ~40–50% | Modular routes extracted (~2,455 lines / ~8 domains) but the **22,257‑line `server/routes.ts` monolith is still live as fallback**. 3 modules are empty skeletons. |
| **Deploy** | 🟡 | Docker/compose/Render/Railway/Replit configs present; **Render config missing `SESSION_SECRET`** (would crash). |
| **Repo hygiene** | 🟡 | No committed secrets. But empty `OCTOBER 27` file, 37 MB `GUI PRTSCN` folder, stray 69 KB `gallery.html` should be gitignored/removed. |

---

## 6. What REMAINS — to make the *current* scope solid

### P0 — credibility & safety
1. Reconcile docs to reality (one source of truth; retire contradictory docs).
2. Add CI gates: run `tsc` + add an ESLint config; fail build on errors.
3. Burn down the 60 `@ts-nocheck` files (start with `storage.ts` + engine).
4. Fix deploy gaps: `SESSION_SECRET` on Render; document env per platform.

### P1 — finish the half‑built core
5. Complete ZATCA Phase 2 clearance/reporting API (the stubbed submission).
6. Real payments: wire Stripe and/or a KSA gateway (Moyasar/HyperPay, mada/Apple Pay).
7. Make finance write‑capable, or relabel honestly as "reporting".
8. Wire workflow shortcuts: "Convert Estimate → Invoice", "Create Invoice from Job Card".

### P2 — quality & modernization
9. Add client tests for 5 critical paths + grow E2E beyond 4 assertions.
10. Finish the route refactor; delete the 22K‑line monolith; fill 3 skeleton modules.
11. Enforce RBAC (apply `requirePermission` to routes) instead of plan‑tier gating only.
12. Repo cleanup (remove `OCTOBER 27`, gitignore screenshot/gallery artifacts).

---

## 7. What MORE could be ADDED — new value

- **Make AI *actionable*, not just visual** (fits the "AI‑native" brand): AI service‑advisor that drafts estimates from a complaint + VIN; parts auto‑match; predictive‑maintenance that *creates* appointments; a data copilot. OpenAI plumbing already exists.
- **KSA‑relevant integrations:** mada/Apple Pay via Moyasar/HyperPay; WhatsApp Business API (route stub exists); TecDoc parts catalog (env hooks exist); Absher/Najm/Tam vehicle data.
- **True PWA + offline** for technician/customer mobile apps — high impact, low effort given responsive pages exist.
- **Customer self‑service:** online booking, live job tracking, digital invoice + ZATCA QR delivery, payment links.
- **Observability:** structured logging, error tracking (Sentry), uptime/health dashboards — currently just `console.*`.
- **Group platform play:** share auth/tenant infrastructure with **Raqeeb** (security/ops) and **QHR** (workforce) rather than three silos.

---

## 8. One‑line verdict

**SalisAuto is a real, deployable garage‑management MVP with an unusually broad ambition layer.** The service core (intake → job → invoice → pay, multi‑tenant, bilingual, Saudi‑VAT) is production‑quality. The path to "actually production for a paying KSA garage" is short and well‑defined: **ZATCA clearance, real payments, CI/type gates, and honest docs.** The path to the marketed "175‑module AI/blockchain/IoT platform" is long — most of that surface is currently demonstration scaffolding.

---

*See [`FEATURE_STATUS_MATRIX.md`](./FEATURE_STATUS_MATRIX.md) for the per‑area real/partial/stub breakdown.*
