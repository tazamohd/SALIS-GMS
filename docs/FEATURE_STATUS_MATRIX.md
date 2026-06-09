# SalisAuto — Feature Status Matrix

**Date:** 2026‑06‑09 · Companion to [`STATUS_REPORT_2026.md`](./STATUS_REPORT_2026.md)

An honest, evidence‑based status for each functional area. This replaces the conflicting "module count" claims in the legacy docs.

## Legend

| Symbol | Meaning |
|---|---|
| 🟢 **Real** | Data‑backed (Drizzle/Postgres), full CRUD or genuine logic, user can actually use it |
| 🟡 **Partial** | Real data but read‑only, or core logic done with a stubbed edge (e.g. ZATCA XML done / submission stubbed) |
| 🔴 **Stub/Demo** | Hardcoded/mock/`Math.random()` data, or in‑memory demo, or UI shell over a seed endpoint |
| ⚪ **Missing** | Referenced (env/docs/UI) but no real implementation |

---

## Core operations — the garage service loop 🟢

| Area | Status | Evidence / Notes |
|---|---|---|
| Customers (CRM) | 🟢 Real | Full CRUD, profiles, notes, vehicle links (`Customers.tsx`, `customers.routes.ts`) |
| Vehicles | 🟢 Real | CRUD, VIN decode, catalog (`Vehicles.tsx`, `vehicles.routes.ts`) |
| Appointments | 🟢 Real | Booking, reschedule, technician assignment |
| Job Cards | 🟢 Real | CRUD + state machine (pending→assigned→in_progress→completed) |
| Estimates | 🟢 Real (UI) | Real DB CRUD via legacy route; note `routes/estimates.ts` demo version is **disabled** to avoid shadowing |
| Invoices | 🟢 Real | CRUD, line items, VAT 15%, status workflow |
| Payments (recording) | 🟢 Real | Records cash/card/transfer/check; **no gateway processing** (see Integrations) |
| Inventory / Spare parts | 🟢 Real | CRUD, reorder points, low‑stock alerts |
| Technicians | 🟢 Real | Profiles, scheduling |
| Technician portal | 🟢 Real (~85%) | Time clock, my‑jobs, parts lookup |
| **Workflow gaps** | 🟡 | Pages work individually, but **no "Estimate → Invoice" / "Job Card → Invoice" UI shortcuts** |

## Platform / security 🟢

| Area | Status | Notes |
|---|---|---|
| Authentication | 🟢 Real | Passport + bcrypt + PG sessions; `AUTH_BYPASS` is a dead flag (unused) |
| Multi‑tenant isolation | 🟢 Real | `garageId` filtering enforced across queries |
| Security headers / rate limiting | 🟢 Real | HSTS, X‑Frame‑Options, nosniff; 200/15min + 10/15min |
| Workflow engine | 🟢 Real | Event bus, state machines, triggers, scheduled checks |
| RBAC (fine‑grained roles) | 🟡 Partial | Defined (24 roles) but **not enforced** on routes; plan‑tier gating used instead |
| Storage layer | 🟢 Real | ~12K‑line Drizzle layer, real Postgres |

## Saudi compliance & localization

| Area | Status | Notes |
|---|---|---|
| VAT (15%) | 🟢 Real | `shared/vatUtils.ts` (tested) |
| Hijri calendar | 🟢 Real | `shared/hijriUtils.ts` (tested) |
| ZATCA QR + UBL 2.1 XML | 🟢 Real | Generation + hashing tested |
| ZATCA Phase 2 clearance/reporting API | 🟡 Partial | **Submission stubbed** — returns fake `CLEARED` (`zatca-phase2.ts`) |
| Arabic / RTL (i18n) | 🟢 Real | ~2,349 keys, EN/AR parity |

## Analytics / finance / HR

| Area | Status | Notes |
|---|---|---|
| Dashboard / KPIs | 🟡 Partial | Real data, read‑only |
| Business intelligence / reports | 🟡 Partial | Real queries, view‑only charts |
| Accounting (GL, balance sheet, journals, AP/AR, cost centers) ~15 pages | 🟡 Partial | Read‑only; **no posting / ledger writes** |
| HR / payroll / timesheets ~6 pages | 🟡 Partial | Read‑only dashboards |

## AI & automation

| Area | Status | Notes |
|---|---|---|
| AI chatbot / business‑intelligence | 🟡 Partial | Real OpenAI calls, Replit‑env‑gated, read‑only UI |
| AI insights / forecasts | 🟡 Partial | Query‑only display |
| Predictive maintenance | 🟡 Partial | Real history‑based scoring; doesn't auto‑create appointments |
| Parts recommender / scheduling optimizer | 🟡 Partial | Service logic exists; limited UI actions |

## Communications & marketing

| Area | Status | Notes |
|---|---|---|
| Twilio SMS (transactional) | 🟢 Real | Real SDK, Replit‑connector‑gated |
| SMS campaign metrics | 🔴 Stub | Delivery/click rates via `Math.random()` |
| Gmail / Google Calendar | 🟢 Real | Real SDK, Replit‑connector‑gated |
| WhatsApp | 🟡 Partial | Route stub present, not fleshed out |
| Email marketing / social media | 🟡 Partial | Mostly read‑only dashboards |

## Emerging tech (demonstration layer)

| Area | Status | Notes |
|---|---|---|
| IoT dashboard | 🔴 Stub | Hardcoded sensors (`iot.ts`) |
| Blockchain / smart contracts | 🔴 Stub | Plain JSON in Postgres, no chain |
| Digital twin / AR overlay / VR showroom | 🔴 Stub | UI shells, mock/seed endpoints |
| Drone inspection / edge computing / neural‑net / quantum | 🔴 Stub | UI scaffolding |
| OBD diagnostics | 🟢 Real | DB‑backed ingestion (`obd-diagnostics.ts`) |

## Integrations

| Integration | Status | Notes |
|---|---|---|
| Twilio SMS | 🟢 Real | Replit‑connector‑gated |
| OpenAI | 🟢 Real | Replit‑env‑gated |
| Gmail / Google Calendar | 🟢 Real | Replit‑connector‑gated |
| ZATCA submission API | 🟡 Partial | Stubbed |
| Stripe / PayPal | ⚪ Missing | Env placeholder only, no code |
| KSA payment (mada/Moyasar/HyperPay) | ⚪ Missing | Recommended addition |
| TecDoc parts catalog | ⚪ Missing | Env hook only |

## Mobile / PWA

| Area | Status | Notes |
|---|---|---|
| Responsive mobile pages (customer + technician) | 🟡 Partial | 11 pages, responsive web |
| PWA (manifest, service worker, offline) | ⚪ Missing | Claimed but not implemented |

---

## Roll‑up

| Tier | Approx. share of pages | Maturity |
|---|---|---|
| Core operations + platform | ~15–20% | 🟢 ~90% |
| Reporting / finance / HR / AI (read‑only) | ~35% | 🟡 ~30% |
| Emerging tech / demo | ~25% | 🔴 ~20% |
| Mobile / settings / misc | ~20% | 🟡 ~30% |

**Weighted functional maturity of the *claimed* surface ≈ 35–45%.** The *core product* a real garage would use daily ≈ **90% ready** (pending ZATCA clearance + real payments).
