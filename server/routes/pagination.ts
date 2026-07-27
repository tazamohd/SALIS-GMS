/**
 * Pagination utilities for list endpoints
 *
 * Provides consistent pagination across all list endpoints:
 * - Reads `limit` and `offset` from query params with defaults and caps
 * - Returns { data, total, limit, offset } envelope
 * - Validates inputs to prevent abuse
 */

import type { Request, Response } from 'express';

export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 500;

export interface PaginationParams {
  limit: number;
  offset: number;
  explicit: boolean;
}

/**
 * Parse pagination from request query.
 * Returns validated, clamped values, plus whether client sent explicit params.
 */
export function parsePagination(req: Request): PaginationParams {
  const rawLimit = parseInt(req.query.limit as string, 10);
  const rawOffset = parseInt(req.query.offset as string, 10);
  const rawPage = parseInt(req.query.page as string, 10);

  const explicit =
    Number.isFinite(rawLimit) || Number.isFinite(rawOffset) || Number.isFinite(rawPage);

  let limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  // ?page is 1-based sugar over offset; an explicit offset wins when both are sent.
  let offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;
  if (!Number.isFinite(rawOffset) && Number.isFinite(rawPage) && rawPage > 0) {
    offset = (rawPage - 1) * limit;
  }

  return { limit, offset, explicit };
}

/**
 * Send a paginated response.
 * - When client sends pagination params (limit/offset), returns envelope `{ data, pagination }`
 * - When no pagination params, returns plain array (backward compatibility for existing clients)
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  params: PaginationParams,
  explicitPagination: boolean
): void {
  if (explicitPagination) {
    res.json({
      data,
      pagination: {
        total,
        limit: params.limit,
        offset: params.offset,
        page: Math.floor(params.offset / params.limit) + 1,
        hasMore: params.offset + data.length < total,
      },
    });
  } else {
    // Legacy: return plain array (backward compatibility)
    res.json(data);
  }
}

/**
 * Parse sort field and direction from query params.
 * Whitelists allowed sort fields to prevent SQL injection.
 */
export function parseSort<T extends string>(
  req: Request,
  allowedFields: readonly T[],
  defaultField: T,
  defaultDir: 'asc' | 'desc' = 'desc'
): { field: T; direction: 'asc' | 'desc' } {
  const rawField = req.query.sortBy as string;
  const rawDir = (req.query.sortDir as string)?.toLowerCase();

  const field = (allowedFields as readonly string[]).includes(rawField) ? (rawField as T) : defaultField;
  const direction: 'asc' | 'desc' = rawDir === 'asc' || rawDir === 'desc' ? (rawDir as 'asc' | 'desc') : defaultDir;

  return { field, direction };
}