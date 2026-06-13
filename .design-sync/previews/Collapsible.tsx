import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "rest-express";
import { ChevronsUpDown } from "lucide-react";

export const PartsOnJobCard = () => (
  <div className="p-4" style={{ width: 380 }}>
    <Collapsible defaultOpen className="space-y-2">
      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <span className="text-sm font-semibold">
          Parts used on JC-1042 (3)
        </span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle parts list</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-3 py-2 text-sm font-mono">
        BRK-PAD-FR &middot; Front brake pads &middot; SAR 320
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-3 py-2 text-sm font-mono">
          ROT-DSC-22 &middot; Brake rotor (pair) &middot; SAR 540
        </div>
        <div className="rounded-md border px-3 py-2 text-sm font-mono">
          FLD-DOT4-1L &middot; Brake fluid DOT4 &middot; SAR 45
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
);

export const CustomerNotes = () => (
  <div className="p-4" style={{ width: 380 }}>
    <Collapsible defaultOpen>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Advisor notes</span>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            <ChevronsUpDown className="h-4 w-4" /> Toggle
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <p className="mt-2 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
          Customer reports squealing when braking at low speed. Check rear
          drums as well; vehicle due for 90,000 km major service next visit.
        </p>
      </CollapsibleContent>
    </Collapsible>
  </div>
);
