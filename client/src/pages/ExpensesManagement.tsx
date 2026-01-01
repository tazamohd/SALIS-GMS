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
  Receipt,
  TrendingDown,
  DollarSign,
  Users,
  Plus,
  Search,
  Download,
  Calendar,
  Building2,
  Zap,
  Fuel,
  Wrench,
  FileText,
  CreditCard,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  ShoppingCart,
} from "lucide-react";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  vendor: z.string().min(1, "Vendor is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  receipt: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const sampleExpenses = [
  {
    id: "1",
    description: "Monthly electricity bill",
    category: "Utilities",
    amount: 4500,
    date: "2024-01-25",
    vendor: "Saudi Electricity Company",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    receiptNo: "SEC-2024-0125",
  },
  {
    id: "2",
    description: "Spare parts inventory purchase",
    category: "Inventory",
    amount: 28500,
    date: "2024-01-24",
    vendor: "AutoParts Supplier Co",
    paymentMethod: "Credit",
    status: "Pending",
    receiptNo: "APS-2024-0892",
  },
  {
    id: "3",
    description: "Staff salaries - January",
    category: "Payroll",
    amount: 85000,
    date: "2024-01-28",
    vendor: "Internal",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    receiptNo: "PAY-2024-01",
  },
  {
    id: "4",
    description: "Equipment maintenance - Hydraulic lift",
    category: "Maintenance",
    amount: 2800,
    date: "2024-01-22",
    vendor: "Lift Services Co",
    paymentMethod: "Cash",
    status: "Paid",
    receiptNo: "LSC-2024-045",
  },
  {
    id: "5",
    description: "Office supplies",
    category: "Office",
    amount: 650,
    date: "2024-01-20",
    vendor: "Jarir Bookstore",
    paymentMethod: "Card",
    status: "Paid",
    receiptNo: "JB-2024-1205",
  },
  {
    id: "6",
    description: "Vehicle fuel - Company cars",
    category: "Fuel",
    amount: 1200,
    date: "2024-01-27",
    vendor: "Saudi Aramco Station",
    paymentMethod: "Card",
    status: "Paid",
    receiptNo: "FUEL-2024-089",
  },
];

const categoryBudgets = [
  { category: "Payroll", budget: 90000, spent: 85000, color: "blue" },
  { category: "Inventory", budget: 50000, spent: 28500, color: "purple" },
  { category: "Utilities", budget: 8000, spent: 4500, color: "yellow" },
  { category: "Maintenance", budget: 10000, spent: 2800, color: "green" },
  { category: "Office", budget: 3000, spent: 650, color: "gray" },
  { category: "Fuel", budget: 5000, spent: 1200, color: "orange" },
];

const monthlyExpenses = [
  { month: "Aug 2023", amount: 115000 },
  { month: "Sep 2023", amount: 122000 },
  { month: "Oct 2023", amount: 118000 },
  { month: "Nov 2023", amount: 125000 },
  { month: "Dec 2023", amount: 135000 },
  { month: "Jan 2024", amount: 122650 },
];

export default function ExpensesManagement() {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      category: "",
      amount: "",
      date: "",
      vendor: "",
      paymentMethod: "",
      receipt: "",
      notes: "",
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    console.log("New expense:", data);
    setIsAddDialogOpen(false);
    form.reset();
  };

  const filteredExpenses = sampleExpenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = sampleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = sampleExpenses
    .filter((e) => e.status === "Pending")
    .reduce((sum, e) => sum + e.amount, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Utilities":
        return <Zap className="h-4 w-4" />;
      case "Inventory":
        return <Receipt className="h-4 w-4" />;
      case "Payroll":
        return <Users className="h-4 w-4" />;
      case "Maintenance":
        return <Wrench className="h-4 w-4" />;
      case "Office":
        return <Building2 className="h-4 w-4" />;
      case "Fuel":
        return <Fuel className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const overviewTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-expenses">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('payments.expenses.totalExpenses', 'Total Expenses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#F97316]">
                  SAR {totalExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-[#64748B] mt-1">{t('payments.expenses.totalExpensesAr', 'إجمالي المصروفات')}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#F97316]/10">
                <TrendingDown className="h-6 w-6 text-[#F97316]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-pending-expenses">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('payments.expenses.pendingPayments', 'Pending Payments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#F97316]">
                  SAR {pendingExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-[#64748B] mt-1">{t('payments.expenses.pendingPaymentsAr', 'المدفوعات المعلقة')}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#F97316]/10">
                <Clock className="h-6 w-6 text-[#F97316]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-budget-used">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('payments.expenses.budgetUsed', 'Budget Used')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">74%</div>
                <Progress value={74} className="mt-2 h-2" />
              </div>
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <PieChart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-transactions-count">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('payments.expenses.transactions', 'Transactions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{sampleExpenses.length}</div>
                <p className="text-xs text-[#64748B] mt-1">{t('common.thisMonth', 'This month')}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#0BB3FF]/10">
                <Receipt className="h-6 w-6 text-[#0BB3FF]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('payments.expenses.monthlyTrend', 'Monthly Expense Trend')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('payments.expenses.monthlyTrendAr', 'اتجاه المصروفات الشهرية')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyExpenses.map((month, index) => (
                <div key={index} data-testid={`bar-expense-month-${index}`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{month.month}</span>
                    <span className="text-sm text-[#64748B]">SAR {month.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={(month.amount / 150000) * 100} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('payments.expenses.expenseByCategory', 'Expense by Category')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('payments.expenses.expenseByCategoryAr', 'المصروفات حسب الفئة')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBudgets.map((cat, index) => (
                <div key={index} data-testid={`bar-category-${index}`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                      {getCategoryIcon(cat.category)}
                      {t(`payments.expenses.categories.${cat.category.toLowerCase()}`, cat.category)}
                    </span>
                    <span className="text-sm text-[#64748B]">
                      SAR {cat.spent.toLocaleString()} / {cat.budget.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(cat.spent / cat.budget) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('payments.expenses.relatedModules', 'Related Financial Modules')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('payments.expenses.relatedModulesDesc', 'Quick access to related accounting')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/sales-management">
              <Card className="cursor-pointer hover:border-[#22c55e] transition-colors h-full bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-sales-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-[#22c55e]/10">
                      <ShoppingCart className="h-6 w-6 text-[#22c55e]" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('sales.management', 'Sales Management')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('sales.managementAr', 'المبيعات')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B]">{t('sales.description', 'Track revenue, transactions, and sales performance')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/invoices">
              <Card className="cursor-pointer hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors h-full bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-invoices">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('invoices.title', 'Invoices')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('invoices.titleAr', 'الفواتير')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B]">{t('invoices.description', 'Manage customer invoices and payment tracking')}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const transactionsTab = (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('payments.expenses.expenseTransactions', 'Expense Transactions')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('payments.expenses.allExpenseRecords', 'All expense records')}</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-expense">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('payments.expenses.addExpense', 'Add Expense')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="modal-add-expense">
                <DialogHeader>
                  <DialogTitle>{t('payments.expenses.recordNewExpense', 'Record New Expense')}</DialogTitle>
                  <DialogDescription>{t('payments.expenses.recordNewExpenseAr', 'تسجيل مصروف جديد')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>{t('common.description', 'Description')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('payments.expenses.expenseDescriptionPlaceholder', 'Expense description')} data-testid="input-description" />
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
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder={t('payments.expenses.selectCategory', 'Select category')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Utilities">{t('payments.expenses.categories.utilities', 'Utilities')}</SelectItem>
                                <SelectItem value="Inventory">{t('payments.expenses.categories.inventory', 'Inventory')}</SelectItem>
                                <SelectItem value="Payroll">{t('payments.expenses.categories.payroll', 'Payroll')}</SelectItem>
                                <SelectItem value="Maintenance">{t('payments.expenses.categories.maintenance', 'Maintenance')}</SelectItem>
                                <SelectItem value="Office">{t('payments.expenses.categories.office', 'Office')}</SelectItem>
                                <SelectItem value="Fuel">{t('payments.expenses.categories.fuel', 'Fuel')}</SelectItem>
                                <SelectItem value="Rent">{t('payments.expenses.categories.rent', 'Rent')}</SelectItem>
                                <SelectItem value="Marketing">{t('payments.expenses.categories.marketing', 'Marketing')}</SelectItem>
                                <SelectItem value="Insurance">{t('payments.expenses.categories.insurance', 'Insurance')}</SelectItem>
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
                            <FormLabel>{t('payments.expenses.amountSar', 'Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" data-testid="input-amount" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('common.date', 'Date')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vendor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('payments.expenses.vendor', 'Vendor')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('payments.expenses.vendorPlaceholder', 'Vendor name')} data-testid="input-vendor" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('payments.paymentMethod', 'Payment Method')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-payment-method">
                                  <SelectValue placeholder={t('payments.selectPaymentMethod', 'Select method')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Cash">{t('payments.methods.cash', 'Cash')}</SelectItem>
                                <SelectItem value="Card">{t('payments.methods.card', 'Card')}</SelectItem>
                                <SelectItem value="Bank Transfer">{t('payments.methods.bankTransfer', 'Bank Transfer')}</SelectItem>
                                <SelectItem value="Credit">{t('payments.methods.credit', 'Credit')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="receipt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('payments.expenses.receiptNumber', 'Receipt Number')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('common.optional', 'Optional')} data-testid="input-receipt" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>{t('common.notes', 'Notes')}</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder={t('payments.expenses.additionalNotes', 'Additional notes')} data-testid="input-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        {t('common.cancel', 'Cancel')}
                      </Button>
                      <Button type="submit" data-testid="button-save-expense">{t('payments.expenses.saveExpense', 'Save Expense')}</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('payments.expenses.searchExpenses', 'Search expenses...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-expenses"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-category">
                <SelectValue placeholder={t('payments.expenses.filterByCategory', 'Filter by category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('payments.expenses.allCategories', 'All Categories')}</SelectItem>
                <SelectItem value="Utilities">{t('payments.expenses.categories.utilities', 'Utilities')}</SelectItem>
                <SelectItem value="Inventory">{t('payments.expenses.categories.inventory', 'Inventory')}</SelectItem>
                <SelectItem value="Payroll">{t('payments.expenses.categories.payroll', 'Payroll')}</SelectItem>
                <SelectItem value="Maintenance">{t('payments.expenses.categories.maintenance', 'Maintenance')}</SelectItem>
                <SelectItem value="Office">{t('payments.expenses.categories.office', 'Office')}</SelectItem>
                <SelectItem value="Fuel">{t('payments.expenses.categories.fuel', 'Fuel')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export-expenses">
              <Download className="h-4 w-4 mr-2" />
              {t('common.export', 'Export')}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.description', 'Description')}</TableHead>
                <TableHead>{t('common.category', 'Category')}</TableHead>
                <TableHead>{t('payments.expenses.vendor', 'Vendor')}</TableHead>
                <TableHead>{t('common.amount', 'Amount')}</TableHead>
                <TableHead>{t('common.date', 'Date')}</TableHead>
                <TableHead>{t('payments.paymentMethod', 'Payment')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-xs text-muted-foreground">{expense.receiptNo}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {getCategoryIcon(expense.category)}
                      {t(`payments.expenses.categories.${expense.category.toLowerCase()}`, expense.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell className="font-medium text-red-600">
                    SAR {expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={expense.status === "Paid" ? "default" : "secondary"}>
                      {expense.status === "Paid" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {t(`payments.expenses.status.${expense.status.toLowerCase()}`, expense.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const budgetTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-budget">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('payments.expenses.totalBudget', 'Total Budget')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">SAR 166,000</div>
                <p className="text-xs text-[#64748B] mt-1">{t('payments.expenses.totalBudgetAr', 'الميزانية الإجمالية')}</p>
              </div>
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-spent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('payments.expenses.spent', 'Spent')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#F97316]">SAR 122,650</div>
                <p className="text-xs text-[#64748B] mt-1">{t('payments.expenses.spentAr', 'المصروف')}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#F97316]/10">
                <TrendingDown className="h-6 w-6 text-[#F97316]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-remaining-budget">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('payments.expenses.remaining', 'Remaining')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#22c55e]">SAR 43,350</div>
                <p className="text-xs text-[#64748B] mt-1">{t('payments.expenses.remainingAr', 'المتبقي')}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#22c55e]/10">
                <CheckCircle className="h-6 w-6 text-[#22c55e]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('payments.expenses.budgetByCategory', 'Budget by Category')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('payments.expenses.budgetByCategoryDesc', 'Budget allocation and usage')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
              <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.category', 'Category')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('payments.expenses.budget', 'Budget')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('payments.expenses.spent', 'Spent')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('payments.expenses.remaining', 'Remaining')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.progress', 'Progress')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryBudgets.map((cat, index) => {
                const remaining = cat.budget - cat.spent;
                const percentage = (cat.spent / cat.budget) * 100;
                return (
                  <TableRow key={index} data-testid={`row-budget-${index}`}>
                    <TableCell className="font-medium flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                      {getCategoryIcon(cat.category)}
                      {t(`payments.expenses.categories.${cat.category.toLowerCase()}`, cat.category)}
                    </TableCell>
                    <TableCell className="text-[#0B1F3B] dark:text-white">SAR {cat.budget.toLocaleString()}</TableCell>
                    <TableCell className="text-[#F97316]">SAR {cat.spent.toLocaleString()}</TableCell>
                    <TableCell className="text-[#22c55e]">SAR {remaining.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-20 h-2" />
                        <span className="text-xs text-[#64748B]">{Math.round(percentage)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {percentage > 90 ? (
                        <Badge className="bg-[#ef4444]">{t('payments.expenses.overBudget', 'Over Budget')}</Badge>
                      ) : percentage > 70 ? (
                        <Badge className="bg-[#F97316]">{t('common.warning', 'Warning')}</Badge>
                      ) : (
                        <Badge className="bg-[#22c55e]">{t('payments.expenses.onTrack', 'On Track')}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const reportsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-monthly">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('payments.expenses.monthlyExpenseReport', 'Monthly Expense Report')}</CardTitle>
            </div>
            <CardDescription className="text-[#64748B]">{t('payments.expenses.monthlyExpenseReportAr', 'تقرير المصروفات الشهري')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0BB3FF]/10" variant="outline" data-testid="button-generate-monthly">
              {t('payments.expenses.generateReport', 'Generate Report')}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-category">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#0BB3FF]/10">
                <PieChart className="h-4 w-4 text-[#0BB3FF]" />
              </div>
              <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('payments.expenses.categoryAnalysis', 'Category Analysis')}</CardTitle>
            </div>
            <CardDescription className="text-[#64748B]">{t('payments.expenses.categoryAnalysisAr', 'تحليل الفئات')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-generate-category">
              {t('payments.expenses.generateReport', 'Generate Report')}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-[#22c55e] transition-colors bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-vendor">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#22c55e]/10">
                <Building2 className="h-4 w-4 text-[#22c55e]" />
              </div>
              <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('payments.expenses.vendorReport', 'Vendor Report')}</CardTitle>
            </div>
            <CardDescription className="text-[#64748B]">{t('payments.expenses.vendorReportAr', 'تقرير الموردين')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-generate-vendor">
              {t('payments.expenses.generateReport', 'Generate Report')}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-[#F97316] transition-colors bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-budget">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#F97316]/10">
                <TrendingDown className="h-4 w-4 text-[#F97316]" />
              </div>
              <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('payments.expenses.budgetVariance', 'Budget Variance')}</CardTitle>
            </div>
            <CardDescription className="text-[#64748B]">{t('payments.expenses.budgetVarianceAr', 'تحليل فروقات الميزانية')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-generate-budget">
              {t('payments.expenses.generateReport', 'Generate Report')}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-[#ef4444] transition-colors bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-tax">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#ef4444]/10">
                <FileText className="h-4 w-4 text-[#ef4444]" />
              </div>
              <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('payments.expenses.taxDeductible', 'Tax Deductible')}</CardTitle>
            </div>
            <CardDescription className="text-[#64748B]">{t('payments.expenses.taxDeductibleAr', 'المصروفات المخصومة ضريبياً')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-generate-tax">
              {t('payments.expenses.generateReport', 'Generate Report')}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-[#0A5ED7] transition-colors bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-receipts">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#0A5ED7]/10">
                <Receipt className="h-4 w-4 text-[#0A5ED7]" />
              </div>
              <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('payments.expenses.receiptSummary', 'Receipt Summary')}</CardTitle>
            </div>
            <CardDescription className="text-[#64748B]">{t('payments.expenses.receiptSummaryAr', 'ملخص الإيصالات')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-generate-receipts">
              {t('payments.expenses.generateReport', 'Generate Report')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <TabsPageLayout
        title={t('payments.expenses.expensesManagement', 'Expenses Management')}
        description={t('payments.expenses.expensesManagementDesc', 'Track, categorize, and analyze business expenses')}
        defaultTab="overview"
        tabs={[
          { id: "overview", label: t('common.overview', 'Overview'), icon: PieChart, content: overviewTab },
          { id: "transactions", label: t('payments.expenses.transactions', 'Transactions'), icon: Receipt, content: transactionsTab },
          { id: "budget", label: t('payments.expenses.budget', 'Budget'), icon: DollarSign, content: budgetTab },
          { id: "reports", label: t('reports.title', 'Reports'), icon: FileText, content: reportsTab },
        ]}
      />
    </div>
  );
}
