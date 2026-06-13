import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "rest-express";

export const WorkshopNavBar = () => (
  <div className="p-4">
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Workshop</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-2 p-4" style={{ width: 320 }}>
              <NavigationMenuLink className="rounded-md p-2 text-sm hover:bg-accent">
                Job Cards
              </NavigationMenuLink>
              <NavigationMenuLink className="rounded-md p-2 text-sm hover:bg-accent">
                Bay Schedule
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Inventory</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-2 p-4" style={{ width: 320 }}>
              <NavigationMenuLink className="rounded-md p-2 text-sm hover:bg-accent">
                Spare Parts
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Invoices
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
);

export const WorkshopMenuOpen = () => (
  <div className="p-4" style={{ minHeight: 300 }}>
    <NavigationMenu value="workshop">
      <NavigationMenuList>
        <NavigationMenuItem value="workshop">
          <NavigationMenuTrigger>Workshop</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-1 p-4" style={{ width: 380 }}>
              <NavigationMenuLink className="rounded-md p-3 hover:bg-accent">
                <div className="text-sm font-medium">Job Cards</div>
                <p className="text-sm text-muted-foreground">
                  Open, assign and close repair job cards.
                </p>
              </NavigationMenuLink>
              <NavigationMenuLink className="rounded-md p-3 hover:bg-accent">
                <div className="text-sm font-medium">Bay Schedule</div>
                <p className="text-sm text-muted-foreground">
                  See which vehicle occupies each service bay.
                </p>
              </NavigationMenuLink>
              <NavigationMenuLink className="rounded-md p-3 hover:bg-accent">
                <div className="text-sm font-medium">Technicians</div>
                <p className="text-sm text-muted-foreground">
                  Workload and assignments per technician.
                </p>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="inventory">
          <NavigationMenuTrigger>Inventory</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 text-sm" style={{ width: 320 }}>
              Spare parts
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Reports
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
);
