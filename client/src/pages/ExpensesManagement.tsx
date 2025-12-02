import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
        <Card data-testid="card-total-expenses">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              SAR {totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي المصروفات</p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-expenses">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              SAR {pendingExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">المدفوعات المعلقة</p>
          </CardContent>
        </Card>

        <Card data-testid="card-budget-used">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74%</div>
            <Progress value={74} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-transactions-count">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleExpenses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trend</CardTitle>
            <CardDescription>اتجاه المصروفات الشهرية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyExpenses.map((month, index) => (
                <div key={index} data-testid={`bar-expense-month-${index}`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{month.month}</span>
                    <span className="text-sm text-muted-foreground">SAR {month.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={(month.amount / 150000) * 100} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
            <CardDescription>المصروفات حسب الفئة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBudgets.map((cat, index) => (
                <div key={index} data-testid={`bar-category-${index}`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {getCategoryIcon(cat.category)}
                      {cat.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
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
    </div>
  );

  const transactionsTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Transactions</CardTitle>
              <CardDescription>معاملات المصروفات - All expense records</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-expense">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="modal-add-expense">
                <DialogHeader>
                  <DialogTitle>Record New Expense</DialogTitle>
                  <DialogDescription>تسجيل مصروف جديد</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Expense description" data-testid="input-description" />
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
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Utilities">Utilities</SelectItem>
                                <SelectItem value="Inventory">Inventory</SelectItem>
                                <SelectItem value="Payroll">Payroll</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Office">Office</SelectItem>
                                <SelectItem value="Fuel">Fuel</SelectItem>
                                <SelectItem value="Rent">Rent</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Insurance">Insurance</SelectItem>
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
                            <FormLabel>Amount (SAR)</FormLabel>
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
                            <FormLabel>Date</FormLabel>
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
                            <FormLabel>Vendor</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Vendor name" data-testid="input-vendor" />
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
                            <FormLabel>Payment Method</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-payment-method">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Credit">Credit</SelectItem>
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
                            <FormLabel>Receipt Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" data-testid="input-receipt" />
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
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Additional notes" data-testid="input-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-save-expense">Save Expense</Button>
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
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-expenses"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
                <SelectItem value="Payroll">Payroll</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Fuel">Fuel</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export-expenses">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
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
                      {expense.category}
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
                      {expense.status}
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
        <Card data-testid="card-total-budget">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR 166,000</div>
            <p className="text-xs text-muted-foreground mt-1">الميزانية الإجمالية</p>
          </CardContent>
        </Card>

        <Card data-testid="card-spent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">SAR 122,650</div>
            <p className="text-xs text-muted-foreground mt-1">المصروف</p>
          </CardContent>
        </Card>

        <Card data-testid="card-remaining-budget">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">SAR 43,350</div>
            <p className="text-xs text-muted-foreground mt-1">المتبقي</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget by Category</CardTitle>
          <CardDescription>الميزانية حسب الفئة - Budget allocation and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryBudgets.map((cat, index) => {
                const remaining = cat.budget - cat.spent;
                const percentage = (cat.spent / cat.budget) * 100;
                return (
                  <TableRow key={index} data-testid={`row-budget-${index}`}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {getCategoryIcon(cat.category)}
                      {cat.category}
                    </TableCell>
                    <TableCell>SAR {cat.budget.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">SAR {cat.spent.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">SAR {remaining.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {percentage > 90 ? (
                        <Badge className="bg-red-600">Over Budget</Badge>
                      ) : percentage > 70 ? (
                        <Badge className="bg-yellow-600">Warning</Badge>
                      ) : (
                        <Badge className="bg-green-600">On Track</Badge>
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
        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-monthly">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Monthly Expense Report</CardTitle>
            </div>
            <CardDescription>تقرير المصروفات الشهري</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-monthly">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-category">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Category Analysis</CardTitle>
            </div>
            <CardDescription>تحليل الفئات</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-category">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-vendor">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Vendor Report</CardTitle>
            </div>
            <CardDescription>تقرير الموردين</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-vendor">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-budget">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Budget Variance</CardTitle>
            </div>
            <CardDescription>تحليل فروقات الميزانية</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-budget">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-tax">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Tax Deductible</CardTitle>
            </div>
            <CardDescription>المصروفات المخصومة ضريبياً</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-tax">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-receipts">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg">Receipt Summary</CardTitle>
            </div>
            <CardDescription>ملخص الإيصالات</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-receipts">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <TabsPageLayout
        title="Expenses Management"
        description="المصروفات - Track, categorize, and analyze business expenses"
        defaultTab="overview"
        tabs={[
          { id: "overview", label: "Overview", icon: PieChart, content: overviewTab },
          { id: "transactions", label: "Transactions", icon: Receipt, content: transactionsTab },
          { id: "budget", label: "Budget", icon: DollarSign, content: budgetTab },
          { id: "reports", label: "Reports", icon: FileText, content: reportsTab },
        ]}
      />
    </div>
  );
}
