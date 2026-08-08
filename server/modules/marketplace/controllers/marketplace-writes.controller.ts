/**
 * Marketplace write-path controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the AUTHENTICATED parts-marketplace surface. Preserves
 * the legacy monolith contract of the `/api/marketplace/*` and `/api/my/reviews`
 * handlers: the `201` on order placement / review submission, the review guards
 * surfaced from the service as `ValidationError` (400) / `NotFoundError` (404) /
 * `AuthorizationError` (403), and the exact per-handler `{ message }` 500 bodies.
 * No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../../../infrastructure/errors/domain-errors';
import type { MarketplaceKind } from '../repositories/marketplace-writes.repository';
import type { MarketplaceWritesService } from '../services/marketplace-writes.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function userIdOf(req: Request): string {
  return (req.user as { id?: string } | undefined)?.id as string;
}
function messageOf(error: unknown, fallback: string): string {
  return (error as { message?: string })?.message || fallback;
}

export function makeMarketplaceWritesController(service: MarketplaceWritesService) {
  return {
    async searchParts(req: Request, res: Response): Promise<void> {
      try {
        res.json(
          await service.searchParts(
            req.query.partNumber as string,
            req.query.marketplace as MarketplaceKind,
          ),
        );
      } catch (error) {
        console.error('Error searching marketplace:', error);
        res.status(500).json({ message: messageOf(error, 'Failed to search marketplace') });
      }
    },

    async placeOrder(req: Request, res: Response): Promise<void> {
      try {
        const order = await service.placeOrder(garageOf(req), req.body);
        res.status(201).json(order);
      } catch (error) {
        console.error('Error placing marketplace order:', error);
        res.status(500).json({ message: messageOf(error, 'Failed to place order') });
      }
    },

    async trackOrder(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.trackOrder(req.params.id));
      } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ message: messageOf(error, 'Failed to track order') });
      }
    },

    async listOrders(req: Request, res: Response): Promise<void> {
      try {
        res.json(service.listOrders(garageOf(req)));
      } catch (error) {
        console.error('Error fetching marketplace orders:', error);
        res.status(500).json({ message: 'Failed to fetch marketplace orders' });
      }
    },

    async submitReview(req: Request, res: Response): Promise<void> {
      try {
        const review = await service.submitReview(userIdOf(req), req.body ?? {});
        res.status(201).json(review);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({ message: error.message });
          return;
        }
        if (error instanceof NotFoundError) {
          res.status(404).json({ message: error.message });
          return;
        }
        if (error instanceof AuthorizationError) {
          res.status(403).json({ message: error.message });
          return;
        }
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Failed to submit review' });
      }
    },
  };
}

export type MarketplaceWritesController = ReturnType<typeof makeMarketplaceWritesController>;
