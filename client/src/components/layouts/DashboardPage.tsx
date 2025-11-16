import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { StandardPageLayout } from "./StandardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", metricsClassName)}>
        {metrics.map((metric, idx) => (
          <Card
            key={idx}
            className="interactive-card border-border bg-card hover:shadow-lg transition-all"
            data-testid={`metric-card-${idx}`}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {metric.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  {metric.trend && (
                    <p className={cn(
                      "text-xs sm:text-sm mt-2 font-medium",
                      metric.trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {metric.trend.isPositive ? "↑" : "↓"} {metric.trend.value}
                    </p>
                  )}
                </div>
                <metric.icon
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10",
                    metric.color || "text-primary"
                  )}
                  aria-hidden="true"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard Content */}
      {children}
    </StandardPageLayout>
  );
}
