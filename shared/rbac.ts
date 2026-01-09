export const USER_ROLES = {
  SYSTEM_ADMINISTRATOR: 'system_administrator',
  BUSINESS_OWNER: 'business_owner',
  GENERAL_MANAGER: 'general_manager',
  SERVICE_MANAGER: 'service_manager',
  SERVICE_ADVISOR: 'service_advisor',
  PARTS_MANAGER: 'parts_manager',
  LEAD_TECHNICIAN: 'lead_technician',
  TECHNICIAN: 'technician',
  FINANCE_MANAGER: 'finance_manager',
  ACCOUNTANT: 'accountant',
  HR_MANAGER: 'hr_manager',
  MARKETING_MANAGER: 'marketing_manager',
  CUSTOMER_SERVICE_REP: 'customer_service_rep',
  RECEPTIONIST: 'receptionist',
  CALL_CENTER_AGENT: 'call_center_agent',
  BDC_SPECIALIST: 'bdc_specialist',
  COMPLIANCE_OFFICER: 'compliance_officer',
  QUALITY_CONTROL_INSPECTOR: 'quality_control_inspector',
  INVENTORY_CONTROLLER: 'inventory_controller',
  FLEET_MANAGER: 'fleet_manager',
  PURCHASE_AGENT: 'purchase_agent',
  DATA_ANALYST: 'data_analyst',
  AI_AUTOMATION_SPECIALIST: 'ai_automation_specialist',
  CUSTOMER_SUCCESS_MANAGER: 'customer_success_manager',
  CUSTOMER: 'customer',
} as const;

export type UserRoleKey = keyof typeof USER_ROLES;
export type UserRoleValue = typeof USER_ROLES[UserRoleKey];

export const ROLE_GROUPS = {
  ALL: Object.values(USER_ROLES),
  ADMIN: [USER_ROLES.SYSTEM_ADMINISTRATOR, USER_ROLES.BUSINESS_OWNER],
  MANAGEMENT: [
    USER_ROLES.SYSTEM_ADMINISTRATOR,
    USER_ROLES.BUSINESS_OWNER,
    USER_ROLES.GENERAL_MANAGER,
    USER_ROLES.SERVICE_MANAGER,
    USER_ROLES.PARTS_MANAGER,
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.HR_MANAGER,
    USER_ROLES.MARKETING_MANAGER,
  ],
  SERVICE_OPERATIONS: [
    USER_ROLES.SERVICE_MANAGER,
    USER_ROLES.SERVICE_ADVISOR,
    USER_ROLES.LEAD_TECHNICIAN,
    USER_ROLES.TECHNICIAN,
    USER_ROLES.QUALITY_CONTROL_INSPECTOR,
  ],
  FINANCE: [
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.ACCOUNTANT,
    USER_ROLES.BUSINESS_OWNER,
  ],
  HR: [
    USER_ROLES.HR_MANAGER,
    USER_ROLES.GENERAL_MANAGER,
    USER_ROLES.BUSINESS_OWNER,
  ],
  INVENTORY: [
    USER_ROLES.PARTS_MANAGER,
    USER_ROLES.INVENTORY_CONTROLLER,
    USER_ROLES.PURCHASE_AGENT,
  ],
  CUSTOMER_FACING: [
    USER_ROLES.SERVICE_ADVISOR,
    USER_ROLES.CUSTOMER_SERVICE_REP,
    USER_ROLES.RECEPTIONIST,
    USER_ROLES.CALL_CENTER_AGENT,
    USER_ROLES.BDC_SPECIALIST,
    USER_ROLES.CUSTOMER_SUCCESS_MANAGER,
  ],
  ANALYTICS: [
    USER_ROLES.DATA_ANALYST,
    USER_ROLES.BUSINESS_OWNER,
    USER_ROLES.GENERAL_MANAGER,
  ],
  COMPLIANCE: [
    USER_ROLES.COMPLIANCE_OFFICER,
    USER_ROLES.QUALITY_CONTROL_INSPECTOR,
    USER_ROLES.FINANCE_MANAGER,
  ],
  TECHNOLOGY: [
    USER_ROLES.AI_AUTOMATION_SPECIALIST,
    USER_ROLES.DATA_ANALYST,
    USER_ROLES.SYSTEM_ADMINISTRATOR,
  ],
};

export const ROLE_PORTAL_MAP: Record<UserRoleValue, string> = {
  [USER_ROLES.SYSTEM_ADMINISTRATOR]: '/dashboard',
  [USER_ROLES.BUSINESS_OWNER]: '/dashboard',
  [USER_ROLES.GENERAL_MANAGER]: '/dashboard',
  [USER_ROLES.SERVICE_MANAGER]: '/dashboard',
  [USER_ROLES.SERVICE_ADVISOR]: '/dashboard',
  [USER_ROLES.PARTS_MANAGER]: '/inventory',
  [USER_ROLES.LEAD_TECHNICIAN]: '/technician-portal',
  [USER_ROLES.TECHNICIAN]: '/technician-portal',
  [USER_ROLES.FINANCE_MANAGER]: '/accounting-dashboard',
  [USER_ROLES.ACCOUNTANT]: '/accounting-dashboard',
  [USER_ROLES.HR_MANAGER]: '/hr-management',
  [USER_ROLES.MARKETING_MANAGER]: '/marketing-automation',
  [USER_ROLES.CUSTOMER_SERVICE_REP]: '/customer-profiles',
  [USER_ROLES.RECEPTIONIST]: '/appointments',
  [USER_ROLES.CALL_CENTER_AGENT]: '/call-center',
  [USER_ROLES.BDC_SPECIALIST]: '/marketing-automation',
  [USER_ROLES.COMPLIANCE_OFFICER]: '/compliance',
  [USER_ROLES.QUALITY_CONTROL_INSPECTOR]: '/quality-control',
  [USER_ROLES.INVENTORY_CONTROLLER]: '/inventory',
  [USER_ROLES.FLEET_MANAGER]: '/fleet-management',
  [USER_ROLES.PURCHASE_AGENT]: '/purchase-agent/orders',
  [USER_ROLES.DATA_ANALYST]: '/bi-dashboard',
  [USER_ROLES.AI_AUTOMATION_SPECIALIST]: '/ai-automation',
  [USER_ROLES.CUSTOMER_SUCCESS_MANAGER]: '/customer-profiles',
  [USER_ROLES.CUSTOMER]: '/client/dashboard',
};

export const ROLE_DISPLAY_NAMES: Record<UserRoleValue, string> = {
  [USER_ROLES.SYSTEM_ADMINISTRATOR]: 'System Administrator',
  [USER_ROLES.BUSINESS_OWNER]: 'Business Owner',
  [USER_ROLES.GENERAL_MANAGER]: 'General Manager',
  [USER_ROLES.SERVICE_MANAGER]: 'Service Manager',
  [USER_ROLES.SERVICE_ADVISOR]: 'Service Advisor',
  [USER_ROLES.PARTS_MANAGER]: 'Parts Manager',
  [USER_ROLES.LEAD_TECHNICIAN]: 'Lead Technician',
  [USER_ROLES.TECHNICIAN]: 'Technician',
  [USER_ROLES.FINANCE_MANAGER]: 'Finance Manager',
  [USER_ROLES.ACCOUNTANT]: 'Accountant',
  [USER_ROLES.HR_MANAGER]: 'HR Manager',
  [USER_ROLES.MARKETING_MANAGER]: 'Marketing Manager',
  [USER_ROLES.CUSTOMER_SERVICE_REP]: 'Customer Service Rep',
  [USER_ROLES.RECEPTIONIST]: 'Receptionist',
  [USER_ROLES.CALL_CENTER_AGENT]: 'Call Center Agent',
  [USER_ROLES.BDC_SPECIALIST]: 'BDC Specialist',
  [USER_ROLES.COMPLIANCE_OFFICER]: 'Compliance Officer',
  [USER_ROLES.QUALITY_CONTROL_INSPECTOR]: 'Quality Control Inspector',
  [USER_ROLES.INVENTORY_CONTROLLER]: 'Inventory Controller',
  [USER_ROLES.FLEET_MANAGER]: 'Fleet Manager',
  [USER_ROLES.PURCHASE_AGENT]: 'Purchase Agent',
  [USER_ROLES.DATA_ANALYST]: 'Data Analyst',
  [USER_ROLES.AI_AUTOMATION_SPECIALIST]: 'AI Automation Specialist',
  [USER_ROLES.CUSTOMER_SUCCESS_MANAGER]: 'Customer Success Manager',
  [USER_ROLES.CUSTOMER]: 'Customer',
};

export function hasRole(userRole: string | undefined, allowedRoles: UserRoleValue[]): boolean {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase();
  return allowedRoles.some(role => role.toLowerCase() === normalizedRole);
}

export function hasAnyRole(userRole: string | undefined, roleGroups: UserRoleValue[][]): boolean {
  return roleGroups.some(group => hasRole(userRole, group));
}

export function getPortalForRole(role: string | undefined): string {
  if (!role) return '/dashboard';
  const normalizedRole = role.toLowerCase() as UserRoleValue;
  return ROLE_PORTAL_MAP[normalizedRole] || '/dashboard';
}
