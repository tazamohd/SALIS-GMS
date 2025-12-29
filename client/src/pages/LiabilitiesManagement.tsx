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
  Landmark,
  CreditCard,
  FileText,
  Building2,
  Plus,
  Search,
  Download,
  Calendar,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

const liabilitySchema = z.object({
  name: z.string().min(1, "Liability name is required"),
  type: z.string().min(1, "Type is required"),
  creditor: z.string().min(1, "Creditor is required"),
  amount: z.string().min(1, "Amount is required"),
  dueDate: z.string().min(1, "Due date is required"),
  interestRate: z.string().optional(),
  paymentFrequency: z.string().min(1, "Payment frequency is required"),
  notes: z.string().optional(),
});

type LiabilityFormData = z.infer<typeof liabilitySchema>;

const sampleLiabilities = [
  {
    id: "1",
    name: "Equipment Loan - Hydraulic Lifts",
    type: "Long-term Loan",
    creditor: "Al Rajhi Bank",
    originalAmount: 200000,
    remainingBalance: 145000,
    monthlyPayment: 4583,
    interestRate: 5.5,
    dueDate: "2027-01-15",
    status: "Current",
  },
  {
    id: "2",
    name: "Supplier Credit - AutoParts Co",
    type: "Accounts Payable",
    creditor: "AutoParts Company",
    originalAmount: 45000,
    remainingBalance: 45000,
    monthlyPayment: 0,
    interestRate: 0,
    dueDate: "2024-02-28",
    status: "Due Soon",
  },
  {
    id: "3",
    name: "Building Mortgage",
    type: "Mortgage",
    creditor: "Saudi National Bank",
    originalAmount: 1500000,
    remainingBalance: 1250000,
    monthlyPayment: 12500,
    interestRate: 4.5,
    dueDate: "2035-06-01",
    status: "Current",
  },
  {
    id: "4",
    name: "VAT Payable - Q4 2024",
    type: "Tax Liability",
    creditor: "ZATCA",
    originalAmount: 28500,
    remainingBalance: 28500,
    monthlyPayment: 0,
    interestRate: 0,
    dueDate: "2024-01-31",
    status: "Overdue",
  },
  {
    id: "5",
    name: "Employee End of Service",
    type: "Provision",
    creditor: "Employees",
    originalAmount: 185000,
    remainingBalance: 185000,
    monthlyPayment: 0,
    interestRate: 0,
    dueDate: "Ongoing",
    status: "Accrued",
  },
];

const paymentSchedule = [
  { month: "Jan 2024", loans: 17083, payables: 45000, taxes: 28500, total: 90583 },
  { month: "Feb 2024", loans: 17083, payables: 0, taxes: 0, total: 17083 },
  { month: "Mar 2024", loans: 17083, payables: 32000, taxes: 0, total: 49083 },
  { month: "Apr 2024", loans: 17083, payables: 0, taxes: 25000, total: 42083 },
  { month: "May 2024", loans: 17083, payables: 28000, taxes: 0, total: 45083 },
  { month: "Jun 2024", loans: 17083, payables: 0, taxes: 0, total: 17083 },
];

export default function LiabilitiesManagement() {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const form = useForm<LiabilityFormData>({
    resolver: zodResolver(liabilitySchema),
    defaultValues: {
      name: "",
      type: "",
      creditor: "",
      amount: "",
      dueDate: "",
      interestRate: "",
      paymentFrequency: "",
      notes: "",
    },
  });

  const onSubmit = (data: LiabilityFormData) => {
    console.log("New liability:", data);
    setIsAddDialogOpen(false);
    form.reset();
  };

  const filteredLiabilities = sampleLiabilities.filter((liability) => {
    const matchesSearch = liability.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || liability.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalLiabilities = sampleLiabilities.reduce((sum, l) => sum + l.remainingBalance, 0);
  const currentLiabilities = sampleLiabilities
    .filter((l) => l.type === "Accounts Payable" || l.type === "Tax Liability")
    .reduce((sum, l) => sum + l.remainingBalance, 0);
  const longTermLiabilities = totalLiabilities - currentLiabilities;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Current":
        return <Badge className="bg-green-600">{t('liabilities.current', 'Current')}</Badge>;
      case "Due Soon":
        return <Badge className="bg-yellow-600">{t('liabilities.dueSoon', 'Due Soon')}</Badge>;
      case "Overdue":
        return <Badge className="bg-red-600">{t('liabilities.overdue', 'Overdue')}</Badge>;
      case "Accrued":
        return <Badge variant="outline">{t('liabilities.accrued', 'Accrued')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const payablesTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-liabilities">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('liabilities.totalLiabilities', 'Total Liabilities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              SAR {totalLiabilities.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('liabilities.totalLiabilitiesAr', 'إجمالي الخصوم')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-current-liabilities">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('liabilities.currentLiabilities', 'Current Liabilities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              SAR {currentLiabilities.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('liabilities.currentLiabilitiesAr', 'الخصوم المتداولة')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-longterm-liabilities">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('liabilities.longTermLiabilities', 'Long-term Liabilities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              SAR {longTermLiabilities.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('liabilities.longTermLiabilitiesAr', 'الخصوم طويلة الأجل')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-obligations">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('liabilities.monthlyObligations', 'Monthly Obligations')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR 17,083</div>
            <p className="text-xs text-muted-foreground mt-1">{t('liabilities.monthlyObligationsAr', 'الالتزامات الشهرية')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('liabilities.liabilitiesRegister', 'Liabilities Register')}</CardTitle>
              <CardDescription>{t('liabilities.liabilitiesRegisterDesc', 'سجل الخصوم والالتزامات - All company obligations')}</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-liability">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('liabilities.addLiability', 'Add Liability')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="modal-add-liability">
                <DialogHeader>
                  <DialogTitle>{t('liabilities.addNewLiability', 'Add New Liability')}</DialogTitle>
                  <DialogDescription>{t('liabilities.addNewLiabilityDesc', 'إضافة التزام جديد - Record a new obligation')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('liabilities.liabilityName', 'Liability Name')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('liabilities.enterName', 'Enter name')} data-testid="input-liability-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('common.type', 'Type')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-liability-type">
                                  <SelectValue placeholder={t('liabilities.selectType', 'Select type')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Long-term Loan">{t('liabilities.longTermLoan', 'Long-term Loan')}</SelectItem>
                                <SelectItem value="Accounts Payable">{t('liabilities.accountsPayable', 'Accounts Payable')}</SelectItem>
                                <SelectItem value="Mortgage">{t('liabilities.mortgage', 'Mortgage')}</SelectItem>
                                <SelectItem value="Tax Liability">{t('liabilities.taxLiability', 'Tax Liability')}</SelectItem>
                                <SelectItem value="Provision">{t('liabilities.provision', 'Provision')}</SelectItem>
                                <SelectItem value="Accrued Expense">{t('liabilities.accruedExpense', 'Accrued Expense')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="creditor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('liabilities.creditor', 'Creditor')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('liabilities.enterCreditorName', 'Enter creditor name')} data-testid="input-creditor" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('liabilities.amountSAR', 'Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" data-testid="input-amount" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('liabilities.dueDate', 'Due Date')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-due-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="interestRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('liabilities.interestRate', 'Interest Rate (%)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" data-testid="input-interest-rate" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('liabilities.paymentFrequency', 'Payment Frequency')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-frequency">
                                  <SelectValue placeholder={t('liabilities.selectFrequency', 'Select frequency')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Monthly">{t('liabilities.monthly', 'Monthly')}</SelectItem>
                                <SelectItem value="Quarterly">{t('liabilities.quarterly', 'Quarterly')}</SelectItem>
                                <SelectItem value="Annually">{t('liabilities.annually', 'Annually')}</SelectItem>
                                <SelectItem value="On Demand">{t('liabilities.onDemand', 'On Demand')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        {t('common.cancel', 'Cancel')}
                      </Button>
                      <Button type="submit" data-testid="button-save-liability">{t('liabilities.saveLiability', 'Save Liability')}</Button>
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
                placeholder={t('liabilities.searchLiabilities', 'Search liabilities...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-liabilities"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-type">
                <SelectValue placeholder={t('liabilities.filterByType', 'Filter by type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('liabilities.allTypes', 'All Types')}</SelectItem>
                <SelectItem value="Long-term Loan">{t('liabilities.longTermLoan', 'Long-term Loan')}</SelectItem>
                <SelectItem value="Accounts Payable">{t('liabilities.accountsPayable', 'Accounts Payable')}</SelectItem>
                <SelectItem value="Mortgage">{t('liabilities.mortgage', 'Mortgage')}</SelectItem>
                <SelectItem value="Tax Liability">{t('liabilities.taxLiability', 'Tax Liability')}</SelectItem>
                <SelectItem value="Provision">{t('liabilities.provision', 'Provision')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export-liabilities">
              <Download className="h-4 w-4 mr-2" />
              {t('common.export', 'Export')}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('liabilities.liability', 'Liability')}</TableHead>
                <TableHead>{t('liabilities.creditor', 'Creditor')}</TableHead>
                <TableHead>{t('liabilities.originalAmount', 'Original Amount')}</TableHead>
                <TableHead>{t('liabilities.balance', 'Balance')}</TableHead>
                <TableHead>{t('liabilities.interest', 'Interest')}</TableHead>
                <TableHead>{t('liabilities.dueDate', 'Due Date')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLiabilities.map((liability) => (
                <TableRow key={liability.id} data-testid={`row-liability-${liability.id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{liability.name}</div>
                      <div className="text-xs text-muted-foreground">{liability.type}</div>
                    </div>
                  </TableCell>
                  <TableCell>{liability.creditor}</TableCell>
                  <TableCell>SAR {liability.originalAmount.toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-red-600">
                    SAR {liability.remainingBalance.toLocaleString()}
                  </TableCell>
                  <TableCell>{liability.interestRate}%</TableCell>
                  <TableCell>{liability.dueDate}</TableCell>
                  <TableCell>{getStatusBadge(liability.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('liabilities.relatedFinancialModules', 'Related Financial Modules')}</CardTitle>
          <CardDescription>{t('liabilities.relatedFinancialModulesDesc', 'الوحدات المالية ذات الصلة - Quick access to balance sheet items')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/assets-management">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full" data-testid="link-assets-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Building2 className="h-8 w-8 text-green-600" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{t('liabilities.assetsManagement', 'Assets Management')}</CardTitle>
                  <CardDescription>{t('liabilities.assetsManagementAr', 'الأصول')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('liabilities.assetsManagementDesc', 'Track and manage all company assets and depreciation')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/equity-management">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full" data-testid="link-equity-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Wallet className="h-8 w-8 text-blue-600" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{t('liabilities.equityManagement', 'Equity Management')}</CardTitle>
                  <CardDescription>{t('liabilities.equityManagementAr', 'حقوق الملكية')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('liabilities.equityManagementDesc', 'Track owner\'s equity, capital, and retained earnings')}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const loansTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-total-loans">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('liabilities.totalLoans', 'Total Loans')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">SAR 1,395,000</div>
            <p className="text-xs text-muted-foreground mt-1">{t('liabilities.totalLoansAr', 'إجمالي القروض')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-payments">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('liabilities.monthlyPayments', 'Monthly Payments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">SAR 17,083</div>
            <p className="text-xs text-muted-foreground mt-1">{t('liabilities.monthlyPaymentsAr', 'الأقساط الشهرية')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-interest-expense">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('liabilities.annualInterest', 'Annual Interest')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">SAR 64,275</div>
            <p className="text-xs text-muted-foreground mt-1">{t('liabilities.annualInterestAr', 'مصروف الفوائد السنوي')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('liabilities.activeLoans', 'Active Loans')}</CardTitle>
          <CardDescription>{t('liabilities.activeLoansDesc', 'القروض النشطة - Loan details and repayment status')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sampleLiabilities
            .filter((l) => l.type === "Long-term Loan" || l.type === "Mortgage")
            .map((loan) => (
              <div key={loan.id} className="p-4 border rounded-lg" data-testid={`card-loan-${loan.id}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{loan.name}</h4>
                    <p className="text-sm text-muted-foreground">{loan.creditor}</p>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('liabilities.originalAmount', 'Original Amount')}</p>
                    <p className="font-medium">SAR {loan.originalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('liabilities.remainingBalance', 'Remaining Balance')}</p>
                    <p className="font-medium text-red-600">SAR {loan.remainingBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('liabilities.monthlyPayment', 'Monthly Payment')}</p>
                    <p className="font-medium">SAR {loan.monthlyPayment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('liabilities.interestRateLabel', 'Interest Rate')}</p>
                    <p className="font-medium">{loan.interestRate}%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('liabilities.repaymentProgress', 'Repayment Progress')}</span>
                    <span>{Math.round(((loan.originalAmount - loan.remainingBalance) / loan.originalAmount) * 100)}%</span>
                  </div>
                  <Progress value={((loan.originalAmount - loan.remainingBalance) / loan.originalAmount) * 100} className="h-2" />
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );

  const scheduleTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('liabilities.paymentSchedule', 'Payment Schedule')}</CardTitle>
          <CardDescription>{t('liabilities.paymentScheduleDesc', 'جدول السداد - Upcoming payment obligations')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('liabilities.month', 'Month')}</TableHead>
                <TableHead>{t('liabilities.loans', 'Loans')}</TableHead>
                <TableHead>{t('liabilities.payables', 'Payables')}</TableHead>
                <TableHead>{t('liabilities.taxes', 'Taxes')}</TableHead>
                <TableHead>{t('common.total', 'Total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentSchedule.map((schedule, index) => (
                <TableRow key={index} data-testid={`row-schedule-${index}`}>
                  <TableCell className="font-medium">{schedule.month}</TableCell>
                  <TableCell>SAR {schedule.loans.toLocaleString()}</TableCell>
                  <TableCell>SAR {schedule.payables.toLocaleString()}</TableCell>
                  <TableCell>SAR {schedule.taxes.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">SAR {schedule.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      <TabsPageLayout
        title={t('liabilities.liabilitiesManagement', 'Liabilities Management')}
        subtitle={t('liabilities.liabilitiesManagementSubtitle', 'إدارة الخصوم - Track and manage company obligations and debts')}
        tabs={[
          { id: "payables", label: t('liabilities.payables', 'Payables'), icon: CreditCard, content: payablesTab },
          { id: "loans", label: t('liabilities.loans', 'Loans'), icon: Landmark, content: loansTab },
          { id: "schedule", label: t('liabilities.schedule', 'Schedule'), icon: Calendar, content: scheduleTab },
        ]}
      />
    </div>
  );
}
