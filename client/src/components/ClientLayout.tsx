import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Home,
  Car,
  Calendar,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare,
  Clock
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/client", icon: Home },
  { name: "My Vehicles", href: "/client/vehicles", icon: Car },
  { name: "Appointments", href: "/client/appointments", icon: Calendar },
  { name: "Service History", href: "/client/service-history", icon: FileText },
  { name: "Live Tracking", href: "/client/live-tracking", icon: Clock },
  { name: "Reminders", href: "/client/reminders", icon: Bell },
  { name: "Review & Chat", href: "/client/review-chat", icon: MessageSquare },
  { name: "Invoices", href: "/client/invoices", icon: FileText },
  { name: "Profile", href: "/client/profile", icon: User },
];

export function ClientLayout({ children }: ClientLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-backdrop"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="client-sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">SALIS AUTO</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              data-testid="button-close-sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" data-testid="text-user-name">
                  {user?.fullName || "Guest"}
                </p>
                <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      data-testid={`link-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator />

          {/* Logout button */}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            data-testid="button-open-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" data-testid="button-notifications">
            <Bell className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" data-testid="button-messages">
            <MessageSquare className="h-5 w-5" />
          </Button>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
