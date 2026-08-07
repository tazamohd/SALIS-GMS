/**
 * Estimate repository (Phase E4 — Repository Pattern).
 *
 * The only place in the estimate module that touches the data layer. It
 * delegates estimate CRUD to the legacy `storage` facade, owns the stats
 * aggregation SQL (previously inlined in the route), and exposes the downstream
 * writes a conversion needs (job card / invoice creation). Keeping the raw SQL
 * and cross-table conversion writes here preserves the module's single
 * data-access boundary; the orchestration lives in the service.
 */

import { sql } from 'drizzle-orm';
import { db } from '../../../db';
import { storage } from '../../../storage';
import type { Estimate, EstimateStatsRaw } from '../domain/estimate.types';

type CreateEstimateArgs = Parameters<typeof storage.createEstimateWithItems>;
type UpdateEstimateData = Parameters<typeof storage.updateEstimate>[1];

export interface IEstimateRepository {
  listPaginated(
    garageId: string | undefined,
    status: string | undefined,
    limit: number,
    offset: number,
  ): ReturnType<typeof storage.getEstimatesPaginated>;
  count(garageId: string | undefined, status: string | undefined): Promise<number>;
  getById(id: string): Promise<Estimate | undefined>;
  getItems(id: string): ReturnType<typeof storage.getEstimateItems>;
  createWithItems(estimateData: CreateEstimateArgs[0], items: CreateEstimateArgs[1]): Promise<Estimate>;
  update(id: string, data: UpdateEstimateData, garageId?: string): Promise<Estimate>;
  delete(id: string, garageId?: string): Promise<void>;
  getStatsRaw(garageId: string): Promise<EstimateStatsRaw>;
  // Conversion writes (cross-document, kept behind the data-access boundary).
  createJobCard(data: Parameters<typeof storage.createJobCard>[0]): ReturnType<typeof storage.createJobCard>;
  createTaskAssignment(
    data: Parameters<typeof storage.createTaskAssignment>[0],
  ): ReturnType<typeof storage.createTaskAssignment>;
  createInvoice(data: Parameters<typeof storage.createInvoice>[0]): ReturnType<typeof storage.createInvoice>;
  createInvoiceItem(
    data: Parameters<typeof storage.createInvoiceItem>[0],
  ): ReturnType<typeof storage.createInvoiceItem>;
}

export class EstimateRepository implements IEstimateRepository {
  listPaginated(
    garageId: string | undefined,
    status: string | undefined,
    limit: number,
    offset: number,
  ) {
    return storage.getEstimatesPaginated(garageId, status, limit, offset);
  }

  count(garageId: string | undefined, status: string | undefined): Promise<number> {
    return storage.countEstimates(garageId, status);
  }

  getById(id: string): Promise<Estimate | undefined> {
    return storage.getEstimate(id);
  }

  getItems(id: string) {
    return storage.getEstimateItems(id);
  }

  createWithItems(estimateData: CreateEstimateArgs[0], items: CreateEstimateArgs[1]) {
    return storage.createEstimateWithItems(estimateData, items);
  }

  update(id: string, data: UpdateEstimateData, garageId?: string) {
    return storage.updateEstimate(id, data, garageId);
  }

  delete(id: string, garageId?: string) {
    return storage.deleteEstimate(id, garageId);
  }

  async getStatsRaw(garageId: string): Promise<EstimateStatsRaw> {
    const agg = await db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status IN ('draft','created'))::int AS created,
        COUNT(*) FILTER (WHERE status = 'sent')::int AS sent,
        COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
        COUNT(*) FILTER (WHERE status = 'converted')::int AS converted,
        COUNT(*) FILTER (WHERE status IN ('draft','created','sent','pending'))::int AS pending,
        COALESCE(AVG(total_amount), 0)::float AS avg_value
      FROM estimates WHERE garage_id = ${garageId}
    `);
    const byStatusRows = await db.execute(sql`
      SELECT status, COUNT(*)::int AS count FROM estimates
      WHERE garage_id = ${garageId} GROUP BY status
    `);
    return {
      agg: (agg.rows?.[0] as Record<string, unknown> | undefined) ?? undefined,
      byStatus: (byStatusRows.rows ?? []) as Array<{ status: unknown; count: unknown }>,
    };
  }

  createJobCard(data: Parameters<typeof storage.createJobCard>[0]) {
    return storage.createJobCard(data);
  }

  createTaskAssignment(data: Parameters<typeof storage.createTaskAssignment>[0]) {
    return storage.createTaskAssignment(data);
  }

  createInvoice(data: Parameters<typeof storage.createInvoice>[0]) {
    return storage.createInvoice(data);
  }

  createInvoiceItem(data: Parameters<typeof storage.createInvoiceItem>[0]) {
    return storage.createInvoiceItem(data);
  }
}
