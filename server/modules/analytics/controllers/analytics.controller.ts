/**
 * Analytics controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy contract: the performance report's
 * garage + management 403s (fail-closed, audit H-1), the session garage on the
 * BI reads, and the exact per-handler `{ message }` 500 bodies. Runtime values
 * (current time, generated report id) are minted here so the service stays
 * deterministic. No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { isManagementUser } from '../../../middleware/managementAccess';
import type { AnalyticsService } from '../services/analytics.service';

function garageOf(req: Request): string {
  return (req.user as { garageId?: string } | undefined)?.garageId as string;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeAnalyticsController(service: AnalyticsService) {
  return {
    async performance(req: Request, res: Response): Promise<void> {
      const user = req.user as { garageId?: string; userType?: string | null } | undefined;
      if (!user?.garageId) {
        res.status(403).json({ message: 'No garage associated' });
        return;
      }
      // Manager+ only — technicians/customers must not see garage-wide revenue
      // and per-tech rankings. Fail-closed via the shared helper (audit H-1).
      if (!isManagementUser(user)) {
        res.status(403).json({ message: 'Insufficient privileges for performance analytics' });
        return;
      }
      try {
        res.json(await service.performance(user.garageId, String(req.query.timeRange ?? '30d')));
      } catch (err) {
        console.error('[analytics/performance] error:', err);
        res.status(500).json({ message: 'Failed to compute analytics' });
      }
    },

    async dashboardMetrics(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.dashboardMetrics(garageOf(req), req.query.period, new Date()));
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
      }
    },

    async listCustomReports(_req: Request, res: Response): Promise<void> {
      try {
        res.json(service.customReports());
      } catch (error) {
        console.error('Error fetching custom reports:', error);
        res.status(500).json({ message: 'Failed to fetch custom reports' });
      }
    },

    async createCustomReport(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req.user as { id?: string } | undefined)?.id || 'default-user';
        const id = Math.random().toString(36).substring(7);
        res.json(service.createCustomReport(garageOf(req), userId, req.body ?? {}, id, new Date()));
      } catch (error) {
        console.error('Error creating custom report:', error);
        res.status(500).json({ message: 'Failed to create custom report' });
      }
    },

    async runCustomReport(_req: Request, res: Response): Promise<void> {
      try {
        res.json(service.runCustomReport());
      } catch (error) {
        console.error('Error running report:', error);
        res.status(500).json({ message: 'Failed to run report' });
      }
    },

    async profitAnalysis(req: Request, res: Response): Promise<void> {
      try {
        const periodType = (str(req.query.periodType) ?? 'service') as 'service' | 'technician' | 'customer';
        res.json(await service.profitAnalysis(garageOf(req), periodType));
      } catch (error) {
        console.error('Error fetching profit analysis:', error);
        res.status(500).json({ message: 'Failed to fetch profit analysis' });
      }
    },

    async customerLTV(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.customerLTV(garageOf(req), str(req.query.riskFilter)));
      } catch (error) {
        console.error('Error fetching customer LTV:', error);
        res.status(500).json({ message: 'Failed to fetch customer LTV data' });
      }
    },

    async heatmaps(req: Request, res: Response): Promise<void> {
      try {
        const heatmapType = (str(req.query.heatmapType) ?? 'time') as 'time' | 'service' | 'technician';
        res.json(await service.heatmaps(garageOf(req), heatmapType));
      } catch (error) {
        console.error('Error fetching heatmaps:', error);
        res.status(500).json({ message: 'Failed to fetch heatmap data' });
      }
    },
  };
}

export type AnalyticsController = ReturnType<typeof makeAnalyticsController>;
