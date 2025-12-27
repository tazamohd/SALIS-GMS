import {
  Home,
  ClipboardCheck,
  UserIcon,
  LogOut,
  Search,
  Calendar,
  Users,
  ShoppingCart,
  FileText,
  BarChart3,
  Wrench,
  ClipboardList,
  Hammer,
  Package,
  Building2,
  HardHat,
  UserCog,
  Zap,
  Car,
  Receipt,
  Warehouse,
  DollarSign,
  RotateCcw,
  DatabaseBackup,
  TrendingUp,
  UserCheck,
  Brain,
  Plug2,
  Shield,
  Settings as SettingsIcon,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Truck,
  FileCheck,
  Radio,
  Key,
  Store,
  Mail,
  Award,
  Cpu,
  Globe,
  Network,
  Map,
  Camera,
  Star,
  RefreshCw,
  MapPin,
  Clock,
  Wrench as Tool,
  Leaf,
  AlertTriangle,
  Scan,
  Monitor,
  TabletSmartphone,
  CircleDot,
  Target,
  Bell,
  Trophy,
  Fingerprint,
  Activity,
  GraduationCap,
  BookOpen,
  Building,
  Satellite,
  Wallet,
  LayoutDashboard,
  Landmark,
  TrendingDown,
  Megaphone,
  CreditCard,
  FolderTree,
  PackageSearch,
  Crown,
  ScanLine,
  Scale,
  Banknote,
  Calculator,
  GripVertical,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QuickActionsModal } from "@/components/QuickActionsModal";
import { SkipLink } from "@/components/SkipLink";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { UserSettings } from "@shared/schema";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  
  // Resizable sidebar state - default 280px, stored in localStorage
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : 280;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Handle sidebar resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 200), 400); // Min 200px, Max 400px
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        localStorage.setItem('sidebarWidth', sidebarWidth.toString());
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, sidebarWidth]);

  // Get user settings for keyboard shortcuts
  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
  });

  // Enable global keyboard shortcuts
  useKeyboardShortcuts(settings?.enableKeyboardShortcuts ?? true);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setQuickActionsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Simplified navigation groups for cleaner UI
  const navGroups = [
    {
      label: "Overview",
      items: [
        { path: "/dashboard", icon: Home, label: "Dashboard" },
        { path: "/kpi-dashboard", icon: BarChart3, label: "KPIs" },
      ],
    },
    {
      label: "Operations",
      items: [
        { path: "/job-cards", icon: ClipboardList, label: "Job Cards" },
        { path: "/appointments", icon: Calendar, label: "Appointments" },
        { path: "/technician-portal", icon: Users, label: "Technicians" },
      ],
    },
    {
      label: "Inventory & Parts",
      items: [
        { path: "/inventory-management", icon: Package, label: "Stock List" },
        { path: "/purchase-orders", icon: ShoppingCart, label: "Orders" },
        { path: "/suppliers", icon: Truck, label: "Suppliers" },
      ],
    },
    {
      label: "Finance",
      items: [
        { path: "/invoices", icon: FileText, label: "Invoices" },
        { path: "/expense-tracking", icon: Receipt, label: "Expenses" },
        { path: "/general-ledger", icon: BookOpen, label: "Accounting" },
      ],
    },
    {
      label: "CRM",
      items: [
        { path: "/customers", icon: UserIcon, label: "Customers" },
        { path: "/vehicles", icon: Car, label: "Vehicles" },
      ],
    },
    {
      label: "System",
      items: [
        { path: "/settings", icon: SettingsIcon, label: "Settings" },
      ],
    },
  ];

  // Role-based navigation filtering (updated for simplified nav)
  const roleNavigationMap: Record<string, string[]> = {
    // Technicians see operations and inventory
    'technician': ['Overview', 'Operations', 'Inventory & Parts'],
    // Purchase Agents see inventory and finance
    'Purchase Agent': ['Overview', 'Inventory & Parts', 'Finance'],
    // Call Center sees CRM
    'Call Center Agent': ['Overview', 'CRM', 'Operations'],
    // HR roles see system
    'HR Manager': ['Overview', 'Finance', 'System'],
    'HR Officer': ['Overview', 'System'],
    // Accountants see finance
    'Accountant': ['Overview', 'Finance'],
    // Service Advisors see operations and CRM
    'Service Advisor': ['Overview', 'Operations', 'CRM', 'Finance'],
    // Admin and Super Admin see everything
    'admin': [],
    'Super Admin': [],
    'Administrator': [],
  };

  // Filter navigation based on user role
  const userRoles = (user as any)?.roles || [];
  const userType = (user as any)?.userType || '';
  
  // Determine which groups to show based on role
  const getAllowedGroups = (): string[] => {
    // Admin types see everything
    if (userType === 'admin' || userRoles.includes('Super Admin') || userRoles.includes('Administrator')) {
      return []; // Empty means show all
    }
    
    // Check for specific role restrictions
    for (const role of userRoles) {
      if (roleNavigationMap[role]) {
        return roleNavigationMap[role];
      }
    }
    
    // Check userType
    if (roleNavigationMap[userType]) {
      return roleNavigationMap[userType];
    }
    
    // Default: show all (for testing/development)
    return [];
  };

  const allowedGroups = getAllowedGroups();
  const filteredNavGroups = allowedGroups.length > 0 
    ? navGroups.filter(group => allowedGroups.includes(group.label || ''))
    : navGroups;

  // Track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    filteredNavGroups.map((group) => group.label || ''), // All groups expanded by default
  );

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupLabel)
        ? prev.filter((label) => label !== groupLabel)
        : [...prev, groupLabel],
    );
  };

  return (
    <>
      <SkipLink />
      <div className="flex h-screen bg-white dark:bg-salis-black">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close mobile menu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Resizable Design */}
        <aside
          className={`
        fixed lg:static inset-y-0 left-0 z-50 relative
        bg-white dark:bg-salis-black border-r border-gray-200 dark:border-salis-gray-dark flex flex-col
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-10 hidden lg:block"
            onMouseDown={() => setIsResizing(true)}
            data-testid="sidebar-resize-handle"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-1 rounded bg-gray-200 dark:bg-gray-700 opacity-0 hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3 text-gray-500" />
            </div>
          </div>
          {/* Navigation - Compact */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-0.5">
              {filteredNavGroups.map((group) => {
                const groupLabel = group.label || '';
                const isExpanded = expandedGroups.includes(groupLabel);
                const hasActiveItem = group.items.some(
                  (item) => location === item.path,
                );

                return (
                  <Collapsible
                    key={groupLabel}
                    open={isExpanded}
                    onOpenChange={() => toggleGroup(groupLabel)}
                  >
                    <CollapsibleTrigger
                      className="w-full"
                      data-testid={`nav-group-${groupLabel.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="flex items-center justify-start gap-2 pl-2 pr-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-salis-gray-dark transition-colors group">
                        <span className="font-poppins font-bold text-[11px] uppercase text-gray-700 dark:text-gray-300 tracking-wide leading-tight text-left whitespace-nowrap">
                          {groupLabel}
                        </span>
                        <div className="flex-1" />
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-0.5 space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.path;

                        return (
                          <Link key={item.path} href={item.path}>
                            <div
                              className={`flex items-center gap-2 pl-6 pr-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? "bg-salis-black dark:bg-white text-white dark:text-salis-black shadow-md"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-salis-gray-dark hover:text-salis-black dark:hover:text-white"
                              }`}
                              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="font-poppins font-medium text-xs truncate">
                                {item.label}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </nav>

          {/* Logout - Compact */}
          <div className="p-3 border-t border-gray-200 dark:border-salis-gray-dark">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-salis-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-salis-gray-dark h-8"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="font-poppins font-medium text-xs">
                {t("common.logout")}
              </span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Header - Monochrome */}
          <header className="h-14 bg-white dark:bg-salis-black border-b border-gray-200 dark:border-salis-gray-dark px-4 sm:px-6 flex items-center gap-3 shadow-sm">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-salis-black dark:hover:text-white h-8 w-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>

            <div className="flex-1" />

            {/* Search Bar - Compact */}
            <div className="hidden md:block relative w-full max-w-md">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder={t("common.search")}
                className="pl-9 h-9 bg-gray-50 dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-salis-black dark:focus:border-white focus:ring-salis-black dark:focus:ring-white font-poppins"
                data-testid="input-search"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickActionsOpen(true)}
              className="gap-2 h-9 border-gray-300 dark:border-salis-gray text-gray-700 dark:text-gray-300 hover:bg-salis-black dark:hover:bg-white hover:text-white dark:hover:text-salis-black transition-colors font-poppins"
              data-testid="button-quick-actions"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Quick Actions</span>
              <kbd className="hidden sm:inline-flex px-1 py-0.5 bg-gray-100 dark:bg-salis-gray-dark border border-gray-300 dark:border-salis-gray rounded text-[10px] font-mono text-gray-600 dark:text-gray-400">
                {navigator.platform.includes("Mac") ? "⌘K" : "Ctrl+K"}
              </kbd>
            </Button>
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationBell />
          </header>

          {/* Page Content */}
          <main
            id="main-content"
            className="flex-1 overflow-auto"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>

        {/* Quick Actions Modal */}
        <QuickActionsModal
          open={quickActionsOpen}
          onOpenChange={setQuickActionsOpen}
        />

        {/* Offline Indicator */}
        <OfflineIndicator />
      </div>
    </>
  );
}
