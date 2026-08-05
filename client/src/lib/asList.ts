/**
 * Normalize a list response to a plain array.
 *
 * The paginated list endpoints (server/routes/pagination.ts) return a bare
 * array when the caller sends no pagination params, but a `{ data, pagination }`
 * envelope when it does. Pages that don't paginate must tolerate both shapes —
 * use this as a TanStack Query `select` so downstream code always sees an array.
 */
export function asList<T = unknown>(x: unknown): T[] {
  if (Array.isArray(x)) return x as T[];
  if (x && typeof x === "object" && Array.isArray((x as { data?: unknown }).data)) {
    return (x as { data: T[] }).data;
  }
  return [];
}
