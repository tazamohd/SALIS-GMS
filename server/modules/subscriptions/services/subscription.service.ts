/**
 * Subscription service (Phase E5 — business layer). Owns the billing rules for
 * the subscriptions domain: the public plan catalog, the current-subscription
 * projection, the plan-change period math + Stripe-readiness note, the
 * cancel-at-period-end / resume transitions, and the platform-admin list/patch.
 * Runtime values (now, whether Stripe is configured) are supplied by the
 * controller. No HTTP, no data-layer access. Behavior mirrors the retired
 * `server/routes/subscriptions.ts`.
 */

import {
  ALL_PLAN_IDS,
  CATEGORY_MIN_PLAN,
  PLAN_HIERARCHY,
  PLANS,
  type PlanId,
} from '@shared/plans';
import type { Subscription } from '@shared/schema';
import type { ISubscriptionRepository } from '../repositories/subscription.repository';

// storage patch shape is loosely typed at the seam.
type Any = any;

export class SubscriptionService {
  constructor(private readonly repo: ISubscriptionRepository) {}

  /** Public plan catalog + tier matrix. */
  planCatalog() {
    return {
      plans: ALL_PLAN_IDS.map((id) => PLANS[id]),
      categoryMinPlan: CATEGORY_MIN_PLAN,
      hierarchy: PLAN_HIERARCHY,
    };
  }

  async current(garageId: string) {
    const sub = await this.repo.ensure(garageId);
    return {
      garageId: sub.garageId,
      plan: sub.plan,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAt: sub.cancelAt,
      canceledAt: sub.canceledAt,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      stripeCustomerId: sub.stripeCustomerId,
    };
  }

  async changePlan(garageId: string, plan: PlanId, now: Date, stripeConfigured: boolean) {
    const stripeReady = stripeConfigured && plan !== 'STARTER';
    // Until Stripe checkout is wired, apply the change in-DB so gating works
    // end-to-end. Production replaces this with a Checkout-session redirect.
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    const updated = await this.repo.update(garageId, {
      plan,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: oneMonthLater,
      cancelAt: null,
      canceledAt: null,
    });
    return {
      ok: true,
      subscription: updated,
      stripeReady,
      note: stripeReady
        ? 'Stripe is configured; live checkout will be wired separately.'
        : 'Stripe not configured — applied plan change directly for development.',
    };
  }

  async cancel(garageId: string, now: Date) {
    const sub = await this.repo.ensure(garageId);
    const cancelAt = sub.currentPeriodEnd ?? now;
    const updated = await this.repo.update(garageId, { cancelAt });
    return { ok: true, subscription: updated };
  }

  async resume(garageId: string) {
    const updated = await this.repo.update(garageId, {
      cancelAt: null,
      canceledAt: null,
      status: 'active',
    });
    return { ok: true, subscription: updated };
  }

  listAll(): Promise<Subscription[]> {
    return this.repo.listAll();
  }

  async adminPatch(garageId: string, data: Any) {
    await this.repo.ensure(garageId);
    const updated = await this.repo.update(garageId, data);
    return { ok: true, subscription: updated };
  }
}
