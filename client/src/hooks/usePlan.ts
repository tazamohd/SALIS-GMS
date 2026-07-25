import { useQuery } from "@tanstack/react-query";
import {
  type PlanId,
  type PlanDefinition,
  PLANS,
  PLAN_HIERARCHY,
  CATEGORY_MIN_PLAN,
  meetsMinPlan,
} from "@shared/plans";

export interface SubscriptionSnapshot {
  garageId: string;
  plan: PlanId;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
  canceledAt: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
}

interface PlanCatalogResponse {
  plans: PlanDefinition[];
  categoryMinPlan: Record<string, PlanId>;
  hierarchy: Record<PlanId, number>;
}

/**
 * usePlan — single source of truth for the current garage's subscription
 * tier. Returns helpers for cheap client-side gating checks. Server-side
 * `requirePlan()` is still the source of truth — this hook only drives UI.
 */
export function usePlan() {
  const { data, isLoading } = useQuery<SubscriptionSnapshot>({
    queryKey: ["/api/subscriptions/current"],
    staleTime: 60 * 1000,
    retry: 1,
  });

  const plan = (data?.plan ?? "STARTER") as PlanId;
  const status = data?.status ?? "active";

  return {
    /** Raw subscription record (or undefined while loading / unauthenticated). */
    subscription: data,
    /** Current plan id — defaults to STARTER if unknown. */
    plan,
    /** Current subscription status. */
    status,
    isLoading,

    /** Hardcoded plan definition for the current plan. */
    definition: PLANS[plan],

    /** True when caller's plan is at least `minPlan`. */
    hasPlan: (minPlan: PlanId) => meetsMinPlan(plan, minPlan),

    /** True when the feature-flag category is unlocked by the current plan. */
    isCategoryAllowed: (category: string) => {
      const required = CATEGORY_MIN_PLAN[category];
      if (!required) return true;
      return meetsMinPlan(plan, required);
    },

    /** Minimum plan required for a category (or undefined if always-free). */
    minPlanForCategory: (category: string): PlanId | undefined =>
      CATEGORY_MIN_PLAN[category],
  };
}

/** usePlanCatalog — loads the public plan list for the comparison page. */
export function usePlanCatalog() {
  return useQuery<PlanCatalogResponse>({
    queryKey: ["/api/plans"],
    staleTime: 5 * 60 * 1000,
  });
}

export { PLAN_HIERARCHY, PLANS };
export type { PlanDefinition };
