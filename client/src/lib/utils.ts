import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize an API response to an array. Some endpoints return a bare array,
 * others wrap it as `{ data: [...] }` (paginated) — a list page that assumes an
 * array then crashes with "x.map is not a function" on the wrapped shape.
 * Use as a react-query `select` on list queries: `select: asArray`.
 */
export function asArray<T = any>(d: any): T[] {
  if (Array.isArray(d)) return d as T[];
  if (d && Array.isArray(d.data)) return d.data as T[];
  return [];
}
