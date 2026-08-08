/**
 * AI schedule-optimization controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy monolith contract of the
 * `/api/ai/schedule-optimizations*` handlers: the
 * `insertAIScheduleOptimizationSchema.partial()` 400 (via `sanitizeZodError`),
 * the ownership failures surfaced from the service as `NotFoundError` (404) /
 * `AuthorizationError` (403), and the exact per-handler `{ message }` /
 * `{ message, error }` bodies. Route-level ownership guards remain on the routes.
 */

import type { Request, Response } from 'express';
import { insertAIScheduleOptimizationSchema } from '@shared/schema';
import { sanitizeZodError } from '../../../utils/validation-errors';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';
import type { AiScheduleOptimizationService } from '../services/ai-schedule-optimization.service';

function garageOf(req: Request): string {
  return (req.user as { garageId?: string } | undefined)?.garageId as string;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeAiScheduleOptimizationController(service: AiScheduleOptimizationService) {
  return {
    async optimize(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.optimize(garageOf(req), req.body ?? {}));
      } catch (error) {
        console.error('Error creating schedule optimization:', error);
        res.status(500).json({ message: 'Failed to create schedule optimization', error: (error as Error).message });
      }
    },

    async list(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.list(garageOf(req), str(req.query.status)));
      } catch (error) {
        console.error('Error fetching schedule optimizations:', error);
        res.status(500).json({ message: 'Failed to fetch schedule optimizations' });
      }
    },

    async get(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.get(req.params.id, garageOf(req)));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error fetching schedule optimization:', error);
        res.status(500).json({ message: 'Failed to fetch schedule optimization' });
      }
    },

    async update(req: Request, res: Response): Promise<void> {
      const validated = insertAIScheduleOptimizationSchema.partial().safeParse(req.body);
      if (!validated.success) {
        res.status(400).json(sanitizeZodError(validated.error));
        return;
      }
      try {
        res.json(await service.update(req.params.id, garageOf(req), validated.data));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error updating schedule optimization:', error);
        res.status(500).json({ message: 'Failed to update schedule optimization' });
      }
    },
  };
}

export type AiScheduleOptimizationController = ReturnType<typeof makeAiScheduleOptimizationController>;
