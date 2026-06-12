import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Target,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Download,
  BarChart3,
  FileText,
  ExternalLink,
  Users,
  Wrench,
  Package,
  Settings,
} from "lucide-react";

const costCenterSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  manager: z.string().min(1, "Manager is required"),
  budgetAmount: z.string().min(1, "Budget amount is required"),
  description: z.string().optional(),
});

type CostCenterFormData = z.infer<typeof costCenterSchema>;

const costCenters = [
  {
    id: "CC-001",
    code: "SVC-BAY1",
    name: "Service Bay 1",
    nameAr: "ورشة الخدمة 1",
    department: "Service",
    manager: "Ahmed Al-Salem",
    budgetAmount: 85000,
    actualSpend: 72500,
    variance: 12500,
    variancePercentage: 14.7,
    status: "Under Budget",
  },
  {
    id: "CC-002",
    code: "SVC-BAY2",
    name: "Service Bay 2",
    nameAr: "ورشة الخدمة 2",
    department: "Service",
    manager: "Khalid Al-Rashid",
    budgetAmount: 85000,
    actualSpend: 89500,
    variance: -4500,
    variancePercentage: -5.3,
    status: "Over Budget",
  },
  {
    id: "CC-003",
    code: "PARTS-WH",
    name: "Parts Warehouse",
    nameAr: "مستودع قطع الغيار",
    department: "Inventory",
    manager: "Mohammed Al-Faisal",
    budgetAmount: 120000,
    actualSpend: 115000,
    variance: 5000,
    variancePercentage: 4.2,
    status: "Under Budget",
  },
  {
    id: "CC-004",
    code: "ADMIN",
    name: "Administration",
    nameAr: "الإدارة",
    department: "Administration",
    manager: "Fatima Al-Hassan",
    budgetAmount: 65000,
    actualSpend: 62000,
    variance: 3000,
    variancePercentage: 4.6,
    status: "Under Budget",
  },
  {
    id: "CC-005",
    code: "DIAG-LAB",
    name: "Diagnostic Lab",
    nameAr: "معمل التشخيص",
    department: "Technical",
    manager: "Omar Al-Rashid",
    budgetAmount: 45000,
    actualSpend: 48500,
    variance: -3500,
    variancePercentage: -7.8,
    status: "Over Budget",
  },
  {
    id: "CC-006",
    code: "MARKETING",
    name: "Marketing & Sales",
    nameAr: "التسويق والمبيعات",
    department: "Marketing",
    manager: "Sara Al-Mahmoud",
    budgetAmount: 35000,
    actualSpend: 28000,
    variance: 7000,
    variancePercentage: 20,
    status: "Under Budget",
  },
];

const expensesByCenter = [
  { centerId: "CC-001", category: "Labor", amount: 45000 },
  { centerId: "CC-001", category: "Materials", amount: 18500 },
  { centerId: "CC-001", category: "Utilities", amount: 5500 },
  { centerId: "CC-001", category: "Maintenance", amount: 3500 },
  { centerId: "CC-002", category: "Labor", amount: 52000 },
  { centerId: "CC-002", category: "Materials", amount: 25500 },
  { centerId: "CC-002", category: "Utilities", amount: 6500 },
  { centerId: "CC-002", category: "Maintenance", amount: 5500 },
];

export default function CostCenters() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const form = useForm<CostCenterFormData>({
    resolver: zodResolver(costCenterSchema),
    defaultValues: {
      code: "",
      name: "",
      nameAr: "",
      department: "",
      manager: "",
      budgetAmount: "",
      description: "",
    },
  });

  const onSubmit = (data: CostCenterFormData) => {
    console.log("Create cost center:", data);
    setIsDialogOpen(false);
    form.reset();
  };

  const totalBudget = costCenters.reduce((sum, cc) => sum + cc.budgetAmount, 0);
  const totalActual = costCenters.reduce((sum, cc) => sum + cc.actualSpend, 0);
  const totalVariance = totalBudget - totalActual;
  const underBudgetCount = costCenters.filter((cc) => cc.status === "Under Budget").length;
  const overBudgetCount = costCenters.filter((cc) => cc.status === "Over Budget").length;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "Under Budget": "bg-[#0A5ED7] text-white",
      "Over Budget": "bg-[#F97316] text-white",
      "On Target": "bg-[#0BB3FF] text-white",
    };
    return styles[status] || "bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]";
  };

  const getDepartmentIcon = (department: string) => {
    const icons: Record<string, typeof Building2> = {
      Service: Wrench,
      Inventory: Package,
      Administration: Building2,
      Technical: Settings,
      Marketing: Users,
    };
    return icons[department] || Building2;
  };

  const overviewTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-budget">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('costCenters.totalBudget', 'Total Budget')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">SAR {totalBudget.toLocaleString()}</p>
            <p className="text-xs text-[#64748B]">{costCenters.length} {t('costCenters.costCenters', 'cost centers')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-actual">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('costCenters.actualSpend', 'Actual Spend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0A5ED7]">SAR {totalActual.toLocaleString()}</p>
            <p className="text-xs text-[#64748B]">
              {((totalActual / totalBudget) * 100).toFixed(1)}% {t('costCenters.ofBudget', 'of budget')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-variance">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              {totalVariance >= 0 ? (
                <TrendingDown className="h-4 w-4 text-[#0A5ED7]" />
              ) : (
                <TrendingUp className="h-4 w-4 text-[#F97316]" />
              )}
              {t('costCenters.totalVariance', 'Total Variance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalVariance >= 0 ? "text-[#0A5ED7]" : "text-[#F97316]"}`}>
              SAR {Math.abs(totalVariance).toLocaleString()}
            </p>
            <Badge className={totalVariance >= 0 ? "bg-[#0A5ED7] text-white" : "bg-[#F97316] text-white"}>
              {totalVariance >= 0 ? t('costCenters.underBudget', 'Under Budget') : t('costCenters.overBudget', 'Over Budget')}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-center-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('costCenters.centerStatus', 'Center Status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-[#0A5ED7]">{underBudgetCount}</p>
                <p className="text-xs text-[#64748B]">{t('costCenters.under', 'Under')}</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#F97316]">{overBudgetCount}</p>
                <p className="text-xs text-[#64748B]">{t('costCenters.over', 'Over')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('costCenters.budgetVsActual', 'Budget vs Actual by Center')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('costCenters.comparisonOfBudget', 'Comparison of budget allocation and actual spend')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costCenters.map((cc) => (
                <div key={cc.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{cc.name}</span>
                    <span className="text-sm text-[#64748B]">
                      {((cc.actualSpend / cc.budgetAmount) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={Math.min((cc.actualSpend / cc.budgetAmount) * 100, 100)}
                      className="h-2"
                    />
                    {cc.actualSpend > cc.budgetAmount && (
                      <div
                        className="absolute top-0 h-2 bg-[#F97316] rounded-r"
                        style={{
                          left: "100%",
                          width: `${((cc.actualSpend - cc.budgetAmount) / cc.budgetAmount) * 100}%`,
                          maxWidth: "20%",
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('costCenters.departmentSummary', 'Department Summary')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('costCenters.spendingByDepartment', 'Spending by department')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(costCenters.map((cc) => cc.department))).map((dept) => {
                const deptCenters = costCenters.filter((cc) => cc.department === dept);
                const deptBudget = deptCenters.reduce((sum, cc) => sum + cc.budgetAmount, 0);
                const deptActual = deptCenters.reduce((sum, cc) => sum + cc.actualSpend, 0);
                const Icon = getDepartmentIcon(dept);
                return (
                  <div key={dept} className="flex items-center justify-between p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-[#151A23] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                        <Icon className="h-4 w-4 text-[#0A5ED7]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#0B1F3B] dark:text-white">{dept}</p>
                        <p className="text-xs text-[#64748B]">
                          {deptCenters.length} {t('costCenters.centers', 'center(s)')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-[#0A5ED7]">SAR {deptActual.toLocaleString()}</p>
                      <p className="text-xs text-[#64748B]">
                        {t('costCenters.of', 'of')} SAR {deptBudget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('costCenters.relatedModules', 'Related Modules')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('costCenters.navigateToRelated', 'Navigate to related pages')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/budget-management">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:border-[#0A5ED7]" data-testid="link-budget">
                <Target className="h-4 w-4 mr-2 text-[#0A5ED7]" />
                {t('costCenters.budgetManagement', 'Budget Management')}
                <ExternalLink className="h-3 w-3 ml-auto text-[#64748B]" />
              </Button>
            </Link>
            <Link href="/expenses-management">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:border-[#0A5ED7]" data-testid="link-expenses">
                <DollarSign className="h-4 w-4 mr-2 text-[#0A5ED7]" />
                {t('costCenters.expenses', 'Expenses')}
                <ExternalLink className="h-3 w-3 ml-auto text-[#64748B]" />
              </Button>
            </Link>
            <Link href="/income-statement">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:border-[#0A5ED7]" data-testid="link-income">
                <TrendingUp className="h-4 w-4 mr-2 text-[#0A5ED7]" />
                {t('costCenters.incomeStatement', 'Income Statement')}
                <ExternalLink className="h-3 w-3 ml-auto text-[#64748B]" />
              </Button>
            </Link>
            <Link href="/general-ledger">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:border-[#0A5ED7]" data-testid="link-ledger">
                <FileText className="h-4 w-4 mr-2 text-[#0A5ED7]" />
                {t('costCenters.generalLedger', 'General Ledger')}
                <ExternalLink className="h-3 w-3 ml-auto text-[#64748B]" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const centersTab = (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input
              placeholder={t('costCenters.searchCostCenters', 'Search cost centers...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              data-testid="input-search"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-department">
              <SelectValue placeholder={t('costCenters.department', 'Department')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <SelectItem value="all">{t('costCenters.allDepartments', 'All Departments')}</SelectItem>
              <SelectItem value="service">{t('costCenters.service', 'Service')}</SelectItem>
              <SelectItem value="inventory">{t('costCenters.inventory', 'Inventory')}</SelectItem>
              <SelectItem value="administration">{t('costCenters.administration', 'Administration')}</SelectItem>
              <SelectItem value="technical">{t('costCenters.technical', 'Technical')}</SelectItem>
              <SelectItem value="marketing">{t('costCenters.marketing', 'Marketing')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export', 'Export')}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-add-center">
                <Plus className="h-4 w-4 mr-2" />
                {t('costCenters.addCostCenter', 'Add Cost Center')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <DialogHeader>
                <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('costCenters.createCostCenter', 'Create Cost Center')}</DialogTitle>
                <DialogDescription className="text-[#64748B]">
                  {t('costCenters.addNewCostCenter', 'Add a new cost center for expense tracking')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('costCenters.code', 'Code')}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., SVC-BAY3" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('costCenters.department', 'Department')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-dept">
                                <SelectValue placeholder={t('common.select', 'Select')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                              <SelectItem value="Service">{t('costCenters.service', 'Service')}</SelectItem>
                              <SelectItem value="Inventory">{t('costCenters.inventory', 'Inventory')}</SelectItem>
                              <SelectItem value="Administration">{t('costCenters.administration', 'Administration')}</SelectItem>
                              <SelectItem value="Technical">{t('costCenters.technical', 'Technical')}</SelectItem>
                              <SelectItem value="Marketing">{t('costCenters.marketing', 'Marketing')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('costCenters.nameEnglish', 'Name (English)')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('costCenters.costCenterName', 'Cost center name')} {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('costCenters.nameArabic', 'Name (Arabic)')}</FormLabel>
                          <FormControl>
                            <Input placeholder="اسم مركز التكلفة" dir="rtl" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-name-ar" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="manager"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('costCenters.manager', 'Manager')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('costCenters.responsibleManager', 'Responsible manager')} {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-manager" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="budgetAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('costCenters.budgetSAR', 'Budget (SAR)')}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-budget" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('costCenters.descriptionOptional', 'Description (Optional)')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('costCenters.costCenterDescription', 'Cost center description...')} {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-submit">
                      {t('costCenters.createCenter', 'Create Center')}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead className="text-[#64748B]">{t('costCenters.code', 'Code')}</TableHead>
              <TableHead className="text-[#64748B]">{t('costCenters.name', 'Name')}</TableHead>
              <TableHead className="text-[#64748B]">{t('costCenters.department', 'Department')}</TableHead>
              <TableHead className="text-[#64748B]">{t('costCenters.manager', 'Manager')}</TableHead>
              <TableHead className="text-right text-[#64748B]">{t('costCenters.budget', 'Budget')}</TableHead>
              <TableHead className="text-right text-[#64748B]">{t('costCenters.actual', 'Actual')}</TableHead>
              <TableHead className="text-right text-[#64748B]">{t('costCenters.variance', 'Variance')}</TableHead>
              <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costCenters.map((cc) => {
              const Icon = getDepartmentIcon(cc.department);
              return (
                <TableRow key={cc.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-center-${cc.id}`}>
                  <TableCell className="font-mono text-[#0A5ED7]">{cc.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{cc.name}</p>
                      <p className="text-xs text-[#64748B]" dir="rtl">{cc.nameAr}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#0A5ED7]" />
                      <span className="text-[#0B1F3B] dark:text-white">{cc.department}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{cc.manager}</TableCell>
                  <TableCell className="text-right text-[#0B1F3B] dark:text-white">SAR {cc.budgetAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-[#0B1F3B] dark:text-white">SAR {cc.actualSpend.toLocaleString()}</TableCell>
                  <TableCell className={`text-right ${cc.variance >= 0 ? "text-[#0A5ED7]" : "text-[#F97316]"}`}>
                    {cc.variance >= 0 ? "+" : ""}SAR {cc.variance.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(cc.status)}>
                      {cc.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const tabs = [
    {
      id: "overview",
      label: t('costCenters.overview', 'Overview'),
      icon: BarChart3,
      content: overviewTab,
    },
    {
      id: "centers",
      label: t('costCenters.costCenters', 'Cost Centers'),
      icon: Building2,
      content: centersTab,
    },
  ];

  return (
    <div className="p-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <TabsPageLayout
        title={t('costCenters.title', 'Cost Centers')}
        description={t('costCenters.description', 'مراكز التكلفة - Track budget allocation and actual spend by department')}
        defaultTab="overview"
        tabs={tabs}
      />
    </div>
  );
}
