import { Label, Slider } from "rest-express";

export const Default = () => (
  <div className="w-80 space-y-3 p-4">
    <Label htmlFor="fuel">Fuel level at check-in</Label>
    <Slider id="fuel" defaultValue={[60]} max={100} step={5} />
    <p className="text-xs text-muted-foreground">60% — about half a tank</p>
  </div>
);

export const RangeValue = () => (
  <div className="w-80 space-y-3 p-4">
    <div className="flex items-center justify-between">
      <Label htmlFor="budget">Repair budget (SAR)</Label>
      <span className="text-sm font-medium">800 – 2,400</span>
    </div>
    <Slider id="budget" defaultValue={[800, 2400]} max={5000} step={100} />
  </div>
);

export const TreadDepth = () => (
  <div className="w-80 space-y-3 p-4">
    <Label htmlFor="tread">Tire tread depth (mm)</Label>
    <Slider id="tread" defaultValue={[3]} max={10} step={1} />
    <p className="text-xs text-destructive">
      3 mm — replacement recommended below 4 mm
    </p>
  </div>
);

export const Disabled = () => (
  <div className="w-80 space-y-3 p-4">
    <Label htmlFor="discount">Labor discount</Label>
    <Slider id="discount" defaultValue={[15]} max={50} step={5} disabled />
    <p className="text-xs text-muted-foreground">
      Locked at 15% by branch manager.
    </p>
  </div>
);
