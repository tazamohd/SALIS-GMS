/**
 * AI maintenance-prediction controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy monolith contract of the
 * `/api/ai/maintenance-predictions*` handlers: the ownership failures surfaced
 * from the service as `NotFoundError` (404) / `AuthorizationError` (403), and the
 * exact per-handler `{ message }` / `{ message, error }` 500 bodies. The
 * acknowledge timestamp is supplied here. Route-level ownership guards remain on
 * the routes. No business rules, no data access.
 */

import type { Request, Response } from 'express';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';
import type { AiMaintenancePredictionService } from '../services/ai-maintenance-prediction.service';

function garageOf(req: Request): string {
  return (req.user as { garageId?: string } | undefined)?.garageId as string;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeAiMaintenancePredictionController(service: AiMaintenancePredictionService) {
  return {
    async predict(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.predict(garageOf(req), req.body ?? {}));
      } catch (error) {
        console.error('Error creating maintenance prediction:', error);
        res.status(500).json({ message: 'Failed to create maintenance prediction', error: (error as Error).message });
      }
    },

    async diagnose(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.diagnose(garageOf(req), req.body ?? {}));
      } catch (error) {
        console.error('Error creating predictive diagnostic:', error);
        res.status(500).json({ message: 'Failed to create predictive diagnostic', error: (error as Error).message });
      }
    },

    async list(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.list(garageOf(req), str(req.query.vehicleId), str(req.query.status)));
      } catch (error) {
        console.error('Error fetching maintenance predictions:', error);
        res.status(500).json({ message: 'Failed to fetch maintenance predictions' });
      }
    },

    async get(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.get(req.params.id, garageOf(req)));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error fetching maintenance prediction:', error);
        res.status(500).json({ message: 'Failed to fetch maintenance prediction' });
      }
    },

    async acknowledge(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.acknowledge(req.params.id, garageOf(req), new Date().toISOString()));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error acknowledging maintenance prediction:', error);
        res.status(500).json({ message: 'Failed to acknowledge maintenance prediction' });
      }
    },

    async analyze(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.analyze(garageOf(req)));
      } catch (error) {
        console.error('Error running AI maintenance analysis:', error);
        res.status(500).json({ message: 'Failed to run AI maintenance analysis', error: (error as Error).message });
      }
    },
  };
}

export type AiMaintenancePredictionController = ReturnType<typeof makeAiMaintenancePredictionController>;
