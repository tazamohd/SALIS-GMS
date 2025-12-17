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

  // Workflow-based navigation groups following garage operational sequence
  const navGroups = [
    {
      label: "Dashboard & Overview",
      items: [
        { path: "/dashboard", icon: Home, label: t("nav.dashboard") },
        { path: "/kpi-dashboard", icon: Target, label: "KPI Dashboard" },
        { path: "/service-bay-dashboard", icon: Wrench, label: "Service Bay Monitor" },
        { path: "/automated-reordering", icon: PackageSearch, label: "Auto Reordering" },
        { path: "/loyalty-program", icon: Crown, label: "Loyalty Program" },
      ],
    },
    {
      label: "Customer Intake & Appointments",
      items: [
        { path: "/customers", icon: Users, label: t("nav.customers") },
        { path: "/appointments", icon: Calendar, label: t("nav.appointments") },
        { path: "/calendar", icon: Calendar, label: t("nav.calendar") },
        { path: "/appointment-reminders", icon: Bell, label: "Appointment Reminders" },
        { path: "/kiosk-checkin", icon: TabletSmartphone, label: "Kiosk Check-In" },
      ],
    },
    {
      label: "Vehicle Management",
      items: [
        { path: "/vehicles", icon: Car, label: t("nav.vehicles") },
        { path: "/vehicle-history", icon: Clock, label: "Vehicle History" },
        { path: "/vin-decoder", icon: Fingerprint, label: "VIN Decoder" },
        { path: "/fleet-management", icon: Truck, label: "Fleet Management" },
        { path: "/fleet-tracking", icon: MapPin, label: "Fleet Tracking" },
        { path: "/loaner-vehicles", icon: Key, label: "Loaner Vehicles" },
      ],
    },
    {
      label: "Inspection & Check-In",
      items: [
        { path: "/vehicle-inspections", icon: FileCheck, label: "Vehicle Inspections" },
        { path: "/vehicle-checklist", icon: ClipboardList, label: "Vehicle Checklist" },
        { path: "/digital-vehicle-walkaround", icon: Camera, label: "Vehicle Walkaround" },
        { path: "/security-cameras", icon: Camera, label: "Security Cameras" },
        { path: "/license-plate", icon: Car, label: "Plate Recognition" },
      ],
    },
    {
      label: "Diagnostics & Assessment",
      items: [
        { path: "/diagnostics-obd", icon: Cpu, label: "Diagnostics & OBD" },
        { path: "/smart-damage-assessment", icon: Camera, label: "Smart Damage Assessment" },
        { path: "/vehicle-health-monitoring", icon: Activity, label: "Vehicle Health Monitoring" },
        { path: "/predictive-maintenance", icon: TrendingUp, label: "Predictive Maintenance" },
        { path: "/predictive-diagnostics", icon: Brain, label: "Predictive Diagnostics" },
        { path: "/document-ocr", icon: FileText, label: "Document OCR" },
      ],
    },
    {
      label: "Service Planning & Scheduling",
      items: [
        { path: "/job-cards", icon: Wrench, label: t("nav.jobCards") },
        { path: "/tasks", icon: ClipboardCheck, label: t("nav.tasks") },
        { path: "/service-templates", icon: ClipboardList, label: t("nav.serviceTemplates") },
        { path: "/workshop-calendar", icon: Calendar, label: "Workshop Calendar" },
        { path: "/ai-scheduling", icon: Calendar, label: "AI Scheduling" },
        { path: "/smart-assignment", icon: Brain, label: "Smart Assignment" },
        { path: "/estimates", icon: Receipt, label: t("nav.estimates") },
        { path: "/video-estimates", icon: FileText, label: "Video Estimates" },
        { path: "/smart-parts-recommendations", icon: Package, label: "Smart Parts" },
        { path: "/smart-parts-recommender", icon: Brain, label: "AI Parts Recommender" },
        { path: "/intelligent-price-optimizer", icon: Target, label: "Intelligent Price Optimizer" },
      ],
    },
    {
      label: "Parts & Inventory",
      items: [
        { path: "/inventory-management", icon: Warehouse, label: t("nav.inventory") },
        { path: "/spare-parts", icon: Package, label: t("nav.spareParts") },
        { path: "/tools", icon: Hammer, label: t("nav.tools") },
        { path: "/parts-auto-reorder", icon: RefreshCw, label: "Auto Reordering" },
        { path: "/smart-inventory-forecasting", icon: TrendingUp, label: "Smart Inventory Forecasting" },
        { path: "/suppliers", icon: Building2, label: t("nav.suppliers") },
        { path: "/vendor-supplier-portal", icon: Store, label: "Vendor/Supplier Portal" },
        { path: "/purchase-agent", icon: ShoppingCart, label: "Purchase Agent Portal" },
        { path: "/purchase-orders", icon: ShoppingCart, label: t("nav.purchaseOrders") },
        { path: "/parts-marketplace", icon: ShoppingCart, label: "Parts Marketplace" },
        { path: "/parts-supply-network", icon: Network, label: "Parts Network" },
        { path: "/parts-network", icon: Package, label: "B2B Parts Network" },
        { path: "/barcode-scanner", icon: Scan, label: "Barcode Scanner" },
        { path: "/internal-warehouse", icon: Warehouse, label: "Internal Warehouse" },
      ],
    },
    {
      label: "Service Execution & Operations",
      items: [
        { path: "/technician-portal", icon: HardHat, label: t("nav.technicianPortal") },
        { path: "/technician-management", icon: UserCog, label: t("nav.technicianManagement") },
        { path: "/technician-leaderboards", icon: Trophy, label: "Technician Leaderboards" },
        { path: "/technician-performance", icon: Award, label: "Technician Performance" },
        { path: "/towing-services", icon: Truck, label: "Towing Services" },
        { path: "/towing-assistance", icon: Radio, label: "Towing & Roadside" },
        { path: "/vehicle-storage", icon: Warehouse, label: "Vehicle Storage" },
        { path: "/tire-management", icon: CircleDot, label: "Tire Management" },
        { path: "/routing-optimizer", icon: MapPin, label: "Route Optimizer" },
        { path: "/task-management", icon: ClipboardCheck, label: "Task Management" },
      ],
    },
    {
      label: "Quality & Delivery",
      items: [
        { path: "/contract-management", icon: FileCheck, label: "Contract Management" },
        { path: "/warranty-management", icon: Shield, label: "Warranty Management" },
        { path: "/equipment-calibration", icon: Tool, label: "Calibration" },
        { path: "/iso-quality", icon: Award, label: "ISO 9001 QMS" },
        { path: "/knowledge-base", icon: BookOpen, label: "Knowledge Base" },
      ],
    },
    {
      label: "Billing & Payments",
      items: [
        { path: "/invoices", icon: FileText, label: t("nav.invoices") },
        { path: "/financial-settings", icon: DollarSign, label: t("nav.financialSettings") },
        { path: "/refund-management", icon: RotateCcw, label: t("nav.refunds") },
        { path: "/accounting-integration", icon: DollarSign, label: "Accounting Sync" },
        { path: "/expense-tracking", icon: Receipt, label: "Expense Tracking" },
        { path: "/payroll-management", icon: Wallet, label: "Payroll Management" },
        { path: "/stripe-payment-processing", icon: DollarSign, label: "Payment Processing" },
        { path: "/bank-account-management", icon: Landmark, label: "Bank Accounts" },
        { path: "/loss-account", icon: TrendingDown, label: "Loss Account" },
        { path: "/assets-management", icon: Building2, label: "Assets - الاصول" },
        { path: "/liabilities-management", icon: CreditCard, label: "Liabilities - الخصوم" },
        { path: "/sales-management", icon: ShoppingCart, label: "Sales - المبيعات" },
        { path: "/expenses-management", icon: Receipt, label: "Expenses - المصروفات" },
        { path: "/equity-management", icon: Wallet, label: "Equity - حقوق الملكية" },
        { path: "/capital-management", icon: Landmark, label: "Capital - رأس المال" },
        { path: "/partners-current-account", icon: Users, label: "Partners Account - جاري الشركاء" },
        { path: "/retained-earnings", icon: TrendingUp, label: "Retained Earnings - الاحتياطات" },
        { path: "/chart-of-accounts", icon: FolderTree, label: "Chart of Accounts - شجرة الحسابات" },
        { path: "/general-ledger", icon: BookOpen, label: "General Ledger - دفتر الأستاذ" },
        { path: "/journal-entries", icon: FileText, label: "Journal Entries - القيود اليومية" },
        { path: "/trial-balance", icon: Scale, label: "Trial Balance - ميزان المراجعة" },
        { path: "/income-statement", icon: TrendingUp, label: "Income Statement - قائمة الدخل" },
        { path: "/balance-sheet", icon: Scale, label: "Balance Sheet - الميزانية" },
        { path: "/cash-flow-statement", icon: Banknote, label: "Cash Flow - التدفقات النقدية" },
        { path: "/accounts-receivable", icon: Users, label: "Accounts Receivable - المدينين" },
        { path: "/accounts-payable", icon: Building2, label: "Accounts Payable - الدائنين" },
        { path: "/cost-centers", icon: Target, label: "Cost Centers - مراكز التكلفة" },
        { path: "/budget-management", icon: Calculator, label: "Budget Management - الميزانية التقديرية" },
      ],
    },
    {
      label: "Analytics & Business Intelligence",
      items: [
        { path: "/reports", icon: BarChart3, label: t("nav.reports") },
        { path: "/custom-reports", icon: FileText, label: "Custom Reports" },
        { path: "/business-intelligence", icon: TrendingUp, label: t("nav.businessIntelligence") },
        { path: "/business-intelligence-dashboard", icon: BarChart3, label: "BI Dashboard" },
        { path: "/profit-analysis", icon: DollarSign, label: "Profit Analysis" },
        { path: "/customer-ltv-analysis", icon: TrendingUp, label: "Customer LTV" },
        { path: "/business-heatmaps", icon: Map, label: "Heat Maps" },
        { path: "/ml-fraud-detection", icon: Shield, label: "Fraud Detection" },
      ],
    },
    {
      label: "Customer Experience & Growth",
      items: [
        { path: "/marketing-hub", icon: Megaphone, label: "Marketing Hub" },
        { path: "/marketing-automation", icon: Mail, label: "Marketing Automation" },
        { path: "/email-marketing-campaigns", icon: Mail, label: "Email Marketing" },
        { path: "/customer-loyalty", icon: Award, label: "Customer Loyalty" },
        { path: "/referral-program", icon: Users, label: "Referral Program" },
        { path: "/customer-reviews-ratings", icon: Star, label: "Reviews & Ratings" },
        { path: "/customer-feedback", icon: MessageCircle, label: "Customer Feedback" },
        { path: "/live-service-tracking", icon: Radio, label: "Live Tracking" },
        { path: "/video-consultations", icon: FileText, label: "Video Calls" },
        { path: "/social-media-integration", icon: MessageCircle, label: "Social Media" },
        { path: "/social-media-monitoring", icon: Activity, label: "Social Monitoring" },
        { path: "/google-my-business", icon: Building, label: "Google My Business" },
        { path: "/chat", icon: MessageCircle, label: "Chat" },
        { path: "/ai-chatbot", icon: MessageCircle, label: "AI Chatbot" },
        { path: "/ai-chatbot-assistant", icon: Brain, label: "AI Assistant" },
        { path: "/ai-service-advisor", icon: MessageCircle, label: "AI Service Advisor" },
        { path: "/voice-commands", icon: Radio, label: "Voice Commands" },
        { path: "/voice-command-interface", icon: Radio, label: "Voice Interface" },
        { path: "/sales-guide", icon: Megaphone, label: "Sales Guide" },
      ],
    },
    {
      label: "Team & HR Management",
      items: [
        { path: "/hr-management", icon: UserCheck, label: t("nav.hrManagement") },
        { path: "/timeclock-payroll", icon: Clock, label: "Time & Payroll" },
        { path: "/timesheet-management", icon: Clock, label: "Timesheet Management" },
        { path: "/staff-performance-review", icon: Award, label: "Performance Review" },
        { path: "/training-lms", icon: GraduationCap, label: "Training & Certifications" },
      ],
    },
    {
      label: "Compliance & Safety",
      items: [
        { path: "/environmental-compliance", icon: Leaf, label: "Environmental" },
        { path: "/safety-incidents", icon: AlertTriangle, label: "Safety Incidents" },
        { path: "/insurance-claims", icon: Shield, label: "Insurance Claims" },
        { path: "/compliance-management", icon: Shield, label: "Compliance Management" },
      ],
    },
    {
      label: "Enterprise & Franchise",
      items: [
        { path: "/franchise-management", icon: Building2, label: "Franchise Management" },
        { path: "/oem-software", icon: Key, label: "OEM Software" },
        { path: "/globalization", icon: Globe, label: "Globalization" },
        { path: "/telematics-integration", icon: Satellite, label: "Telematics Integration" },
        { path: "/blockchain-service-history", icon: Network, label: "Blockchain History" },
        { path: "/smart-contracts", icon: FileCheck, label: "Smart Contracts" },
      ],
    },
    {
      label: "Emerging Technologies",
      items: [
        { path: "/ar-repair-guide", icon: Monitor, label: "AR Repair Guide" },
        { path: "/ar-overlay", icon: ScanLine, label: "AR Overlay" },
        { path: "/vr-showroom", icon: Monitor, label: "VR Showroom" },
        { path: "/drone-inspection", icon: Camera, label: "Drone Inspection" },
        { path: "/wearable-integration", icon: TabletSmartphone, label: "Wearable Devices" },
        { path: "/digital-twin-viewer", icon: Monitor, label: "Digital Twin" },
        { path: "/computer-vision-qc", icon: Camera, label: "Vision QC" },
        { path: "/iot-dashboard", icon: Satellite, label: "IoT Dashboard" },
        { path: "/edge-computing", icon: Cpu, label: "Edge Computing" },
        { path: "/nextgen-technologies", icon: Zap, label: "NextGen Tech" },
        { path: "/sustainable-energy-monitoring", icon: Leaf, label: "Energy Monitoring" },
      ],
    },
    {
      label: "AI & Automation Hub",
      items: [
        { path: "/ai-automation", icon: Brain, label: t("nav.aiAutomation") },
        { path: "/call-center", icon: Radio, label: "Call Center" },
        { path: "/parts-availability", icon: RefreshCw, label: "Parts Availability" },
      ],
    },
    {
      label: "System & Settings",
      items: [
        { path: "/settings", icon: SettingsIcon, label: t("nav.settings") },
        { path: "/security", icon: Shield, label: t("nav.security") },
        { path: "/data-backup", icon: DatabaseBackup, label: t("nav.backup", "Data Backup") },
        { path: "/dashboard-widgets", icon: LayoutDashboard, label: t("nav.widgets", "Dashboard Widgets") },
        { path: "/profile", icon: UserIcon, label: t("nav.profile") },
        { path: "/notifications", icon: Bell, label: "Notifications" },
        { path: "/document-management", icon: FileText, label: "Document Management" },
        { path: "/data-import-export", icon: DatabaseBackup, label: t("nav.dataImportExport") },
        { path: "/integrations", icon: Plug2, label: t("nav.integrations") },
        { path: "/digital-signage", icon: Monitor, label: "Digital Signage" },
      ],
    },
  ];

  // Role-based navigation filtering
  const roleNavigationMap: Record<string, string[]> = {
    // Technicians only see operational groups
    'technician': ['Dashboard & Overview', 'Service Execution & Operations', 'Parts & Inventory'],
    // Purchase Agents see inventory and supplier groups
    'Purchase Agent': ['Dashboard & Overview', 'Parts & Inventory', 'Billing & Payments'],
    // Call Center sees customer-related groups
    'Call Center Agent': ['Dashboard & Overview', 'Customer Intake & Appointments', 'Customer Experience & Growth', 'AI & Automation Hub'],
    // HR roles see team management
    'HR Manager': ['Dashboard & Overview', 'Team & HR Management', 'Billing & Payments'],
    'HR Officer': ['Dashboard & Overview', 'Team & HR Management'],
    // Accountants see financial groups
    'Accountant': ['Dashboard & Overview', 'Billing & Payments', 'Analytics & Business Intelligence'],
    // Service Advisors see customer and service groups
    'Service Advisor': ['Dashboard & Overview', 'Customer Intake & Appointments', 'Vehicle Management', 'Service Planning & Scheduling', 'Billing & Payments'],
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
                        <span className="font-poppins font-bold text-sm uppercase text-gray-700 dark:text-gray-300 tracking-wider leading-tight text-left">
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
