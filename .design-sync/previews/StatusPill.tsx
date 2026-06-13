import { StatusPill } from "rest-express";

export const AllVariants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <StatusPill variant="blue">In Progress</StatusPill>
    <StatusPill variant="orange">Awaiting Parts</StatusPill>
    <StatusPill variant="gray">On Hold</StatusPill>
    <StatusPill variant="navy">Scheduled</StatusPill>
  </div>
);

export const DefaultVariant = () => (
  <div className="flex flex-wrap items-center gap-2">
    <StatusPill>Job Card JC-1042</StatusPill>
    <StatusPill>Quick-Service Lane</StatusPill>
  </div>
);

export const WorkshopBays = () => (
  <div className="flex flex-col items-start gap-2">
    <div className="flex items-center gap-2 text-sm">
      <span className="w-36 text-muted-foreground">Bay 1 — Patrol 2019</span>
      <StatusPill variant="blue">Diagnostics</StatusPill>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className="w-36 text-muted-foreground">Bay 2 — Sonata 2023</span>
      <StatusPill variant="orange">Awaiting Parts</StatusPill>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className="w-36 text-muted-foreground">Bay 3 — Camry 2021</span>
      <StatusPill variant="navy">Final Inspection</StatusPill>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className="w-36 text-muted-foreground">Bay 4 — Empty</span>
      <StatusPill variant="gray">Idle</StatusPill>
    </div>
  </div>
);
