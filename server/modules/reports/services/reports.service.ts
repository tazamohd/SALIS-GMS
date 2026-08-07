/**
 * Reports service (Phase E5 — Domain Services).
 *
 * Owns the reporting read model: the `groupBy → TO_CHAR` period-format mapping
 * for the revenue report and the executive-summary number extraction. The other
 * reports are straight pass-throughs of the repository aggregate rows. Behaviour
 * mirrors the legacy `server/routes/reports.ts` handlers exactly; all data
 * access flows through the injected repository.
 */

import type { IReportsRepository } from '../repositories/reports.repository';

type Row = Record<string, unknown>;
const n = (v: unknown) => Number(v || 0);

export class ReportsService {
  constructor(private readonly repository: IReportsRepository) {}

  async revenue(garageId: string, groupBy: string) {
    const dateFormat = groupBy === 'day' ? 'YYYY-MM-DD' : groupBy === 'week' ? 'IYYY-IW' : 'YYYY-MM';
    const data = await this.repository.revenue(garageId, dateFormat);
    return { data, groupBy };
  }

  async technicianPerformance(garageId: string) {
    return { data: await this.repository.technicianPerformance(garageId) };
  }

  async inventoryTurnover(garageId: string) {
    return { data: await this.repository.inventoryTurnover(garageId) };
  }

  async customerAnalytics(garageId: string) {
    return { data: await this.repository.customerAnalytics(garageId) };
  }

  async summary(garageId: string) {
    const { revenue, jobs, customers, inventory } = await this.repository.summaryRows(garageId);
    const j = jobs[0] as Row | undefined;
    const inv = inventory[0] as Row | undefined;
    return {
      totalRevenue: n((revenue[0] as Row | undefined)?.total),
      totalJobs: n(j?.total),
      completedJobs: n(j?.completed),
      totalCustomers: n((customers[0] as Row | undefined)?.total),
      totalParts: n(inv?.total),
      lowStockParts: n(inv?.lowStock),
    };
  }
}
