import {
  Home,
  Target,
  Wrench,
  PackageSearch,
  Crown,
  Users,
  Calendar,
  Bell,
  TabletSmartphone,
  Car,
  Clock,
  Fingerprint,
  Truck,
  MapPin,
  Key,
  FileCheck,
  ClipboardList,
  Camera,
  Cpu,
  Activity,
  TrendingUp,
  Brain,
  FileText,
  ClipboardCheck,
  Receipt,
  Package,
  Warehouse,
  Hammer,
  RefreshCw,
  ShoppingCart,
  Building2,
  HardHat,
  Building,
  BarChart3,
  DollarSign,
  BookOpen,
  Wallet,
  Landmark,
  Calculator,
  Scale,
  Banknote,
  TrendingDown,
  FolderTree,
  Star,
  Store,
  Trophy,
  Mail,
  Megaphone,
  CreditCard,
  UserCog,
  GraduationCap,
  Shield,
  AlertTriangle,
  Award,
  Globe,
  Satellite,
  Network,
  Monitor,
  ScanLine,
  Leaf,
  Radio,
  Settings,
  DatabaseBackup,
  LayoutDashboard,
  Plug2,
  UserIcon,
  Video,
  Mic,
  Share2,
  Search,
  Route,
  Timer,
  Gauge,
  FileBarChart,
  Gift,
  Eye,
  Zap,
  MessageSquare,
  Recycle,
  BadgeCheck,
  ShieldAlert,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UserRole = 'ADMIN' | 'MANAGER' | 'ADVISOR' | 'TECHNICIAN' | 'ACCOUNTANT' | 'CUSTOMER';
export type SubscriptionPlan = 'STARTER' | 'PRO' | 'ENTERPRISE';

export function mapUserRoleToNavRole(role: string | undefined): UserRole {
  if (!role) return 'ADVISOR';
  
  const normalizedRole = role.toLowerCase();
  
  const adminRoles = ['system_administrator', 'business_owner'];
  const managerRoles = ['general_manager', 'service_manager', 'parts_manager', 'finance_manager', 'hr_manager', 'marketing_manager', 'fleet_manager'];
  const technicianRoles = ['lead_technician', 'technician', 'quality_control_inspector'];
  const accountantRoles = ['accountant'];
  const customerRoles = ['customer'];
  const advisorRoles = ['service_advisor', 'customer_service_rep', 'receptionist', 'call_center_agent', 'bdc_specialist', 'compliance_officer', 'inventory_controller', 'purchase_agent', 'data_analyst', 'ai_automation_specialist', 'customer_success_manager'];
  
  if (adminRoles.includes(normalizedRole)) return 'ADMIN';
  if (managerRoles.includes(normalizedRole)) return 'MANAGER';
  if (technicianRoles.includes(normalizedRole)) return 'TECHNICIAN';
  if (accountantRoles.includes(normalizedRole)) return 'ACCOUNTANT';
  if (customerRoles.includes(normalizedRole)) return 'CUSTOMER';
  if (advisorRoles.includes(normalizedRole)) return 'ADVISOR';
  
  return 'ADVISOR';
}

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

export const navigationConfig: NavGroup[] = [
  {
    title: "Dashboard & Overview",
    icon: Home,
    roles: ['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN', 'ACCOUNTANT'],
    items: [
      { title: "Dashboard", href: "/", icon: Home },
      { title: "KPI Dashboard", href: "/kpi-dashboard", icon: Target, roles: ['ADMIN', 'MANAGER'] },
      { title: "Service Bay Monitor", href: "/service-bay-dashboard", icon: Wrench, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
      { title: "Auto Reordering", href: "/automated-reordering", icon: PackageSearch, roles: ['ADMIN', 'MANAGER'] },
      { title: "Loyalty Program", href: "/loyalty-program", icon: Crown, roles: ['ADMIN', 'MANAGER', 'ADVISOR'] },
    ],
  },
  {
    title: "Customer Intake & Appointments",
    icon: Users,
    roles: ['ADMIN', 'MANAGER', 'ADVISOR'],
    items: [
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Appointments", href: "/appointments", icon: Calendar },
      { title: "Calendar", href: "/calendar", icon: Calendar },
      { title: "Appointment Reminders", href: "/appointment-reminders", icon: Bell },
      { title: "Kiosk Check-In", href: "/kiosk-checkin", icon: TabletSmartphone },
    ],
  },
  {
    title: "Vehicle Management",
    icon: Car,
    roles: ['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN'],
    items: [
      { title: "Vehicles", href: "/vehicles", icon: Car },
      { title: "Vehicle History", href: "/vehicle-history", icon: Clock },
      { title: "VIN Decoder", href: "/vin-decoder", icon: Fingerprint },
      { title: "Fleet Management", href: "/fleet-management", icon: Truck, roles: ['ADMIN', 'MANAGER'] },
      { title: "Fleet Tracking", href: "/fleet-tracking", icon: MapPin, roles: ['ADMIN', 'MANAGER'] },
      { title: "Vehicle Tracking", href: "/vehicle-tracking", icon: MapPin },
      { title: "Loaner Vehicles", href: "/loaner-vehicles", icon: Key },
    ],
  },
  {
    title: "Inspection & Check-In",
    icon: FileCheck,
    roles: ['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN'],
    items: [
      { title: "Vehicle Inspections", href: "/vehicle-inspections", icon: FileCheck },
      { title: "Vehicle Checklist", href: "/vehicle-checklist", icon: ClipboardList },
      { title: "Vehicle Walkaround", href: "/digital-vehicle-walkaround", icon: Camera },
      { title: "Security Cameras", href: "/security-cameras", icon: Camera, roles: ['ADMIN', 'MANAGER'] },
      { title: "Plate Recognition", href: "/license-plate", icon: Car },
    ],
  },
  {
    title: "Diagnostics & Assessment",
    icon: Cpu,
    roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'],
    items: [
      { title: "Diagnostics & OBD", href: "/diagnostics-obd", icon: Cpu },
      { title: "Smart Damage Assessment", href: "/smart-damage-assessment", icon: Camera },
      { title: "Vehicle Health Monitoring", href: "/vehicle-health-monitoring", icon: Activity },
      { title: "Predictive Maintenance", href: "/predictive-maintenance", icon: TrendingUp },
      { title: "Predictive Diagnostics", href: "/predictive-diagnostics", icon: Brain },
      { title: "Document OCR", href: "/document-ocr", icon: FileText },
    ],
  },
  {
    title: "Service Planning & Scheduling",
    icon: Wrench,
    roles: ['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN'],
    items: [
      { title: "Job Cards", href: "/job-cards", icon: Wrench },
      { title: "Tasks", href: "/tasks", icon: ClipboardCheck },
      { title: "Task Management", href: "/task-management", icon: ClipboardList },
      { title: "Service Templates", href: "/service-templates", icon: ClipboardList },
      { title: "Workshop Calendar", href: "/workshop-calendar", icon: Calendar },
      { title: "AI Scheduling", href: "/ai-scheduling", icon: Calendar },
      { title: "Smart Assignment", href: "/smart-assignment", icon: Brain },
      { title: "Estimates", href: "/estimates", icon: Receipt },
      { title: "Video Estimates", href: "/video-estimates", icon: FileText },
      { title: "Smart Parts", href: "/smart-parts-recommendations", icon: Package },
      { title: "AI Parts Recommender", href: "/smart-parts-recommender", icon: Brain },
      { title: "Intelligent Price Optimizer", href: "/intelligent-price-optimizer", icon: Target },
      { title: "Dynamic Pricing", href: "/dynamic-pricing", icon: TrendingUp },
    ],
  },
  {
    title: "Parts & Inventory",
    icon: Package,
    roles: ['ADMIN', 'MANAGER', 'ADVISOR'],
    items: [
      { title: "Inventory", href: "/inventory-management", icon: Warehouse },
      { title: "Spare Parts", href: "/spare-parts", icon: Package },
      { title: "Tools", href: "/tools", icon: Hammer },
      { title: "Equipment Calibration", href: "/equipment-calibration", icon: Gauge },
      { title: "Auto Reordering", href: "/parts-auto-reorder", icon: RefreshCw, roles: ['ADMIN', 'MANAGER'] },
      { title: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart, roles: ['ADMIN', 'MANAGER'] },
      { title: "Purchase Agent", href: "/purchase-agent", icon: Briefcase, roles: ['ADMIN', 'MANAGER', 'ADVISOR'] },
      { title: "Suppliers", href: "/suppliers", icon: Truck, roles: ['ADMIN', 'MANAGER'] },
      { title: "Barcode Scanner", href: "/barcode-scanner", icon: ScanLine },
      { title: "Parts Marketplace", href: "/parts-marketplace", icon: Store },
      { title: "Parts Supply Network", href: "/parts-supply-network", icon: Network },
      { title: "Parts Network", href: "/parts-network", icon: Share2 },
      { title: "Internal Warehouse", href: "/internal-warehouse", icon: Warehouse, roles: ['ADMIN', 'MANAGER'] },
      { title: "Smart Inventory Forecasting", href: "/smart-inventory-forecasting", icon: TrendingUp, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: "Service Execution",
    icon: HardHat,
    roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'],
    items: [
      { title: "Technician Portal", href: "/technician-portal", icon: HardHat },
      { title: "Technician Management", href: "/technician-management", icon: Users, roles: ['ADMIN', 'MANAGER'] },
      { title: "Live Service Tracking", href: "/live-service-tracking", icon: Eye },
      { title: "Routing Optimizer", href: "/routing-optimizer", icon: Route },
      { title: "Tire Management", href: "/tire-management", icon: RefreshCw },
      { title: "Towing Services", href: "/towing-services", icon: Truck },
      { title: "Towing Assistance", href: "/towing-assistance", icon: Truck },
      { title: "Vehicle Storage", href: "/vehicle-storage", icon: Warehouse },
    ],
  },
  {
    title: "Quality & Delivery",
    icon: Award,
    roles: ['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN'],
    items: [
      { title: "Quality Control", href: "/quality-control", icon: FileCheck },
      { title: "Computer Vision QC", href: "/computer-vision-qc", icon: Camera },
      { title: "Customer Feedback", href: "/customer-feedback", icon: Star },
      { title: "Customer Reviews", href: "/customer-reviews-ratings", icon: Star },
    ],
  },
  {
    title: "Billing & Payments",
    icon: DollarSign,
    roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'],
    items: [
      { title: "Invoices", href: "/invoices", icon: FileText },
      { title: "Expense Tracking", href: "/expense-tracking", icon: Receipt },
      { title: "Expenses Management", href: "/expenses-management", icon: Receipt },
      { title: "Payment Processing", href: "/stripe-payment-processing", icon: CreditCard },
      { title: "Refund Management", href: "/refund-management", icon: RefreshCw },
      { title: "Insurance Claims", href: "/insurance-claims", icon: Shield },
      { title: "Warranty Management", href: "/warranty-management", icon: Shield },
      { title: "Contract Management", href: "/contract-management", icon: FileText },
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
      { title: "Business Heat Maps", href: "/business-heat-maps", icon: MapPin },
      { title: "Reports", href: "/reports", icon: FileText },
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
    roles: ['ADMIN', 'MANAGER', 'ADVISOR'],
    items: [
      { title: "Customer Portal", href: "/customer-portal", icon: Users },
      { title: "Customer Loyalty", href: "/customer-loyalty", icon: Trophy },
      { title: "Service Reminders", href: "/service-reminders", icon: Bell },
      { title: "Email Marketing", href: "/email-marketing", icon: Mail, roles: ['ADMIN', 'MANAGER'] },
      { title: "Email Campaigns", href: "/email-marketing-campaigns", icon: Mail, roles: ['ADMIN', 'MANAGER'] },
      { title: "Marketing Hub", href: "/marketing-hub", icon: Megaphone, roles: ['ADMIN', 'MANAGER'] },
      { title: "Marketing Automation", href: "/marketing-automation", icon: RefreshCw, roles: ['ADMIN', 'MANAGER'] },
      { title: "Referral Program", href: "/referral-program", icon: Gift },
      { title: "Google My Business", href: "/google-my-business", icon: MapPin, roles: ['ADMIN', 'MANAGER'] },
      { title: "Social Media", href: "/social-media-integration", icon: Globe, roles: ['ADMIN', 'MANAGER'] },
      { title: "Social Monitoring", href: "/social-media-monitoring", icon: Search, roles: ['ADMIN', 'MANAGER'] },
      { title: "Sales Management", href: "/sales-management", icon: DollarSign, roles: ['ADMIN', 'MANAGER'] },
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
    roles: ['ADMIN', 'MANAGER'],
    items: [
      { title: "Compliance Management", href: "/compliance-management", icon: Shield },
      { title: "Environmental Compliance", href: "/environmental-compliance", icon: Recycle },
      { title: "ISO Quality", href: "/iso-quality", icon: BadgeCheck },
      { title: "Safety Incidents", href: "/safety-incidents", icon: ShieldAlert },
      { title: "Safety Alerts", href: "/safety-alerts", icon: AlertTriangle },
      { title: "Assets Management", href: "/assets-management", icon: Building },
      { title: "Vendor Supplier Portal", href: "/vendor-supplier-portal", icon: Store },
    ],
  },
  {
    title: "Enterprise & Franchise",
    icon: Building2,
    roles: ['ADMIN', 'MANAGER'],
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
    roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'],
    minPlan: 'PRO',
    items: [
      { title: "3D Parts Viewer", href: "/interactive-3d-parts", icon: Package },
      { title: "AR Repair Guide", href: "/ar-repair-guide", icon: Monitor },
      { title: "AR Overlay", href: "/ar-overlay", icon: ScanLine },
      { title: "VR Showroom", href: "/vr-showroom", icon: Monitor },
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
    roles: ['ADMIN', 'MANAGER', 'ADVISOR'],
    items: [
      { title: "AI Automation", href: "/ai-automation", icon: Brain, roles: ['ADMIN', 'MANAGER'] },
      { title: "Call Center", href: "/call-center", icon: Radio },
      { title: "Support Chat", href: "/support-chat-dashboard", icon: MessageSquare },
      { title: "Parts Availability", href: "/parts-availability", icon: RefreshCw },
      { title: "AI Chatbot", href: "/ai-chatbot", icon: MessageSquare },
      { title: "AI Chatbot Assistant", href: "/ai-chatbot-assistant", icon: Brain },
      { title: "AI Service Advisor", href: "/ai-service-advisor", icon: Brain },
      { title: "ML Fraud Detection", href: "/ml-fraud-detection", icon: ShieldAlert, roles: ['ADMIN', 'MANAGER'] },
      { title: "Video Consultations", href: "/video-consultations", icon: Video },
      { title: "Voice Commands", href: "/voice-commands", icon: Mic },
      { title: "Voice Interface", href: "/voice-command-interface", icon: Radio },
    ],
  },
  {
    title: "System & Settings",
    icon: Settings,
    roles: ['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN', 'ACCOUNTANT'],
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Role Management", href: "/role-management", icon: Shield, roles: ['ADMIN'] },
      { title: "Security", href: "/security", icon: Shield, roles: ['ADMIN'] },
      { title: "Data Backup", href: "/data-backup", icon: DatabaseBackup, roles: ['ADMIN'] },
      { title: "Dashboard Widgets", href: "/dashboard-widgets", icon: LayoutDashboard },
      { title: "Profile", href: "/profile", icon: UserIcon },
      { title: "Notifications", href: "/notifications", icon: Bell },
      { title: "Document Management", href: "/document-management", icon: FileText },
      { title: "Data Import/Export", href: "/data-import-export", icon: DatabaseBackup, roles: ['ADMIN', 'MANAGER'] },
      { title: "Integrations", href: "/integrations", icon: Plug2, roles: ['ADMIN'] },
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
  if (userRole === 'ADMIN') return true;
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
