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
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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

  // Streamlined and reorganized navigation groups with translations
  const navGroups = [
    {
      label: t("nav.dashboard"),
      items: [{ path: "/dashboard", icon: Home, label: t("nav.dashboard") }],
    },
    {
      label: t("nav.operations"),
      items: [
        { path: "/job-cards", icon: Wrench, label: t("nav.jobCards") },
        { path: "/calendar", icon: Calendar, label: t("nav.calendar") },
        { path: "/appointments", icon: Calendar, label: t("nav.appointments") },
        { path: "/tasks", icon: ClipboardCheck, label: t("nav.tasks") },
        {
          path: "/service-templates",
          icon: ClipboardList,
          label: t("nav.serviceTemplates"),
        },
        {
          path: "/technician-portal",
          icon: HardHat,
          label: t("nav.technicianPortal"),
        },
      ],
    },
    {
      label: t("nav.customersFleet"),
      items: [
        { path: "/customers", icon: Users, label: t("nav.customers") },
        { path: "/vehicles", icon: Car, label: t("nav.vehicles") },
        { path: "/fleet-management", icon: Truck, label: "Fleet Management" },
        {
          path: "/warranty-management",
          icon: Shield,
          label: "Warranty Management",
        },
        {
          path: "/vehicle-inspections",
          icon: FileCheck,
          label: "Vehicle Inspections",
        },
        { path: "/towing-assistance", icon: Radio, label: "Towing & Roadside" },
        { path: "/loaner-vehicles", icon: Key, label: "Loaner Vehicles" },
      ],
    },
    {
      label: "Marketing & Sales",
      items: [
        {
          path: "/marketing-automation",
          icon: Mail,
          label: "Marketing Automation",
        },
        { path: "/customer-loyalty", icon: Award, label: "Customer Loyalty" },
      ],
    },
    {
      label: t("nav.inventoryOrders"),
      items: [
        {
          path: "/inventory-management",
          icon: Warehouse,
          label: t("nav.inventory"),
        },
        { path: "/spare-parts", icon: Package, label: t("nav.spareParts") },
        { path: "/tools", icon: Hammer, label: t("nav.tools") },
        { path: "/suppliers", icon: Building2, label: t("nav.suppliers") },
        {
          path: "/vendor-supplier-portal",
          icon: Store,
          label: "Vendor/Supplier Portal",
        },
        {
          path: "/purchase-orders",
          icon: ShoppingCart,
          label: t("nav.purchaseOrders"),
        },
        { path: "/estimates", icon: Receipt, label: t("nav.estimates") },
      ],
    },
    {
      label: t("nav.teamStaff"),
      items: [
        {
          path: "/technician-management",
          icon: UserCog,
          label: t("nav.technicianManagement"),
        },
        {
          path: "/hr-management",
          icon: UserCheck,
          label: t("nav.hrManagement"),
        },
        { path: "/chat", icon: MessageCircle, label: "Chat" },
      ],
    },
    {
      label: t("nav.finance"),
      items: [
        { path: "/invoices", icon: FileText, label: t("nav.invoices") },
        {
          path: "/financial-settings",
          icon: DollarSign,
          label: t("nav.financialSettings"),
        },
        {
          path: "/refund-management",
          icon: RotateCcw,
          label: t("nav.refunds"),
        },
      ],
    },
    {
      label: t("nav.analytics"),
      items: [
        { path: "/reports", icon: BarChart3, label: t("nav.reports") },
        {
          path: "/business-intelligence",
          icon: TrendingUp,
          label: t("nav.businessIntelligence"),
        },
      ],
    },
    {
      label: "Enterprise",
      items: [
        {
          path: "/franchise-management",
          icon: Building2,
          label: "Franchise Management",
        },
        {
          path: "/diagnostics-obd",
          icon: Cpu,
          label: "Diagnostics & OBD",
        },
        {
          path: "/oem-software",
          icon: Key,
          label: "OEM Software",
        },
        {
          path: "/globalization",
          icon: Globe,
          label: "Globalization",
        },
        {
          path: "/parts-supply-network",
          icon: Network,
          label: "Parts Network",
        },
      ],
    },
    {
      label: t("nav.automationTools"),
      items: [
        { path: "/ai-automation", icon: Brain, label: t("nav.aiAutomation") },
        { path: "/ai-chatbot", icon: MessageCircle, label: "AI Chatbot" },
        { path: "/predictive-maintenance", icon: TrendingUp, label: "Predictive Maintenance" },
        { path: "/smart-parts-recommendations", icon: Package, label: "Smart Parts" },
        { path: "/voice-commands", icon: Radio, label: "Voice Commands" },
        { path: "/document-ocr", icon: FileText, label: "Document OCR" },
      ],
    },
    {
      group: "📊 Advanced Analytics",
      items: [
        { path: "/business-intelligence-dashboard", icon: BarChart3, label: "BI Dashboard" },
        { path: "/profit-analysis", icon: DollarSign, label: "Profit Analysis" },
        { path: "/customer-ltv-analysis", icon: TrendingUp, label: "Customer LTV" },
        { path: "/business-heatmaps", icon: Map, label: "Heat Maps" },
      ],
    },
    {
      group: "🔌 Enhanced Integrations",
      items: [
        { path: "/accounting-integration", icon: DollarSign, label: "Accounting Sync" },
        { path: "/email-marketing-campaigns", icon: Mail, label: "Email Marketing" },
        { path: "/social-media-integration", icon: MessageCircle, label: "Social Media" },
        { path: "/video-consultations", icon: FileText, label: "Video Calls" },
        { path: "/parts-marketplace", icon: ShoppingCart, label: "Parts Marketplace" },
        { path: "/integrations", icon: Plug2, label: t("nav.integrations") },
        {
          path: "/data-import-export",
          icon: DatabaseBackup,
          label: t("nav.dataImportExport"),
        },
      ],
    },
    {
      label: t("nav.settings"),
      items: [
        { path: "/settings", icon: SettingsIcon, label: t("nav.settings") },
        { path: "/security", icon: Shield, label: t("nav.security") },
        { path: "/profile", icon: UserIcon, label: t("nav.profile") },
        {
          path: "/document-management",
          icon: FileText,
          label: "Document Management",
        },
      ],
    },
  ];

  // Track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navGroups.map((group) => group.label), // All groups expanded by default
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

        {/* Sidebar - Compact Design */}
        <aside
          className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-56 bg-white dark:bg-salis-black border-r border-gray-200 dark:border-salis-gray-dark flex flex-col
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        >
          {/* Logo - Compact */}
          <div className="p-4 border-b border-gray-200 dark:border-salis-gray-dark">
            <Link href="/dashboard">
              <img
                src="/attached_assets/Logo_blue_orange_1760743036292.png"
                alt="SALIS AUTO"
                className="w-24 h-auto mx-auto"
                data-testid="logo-salis-auto"
              />
            </Link>
          </div>

          {/* Navigation - Compact */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-0.5">
              {navGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.label);
                const hasActiveItem = group.items.some(
                  (item) => location === item.path,
                );

                return (
                  <Collapsible
                    key={group.label}
                    open={isExpanded}
                    onOpenChange={() => toggleGroup(group.label)}
                  >
                    <CollapsibleTrigger
                      className="w-full"
                      data-testid={`nav-group-${group.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-salis-gray-dark transition-colors group">
                        <span className="font-poppins font-semibold text-[10px] uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                          {group.label}
                        </span>
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
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ml-1 ${
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
