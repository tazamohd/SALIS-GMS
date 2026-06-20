# 07 — Master Plan & Schedule

This is the living plan the `superapp-orchestrator` reviews and updates each planning round.
It covers the **MVP (shared rails + Wave 1)**. Waves 2–3 are appended as we approach them.

> **Status:** planning baseline. No super-app code written yet. SALIS AUTO (B2B garage ERP) exists
> and is the supply backbone. Update this file at the end of every planning round.

---

## A. The planning loop (repeatable)

The orchestrator runs this every round: **Review → Gap analysis → Decompose → Assign → Estimate →
Sequence → Schedule → Document** (defined in `superapp-orchestrator`). Outputs land here.

**Estimate scale:** S ≤ 2 days · M ≈ 1 week · L ≈ 1 sprint · XL = multi-sprint epic.
**Dependency notation:** `now` = can start immediately · `→X` = blocked by epic X.

---

## B. Gap analysis (current → MVP target)

| Capability | Today | MVP target |
|---|---|---|
| B2B garage ERP (SALIS) | ✅ exists | hardened as multi-tenant SaaS |
| Shared Identity / SSO | partial (Passport+2FA) | one identity rail + Nafath KYC |
| Wallet + ledger | ❌ | double-entry wallet rail |
| Payments | Stripe/PayPal partial | + mada/STC Pay via licensed PSP |
| Notifications hub | SMS only | push + SMS + email + in-app |
| Orders/Catalog rail | ❌ | shared rail |
| BFF / API gateway | ❌ | one API surface for 3 clients |
| Redis / PostGIS | ❌ | provisioned |
| Consumer mobile app | ❌ | Expo app + super-app shell |
| Wave-1 services | ❌ | booking + inspection + parts |
| Observability / SLOs | basic logs | Sentry/OTel/Prometheus + SLOs |
| Regulatory (ZATCA Ph2, SAMA PSP) | Ph1 QR only | Ph2 + PSP partner engaged |

---

## C. Epics → owner → estimate → dependency

| # | Epic | Lead agent | Est. | Depends |
|---|---|---|---|---|
| E1 | Discovery, BRD, regulatory requirement list | `business-analyst` | M | now |
| E2 | System specs (SRS, use cases, data dictionary) | `system-analyst` | M | →E1 |
| E3 | Architecture + ADRs + shared-rail design | `system-architect` | L | now (refine →E2) |
| E4 | Delivery plan / WBS / sprint sequencing | `delivery-planner` | M | →E3 |
| E5 | Infra baseline: Redis, PostGIS, BFF skeleton, CI, monorepo | `devops-sre-lead` + `backend-platform-lead` | L | →E3 |
| E6 | Data model: rails schema + wallet ledger + geo | `database-lead` | L | →E3 |
| E7 | Identity / SSO rail (+ Nafath KYC) | `backend-platform-lead` + `security-lead` | L | →E5,E6 |
| E8 | Wallet + ledger rail | `backend-platform-lead` + `database-lead` + `security-lead` | XL | →E6,E7 |
| E9 | Payments (Stripe + mada/STC Pay via PSP) | `backend-platform-lead` + `security-lead` | L | →E8 |
| E10 | Notifications hub (push/SMS/email) | `backend-platform-lead` | M | →E5 |
| E11 | Orders / Catalog rail | `backend-platform-lead` + `database-lead` | L | →E6,E7 |
| E12 | Shared design-system package | `frontend-web-lead` + `mobile-lead` | M | →E3 |
| E13 | Mobile app shell + onboarding + wallet UI | `mobile-lead` | L | →E7,E12 |
| E14 | Wave-1: Garage service booking (full-stack) | `product-manager`→ backend/mobile/web leads | XL | →E8,E11,E13 |
| E15 | Wave-1: Periodic inspection booking | mission pod | M | →E14 |
| E16 | Wave-1: Parts marketplace + search (Typesense) | mission pod + `database-lead` | XL | →E11,E13 |
| E17 | Observability + SLOs + load tests | `devops-sre-lead` + `qa-lead` | L | →E5 |
| E18 | Test strategy + E2E suite (continuous) | `qa-lead` | L | →E5 (then ongoing) |
| E19 | Security threat model + gate reviews (continuous) | `security-lead` | M + ongoing | now |
| E20 | Regulatory track: ZATCA Ph2, SAMA PSP partner, TGA prep | `business-analyst` (+external) | XL | now (parallel) |
| E21 | Wave-1 GTM + supply pre-recruitment | `marketing-growth-lead` + `product-manager` | L | →E14 (prep earlier) |

---

## D. Sprint schedule (2-week sprints) — MVP

| Sprint | Theme | Epics in flight | Can start now? |
|---|---|---|---|
| **S0** Inception | Discovery, architecture, plan | E1, E3, E19, E20 kickoff | ✅ all |
| **S1** Foundations | Specs + infra baseline + data model | E2, E4, E5, E6, E18 | after S0 architecture |
| **S2** Identity | Identity/SSO rail + design system | E7, E12, E10 | →E5,E6 |
| **S3** Money I | Wallet/ledger build + notifications | E8, E10, E17 start | →E6,E7 |
| **S4** Money II | Wallet finish + payments + orders | E8, E9, E11 | →E8 |
| **S5** Clients | Mobile shell + onboarding + wallet UI | E13, E11 finish | →E7,E12 |
| **S6** Booking I | Garage booking backend + flows | E14, E21 prep | →E8,E11,E13 |
| **S7** Booking II + Inspection | Booking GA + inspection | E14, E15 | →E14 |
| **S8** Marketplace I | Parts catalog + search + UI | E16 | →E11,E13 |
| **S9** Launch prep | Parts GA, hardening, GTM, SLOs | E16, E17, E21 | →E16 |
| **S10** MVP launch | Canary → compliance sign-off → GA | launch all Wave-1 | →E20 cleared |

**Critical path:** E3 → E6 → E7 → E8 → E14 → launch. The **regulatory track (E20)** runs in
parallel from S0 and is the most likely launch blocker — keep it ahead of E9 (payments) and E14.

**Parallelizable from S0–S1 (start now):** E1, E3, E19, E20, plus E12 (design system) and E18
(test scaffolding) can begin before the rails are finished.

---

## E. Templates (use every round)

**Task spec**
```
Task: <verb + outcome>
Owner agent: <agent>
Epic: <E#>  | Estimate: <S/M/L/XL> | Confidence: <hi/med/lo>
Depends on: <now | E#/task>
Acceptance criteria: <testable bullets>
Artifacts/paths: <files to produce>
Gate: <qa-lead / security-lead if auth-money>
```

**Sprint entry**
```
Sprint S#: <theme>
Goals: <2–4 outcomes>
Committed tasks: <list with owners + estimates>
Dependencies cleared: <…>  | Risks: <…>
Definition of Done: CI green · review · security gate (if needed) · docs updated · flagged
```

---

## F. Next planning action
Run `superapp-orchestrator` for the **S0 round**: confirm scope, spawn `system-architect` +
`database-lead` to produce the shared-rail ADRs and Drizzle schema, `business-analyst` to start the
regulatory/PSP track, and write the results back here.
