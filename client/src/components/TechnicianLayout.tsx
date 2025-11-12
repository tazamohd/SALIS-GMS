import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Clock,
  Package,
  Camera,
  User,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/technician-portal", icon: LayoutDashboard },
    { name: "My Jobs", href: "/technician-portal/my-jobs", icon: ClipboardList },
    { name: "Time Clock", href: "/technician-portal/time-clock", icon: Clock },
    { name: "Parts Lookup", href: "/technician-portal/parts", icon: Package },
    { name: "Job Photos", href: "/technician-portal/documentation", icon: Camera },
    { name: "Profile", href: "/technician-portal/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-salis-black">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-salis-gray-dark border-b border-gray-200 dark:border-salis-gray sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Technician Portal
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.fullName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-salis-gray-dark border-r border-gray-200 dark:border-salis-gray min-h-[calc(100vh-4rem)] hidden md:block">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-100 dark:bg-salis-gray text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-salis-gray hover:text-gray-900 dark:hover:text-white"
                    )}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-salis-gray-dark border-t border-gray-200 dark:border-salis-gray z-10">
        <div className="grid grid-cols-6 gap-1 p-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors",
                    isActive
                      ? "bg-gray-100 dark:bg-salis-gray text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400"
                  )}
                  data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="truncate w-full text-center">{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
