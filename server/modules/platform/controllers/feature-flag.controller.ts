/**
 * Feature-flag controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy contract of
 * `server/routes/feature-flags.ts`: list/get/create/patch/delete with the exact
 * status codes and `{ message }` bodies. Existence failures surface from the
 * service as `NotFoundError` (→ 404 "Feature flag not found") and the missing
 * `flagName` as `ValidationError` (→ 400 "flagName is required"); anything else
 * maps to the per-handler 500. Auth (401) is enforced by the route middleware.
 * No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import {
  NotFoundError,
  ValidationError,
} from '../../../infrastructure/errors/domain-errors';
import type { FeatureFlagService } from '../services/feature-flag.service';

function garageOf(req: Request): string {
  return (req.user as { garageId?: string } | undefined)?.garageId as string;
}

export function makeFeatureFlagController(service: FeatureFlagService) {
  const guard =
    (fn: (req: Request, res: Response) => Promise<void>, failMsg: string) =>
    async (req: Request, res: Response): Promise<void> => {
      try {
        await fn(req, res);
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.status(404).json({ message: error.message });
          return;
        }
        if (error instanceof ValidationError) {
          res.status(400).json({ message: error.message });
          return;
        }
        console.error(`${failMsg}:`, error);
        res.status(500).json({ message: failMsg });
      }
    };

  return {
    list: guard(async (req, res) => {
      res.json(await service.list(garageOf(req)));
    }, 'Failed to fetch feature flags'),

    get: guard(async (req, res) => {
      res.json(await service.get(req.params.id, garageOf(req)));
    }, 'Failed to fetch feature flag'),

    create: guard(async (req, res) => {
      const flag = await service.create(garageOf(req), req.body ?? {});
      res.status(201).json(flag);
    }, 'Failed to create feature flag'),

    update: guard(async (req, res) => {
      const flag = await service.setEnabled(req.params.id, garageOf(req), req.body?.isEnabled);
      res.json(flag);
    }, 'Failed to update feature flag'),

    remove: guard(async (req, res) => {
      const flag = await service.remove(req.params.id, garageOf(req));
      res.json({ message: 'Feature flag deleted', flag });
    }, 'Failed to delete feature flag'),
  };
}

export type FeatureFlagController = ReturnType<typeof makeFeatureFlagController>;
