import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  Calendar,
  Users,
  Package,
  ShoppingCart,
  Truck,
  FileText,
  Receipt,
  BookOpen,
  Scale,
  User,
  Car,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UserRole = 'ADMIN' | 'MANAGER' | 'ADVISOR' | 'TECHNICIAN' | 'ACCOUNTANT';
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

export const navigationConfig: NavGroup[] = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "KPIs", href: "/kpi-dashboard", icon: BarChart3 },
    ],
  },
  {
    title: "Operations",
    icon: ClipboardList,
    items: [
      { title: "Job Cards", href: "/job-cards", icon: ClipboardList },
      { title: "Appointments", href: "/appointments", icon: Calendar },
      { title: "Technicians", href: "/technician-portal", icon: Users },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    items: [
      { title: "Stock List", href: "/inventory-management", icon: Package },
      { title: "Orders", href: "/purchase-orders", icon: ShoppingCart },
      { title: "Suppliers", href: "/suppliers", icon: Truck },
    ],
  },
  {
    title: "Finance",
    icon: FileText,
    roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'],
    items: [
      { title: "Invoices", href: "/invoices", icon: FileText },
      { title: "Expenses", href: "/expense-tracking", icon: Receipt },
      { title: "General Ledger", href: "/general-ledger", icon: BookOpen },
      { title: "Balance Sheet", href: "/balance-sheet", icon: Scale },
    ],
  },
  {
    title: "CRM",
    icon: User,
    items: [
      { title: "Customers", href: "/customers", icon: User },
      { title: "Vehicles", href: "/vehicles", icon: Car },
    ],
  },
  {
    title: "System",
    icon: Settings,
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
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
