import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  ClipboardList,
  Package,
  TrendingUp,
  Users,
  LayoutDashboard,
  LogOut,
  Bell,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PurchaseAgentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/purchase-agent", icon: LayoutDashboard },
    { name: "Purchase Orders", href: "/purchase-agent/orders", icon: ShoppingCart },
    { name: "Supplier Management", href: "/purchase-agent/suppliers", icon: Users },
    { name: "Inventory Needs", href: "/purchase-agent/inventory", icon: Package },
    { name: "Price Comparison", href: "/purchase-agent/price-compare", icon: TrendingUp },
    { name: "Order Tracking", href: "/purchase-agent/tracking", icon: ClipboardList },
    { name: "Reports", href: "/purchase-agent/reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-salis-black">
      <header className="bg-white dark:bg-salis-gray-dark border-b border-gray-200 dark:border-salis-gray sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-salis-black dark:text-white" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Purchase Agent Portal
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.fullName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
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

          <div className="p-4 border-t border-gray-200 dark:border-salis-gray">
            <div className="bg-gray-50 dark:bg-salis-black rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Quick Stats
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Pending Orders</span>
                  <span className="font-semibold text-gray-900 dark:text-white">12</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Low Stock Items</span>
                  <span className="font-semibold text-orange-600">8</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Active Suppliers</span>
                  <span className="font-semibold text-gray-900 dark:text-white">24</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-salis-gray-dark border-t border-gray-200 dark:border-salis-gray z-10">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigation.slice(0, 4).map((item) => {
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
