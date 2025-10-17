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

  // Organized navigation groups
  const navGroups = [
    {
      label: "Dashboard & Overview",
      items: [
        { path: "/dashboard", icon: Home, label: "Dashboard" },
      ]
    },
    {
      label: "Operations & Scheduling",
      items: [
        { path: "/calendar", icon: Calendar, label: "Scheduling & Calendar" },
        { path: "/appointments", icon: Calendar, label: "Appointments" },
        { path: "/tasks", icon: ClipboardCheck, label: "Tasks Management" },
      ]
    },
    {
      label: "Job Management",
      items: [
        { path: "/job-cards", icon: Wrench, label: "Job Cards" },
        { path: "/service-templates", icon: ClipboardList, label: "Service Templates" },
        { path: "/technician-portal", icon: HardHat, label: "Technician Portal" },
      ]
    },
    {
      label: "Staff & Technicians",
      items: [
        { path: "/technician-management", icon: UserCog, label: "Technician Management" },
        { path: "/hr-management", icon: UserCheck, label: "HR Management" },
      ]
    },
    {
      label: "Inventory & Parts",
      items: [
        { path: "/inventory-management", icon: Warehouse, label: "Inventory & Parts" },
        { path: "/spare-parts", icon: Package, label: "Spare Parts" },
        { path: "/tools", icon: Hammer, label: "Tools Management" },
        { path: "/suppliers", icon: Building2, label: "Suppliers" },
      ]
    },
    {
      label: "Orders & Purchasing",
      items: [
        { path: "/purchase-orders", icon: ShoppingCart, label: "Purchase Orders" },
        { path: "/estimates", icon: Receipt, label: "Estimates" },
      ]
    },
    {
      label: "Customers & Vehicles",
      items: [
        { path: "/customers", icon: Users, label: "Customers" },
        { path: "/vehicles", icon: Car, label: "Vehicles" },
      ]
    },
    {
      label: "Financial Management",
      items: [
        { path: "/invoices", icon: FileText, label: "Invoices" },
        { path: "/financial-settings", icon: DollarSign, label: "Financial Settings" },
        { path: "/refund-management", icon: RotateCcw, label: "Refund Management" },
      ]
    },
    {
      label: "Analytics & Insights",
      items: [
        { path: "/reports", icon: BarChart3, label: "Reports" },
        { path: "/business-intelligence", icon: TrendingUp, label: "Business Intelligence" },
      ]
    },
    {
      label: "Advanced Tools",
      items: [
        { path: "/ai-automation", icon: Brain, label: "AI Automation" },
        { path: "/integrations", icon: Plug2, label: "Integrations" },
        { path: "/data-import-export", icon: DatabaseBackup, label: "Data Import/Export" },
      ]
    },
    {
      label: "Settings & Security",
      items: [
        { path: "/settings", icon: SettingsIcon, label: "Settings" },
        { path: "/security", icon: Shield, label: "Security & Compliance" },
        { path: "/profile", icon: UserIcon, label: "My Profile" },
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
      <div className="flex h-screen bg-gray-900">
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

      {/* Sidebar - SALIS AUTO Midnight Blue */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-midnight-blue border-r border-dark-steel flex flex-col
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo - SALIS AUTO Brand */}
        <div className="p-6 border-b border-dark-steel">
          <Link href="/dashboard">
            <img 
              src="/attached_assets/ChatGPT Image Oct 17, 2025, 04_10_17 PM_1760705161242.png" 
              alt="SALIS AUTO"
              className="w-full h-auto"
              data-testid="logo-salis-auto"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
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
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-dark-steel/50 transition-colors group">
                      <span className="font-poppins font-semibold text-xs uppercase text-chrome-silver/70 tracking-wide">
                        {group.label}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-chrome-silver/50 group-hover:text-chrome-silver" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-chrome-silver/50 group-hover:text-chrome-silver" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-1 space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.path;
                      
                      return (
                        <Link key={item.path} href={item.path}>
                          <div
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ml-2 ${
                              isActive
                                ? 'bg-electric-blue text-white shadow-lg shadow-electric-blue/20'
                                : 'text-chrome-silver hover:bg-dark-steel/50 hover:text-white'
                            }`}
                            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="font-poppins font-medium text-sm">
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

        {/* Logout */}
        <div className="p-4 border-t border-dark-steel">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-tech-orange hover:text-tech-orange/80 hover:bg-dark-steel/50"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-poppins font-medium text-sm">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header - Dark with Electric Blue accents */}
        <header className="h-16 bg-gray-900 border-b border-dark-steel px-4 sm:px-8 flex items-center gap-4 shadow-sm">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-chrome-silver hover:text-electric-blue"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <div className="flex-1" />
          
          {/* Search Bar - Hidden on small screens */}
          <div className="hidden md:block relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-chrome-silver" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 bg-dark-steel border-dark-steel text-chrome-silver placeholder:text-chrome-silver/50 focus:border-electric-blue focus:ring-electric-blue font-poppins"
              data-testid="input-search"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setQuickActionsOpen(true)}
            className="gap-2 border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-midnight-blue transition-colors font-poppins"
            data-testid="button-quick-actions"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Actions</span>
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 bg-dark-steel border border-chrome-silver/20 rounded text-xs font-mono text-chrome-silver">
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
