import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "rest-express";

export const AddVehicle = () => (
  <Dialog open>
    <DialogContent className="sm:max-w-[440px]">
      <DialogHeader>
        <DialogTitle>Add Vehicle</DialogTitle>
        <DialogDescription>
          Register a customer vehicle to open job cards against it.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="plate">Plate number</Label>
          <Input id="plate" placeholder="KSA 4821" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="model">Make &amp; model</Label>
          <Input id="model" placeholder="Toyota Land Cruiser 2022" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Save Vehicle</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
