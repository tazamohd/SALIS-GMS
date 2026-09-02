import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { CARD, EYEBROW, FIGURE } from "./statusTokens";

interface TrendSeries {
  data: Record<string, unknown>[];
  change: number;
}

interface KpiBandProps {
  totalRevenue: number;
  revenueTrend?: TrendSeries;
  jobsTrend?: TrendSeries;
  visitsTrend?: TrendSeries;
  activeJobs: number;
  pendingCount: number;
  repairCount: number;
  customersCount: number;
  inventoryPercentage: number;
  inStockParts: number;
  totalInventoryItems: number;
}

function Delta({ change }: { change: number }) {
  if (!change) {
    return <span className="text-xs tabular-nums text-[#8593A8] dark:text-[#6B7B93]">&mdash;</span>;
  }
  const isUp = change > 0;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  const tone = isUp
    ? "text-[#127954] dark:text-[#43BC8E]"
    : "text-[#B23A36] dark:text-[#E4736E]";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${tone}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {isUp ? "+" : ""}
      {change}%
    </span>
  );
}

function Sparkline({
  data,
  dataKey,
  color,
  className = "w-28 h-10",
}: {
  data?: Record<string, unknown>[];
  dataKey: string;
  color: string;
  className?: string;
}) {
  if (!data || data.length === 0) return null;
  return (
    <div className={className} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * One dominant figure plus three secondary ones. The previous band gave all four
 * metrics identical cards, identical 3xl weights and identical icon medallions,
 * so nothing led the page. Hierarchy here comes from scale, not decoration.
 */
export function KpiBand({
  totalRevenue,
  revenueTrend,
  jobsTrend,
  visitsTrend,
  activeJobs,
  pendingCount,
  repairCount,
  customersCount,
  inventoryPercentage,
  inStockParts,
  totalInventoryItems,
}: KpiBandProps) {
  const { t } = useTranslation();

  return (
    <section
      className="grid grid-cols-2 lg:grid-cols-6 gap-3"
      aria-label={t("dashboard.keyFigures", "Key figures")}
    >
      <div className={`${CARD} col-span-2 lg:col-span-3 p-5 md:p-6`} data-testid="card-revenue">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className={EYEBROW}>{t("dashboard.totalRevenue", "Total revenue")}</span>
            <div className={`${FIGURE} text-4xl md:text-5xl leading-none mt-2`}>
              {totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              <span className="ms-2 text-base font-semibold tracking-normal text-[#55637A] dark:text-[#93A2B8]">
                SAR
              </span>
            </div>
          </div>
          <Sparkline data={revenueTrend?.data} dataKey="revenue" color="#0A5ED7" />
        </div>
        <div className="flex items-center gap-3 mt-4 text-[13px] text-[#55637A] dark:text-[#93A2B8]">
          <Delta change={revenueTrend?.change ?? 0} />
          <span>{t("dashboard.vsPreviousPeriod", "vs. previous period")}</span>
        </div>
      </div>

      <div className={`${CARD} p-5`} data-testid="card-active-jobs">
        <span className={EYEBROW}>{t("dashboard.activeJobs", "Active jobs")}</span>
        <div className={`${FIGURE} text-3xl leading-tight mt-2`}>{activeJobs}</div>
        <p className="mt-1 text-xs text-[#55637A] dark:text-[#93A2B8] tabular-nums">
          {pendingCount} {t("dashboard.pendingShort", "pending")} &middot; {repairCount}{" "}
          {t("dashboard.inRepairShort", "in repair")}
        </p>
        <div className="mt-2">
          <Delta change={jobsTrend?.change ?? 0} />
        </div>
      </div>

      <div className={`${CARD} p-5`} data-testid="card-customers">
        <span className={EYEBROW}>{t("dashboard.totalCustomers", "Customers")}</span>
        <div className={`${FIGURE} text-3xl leading-tight mt-2`}>{customersCount}</div>
        <p className="mt-1 text-xs text-[#55637A] dark:text-[#93A2B8]">
          {t("dashboard.onRecord", "on record")}
        </p>
        <div className="mt-2">
          <Delta change={visitsTrend?.change ?? 0} />
        </div>
      </div>

      <div className={`${CARD} p-5`} data-testid="card-inventory">
        <span className={EYEBROW}>{t("dashboard.partsInventory", "Inventory")}</span>
        <div className={`${FIGURE} text-3xl leading-tight mt-2`}>
          {inventoryPercentage}
          <span className="ms-0.5 text-base font-semibold tracking-normal text-[#55637A] dark:text-[#93A2B8]">
            %
          </span>
        </div>
        <p className="mt-1 text-xs text-[#55637A] dark:text-[#93A2B8] tabular-nums">
          {inStockParts}/{totalInventoryItems} {t("dashboard.inStock", "in stock")}
        </p>
        <div className="mt-3 h-1 rounded-full bg-[#DFE5EE] dark:bg-[#222C3C] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#E4670B] dark:bg-[#F98B36]"
            style={{ width: `${Math.min(100, Math.max(0, inventoryPercentage))}%` }}
          />
        </div>
      </div>
    </section>
  );
}
