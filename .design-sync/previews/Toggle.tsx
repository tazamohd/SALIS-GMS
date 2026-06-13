import { Toggle } from "rest-express";
import { Bell, Pin, Star, Wrench } from "lucide-react";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3 p-4">
    <Toggle>Urgent Jobs Only</Toggle>
    <Toggle variant="outline">Include Archived</Toggle>
  </div>
);

export const PressedStates = () => (
  <div className="flex flex-wrap items-center gap-3 p-4">
    <Toggle defaultPressed variant="outline">
      <Star /> Priority Customer
    </Toggle>
    <Toggle variant="outline">
      <Bell /> Notify on Completion
    </Toggle>
    <Toggle disabled variant="outline">
      <Wrench /> Bay Closed
    </Toggle>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3 p-4">
    <Toggle size="sm" variant="outline">
      Show VAT
    </Toggle>
    <Toggle size="default" variant="outline">
      Show VAT
    </Toggle>
    <Toggle size="lg" variant="outline">
      Show VAT
    </Toggle>
  </div>
);

export const IconOnly = () => (
  <div className="flex flex-wrap items-center gap-3 p-4">
    <Toggle defaultPressed aria-label="Pin job card">
      <Pin />
    </Toggle>
    <Toggle aria-label="Star customer">
      <Star />
    </Toggle>
    <Toggle variant="outline" defaultPressed aria-label="Workshop alerts">
      <Bell />
    </Toggle>
  </div>
);
