import { Progress } from "rest-express";

export const Values = () => (
  <div className="flex flex-col gap-5 p-4 w-full">
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Job card JC-1042 — Brake overhaul</span>
        <span className="text-muted-foreground">25%</span>
      </div>
      <Progress value={25} />
    </div>
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Job card JC-1038 — 40k service</span>
        <span className="text-muted-foreground">60%</span>
      </div>
      <Progress value={60} />
    </div>
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Job card JC-1031 — Engine diagnostics</span>
        <span className="text-muted-foreground">90%</span>
      </div>
      <Progress value={90} />
    </div>
  </div>
);

export const Extremes = () => (
  <div className="flex flex-col gap-5 p-4 w-full">
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Parts requisition — not started</span>
        <span className="text-muted-foreground">0%</span>
      </div>
      <Progress value={0} />
    </div>
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Monthly invoicing target</span>
        <span className="text-muted-foreground">100%</span>
      </div>
      <Progress value={100} />
    </div>
  </div>
);

export const SlimVariant = () => (
  <div className="flex flex-col gap-4 p-4 w-full">
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Workshop capacity today</span>
        <span className="text-muted-foreground">7 of 10 bays</span>
      </div>
      <Progress value={70} className="h-2" />
    </div>
  </div>
);
