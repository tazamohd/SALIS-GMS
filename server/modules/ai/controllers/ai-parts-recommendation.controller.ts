/**
 * AI parts-recommendation controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy monolith contract of the
 * `/api/ai/parts-recommendations*` handlers: the
 * `insertAIPartsRecommendationSchema.partial()` 400 (via `sanitizeZodError`), the
 * ownership failures surfaced from the service as `NotFoundError` (404) /
 * `AuthorizationError` (403), and the exact per-handler `{ message }` /
 * `{ message, error }` bodies. Route-level ownership guards remain on the routes.
 */

import type { Request, Response } from 'express';
import { insertAIPartsRecommendationSchema } from '@shared/schema';
import { sanitizeZodError } from '../../../utils/validation-errors';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';
import type { AiPartsRecommendationService } from '../services/ai-parts-recommendation.service';

function garageOf(req: Request): string {
  return (req.user as { garageId?: string } | undefined)?.garageId as string;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeAiPartsRecommendationController(service: AiPartsRecommendationService) {
  return {
    async recommend(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.recommend(garageOf(req), req.body ?? {}));
      } catch (error) {
        console.error('Error creating parts recommendation:', error);
        res.status(500).json({ message: 'Failed to create parts recommendation', error: (error as Error).message });
      }
    },

    async list(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.list(garageOf(req), str(req.query.vehicleId), str(req.query.status)));
      } catch (error) {
        console.error('Error fetching parts recommendations:', error);
        res.status(500).json({ message: 'Failed to fetch parts recommendations' });
      }
    },

    async get(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.get(req.params.id, garageOf(req)));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error fetching parts recommendation:', error);
        res.status(500).json({ message: 'Failed to fetch parts recommendation' });
      }
    },

    async update(req: Request, res: Response): Promise<void> {
      const validated = insertAIPartsRecommendationSchema.partial().safeParse(req.body);
      if (!validated.success) {
        res.status(400).json(sanitizeZodError(validated.error));
        return;
      }
      try {
        res.json(await service.update(req.params.id, garageOf(req), validated.data));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error updating parts recommendation:', error);
        res.status(500).json({ message: 'Failed to update parts recommendation' });
      }
    },
  };
}

export type AiPartsRecommendationController = ReturnType<typeof makeAiPartsRecommendationController>;
