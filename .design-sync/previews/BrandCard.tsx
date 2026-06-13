import { Badge, BrandCard, StatusDot } from "rest-express";
import { Car, Wrench } from "lucide-react";

export const VehicleSummary = () => (
  <BrandCard className="w-full max-w-sm p-5">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Car className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="font-semibold">Toyota Camry 2021</p>
          <p className="text-xs text-muted-foreground">Plate KSA 4821 · Odometer 64,200 km</p>
        </div>
      </div>
      <Badge variant="secondary">Bay 3</Badge>
    </div>
    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
      <StatusDot status="active" />
      <span>Brake pad replacement in progress — Omar H.</span>
    </div>
  </BrandCard>
);

export const HoverDisabled = () => (
  <BrandCard hover={false} className="w-full max-w-sm p-5">
    <div className="flex items-center gap-3">
      <Wrench className="h-6 w-6 text-muted-foreground" />
      <div>
        <p className="font-semibold">Workshop notice</p>
        <p className="text-sm text-muted-foreground">
          Lift 2 scheduled for maintenance Friday 06:00–09:00. Static card (hover lift off).
        </p>
      </div>
    </div>
  </BrandCard>
);

export const ClickableGrid = () => (
  <div className="grid w-full grid-cols-2 gap-4">
    <BrandCard className="p-4" onClick={() => {}}>
      <p className="text-sm font-medium">Job Cards</p>
      <p className="text-2xl font-bold font-mono">23</p>
      <p className="text-xs text-muted-foreground">Open today</p>
    </BrandCard>
    <BrandCard className="p-4" onClick={() => {}}>
      <p className="text-sm font-medium">Invoices</p>
      <p className="text-2xl font-bold font-mono">7</p>
      <p className="text-xs text-muted-foreground">Awaiting payment</p>
    </BrandCard>
  </div>
);
