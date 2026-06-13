import { LinearLoader } from "rest-express";

export const Sizes = () => (
  <div className="flex flex-col gap-6 p-6 w-full">
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">sm — syncing parts catalogue</p>
      <LinearLoader size="sm" />
    </div>
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">md — loading job cards</p>
      <LinearLoader size="md" />
    </div>
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">lg — generating invoice PDF</p>
      <LinearLoader size="lg" />
    </div>
  </div>
);

export const ConstrainedWidth = () => (
  <div className="flex flex-col items-start gap-4 p-6 w-full">
    <div className="rounded-lg border p-4 w-full space-y-3">
      <p className="text-sm font-medium">Fetching vehicle history…</p>
      <LinearLoader className="w-48" size="md" />
    </div>
  </div>
);
