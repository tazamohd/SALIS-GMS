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
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/50',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400'
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-100 dark:bg-blue-900/50',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400'
  },
  violet: {
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-100 dark:bg-violet-900/50',
    border: 'border-violet-200 dark:border-violet-800',
    text: 'text-violet-700 dark:text-violet-400'
  },
  amber: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400'
  },
  rose: {
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-100 dark:bg-rose-900/50',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-400'
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
