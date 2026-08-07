/**
 * Shared Zod validation-error formatting (Phase E9).
 *
 * A single definition of the `{ message, errors: [{ field, message }] }` shape
 * the API returns for invalid input, reused by the legacy monolith and the new
 * modules so validation responses stay identical everywhere.
 */

import type { z } from 'zod';

export function sanitizeZodError(error: z.ZodError) {
  return {
    message: 'Validation failed',
    errors: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

export function sanitizeArrayValidationErrors(
  invalidItems: Array<{ success: false; error: z.ZodError }>,
) {
  return {
    message: 'Validation failed',
    errors: invalidItems.flatMap((v) =>
      v.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    ),
  };
}
