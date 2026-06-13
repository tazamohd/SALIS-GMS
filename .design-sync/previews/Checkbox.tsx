import { Checkbox, Label } from "rest-express";

export const Default = () => (
  <div className="flex items-center gap-2 p-4">
    <Checkbox id="send-sms" />
    <Label htmlFor="send-sms">Send SMS when vehicle is ready</Label>
  </div>
);

export const Checked = () => (
  <div className="flex items-center gap-2 p-4">
    <Checkbox id="approved" defaultChecked />
    <Label htmlFor="approved">Estimate approved by customer</Label>
  </div>
);

export const InspectionChecklist = () => (
  <div className="w-72 space-y-3 p-4">
    <p className="text-sm font-medium">Pre-delivery inspection</p>
    <div className="flex items-center gap-2">
      <Checkbox id="chk-oil" defaultChecked />
      <Label htmlFor="chk-oil">Engine oil level verified</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="chk-tires" defaultChecked />
      <Label htmlFor="chk-tires">Tire pressure set to spec</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="chk-road" />
      <Label htmlFor="chk-road">Road test completed</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="chk-wash" />
      <Label htmlFor="chk-wash">Vehicle washed</Label>
    </div>
  </div>
);

export const Disabled = () => (
  <div className="space-y-3 p-4">
    <div className="flex items-center gap-2">
      <Checkbox id="warranty" disabled />
      <Label htmlFor="warranty">Apply warranty discount</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="vat" disabled defaultChecked />
      <Label htmlFor="vat">Include 15% VAT (required)</Label>
    </div>
  </div>
);

export const WithDescription = () => (
  <div className="flex items-start gap-2 p-4">
    <Checkbox id="reminders" defaultChecked className="mt-1" />
    <div className="space-y-1">
      <Label htmlFor="reminders">Service reminders</Label>
      <p className="text-xs text-muted-foreground">
        Notify the customer 30 days before the next scheduled service.
      </p>
    </div>
  </div>
);
