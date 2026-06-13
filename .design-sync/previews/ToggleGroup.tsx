import { ToggleGroup, ToggleGroupItem } from "rest-express";
import { LayoutGrid, List, Table2 } from "lucide-react";

export const SingleSelect = () => (
  <div className="flex items-center p-4">
    <ToggleGroup type="single" defaultValue="in-progress" variant="outline">
      <ToggleGroupItem value="pending">Pending</ToggleGroupItem>
      <ToggleGroupItem value="in-progress">In Progress</ToggleGroupItem>
      <ToggleGroupItem value="completed">Completed</ToggleGroupItem>
    </ToggleGroup>
  </div>
);

export const MultiSelect = () => (
  <div className="flex items-center p-4">
    <ToggleGroup type="multiple" defaultValue={["parts", "labor"]}>
      <ToggleGroupItem value="parts">Spare Parts</ToggleGroupItem>
      <ToggleGroupItem value="labor">Labor</ToggleGroupItem>
      <ToggleGroupItem value="consumables">Consumables</ToggleGroupItem>
      <ToggleGroupItem value="sublet">Sublet Work</ToggleGroupItem>
    </ToggleGroup>
  </div>
);

export const IconViews = () => (
  <div className="flex items-center p-4">
    <ToggleGroup type="single" defaultValue="grid" variant="outline">
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGrid />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table view">
        <Table2 />
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
);

export const SmallWithDisabled = () => (
  <div className="flex items-center p-4">
    <ToggleGroup type="single" defaultValue="today" size="sm" variant="outline">
      <ToggleGroupItem value="today">Today</ToggleGroupItem>
      <ToggleGroupItem value="week">This Week</ToggleGroupItem>
      <ToggleGroupItem value="month">This Month</ToggleGroupItem>
      <ToggleGroupItem value="custom" disabled>
        Custom
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
);
