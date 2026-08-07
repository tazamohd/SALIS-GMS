/**
 * Module error boundary (Phase E12) for the invoice module. Domain errors render
 * at their declared status with a safe `{ message }` body (preserving the legacy
 * 404 / 400 responses); anything unexpected becomes a generic 500 that never
 * leaks internals.
 */

import type { ErrorRequestHandler } from 'express';
import { isDomainError } from '../../../infrastructure/errors/domain-errors';

export const invoiceErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isDomainError(err)) {
    res.status(err.httpStatus).json({ message: err.message });
    return;
  }
  console.error('Unhandled error in invoices module:', err);
  res.status(500).json({ message: 'Internal Server Error' });
};
