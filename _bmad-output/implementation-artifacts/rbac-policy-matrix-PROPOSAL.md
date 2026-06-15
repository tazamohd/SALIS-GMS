# PROPOSED RBAC Policy Matrix (Story 3.2) — for approval

**Status: PROPOSAL — not implemented.** Approve / adjust, then I'll enforce it incrementally
(module-by-module, CI between each). Roles are the coarse `users.role` set
(`ADMIN` always allowed via the existing `requireRole` ADMIN-bypass).

Reads stay authenticated + tenant-scoped (Epic 1) — this matrix governs **mutations**
(POST/PUT/PATCH/DELETE), where 758/767 currently have no role guard.

## Proposed required-roles by resource × action

| Resource group | create/update | delete | Notes |
|---|---|---|---|
| **Job cards, tasks, tracking, ETA** | ADVISOR, MANAGER | MANAGER | core ops; technicians via own-assignment endpoints |
| **Appointments / scheduling** | ADVISOR, MANAGER | MANAGER | |
| **Customers, vehicles** | ADVISOR, MANAGER | MANAGER | |
| **Invoices, payments, estimates, refunds** | ACCOUNTANT, MANAGER | ACCOUNTANT | financial |
| **Purchase orders, suppliers** | MANAGER | MANAGER | procurement |
| **Inventory / spare parts / tools** | MANAGER | MANAGER | |
| **HR / payroll / commissions / attendance** | ACCOUNTANT, MANAGER | ADMIN | sensitive |
| **Reports / exports (CSV, report)** | MANAGER | — | already `requireAdmin` on export; widen to MANAGER? |
| **Settings / config / feature flags** | ADMIN | ADMIN | |
| **User & role management, RBAC** | ADMIN | ADMIN | |
| **Security / 2FA (own account)** | self (any authenticated) | self | scoped to req.user |
| **Impersonation** | SUPER_ADMIN | — | already enforced (Story 5.2/5.3) |
| **auth: register/login/logout** | public / self | — | no role guard (unchanged) |

(`ADMIN` implicitly allowed everywhere via the requireRole bypass.)

## Open questions before enforcement
1. Is the coarse 5-role model (`ADMIN/MANAGER/ADVISOR/TECHNICIAN/ACCOUNTANT`) the right axis, or should enforcement use the **seeded fine-grained `permissions`** (resource:action) instead? The codebase has both.
2. Should TECHNICIAN be able to mutate job cards generally, or only ones assigned to them (own-record scoping)?
3. Exports — keep ADMIN-only, or allow MANAGER?

## Rollout plan once approved
- Build `server/authz/policy-registry.ts` mapping route patterns → required roles per this matrix.
- Apply `requireRole(...)` per module (job-cards → invoices → inventory → HR → admin), running the full CI suite after each module so any over-restriction surfaces immediately.
- Seed test users with appropriate roles so CI reflects real enforcement.
- Track coverage in `rbac-coverage-report.md` (target: 0 unguarded privileged mutations).

### References
- [Source: rbac-coverage-report.md; epics.md#Story 3.2; architecture.md#AD-6; authorization-matrix answers 2026-06-13/14]
