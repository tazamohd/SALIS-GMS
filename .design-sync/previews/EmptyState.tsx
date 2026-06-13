import { EmptyState } from "rest-express";

export const WithAction = () => (
  <div className="p-4 w-full">
    <EmptyState
      title="No job cards yet"
      description="Open your first job card to start tracking repairs, parts and technician hours for this vehicle."
      actionLabel="Create Job Card"
      onAction={() => {}}
    />
  </div>
);

export const NoAction = () => (
  <div className="p-4 w-full">
    <EmptyState
      title="No invoices found"
      description="No invoices match the selected period. Try widening the date range or clearing the customer filter."
    />
  </div>
);
