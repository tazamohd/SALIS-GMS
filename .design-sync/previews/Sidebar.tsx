import {
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "rest-express";
import {
  BarChart3,
  Car,
  ClipboardList,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Wrench,
} from "lucide-react";

export const GarageAppShell = () => (
  <SidebarProvider style={{ minHeight: 0, height: 600, overflow: "hidden" }}>
    <Sidebar collapsible="none" className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">SALIS AUTO</span>
            <span className="text-xs text-muted-foreground">
              Garage Management
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workshop</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <ClipboardList />
                  <span>Job Cards</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>8</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Car />
                  <span>Vehicles</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Package />
                  <span>Inventory</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Receipt />
                  <span>Invoices</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart3 />
                  <span>Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
            TM
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">Taza Mohammed</span>
            <span className="text-xs text-muted-foreground">
              Service Manager
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <header className="flex items-center gap-2 border-b px-4" style={{ height: 56 }}>
        <SidebarTrigger />
        <Separator orientation="vertical" style={{ height: 16 }} />
        <span className="text-sm font-semibold">Job Cards</span>
        <span className="ml-auto text-xs text-muted-foreground">
          Friday, 13 Jun 2026
        </span>
      </header>
      <div className="grid grid-cols-3 gap-4 p-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm text-muted-foreground">Open job cards</div>
          <div className="text-2xl font-bold tabular-nums">8</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm text-muted-foreground">Vehicles in bays</div>
          <div className="text-2xl font-bold tabular-nums">5</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm text-muted-foreground">Today&apos;s revenue</div>
          <div className="text-2xl font-bold tabular-nums">SAR 12,480</div>
        </div>
      </div>
      <div
        className="mx-4 mb-4 flex flex-1 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground"
      >
        Job card board placeholder
      </div>
    </SidebarInset>
  </SidebarProvider>
);
