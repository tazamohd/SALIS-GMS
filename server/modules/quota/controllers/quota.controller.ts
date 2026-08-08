/**
 * Quota controller (Phase D.1 / LIC-2). Thin HTTP adapter for the entitlement
 * quota status surface. No business rules, no data access.
 */

import type { Request, Response } from 'express';
import type { QuotaService } from '../services/quota.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}

export function makeQuotaController(service: QuotaService) {
  return {
    async status(req: Request, res: Response): Promise<void> {
      const garageId = garageOf(req);
      if (!garageId) {
        res.status(400).json({ message: 'No garage associated with this account' });
        return;
      }
      try {
        res.json({ garageId, resources: await service.status(garageId) });
      } catch (error) {
        console.error('Error loading quota status:', error);
        res.status(500).json({ message: 'Failed to load quota status' });
      }
    },
  };
}

export type QuotaController = ReturnType<typeof makeQuotaController>;
