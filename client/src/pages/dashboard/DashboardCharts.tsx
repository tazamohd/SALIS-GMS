import { useTranslation } from "react-i18next";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CARD, EYEBROW, MIX_COLORS } from "./statusTokens";

interface RevenuePoint {
  month: string;
  revenue: number;
}

interface StatusSlice {
  name: string;
  value: number;
  status: string;
}

interface DashboardChartsProps {
  revenue?: RevenuePoint[];
  jobStatus?: StatusSlice[];
  isLoading: boolean;
}

/**
 * Recharts' default tooltip takes a hardcoded `contentStyle`, which is how the
 * old chart ended up with a near-white panel in dark mode. Rendering our own
 * lets it follow the theme.
 */
function ThemedTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#DFE5EE] dark:border-[#222C3C] bg-white dark:bg-[#111722] px-3 py-2 shadow-lg">
      <div className="text-[11px] uppercase tracking-wider text-[#8593A8] dark:text-[#6B7B93]">
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums text-[#0B1F3B] dark:text-[#EAEFF7]">
        SAR {payload[0].value.toLocaleString()}
      </div>
    </div>
  );
}

function Panel({
  title,
  meta,
  children,
  testId,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <div className={`${CARD} p-5 md:p-6`} data-testid={testId}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <h2 className="text-[15px] font-semibold text-[#0B1F3B] dark:text-[#EAEFF7]">{title}</h2>
        <span className={EYEBROW}>{meta}</span>
      </div>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="h-[260px] flex items-center justify-center">
      <div className="w-7 h-7 border-[3px] border-[#0A5ED7]/20 border-t-[#0A5ED7] rounded-full animate-spin" />
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="h-[260px] flex items-center justify-center text-sm text-[#55637A] dark:text-[#93A2B8]">
      {message}
    </div>
  );
}

export function DashboardCharts({ revenue, jobStatus, isLoading }: DashboardChartsProps) {
  const { t } = useTranslation();

  const mixTotal = (jobStatus ?? []).reduce((sum, s) => sum + s.value, 0);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-3">
      <Panel
        title={t("dashboard.revenuePerMonth", "Revenue trend")}
        meta={t("dashboard.revenueMeta", "SAR per month")}
        testId="card-revenue-chart"
      >
        {isLoading ? (
          <Spinner />
        ) : revenue && revenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A5ED7" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#0A5ED7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fill: "#8593A8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fill: "#8593A8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip content={<ThemedTooltip />} cursor={{ stroke: "#C6D0DE", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0A5ED7"
                strokeWidth={2.25}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Empty message={t("dashboard.noRevenueData", "No revenue data available")} />
        )}
      </Panel>

      {/*
       * A donut with five near-identical slices is hard to compare, and the old
       * PIE_COLORS array repeated #0A5ED7 at index 0 and 2 so two slices drew the
       * same colour. A stacked bar with the counts spelled out reads faster and
       * gives every category its own hue.
       */}
      <Panel
        title={t("dashboard.jobsByStatus", "Job mix")}
        meta={`${mixTotal} ${t("dashboard.open", "open")}`}
        testId="card-status-chart"
      >
        {isLoading ? (
          <Spinner />
        ) : jobStatus && jobStatus.length > 0 && mixTotal > 0 ? (
          <>
            <div
              className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-5"
              role="img"
              aria-label={jobStatus.map((s) => `${s.name}: ${s.value}`).join(", ")}
            >
              {jobStatus.map((slice, i) => (
                <span
                  key={slice.status ?? slice.name}
                  className="h-full"
                  style={{
                    width: `${(slice.value / mixTotal) * 100}%`,
                    backgroundColor: MIX_COLORS[i % MIX_COLORS.length],
                  }}
                />
              ))}
            </div>
            <ul className="flex flex-col">
              {jobStatus.map((slice, i) => (
                <li
                  key={slice.status ?? slice.name}
                  className="grid grid-cols-[9px_1fr_auto_auto] items-center gap-2.5 py-2 border-t border-[#DFE5EE] dark:border-[#222C3C] first:border-t-0 text-[13px]"
                >
                  <span
                    className="w-[9px] h-[9px] rounded-sm"
                    style={{ backgroundColor: MIX_COLORS[i % MIX_COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span className="text-[#0B1F3B] dark:text-[#EAEFF7] truncate">{slice.name}</span>
                  <span className="font-medium tabular-nums text-[#0B1F3B] dark:text-[#EAEFF7]">
                    {slice.value}
                  </span>
                  <span className="w-9 text-end text-xs tabular-nums text-[#8593A8] dark:text-[#6B7B93]">
                    {Math.round((slice.value / mixTotal) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Empty message={t("dashboard.noJobStatusData", "No job data available")} />
        )}
      </Panel>
    </section>
  );
}

