import { StatusBadge } from "rest-express";

export const GreenFamily = () => (
  <div className="flex flex-wrap items-center gap-2">
    <StatusBadge status="completed" />
    <StatusBadge status="paid" />
    <StatusBadge status="delivered" />
  </div>
);

export const BlueFamily = () => (
  <div className="flex flex-wrap items-center gap-2">
    <StatusBadge status="in_progress" />
    <StatusBadge status="repair" />
    <StatusBadge status="assigned" />
    <StatusBadge status="sent" />
  </div>
);

export const YellowFamily = () => (
  <div className="flex flex-wrap items-center gap-2">
    <StatusBadge status="pending" />
    <StatusBadge status="waiting" />
    <StatusBadge status="draft" />
  </div>
);

export const RedFamily = () => (
  <div className="flex flex-wrap items-center gap-2">
    <StatusBadge status="cancelled" />
    <StatusBadge status="unpaid" />
    <StatusBadge status="overdue" />
  </div>
);

export const FallbackAndSpaces = () => (
  <div className="flex flex-wrap items-center gap-2">
    <StatusBadge status="quality check" />
    <StatusBadge status="In Progress" />
    <StatusBadge status="archived" />
  </div>
);
