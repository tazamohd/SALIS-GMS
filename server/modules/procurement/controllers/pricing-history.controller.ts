/**
 * Pricing-history controller (Phase E2). Thin HTTP adapter; preserves the raw
 * list-by-part read and 201-on-create.
 */

import type { Request, Response } from 'express';
import type { PricingHistoryService } from '../services/pricing-history.service';

export function makePricingHistoryController(service: PricingHistoryService) {
  return {
    async getBySparePart(req: Request, res: Response): Promise<void> {
      res.json(await service.getBySparePart(req.params.sparePartId));
    },
    async create(req: Request, res: Response): Promise<void> {
      res.status(201).json(await service.create(req.body));
    },
  };
}

export type PricingHistoryController = ReturnType<typeof makePricingHistoryController>;
