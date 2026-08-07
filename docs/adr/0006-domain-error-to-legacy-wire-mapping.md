# ADR-0006: Domain-Error → Legacy Wire Mapping

**Status:** Accepted · **Phase:** E2/E10/E12

## Context

ADR-0002 introduced a `DomainError` hierarchy (NotFound → 404, Validation →
400, Authorization → 403, Conflict → 409, …) and a standard response envelope.
But ADR-0005 requires extracted domains to preserve the **legacy wire shape**
exactly — and the legacy handlers return bespoke bodies like
`{ message: "Feature flag not found" }`, not the new envelope. These two goals
must coexist: clean internal error semantics without changing the bytes on the
wire for migrated endpoints.

## Decision

Services speak **domain errors**; controllers **translate** them to the legacy
wire shape.

- A service throws a semantic error carrying the legacy message, e.g.
  `throw new NotFoundError('Feature flag not found')`. It never sets a status
  code or touches `res`.
- The controller is a thin adapter with a small `guard` wrapper that maps error
  *type* → status and renders the legacy body:

  ```ts
  if (error instanceof NotFoundError)   res.status(404).json({ message: error.message });
  else if (error instanceof ValidationError) res.status(400).json({ message: error.message });
  else { console.error(`${failMsg}:`, error); res.status(500).json({ message: failMsg }); }
  ```

- The per-handler 500 message is a constant owned by the controller, matching
  the exact string the legacy `catch` block logged/returned.
- Auth (401) stays on the route middleware (`isAuthenticated`), which already
  emits the legacy `{ message: "Unauthorized" }` body.
- The new response envelope (`infrastructure/http/response.ts`) is adopted only
  for **new or opt-in** endpoints, never retrofitted onto a migrated contract.

## Consequences

- **+** Internal code is expressed in clean domain terms; HTTP concerns live
  only in the controller.
- **+** Wire compatibility is preserved endpoint-by-endpoint, so clients never
  observe the migration.
- **+** The mapping is uniform across modules, so a reviewer checks one small
  wrapper rather than re-reading every handler's error branches.
- **−** Two representations of "the same" failure coexist during migration (the
  legacy `{ message }` for migrated endpoints, the envelope for new ones). A
  future phase can unify them behind a versioned API once all callers move.
- **−** The legacy 500 strings are duplicated as controller constants; the
  meta-tests assert them so drift is caught.
