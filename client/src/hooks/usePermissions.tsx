import { useAuth } from './useAuth';

export type Permission = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete' 
  | 'approve' 
  | 'export' 
  | 'manage_users' 
  | 'manage_settings' 
  | 'view_financials' 
  | 'process_payments'
  | 'manage_inventory'
  | 'assign_jobs'
  | 'view_reports'
  | 'manage_hr';

export type Module = 
  | 'dashboard'
  | 'customers'
  | 'vehicles'
  | 'job_cards'
  | 'estimates'
  | 'invoices'
  | 'inventory'
  | 'parts'
  | 'appointments'
  | 'technicians'
  | 'hr'
  | 'payroll'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'users'
  | 'roles'
  | 'franchise'
  | 'compliance'
  | 'marketing'
  | 'loyalty';

type RolePermissions = {
  [module in Module]?: Permission[];
};

const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  business_owner: {
    dashboard: ['view', 'export', 'view_reports'],
    customers: ['view', 'export'],
    vehicles: ['view'],
    job_cards: ['view', 'approve', 'export'],
    estimates: ['view', 'approve', 'export'],
    invoices: ['view', 'approve', 'export', 'view_financials'],
    inventory: ['view', 'export'],
    parts: ['view'],
    appointments: ['view'],
    technicians: ['view', 'view_reports'],
    hr: ['view', 'approve', 'manage_hr'],
    payroll: ['view', 'approve', 'view_financials'],
    reports: ['view', 'export', 'view_reports'],
    analytics: ['view', 'export', 'view_reports'],
    settings: ['view', 'edit', 'manage_settings'],
    users: ['view'],
    roles: ['view'],
    franchise: ['view', 'edit', 'approve', 'manage_settings'],
    compliance: ['view', 'approve'],
    marketing: ['view', 'approve'],
    loyalty: ['view', 'edit', 'approve'],
  },

  system_administrator: {
    dashboard: ['view'],
    customers: ['view', 'create', 'edit', 'delete'],
    vehicles: ['view', 'create', 'edit', 'delete'],
    job_cards: ['view'],
    estimates: ['view'],
    invoices: ['view'],
    inventory: ['view'],
    parts: ['view'],
    appointments: ['view'],
    technicians: ['view'],
    hr: ['view', 'create', 'edit', 'delete', 'manage_hr'],
    payroll: ['view'],
    reports: ['view', 'export'],
    analytics: ['view'],
    settings: ['view', 'create', 'edit', 'delete', 'manage_settings'],
    users: ['view', 'create', 'edit', 'delete', 'manage_users'],
    roles: ['view', 'create', 'edit', 'delete'],
    franchise: ['view', 'edit', 'manage_settings'],
    compliance: ['view', 'create', 'edit', 'delete'],
    marketing: ['view'],
    loyalty: ['view'],
  },

  general_manager: {
    dashboard: ['view', 'export', 'view_reports'],
    customers: ['view', 'create', 'edit', 'export'],
    vehicles: ['view', 'create', 'edit'],
    job_cards: ['view', 'create', 'edit', 'approve', 'assign_jobs'],
    estimates: ['view', 'create', 'edit', 'approve'],
    invoices: ['view', 'create', 'edit', 'approve', 'view_financials'],
    inventory: ['view', 'create', 'edit', 'manage_inventory'],
    parts: ['view', 'create', 'edit'],
    appointments: ['view', 'create', 'edit'],
    technicians: ['view', 'edit', 'assign_jobs'],
    hr: ['view', 'create', 'edit', 'manage_hr'],
    payroll: ['view', 'approve', 'view_financials'],
    reports: ['view', 'export', 'view_reports'],
    analytics: ['view', 'export', 'view_reports'],
    settings: ['view', 'edit'],
    users: ['view', 'create', 'edit'],
    roles: ['view'],
    franchise: ['view'],
    compliance: ['view', 'edit'],
    marketing: ['view', 'create', 'edit'],
    loyalty: ['view', 'edit'],
  },

  service_manager: {
    dashboard: ['view'],
    customers: ['view', 'create', 'edit'],
    vehicles: ['view', 'create', 'edit'],
    job_cards: ['view', 'create', 'edit', 'approve', 'assign_jobs'],
    estimates: ['view', 'create', 'edit', 'approve'],
    invoices: ['view', 'create'],
    inventory: ['view', 'manage_inventory'],
    parts: ['view', 'create', 'edit'],
    appointments: ['view', 'create', 'edit'],
    technicians: ['view', 'edit', 'assign_jobs'],
    hr: ['view'],
    payroll: [],
    reports: ['view', 'view_reports'],
    analytics: ['view'],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: [],
    compliance: ['view'],
    marketing: [],
    loyalty: ['view'],
  },

  service_advisor: {
    dashboard: ['view'],
    customers: ['view', 'create', 'edit'],
    vehicles: ['view', 'create', 'edit'],
    job_cards: ['view', 'create', 'edit'],
    estimates: ['view', 'create', 'edit'],
    invoices: ['view', 'create'],
    inventory: ['view'],
    parts: ['view'],
    appointments: ['view', 'create', 'edit'],
    technicians: ['view'],
    hr: [],
    payroll: [],
    reports: ['view'],
    analytics: [],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: [],
    compliance: [],
    marketing: [],
    loyalty: ['view'],
  },

  arabic_support_agent: {
    dashboard: ['view'],
    customers: ['view', 'create', 'edit'],
    vehicles: ['view'],
    job_cards: ['view'],
    estimates: ['view'],
    invoices: ['view'],
    inventory: ['view'],
    parts: ['view'],
    appointments: ['view', 'create', 'edit'],
    technicians: ['view'],
    hr: [],
    payroll: [],
    reports: [],
    analytics: [],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: [],
    compliance: [],
    marketing: [],
    loyalty: ['view'],
  },

  technician: {
    dashboard: ['view'],
    customers: ['view'],
    vehicles: ['view'],
    job_cards: ['view', 'edit'],
    estimates: ['view'],
    invoices: ['view'],
    inventory: ['view'],
    parts: ['view'],
    appointments: ['view'],
    technicians: [],
    hr: [],
    payroll: [],
    reports: [],
    analytics: [],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: [],
    compliance: [],
    marketing: [],
    loyalty: [],
  },

  customer: {
    dashboard: ['view'],
    customers: [],
    vehicles: ['view'],
    job_cards: ['view'],
    estimates: ['view'],
    invoices: ['view', 'process_payments'],
    inventory: [],
    parts: [],
    appointments: ['view', 'create'],
    technicians: [],
    hr: [],
    payroll: [],
    reports: [],
    analytics: [],
    settings: ['view', 'edit'],
    users: [],
    roles: [],
    franchise: [],
    compliance: [],
    marketing: [],
    loyalty: ['view'],
  },

  purchase_agent: {
    dashboard: ['view'],
    customers: [],
    vehicles: [],
    job_cards: ['view'],
    estimates: ['view'],
    invoices: ['view', 'create', 'view_financials'],
    inventory: ['view', 'create', 'edit', 'manage_inventory'],
    parts: ['view', 'create', 'edit'],
    appointments: [],
    technicians: [],
    hr: [],
    payroll: [],
    reports: ['view'],
    analytics: [],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: [],
    compliance: [],
    marketing: [],
    loyalty: [],
  },

  accountant: {
    dashboard: ['view'],
    customers: ['view'],
    vehicles: [],
    job_cards: ['view'],
    estimates: ['view'],
    invoices: ['view', 'create', 'edit', 'approve', 'export', 'view_financials'],
    inventory: ['view', 'export'],
    parts: ['view'],
    appointments: [],
    technicians: [],
    hr: ['view'],
    payroll: ['view', 'create', 'edit', 'approve', 'view_financials'],
    reports: ['view', 'export', 'view_reports'],
    analytics: ['view', 'export'],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: [],
    compliance: ['view'],
    marketing: [],
    loyalty: [],
  },

  hr_manager: {
    dashboard: ['view'],
    customers: [],
    vehicles: [],
    job_cards: [],
    estimates: [],
    invoices: [],
    inventory: [],
    parts: [],
    appointments: [],
    technicians: ['view', 'create', 'edit', 'delete'],
    hr: ['view', 'create', 'edit', 'delete', 'approve', 'manage_hr'],
    payroll: ['view', 'create', 'edit', 'approve', 'view_financials'],
    reports: ['view', 'export'],
    analytics: ['view'],
    settings: ['view', 'edit'],
    users: ['view', 'create', 'edit'],
    roles: ['view'],
    franchise: [],
    compliance: ['view', 'edit'],
    marketing: [],
    loyalty: [],
  },

  finance_manager: {
    dashboard: ['view', 'view_reports'],
    customers: ['view'],
    vehicles: [],
    job_cards: ['view'],
    estimates: ['view', 'approve'],
    invoices: ['view', 'create', 'edit', 'approve', 'export', 'view_financials', 'process_payments'],
    inventory: ['view', 'export'],
    parts: ['view'],
    appointments: [],
    technicians: [],
    hr: ['view'],
    payroll: ['view', 'create', 'edit', 'approve', 'view_financials'],
    reports: ['view', 'export', 'view_reports'],
    analytics: ['view', 'export', 'view_reports'],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: ['view'],
    compliance: ['view', 'edit'],
    marketing: [],
    loyalty: ['view'],
  },

  inventory_manager: {
    dashboard: ['view'],
    customers: [],
    vehicles: [],
    job_cards: ['view'],
    estimates: ['view'],
    invoices: ['view'],
    inventory: ['view', 'create', 'edit', 'delete', 'export', 'manage_inventory'],
    parts: ['view', 'create', 'edit', 'delete'],
    appointments: [],
    technicians: [],
    hr: [],
    payroll: [],
    reports: ['view', 'export'],
    analytics: ['view'],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: [],
    compliance: [],
    marketing: [],
    loyalty: [],
  },

  marketing_manager: {
    dashboard: ['view'],
    customers: ['view', 'export'],
    vehicles: [],
    job_cards: [],
    estimates: [],
    invoices: [],
    inventory: [],
    parts: [],
    appointments: [],
    technicians: [],
    hr: [],
    payroll: [],
    reports: ['view', 'export'],
    analytics: ['view', 'export', 'view_reports'],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: [],
    compliance: [],
    marketing: ['view', 'create', 'edit', 'delete', 'approve'],
    loyalty: ['view', 'create', 'edit'],
  },

  receptionist: {
    dashboard: ['view'],
    customers: ['view', 'create', 'edit'],
    vehicles: ['view', 'create'],
    job_cards: ['view', 'create'],
    estimates: ['view'],
    invoices: ['view'],
    inventory: [],
    parts: [],
    appointments: ['view', 'create', 'edit', 'delete'],
    technicians: ['view'],
    hr: [],
    payroll: [],
    reports: [],
    analytics: [],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: [],
    compliance: [],
    marketing: [],
    loyalty: ['view'],
  },

  cashier: {
    dashboard: ['view'],
    customers: ['view'],
    vehicles: [],
    job_cards: ['view'],
    estimates: ['view'],
    invoices: ['view', 'create', 'edit', 'process_payments'],
    inventory: [],
    parts: [],
    appointments: [],
    technicians: [],
    hr: [],
    payroll: [],
    reports: [],
    analytics: [],
    settings: ['view'],
    users: [],
    roles: [],
    franchise: [],
    compliance: [],
    marketing: [],
    loyalty: ['view'],
  },
};

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || '';

  const permissions = ROLE_PERMISSIONS[role] || {};

  const hasPermission = (module: Module, permission: Permission): boolean => {
    const modulePermissions = permissions[module];
    if (!modulePermissions) return false;
    return modulePermissions.includes(permission);
  };

  const hasAnyPermission = (module: Module, requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(p => hasPermission(module, p));
  };

  const hasAllPermissions = (module: Module, requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(p => hasPermission(module, p));
  };

  const canView = (module: Module): boolean => hasPermission(module, 'view');
  const canCreate = (module: Module): boolean => hasPermission(module, 'create');
  const canEdit = (module: Module): boolean => hasPermission(module, 'edit');
  const canDelete = (module: Module): boolean => hasPermission(module, 'delete');
  const canApprove = (module: Module): boolean => hasPermission(module, 'approve');
  const canExport = (module: Module): boolean => hasPermission(module, 'export');

  const getModulePermissions = (module: Module): Permission[] => {
    return permissions[module] || [];
  };

  const getRoleDisplayName = (): string => {
    const roleNames: Record<string, string> = {
      business_owner: 'Business Owner',
      system_administrator: 'System Administrator',
      general_manager: 'General Manager',
      service_manager: 'Service Manager',
      service_advisor: 'Service Advisor',
      arabic_support_agent: 'Arabic Support Agent',
      technician: 'Technician',
      customer: 'Customer',
      purchase_agent: 'Purchase Agent',
      accountant: 'Accountant',
      hr_manager: 'HR Manager',
      finance_manager: 'Finance Manager',
      inventory_manager: 'Inventory Manager',
      marketing_manager: 'Marketing Manager',
      receptionist: 'Receptionist',
      cashier: 'Cashier',
      quality_control_inspector: 'QC Inspector',
      warranty_specialist: 'Warranty Specialist',
      parts_specialist: 'Parts Specialist',
      fleet_manager: 'Fleet Manager',
      training_coordinator: 'Training Coordinator',
      compliance_officer: 'Compliance Officer',
      it_support: 'IT Support',
      call_center_agent: 'Call Center Agent',
      franchise_owner: 'Franchise Owner',
    };
    return roleNames[role] || role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getRoleBadgeColor = (): string => {
    const colors: Record<string, string> = {
      business_owner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      system_administrator: 'bg-red-500/20 text-red-400 border-red-500/30',
      general_manager: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      service_manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      service_advisor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      arabic_support_agent: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      technician: 'bg-green-500/20 text-green-400 border-green-500/30',
      customer: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      purchase_agent: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      accountant: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      hr_manager: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      finance_manager: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      inventory_manager: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      marketing_manager: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      receptionist: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      cashier: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
    };
    return colors[role] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  };

  return {
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canApprove,
    canExport,
    getModulePermissions,
    getRoleDisplayName,
    getRoleBadgeColor,
  };
}

export { ROLE_PERMISSIONS };
