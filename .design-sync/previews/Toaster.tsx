// Toaster renders from useToast() runtime state — toast() is exported from
// the bundle (ds-entry re-exports the hook module), so calling it here reaches
// the SAME state instance Toaster reads. The viewport is fixed-position; like
// Toast.tsx, the static-position override keeps it inside the capture card.
import * as React from "react";
import { Toaster, toast } from "rest-express";

export const RuntimeToasts = () => {
  React.useEffect(() => {
    toast({
      title: "Job card JC-1042 updated",
      description: "Brake pad replacement marked complete by Omar H.",
    });
  }, []);
  return (
    <div className="relative h-full w-full p-4">
      {/* Toaster's viewport is fixed-position; inside the transformed capture
          card that anchors it offscreen — flow it statically for the shot. */}
      <style>{`ol[class*="fixed"]{position:static !important;max-width:100% !important;padding:0 !important}`}</style>
      <div className="mb-3 max-w-sm text-sm text-muted-foreground">
        Toasts fired via <code className="font-mono text-xs">toast()</code>{" "}
        appear in the bottom-right viewport.
      </div>
      <Toaster />
    </div>
  );
};
