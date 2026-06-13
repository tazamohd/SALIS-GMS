import { Input, Label } from "rest-express";

export const Default = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="plate">Plate Number</Label>
    <Input id="plate" placeholder="e.g. 7841 KSA" />
  </div>
);

export const WithValue = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="customer">Customer Name</Label>
    <Input id="customer" defaultValue="Abdullah Al-Otaibi" />
  </div>
);

export const InputTypes = () => (
  <div className="w-80 space-y-4 p-4">
    <div className="space-y-2">
      <Label htmlFor="phone">Mobile Number</Label>
      <Input id="phone" type="tel" placeholder="+966 5X XXX XXXX" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="odometer">Odometer (km)</Label>
      <Input id="odometer" type="number" defaultValue={84230} />
    </div>
    <div className="space-y-2">
      <Label htmlFor="next-service">Next Service Date</Label>
      <Input id="next-service" type="date" defaultValue="2026-07-15" />
    </div>
  </div>
);

export const Disabled = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="invoice-no">Invoice Number</Label>
    <Input id="invoice-no" disabled defaultValue="INV-2026-00318" />
    <p className="text-xs text-muted-foreground">
      Auto-generated when the job card is closed.
    </p>
  </div>
);

export const ErrorState = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="vin" className="text-destructive">
      VIN
    </Label>
    <Input
      id="vin"
      defaultValue="JTDBE32K12"
      aria-invalid="true"
      className="border-destructive focus-visible:ring-destructive"
    />
    <p className="text-xs text-destructive">VIN must be 17 characters.</p>
  </div>
);
