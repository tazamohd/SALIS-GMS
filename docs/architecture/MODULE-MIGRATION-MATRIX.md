# Module Migration Matrix

**Phase E — Domain extraction status.** Snapshot as of the `platform` increment
(PR #108). "Extracted" = a layered module under `server/modules/<domain>/` owns
the surface, the legacy route file / monolith block is deleted, and behavior is
verified byte-for-byte.

## Legend

- ✅ **Extracted** — layered module owns the surface; legacy removed; tests green.
- 🟡 **Partial** — core extracted; named sub-surfaces deliberately deferred (see notes).
- ⬜ **Monolith** — still served from `server/routes.ts` / `server/storage.ts`.

## Extracted domains (22 modules)

Every module below has the identical internal structure —
`controllers/ · services/ · repositories/ · index.ts · __tests__/` — and passes
`lint:arch` (no controller/service touches the data layer; no cross-module
repository import).

| # | Domain | Module | Status | Data-layer seam | Notes |
|---|--------|--------|--------|-----------------|-------|
| 1 | Customers | `customers` | ✅ | `storage` | Reference domain; publishes `customer.*` events |
| 2 | Vehicles | `vehicles` | ✅ | `storage` | List + `/vehicles/:id/*` reads; ownership guard preserved |
| 3 | Appointments | `appointments` | ✅ | `storage` | Tenant-pinned list + by-id 404 |
| 4 | Garage | `garage` | ✅ | `storage` | Garages/branches + role catalog; manager/ownership guards |
| 5 | Job cards | `jobcards` | ✅ | `storage` + Drizzle | `/parts` Drizzle query absorbed into repo |
| 6 | Estimates | `estimates` | ✅ | `storage` + SQL | First monolith extraction; `estimate.converted_*` events |
| 7 | Invoices | `invoices` | ✅ | `storage` + SQL | 184-line `from-job` calc; `invoice.created` events |
| 8 | Payments | `payments` | ✅ | `storage` | Atomic record/reverse; `payment.*` events — financial core |
| 9 | Inventory | `inventory` | ✅ | `storage` + SQL | Spare-parts, dashboards, stock-alerts, audit-trail, transfers |
| 10 | Suppliers | `suppliers` | ✅ | `storage` | Suppliers + price lists/compare |
| 11 | Procurement | `procurement` | ✅ | `storage` | POs + tasks, deliveries, reorder-settings, pricing-history (incl. writes) |
| 12 | CRM | `crm` | ✅ | `db.execute(sql)` | Customer-360 read model; tier/segment/loyalty/retention math |
| 13 | Insurance | `insurance` | ✅ | `phase6-compliance-service` | Claims CRUD + trailing-year analytics |
| 14 | Fleet | `fleet` | ✅ | `storage` | Fleet-accounts surface + analytics roll-ups |
| 15 | Fleet-management | `fleet-management` | ✅ | `storage` | 25 endpoints — groups/vehicles/contracts/pricing/maintenance CRUD |
| 16 | Fleet-tracking | `fleet-tracking` | ✅ | `storage` | 12 endpoints — telemetry, geofences, routes — fleet fully modularized |
| 17 | HR / Payroll | `hr` | ✅ | raw SQL + `storage` | Directory, Saudi-compliance, attendance, leave, payroll |
| 18 | Reports | `reports` | ✅ | aggregate SQL | Revenue/technician/turnover/customer/executive |
| 19 | Analytics | `analytics` | ✅ | `analytics-service` + BI | `/api/analytics/*` — performance/dashboard/profit/LTV/heat-maps |
| 20 | AI | `ai` | ✅ | BI + OpenAI SDK | Insights/forecasts, PRO predictions, ENTERPRISE repair-guide |
| 21 | Platform / Admin | `platform` | ✅ | Drizzle | Feature-flag CRUD (first administration slice) |

> Fleet is counted as one domain delivered across three modules (`fleet`,
> `fleet-management`, `fleet-tracking`), so the table shows 21 rows for 22
> module directories.

## Deferred sub-surfaces (🟡 partial)

Extracted at the core, with named follow-ons still in the monolith:

| Domain | Deferred surface | Rationale |
|--------|------------------|-----------|
| Marketplace | Authenticated parts search/orders/track + `/my/reviews` submission | Public discovery reads extracted; write-path is a separate slice |
| AI | The 26 monolith `/api/ai/*` endpoints (chatbot, diagnostics, etc.) | The three standalone route files consolidated first |
| Platform / Admin | System health, backup, subscriptions, feature administration | Feature-flags extracted first; broader admin surfaces next |

## Not yet started (⬜ monolith)

The bulk of `server/routes.ts` (**~1,035 endpoints remain**) is still served by
the legacy monolith and its `storage` facade, including (non-exhaustive):
scheduling, notifications, documents, gamification, training/LMS, quality
control, WhatsApp/SMS/GMB integrations, kiosk, gate-pass, tax-config, currency,
support tickets, customer/supplier portals, quotations, warranty, and the
command centre.

See the **Technical Debt Report** for the full remaining surface and the
**Execution Plan** for the intended sequence.

## Summary

| Metric | Value |
|--------|-------|
| Domain modules extracted | 22 directories (21 domains) |
| Internal-structure consistency | 22/22 (`controllers/service/repository/index/tests`) |
| DI token pairs registered | 29 repository/service pairs (+ event bus) |
| Monolith endpoints remaining (`routes.ts`) | ~1,035 |
| Architecture-governance violations | 0 (`npm run lint:arch`) |
