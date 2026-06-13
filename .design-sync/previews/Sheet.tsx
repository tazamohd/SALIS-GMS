import {
  Badge,
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "rest-express";

export const VehicleDetails = () => (
  <Sheet open>
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Toyota Land Cruiser 2022</SheetTitle>
        <SheetDescription>
          Plate KSA 4821 — owned by Fahad Al-Otaibi
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-3 py-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge>In workshop</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">VIN</span>
          <span className="font-medium">JTMHY7AJ4N4123887</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Odometer</span>
          <span className="font-medium">84,210 km</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last service</span>
          <span className="font-medium">02 May 2026</span>
        </div>
        <Separator />
        <div>
          <p className="mb-2 font-medium">Open job card</p>
          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">JC-1042</span>
              <Badge variant="secondary">Awaiting parts</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">
              Brake service + AC inspection — technician Omar Hassan
            </p>
          </div>
        </div>
      </div>
      <SheetFooter>
        <Button variant="outline">Service history</Button>
        <Button>Open job card</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);
