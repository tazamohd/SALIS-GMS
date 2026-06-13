import { ChartCard, ChartContainer } from "rest-express";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const monthlyRevenue = [
  { month: "Jan", revenue: 84200 },
  { month: "Feb", revenue: 91800 },
  { month: "Mar", revenue: 78400 },
  { month: "Apr", revenue: 102300 },
  { month: "May", revenue: 96100 },
  { month: "Jun", revenue: 112800 },
];

const revenueConfig = {
  revenue: { label: "Revenue (SAR)", color: "#0A5ED7" },
};

export const RevenueWithChart = () => (
  <ChartCard
    title="Monthly Revenue"
    metric="SAR 112,800"
    delta={12.4}
    deltaLabel="vs May"
    className="w-full max-w-md"
  >
    <ChartContainer config={revenueConfig} style={{ width: "100%", height: 180 }}>
      <BarChart data={monthlyRevenue}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={6} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  </ChartCard>
);

export const NegativeDelta = () => (
  <ChartCard
    title="Avg. Repair Time"
    metric="6.2 hrs"
    delta={-4.8}
    deltaLabel="vs last month"
    className="w-full max-w-md"
  />
);

export const NeutralDelta = () => (
  <ChartCard
    title="Vehicles In Workshop"
    metric={9}
    delta={0}
    deltaLabel="vs yesterday"
    className="w-full max-w-md"
  />
);

export const MetricOnly = () => (
  <ChartCard
    title="Parts Stock Value"
    metric="SAR 248,650"
    className="w-full max-w-md"
  />
);
