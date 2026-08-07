/**
 * Module error boundary (Phase E12) for the garage module. Domain errors render
 * at their declared status with a safe `{ message }` body; anything unexpected
 * becomes a generic 500 that never leaks internals.
 */

import type { ErrorRequestHandler } from 'express';
import { isDomainError } from '../../../infrastructure/errors/domain-errors';

export const garageErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isDomainError(err)) {
    res.status(err.httpStatus).json({ message: err.message });
    return;
  }
  console.error('Unhandled error in garage module:', err);
  res.status(500).json({ message: 'Internal Server Error' });
};
