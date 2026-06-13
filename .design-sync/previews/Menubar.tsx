import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "rest-express";

export const WorkshopMenubar = () => (
  <div className="p-2">
    <Menubar value="workshop">
      <MenubarMenu value="workshop">
        <MenubarTrigger>Workshop</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New job card <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Bay schedule <MenubarShortcut>⌘B</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Assign technician</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Close job card <MenubarShortcut>⇧⌘W</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="inventory">
        <MenubarTrigger>Inventory</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Spare parts catalog</MenubarItem>
          <MenubarItem>Stock adjustments</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Low stock alerts</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="reports">
        <MenubarTrigger>Reports</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Daily revenue</MenubarItem>
          <MenubarItem>Technician productivity</MenubarItem>
          <MenubarItem>Outstanding invoices</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>
);
