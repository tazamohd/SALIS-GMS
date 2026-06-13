import * as React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "rest-express";
import { ClipboardCopy, FileText, Trash2, Wrench } from "lucide-react";

// Radix ContextMenu has no open/defaultOpen prop — fire a real contextmenu
// event on the trigger after mount so the menu renders open for capture.
export const SparePartRowMenu = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: r.left + 24,
        clientY: r.top + 36,
      }),
    );
  }, []);
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={ref}
          className="flex flex-col justify-center rounded-md border border-dashed p-4 text-sm"
          style={{ width: 420, height: 96 }}
        >
          <span className="font-medium">Brake pad set — Toyota OEM 04465-60280</span>
          <span className="text-muted-foreground">
            Bin A-14 — 6 in stock — right-click for actions
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel>Spare part actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <FileText className="mr-2 h-4 w-4" /> View part details
        </ContextMenuItem>
        <ContextMenuItem>
          <Wrench className="mr-2 h-4 w-4" /> Add to job card
          <ContextMenuShortcut>⌘J</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <ClipboardCopy className="mr-2 h-4 w-4" /> Copy part number
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Remove from inventory
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
