/**
 * Module error boundary (Phase E12 — Error Handling Framework).
 *
 * Scoped Express error middleware for the customer module. Domain errors render
 * at their declared status with a safe `{ message }` body (matching the legacy
 * contract, e.g. 404 `{ message: "Customer not found" }`); anything unexpected
 * becomes a generic 500 that never leaks internals, with the full error logged
 * for diagnosis. Mounting this per-module keeps the boundary local and leaves
 * the global handler untouched.
 */

import type { ErrorRequestHandler } from 'express';
import { isDomainError } from '../../../infrastructure/errors/domain-errors';

export const customerErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isDomainError(err)) {
    res.status(err.httpStatus).json({ message: err.message });
    return;
  }
  console.error('Unhandled error in customers module:', err);
  res.status(500).json({ message: 'Internal Server Error' });
};
