import { ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { StandardPageLayout } from "./StandardPageLayout";
import { cn } from "@/lib/utils";

interface MetricCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface DashboardPageProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  metrics: MetricCard[];
  children: ReactNode;
  metricsClassName?: string;
}

const colorSchemes: Record<string, { gradient: string; bg: string; border: string; text: string }> = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/50',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400'
  },
  cyan: {
    gradient: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-100 dark:bg-cyan-900/50',
    border: 'border-cyan-200 dark:border-cyan-800',
    text: 'text-cyan-700 dark:text-cyan-400'
  },
  sky: {
    gradient: 'from-sky-500 to-sky-600',
    bg: 'bg-sky-100 dark:bg-sky-900/50',
    border: 'border-sky-200 dark:border-sky-800',
    text: 'text-sky-700 dark:text-sky-400'
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/50',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-400'
  },
  slate: {
    gradient: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-100 dark:bg-slate-900/50',
    border: 'border-slate-200 dark:border-slate-800',
    text: 'text-slate-700 dark:text-slate-400'
  },
};

const colorKeys = Object.keys(colorSchemes);

export function DashboardPage({
  title,
  description,
  icon,
  metrics,
  children,
  metricsClassName,
}: DashboardPageProps) {
  return (
    <StandardPageLayout
      title={title}
      description={description}
      icon={icon}
    >
      {/* Metrics Grid */}
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", metricsClassName)}>
        {metrics.map((metric, idx) => {
          const colorKey = colorKeys[idx % colorKeys.length];
          const scheme = colorSchemes[colorKey];
          
          return (
            <div
              key={idx}
              className="group"
              data-testid={`metric-card-${idx}`}
            >
              <div className={cn(
                "h-full bg-white dark:bg-gray-800 rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow duration-200",
                scheme.border
              )}>
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-2 rounded-xl", scheme.bg)}>
                        <metric.icon className={cn("w-5 h-5", scheme.text)} />
                      </div>
                      <span className={cn("text-sm font-medium", scheme.text)}>{metric.label}</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white font-montserrat">
                        {metric.value}
                      </h3>
                      {metric.trend && (
                        <div className={cn(
                          "flex items-center gap-1",
                          metric.trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        )}>
                          {metric.trend.isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="text-xs font-medium">{metric.trend.value}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <div className={cn("absolute inset-0 rounded-full blur-xl", scheme.bg)}></div>
                    <div className={cn(
                      "relative w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
                      scheme.gradient
                    )}>
                      <metric.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Content */}
      {children}
    </StandardPageLayout>
  );
}
