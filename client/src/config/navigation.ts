import {
  LayoutDashboard,
  Wrench,
  Package,
  Users,
  BadgeDollarSign,
  Settings,
  ClipboardList,
  Calendar,
  UserCog,
  ShoppingCart,
  Truck,
  Car,
  FileText,
  Receipt,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UserRole = 'ADMIN' | 'MANAGER' | 'ADVISOR' | 'TECHNICIAN' | 'ACCOUNTANT';
export type SubscriptionPlan = 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface NavItem {
  title: string;
  href: string;
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
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ['ADMIN', 'MANAGER', 'ADVISOR', 'ACCOUNTANT'],
  },
  {
    title: "Operations",
    icon: Wrench,
    items: [
      { title: "Job Cards", href: "/job-cards", roles: ['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN'] },
      { title: "Appointments", href: "/appointments", roles: ['ADMIN', 'MANAGER', 'ADVISOR'] },
      { title: "Technicians", href: "/technician-portal", roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    minPlan: "PRO",
    items: [
      { title: "Stock List", href: "/inventory-management" },
      { title: "Purchase Orders", href: "/purchase-orders" },
      { title: "Suppliers", href: "/suppliers" },
    ],
  },
  {
    title: "CRM",
    icon: Users,
    items: [
      { title: "Customers", href: "/customers" },
      { title: "Vehicles", href: "/vehicles" },
    ],
  },
  {
    title: "Finance",
    icon: BadgeDollarSign,
    roles: ['ADMIN', 'ACCOUNTANT'],
    items: [
      { title: "Invoices", href: "/invoices" },
      { title: "Expenses", href: "/expense-tracking", minPlan: "PRO" },
      { title: "Accounting", href: "/general-ledger", minPlan: "ENTERPRISE" },
    ],
  },
  {
    title: "System",
    icon: Settings,
    items: [
      { title: "Settings", href: "/settings" },
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
