import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Label,
} from "rest-express";

export const SelectedValue = () => (
  <div className="w-72 space-y-2 p-4">
    <Label>Service Type</Label>
    <Select defaultValue="periodic">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="periodic">Periodic Maintenance</SelectItem>
        <SelectItem value="brakes">Brake Service</SelectItem>
        <SelectItem value="ac">A/C Repair</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export const Placeholder = () => (
  <div className="w-72 space-y-2 p-4">
    <Label>Assigned Technician</Label>
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Choose a technician" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="faisal">Faisal Al-Harbi</SelectItem>
        <SelectItem value="omar">Omar Siddiqui</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export const Disabled = () => (
  <div className="w-72 space-y-2 p-4">
    <Label>Workshop Branch</Label>
    <Select defaultValue="riyadh" disabled>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="riyadh">Riyadh – Exit 9</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export const OpenWithGroups = () => (
  <div className="w-72 p-4" style={{ paddingBottom: 260 }}>
    <Label className="mb-2 block">Spare Part Category</Label>
    <Select defaultValue="oil-filter" open>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Engine</SelectLabel>
          <SelectItem value="oil-filter">Oil Filter</SelectItem>
          <SelectItem value="air-filter">Air Filter</SelectItem>
          <SelectItem value="spark-plugs">Spark Plugs</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Brakes</SelectLabel>
          <SelectItem value="brake-pads">Brake Pads</SelectItem>
          <SelectItem value="brake-discs">Brake Discs</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);
