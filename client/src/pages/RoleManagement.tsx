import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, Plus, Edit, Trash2, Users, Copy, Search, 
  Settings, Wrench, DollarSign, Package, Car, Calendar,
  BarChart3, Building2, UserCog, Eye, Lock, Unlock, 
  CheckCircle, XCircle, AlertTriangle, Crown, Star, ChevronRight
} from "lucide-react";
import { StandardPageLayout } from "@/components/layouts";

const roleCategories = [
  { id: "system", name: "System & Administration", nameAr: "النظام والإدارة", icon: Settings, color: "#0B1F3B" },
  { id: "operations", name: "Operations & Service", nameAr: "العمليات والخدمة", icon: Wrench, color: "#0A5ED7" },
  { id: "finance", name: "Finance & Accounting", nameAr: "المالية والمحاسبة", icon: DollarSign, color: "#0BB3FF" },
  { id: "inventory", name: "Inventory & Parts", nameAr: "المخزون والقطع", icon: Package, color: "#0A5ED7" },
  { id: "customer", name: "Customer & Sales", nameAr: "العملاء والمبيعات", icon: Users, color: "#0BB3FF" },
  { id: "analytics", name: "Analytics & Reporting", nameAr: "التحليلات والتقارير", icon: BarChart3, color: "#0B1F3B" },
];

const permissionGroups = [
  {
    id: "dashboard",
    name: "Dashboard & Overview",
    nameAr: "لوحة التحكم والنظرة العامة",
    icon: BarChart3,
    permissions: [
      { id: "dashboard.view", name: "View Dashboard", nameAr: "عرض لوحة التحكم" },
      { id: "dashboard.analytics", name: "View Analytics", nameAr: "عرض التحليلات" },
      { id: "dashboard.kpi", name: "View KPIs", nameAr: "عرض مؤشرات الأداء" },
      { id: "dashboard.export", name: "Export Reports", nameAr: "تصدير التقارير" },
    ]
  },
  {
    id: "customers",
    name: "Customer Management",
    nameAr: "إدارة العملاء",
    icon: Users,
    permissions: [
      { id: "customers.view", name: "View Customers", nameAr: "عرض العملاء" },
      { id: "customers.create", name: "Create Customers", nameAr: "إنشاء عملاء" },
      { id: "customers.edit", name: "Edit Customers", nameAr: "تعديل العملاء" },
      { id: "customers.delete", name: "Delete Customers", nameAr: "حذف العملاء" },
    ]
  },
  {
    id: "vehicles",
    name: "Vehicle Management",
    nameAr: "إدارة المركبات",
    icon: Car,
    permissions: [
      { id: "vehicles.view", name: "View Vehicles", nameAr: "عرض المركبات" },
      { id: "vehicles.create", name: "Add Vehicles", nameAr: "إضافة مركبات" },
      { id: "vehicles.edit", name: "Edit Vehicles", nameAr: "تعديل المركبات" },
      { id: "vehicles.delete", name: "Delete Vehicles", nameAr: "حذف المركبات" },
      { id: "vehicles.diagnostics", name: "Run Diagnostics", nameAr: "تشغيل التشخيص" },
    ]
  },
  {
    id: "jobcards",
    name: "Job Cards & Service",
    nameAr: "بطاقات العمل والخدمة",
    icon: Wrench,
    permissions: [
      { id: "jobcards.view", name: "View Job Cards", nameAr: "عرض بطاقات العمل" },
      { id: "jobcards.create", name: "Create Job Cards", nameAr: "إنشاء بطاقات عمل" },
      { id: "jobcards.edit", name: "Edit Job Cards", nameAr: "تعديل بطاقات العمل" },
      { id: "jobcards.delete", name: "Delete Job Cards", nameAr: "حذف بطاقات العمل" },
      { id: "jobcards.assign", name: "Assign Technicians", nameAr: "تعيين الفنيين" },
      { id: "jobcards.approve", name: "Approve Job Cards", nameAr: "اعتماد بطاقات العمل" },
    ]
  },
  {
    id: "inventory",
    name: "Inventory & Parts",
    nameAr: "المخزون والقطع",
    icon: Package,
    permissions: [
      { id: "inventory.view", name: "View Inventory", nameAr: "عرض المخزون" },
      { id: "inventory.create", name: "Add Items", nameAr: "إضافة عناصر" },
      { id: "inventory.edit", name: "Edit Items", nameAr: "تعديل العناصر" },
      { id: "inventory.delete", name: "Delete Items", nameAr: "حذف العناصر" },
      { id: "inventory.adjust", name: "Adjust Stock", nameAr: "تعديل المخزون" },
      { id: "inventory.order", name: "Create Orders", nameAr: "إنشاء طلبات" },
    ]
  },
  {
    id: "finance",
    name: "Finance & Billing",
    nameAr: "المالية والفواتير",
    icon: DollarSign,
    permissions: [
      { id: "finance.view", name: "View Financials", nameAr: "عرض المالية" },
      { id: "finance.invoices", name: "Manage Invoices", nameAr: "إدارة الفواتير" },
      { id: "finance.payments", name: "Process Payments", nameAr: "معالجة المدفوعات" },
      { id: "finance.refunds", name: "Process Refunds", nameAr: "معالجة الاسترداد" },
      { id: "finance.reports", name: "Financial Reports", nameAr: "التقارير المالية" },
      { id: "finance.settings", name: "Finance Settings", nameAr: "إعدادات المالية" },
    ]
  },
  {
    id: "hr",
    name: "HR & Staff",
    nameAr: "الموارد البشرية والموظفين",
    icon: UserCog,
    permissions: [
      { id: "hr.view", name: "View Staff", nameAr: "عرض الموظفين" },
      { id: "hr.create", name: "Add Staff", nameAr: "إضافة موظفين" },
      { id: "hr.edit", name: "Edit Staff", nameAr: "تعديل الموظفين" },
      { id: "hr.delete", name: "Delete Staff", nameAr: "حذف الموظفين" },
      { id: "hr.payroll", name: "Manage Payroll", nameAr: "إدارة الرواتب" },
      { id: "hr.attendance", name: "Manage Attendance", nameAr: "إدارة الحضور" },
    ]
  },
  {
    id: "settings",
    name: "System Settings",
    nameAr: "إعدادات النظام",
    icon: Settings,
    permissions: [
      { id: "settings.view", name: "View Settings", nameAr: "عرض الإعدادات" },
      { id: "settings.edit", name: "Edit Settings", nameAr: "تعديل الإعدادات" },
      { id: "settings.users", name: "Manage Users", nameAr: "إدارة المستخدمين" },
      { id: "settings.roles", name: "Manage Roles", nameAr: "إدارة الأدوار" },
      { id: "settings.integrations", name: "Manage Integrations", nameAr: "إدارة التكاملات" },
      { id: "settings.backup", name: "Backup & Restore", nameAr: "النسخ الاحتياطي والاستعادة" },
    ]
  },
];

const defaultRoles = [
  { 
    id: "1", 
    name: "System Administrator", 
    nameAr: "مدير النظام",
    category: "system", 
    description: "Full system access with all permissions",
    descriptionAr: "وصول كامل للنظام مع جميع الصلاحيات",
    isSystem: true, 
    userCount: 2,
    permissions: permissionGroups.flatMap(g => g.permissions.map(p => p.id)),
    scope: "global",
    status: "active"
  },
  { 
    id: "2", 
    name: "Branch Manager", 
    nameAr: "مدير الفرع",
    category: "operations", 
    description: "Manages branch operations and staff",
    descriptionAr: "يدير عمليات الفرع والموظفين",
    isSystem: true, 
    userCount: 5,
    permissions: ["dashboard.view", "dashboard.analytics", "customers.view", "customers.edit", "vehicles.view", "jobcards.view", "jobcards.create", "jobcards.edit", "jobcards.assign", "inventory.view", "hr.view"],
    scope: "branch",
    status: "active"
  },
  { 
    id: "3", 
    name: "Service Advisor", 
    nameAr: "مستشار الخدمة",
    category: "operations", 
    description: "Handles customer interactions and job cards",
    descriptionAr: "يتعامل مع العملاء وبطاقات العمل",
    isSystem: true, 
    userCount: 8,
    permissions: ["dashboard.view", "customers.view", "customers.create", "customers.edit", "vehicles.view", "vehicles.create", "jobcards.view", "jobcards.create", "jobcards.edit"],
    scope: "branch",
    status: "active"
  },
  { 
    id: "4", 
    name: "Senior Technician", 
    nameAr: "فني أول",
    category: "operations", 
    description: "Experienced technician with diagnostic access",
    descriptionAr: "فني ذو خبرة مع صلاحية التشخيص",
    isSystem: false, 
    userCount: 12,
    permissions: ["dashboard.view", "vehicles.view", "vehicles.diagnostics", "jobcards.view", "jobcards.edit", "inventory.view"],
    scope: "branch",
    status: "active"
  },
  { 
    id: "5", 
    name: "Technician", 
    nameAr: "فني",
    category: "operations", 
    description: "Standard technician access",
    descriptionAr: "صلاحية الفني القياسية",
    isSystem: true, 
    userCount: 18,
    permissions: ["dashboard.view", "vehicles.view", "jobcards.view", "jobcards.edit", "inventory.view"],
    scope: "branch",
    status: "active"
  },
  { 
    id: "6", 
    name: "Accountant", 
    nameAr: "محاسب",
    category: "finance", 
    description: "Financial operations and reporting",
    descriptionAr: "العمليات المالية والتقارير",
    isSystem: true, 
    userCount: 3,
    permissions: ["dashboard.view", "dashboard.analytics", "finance.view", "finance.invoices", "finance.payments", "finance.reports"],
    scope: "global",
    status: "active"
  },
  { 
    id: "7", 
    name: "Parts Specialist", 
    nameAr: "أخصائي قطع الغيار",
    category: "inventory", 
    description: "Inventory and parts management",
    descriptionAr: "إدارة المخزون وقطع الغيار",
    isSystem: false, 
    userCount: 6,
    permissions: ["dashboard.view", "inventory.view", "inventory.create", "inventory.edit", "inventory.adjust", "inventory.order"],
    scope: "branch",
    status: "active"
  },
  { 
    id: "8", 
    name: "Customer Service", 
    nameAr: "خدمة العملاء",
    category: "customer", 
    description: "Customer support and basic operations",
    descriptionAr: "دعم العملاء والعمليات الأساسية",
    isSystem: false, 
    userCount: 4,
    permissions: ["dashboard.view", "customers.view", "customers.create", "vehicles.view", "jobcards.view"],
    scope: "branch",
    status: "active"
  },
  { 
    id: "9", 
    name: "HR Manager", 
    nameAr: "مدير الموارد البشرية",
    category: "system", 
    description: "Human resources management",
    descriptionAr: "إدارة الموارد البشرية",
    isSystem: false, 
    userCount: 2,
    permissions: ["dashboard.view", "hr.view", "hr.create", "hr.edit", "hr.delete", "hr.payroll", "hr.attendance"],
    scope: "global",
    status: "active"
  },
  { 
    id: "10", 
    name: "Analyst", 
    nameAr: "محلل",
    category: "analytics", 
    description: "Read-only access to analytics and reports",
    descriptionAr: "وصول للقراءة فقط للتحليلات والتقارير",
    isSystem: false, 
    userCount: 3,
    permissions: ["dashboard.view", "dashboard.analytics", "dashboard.kpi", "dashboard.export", "finance.reports"],
    scope: "global",
    status: "active"
  },
];

export default function RoleManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<typeof defaultRoles[0] | null>(null);
  const [roles, setRoles] = useState(defaultRoles);

  const [newRole, setNewRole] = useState({
    name: "",
    nameAr: "",
    category: "operations",
    description: "",
    descriptionAr: "",
    scope: "branch",
    permissions: [] as string[],
  });

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          role.nameAr.includes(searchQuery);
    const matchesCategory = selectedCategory === "all" || role.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedRoles = roleCategories.map(cat => ({
    ...cat,
    roles: filteredRoles.filter(r => r.category === cat.id)
  })).filter(cat => cat.roles.length > 0);

  const togglePermission = (permId: string, forEdit: boolean = false) => {
    if (forEdit && editingRole) {
      const newPerms = editingRole.permissions.includes(permId)
        ? editingRole.permissions.filter(p => p !== permId)
        : [...editingRole.permissions, permId];
      setEditingRole({ ...editingRole, permissions: newPerms });
    } else {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permId)
          ? prev.permissions.filter(p => p !== permId)
          : [...prev.permissions, permId]
      }));
    }
  };

  const togglePermissionGroup = (groupId: string, forEdit: boolean = false) => {
    const group = permissionGroups.find(g => g.id === groupId);
    if (!group) return;
    
    const groupPermIds = group.permissions.map(p => p.id);
    
    if (forEdit && editingRole) {
      const allSelected = groupPermIds.every(p => editingRole.permissions.includes(p));
      const newPerms = allSelected
        ? editingRole.permissions.filter(p => !groupPermIds.includes(p))
        : Array.from(new Set([...editingRole.permissions, ...groupPermIds]));
      setEditingRole({ ...editingRole, permissions: newPerms });
    } else {
      const allSelected = groupPermIds.every(p => newRole.permissions.includes(p));
      setNewRole(prev => ({
        ...prev,
        permissions: allSelected
          ? prev.permissions.filter(p => !groupPermIds.includes(p))
          : Array.from(new Set([...prev.permissions, ...groupPermIds]))
      }));
    }
  };

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      toast({ title: t('roles.error', 'Error'), description: t('roles.nameRequired', 'Role name is required'), variant: "destructive" });
      return;
    }
    
    const role = {
      id: String(Date.now()),
      ...newRole,
      isSystem: false,
      userCount: 0,
      status: "active" as const,
    };
    
    setRoles(prev => [...prev, role]);
    setShowAddDialog(false);
    setNewRole({ name: "", nameAr: "", category: "operations", description: "", descriptionAr: "", scope: "branch", permissions: [] });
    toast({ title: t('roles.roleCreated', 'Role Created'), description: `${role.name} ${t('roles.hasBeenCreated', 'has been created')}` });
  };

  const handleSaveRole = () => {
    if (!editingRole) return;
    
    setRoles(prev => prev.map(r => r.id === editingRole.id ? editingRole : r));
    setEditingRole(null);
    toast({ title: t('roles.roleUpdated', 'Role Updated'), description: `${editingRole.name} ${t('roles.hasBeenUpdated', 'has been updated')}` });
  };

  const handleDuplicateRole = (role: typeof defaultRoles[0]) => {
    const newRoleCopy = {
      ...role,
      id: String(Date.now()),
      name: `${role.name} (Copy)`,
      nameAr: `${role.nameAr} (نسخة)`,
      isSystem: false,
      userCount: 0,
    };
    setRoles(prev => [...prev, newRoleCopy]);
    toast({ title: t('roles.roleDuplicated', 'Role Duplicated'), description: `${newRoleCopy.name} ${t('roles.hasBeenCreated', 'has been created')}` });
  };

  const getCategoryInfo = (categoryId: string) => {
    return roleCategories.find(c => c.id === categoryId) || roleCategories[0];
  };

  const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);
  const activeRoles = roles.filter(r => r.status === "active").length;
  const systemRoles = roles.filter(r => r.isSystem).length;

  return (
    <StandardPageLayout
      title={t('roles.title', 'Role Management')}
      description={t('roles.description', 'Configure roles, permissions, and access control')}
      icon={Shield}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0A5ED7]/10">
                  <Shield className="h-5 w-5 text-[#0A5ED7]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-roles">{roles.length}</p>
                  <p className="text-sm text-[#64748B]">{t('roles.totalRoles', 'Total Roles')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0BB3FF]/10">
                  <CheckCircle className="h-5 w-5 text-[#0BB3FF]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-active-roles">{activeRoles}</p>
                  <p className="text-sm text-[#64748B]">{t('roles.activeRoles', 'Active Roles')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0B1F3B]/10">
                  <Lock className="h-5 w-5 text-[#0B1F3B] dark:text-[#0BB3FF]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-system-roles">{systemRoles}</p>
                  <p className="text-sm text-[#64748B]">{t('roles.systemRoles', 'System Roles')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0A5ED7]/10">
                  <Users className="h-5 w-5 text-[#0A5ED7]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-users">{totalUsers}</p>
                  <p className="text-sm text-[#64748B]">{t('roles.assignedUsers', 'Assigned Users')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Shield className="w-5 h-5 text-[#0A5ED7]" />
                {t('roles.rolesPermissions', 'Roles & Permissions')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">{t('roles.manageRolesDesc', 'Manage access control and permissions')}</CardDescription>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
              data-testid="button-add-role"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('roles.addRole', 'Add Role')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input
                  placeholder={t('roles.searchRoles', 'Search roles...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-search-roles"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-category">
                  <SelectValue placeholder={t('roles.allCategories', 'All Categories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('roles.allCategories', 'All Categories')}</SelectItem>
                  {roleCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {groupedRoles.map(category => (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center gap-2 px-2">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                      <category.icon className="w-4 h-4" style={{ color: category.color }} />
                    </div>
                    <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{category.name}</h3>
                    <Badge variant="outline" className="ml-2">{category.roles.length}</Badge>
                  </div>
                  <div className="grid gap-3">
                    {category.roles.map(role => (
                      <div
                        key={role.id}
                        className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]/30 transition-all"
                        data-testid={`role-item-${role.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${category.color}15` }}>
                              {role.isSystem ? (
                                <Crown className="w-5 h-5" style={{ color: category.color }} />
                              ) : (
                                <Shield className="w-5 h-5" style={{ color: category.color }} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-[#0B1F3B] dark:text-white">{role.name}</p>
                                {role.isSystem && (
                                  <Badge className="bg-[#0B1F3B]/10 text-[#0B1F3B] dark:text-[#0BB3FF] border-[#0B1F3B]/30 dark:border-[#0BB3FF]/30 text-xs">
                                    {t('roles.system', 'System')}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#64748B]">{role.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-[#0A5ED7]">
                                <Users className="w-4 h-4" />
                                <span className="font-semibold">{role.userCount}</span>
                              </div>
                              <p className="text-xs text-[#64748B]">{t('roles.users', 'users')}</p>
                            </div>
                            <Badge 
                              className={role.scope === "global" 
                                ? "bg-[#0B1F3B]/10 text-[#0B1F3B] dark:text-[#0BB3FF] border-[#0B1F3B]/30 dark:border-[#0BB3FF]/30" 
                                : "bg-[#0A5ED7]/10 text-[#0A5ED7] border-[#0A5ED7]/30"
                              }
                            >
                              {role.scope === "global" ? t('roles.global', 'Global') : t('roles.branch', 'Branch')}
                            </Badge>
                            <Badge className="bg-[#0BB3FF]/10 text-[#0BB3FF] border-[#0BB3FF]/30">
                              {role.permissions.length} {t('roles.permissions', 'permissions')}
                            </Badge>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingRole(role)}
                                className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                                data-testid={`button-edit-role-${role.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDuplicateRole(role)}
                                className="border-[#64748B] text-[#64748B] hover:bg-[#64748B]/10"
                                data-testid={`button-duplicate-role-${role.id}`}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Plus className="w-5 h-5 text-[#0A5ED7]" />
              {t('roles.createNewRole', 'Create New Role')}
            </DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('roles.createRoleDesc', 'Define role details and assign permissions')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="details">{t('roles.roleDetails', 'Role Details')}</TabsTrigger>
                <TabsTrigger value="permissions">{t('roles.permissions', 'Permissions')}</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0B1F3B] dark:text-white">{t('roles.roleName', 'Role Name')} *</Label>
                    <Input
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('roles.enterRoleName', 'Enter role name')}
                      className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                      data-testid="input-role-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0B1F3B] dark:text-white">{t('roles.roleNameAr', 'Role Name (Arabic)')}</Label>
                    <Input
                      value={newRole.nameAr}
                      onChange={(e) => setNewRole(prev => ({ ...prev, nameAr: e.target.value }))}
                      placeholder={t('roles.enterRoleNameAr', 'Enter Role Name Ar')}
                      className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-right"
                      dir="rtl"
                      data-testid="input-role-name-ar"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0B1F3B] dark:text-white">{t('roles.category', 'Category')}</Label>
                    <Select value={newRole.category} onValueChange={(val) => setNewRole(prev => ({ ...prev, category: val }))}>
                      <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-role-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0B1F3B] dark:text-white">{t('roles.scope', 'Scope')}</Label>
                    <Select value={newRole.scope} onValueChange={(val) => setNewRole(prev => ({ ...prev, scope: val }))}>
                      <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-role-scope">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#0B1F3B] dark:text-[#0BB3FF]" />
                            {t('roles.global', 'Global')} - {t('roles.allBranches', 'All Branches')}
                          </div>
                        </SelectItem>
                        <SelectItem value="branch">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#0A5ED7]" />
                            {t('roles.branch', 'Branch')} - {t('roles.specificBranch', 'Specific Branch')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0B1F3B] dark:text-white">{t('roles.description', 'Description')}</Label>
                  <Input
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('roles.enterDescription', 'Enter role description')}
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid="input-role-description"
                  />
                </div>
              </TabsContent>
              <TabsContent value="permissions" className="px-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A5ED7]/5 border border-[#0A5ED7]/20">
                    <p className="text-sm text-[#0B1F3B] dark:text-white">
                      {t('roles.selectedPermissions', 'Selected permissions')}: <span className="font-bold text-[#0A5ED7]">{newRole.permissions.length}</span>
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewRole(prev => ({ ...prev, permissions: [] }))}
                      className="text-[#64748B]"
                      data-testid="button-clear-all-permissions"
                    >
                      {t('roles.clearAll', 'Clear All')}
                    </Button>
                  </div>
                  <Accordion type="multiple" className="space-y-2">
                    {permissionGroups.map(group => {
                      const selectedCount = group.permissions.filter(p => newRole.permissions.includes(p.id)).length;
                      const allSelected = selectedCount === group.permissions.length;
                      return (
                        <AccordionItem 
                          key={group.id} 
                          value={group.id}
                          className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox 
                                checked={allSelected}
                                onCheckedChange={() => togglePermissionGroup(group.id)}
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`checkbox-group-${group.id}`}
                              />
                              <group.icon className="w-4 h-4 text-[#0A5ED7]" />
                              <span className="font-medium text-[#0B1F3B] dark:text-white">{group.name}</span>
                              <Badge variant="outline" className="ml-auto mr-2">
                                {selectedCount}/{group.permissions.length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              {group.permissions.map(perm => (
                                <label 
                                  key={perm.id}
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] cursor-pointer"
                                >
                                  <Checkbox
                                    checked={newRole.permissions.includes(perm.id)}
                                    onCheckedChange={() => togglePermission(perm.id)}
                                    data-testid={`checkbox-perm-${perm.id}`}
                                  />
                                  <span className="text-sm text-[#0B1F3B] dark:text-white">{perm.name}</span>
                                </label>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} data-testid="button-cancel-create">
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              onClick={handleCreateRole}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
              data-testid="button-confirm-create"
            >
              {t('roles.createRole', 'Create Role')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Edit className="w-5 h-5 text-[#0A5ED7]" />
              {t('roles.editRole', 'Edit Role')}: {editingRole?.name}
            </DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('roles.editRoleDesc', 'Modify role details and permissions')}
            </DialogDescription>
          </DialogHeader>
          {editingRole && (
            <ScrollArea className="max-h-[60vh]">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="details">{t('roles.roleDetails', 'Role Details')}</TabsTrigger>
                  <TabsTrigger value="permissions">{t('roles.permissions', 'Permissions')}</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 px-1">
                  {editingRole.isSystem && (
                    <div className="p-3 rounded-lg bg-[#F97316]/10 border border-[#F97316]/30 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#F97316]" />
                      <p className="text-sm text-[#F97316]">{t('roles.systemRoleWarning', 'This is a system role. Some fields cannot be modified.')}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#0B1F3B] dark:text-white">{t('roles.roleName', 'Role Name')} *</Label>
                      <Input
                        value={editingRole.name}
                        onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                        disabled={editingRole.isSystem}
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] disabled:opacity-50"
                        data-testid="input-edit-role-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#0B1F3B] dark:text-white">{t('roles.roleNameAr', 'Role Name (Arabic)')}</Label>
                      <Input
                        value={editingRole.nameAr}
                        onChange={(e) => setEditingRole({ ...editingRole, nameAr: e.target.value })}
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-right"
                        dir="rtl"
                        data-testid="input-edit-role-name-ar"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#0B1F3B] dark:text-white">{t('roles.category', 'Category')}</Label>
                      <Select 
                        value={editingRole.category} 
                        onValueChange={(val) => setEditingRole({ ...editingRole, category: val })}
                        disabled={editingRole.isSystem}
                      >
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-edit-role-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                                {cat.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#0B1F3B] dark:text-white">{t('roles.scope', 'Scope')}</Label>
                      <Select 
                        value={editingRole.scope} 
                        onValueChange={(val) => setEditingRole({ ...editingRole, scope: val })}
                      >
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-edit-role-scope">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">{t('roles.global', 'Global')}</SelectItem>
                          <SelectItem value="branch">{t('roles.branch', 'Branch')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0B1F3B] dark:text-white">{t('roles.description', 'Description')}</Label>
                    <Input
                      value={editingRole.description}
                      onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                      className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                      data-testid="input-edit-role-description"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#0B1F3B] dark:text-white">{t('roles.assignedUsers', 'Assigned Users')}</p>
                        <p className="text-sm text-[#64748B]">{t('roles.usersWithRole', 'Users with this role')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#0A5ED7]" />
                        <span className="text-2xl font-bold text-[#0A5ED7]">{editingRole.userCount}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="permissions" className="px-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A5ED7]/5 border border-[#0A5ED7]/20">
                      <p className="text-sm text-[#0B1F3B] dark:text-white">
                        {t('roles.selectedPermissions', 'Selected permissions')}: <span className="font-bold text-[#0A5ED7]">{editingRole.permissions.length}</span>
                      </p>
                    </div>
                    <Accordion type="multiple" className="space-y-2">
                      {permissionGroups.map(group => {
                        const selectedCount = group.permissions.filter(p => editingRole.permissions.includes(p.id)).length;
                        const allSelected = selectedCount === group.permissions.length;
                        return (
                          <AccordionItem 
                            key={group.id} 
                            value={group.id}
                            className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg overflow-hidden"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox 
                                  checked={allSelected}
                                  onCheckedChange={() => togglePermissionGroup(group.id, true)}
                                  onClick={(e) => e.stopPropagation()}
                                  data-testid={`checkbox-edit-group-${group.id}`}
                                />
                                <group.icon className="w-4 h-4 text-[#0A5ED7]" />
                                <span className="font-medium text-[#0B1F3B] dark:text-white">{group.name}</span>
                                <Badge variant="outline" className="ml-auto mr-2">
                                  {selectedCount}/{group.permissions.length}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                {group.permissions.map(perm => (
                                  <label 
                                    key={perm.id}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={editingRole.permissions.includes(perm.id)}
                                      onCheckedChange={() => togglePermission(perm.id, true)}
                                      data-testid={`checkbox-edit-perm-${perm.id}`}
                                    />
                                    <span className="text-sm text-[#0B1F3B] dark:text-white">{perm.name}</span>
                                  </label>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingRole(null)} data-testid="button-cancel-edit">
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              onClick={handleSaveRole}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
              data-testid="button-save-role"
            >
              {t('common.saveChanges', 'Save Changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}
