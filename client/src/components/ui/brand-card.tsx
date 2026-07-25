import { cn } from "@/lib/utils";

interface BrandCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function BrandCard({ children, className, hover = true, onClick }: BrandCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground transition-all duration-200",
        "border-border dark:border-[#232A36]",
        "bg-white dark:bg-[#151A23]",
        hover && "hover-lift cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  value: string | number;
  label: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  value,
  label,
  subtitle,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <BrandCard className={cn("p-6", className)}>
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground font-mono">
            {value}
          </span>
          {trend && trendValue && (
            <span
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-[#0BB3FF]",
                trend === "down" && "text-[#F97316]",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trendValue}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </BrandCard>
  );
}
