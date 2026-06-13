import { Label, Textarea } from "rest-express";

export const Default = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="complaint">Customer Complaint</Label>
    <Textarea
      id="complaint"
      placeholder="Describe the issue reported by the customer..."
    />
  </div>
);

export const WithValue = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="diagnosis">Technician Diagnosis</Label>
    <Textarea
      id="diagnosis"
      defaultValue={
        "Front brake pads worn below 2mm. Rotors show light scoring; recommend resurfacing. Brake fluid dark — flush advised."
      }
    />
    <p className="text-xs text-muted-foreground">
      Visible to the service advisor and on the printed job card.
    </p>
  </div>
);

export const TallNotes = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="notes">Internal Workshop Notes</Label>
    <Textarea
      id="notes"
      rows={6}
      defaultValue={
        "2026-06-10: Parts ordered from Al-Jazirah Spare Parts.\n2026-06-11: Customer approved estimate by phone.\n2026-06-12: Bay 3 lift reserved for 09:00."
      }
    />
  </div>
);

export const Disabled = () => (
  <div className="w-80 space-y-2 p-4">
    <Label htmlFor="closed-summary">Closure Summary</Label>
    <Textarea
      id="closed-summary"
      disabled
      defaultValue="Job card JC-1042 closed. All items invoiced under INV-2026-00318."
    />
  </div>
);
