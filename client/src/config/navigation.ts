import {
  Home,
  Wrench,
  Users,
  Calendar,
  Car,
  Truck,
  Receipt,
  FileText,
  Package,
  HardHat,
  BarChart3,
  CreditCard,
  Settings,
  Crown,
  LayoutDashboard,
  Building2,
  Store,
  MessageSquare,
  Activity,
  Shield,
  UserIcon,
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
      { title: "E-Commerce Stores", href: "/platform-admin/stores", icon: Store, roles: ['PLATFORM_ADMIN'] },
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
      { title: "Estimates", href: "/estimates", icon: Receipt },
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
    title: "System",
    icon: Settings,
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Profile", href: "/profile", icon: UserIcon },
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
