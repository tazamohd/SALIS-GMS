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
  primary: {
    gradient: 'from-primary to-primary/80',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    text: 'text-primary'
  },
  secondary: {
    gradient: 'from-secondary to-secondary/80',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
    text: 'text-secondary'
  },
  tertiary: {
    gradient: 'from-info to-primary',
    bg: 'bg-info/10',
    border: 'border-info/20',
    text: 'text-info'
  },
  muted: {
    gradient: 'from-muted-foreground to-primary',
    bg: 'bg-muted',
    border: 'border-border',
    text: 'text-muted-foreground'
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
                "h-full bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200",
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
                      <h3 className="text-3xl font-black text-foreground font-montserrat">
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
