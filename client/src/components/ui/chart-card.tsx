import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface ChartCardProps {
  title: string;
  metric: string | number;
  delta?: number;
  deltaLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  metric,
  delta,
  deltaLabel,
  children,
  className,
}: ChartCardProps) {
  const isPositive = delta && delta > 0;
  const isNegative = delta && delta < 0;
  const isNeutral = delta === 0 || delta === undefined;

  return (
    <Card className={cn("hover-lift", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-foreground font-mono">
            {metric}
          </span>
          {delta !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositive && "text-[#0BB3FF]",
                isNegative && "text-[#F97316]",
                isNeutral && "text-muted-foreground"
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {isNeutral && <Minus className="h-3 w-3" />}
              <span>
                {isPositive && "+"}
                {delta}%
              </span>
              {deltaLabel && (
                <span className="text-muted-foreground">{deltaLabel}</span>
              )}
            </div>
          )}
        </div>
        {children && <div className="chart-animate">{children}</div>}
      </CardContent>
    </Card>
  );
}
