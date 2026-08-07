/**
 * Domain error framework (Phase E12 — Error Handling Framework).
 *
 * A single exception hierarchy every layer can throw. Each error carries a
 * stable machine `code`, an HTTP status, optional structured `details`, a
 * `correlationId`, and free-form `context` for structured logging. The HTTP
 * boundary (see ../http/response.ts and the module error handler) turns these
 * into the standard error model without leaking internals.
 *
 * `status` is exposed as an alias of `httpStatus` so the app's existing global
 * error handler (`server/index.ts`, which reads `err.status || err.statusCode`)
 * renders the right code for a domain error even before a module adopts the
 * envelope — preserving current behavior during incremental migration.
 */

export interface ErrorModel {
  /** Stable, machine-readable code, e.g. "NOT_FOUND". */
  code: string;
  /** Human-readable, safe-to-surface message. */
  message: string;
  /** Optional structured detail (e.g. per-field validation issues). */
  details?: unknown;
  /** Request correlation / trace id, when available. */
  correlationId?: string;
}

export interface DomainErrorOptions {
  details?: unknown;
  correlationId?: string;
  context?: Record<string, unknown>;
  cause?: unknown;
}

export abstract class DomainError extends Error {
  /** Stable machine code. */
  abstract readonly code: string;
  /** HTTP status this error maps to at the transport boundary. */
  abstract readonly httpStatus: number;

  readonly details?: unknown;
  correlationId?: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, options: DomainErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    // Subclass constructors run field initializers after super(); name is set
    // from the concrete class for clean logs.
    this.name = new.target.name;
    this.details = options.details;
    this.correlationId = options.correlationId;
    this.context = options.context;
    // Restore the prototype chain broken by extending a built-in across the
    // TS/ES transpile boundary, so `instanceof` works reliably.
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Alias so the legacy global handler (`err.status`) renders the right code. */
  get status(): number {
    return this.httpStatus;
  }

  /** Project to the wire error model, filling in a correlation id if given. */
  toModel(correlationId?: string): ErrorModel {
    const model: ErrorModel = { code: this.code, message: this.message };
    if (this.details !== undefined) model.details = this.details;
    const cid = correlationId ?? this.correlationId;
    if (cid) model.correlationId = cid;
    return model;
  }
}

/** 400 — malformed / invalid input at a boundary. */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly httpStatus = 400;
}

/** 401 — the caller is not authenticated. */
export class AuthenticationError extends DomainError {
  readonly code = 'UNAUTHENTICATED';
  readonly httpStatus = 401;
}

/** 403 — authenticated but not permitted. */
export class AuthorizationError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly httpStatus = 403;
}

/** 404 — the resource does not exist (or is hidden by tenant scoping). */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly httpStatus = 404;
}

/** 409 — the request conflicts with current state (e.g. unique clash). */
export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
  readonly httpStatus = 409;
}

/** 422 — a business invariant/rule was violated. */
export class BusinessRuleError extends DomainError {
  readonly code = 'BUSINESS_RULE_VIOLATION';
  readonly httpStatus = 422;
}

/** 500 — an infrastructure dependency failed (DB, queue, provider). */
export class InfrastructureError extends DomainError {
  readonly code = 'INFRASTRUCTURE_ERROR';
  readonly httpStatus = 500;
}

export function isDomainError(err: unknown): err is DomainError {
  return err instanceof DomainError;
}
