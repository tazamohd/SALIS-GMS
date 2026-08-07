/**
 * Estimate service (Phase E5 — Domain Services).
 *
 * Owns the estimate module's business rules: tenant-scoped listing and reads,
 * stats shaping, and the two conversion workflows (→ job card, → invoice) that
 * create downstream documents. Conversions emit a fire-and-forget domain event
 * after their records are committed — the first write-path events in the
 * migration (E7). All data access flows through the injected repository.
 *
 * Behavior mirrors the legacy monolith handlers exactly, including the "already
 * converted" 400 and the generated job/invoice numbers.
 */

import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';
import { EventBus, createEvent } from '../../../infrastructure/events/event-bus';
import type { IEstimateRepository } from '../repositories/estimate.repository';
import type {
  Estimate,
  EstimateAuthContext,
  EstimateListParams,
  EstimateListResult,
  EstimateStats,
} from '../domain/estimate.types';
import { EstimateEventTypes } from '../events/estimate.events';

const ZERO_STATS: EstimateStats = {
  totalEstimates: 0,
  conversionRate: 0,
  avgValue: 0,
  pendingCount: 0,
  funnel: { created: 0, sent: 0, approved: 0, converted: 0 },
  byStatus: {},
};

export class EstimateService {
  constructor(
    private readonly repository: IEstimateRepository,
    private readonly events?: EventBus,
  ) {}

  private effectiveGarageId(auth: EstimateAuthContext, garageIdParam?: string): string | undefined {
    // Note: the legacy estimates list preferred ?garage_id over the session
    // garage. Preserved verbatim to avoid a behavior change.
    return garageIdParam ?? auth.garageId ?? undefined;
  }

  async list(params: EstimateListParams): Promise<EstimateListResult> {
    const garageId = this.effectiveGarageId(params.auth, params.garageIdParam);
    const [rows, total] = await Promise.all([
      this.repository.listPaginated(garageId, params.status, params.limit, params.offset),
      this.repository.count(garageId, params.status),
    ]);
    return { rows, total };
  }

  async getVisible(id: string, auth: EstimateAuthContext): Promise<Estimate> {
    const estimate = await this.repository.getById(id);
    if (!estimate) {
      throw new NotFoundError('Estimate not found', { context: { id } });
    }
    if (auth.garageId && estimate.garageId && estimate.garageId !== auth.garageId) {
      throw new NotFoundError('Estimate not found', { context: { id } });
    }
    return estimate;
  }

  async stats(garageId: string | null | undefined): Promise<EstimateStats> {
    if (!garageId) return { ...ZERO_STATS, funnel: { ...ZERO_STATS.funnel }, byStatus: {} };
    const { agg, byStatus } = await this.repository.getStatsRaw(garageId);
    const r = agg ?? {};
    const total = Number(r.total || 0);
    const converted = Number(r.converted || 0);
    const byStatusMap: Record<string, number> = {};
    for (const row of byStatus) {
      byStatusMap[String(row.status ?? 'unknown')] = Number(row.count || 0);
    }
    return {
      totalEstimates: total,
      conversionRate: total > 0 ? Math.round((converted / total) * 1000) / 10 : 0,
      avgValue: Number(r.avg_value || 0),
      pendingCount: Number(r.pending || 0),
      funnel: {
        created: Number(r.created || 0),
        sent: Number(r.sent || 0),
        approved: Number(r.approved || 0),
        converted,
      },
      byStatus: byStatusMap,
    };
  }

  createWithItems(
    estimateData: Parameters<IEstimateRepository['createWithItems']>[0],
    items: Parameters<IEstimateRepository['createWithItems']>[1],
  ): Promise<Estimate> {
    return this.repository.createWithItems(estimateData, items);
  }

  async update(
    id: string,
    data: Parameters<IEstimateRepository['update']>[1],
    garageId?: string,
  ): Promise<Estimate> {
    const estimate = await this.repository.update(id, data, garageId);
    if (!estimate) {
      throw new NotFoundError('Estimate not found', { context: { id } });
    }
    return estimate;
  }

  delete(id: string, garageId?: string): Promise<void> {
    return this.repository.delete(id, garageId);
  }

  getItems(id: string) {
    return this.repository.getItems(id);
  }

  async convertToJobCard(id: string, auth: EstimateAuthContext) {
    const userId = auth.userId || 'default-user';
    const estimate = await this.repository.getById(id);
    if (!estimate) {
      throw new NotFoundError('Estimate not found', { context: { id } });
    }
    if (estimate.convertedToJobCardId) {
      throw new ValidationError('Estimate already converted to job card');
    }

    const items = await this.repository.getItems(id);

    const jobCardData = {
      jobNumber: `JC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      garageId: estimate.garageId,
      customerId: estimate.customerId,
      vehicleId: estimate.vehicleId,
      vehicleInfo: (estimate as { vehicleInfo?: unknown }).vehicleInfo ?? {},
      serviceType: 'repair',
      description:
        [estimate.title, estimate.description].filter(Boolean).join(' — ') ||
        'Converted from estimate',
      status: 'pending' as const,
      priority: 'medium' as const,
      estimatedCost: estimate.totalAmount,
      actualCost: '0.00',
      createdBy: userId,
    };

    const jobCard = await this.repository.createJobCard(jobCardData as never);

    for (const item of items) {
      await this.repository.createTaskAssignment({
        jobCardId: jobCard.id,
        taskName: item.description.substring(0, 100),
        taskType: item.itemType === 'service' ? 'repair' : 'inspection',
        description: item.description,
        assignedTo: userId,
        assignedBy: userId,
        userType: 'technician',
        status: 'assigned',
        priority: 'medium',
        estimatedMinutes: 60,
      } as never);
    }

    await this.repository.update(id, {
      status: 'converted',
      convertedToJobCardId: jobCard.id,
    } as never);

    this.emit(EstimateEventTypes.ConvertedToJobCard, {
      estimateId: id,
      jobCardId: jobCard.id,
      garageId: estimate.garageId ?? null,
      convertedByUserId: auth.userId,
    });

    return jobCard;
  }

  async convertToInvoice(id: string, auth: EstimateAuthContext) {
    const userId = auth.userId || 'default-user';
    const estimate = await this.repository.getById(id);
    if (!estimate) {
      throw new NotFoundError('Estimate not found', { context: { id } });
    }
    if (estimate.convertedToInvoiceId) {
      throw new ValidationError('Estimate already converted to invoice');
    }

    const items = await this.repository.getItems(id);

    const invoiceData = {
      garageId: estimate.garageId,
      customerId: estimate.customerId,
      vehicleId: estimate.vehicleId,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft' as const,
      subtotal: estimate.subtotal,
      taxAmount: estimate.taxAmount,
      discountAmount: estimate.discountAmount,
      totalAmount: estimate.totalAmount,
      paidAmount: '0.00',
      balanceAmount: estimate.totalAmount,
      notes: estimate.notes,
    };

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const invoice = await this.repository.createInvoice({
      ...invoiceData,
      invoiceNumber,
      createdBy: userId,
    } as never);

    for (const item of items) {
      await this.repository.createInvoiceItem({
        invoiceId: invoice.id,
        itemType: item.itemType,
        description: item.description,
        quantity: parseFloat(item.quantity),
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      } as never);
    }

    await this.repository.update(id, {
      status: 'converted',
      convertedToInvoiceId: invoice.id,
    } as never);

    this.emit(EstimateEventTypes.ConvertedToInvoice, {
      estimateId: id,
      invoiceId: invoice.id,
      garageId: estimate.garageId ?? null,
      convertedByUserId: auth.userId,
    });

    return invoice;
  }

  private emit(type: string, payload: Record<string, unknown>): void {
    if (!this.events) return;
    void this.events.publish(createEvent(type, payload)).catch(() => {
      /* delivery failures are handled by the bus (retry/DLQ). */
    });
  }
}
