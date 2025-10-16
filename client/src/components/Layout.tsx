import { Home, ClipboardCheck, UserIcon, LogOut, Search, Calendar, Users, ShoppingCart, FileText, BarChart3, Wrench, ClipboardList, Hammer, Package, Building2, HardHat, UserCog, Zap, Car, Receipt, Warehouse, DollarSign, RotateCcw, DatabaseBackup, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import { QuickActionsModal } from "@/components/QuickActionsModal";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickActionsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/calendar", icon: Calendar, label: "Scheduling & Calendar" },
    { path: "/tasks", icon: ClipboardCheck, label: "Tasks Management" },
    { path: "/job-cards", icon: Wrench, label: "Job Cards" },
    { path: "/technician-portal", icon: HardHat, label: "Technician Portal" },
    { path: "/technician-management", icon: UserCog, label: "Technician Management" },
    { path: "/service-templates", icon: ClipboardList, label: "Service Templates" },
    { path: "/tools", icon: Hammer, label: "Tools Management" },
    { path: "/spare-parts", icon: Package, label: "Spare Parts" },
    { path: "/inventory-management", icon: Warehouse, label: "Inventory & Parts" },
    { path: "/suppliers", icon: Building2, label: "Suppliers" },
    { path: "/appointments", icon: Calendar, label: "Appointments" },
    { path: "/customers", icon: Users, label: "Customers" },
    { path: "/vehicles", icon: Car, label: "Vehicles" },
    { path: "/purchase-orders", icon: ShoppingCart, label: "Purchase Orders" },
    { path: "/invoices", icon: FileText, label: "Invoices" },
    { path: "/estimates", icon: Receipt, label: "Estimates" },
    { path: "/financial-settings", icon: DollarSign, label: "Financial Settings" },
    { path: "/refund-management", icon: RotateCcw, label: "Refund Management" },
    { path: "/data-import-export", icon: DatabaseBackup, label: "Data Import/Export" },
    { path: "/business-intelligence", icon: TrendingUp, label: "Business Intelligence" },
    { path: "/reports", icon: BarChart3, label: "Reports" },
    { path: "/profile", icon: UserIcon, label: "My Profile" },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e6e6e6] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#e6e6e6]">
          <h1 className="font-['Poppins',Helvetica] font-bold text-xl text-[#222029]">Logo</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-[#999999] hover:bg-gray-100'
                    }`}
                    data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-['Poppins',Helvetica] font-medium text-sm">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#e6e6e6]">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-['Poppins',Helvetica] font-medium text-sm">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-[#e6e6e6] px-8 flex items-center justify-end gap-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 border-[#e6e6e6]"
              data-testid="input-search"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setQuickActionsOpen(true)}
            className="gap-2"
            data-testid="button-quick-actions"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Actions</span>
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 bg-gray-100 border border-[#e6e6e6] rounded text-xs font-mono text-[#999999]">
              {navigator.platform.includes("Mac") ? "⌘K" : "Ctrl+K"}
            </kbd>
          </Button>
          <NotificationBell />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Quick Actions Modal */}
      <QuickActionsModal open={quickActionsOpen} onOpenChange={setQuickActionsOpen} />
    </div>
  );
}
