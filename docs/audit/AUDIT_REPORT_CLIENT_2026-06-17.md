# SalisAuto GMS — Client (Frontend) & a11y Audit
**Date:** 2026-06-17 · **Method:** multi-agent client audit (142 agents, 13 feature-area buckets, verified). Companion to `AUDIT_REPORT_2026-06-17.md`.

> **Coverage note:** 13 of 14 buckets completed; the `layouts-shared-components` bucket failed on a transient socket error (residual gap — re-run separately). Severity: **0 Critical, 18 High, 58 Medium, 30 Low (106)**.

## 1. Executive Summary

**Dominant theme — `apiRequest` argument-order inversion (functionally Critical in aggregate).** The helper is `apiRequest(method, url, data)` but **13 call sites across 11 files** pass `(url, method, data)`. At runtime `fetch()` gets the URL as the HTTP method → every affected mutation 404s. Broken: appointment booking, technician clock-in/out, parts quotation, accounting connect/sync, spare-parts create, auto-reorder, customer feedback/reviews, email campaigns, contract renewal, live service tracking, vehicle walkaround, voice commands, OBD diagnostics, timeclock/payroll. Several were hidden by `// @ts-nocheck` headers.

**Second theme — Arabic-market readiness gap.** Whole areas (technician/*, purchase-agent/*, parts-network/*, several customer/* and finance pages, `SaudiComplianceDashboard`, `AdvancedReports`) bypass `react-i18next` entirely; physical-direction Tailwind classes (`mr-/ml-/pl-/pr-/text-left/right/left-`) used across ≥25 files break RTL mirroring.

**Third theme — silent failure.** ~21 mutations/queries lack `onError`/`isError`, so server failures render as empty/stale UI (acute in finance, Security 2FA/GDPR, compliance flows).

## 2. High (18)

### apiRequest arg-order (swap first two args → `apiRequest("POST", "/api/...", data)`)
| # | Location | Broken op |
|---|----------|-----------|
| H1 | `mobile/CustomerMobileBooking.tsx:28` | Appointment booking |
| H2 | `mobile/TechnicianMobileClock.tsx:31-38` | Clock in/out |
| H3 | `parts-network/SendQuotationRequest.tsx:86` | Quotation (also wrong 3rd arg; `@ts-nocheck`) |
| H4 | `AccountingIntegration.tsx:43,53` | Connect + sync |
| H5 | `SpareParts.tsx:136` | Spare-part create |
| H6 | `PartsAutoReorder.tsx:24` | Check reorders |
| H7 | `CustomerFeedback.tsx:110,131,152,174,197` | All 5 feedback mutations |
| H8 | `CustomerReviewsRatings.tsx:29` | Review response |
| H9 | `EmailMarketingCampaigns.tsx:27,38` | Create + send campaign |
| H10 | `ContractManagement.tsx:47` | Trigger-renewal (L59 correct — proves drift) |
| H11 | `LiveServiceTracking.tsx:48` | Tracking update |
| H12 | `DigitalVehicleWalkaround.tsx:36` | Walkaround create |
| H13 | `VoiceCommands.tsx:99` + `DiagnosticsOBDHub.tsx:42,47` | Voice + OBD mutations |
| H14 | `TimeClockPayroll.tsx:32,47,62` | Clock-in/out, payroll |

### Other High
- **H15** `mobile/TechnicianMobilePortal.tsx:250-262` — fake clock-in via `setTimeout`, no API call; state lost on refresh.
- **H16** `TimeClockPayroll.tsx:162` — Process Payroll button inert (no onClick/mutation/disabled).
- **H17** `Profile.tsx:25-39` — save/change-password handlers are no-ops (uncontrolled inputs, toast only, no API).
- **H18 (security, release-blocker)** `KnowledgeBase.tsx:393-395` — `window.open(doc.fileUrl)` on API data with no scheme check → stored `javascript:`/`data:` XSS. Validate scheme + `noopener,noreferrer`.

## 3. Medium & Low (88) — by category

**react-bug (21):** dead-stub forms (`CostCenters.tsx:189`, `EmailMarketingCampaigns.tsx:153` hardcoded submit), `CustomerLTVAnalysis.tsx:47` fetches then discards query (charts hardcoded), `VehicleHistory.tsx:29` mock queryFn never calls API, `AppointmentReminders.tsx:464-497` four Switches with no `onCheckedChange`, `TireManagement.tsx` 4 buttons no onClick, `client/ReviewChat.tsx:21` shared rating state across all cards, `technician/TimeClock.tsx:29` clock never ticks, index-as-key on server lists (10+ sites), `ContractManagement.tsx:422` hard `window.location` reload.

**error-handling (21):** missing `onError` on state-changing mutations incl. finance (`ExpenseTracking` approve/reject) and security/legal (`Security.tsx` disable-2FA, backup/restore, GDPR request/consent, permission override/delete); missing `isError` UI on many queries; `Security.tsx:261` raw `fetch().json()` without `r.ok`.

**a11y (23):** icon-only buttons without `aria-label` across ≥15 files; star-rating/form-label association gaps (`ReviewChat`, `ServiceHistory`, `Security`); clickable `<div>` rows/cards/camera tiles with no keyboard role (`VehicleTracking`, `ServiceGuides`, `SecurityCameras`); blocking `alert()`/`prompt()` (`BarcodeScanner`, `TechnicianMobileLookup`, `GoogleMyBusiness`, `AppointmentReminders`); color-only status (`CustomerMobileHome`, `ExpenseTracking`).

**i18n-rtl (24):** wholesale i18n bypass — entire technician/purchase-agent/parts-network areas, customer/* portal pages, `SaudiComplianceDashboard` (100% English — worst case), `AdvancedReports`, `InternalWarehouse`, `QualityControl`; inverted bug — `CustomerFeedback` SentimentBadge hardcodes Arabic; raw DB enums untranslated; `KPIDashboard`/`Reports` `en-US` formatting; `VoiceCommands.tsx:41` `lang='en-US'` ignores locale; physical-direction classes across ≥25 files.

**security (2):** H18 above; `parts-network/NetworkOrders.tsx:293` API `trackingUrl` in `href` with no scheme validation.

**hooks (8):** `Chat.tsx` leaked typing-timer + mark-as-read on every message; `AutomatedReordering.tsx:431` hooks mid-body; effect-for-derived-state (`AIChatbotAssistant`); missing exhaustive-deps.

**performance (3):** unconditional `refetchInterval` (`client/LiveTracking.tsx:17`), 5s background chat poll no back-off (`ReviewChat.tsx:34`), `sort()` mutating derived array in render (`TechnicianPerformance.tsx:81`).

**other:** purchase-agent pages render `mock*` arrays as live data with no-op actions; `console.log` leaks (CostCenters payload incl. budget); `@ts-nocheck` on 4 files masked the H3 apiRequest bug.

## 4. a11y / RTL Readiness Verdict — Arabic Market

**NOT READY.** i18n coverage structurally incomplete (whole surfaces opt out, incl. the flagship `SaudiComplianceDashboard`); RTL visibly breaks (physical-direction classes ≥25 files; `en-US` number/date; Arabic voice forced through `en-US`); a11y below WCAG 2.1 AA (icon labels 4.1.2, keyboard operability 2.1.1, label association 1.3.1, blocking dialogs, color-only 1.4.1). Do not ship to the Arabic market until: (1) the 13 `apiRequest` bugs fixed, (2) i18n bypass closed across technician/purchase-agent/parts-network + `SaudiComplianceDashboard`, (3) physical→logical class migration, (4) WCAG-blocking a11y remediated, (5) the two unvalidated-URL findings fixed. Items 2-4 are large but mechanical; item 1 is small and urgent.
