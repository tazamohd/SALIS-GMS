import { Alert, AlertTitle, AlertDescription } from "rest-express";
import { AlertTriangle, Info, Wrench } from "lucide-react";

export const Default = () => (
  <div className="flex flex-col gap-3 p-4 w-full">
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Service reminder scheduled</AlertTitle>
      <AlertDescription>
        Toyota Hilux (B 4521 TX) is due for its 40,000 km service on 22 June.
        An SMS reminder will be sent to the owner two days before.
      </AlertDescription>
    </Alert>
    <Alert>
      <Wrench className="h-4 w-4" />
      <AlertTitle>Bay 3 under maintenance</AlertTitle>
      <AlertDescription>
        The two-post lift in Bay 3 is being inspected. Assign new job cards to
        Bays 1, 2 or 4 until 15:00 today.
      </AlertDescription>
    </Alert>
  </div>
);

export const Destructive = () => (
  <div className="flex flex-col gap-3 p-4 w-full">
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Low stock: brake pads below reorder level</AlertTitle>
      <AlertDescription>
        Only 2 sets of Bosch front brake pads (PN BP-2210) remain. Reorder now
        to avoid delaying job card JC-1042.
      </AlertDescription>
    </Alert>
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Invoice INV-0871 overdue</AlertTitle>
      <AlertDescription>
        Payment of AED 1,450 from Al Noor Logistics is 14 days overdue.
      </AlertDescription>
    </Alert>
  </div>
);

export const TitleOnly = () => (
  <div className="flex flex-col gap-3 p-4 w-full">
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>3 vehicles awaiting customer approval</AlertTitle>
    </Alert>
    <Alert>
      <AlertDescription>
        Parts requisition PR-204 was approved by the workshop manager.
      </AlertDescription>
    </Alert>
  </div>
);
