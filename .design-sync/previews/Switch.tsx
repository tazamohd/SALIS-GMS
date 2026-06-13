import { Label, Switch } from "rest-express";

export const Default = () => (
  <div className="flex items-center gap-2 p-4">
    <Switch id="sms-alerts" />
    <Label htmlFor="sms-alerts">SMS alerts to customer</Label>
  </div>
);

export const Checked = () => (
  <div className="flex items-center gap-2 p-4">
    <Switch id="auto-invoice" defaultChecked />
    <Label htmlFor="auto-invoice">Auto-generate invoice on job close</Label>
  </div>
);

export const SettingsList = () => (
  <div className="w-80 space-y-4 p-4">
    <p className="text-sm font-medium">Workshop notifications</p>
    <div className="flex items-center justify-between">
      <Label htmlFor="set-ready">Vehicle ready alerts</Label>
      <Switch id="set-ready" defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <Label htmlFor="set-parts">Low stock warnings</Label>
      <Switch id="set-parts" defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <Label htmlFor="set-daily">Daily revenue summary</Label>
      <Switch id="set-daily" />
    </div>
  </div>
);

export const Disabled = () => (
  <div className="space-y-4 p-4">
    <div className="flex items-center gap-2">
      <Switch id="zatca" disabled defaultChecked />
      <Label htmlFor="zatca">ZATCA e-invoicing (managed by admin)</Label>
    </div>
    <div className="flex items-center gap-2">
      <Switch id="beta" disabled />
      <Label htmlFor="beta">Beta scheduling board</Label>
    </div>
  </div>
);
