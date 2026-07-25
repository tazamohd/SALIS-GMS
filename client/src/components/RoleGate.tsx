import { usePermissions, Permission, Module } from '@/hooks/usePermissions';

interface RoleGateProps {
  children: React.ReactNode;
  module: Module;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export function RoleGate({
  children,
  module,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showAccessDenied = false,
}: RoleGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, getRoleDisplayName } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(module, permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(module, permissions)
      : hasAnyPermission(module, permissions);
  } else {
    hasAccess = hasPermission(module, 'view');
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showAccessDenied) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-zinc-700/50 rounded-lg bg-zinc-900/50">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-zinc-300 mb-1">Access Restricted</h3>
        <p className="text-sm text-zinc-500">
          Your role ({getRoleDisplayName()}) doesn't have permission to access this feature.
        </p>
      </div>
    );
  }

  return <>{fallback}</>;
}

interface RoleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  module: Module;
  permission: Permission;
  children: React.ReactNode;
}

export function RoleButton({ module, permission, children, className, disabled, ...props }: RoleButtonProps) {
  const { hasPermission } = usePermissions();
  const hasAccess = hasPermission(module, permission);

  if (!hasAccess) {
    return null;
  }

  return (
    <button className={className} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

interface RoleSectionProps {
  children: React.ReactNode;
  module: Module;
  permission?: Permission;
  title?: string;
}

export function RoleSection({ children, module, permission = 'view', title }: RoleSectionProps) {
  const { hasPermission, getRoleDisplayName } = usePermissions();
  const hasAccess = hasPermission(module, permission);

  if (!hasAccess) {
    return (
      <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/30">
        <div className="flex items-center gap-2 text-zinc-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm">
            {title ? `${title} - ` : ''}Restricted for {getRoleDisplayName()}
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
