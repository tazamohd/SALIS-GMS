/**
 * AI controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy contract of the three AI route files:
 * the session-garage 403s, the repair-guide Zod 400, and the exact per-handler
 * `{ message }` 500 bodies. The AI-key flag is resolved here and passed to the
 * service. Plan gating (`requirePlan`) is applied on the routes in index.ts.
 * No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { parseTimeRange } from '../services/ai.service';
import type { AiService } from '../services/ai.service';

const repairGuideSchema = z.object({
  vehicleId: z.union([z.string(), z.number()]).transform(String),
  guide: z.string().min(1),
});

function garageId(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}

export function makeAiController(service: AiService) {
  return {
    async insights(req: Request, res: Response): Promise<void> {
      const gid = garageId(req);
      if (!gid) { res.status(403).json({ message: 'No garage associated' }); return; }
      try {
        res.json(await service.insights(gid));
      } catch (error) {
        console.error('[AI Insights] Error:', error);
        res.status(500).json({ message: 'Failed to generate insights' });
      }
    },

    async forecastRevenue(req: Request, res: Response): Promise<void> {
      const gid = garageId(req);
      if (!gid) { res.status(403).json({ message: 'No garage associated' }); return; }
      try {
        res.json(await service.revenueForecast(gid));
      } catch (error) {
        console.error('[AI Forecast] Error:', error);
        res.status(500).json({ message: 'Failed to generate forecast' });
      }
    },

    async forecastDemand(req: Request, res: Response): Promise<void> {
      const gid = garageId(req);
      if (!gid) { res.status(403).json({ message: 'No garage associated' }); return; }
      try {
        res.json(await service.demandForecast(gid));
      } catch (error) {
        console.error('[AI Demand] Error:', error);
        res.status(500).json({ message: 'Failed to generate predictions' });
      }
    },

    async predictions(req: Request, res: Response): Promise<void> {
      const gid = garageId(req);
      if (!gid) { res.status(403).json({ message: 'No garage associated' }); return; }
      const days = parseTimeRange(String(req.query.timeRange ?? '7d'));
      const predictionType = String(req.query.predictionType ?? 'demand');
      try {
        res.json(await service.predictions(gid, predictionType, days));
      } catch (err) {
        console.error('[ai/predictions] error:', err);
        res.status(500).json({ message: 'Failed to compute predictions' });
      }
    },

    async accuracy(req: Request, res: Response): Promise<void> {
      const gid = garageId(req);
      if (!gid) { res.status(403).json({ message: 'No garage associated' }); return; }
      try {
        res.json(await service.accuracy(gid));
      } catch (err) {
        console.error('[ai/accuracy] error:', err);
        res.status(500).json({ message: 'Failed to compute accuracy' });
      }
    },

    async repairGuide(req: Request, res: Response): Promise<void> {
      const gid = garageId(req);
      if (!gid) { res.status(403).json({ message: 'No garage associated' }); return; }
      const parsed = repairGuideSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
        return;
      }
      const hasAiKey = !!process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      res.json(await service.repairGuide(parsed.data.vehicleId, parsed.data.guide, hasAiKey));
    },
  };
}

export type AiController = ReturnType<typeof makeAiController>;
