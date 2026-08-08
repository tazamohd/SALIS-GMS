/**
 * AI job-estimation controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy monolith contract of the
 * `/api/ai/job-estimations*` handlers: the `insertAIJobEstimationSchema.partial()`
 * 400 (via `sanitizeZodError`), the ownership failures surfaced from the service
 * as `NotFoundError` (404) / `AuthorizationError` (403), and the exact
 * per-handler `{ message }` 500 bodies. Route-level ownership guards
 * (`requireResourceOwnership`) remain on the routes. No business rules, no data
 * access.
 */

import type { Request, Response } from 'express';
import { insertAIJobEstimationSchema } from '@shared/schema';
import { sanitizeZodError } from '../../../utils/validation-errors';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';
import type { AiJobEstimationService } from '../services/ai-job-estimation.service';

function garageOf(req: Request): string {
  return (req.user as { garageId?: string } | undefined)?.garageId as string;
}

export function makeAiJobEstimationController(service: AiJobEstimationService) {
  return {
    async estimate(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.estimate(garageOf(req), req.body ?? {}));
      } catch (error) {
        console.error('Error creating job estimation:', error);
        res.status(500).json({ message: 'Failed to create job estimation', error: (error as Error).message });
      }
    },

    async list(req: Request, res: Response): Promise<void> {
      try {
        const vehicleId = typeof req.query.vehicleId === 'string' ? req.query.vehicleId : undefined;
        res.json(await service.list(garageOf(req), vehicleId));
      } catch (error) {
        console.error('Error fetching job estimations:', error);
        res.status(500).json({ message: 'Failed to fetch job estimations' });
      }
    },

    async get(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.get(req.params.id, garageOf(req)));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error fetching job estimation:', error);
        res.status(500).json({ message: 'Failed to fetch job estimation' });
      }
    },

    async update(req: Request, res: Response): Promise<void> {
      const validated = insertAIJobEstimationSchema.partial().safeParse(req.body);
      if (!validated.success) {
        res.status(400).json(sanitizeZodError(validated.error));
        return;
      }
      try {
        res.json(await service.update(req.params.id, garageOf(req), validated.data));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error updating job estimation:', error);
        res.status(500).json({ message: 'Failed to update job estimation' });
      }
    },
  };
}

export type AiJobEstimationController = ReturnType<typeof makeAiJobEstimationController>;
