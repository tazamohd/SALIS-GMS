// @ts-nocheck
import type { Request, Response, NextFunction } from "express";

interface CacheEntry {
  body: unknown;
  statusCode: number;
  headers: Record<string, string>;
  expiresAt: number;
  lastAccessed: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_ENTRIES = 1000;

function evictIfNeeded(): void {
  if (cache.size < MAX_ENTRIES) return;

  let oldestKey: string | null = null;
  let oldestAccess = Infinity;

  for (const [key, entry] of cache) {
    if (entry.lastAccessed < oldestAccess) {
      oldestAccess = entry.lastAccessed;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    cache.delete(oldestKey);
  }
}

export function cacheMiddleware(ttlSeconds: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== "GET") {
      return next();
    }

    const key = req.originalUrl;
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && cached.expiresAt > now) {
      cached.lastAccessed = now;
      for (const [header, value] of Object.entries(cached.headers)) {
        res.setHeader(header, value);
      }
      res.status(cached.statusCode).json(cached.body);
      return;
    }

    if (cached) {
      cache.delete(key);
    }

    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        evictIfNeeded();
        cache.set(key, {
          body,
          statusCode: res.statusCode,
          headers: { "content-type": "application/json" },
          expiresAt: now + ttlSeconds * 1000,
          lastAccessed: now,
        });
      }
      return originalJson(body);
    } as Response["json"];

    next();
  };
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}
