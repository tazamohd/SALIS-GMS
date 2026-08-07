# ADR-0003: Architecture Governance & Boundaries

**Status:** Accepted · **Phase:** E14

## Context

Layered boundaries erode without enforcement. Once modules exist, the failure
mode is a controller quietly importing `storage`, or one module importing another
module's repository — reintroducing the coupling the architecture removes.

## Decision

Enforce the rules mechanically, not by convention:

1. **Controllers and services must not import the data layer** (`storage`/`db`)
   directly — they go through a repository.
2. **No module may import another module's repository.** Cross-module interaction
   happens through services or published interfaces/events; the composition root
   is the only place that wires repositories.
3. New endpoints require validation, authorization, and (for new surface) the
   standard response envelope.
4. New modules follow the prescribed folder structure.
5. Significant design changes get an ADR.

**Enforcement:**
- `scripts/check-architecture.mjs` (`npm run lint:arch`) — dependency-free static
  check that fails CI on rules 1–2. Scoped to `server/modules/**` so the legacy
  monolith is not flagged while it is being retired.
- ESLint `no-restricted-imports` surfaces rule 1 at edit time.

## Consequences

- Boundary violations fail fast in CI and in the editor.
- The check is intentionally narrow (new modules only) so it can be adopted
  immediately without a repo-wide cleanup; its scope widens as domains migrate.
- Governance is executable and reviewable, not tribal knowledge.
