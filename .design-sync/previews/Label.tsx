import { Checkbox, Input, Label, Textarea } from "rest-express";

export const Default = () => (
  <div className="p-4">
    <Label htmlFor="make">Vehicle Make</Label>
  </div>
);

export const WithInput = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="model">Model</Label>
    <Input id="model" placeholder="e.g. Land Cruiser GXR" />
  </div>
);

export const RequiredField = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="plate-req">
      Plate Number <span className="text-destructive">*</span>
    </Label>
    <Input id="plate-req" placeholder="e.g. 7841 KSA" />
    <p className="text-xs text-muted-foreground">
      Required to open a job card.
    </p>
  </div>
);

export const WithCheckboxPeer = () => (
  <div className="flex items-center gap-2 p-4">
    <Checkbox id="lbl-disabled" disabled />
    <Label htmlFor="lbl-disabled">
      Notify fleet manager (disabled — peer styling)
    </Label>
  </div>
);

export const WithTextarea = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="symptoms">Reported Symptoms</Label>
    <Textarea
      id="symptoms"
      placeholder="Knocking noise from front-left wheel at low speed..."
    />
  </div>
);
