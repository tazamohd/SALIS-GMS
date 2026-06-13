import { Badge } from "rest-express";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge>In Progress</Badge>
    <Badge variant="secondary">Awaiting Parts</Badge>
    <Badge variant="destructive">Overdue</Badge>
    <Badge variant="outline">Warranty</Badge>
  </div>
);

export const JobCardLabels = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge>JC-1042</Badge>
    <Badge variant="secondary">Bay 3</Badge>
    <Badge variant="outline">Toyota Camry 2021</Badge>
    <Badge variant="secondary">Oil Change</Badge>
  </div>
);

export const InvoiceStates = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge>Paid — SAR 1,180</Badge>
    <Badge variant="destructive">Unpaid — SAR 640</Badge>
    <Badge variant="outline">Draft — SAR 320</Badge>
  </div>
);

export const Counts = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge>23 open job cards</Badge>
    <Badge variant="secondary">9 vehicles in workshop</Badge>
    <Badge variant="outline">4 technicians on shift</Badge>
  </div>
);
