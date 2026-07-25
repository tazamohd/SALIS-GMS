import type { NavGroup, UserRole } from "@/config/navigation";

// Simplified role-based navigation access
// Maps each role to the nav group titles they can see

export const roleNavAccess: Record<UserRole, string[]> = {
  PLATFORM_ADMIN: ['*'], // all groups
  ADMIN: ['*'], // all groups
  MANAGER: [
    'Overview', 'Operations', 'Customers & Vehicles',
    'Inventory', 'Team', 'Finance', 'System'
  ],
  ADVISOR: [
    'Overview', 'Operations', 'Customers & Vehicles',
    'Inventory', 'System'
  ],
  TECHNICIAN: [
    'Overview', 'Operations', 'Inventory', 'System'
  ],
  ACCOUNTANT: [
    'Overview', 'Finance', 'System'
  ],
};

/**
 * Filter navigation groups by role.
 * Groups with a title in the allowed list (or '*' for all) are kept.
 * This works alongside the existing per-item role filtering in filterNavigationByAccess.
 */
export function filterNavByRole(navGroups: NavGroup[], role: UserRole): NavGroup[] {
  const allowed = roleNavAccess[role];
  if (!allowed) return navGroups;
  if (allowed.includes('*')) return navGroups;
  return navGroups.filter(g => allowed.includes(g.title));
}

/**
 * Get a display-friendly label for the user role.
 */
export function getRoleDisplayLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    PLATFORM_ADMIN: 'Platform Admin',
    ADMIN: 'Administrator',
    MANAGER: 'Manager',
    ADVISOR: 'Service Advisor',
    TECHNICIAN: 'Technician',
    ACCOUNTANT: 'Accountant',
  };
  return labels[role] || role;
}

/**
 * Get a color class for the role badge.
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    PLATFORM_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    MANAGER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    ADVISOR: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    TECHNICIAN: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
    ACCOUNTANT: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  };
  return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
}
