import {
  Activity,
  AlertTriangle,
  Award,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Building,
  Building2,
  Calculator,
  Calendar,
  Camera,
  Car,
  Clock,
  Cpu,
  CreditCard,
  Crown,
  Database,
  TrendingUp,
  TrendingDown,
  MapPin,
  FileBarChart,
  FolderTree,
  Scale,
  DollarSign,
  Wallet,
  Landmark,
  Plug2,
  Star,
  Trophy,
  Mail,
  Megaphone,
  RefreshCw,
  Gift,
  Globe,
  Search,
  UserCog,
  Timer,
  Gauge,
  GraduationCap,
  Recycle,
  ShieldAlert,
  Eye,
  Key,
  Satellite,
  Network,
  FileCheck,
  Monitor,
  ScanLine,
  TabletSmartphone,
  Zap,
  Leaf,
  Radio,
  Video,
  Mic,
  DatabaseBackup,
  FileText,
  HardHat,
  Home,
  LayoutDashboard,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  Shield,
  Store,
  Truck,
  UserIcon,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UserRole = 'PLATFORM_ADMIN' | 'ADMIN' | 'MANAGER' | 'ADVISOR' | 'TECHNICIAN' | 'ACCOUNTANT';
export type SubscriptionPlan = 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  roles?: UserRole[];
  minPlan?: SubscriptionPlan;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  href?: string;
  roles?: UserRole[];
  minPlan?: SubscriptionPlan;
  items?: NavItem[];
}

// ═══════════════════════════════════════════════════════
// MVP Navigation — 15 core pages only.
// All other pages remain routable via URL but are hidden
// from the sidebar until enabled via feature flags.
// ═══════════════════════════════════════════════════════

export const navigationConfig: NavGroup[] = [
  {
    title: "Platform Administration",
    icon: Crown,
    roles: ['PLATFORM_ADMIN'],
    items: [
      { title: "Platform Overview", href: "/platform-admin", icon: LayoutDashboard, roles: ['PLATFORM_ADMIN'] },
      { title: "Garage Management", href: "/platform-admin/garages", icon: Building2, roles: ['PLATFORM_ADMIN'] },
      { title: "Supplier Management", href: "/platform-admin/suppliers", icon: Truck, roles: ['PLATFORM_ADMIN'] },
      { title: "User Management", href: "/platform-admin/users", icon: Users, roles: ['PLATFORM_ADMIN'] },
      { title: "Help & Support", href: "/platform-admin/support", icon: MessageSquare, roles: ['PLATFORM_ADMIN'] },
      { title: "Platform Analytics", href: "/platform-admin/analytics", icon: BarChart3, roles: ['PLATFORM_ADMIN'] },
      { title: "RBAC & Roles", href: "/platform-admin/roles", icon: Shield, roles: ['PLATFORM_ADMIN'] },
      { title: "System Health", href: "/platform-admin/system", icon: Activity, roles: ['PLATFORM_ADMIN'] },
      { title: "Billing & Subscriptions", href: "/platform-admin/billing", icon: CreditCard, roles: ['PLATFORM_ADMIN'] },
    ],
  },
  {
    title: "Overview",
    icon: Home,
    items: [
      { title: "Dashboard", href: "/", icon: Home },
    ],
  },
  {
    title: "Operations",
    icon: Wrench,
    items: [
      { title: "Job Cards", href: "/job-cards", icon: Wrench },
      { title: "Appointments", href: "/appointments", icon: Calendar },
      { title: "Marketplace Bookings", href: "/provider-bookings", icon: Calendar, roles: ['ADMIN', 'MANAGER', 'ADVISOR'] },
      { title: "My Offerings", href: "/my-offerings", icon: Receipt, roles: ['ADMIN', 'MANAGER'] },
      { title: "Estimates", href: "/estimates", icon: Receipt, roles: ['ADMIN', 'MANAGER', 'ADVISOR'] },
    ],
  },
  {
    title: "Customers & Vehicles",
    icon: Users,
    items: [
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Vehicles", href: "/vehicles", icon: Car },
      { title: "Fleet Management", href: "/fleet-management", icon: Truck },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    items: [
      { title: "Inventory", href: "/inventory-management", icon: Package },
    ],
  },
  {
    title: "Team",
    icon: HardHat,
    items: [
      { title: "Technicians", href: "/technician-management", icon: HardHat },
    ],
  },
  {
    title: "Finance",
    icon: CreditCard,
    roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'],
    items: [
      { title: "Invoices", href: "/invoices", icon: FileText },
      { title: "Payments", href: "/stripe-payment-processing", icon: CreditCard },
      { title: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Analytics & Business Intelligence",
    icon: BarChart3,
    roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'],
    items: [
      { title: "Business Intelligence", href: "/business-intelligence", icon: BarChart3 },
      { title: "BI Dashboard", href: "/business-intelligence-dashboard", icon: LayoutDashboard },
      { title: "Profit Analysis", href: "/profit-analysis", icon: TrendingUp },
      { title: "Customer LTV Analysis", href: "/customer-ltv-analysis", icon: Users },
      { title: "Business Heat Maps", href: "/business-heatmaps", icon: MapPin },
      { title: "Reports", href: "/reports", icon: FileText },
      { title: "Advanced Reports", href: "/advanced-reports", icon: FileBarChart },
      { title: "Custom Reports", href: "/custom-reports", icon: FileBarChart },
    ],
  },
  {
    title: "Finance & Accounting",
    icon: BookOpen,
    roles: ['ADMIN', 'ACCOUNTANT'],
    items: [
      { title: "General Ledger", href: "/general-ledger", icon: BookOpen },
      { title: "Chart of Accounts", href: "/chart-of-accounts", icon: FolderTree },
      { title: "Journal Entries", href: "/journal-entries", icon: FileText },
      { title: "Trial Balance", href: "/trial-balance", icon: Scale },
      { title: "Balance Sheet", href: "/balance-sheet", icon: Scale },
      { title: "Income Statement", href: "/income-statement", icon: TrendingUp },
      { title: "Cash Flow Statement", href: "/cash-flow-statement", icon: DollarSign },
      { title: "Accounts Receivable", href: "/accounts-receivable", icon: Wallet },
      { title: "Accounts Payable", href: "/accounts-payable", icon: Receipt },
      { title: "Bank Accounts", href: "/bank-account-management", icon: Landmark },
      { title: "Budget Management", href: "/budget-management", icon: Calculator },
      { title: "Cost Centers", href: "/cost-centers", icon: Building2 },
      { title: "Capital Management", href: "/capital-management", icon: Banknote },
      { title: "Equity Management", href: "/equity-management", icon: Scale },
      { title: "Liabilities", href: "/liabilities-management", icon: TrendingDown },
      { title: "Retained Earnings", href: "/retained-earnings", icon: Wallet },
      { title: "Partners Account", href: "/partners-current-account", icon: Users },
      { title: "Loss Account", href: "/loss-account", icon: TrendingDown },
      { title: "Financial Settings", href: "/financial-settings", icon: Settings },
      { title: "Accounting Integration", href: "/accounting-integration", icon: Plug2 },
    ],
  },
  {
    title: "Customer Experience & Growth",
    icon: Star,
    items: [
      { title: "Customer Loyalty", href: "/customer-loyalty", icon: Trophy },
      { title: "Service Reminders", href: "/appointment-reminders", icon: Bell },
      { title: "Email Campaigns", href: "/email-marketing-campaigns", icon: Mail },
      { title: "Marketing Hub", href: "/marketing-hub", icon: Megaphone },
      { title: "Marketing Automation", href: "/marketing-automation", icon: RefreshCw },
      { title: "Referral Program", href: "/referral-program", icon: Gift },
      { title: "Google My Business", href: "/google-my-business", icon: MapPin },
      { title: "Social Media", href: "/social-media-integration", icon: Globe },
      { title: "Social Monitoring", href: "/social-media-monitoring", icon: Search },
      { title: "Sales Management", href: "/sales-management", icon: DollarSign },
      { title: "Sales Guide", href: "/sales-guide", icon: BookOpen },
    ],
  },
  {
    title: "Team & HR Management",
    icon: UserCog,
    roles: ['ADMIN', 'MANAGER'],
    items: [
      { title: "HR Management", href: "/hr-management", icon: UserCog },
      { title: "Payroll Management", href: "/payroll-management", icon: DollarSign },
      { title: "Timeclock/Payroll", href: "/timeclock-payroll", icon: Timer },
      { title: "Timesheet Management", href: "/timesheet-management", icon: Clock },
      { title: "Staff Performance Review", href: "/staff-performance-review", icon: Award },
      { title: "Technician Performance", href: "/technician-performance", icon: Gauge },
      { title: "Technician Leaderboards", href: "/technician-leaderboards", icon: Trophy },
      { title: "Training LMS", href: "/training-lms", icon: GraduationCap },
      { title: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
      { title: "Chat", href: "/chat", icon: MessageSquare },
    ],
  },
  {
    title: "Compliance & Safety",
    icon: Shield,
    items: [
      { title: "Compliance Management", href: "/compliance-management", icon: Shield },
      { title: "Environmental Compliance", href: "/environmental-compliance", icon: Recycle },
      { title: "ISO Quality", href: "/iso-quality", icon: BadgeCheck },
      { title: "Safety Incidents", href: "/safety-incidents", icon: ShieldAlert },
      { title: "Audit Trail", href: "/audit-trail", icon: Eye },
      { title: "Assets Management", href: "/assets-management", icon: Building },
      { title: "Vendor Supplier Portal", href: "/vendor-supplier-portal", icon: Store },
    ],
  },
  {
    title: "Enterprise & Franchise",
    icon: Building2,
    minPlan: 'ENTERPRISE',
    items: [
      { title: "Franchise Management", href: "/franchise-management", icon: Building2 },
      { title: "OEM Software", href: "/oem-software", icon: Key },
      { title: "Globalization", href: "/globalization", icon: Globe },
      { title: "Telematics Integration", href: "/telematics-integration", icon: Satellite },
      { title: "Blockchain History", href: "/blockchain-service-history", icon: Network },
      { title: "Smart Contracts", href: "/smart-contracts", icon: FileCheck },
    ],
  },
  {
    title: "Emerging Technologies",
    icon: Monitor,
    minPlan: 'PRO',
    items: [
      { title: "3D Parts Viewer", href: "/interactive-3d-parts", icon: Package },
      { title: "AR Repair Guide", href: "/ar-repair-guide", icon: Monitor },
      { title: "Drone Inspection", href: "/drone-inspection", icon: Camera },
      { title: "Wearable Devices", href: "/wearable-integration", icon: TabletSmartphone },
      { title: "Digital Twin", href: "/digital-twin-viewer", icon: Monitor },
      { title: "Vision QC", href: "/computer-vision-qc", icon: Camera },
      { title: "IoT Dashboard", href: "/iot-dashboard", icon: Satellite },
      { title: "Edge Computing", href: "/edge-computing", icon: Cpu },
      { title: "NextGen Tech", href: "/nextgen-technologies", icon: Zap },
      { title: "Energy Monitoring", href: "/sustainable-energy-monitoring", icon: Leaf },
    ],
  },
  {
    title: "AI & Automation Hub",
    icon: Brain,
    items: [
      { title: "AI Automation", href: "/ai-automation", icon: Brain },
      { title: "Call Center", href: "/call-center", icon: Radio },
      { title: "Support Chat", href: "/support-chat-dashboard", icon: MessageSquare },
      { title: "Parts Availability", href: "/parts-availability", icon: RefreshCw },
      { title: "AI Chatbot", href: "/ai-chatbot", icon: MessageSquare },
      { title: "AI Chatbot Assistant", href: "/ai-chatbot-assistant", icon: Brain },
      { title: "AI Service Advisor", href: "/ai-service-advisor", icon: Brain },
      { title: "ML Fraud Detection", href: "/ml-fraud-detection", icon: ShieldAlert },
      { title: "Video Consultations", href: "/video-consultations", icon: Video },
      { title: "Voice Commands", href: "/voice-commands", icon: Mic },
      { title: "Voice Interface", href: "/voice-command-interface", icon: Radio },
    ],
  },
  {
    title: "System & Settings",
    icon: Settings,
    items: [
      { title: "Subscription", href: "/subscriptions", icon: CreditCard, roles: ['ADMIN', 'MANAGER'] },
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Backup & Export", href: "/data-backup", icon: Database, roles: ['ADMIN', 'MANAGER'] },
      { title: "Profile", href: "/profile", icon: UserIcon },
      { title: "Notifications", href: "/notifications", icon: Bell },
      { title: "Notification Center", href: "/notification-center", icon: Bell, roles: ['ADMIN', 'MANAGER'] },
      { title: "Document Management", href: "/document-management", icon: FileText, roles: ['ADMIN', 'MANAGER'] },
      { title: "Data Import/Export", href: "/data-import-export", icon: DatabaseBackup, roles: ['ADMIN', 'MANAGER'] },
      { title: "Integrations", href: "/integrations", icon: Plug2, roles: ['ADMIN', 'MANAGER'] },
      { title: "Digital Signage", href: "/digital-signage", icon: Monitor, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
];

const planHierarchy: Record<SubscriptionPlan, number> = {
  STARTER: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

export function hasRequiredPlan(
  userPlan: SubscriptionPlan | undefined,
  requiredPlan: SubscriptionPlan | undefined
): boolean {
  if (!requiredPlan) return true;
  if (!userPlan) return false;
  return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
}

export function hasRequiredRole(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[] | undefined
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  if (userRole === 'PLATFORM_ADMIN') return true;
  if (userRole === 'ADMIN') return allowedRoles.some(r => r !== 'PLATFORM_ADMIN') || allowedRoles.includes('ADMIN');
  return allowedRoles.includes(userRole);
}

export function filterNavigationByAccess(
  navigation: NavGroup[],
  userRole: UserRole | undefined,
  userPlan: SubscriptionPlan | undefined,
  skipPlanFilter: boolean = false
): NavGroup[] {
  return navigation
    .filter(group => {
      const hasRole = hasRequiredRole(userRole, group.roles);
      const hasPlan = skipPlanFilter || hasRequiredPlan(userPlan, group.minPlan);
      return hasRole && hasPlan;
    })
    .map(group => {
      if (!group.items) return group;

      const filteredItems = group.items.filter(item => {
        const hasRole = hasRequiredRole(userRole, item.roles);
        const hasPlan = skipPlanFilter || hasRequiredPlan(userPlan, item.minPlan);
        return hasRole && hasPlan;
      });

      return { ...group, items: filteredItems };
    })
    .filter(group => !group.items || group.items.length > 0);
}
