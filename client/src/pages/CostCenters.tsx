import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
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
  Edit,
  Trash2,
  BarChart3,
  PieChart,
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
      "Under Budget": "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      "Over Budget": "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      "On Target": "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    };
    return styles[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
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
        <Card data-testid="card-total-budget">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">SAR {totalBudget.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{costCenters.length} cost centers</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-actual">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Actual Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">SAR {totalActual.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {((totalActual / totalBudget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-variance">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {totalVariance >= 0 ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
              Total Variance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalVariance >= 0 ? "text-green-600" : "text-red-600"}`}>
              SAR {Math.abs(totalVariance).toLocaleString()}
            </p>
            <Badge variant={totalVariance >= 0 ? "default" : "destructive"}>
              {totalVariance >= 0 ? "Under Budget" : "Over Budget"}
            </Badge>
          </CardContent>
        </Card>

        <Card data-testid="card-center-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Center Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">{underBudgetCount}</p>
                <p className="text-xs text-muted-foreground">Under</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-600">{overBudgetCount}</p>
                <p className="text-xs text-muted-foreground">Over</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual by Center</CardTitle>
            <CardDescription>Comparison of budget allocation and actual spend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costCenters.map((cc) => (
                <div key={cc.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{cc.name}</span>
                    <span className="text-sm">
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
                        className="absolute top-0 h-2 bg-red-500 rounded-r"
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

        <Card>
          <CardHeader>
            <CardTitle>Department Summary</CardTitle>
            <CardDescription>Spending by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(costCenters.map((cc) => cc.department))).map((dept) => {
                const deptCenters = costCenters.filter((cc) => cc.department === dept);
                const deptBudget = deptCenters.reduce((sum, cc) => sum + cc.budgetAmount, 0);
                const deptActual = deptCenters.reduce((sum, cc) => sum + cc.actualSpend, 0);
                const Icon = getDepartmentIcon(dept);
                return (
                  <div key={dept} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{dept}</p>
                        <p className="text-xs text-muted-foreground">
                          {deptCenters.length} center(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">SAR {deptActual.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        of SAR {deptBudget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Related Modules</CardTitle>
          <CardDescription>Navigate to related pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/budget-management">
              <Button variant="outline" className="w-full justify-start" data-testid="link-budget">
                <Target className="h-4 w-4 mr-2" />
                Budget Management
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/expenses-management">
              <Button variant="outline" className="w-full justify-start" data-testid="link-expenses">
                <DollarSign className="h-4 w-4 mr-2" />
                Expenses
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/income-statement">
              <Button variant="outline" className="w-full justify-start" data-testid="link-income">
                <TrendingUp className="h-4 w-4 mr-2" />
                Income Statement
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/general-ledger">
              <Button variant="outline" className="w-full justify-start" data-testid="link-ledger">
                <FileText className="h-4 w-4 mr-2" />
                General Ledger
                <ExternalLink className="h-3 w-3 ml-auto" />
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cost centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-department">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="administration">Administration</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Cost Center
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Cost Center</DialogTitle>
                <DialogDescription>
                  Add a new cost center for expense tracking
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
                          <FormLabel>Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., SVC-BAY3" {...field} data-testid="input-code" />
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
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-dept">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Service">Service</SelectItem>
                              <SelectItem value="Inventory">Inventory</SelectItem>
                              <SelectItem value="Administration">Administration</SelectItem>
                              <SelectItem value="Technical">Technical</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
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
                          <FormLabel>Name (English)</FormLabel>
                          <FormControl>
                            <Input placeholder="Cost center name" {...field} data-testid="input-name" />
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
                          <FormLabel>Name (Arabic)</FormLabel>
                          <FormControl>
                            <Input placeholder="اسم مركز التكلفة" dir="rtl" {...field} data-testid="input-name-ar" />
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
                          <FormLabel>Manager</FormLabel>
                          <FormControl>
                            <Input placeholder="Responsible manager" {...field} data-testid="input-manager" />
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
                          <FormLabel>Budget (SAR)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} data-testid="input-budget" />
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
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Cost center description..." {...field} data-testid="input-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="button-save-center">
                      Create Center
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costCenters.map((cc) => (
                <TableRow key={cc.id} data-testid={`row-center-${cc.id}`}>
                  <TableCell className="font-mono font-medium">{cc.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cc.name}</p>
                      <p className="text-xs text-muted-foreground" dir="rtl">{cc.nameAr}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cc.department}</Badge>
                  </TableCell>
                  <TableCell>{cc.manager}</TableCell>
                  <TableCell className="text-right font-mono">
                    {cc.budgetAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {cc.actualSpend.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${cc.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {cc.variance >= 0 ? "" : "-"}{Math.abs(cc.variance).toLocaleString()}
                    <span className="text-xs ml-1">({Math.abs(cc.variancePercentage).toFixed(1)}%)</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(cc.status)}>{cc.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${cc.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-delete-${cc.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const analysisTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown by Category</CardTitle>
          <CardDescription>Detailed expense analysis across all cost centers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Labor", "Materials", "Utilities", "Maintenance"].map((category) => {
              const categoryTotal = expensesByCenter
                .filter((e) => e.category === category)
                .reduce((sum, e) => sum + e.amount, 0);
              return (
                <Card key={category} data-testid={`card-category-${category.toLowerCase()}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">SAR {categoryTotal.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {((categoryTotal / totalActual) * 100).toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variance Analysis</CardTitle>
          <CardDescription>Centers with significant budget variances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costCenters
              .sort((a, b) => a.variance - b.variance)
              .map((cc) => (
                <div key={cc.id} className="p-4 border rounded-lg" data-testid={`variance-${cc.id}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{cc.name}</span>
                    <Badge className={getStatusBadge(cc.status)}>{cc.status}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-mono font-bold">SAR {cc.budgetAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Actual</p>
                      <p className="font-mono font-bold">SAR {cc.actualSpend.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Variance</p>
                      <p className={`font-mono font-bold ${cc.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        SAR {Math.abs(cc.variance).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Utilization</p>
                      <Progress
                        value={Math.min((cc.actualSpend / cc.budgetAmount) * 100, 100)}
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3, content: overviewTab },
    { id: "centers", label: "Cost Centers", icon: Target, content: centersTab },
    { id: "analysis", label: "Analysis", icon: PieChart, content: analysisTab },
  ];

  return (
    <TabsPageLayout
      title="Cost Centers - مراكز التكلفة"
      description="Track and allocate costs by department"
      icon={Target}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
