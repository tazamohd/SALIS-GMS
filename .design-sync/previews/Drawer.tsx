import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Separator,
} from "rest-express";

export const InvoiceSummary = () => (
  <Drawer open shouldScaleBackground={false}>
    <DrawerContent>
      <div className="mx-auto w-full" style={{ maxWidth: 480 }}>
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle>Invoice INV-2308</DrawerTitle>
            <Badge variant="secondary">Unpaid</Badge>
          </div>
          <DrawerDescription>
            Job card JC-1042 — Nissan Patrol 2021, plate RUH 7350
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 text-sm">
          <div className="flex items-center justify-between py-1.5">
            <span>Front brake pads (set)</span>
            <span className="font-medium">SAR 420.00</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span>Engine oil 5W-30 (6L)</span>
            <span className="font-medium">SAR 185.00</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span>Labor — brake service (1.5 hrs)</span>
            <span className="font-medium">SAR 225.00</span>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between py-1 text-muted-foreground">
            <span>VAT (15%)</span>
            <span>SAR 124.50</span>
          </div>
          <div className="flex items-center justify-between py-1 text-base font-semibold">
            <span>Total due</span>
            <span>SAR 954.50</span>
          </div>
        </div>
        <DrawerFooter>
          <Button>Collect payment</Button>
          <Button variant="outline">Print invoice</Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
);
