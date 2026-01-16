import {
  Home,
  ClipboardCheck,
  UserIcon,
  LogOut,
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
import { RoleBadge } from "@/components/RoleBadge";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ArabicLanguageToggle } from "@/components/ArabicLanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QuickActionsModal } from "@/components/QuickActionsModal";
import { SmartSearch } from "@/components/SmartSearch";
import { SkipLink } from "@/components/SkipLink";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { CustomerChatWidget } from "@/components/CustomerChatWidget";
import { InternalChatSidebar } from "@/components/InternalChatSidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { UserSettings, Garage } from "@shared/schema";
import { 
  navigationConfig, 
  filterNavigationByAccess,
  mapUserRoleToNavRole,
  type NavGroup,
  type UserRole,
  type SubscriptionPlan
} from "@/config/navigation";

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

  // Subscription plan is now included in user object from /api/user endpoint
  // No separate fetch needed - plan is available immediately

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

  // Get user role and plan for filtering navigation
  const rawRole = (user as any)?.role;
  const userRole: UserRole = mapUserRoleToNavRole(rawRole);
  
  // Subscription plan comes from user object (included by /api/user endpoint)
  const rawPlan = (user as any)?.subscriptionPlan;
  const normalizedPlan = rawPlan ? rawPlan.toUpperCase() : null;
  const userPlan: SubscriptionPlan = (normalizedPlan && ['STARTER', 'PRO', 'ENTERPRISE'].includes(normalizedPlan)) 
    ? normalizedPlan as SubscriptionPlan 
    : 'STARTER';
  
  // Debug RBAC
  console.log('RBAC Debug - rawRole:', rawRole, 'userRole:', userRole, 'userPlan:', userPlan);
  
  // Filter navigation based on STRICT RBAC - pass rawRole for role-specific access control
  const filteredNavigation = filterNavigationByAccess(navigationConfig, userRole, userPlan, false, rawRole);
  console.log('RBAC Debug - navGroups count:', navigationConfig.length, 'filtered count:', filteredNavigation.length, 'rawRole:', rawRole);
  
  // Helper function to convert navigation title to translation key
  const getNavKey = (title: string): string => {
    return `nav.${title.toLowerCase().replace(/[&\s]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`;
  };

  // Convert to legacy format for backwards compatibility with existing sidebar rendering
  // Apply translations to all navigation labels
  const navGroups = filteredNavigation.map((group: NavGroup) => ({
    label: t(getNavKey(group.title), group.title),
    items: group.items 
      ? group.items.map((item) => ({
          path: item.href,
          icon: group.icon,
          label: t(getNavKey(item.title), item.title),
        })) 
      : [{ path: group.href!, icon: group.icon, label: t(getNavKey(group.title), group.title) }],
  }));

  const filteredNavGroups = navGroups;

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
      <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0E1117]">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={t("common.closeMobileMenu", "Close mobile menu")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Brand Design System */}
        <aside
          className={`
        fixed lg:static inset-y-0 left-0 z-50 relative
        bg-white dark:bg-[#0B1F3B] border-r border-[#E2E8F0] dark:border-[#232A36] flex flex-col
        transition-transform duration-300 ease-in-out
        w-[280px] max-w-[85vw] lg:max-w-none
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
          style={{ ['--sidebar-width' as string]: `${sidebarWidth}px` }}
        >
          <style>{`
            @media (min-width: 1024px) {
              aside[style*="--sidebar-width"] {
                width: var(--sidebar-width) !important;
                max-width: none !important;
              }
            }
          `}</style>
          {/* Resize Handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#0A5ED7] dark:hover:bg-[#0BB3FF] transition-colors z-10 hidden lg:block"
            onMouseDown={() => setIsResizing(true)}
            data-testid="sidebar-resize-handle"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-1 rounded bg-[#E2E8F0] dark:bg-[#232A36] opacity-0 hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3 text-[#64748B] dark:text-[#9BA4B0]" />
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
                      <div className="flex items-center justify-start gap-2 pl-2 pr-2 py-2 rounded-md hover:bg-[#0A5ED7]/10 dark:hover:bg-[#0BB3FF]/10 transition-colors group">
                        <span className="font-poppins font-bold text-[11px] uppercase text-[#64748B] dark:text-[#9BA4B0] tracking-wide leading-tight text-left whitespace-nowrap">
                          {groupLabel}
                        </span>
                        <div className="flex-1" />
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-[#64748B] dark:text-[#9BA4B0] group-hover:text-[#0A5ED7] dark:group-hover:text-[#0BB3FF]" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-[#64748B] dark:text-[#9BA4B0] group-hover:text-[#0A5ED7] dark:group-hover:text-[#0BB3FF]" />
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
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-2 pl-6 pr-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white shadow-md"
                                  : "text-[#0F172A] dark:text-[#E6EAF0] hover:bg-[#0A5ED7]/10 dark:hover:bg-[#0BB3FF]/10 hover:text-[#0A5ED7] dark:hover:text-[#0BB3FF]"
                              }`}
                              data-testid={`nav-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
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

          {/* Logout */}
          <div className="p-3 border-t border-[#E2E8F0] dark:border-[#232A36]">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-[#F97316] hover:text-white hover:bg-[#F97316] dark:hover:bg-[#F97316] h-8 transition-colors"
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
          {/* Header - Brand Design */}
          <header className="h-14 bg-white dark:bg-[#0B1F3B] border-b border-[#E2E8F0] dark:border-[#232A36] px-4 sm:px-6 flex items-center gap-3 shadow-sm">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-[#0F172A] dark:text-[#E6EAF0] hover:text-[#0A5ED7] dark:hover:text-[#0BB3FF] h-8 w-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t("common.toggleMobileMenu", "Toggle mobile menu")}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>

            <div className="flex-1" />

            {/* Smart Search Bar */}
            <div className="hidden md:block">
              <SmartSearch 
                placeholder={t("common.smartSearch", "Search customers, vehicles, parts...")}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickActionsOpen(true)}
              className="gap-2 h-9 border-[#E2E8F0] dark:border-[#232A36] text-[#0F172A] dark:text-[#E6EAF0] hover:bg-gradient-to-r hover:from-[#0A5ED7] hover:to-[#0BB3FF] hover:text-white hover:border-transparent transition-all font-poppins"
              data-testid="button-quick-actions"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">{t("common.quick_actions", "Quick Actions")}</span>
              <kbd className="hidden sm:inline-flex px-1 py-0.5 bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] rounded text-[10px] font-mono text-[#64748B] dark:text-[#9BA4B0]">
                {navigator.platform.includes("Mac") ? "⌘K" : "Ctrl+K"}
              </kbd>
            </Button>
            <RoleBadge size="sm" className="hidden sm:flex" />
            <ArabicLanguageToggle />
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationBell />
            <InternalChatSidebar />
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

        {/* Customer Chat Widget */}
        <CustomerChatWidget />
      </div>
    </>
  );
}
