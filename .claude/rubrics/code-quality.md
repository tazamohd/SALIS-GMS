# Rubric: Code Quality

The bar an adversarial reviewer holds a SALIS-GMS work unit to. A unit passes only
when **every** blocker is resolved.

## Blockers (must fix)

- `npm run check` has errors, or `any`/`@ts-ignore` used to silence a real type bug.
- A test is missing for new domain logic or a fixed bug, or tests don't actually
  exercise the new behavior.
- Tenant isolation broken: a tenant-scoped query without `garageId` filtering.
- Missing/incorrect RBAC permission check on a protected route.
- Duplicated domain math instead of reusing `shared/*Utils.ts` (VAT/ZATCA/Hijri/Zakat).
- New backend route added to legacy `server/routes.ts` instead of modular
  `server/routes/` without justification.
- Edit to a vendor-locked file (`server/paypal.ts`) or a secret committed.
- Change leaks outside the work unit's declared file scope.

## Major (fix or justify)

- Input not validated with a (preferably shared) Zod schema.
- Error paths unhandled or returning wrong status codes.
- Coverage regresses below `.coverage-thresholds.json`.
- UI breaks the dark-theme/grayscale convention, archetype layout usage, or RTL/i18n.
- Inconsistent with neighboring code (naming, structure, error handling).

## Minor (note)

- Missing/format-only lint issues, dead code, unclear names, absent comments where the
  surrounding code comments.

## Evidence

Every finding cites `file:line`. Every "passes" claim is backed by a command actually
run (`npm run check`, `npm test ...`, `npm run coverage:gate`).
