/**
 * Quota enforcement middleware (Phase D.1 / LIC-2).
 *
 * `enforceQuota(resource)` blocks a create when the caller's garage has reached
 * its effective limit (license override ?? plan default). It is FAIL-OPEN: a
 * garage-less caller, an unlimited resource, an untracked metric, or any
 * unexpected error all fall through to `next()` — so adding it to a route can
 * never break an existing flow, only cap a limited one.
 */

import type { Request, Response, NextFunction } from 'express';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { QUOTA_SERVICE } from '../../infrastructure/di/tokens';
import type { QuotaResource } from './services/quota.service';

export function enforceQuota(resource: QuotaResource) {
  return async function quotaGuard(req: Request, res: Response, next: NextFunction): Promise<void> {
    const garageId = (req.user as { garageId?: string } | undefined)?.garageId;
    if (!garageId) return next();
    try {
      const result = await getAppContainer().resolve(QUOTA_SERVICE).check(resource, garageId);
      if (!result.ok) {
        res.status(403).json({
          message: `You have reached your ${resource} limit (${result.used}/${result.limit}) for your current plan. Upgrade or contact support.`,
          resource,
          limit: result.limit,
          used: result.used,
        });
        return;
      }
      next();
    } catch (error) {
      // Fail-open: enforcement must never take down a working create path.
      console.error(`Quota check failed for ${resource} (fail-open):`, error);
      next();
    }
  };
}
