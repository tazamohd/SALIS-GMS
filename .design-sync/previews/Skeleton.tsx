import { Skeleton } from "rest-express";

export const JobCardRows = () => (
  <div className="flex flex-col gap-4 p-4 w-full">
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex items-center gap-3 w-full">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export const InvoiceSummaryCard = () => (
  <div className="p-4 w-full">
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  </div>
);

export const VehicleGrid = () => (
  <div className="grid grid-cols-3 gap-3 p-4 w-full">
    {[0, 1, 2].map((i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    ))}
  </div>
);
