/**
 * CRM domain types + shared constants (Phase E1).
 *
 * The graceful-degradation defaults, the spend→tier ladder, and the static
 * campaign fixtures are lifted verbatim from the legacy `server/routes/crm.ts`
 * so the migrated module returns byte-for-byte identical shapes.
 */

export type LoyaltyTier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

/** Spend → loyalty tier ladder (SAR). Mirrors the legacy CASE expressions. */
export function loyaltyTierForSpend(totalSpend: number): LoyaltyTier {
  if (totalSpend >= 10000) return 'Platinum';
  if (totalSpend >= 5000) return 'Gold';
  if (totalSpend >= 2000) return 'Silver';
  return 'Bronze';
}

export const EMPTY_LOYALTY_SUMMARY = {
  totalMembers: 0,
  pointsIssued: 0,
  pointsRedeemed: 0,
  activeCampaigns: 0,
  tierDistribution: [] as unknown[],
};

export const EMPTY_RETENTION = {
  repeatRate: 0,
  churnRate: 0,
  avgLifetimeValue: 0,
  maxLifetimeValue: 0,
  avgVisits: 0,
  totalCustomers: 0,
  repeatCustomers: 0,
  churnRiskCustomers: [] as unknown[],
  retentionTrend: [] as unknown[],
};

/**
 * Static marketing-campaign fixtures. The legacy handler returns these enriched
 * placeholders directly (no DB read); preserved so the campaigns dashboard is
 * unchanged. Dates are computed per-request off `now`.
 */
export function buildCampaigns(now: number) {
  return [
    {
      id: '1',
      name: 'Summer Service Special',
      type: 'Email',
      status: 'Active',
      startDate: new Date(now - 30 * 86400000).toISOString(),
      endDate: new Date(now + 30 * 86400000).toISOString(),
      targetSegment: 'Regular',
      sent: 450,
      opened: 312,
      converted: 87,
      revenue: 34500,
      cost: 2500,
      roi: 1280,
    },
    {
      id: '2',
      name: 'VIP Loyalty Rewards',
      type: 'SMS',
      status: 'Active',
      startDate: new Date(now - 15 * 86400000).toISOString(),
      endDate: new Date(now + 45 * 86400000).toISOString(),
      targetSegment: 'VIP',
      sent: 120,
      opened: 98,
      converted: 45,
      revenue: 22500,
      cost: 800,
      roi: 2713,
    },
    {
      id: '3',
      name: 'Win-Back Churned Customers',
      type: 'Email',
      status: 'Completed',
      startDate: new Date(now - 90 * 86400000).toISOString(),
      endDate: new Date(now - 30 * 86400000).toISOString(),
      targetSegment: 'Churned',
      sent: 280,
      opened: 156,
      converted: 32,
      revenue: 12800,
      cost: 1500,
      roi: 753,
    },
    {
      id: '4',
      name: 'New Customer Welcome',
      type: 'Email',
      status: 'Draft',
      startDate: null,
      endDate: null,
      targetSegment: 'New',
      sent: 0,
      opened: 0,
      converted: 0,
      revenue: 0,
      cost: 0,
      roi: 0,
    },
  ];
}
