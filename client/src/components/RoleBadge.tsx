import { usePermissions } from '@/hooks/usePermissions';
import { Shield, Crown, Settings, Wrench, Users, ShoppingCart, Calculator, Briefcase, Package, Megaphone, Phone, UserCheck } from 'lucide-react';

const roleIcons: Record<string, React.ReactNode> = {
  business_owner: <Crown className="w-3.5 h-3.5" />,
  system_administrator: <Settings className="w-3.5 h-3.5" />,
  general_manager: <Briefcase className="w-3.5 h-3.5" />,
  service_manager: <Users className="w-3.5 h-3.5" />,
  service_advisor: <UserCheck className="w-3.5 h-3.5" />,
  technician: <Wrench className="w-3.5 h-3.5" />,
  customer: <Users className="w-3.5 h-3.5" />,
  purchase_agent: <ShoppingCart className="w-3.5 h-3.5" />,
  accountant: <Calculator className="w-3.5 h-3.5" />,
  hr_manager: <Users className="w-3.5 h-3.5" />,
  finance_manager: <Calculator className="w-3.5 h-3.5" />,
  inventory_manager: <Package className="w-3.5 h-3.5" />,
  marketing_manager: <Megaphone className="w-3.5 h-3.5" />,
  receptionist: <Phone className="w-3.5 h-3.5" />,
  cashier: <Calculator className="w-3.5 h-3.5" />,
};

interface RoleBadgeProps {
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RoleBadge({ showIcon = true, size = 'md', className = '' }: RoleBadgeProps) {
  const { role, getRoleDisplayName, getRoleBadgeColor } = usePermissions();

  if (!role) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const icon = roleIcons[role] || <Shield className="w-3.5 h-3.5" />;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${getRoleBadgeColor()} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && icon}
      <span>{getRoleDisplayName()}</span>
    </div>
  );
}

export function RoleIndicator() {
  const { role, getRoleDisplayName, getRoleBadgeColor } = usePermissions();

  if (!role) return null;

  const icon = roleIcons[role] || <Shield className="w-4 h-4" />;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
      <div className={`p-1.5 rounded-md ${getRoleBadgeColor()}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">Current Role</span>
        <span className="text-sm font-medium text-zinc-200">{getRoleDisplayName()}</span>
      </div>
    </div>
  );
}
