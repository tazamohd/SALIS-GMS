import type { ReactNode } from "react";
import { useFeatureFlags, type FlagCategory } from "@/contexts/FeatureFlagContext";
import { Layout } from "@/components/Layout";

const CATEGORY_LABELS: Record<FlagCategory, string> = {
  ai_features: "AI & Automation",
  iot_dashboard: "IoT & Sensors",
  blockchain: "Blockchain & Supply Chain",
  ar_vr: "AR/VR & 3D",
  advanced_finance: "Advanced Finance",
  hr_module: "HR & Payroll",
  call_center: "Call Center & Support",
  marketing: "Marketing & CRM",
  emerging_tech: "Emerging Technologies",
};

interface ProtectedRouteProps {
  /** The feature flag category that gates this route */
  flag: FlagCategory;
  /** The actual page component to render when the flag is enabled */
  children: ReactNode;
}

/**
 * Wraps a non-core route. When the corresponding feature flag category
 * is disabled, shows a "Coming Soon" card instead of the actual page.
 */
export function ProtectedRoute({ flag, children }: ProtectedRouteProps) {
  const { isFeatureEnabled, isLoading } = useFeatureFlags();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A5ED7]" />
      </div>
    );
  }

  if (!isFeatureEnabled(flag)) {
    return <ComingSoonCard category={flag} />;
  }

  return <>{children}</>;
}

function ComingSoonCard({ category }: { category: FlagCategory }) {
  const label = CATEGORY_LABELS[category] ?? category;

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md w-full bg-white dark:bg-[#1A1F2E] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[#0A5ED7]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Coming Soon
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span> module
          is not enabled for your garage yet.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Contact your administrator to enable this feature, or visit{" "}
          <a href="/settings" className="text-[#0A5ED7] hover:underline">
            Settings
          </a>{" "}
          to manage feature flags.
        </p>
      </div>
    </div>
  );
}
