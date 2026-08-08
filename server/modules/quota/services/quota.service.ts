/**
 * Quota service (Phase D.1 / LIC-2). Resolves a garage's EFFECTIVE entitlement
 * limits — an active license's overrides win, else the SaaS subscription plan
 * default from `@shared/plans` — and compares them against live usage. Powers
 * the `GET /api/quota` status surface and the `enforceQuota` middleware.
 *
 * Fail-open by design: a null limit means "unlimited" and an untracked usage
 * metric never blocks — enforcement only fires when a limit is set AND its
 * usage is known, so wiring it onto a route can never break an existing flow.
 */

import { PLANS, type PlanId } from '@shared/plans';
import type { IQuotaRepository, UsageCounts } from '../repositories/quota.repository';

export type QuotaResource =
  | 'users'
  | 'branches'
  | 'vehicles'
  | 'garages'
  | 'storageGb'
  | 'jobsPerMonth'
  | 'apiQuotaPerDay';

const TRACKED: QuotaResource[] = ['users', 'vehicles', 'jobsPerMonth'];
const ALL: QuotaResource[] = ['users', 'branches', 'vehicles', 'garages', 'storageGb', 'jobsPerMonth', 'apiQuotaPerDay'];

export interface ResourceStatus {
  limit: number | null; // null = unlimited
  used: number | null; // null = not tracked yet
  remaining: number | null;
  unlimited: boolean;
  tracked: boolean;
}

export class QuotaService {
  constructor(private readonly repository: IQuotaRepository) {}

  private num(v: unknown): number | null {
    return v === 'unlimited' || v == null ? null : Number(v);
  }

  private monthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  /** Effective per-resource limits: license overrides ?? plan default ?? unlimited. */
  private async limits(garageId: string): Promise<Record<QuotaResource, number | null>> {
    const [license, sub] = await Promise.all([
      this.repository.activeLicense(garageId),
      this.repository.subscription(garageId),
    ]);
    const plan = (license?.plan ?? sub?.plan ?? 'STARTER') as PlanId;
    const planLimits = PLANS[plan]?.limits;
    const base: Record<QuotaResource, number | null> = {
      users: planLimits ? this.num(planLimits.users) : null,
      branches: planLimits ? this.num(planLimits.branches) : null,
      vehicles: null,
      garages: null,
      storageGb: planLimits ? this.num(planLimits.storageGb) : null,
      jobsPerMonth: planLimits ? this.num(planLimits.jobsPerMonth) : null,
      apiQuotaPerDay: null,
    };
    if (license) {
      const over = {
        users: license.maxUsers,
        branches: license.maxBranches,
        vehicles: license.maxVehicles,
        garages: license.maxGarages,
        storageGb: license.storageGb,
        apiQuotaPerDay: license.apiQuotaPerDay,
      };
      for (const k of Object.keys(over) as Array<keyof typeof over>) {
        if (over[k] != null) base[k as QuotaResource] = over[k] as number;
      }
    }
    return base;
  }

  async status(garageId: string): Promise<Record<QuotaResource, ResourceStatus>> {
    const [limits, usage] = await Promise.all([this.limits(garageId), this.repository.usage(garageId, this.monthStart())]);
    const usedOf = (r: QuotaResource): number | null =>
      TRACKED.includes(r) ? usage[r as keyof UsageCounts] ?? 0 : null;

    const out = {} as Record<QuotaResource, ResourceStatus>;
    for (const r of ALL) {
      const limit = limits[r];
      const used = usedOf(r);
      out[r] = {
        limit,
        used,
        remaining: limit != null && used != null ? Math.max(0, limit - used) : null,
        unlimited: limit == null,
        tracked: TRACKED.includes(r),
      };
    }
    return out;
  }

  /**
   * Would one more `resource` exceed the garage's limit? Returns `ok: true`
   * whenever the limit is unlimited or the usage is untracked (fail-open).
   */
  async check(resource: QuotaResource, garageId: string): Promise<{ ok: boolean; limit: number | null; used: number | null }> {
    const [limits, usage] = await Promise.all([this.limits(garageId), this.repository.usage(garageId, this.monthStart())]);
    const limit = limits[resource];
    if (limit == null) return { ok: true, limit: null, used: null };
    if (!TRACKED.includes(resource)) return { ok: true, limit, used: null };
    const used = usage[resource as keyof UsageCounts] ?? 0;
    return { ok: used < limit, limit, used };
  }
}
