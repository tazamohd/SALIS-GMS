/**
 * Pagination middleware + helpers.
 *
 * `parsePagination` reads `?page=&limit=` (clamped to a safe max) into
 * `req.pagination`; `buildPaginatedResponse` wraps a result set with page
 * metadata; `applyPaginationToQuery` adds limit/offset to a Drizzle query.
 *
 *   router.get("/api/job-cards", parsePagination, async (req, res) => {
 *     const { limit, offset, page } = (req as any).pagination;
 *     const [rows, total] = await Promise.all([
 *       storage.getJobCards(garageId, { limit, offset }),
 *       storage.getJobCardCount(garageId),
 *     ]);
 *     res.json(buildPaginatedResponse(rows, total, (req as any).pagination));
 *   });
 *
 * Addresses the audit finding "no pagination on list endpoints (500+ rows in
 * memory)". Vetted from the platform audit fix package.
 */
import type { Request, Response, NextFunction } from "express";

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 25,
  maxLimit: 100,
};

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function parsePagination(req: Request, _res: Response, next: NextFunction): void {
  const page = Math.max(1, parseInt(req.query.page as string) || PAGINATION_DEFAULTS.page);
  const limit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(1, parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.limit),
  );
  const offset = (page - 1) * limit;
  (req as any).pagination = { page, limit, offset } as PaginationParams;
  next();
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pagination.limit);
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
}

export function applyPaginationToQuery<Q extends { limit: (n: number) => any; offset: (n: number) => any }>(
  query: Q,
  pagination: PaginationParams,
): any {
  return query.limit(pagination.limit).offset(pagination.offset);
}

export default { parsePagination, buildPaginatedResponse, applyPaginationToQuery, PAGINATION_DEFAULTS };
