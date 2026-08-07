/**
 * Reports controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy `server/routes/reports.ts` contract:
 * the session-derived garage guard (403 `No garage associated` — never a literal
 * fallback, audit C4) and the exact per-report `{ message }` 500 bodies. Role
 * gating is applied on the routes in index.ts. No business rules, no data-layer
 * access.
 */

import type { Request, Response } from 'express';
import type { ReportsService } from '../services/reports.service';

/** Derive garageId from the session, or send the legacy 403 and return null. */
function resolveGarageId(req: Request, res: Response): string | null {
  const garageId = (req.user as { garageId?: string } | undefined)?.garageId;
  if (!garageId) {
    res.status(403).json({ message: 'No garage associated' });
    return null;
  }
  return garageId;
}

export function makeReportsController(service: ReportsService) {
  return {
    async revenue(req: Request, res: Response): Promise<void> {
      const garageId = resolveGarageId(req, res);
      if (!garageId) return;
      const groupBy = typeof req.query.groupBy === 'string' ? req.query.groupBy : 'month';
      try {
        res.json(await service.revenue(garageId, groupBy));
      } catch (e) {
        console.error('[reports/revenue] query failed', e);
        res.status(500).json({ message: 'Failed to load revenue report' });
      }
    },

    async technicianPerformance(req: Request, res: Response): Promise<void> {
      const garageId = resolveGarageId(req, res);
      if (!garageId) return;
      try {
        res.json(await service.technicianPerformance(garageId));
      } catch (e) {
        console.error('[reports/technician-performance] query failed', e);
        res.status(500).json({ message: 'Failed to load report' });
      }
    },

    async inventoryTurnover(req: Request, res: Response): Promise<void> {
      const garageId = resolveGarageId(req, res);
      if (!garageId) return;
      try {
        res.json(await service.inventoryTurnover(garageId));
      } catch (e) {
        console.error('[reports/inventory-turnover] query failed', e);
        res.status(500).json({ message: 'Failed to load report' });
      }
    },

    async customerAnalytics(req: Request, res: Response): Promise<void> {
      const garageId = resolveGarageId(req, res);
      if (!garageId) return;
      try {
        res.json(await service.customerAnalytics(garageId));
      } catch (e) {
        console.error('[reports/customer-analytics] query failed', e);
        res.status(500).json({ message: 'Failed to load report' });
      }
    },

    async summary(req: Request, res: Response): Promise<void> {
      const garageId = resolveGarageId(req, res);
      if (!garageId) return;
      try {
        res.json(await service.summary(garageId));
      } catch (e) {
        console.error('[reports/summary] query failed', e);
        res.status(500).json({ message: 'Failed to load summary report' });
      }
    },
  };
}

export type ReportsController = ReturnType<typeof makeReportsController>;
