import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "rest-express";

export const JobCardSplit = () => (
  <div className="p-4">
    <div
      className="overflow-hidden rounded-lg border"
      style={{ height: 220, maxWidth: 640 }}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="flex h-full flex-col gap-1 p-4 text-sm">
            <span className="font-semibold">Job cards</span>
            <span className="rounded-md bg-accent px-2 py-1 font-medium">
              JC-1042 &middot; Brake overhaul
            </span>
            <span className="px-2 py-1 text-muted-foreground">
              JC-1043 &middot; AC diagnosis
            </span>
            <span className="px-2 py-1 text-muted-foreground">
              JC-1044 &middot; Oil change
            </span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65}>
          <div className="flex h-full flex-col p-4 text-sm">
            <span className="font-semibold">JC-1042 &mdash; details</span>
            <p className="mt-2 text-muted-foreground">
              Toyota Land Cruiser &middot; KSA 4821 &middot; Bay 3. Front pads
              and rotors replaced, fluid flushed. Awaiting road test before
              invoicing.
            </p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  </div>
);

export const WorkshopThreePane = () => (
  <div className="p-4">
    <div
      className="overflow-hidden rounded-lg border"
      style={{ height: 180, maxWidth: 640 }}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="flex h-full items-center justify-center p-4 text-sm font-medium">
            Bays
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45}>
          <div className="flex h-full items-center justify-center p-4 text-sm font-medium">
            Active jobs
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30}>
          <div className="flex h-full items-center justify-center p-4 text-sm font-medium">
            Technicians
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  </div>
);
