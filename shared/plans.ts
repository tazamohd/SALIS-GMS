/**
 * SALIS AUTO — Subscription Plan Definitions
 *
 * Single source of truth for tier definitions, feature mapping, and the
 * mapping from feature-flag category → minimum required plan. Used by:
 *   • server/middleware/requirePlan.ts  — gates API routes
 *   • client/src/hooks/usePlan.ts       — gates UI
 *   • client/src/contexts/FeatureFlagContext.tsx — drives `<ProtectedRoute>`
 *   • client/src/config/navigation.ts   — drives sidebar minPlan
 *   • client/src/pages/Subscriptions.tsx — drives the comparison page
 *
 * Tier hierarchy: STARTER (0) → PRO (1) → ENTERPRISE (2)
 */

export type PlanId = "STARTER" | "PRO" | "ENTERPRISE";

export const PLAN_HIERARCHY: Record<PlanId, number> = {
  STARTER: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

/** Returns true if `userPlan` is at least `requiredPlan` in the hierarchy. */
export function meetsMinPlan(userPlan: PlanId | undefined | null, requiredPlan: PlanId | undefined | null): boolean {
  if (!requiredPlan) return true;
  if (!userPlan) return false;
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
}

/** Stripe price IDs (set via env in production; defaults are placeholders).
 *  Wrapped in a `typeof process` guard so this file is safe to import from
 *  client code too — Vite ships it to the browser where `process` is undefined.
 */
function envOrNull(key: string): string | null {
  if (typeof process === "undefined" || !process.env) return null;
  return process.env[key] ?? null;
}
export const STRIPE_PRICE_IDS: Record<PlanId, string | null> = {
  STARTER: null, // free tier
  PRO: envOrNull("STRIPE_PRICE_PRO"),
  ENTERPRISE: envOrNull("STRIPE_PRICE_ENTERPRISE"),
};

/** Feature-flag categories that unlock at each tier. */
export const PLAN_FEATURE_CATEGORIES: Record<PlanId, ReadonlyArray<string>> = {
  STARTER: [],
  PRO: [
    "ai_features",
    "hr_module",
    "advanced_finance",
    "marketing",
    "call_center",
  ],
  ENTERPRISE: [
    "ai_features",
    "hr_module",
    "advanced_finance",
    "marketing",
    "call_center",
    // ENTERPRISE-only:
    "iot_dashboard",
    "ar_vr",
    "blockchain",
    "emerging_tech",
  ],
};

/** Map every category to the minimum plan that unlocks it. */
export const CATEGORY_MIN_PLAN: Record<string, PlanId> = {
  ai_features: "PRO",
  hr_module: "PRO",
  advanced_finance: "PRO",
  marketing: "PRO",
  call_center: "PRO",
  iot_dashboard: "ENTERPRISE",
  ar_vr: "ENTERPRISE",
  blockchain: "ENTERPRISE",
  emerging_tech: "ENTERPRISE",
};

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  /** USD per month (display only — Stripe price IDs are the source of truth). */
  priceMonthly: number;
  /** Display currency code. */
  currency: string;
  /** Soft limits — shown on the comparison page; enforced separately when relevant. */
  limits: {
    users: number | "unlimited";
    branches: number | "unlimited";
    jobsPerMonth: number | "unlimited";
    storageGb: number | "unlimited";
  };
  /** Pillar features (shown on the comparison page). */
  highlights: string[];
  /** Feature-flag categories unlocked at this tier (computed). */
  featureCategories: ReadonlyArray<string>;
  /** Marketing badge ("Most popular", "Best value", etc). */
  badge?: string;
  /** Stripe price id (or null for free / contact-sales tiers). */
  stripePriceId: string | null;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  STARTER: {
    id: "STARTER",
    name: "Starter",
    tagline: "Run the workshop, send the invoice.",
    priceMonthly: 0,
    currency: "USD",
    limits: { users: 3, branches: 1, jobsPerMonth: 200, storageGb: 5 },
    highlights: [
      "Job cards, appointments, customers, vehicles",
      "Inventory & parts management",
      "Estimates & invoices",
      "Stripe payment processing",
      "Basic reports & dashboard",
      "Standard email support",
    ],
    featureCategories: PLAN_FEATURE_CATEGORIES.STARTER,
    stripePriceId: STRIPE_PRICE_IDS.STARTER,
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    tagline: "Add AI, marketing, HR, full accounting.",
    priceMonthly: 79,
    currency: "USD",
    limits: { users: 15, branches: 3, jobsPerMonth: 2000, storageGb: 50 },
    highlights: [
      "Everything in Starter",
      "AI features (predictive maintenance, smart recs, voice, OCR)",
      "Marketing automation, loyalty, WhatsApp, SMS",
      "Advanced accounting: GL, AR/AP, balance sheet, budget",
      "HR & payroll module",
      "Call center & chat dashboards",
      "Priority email + chat support",
    ],
    featureCategories: PLAN_FEATURE_CATEGORIES.PRO,
    badge: "Most popular",
    stripePriceId: STRIPE_PRICE_IDS.PRO,
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    tagline: "Unlimited scale, every emerging tech, white-glove.",
    priceMonthly: 299,
    currency: "USD",
    limits: { users: "unlimited", branches: "unlimited", jobsPerMonth: "unlimited", storageGb: "unlimited" },
    highlights: [
      "Everything in Pro",
      "IoT dashboards & vehicle telemetry",
      "AR repair guides + 3D parts + video estimates",
      "Blockchain service history + smart contracts",
      "Drone inspection, digital twin, edge computing",
      "Multi-franchise command center",
      "SSO / SAML & SCIM provisioning",
      "Dedicated account manager + SLA",
    ],
    featureCategories: PLAN_FEATURE_CATEGORIES.ENTERPRISE,
    badge: "Best value",
    stripePriceId: STRIPE_PRICE_IDS.ENTERPRISE,
  },
};

export const ALL_PLAN_IDS: PlanId[] = ["STARTER", "PRO", "ENTERPRISE"];

export interface SubscriptionStatus {
  garageId: string;
  plan: PlanId;
  /** active | trialing | past_due | canceled | unpaid */
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
  canceledAt: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
}

export interface PlanFeaturesResponse {
  plans: PlanDefinition[];
  /** category → minimum plan id */
  categoryMinPlan: Record<string, PlanId>;
  hierarchy: Record<PlanId, number>;
}
