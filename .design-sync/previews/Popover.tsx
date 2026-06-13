import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "rest-express";
import { SlidersHorizontal } from "lucide-react";

export const FilterJobCards = () => (
  <div className="flex justify-center pt-6">
    <Popover open>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal /> Filter job cards
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">Filters</h4>
            <p className="text-sm text-muted-foreground">
              Narrow down the workshop job card list.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="plate">Plate</Label>
              <Input id="plate" placeholder="KSA 4821" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="tech">Technician</Label>
              <Input id="tech" placeholder="Omar Hassan" className="col-span-2 h-8" />
            </div>
          </div>
          <Button size="sm">Apply filters</Button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
);
