import { StatCard } from "rest-express";

export const RevenueUp = () => (
  <StatCard
    value="SAR 12,480"
    label="Today's Revenue"
    subtitle="Across 14 closed invoices"
    trend="up"
    trendValue="8.2% vs yesterday"
    className="w-full max-w-xs"
  />
);

export const OpenJobCards = () => (
  <StatCard
    value={23}
    label="Open Job Cards"
    subtitle="6 awaiting parts, 4 ready for delivery"
    trend="down"
    trendValue="3 fewer than last week"
    className="w-full max-w-xs"
  />
);

export const VehiclesInWorkshop = () => (
  <StatCard
    value={9}
    label="Vehicles In Workshop"
    subtitle="Capacity 12 bays"
    trend="neutral"
    trendValue="no change"
    className="w-full max-w-xs"
  />
);

export const NoTrend = () => (
  <StatCard
    value="4h 35m"
    label="Avg. Turnaround"
    subtitle="Quick-service lane, last 7 days"
    className="w-full max-w-xs"
  />
);
