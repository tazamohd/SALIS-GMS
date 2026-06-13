import * as React from "react";
import { Toaster } from "rest-express";
import { toast } from "@/hooks/use-toast";

export const RuntimeToasts = () => {
  React.useEffect(() => {
    toast({
      title: "Invoice INV-0892 issued",
      description:
        "AED 2,310 invoiced to Al Noor Logistics for job card JC-1042.",
      duration: Infinity,
      style: { animation: "none" },
    });
  }, []);
  return (
    <div className="relative h-full w-full p-4">
      <div className="max-w-sm text-sm text-muted-foreground">
        Toaster mounts a fixed bottom-right viewport. Toasts appear when{" "}
        <code className="font-mono text-xs">toast()</code> is called at
        runtime (e.g. after saving a job card or issuing an invoice).
      </div>
      <Toaster />
    </div>
  );
};
