/**
 * Tax controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the tax-regions domain. Preserves the legacy monolith
 * conventions verbatim: `insertTaxRegionSchema.parse` on create with `201`, raw
 * bodies on reads/updates, `{ error }` envelopes for `400`/`404`/`500` (falling
 * back to the fixed "Failed to …" strings), the `"Tax region not found"` 404,
 * the optional `countryCode` list filter, and the same `console.error` labels.
 */

import type { Request, Response } from 'express';
import { insertTaxRegionSchema } from '@shared/schema';
import type { TaxService } from '../services/tax.service';

function q(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeTaxController(service: TaxService) {
  return {
    async create(req: Request, res: Response): Promise<void> {
      try {
        const validatedData = insertTaxRegionSchema.parse(req.body);
        res.status(201).json(await service.createRegion(validatedData));
      } catch (error) {
        console.error('Error creating tax region:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to create tax region' });
      }
    },
    async list(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listRegions(q(req.query.countryCode)));
      } catch (error) {
        console.error('Error fetching tax regions:', error);
        res.status(500).json({ error: 'Failed to fetch tax regions' });
      }
    },
    async getById(req: Request, res: Response): Promise<void> {
      try {
        const region = await service.getRegion(req.params.id);
        if (!region) {
          res.status(404).json({ error: 'Tax region not found' });
          return;
        }
        res.json(region);
      } catch (error) {
        console.error('Error fetching tax region:', error);
        res.status(500).json({ error: 'Failed to fetch tax region' });
      }
    },
    async update(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateRegion(req.params.id, req.body));
      } catch (error) {
        console.error('Error updating tax region:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to update tax region' });
      }
    },
    async remove(req: Request, res: Response): Promise<void> {
      try {
        await service.deleteRegion(req.params.id);
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting tax region:', error);
        res.status(500).json({ error: 'Failed to delete tax region' });
      }
    },
  };
}
