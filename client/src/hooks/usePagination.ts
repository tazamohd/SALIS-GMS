/**
 * Pagination hook — pairs with the server `parsePagination` middleware and the
 * `PaginationControls` component. Tracks page/limit, exposes navigation
 * helpers, and produces a `queryParams` string to append to API calls.
 *
 *   const pg = usePagination({ initialLimit: 25 });
 *   const { data } = useQuery({ queryKey: [`/api/job-cards?${pg.queryParams}`] });
 *   // on response: pg.updateFromResponse(data)
 *
 * Vetted from the platform audit fix package.
 */
import { useState, useCallback, useEffect } from "react";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number, limit: number) => void;
}

interface UsePaginationReturn {
  pagination: PaginationState;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  updateFromResponse: (response: { pagination: PaginationState }) => void;
  queryParams: string;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPage = 1, initialLimit = 25, onPageChange } = options;

  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination((prev) => (prev.hasNext ? { ...prev, page: prev.page + 1 } : prev));
  }, []);

  const prevPage = useCallback(() => {
    setPagination((prev) => (prev.hasPrev ? { ...prev, page: prev.page - 1 } : prev));
  }, []);

  const firstPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const lastPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: prev.totalPages || 1 }));
  }, []);

  const updateFromResponse = useCallback((response: { pagination: PaginationState }) => {
    setPagination((prev) => ({ ...prev, ...response.pagination }));
  }, []);

  const queryParams = `page=${pagination.page}&limit=${pagination.limit}`;

  useEffect(() => {
    if (onPageChange) onPageChange(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit, onPageChange]);

  return { pagination, setPage, setLimit, nextPage, prevPage, firstPage, lastPage, updateFromResponse, queryParams };
}

export default usePagination;
