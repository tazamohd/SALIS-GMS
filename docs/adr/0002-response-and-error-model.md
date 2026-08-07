# ADR-0002: Standard Response Envelope & Error Model

**Status:** Accepted · **Phase:** E10, E12

## Context

Endpoints return ad-hoc shapes (raw arrays, raw objects, `{ message }` errors,
and a `{ data, pagination }` envelope for opt-in paging). Error handling is
inconsistent and some paths risk leaking internal error text.

## Decision

Define one **success/error envelope** and one **domain error hierarchy**:

```
success:  { success: true,  data, meta?, traceId? }
error:    { success: false, error: { code, message, details?, correlationId? }, traceId? }
```

- `server/infrastructure/errors/domain-errors.ts` — `DomainError` subclasses map
  a stable machine `code` and HTTP status; unknown errors become a generic 500
  that never leaks the underlying message.
- `server/infrastructure/http/response.ts` — envelope builders + `sendSuccess` /
  `sendError`.
- Domain errors expose `status` (alias of `httpStatus`) so the existing global
  handler renders the correct code even before a module adopts the envelope.

**Backward compatibility:** existing endpoints keep their current wire shapes.
The envelope is the standard for **new or opt-in** endpoints; retrofitting
existing contracts is a coordinated, client-aware change gated behind API
versioning — not a silent shape change. The migrated `customers` module therefore
preserves its legacy shapes exactly, while its module-scoped error boundary uses
the domain error types internally.

## Consequences

- Predictable contracts and safe errors for all new surface area.
- No client breakage during migration.
- A clear, versioned path to converge legacy endpoints onto the envelope later.
