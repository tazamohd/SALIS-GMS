import { Home, ClipboardCheck, UserIcon, LogOut, Search, Calendar, Users, ShoppingCart, FileText, BarChart3, Wrench, ClipboardList, Hammer, Package, Building2, HardHat, UserCog, Zap, Car, Receipt, Warehouse, DollarSign, RotateCcw, DatabaseBackup, TrendingUp, UserCheck, Brain, Plug2, Shield, Settings as SettingsIcon, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import { QuickActionsModal } from "@/components/QuickActionsModal";
import { SkipLink } from "@/components/SkipLink";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useQuery } from "@tanstack/react-query";
import type { UserSettings } from "@shared/schema";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get user settings for keyboard shortcuts
  const { data: settings } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
  });
  
  // Enable global keyboard shortcuts
  useKeyboardShortcuts(settings?.enableKeyboardShortcuts ?? true);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

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

  // Streamlined and reorganized navigation groups
  const navGroups = [
    {
      label: "Dashboard",
      items: [
        { path: "/dashboard", icon: Home, label: "Dashboard" },
      ]
    },
    {
      label: "Operations",
      items: [
        { path: "/job-cards", icon: Wrench, label: "Job Cards" },
        { path: "/calendar", icon: Calendar, label: "Calendar & Scheduling" },
        { path: "/appointments", icon: Calendar, label: "Appointments" },
        { path: "/tasks", icon: ClipboardCheck, label: "Tasks" },
        { path: "/service-templates", icon: ClipboardList, label: "Service Templates" },
        { path: "/technician-portal", icon: HardHat, label: "Technician Portal" },
      ]
    },
    {
      label: "Customers & Fleet",
      items: [
        { path: "/customers", icon: Users, label: "Customers" },
        { path: "/vehicles", icon: Car, label: "Vehicles" },
      ]
    },
    {
      label: "Inventory & Orders",
      items: [
        { path: "/inventory-management", icon: Warehouse, label: "Inventory & Parts" },
        { path: "/spare-parts", icon: Package, label: "Spare Parts" },
        { path: "/tools", icon: Hammer, label: "Tools" },
        { path: "/suppliers", icon: Building2, label: "Suppliers" },
        { path: "/purchase-orders", icon: ShoppingCart, label: "Purchase Orders" },
        { path: "/estimates", icon: Receipt, label: "Estimates & Quotes" },
      ]
    },
    {
      label: "Team & Staff",
      items: [
        { path: "/technician-management", icon: UserCog, label: "Technician Management" },
        { path: "/hr-management", icon: UserCheck, label: "HR & Payroll" },
      ]
    },
    {
      label: "Finance",
      items: [
        { path: "/invoices", icon: FileText, label: "Invoices" },
        { path: "/financial-settings", icon: DollarSign, label: "Financial Settings" },
        { path: "/refund-management", icon: RotateCcw, label: "Refunds" },
      ]
    },
    {
      label: "Analytics",
      items: [
        { path: "/reports", icon: BarChart3, label: "Reports" },
        { path: "/business-intelligence", icon: TrendingUp, label: "Business Intelligence" },
      ]
    },
    {
      label: "Automation & Tools",
      items: [
        { path: "/ai-automation", icon: Brain, label: "AI Automation" },
        { path: "/integrations", icon: Plug2, label: "Integrations" },
        { path: "/data-import-export", icon: DatabaseBackup, label: "Data Import/Export" },
      ]
    },
    {
      label: "Settings",
      items: [
        { path: "/settings", icon: SettingsIcon, label: "Settings" },
        { path: "/security", icon: Shield, label: "Security" },
        { path: "/profile", icon: UserIcon, label: "Profile" },
      ]
    },
  ];

  // Track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navGroups.map(group => group.label) // All groups expanded by default
  );

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupLabel)
        ? prev.filter(label => label !== groupLabel)
        : [...prev, groupLabel]
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
            onKeyDown={(e) => e.key === 'Enter' && setMobileMenuOpen(false)}
          />
        )}

      {/* Sidebar - Compact Design */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-56 bg-white dark:bg-salis-black border-r border-gray-200 dark:border-salis-gray-dark flex flex-col
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
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
              const hasActiveItem = group.items.some(item => location === item.path);
              
              return (
                <Collapsible
                  key={group.label}
                  open={isExpanded}
                  onOpenChange={() => toggleGroup(group.label)}
                >
                  <CollapsibleTrigger 
                    className="w-full"
                    data-testid={`nav-group-${group.label.toLowerCase().replace(/\s+/g, '-')}`}
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
                                ? 'bg-salis-black dark:bg-white text-white dark:text-salis-black shadow-md'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-salis-gray-dark hover:text-salis-black dark:hover:text-white'
                            }`}
                            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
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
            <span className="font-poppins font-medium text-xs">Logout</span>
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
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          
          <div className="flex-1" />
          
          {/* Search Bar - Compact */}
          <div className="hidden md:block relative w-full max-w-md">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Search..."
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
          <NotificationBell />
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-auto" tabIndex={-1}>
          {children}
        </main>
      </div>

      {/* Quick Actions Modal */}
      <QuickActionsModal open={quickActionsOpen} onOpenChange={setQuickActionsOpen} />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      </div>
    </>
  );
}
