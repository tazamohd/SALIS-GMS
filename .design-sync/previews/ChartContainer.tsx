import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "rest-express";
import type { ChartConfig } from "rest-express";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

const weeklyRevenue = [
  { day: "Sat", revenue: 9800, parts: 3200 },
  { day: "Sun", revenue: 12400, parts: 4100 },
  { day: "Mon", revenue: 11250, parts: 3650 },
  { day: "Tue", revenue: 13800, parts: 4900 },
  { day: "Wed", revenue: 10600, parts: 3300 },
  { day: "Thu", revenue: 15200, parts: 5400 },
];

const revenueConfig = {
  revenue: { label: "Labour (SAR)", color: "#0A5ED7" },
  parts: { label: "Parts (SAR)", color: "#F97316" },
} satisfies ChartConfig;

export const WeeklyRevenueBars = () => (
  <div className="w-full">
    <p className="mb-2 text-sm font-medium">Weekly revenue — Al Malaz branch</p>
    <ChartContainer
      config={revenueConfig}
      style={{ width: "100%", height: 260 }}
    >
      <BarChart data={weeklyRevenue}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={48} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
        <Bar dataKey="parts" fill="var(--color-parts)" radius={4} />
      </BarChart>
    </ChartContainer>
  </div>
);

const jobsCompleted = [
  { week: "W19", jobs: 38 },
  { week: "W20", jobs: 45 },
  { week: "W21", jobs: 41 },
  { week: "W22", jobs: 52 },
  { week: "W23", jobs: 49 },
  { week: "W24", jobs: 57 },
];

const jobsConfig = {
  jobs: { label: "Job cards closed", color: "#0BB3FF" },
} satisfies ChartConfig;

export const JobsCompletedLine = () => (
  <div className="w-full">
    <p className="mb-2 text-sm font-medium">Job cards closed per week</p>
    <ChartContainer config={jobsConfig} style={{ width: "100%", height: 240 }}>
      <LineChart data={jobsCompleted}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Line
          dataKey="jobs"
          type="monotone"
          stroke="var(--color-jobs)"
          strokeWidth={2}
          dot={{ fill: "var(--color-jobs)", r: 3 }}
        />
      </LineChart>
    </ChartContainer>
  </div>
);
