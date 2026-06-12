import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

/**
 * Feature flag categories that map routes to logical feature groups.
 * When a flag matching a category name is enabled, all routes in that category become accessible.
 */
export const FLAG_CATEGORIES = {
  ai_features: [
    "/ai-automation",
    "/ai-chatbot",
    "/ai-chatbot-assistant",
    "/ai-scheduling",
    "/ai-service-advisor",
    "/predictive-maintenance",
    "/predictive-diagnostics",
    "/smart-parts-recommendations",
    "/smart-parts-recommender",
    "/smart-damage-assessment",
    "/smart-inventory-forecasting",
    "/intelligent-price-optimizer",
    "/smart-assignment",
    "/voice-commands",
    "/voice-command-interface",
    "/document-ocr",
    "/ml-fraud-detection",
    "/dynamic-pricing",
    "/ai-insights",
    "/neural-network-prediction",
    "/predictive-demand-forecasting",
  ],
  iot_dashboard: [
    "/iot-dashboard",
    "/service-bay-dashboard",
    "/vehicle-health-monitoring",
    "/telematics-integration",
    "/sensor-monitoring",
    "/obd-diagnostic-viewer",
  ],
  blockchain: [
    "/parts-supply-network",
    "/parts-marketplace",
    "/blockchain-service-history",
    "/smart-contracts",
  ],
  ar_vr: [
    "/interactive-3d-parts",
    "/digital-vehicle-walkaround",
    "/video-estimates",
    "/video-consultations",
    "/ar-repair-guide",
  ],
  advanced_finance: [
    "/balance-sheet",
    "/general-ledger",
    "/chart-of-accounts",
    "/journal-entries",
    "/trial-balance",
    "/income-statement",
    "/cash-flow-statement",
    "/accounts-receivable",
    "/accounts-payable",
    "/cost-centers",
    "/budget-management",
    "/accounting-integration",
    "/bank-account-management",
    "/assets-management",
    "/liabilities-management",
    "/equity-management",
    "/capital-management",
    "/partners-current-account",
    "/retained-earnings",
    "/loss-account",
    "/profit-analysis",
    "/financial-settings",
    "/currency-settings",
  ],
  hr_module: [
    "/hr-management",
    "/hr-payroll",
    "/payroll-management",
    "/timeclock-payroll",
    "/timesheet-management",
    "/staff-performance-review",
    "/technician-performance",
    "/technician-leaderboards",
  ],
  call_center: [
    "/call-center",
    "/support-chat-dashboard",
    "/chat",
    "/direct-messages",
  ],
  marketing: [
    "/email-marketing-campaigns",
    "/marketing-automation",
    "/marketing-hub",
    "/loyalty-program",
    "/customer-loyalty",
    "/crm-loyalty",
    "/referral-program",
    "/sms-campaigns",
    "/whatsapp",
    "/google-my-business",
    "/social-media-integration",
    "/social-media-monitoring",
  ],
  emerging_tech: [
    "/drone-inspection",
    "/digital-twin-viewer",
    "/computer-vision-qc",
    "/edge-computing",
    "/emerging-technologies",
    "/nextgen-technologies",
    "/wearable-integration",
    "/license-plate",
    "/security-cameras",
    "/barcode-scanner",
    "/digital-signage",
    "/sustainable-energy-monitoring",
    "/mobile-device-management",
  ],
} as const;

export type FlagCategory = keyof typeof FLAG_CATEGORIES;

// Build a reverse lookup: path -> category
const PATH_TO_CATEGORY: Record<string, FlagCategory> = {};
for (const [category, paths] of Object.entries(FLAG_CATEGORIES)) {
  for (const path of paths) {
    PATH_TO_CATEGORY[path] = category as FlagCategory;
  }
}

interface FeatureFlag {
  id: string;
  garageId: string;
  flagName: string;
  isEnabled: boolean;
  source?: string;
  createdAt?: string;
}

interface FeatureFlagContextValue {
  /** Check if a specific flag name is enabled */
  isFeatureEnabled: (flagName: string) => boolean;
  /** Check if a route path is accessible based on its category flag */
  isRouteEnabled: (path: string) => boolean;
  /** Get the category for a given route path (undefined if it is a core route) */
  getCategoryForRoute: (path: string) => FlagCategory | undefined;
  /** All raw flags from the API */
  flags: FeatureFlag[];
  /** Whether flags are still loading */
  isLoading: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  isFeatureEnabled: () => false,
  isRouteEnabled: () => true,
  getCategoryForRoute: () => undefined,
  flags: [],
  isLoading: true,
});

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const { data: flags = [], isLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["/api/feature-flags"],
    queryFn: async () => {
      const res = await fetch("/api/feature-flags", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  const isFeatureEnabled = useCallback(
    (flagName: string): boolean => {
      const flag = flags.find((f) => f.flagName === flagName);
      return flag?.isEnabled ?? false;
    },
    [flags]
  );

  const getCategoryForRoute = useCallback((path: string): FlagCategory | undefined => {
    return PATH_TO_CATEGORY[path];
  }, []);

  const isRouteEnabled = useCallback(
    (path: string): boolean => {
      const category = PATH_TO_CATEGORY[path];
      // If the route is not in any category, it is a core route — always enabled
      if (!category) return true;
      return isFeatureEnabled(category);
    },
    [isFeatureEnabled]
  );

  return (
    <FeatureFlagContext.Provider
      value={{ isFeatureEnabled, isRouteEnabled, getCategoryForRoute, flags, isLoading }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}
