import { Separator } from "rest-express";

export const SectionDivider = () => (
  <div className="p-4" style={{ width: 360 }}>
    <div>
      <h4 className="text-sm font-semibold leading-none">Invoice INV-2207</h4>
      <p className="mt-1 text-sm text-muted-foreground">
        Issued 13 Jun 2026 &middot; Toyota Land Cruiser &middot; KSA 4821
      </p>
    </div>
    <Separator className="my-4" />
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">Total due</span>
      <span className="font-semibold tabular-nums">SAR 1,485.00</span>
    </div>
  </div>
);

export const VerticalMeta = () => (
  <div className="p-4">
    <div className="flex items-center gap-4 text-sm" style={{ height: 24 }}>
      <span className="font-medium">JC-1042</span>
      <Separator orientation="vertical" />
      <span className="text-muted-foreground">Bay 3</span>
      <Separator orientation="vertical" />
      <span className="text-muted-foreground">Imran Shaikh</span>
      <Separator orientation="vertical" />
      <span className="text-primary font-medium">In Progress</span>
    </div>
  </div>
);
