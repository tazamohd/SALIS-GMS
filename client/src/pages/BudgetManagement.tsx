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
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  ExternalLink,
  Target,
  AlertTriangle,
  CheckCircle,
  Edit,
  Copy,
} from "lucide-react";

const budgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  category: z.string().min(1, "Category is required"),
  fiscalYear: z.string().min(1, "Fiscal year is required"),
  amount: z.string().min(1, "Amount is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  notes: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

const budgets = [
  {
    id: "BUD-001",
    name: "Operating Expenses 2024",
    category: "Operating",
    fiscalYear: "2024",
    budgetAmount: 450000,
    actualSpend: 195500,
    remainingBudget: 254500,
    utilizationRate: 43.4,
    status: "On Track",
    period: "Jan - Dec 2024",
  },
  {
    id: "BUD-002",
    name: "Marketing Budget Q1",
    category: "Marketing",
    fiscalYear: "2024",
    budgetAmount: 35000,
    actualSpend: 28000,
    remainingBudget: 7000,
    utilizationRate: 80,
    status: "On Track",
    period: "Jan - Mar 2024",
  },
  {
    id: "BUD-003",
    name: "Equipment Maintenance",
    category: "Maintenance",
    fiscalYear: "2024",
    budgetAmount: 85000,
    actualSpend: 48500,
    remainingBudget: 36500,
    utilizationRate: 57.1,
    status: "On Track",
    period: "Jan - Dec 2024",
  },
  {
    id: "BUD-004",
    name: "Staff Training",
    category: "HR",
    fiscalYear: "2024",
    budgetAmount: 25000,
    actualSpend: 22500,
    remainingBudget: 2500,
    utilizationRate: 90,
    status: "Near Limit",
    period: "Jan - Dec 2024",
  },
  {
    id: "BUD-005",
    name: "IT Infrastructure",
    category: "Technology",
    fiscalYear: "2024",
    budgetAmount: 60000,
    actualSpend: 65000,
    remainingBudget: -5000,
    utilizationRate: 108.3,
    status: "Over Budget",
    period: "Jan - Dec 2024",
  },
  {
    id: "BUD-006",
    name: "Inventory Purchases",
    category: "Inventory",
    fiscalYear: "2024",
    budgetAmount: 250000,
    actualSpend: 118500,
    remainingBudget: 131500,
    utilizationRate: 47.4,
    status: "On Track",
    period: "Jan - Dec 2024",
  },
];

const monthlyBudgetData = [
  { month: "January", budget: 75000, actual: 68500 },
  { month: "February", budget: 72000, actual: 74200 },
  { month: "March", budget: 78000, actual: 71800 },
  { month: "April", budget: 75000, actual: 0 },
  { month: "May", budget: 75000, actual: 0 },
  { month: "June", budget: 80000, actual: 0 },
];

export default function BudgetManagement() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2024");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      category: "",
      fiscalYear: "2024",
      amount: "",
      startDate: "",
      endDate: "",
      notes: "",
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    console.log("Create budget:", data);
    setIsDialogOpen(false);
    form.reset();
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalActual = budgets.reduce((sum, b) => sum + b.actualSpend, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remainingBudget, 0);
  const overallUtilization = (totalActual / totalBudget) * 100;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { className: string; icon: typeof CheckCircle }> = {
      "On Track": { className: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200", icon: CheckCircle },
      "Near Limit": { className: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200", icon: AlertTriangle },
      "Over Budget": { className: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200", icon: AlertTriangle },
    };
    const style = styles[status] || styles["On Track"];
    const Icon = style.icon;
    const statusLabels: Record<string, string> = {
      "On Track": t('budget.onTrack', 'On Track'),
      "Near Limit": t('budget.nearLimit', 'Near Limit'),
      "Over Budget": t('budget.overBudget', 'Over Budget'),
    };
    return (
      <Badge className={style.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const overviewTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-budget">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('budget.totalBudget', 'Total Budget')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">SAR {totalBudget.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t('budget.fiscalYear', 'FY')} {selectedYear}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-spent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('budget.totalSpent', 'Total Spent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">SAR {totalActual.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {overallUtilization.toFixed(1)}% {t('budget.utilized', 'utilized')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-remaining">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              {t('budget.remaining', 'Remaining')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              SAR {Math.abs(totalRemaining).toLocaleString()}
            </p>
            <Badge variant={totalRemaining >= 0 ? "default" : "destructive"}>
              {totalRemaining >= 0 ? t('budget.available', 'Available') : t('budget.overspent', 'Overspent')}
            </Badge>
          </CardContent>
        </Card>

        <Card data-testid="card-budget-health">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('budget.budgetHealth', 'Budget Health')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {budgets.filter((b) => b.status === "On Track").length}
                </p>
                <p className="text-xs text-muted-foreground">{t('budget.onTrack', 'On Track')}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-600">
                  {budgets.filter((b) => b.status === "Near Limit").length}
                </p>
                <p className="text-xs text-muted-foreground">{t('budget.nearLimit', 'Near Limit')}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">
                  {budgets.filter((b) => b.status === "Over Budget").length}
                </p>
                <p className="text-xs text-muted-foreground">{t('budget.over', 'Over')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('budget.utilizationByCategory', 'Budget Utilization by Category')}</CardTitle>
            <CardDescription>{t('budget.spendingProgress', 'Spending progress across categories')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgets.map((budget) => (
                <div key={budget.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{budget.name}</span>
                    <span className="text-sm">{budget.utilizationRate.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={Math.min(budget.utilizationRate, 100)}
                    className={`h-2 ${budget.utilizationRate > 100 ? "[&>div]:bg-red-500" : budget.utilizationRate > 80 ? "[&>div]:bg-yellow-500" : ""}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('budget.monthlyBudgetVsActual', 'Monthly Budget vs Actual')}</CardTitle>
            <CardDescription>{t('budget.yearToDateComparison', 'Year-to-date spending comparison')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyBudgetData.slice(0, 3).map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{item.month}</span>
                    <Badge variant={item.actual <= item.budget ? "default" : "destructive"}>
                      {item.actual <= item.budget ? t('budget.under', 'Under') : t('budget.over', 'Over')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('budget.budget', 'Budget')}</p>
                      <p className="font-mono font-bold">SAR {item.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('budget.actual', 'Actual')}</p>
                      <p className={`font-mono font-bold ${item.actual > item.budget ? "text-red-600" : "text-green-600"}`}>
                        SAR {item.actual.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('budget.relatedModules', 'Related Modules')}</CardTitle>
          <CardDescription>{t('budget.navigateToRelated', 'Navigate to related pages')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/cost-centers">
              <Button variant="outline" className="w-full justify-start" data-testid="link-cost-centers">
                <Target className="h-4 w-4 mr-2" />
                {t('budget.costCenters', 'Cost Centers')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/expenses-management">
              <Button variant="outline" className="w-full justify-start" data-testid="link-expenses">
                <DollarSign className="h-4 w-4 mr-2" />
                {t('budget.expenses', 'Expenses')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/income-statement">
              <Button variant="outline" className="w-full justify-start" data-testid="link-income">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('budget.incomeStatement', 'Income Statement')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/general-ledger">
              <Button variant="outline" className="w-full justify-start" data-testid="link-ledger">
                <FileText className="h-4 w-4 mr-2" />
                {t('budget.generalLedger', 'General Ledger')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const budgetsTab = (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px]" data-testid="select-year">
              <SelectValue placeholder={t('budget.year', 'Year')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">{t('budget.fiscalYear', 'FY')} 2024</SelectItem>
              <SelectItem value="2023">{t('budget.fiscalYear', 'FY')} 2023</SelectItem>
              <SelectItem value="2022">{t('budget.fiscalYear', 'FY')} 2022</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-category">
              <SelectValue placeholder={t('common.category', 'Category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('budget.allCategories', 'All Categories')}</SelectItem>
              <SelectItem value="operating">{t('budget.operating', 'Operating')}</SelectItem>
              <SelectItem value="marketing">{t('budget.marketing', 'Marketing')}</SelectItem>
              <SelectItem value="maintenance">{t('budget.maintenance', 'Maintenance')}</SelectItem>
              <SelectItem value="hr">{t('budget.hr', 'HR')}</SelectItem>
              <SelectItem value="technology">{t('budget.technology', 'Technology')}</SelectItem>
              <SelectItem value="inventory">{t('budget.inventory', 'Inventory')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export', 'Export')}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-budget">
                <Plus className="h-4 w-4 mr-2" />
                {t('budget.createBudget', 'Create Budget')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('budget.createBudget', 'Create Budget')}</DialogTitle>
                <DialogDescription>
                  {t('budget.setUpNewBudget', 'Set up a new budget for expense tracking')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('budget.budgetName', 'Budget Name')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('budget.budgetNamePlaceholder', 'e.g., Marketing Q2 2024')} {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.category', 'Category')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-budget-category">
                                <SelectValue placeholder={t('budget.selectCategory', 'Select category')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Operating">{t('budget.operating', 'Operating')}</SelectItem>
                              <SelectItem value="Marketing">{t('budget.marketing', 'Marketing')}</SelectItem>
                              <SelectItem value="Maintenance">{t('budget.maintenance', 'Maintenance')}</SelectItem>
                              <SelectItem value="HR">{t('budget.hr', 'HR')}</SelectItem>
                              <SelectItem value="Technology">{t('budget.technology', 'Technology')}</SelectItem>
                              <SelectItem value="Inventory">{t('budget.inventory', 'Inventory')}</SelectItem>
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
                      name="fiscalYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('budget.fiscalYear', 'Fiscal Year')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-fiscal-year">
                                <SelectValue placeholder={t('budget.selectYear', 'Select year')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="2024">2024</SelectItem>
                              <SelectItem value="2025">2025</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('budget.budgetAmountSAR', 'Budget Amount (SAR)')}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} data-testid="input-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('budget.startDate', 'Start Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-start-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('budget.endDate', 'End Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-end-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('budget.notesOptional', 'Notes (Optional)')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('budget.budgetNotes', 'Budget notes...')} {...field} data-testid="input-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="submit" data-testid="button-save-budget">
                      {t('budget.createBudget', 'Create Budget')}
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
                <TableHead>{t('budget.budgetName', 'Budget Name')}</TableHead>
                <TableHead>{t('common.category', 'Category')}</TableHead>
                <TableHead>{t('budget.period', 'Period')}</TableHead>
                <TableHead className="text-right">{t('budget.budget', 'Budget')}</TableHead>
                <TableHead className="text-right">{t('budget.actual', 'Actual')}</TableHead>
                <TableHead className="text-right">{t('budget.remaining', 'Remaining')}</TableHead>
                <TableHead>{t('budget.utilization', 'Utilization')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead>{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id} data-testid={`row-budget-${budget.id}`}>
                  <TableCell className="font-medium">{budget.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{budget.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {budget.period}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {budget.budgetAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {budget.actualSpend.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${budget.remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {budget.remainingBudget.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.min(budget.utilizationRate, 100)}
                        className="h-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {budget.utilizationRate.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(budget.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${budget.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-copy-${budget.id}`}>
                        <Copy className="h-4 w-4" />
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

  const forecastTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('budget.budgetForecast', 'Budget Forecast')}</CardTitle>
          <CardDescription>{t('budget.projectedSpending', 'Projected spending based on current trends')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('budget.forecastChartPlaceholder', 'Forecast chart will be displayed here')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <TabsPageLayout
        title={t('budget.title', 'Budget Management')}
        description={t('budget.description', 'إدارة الميزانية - Plan, track, and analyze budgets across departments')}
        defaultTab="overview"
        tabs={[
          { id: "overview", label: t('budget.overview', 'Overview'), icon: PieChart, content: overviewTab },
          { id: "budgets", label: t('budget.budgets', 'Budgets'), icon: DollarSign, content: budgetsTab },
          { id: "forecast", label: t('budget.forecast', 'Forecast'), icon: TrendingUp, content: forecastTab },
        ]}
      />
    </div>
  );
}
