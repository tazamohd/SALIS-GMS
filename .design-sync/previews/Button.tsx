import { Button } from "rest-express";
import { Plus, Trash2, Wrench } from "lucide-react";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3 p-4">
    <Button>Create Job Card</Button>
    <Button variant="secondary">Save Draft</Button>
    <Button variant="outline">Export</Button>
    <Button variant="ghost">Cancel</Button>
    <Button variant="destructive">Delete Vehicle</Button>
    <Button variant="link">View invoice history</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3 p-4">
    <Button size="sm">Assign Technician</Button>
    <Button size="default">Start Inspection</Button>
    <Button size="lg">Approve Estimate</Button>
    <Button size="icon" aria-label="Add part">
      <Plus />
    </Button>
  </div>
);

export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-3 p-4">
    <Button>
      <Wrench /> Open Workshop
    </Button>
    <Button variant="destructive">
      <Trash2 /> Remove Part
    </Button>
  </div>
);

export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-3 p-4">
    <Button disabled>Invoice Locked</Button>
    <Button variant="outline" disabled>
      Awaiting Approval
    </Button>
  </div>
);
