import { Label, RadioGroup, RadioGroupItem } from "rest-express";

export const Default = () => (
  <div className="p-4">
    <p className="text-sm font-medium pb-3">Payment method</p>
    <RadioGroup defaultValue="card">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="cash" id="pay-cash" />
        <Label htmlFor="pay-cash">Cash</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="card" id="pay-card" />
        <Label htmlFor="pay-card">Mada / Credit card</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="transfer" id="pay-transfer" />
        <Label htmlFor="pay-transfer">Bank transfer</Label>
      </div>
    </RadioGroup>
  </div>
);

export const JobPriority = () => (
  <div className="p-4">
    <p className="text-sm font-medium pb-3">Job card priority</p>
    <RadioGroup defaultValue="urgent" className="flex gap-6">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="normal" id="prio-normal" />
        <Label htmlFor="prio-normal">Normal</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="urgent" id="prio-urgent" />
        <Label htmlFor="prio-urgent">Urgent</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="vip" id="prio-vip" />
        <Label htmlFor="prio-vip">VIP customer</Label>
      </div>
    </RadioGroup>
  </div>
);

export const WithDescriptions = () => (
  <div className="w-80 p-4">
    <p className="text-sm font-medium pb-3">Spare part source</p>
    <RadioGroup defaultValue="oem" className="gap-4">
      <div className="flex items-start gap-2">
        <RadioGroupItem value="oem" id="src-oem" className="mt-1" />
        <div className="space-y-1">
          <Label htmlFor="src-oem">Genuine (OEM)</Label>
          <p className="text-xs text-muted-foreground">
            Sourced from the dealer. 12-month warranty.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="aftermarket" id="src-after" className="mt-1" />
        <div className="space-y-1">
          <Label htmlFor="src-after">Aftermarket</Label>
          <p className="text-xs text-muted-foreground">
            Lower cost alternative. 3-month warranty.
          </p>
        </div>
      </div>
    </RadioGroup>
  </div>
);

export const DisabledOption = () => (
  <div className="p-4">
    <p className="text-sm font-medium pb-3">Service bay</p>
    <RadioGroup defaultValue="bay-2">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="bay-1" id="bay-1" disabled />
        <Label htmlFor="bay-1" className="opacity-50">
          Bay 1 — occupied (JC-1038)
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="bay-2" id="bay-2" />
        <Label htmlFor="bay-2">Bay 2 — available</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="bay-3" id="bay-3" />
        <Label htmlFor="bay-3">Bay 3 — available</Label>
      </div>
    </RadioGroup>
  </div>
);
