# SALIS AUTO — Full Platform Audit Report

**Date:** June 2, 2026
**Scope:** Frontend · Backend · Database · UI/UX · All Portals & Modules
**Audited by:** Planning Agent (parallel 10-explorer sweep)

> **Remediation status (June 2026):** Many findings below have since been
> resolved. See the **[Remediation Status Addendum](#remediation-status-addendum)**
> at the end of this document for the current state of each item. This section
> preserves the original audit as a permanent reference.

---

## Table of Contents
1. [Broken / Missing Routes](#section-1--broken--missing-routes)
2. [Service Advisor Portal](#section-2--service-advisor-portal)
3. [Customer Portal](#section-3--customer-portal)
4. [Finance Portal](#section-4--finance-portal)
5. [Store Keeper Portal](#section-5--store-keeper-portal)
6. [Customer Support Portal](#section-6--customer-support-portal)
7. [Platform Admin Portal](#section-7--platform-admin-portal)
8. [Purchase Agent Portal](#section-8--purchase-agent-portal)
9. [Technician Portal](#section-9--technician-portal)
10. [HR Management](#section-10--hr-management)
11. [Backend API Audit](#section-11--backend-api-audit)
12. [Database Layer Audit](#section-12--database-layer-audit)
13. [UI/UX Issues Across the Platform](#section-13--uiux-issues-across-the-platform)
14. [Priority Summary Table](#priority-summary-table)

---

## SECTION 1 — BROKEN / MISSING ROUTES
These items appear in the sidebar navigation but have **no registered `<Route>` in `App.tsx`** — clicking them hits the `NotFound` page.

| # | Nav Label | Expected Path | Severity |
|---|-----------|---------------|----------|
| 1 | Quality Control | `/quality-control` | 🔴 High |
| 2 | Business Heat Maps | `/business-heat-maps` | 🟠 Medium |
| 3 | Service Reminders | `/service-reminders` | 🟠 Medium |
| 4 | Email Marketing | `/email-marketing` | 🟠 Medium |
| 5 | Safety Alerts | `/safety-alerts` | 🟠 Medium |
| 6 | Blockchain History | `/blockchain-service-history` | 🟡 Low |
| 7 | Smart Contracts | `/smart-contracts` | 🟡 Low |
| 8 | AR Repair Guide | `/ar-repair-guide` | 🟡 Low |
| 9 | AR Overlay (nav path mismatch) | `/ar-overlay` nav uses different path | 🟡 Low |
| 10 | VR Showroom | `/vr-showroom` | 🟡 Low |

---

## SECTION 2 — SERVICE ADVISOR PORTAL
**Overall status: 85% complete — core operations solid**

| Page | Status | Issues |
|------|--------|--------|
| Appointments | 🔴 Runtime Bug | `apt.vehicle` (object) rendered as React child — crashes the page |
| Vehicle Check-In | ⚠️ Partial | Photo upload spots are UI-only |
| Communications | ⚠️ Partial | Call & Email buttons are UI-only |

(Other pages verified working with real API.)

---

## SECTION 3 — CUSTOMER PORTAL
**Overall status: 70% complete**

| Page | Status | Issues |
|------|--------|--------|
| Invoices | 🔴 Broken | Download PDF button hardcoded `disabled` |
| Parts Store | 🔴 Mock | Cart is ephemeral client-side state |
| Track Service | ⚠️ Partial | Static timeline; potential data-scope leak via `/api/job-cards` |

---

## SECTION 10 — HR MANAGEMENT
**Overall status: 25% complete — only Employees & Departments have real data**

8 of 10 tabs (Attendance, Payroll, Leave, Recruitment, Benefits, Performance,
Training, Self-Service) are visual prototypes with mock data and no backend.

---

## SECTION 11 — BACKEND API AUDIT
Stub endpoints returning hardcoded data: `/api/scheduling/rules`,
`/api/auto-reorder/*`, `/api/timeclock/clock-in`, `/api/payroll/calculate`,
`/api/quality/checklists`, `/api/safety-incidents`, `/api/analytics/custom-reports`,
`/api/ai-ocr/process`, `/api/ai-chat-messages`, plus several TODO-marked handlers.

---

## SECTION 12 — DATABASE LAYER AUDIT
12 dead emerging-tech tables defined in `schema.ts` with no storage CRUD or API
route: `metaverse_showrooms`, `quantum_encryption_keys`, `holographic_guides`,
`satellite_connections`, `autonomous_robots`, `spatial_workstations`, etc.

---

## PRIORITY SUMMARY TABLE
| Priority | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 1 | SA Appointments vehicle render crash |
| 🔴 High | 12 | Missing nav routes · HR mock tabs · invoice download disabled · cart ephemeral · attendance fake · data-scope leak |
| 🟠 Medium | 12 | Photo upload stubs · GOSI hardcoded · dismiss not persisted · ZATCA Phase 2 · API stubs |
| 🟡 Low | 8 | Orphan routes · hardcoded feeds · barcode hardware · duplicate routes |
| 🔵 DB / Schema | 12 | Dead emerging-tech tables |
| 🔵 Backend TODOs | 7 | AI chat · custom reports · widgets · OCR · timeclock · payroll · compliance |

---

# Remediation Status Addendum

**Verification date:** June 10, 2026 (against branch `pr-branch`, post PR #6).

The original audit (June 1–2) preceded a multi-session remediation effort. Many
findings have since been resolved. Current status:

## Resolved ✅

| Original finding | Resolution |
|---|---|
| SA Appointments object-render crash | `Appointments.tsx` renders `vehicleInfo?.make/model/year` safely; global `<ErrorBoundary>` mounted in `App.tsx` |
| Customer Portal data-scope leak (`/api/job-cards`) | Endpoint now scopes to `req.user.garageId`; CUSTOMER role additionally filtered to own `customerId`; single-card GET enforces ownership (404 on mismatch) |
| Customer Invoice PDF download disabled | Button wired to `exportInvoiceToPDF` (jsPDF); works for paid + unpaid invoices |
| GOSI hardcoded 5% | Server-driven via `server/services/saudi-compliance.ts` — Saudi 10%/12%, non-Saudi 0%/2% |
| 10 "broken" nav routes | 9 of 10 are wired; remaining paths are not in the nav config (no 404). `/platform-admin/:tab?` handles all admin sub-paths |
| Unauthenticated backend modules | `requireAuthByDefault` mounted as `/api` default-deny gate; per-route `isAuthenticated` + `requireRole` on sensitive endpoints |
| No security headers / CSRF | `helmet` + CSP + HSTS; `crypto.timingSafeEqual` CSRF compare |
| No production migrations | `npm run db:migrate` runner + Dockerfile entrypoint |
| No automated backup | `scripts/backup-pg-dump.mjs` with retention + daily schedule |
| 8 in-memory route stores | Migrated to Drizzle (leave-requests, QC, backup, documents, kiosk, currency, fleet, scheduling) |

## In progress 🟡 (HR honesty)

| Finding | Current state |
|---|---|
| HR Management 8 mock tabs | Tabs now carry a visible **Beta** banner ("data shown is illustrative, not yet saved"). Full DB-backing is a tracked follow-up. |

## Still open / deferred ⏳

| Finding | Plan |
|---|---|
| Photo/file upload wiring | Milestone 3 — shared `POST /api/uploads` |
| 11 backend stub endpoints | Milestone 3 |
| ZATCA Phase 2 FATOORA submission | Milestone 2 — required before KSA paid launch |
| 12 dead emerging-tech tables | Milestone 4 — drop unused schema |
| Parts Store ephemeral cart | Milestone 3 |

The full remediation roadmap (Milestones 1–4) is maintained in the project plan.

---

*Original audit generated June 2, 2026. Remediation addendum June 10, 2026.*
