/**
 * CRM service (Phase E5 — Domain Services).
 *
 * Owns the CRM read-model computation: the customer-360 aggregate (visit count,
 * total spend, last visit, loyalty tier), segment percentages, loyalty points
 * math (1 point / SAR, 15% modeled redemption), and retention ratios. All data
 * access flows through the injected repository; the numbers mirror the legacy
 * `server/routes/crm.ts` handlers exactly. Missing-customer surfaces as a
 * NotFoundError, which the controller maps to the legacy 404 body.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { ICrmRepository } from '../repositories/crm.repository';
import {
  loyaltyTierForSpend,
  buildCampaigns,
  type LoyaltyTier,
} from '../domain/crm.types';

interface AwardPointsInput {
  customerId: unknown;
  points: unknown;
  reason?: unknown;
}

export class CrmService {
  constructor(private readonly repository: ICrmRepository) {}

  async customerList(garageId: string, search: string) {
    const customers = await this.repository.customerList(garageId, search);
    return { customers };
  }

  async customerDetail(garageId: string, id: string) {
    const base = await this.repository.customerBase(garageId, id);
    if (!base) throw new NotFoundError('Customer not found', { context: { id } });

    const [jobs, invoices, appointments] = await Promise.all([
      this.repository.customerJobs(garageId, id),
      this.repository.customerInvoices(garageId, id),
      this.repository.customerAppointments(garageId, id),
    ]);

    const totalSpend = invoices.reduce(
      (s: number, inv) => s + Number((inv as { totalAmount?: unknown }).totalAmount || 0),
      0,
    );
    const visitCount = jobs.length;
    const lastVisit =
      (jobs.find((j) => (j as { completedAt?: unknown }).completedAt) as
        | { completedAt?: unknown }
        | undefined)?.completedAt || null;
    const loyaltyTier: LoyaltyTier = loyaltyTierForSpend(totalSpend);

    return {
      customer: { ...base, visitCount, totalSpend, lastVisit, loyaltyTier },
      jobs,
      invoices,
      appointments,
    };
  }

  async segments(garageId: string) {
    const segments = await this.repository.segments(garageId);
    const total = segments.reduce(
      (s: number, seg) => s + Number((seg as { count?: unknown }).count || 0),
      0,
    );
    return {
      segments: segments.map((seg) => ({
        ...seg,
        percentage:
          total > 0
            ? Math.round((Number((seg as { count?: unknown }).count || 0) / total) * 100)
            : 0,
      })),
      total,
    };
  }

  async loyaltySummary(garageId: string) {
    const [totalMembers, totalRevenue, tierDistribution] = await Promise.all([
      this.repository.loyaltyMembers(garageId),
      this.repository.loyaltyRevenue(garageId),
      this.repository.loyaltyTiers(garageId),
    ]);
    // Points modeled as 1 point per SAR spent; ~15% modeled redemption.
    const pointsIssued = Math.round(totalRevenue);
    const pointsRedeemed = Math.round(totalRevenue * 0.15);
    return {
      totalMembers,
      pointsIssued,
      pointsRedeemed,
      activeCampaigns: 3, // placeholder, matches legacy
      tierDistribution,
    };
  }

  async retention(garageId: string) {
    const [repeat, ltv, churnRiskCustomers, retentionTrend] = await Promise.all([
      this.repository.retentionRepeat(garageId),
      this.repository.retentionLtv(garageId),
      this.repository.retentionChurnRisk(garageId),
      this.repository.retentionTrend(garageId),
    ]);
    const totalCustomers = Number((repeat as { total_customers?: unknown }).total_customers || 0);
    const repeatCustomers = Number((repeat as { repeat_customers?: unknown }).repeat_customers || 0);
    return {
      repeatRate: totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0,
      churnRate:
        totalCustomers > 0
          ? Math.round(((totalCustomers - repeatCustomers) / totalCustomers) * 100)
          : 0,
      avgLifetimeValue: Number((ltv as { avg_ltv?: unknown }).avg_ltv || 0),
      maxLifetimeValue: Number((ltv as { max_ltv?: unknown }).max_ltv || 0),
      avgVisits: Number((repeat as { avg_visits?: unknown }).avg_visits || 0),
      totalCustomers,
      repeatCustomers,
      churnRiskCustomers,
      retentionTrend,
    };
  }

  /** Award-points acknowledgement. No persistence today (matches legacy stub). */
  awardPoints(input: AwardPointsInput, now: number) {
    return {
      success: true,
      customerId: input.customerId,
      pointsAwarded: Number(input.points),
      reason: (input.reason as string | undefined) || 'Manual award',
      awardedAt: new Date(now).toISOString(),
    };
  }

  campaigns(now: number) {
    return { campaigns: buildCampaigns(now) };
  }
}
