// Toaster renders from useToast() runtime state. Calling toast() from
// "@/hooks/use-toast" inside the preview was tried and does NOT work: the
// preview bundles its own copy of the use-toast module, so its memoryState is
// separate from the copy bundled inside the rest-express Toaster — the toast
// never reaches the component. A static caption + mounted Toaster is the
// honest preview (see .design-sync/learnings/feedback.md).
import { Toaster } from "rest-express";

export const RuntimeToasts = () => (
  <div className="relative h-full w-full p-4">
    <div className="max-w-sm text-sm text-muted-foreground">
      Toaster mounts a fixed bottom-right viewport. Toasts appear when{" "}
      <code className="font-mono text-xs">toast()</code> is called at runtime
      (e.g. after saving a job card or issuing an invoice).
    </div>
    <Toaster />
  </div>
);
