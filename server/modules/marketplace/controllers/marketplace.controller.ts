/**
 * Marketplace controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the PUBLIC provider-discovery surface (no auth, matching
 * the legacy handlers). Preserves the `/find` min-length 400, the provider 404,
 * and the exact `{ message }` 500 bodies. No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { MarketplaceService } from '../services/marketplace.service';

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeMarketplaceController(service: MarketplaceService) {
  return {
    async listProviders(req: Request, res: Response): Promise<void> {
      try {
        res.json(
          await service.listProviders({
            type: str(req.query.type),
            q: str(req.query.q),
            city: str(req.query.city),
          }),
        );
      } catch (error) {
        console.error('Error listing marketplace providers:', error);
        res.status(500).json({ message: 'Failed to load providers' });
      }
    },

    async getProvider(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getProvider(req.params.id));
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.status(404).json({ message: 'Provider not found' });
          return;
        }
        console.error('Error loading marketplace provider:', error);
        res.status(500).json({ message: 'Failed to load provider' });
      }
    },

    async find(req: Request, res: Response): Promise<void> {
      try {
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        if (q.length < 2) {
          res.status(400).json({ message: 'Search query must be at least 2 characters' });
          return;
        }
        res.json(await service.search(q));
      } catch (error) {
        console.error('Error searching marketplace:', error);
        res.status(500).json({ message: 'Failed to search' });
      }
    },

    async reviews(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listReviews(req.params.id));
      } catch (error) {
        console.error('Error listing reviews:', error);
        res.status(500).json({ message: 'Failed to load reviews' });
      }
    },
  };
}

export type MarketplaceController = ReturnType<typeof makeMarketplaceController>;
