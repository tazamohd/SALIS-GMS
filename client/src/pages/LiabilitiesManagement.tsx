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
  Building2,
  Plus,
  Search,
  Download,
  Wallet,
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
        return <Badge className="bg-[#0A5ED7] text-white">{t('liabilities.current', 'Current')}</Badge>;
      case "Due Soon":
        return <Badge className="bg-[#F97316] text-white">{t('liabilities.dueSoon', 'Due Soon')}</Badge>;
      case "Overdue":
        return <Badge className="bg-red-600 text-white">{t('liabilities.overdue', 'Overdue')}</Badge>;
      case "Accrued":
        return <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">{t('liabilities.accrued', 'Accrued')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const payablesTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-liabilities">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('liabilities.totalLiabilities', 'Total Liabilities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F97316]">
              SAR {totalLiabilities.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('liabilities.totalLiabilitiesAr', 'Total Liabilities Ar')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-current-liabilities">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('liabilities.currentLiabilities', 'Current Liabilities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F97316]">
              SAR {currentLiabilities.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('liabilities.currentLiabilitiesAr', 'Current Liabilities Ar')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-longterm-liabilities">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('liabilities.longTermLiabilities', 'Long-term Liabilities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A5ED7]">
              SAR {longTermLiabilities.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('liabilities.longTermLiabilitiesAr', 'Long Term Liabilities Ar')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-monthly-obligations">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('liabilities.monthlyObligations', 'Monthly Obligations')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">SAR 17,083</div>
            <p className="text-xs text-[#64748B] mt-1">{t('liabilities.monthlyObligationsAr', 'Monthly Obligations Ar')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('liabilities.liabilitiesRegister', 'Liabilities Register')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('liabilities.liabilitiesRegisterDesc', 'All company obligations')}</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-add-liability">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('liabilities.addLiability', 'Add Liability')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-add-liability">
                <DialogHeader>
                  <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('liabilities.addNewLiability', 'Add New Liability')}</DialogTitle>
                  <DialogDescription className="text-[#64748B]">{t('liabilities.addNewLiabilityDesc', 'Record a new obligation')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('liabilities.liabilityName', 'Liability Name')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('liabilities.enterName', 'Enter name')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-liability-name" />
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.type', 'Type')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-liability-type">
                                  <SelectValue placeholder={t('liabilities.selectType', 'Select type')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('liabilities.creditor', 'Creditor')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('liabilities.enterCreditorName', 'Enter creditor name')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-creditor" />
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('liabilities.amountSAR', 'Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-amount" />
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('liabilities.dueDate', 'Due Date')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-due-date" />
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('liabilities.interestRate', 'Interest Rate (%)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-interest-rate" />
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('liabilities.paymentFrequency', 'Payment Frequency')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-frequency">
                                  <SelectValue placeholder={t('liabilities.selectFrequency', 'Select frequency')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                        {t('common.cancel', 'Cancel')}
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-save-liability">{t('liabilities.saveLiability', 'Save Liability')}</Button>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder={t('liabilities.searchLiabilities', 'Search liabilities...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                data-testid="input-search-liabilities"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-filter-type">
                <SelectValue placeholder={t('liabilities.filterByType', 'Filter by type')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="all">{t('liabilities.allTypes', 'All Types')}</SelectItem>
                <SelectItem value="Long-term Loan">{t('liabilities.longTermLoan', 'Long-term Loan')}</SelectItem>
                <SelectItem value="Accounts Payable">{t('liabilities.accountsPayable', 'Accounts Payable')}</SelectItem>
                <SelectItem value="Mortgage">{t('liabilities.mortgage', 'Mortgage')}</SelectItem>
                <SelectItem value="Tax Liability">{t('liabilities.taxLiability', 'Tax Liability')}</SelectItem>
                <SelectItem value="Provision">{t('liabilities.provision', 'Provision')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="button-export-liabilities">
              <Download className="h-4 w-4 mr-2" />
              {t('common.export', 'Export')}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('liabilities.liability', 'Liability')}</TableHead>
                <TableHead className="text-[#64748B]">{t('liabilities.creditor', 'Creditor')}</TableHead>
                <TableHead className="text-[#64748B]">{t('liabilities.originalAmount', 'Original Amount')}</TableHead>
                <TableHead className="text-[#64748B]">{t('liabilities.balance', 'Balance')}</TableHead>
                <TableHead className="text-[#64748B]">{t('liabilities.interest', 'Interest')}</TableHead>
                <TableHead className="text-[#64748B]">{t('liabilities.dueDate', 'Due Date')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLiabilities.map((liability) => (
                <TableRow key={liability.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-liability-${liability.id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-[#0B1F3B] dark:text-white">{liability.name}</div>
                      <div className="text-xs text-[#64748B]">{liability.type}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{liability.creditor}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">SAR {liability.originalAmount.toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-[#F97316]">
                    SAR {liability.remainingBalance.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{liability.interestRate}%</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{liability.dueDate}</TableCell>
                  <TableCell>{getStatusBadge(liability.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('liabilities.relatedFinancialModules', 'Related Financial Modules')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('liabilities.relatedFinancialModulesDesc', 'Quick access to balance sheet items')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/assets-management">
              <Card className="cursor-pointer hover:border-[#0A5ED7] transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-assets-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Building2 className="h-8 w-8 text-[#0A5ED7]" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('liabilities.assetsManagement', 'Assets Management')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('liabilities.assetsManagementAr', 'Assets Management Ar')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B]">{t('liabilities.assetsManagementDesc', 'Track and manage all company assets and depreciation')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/equity-management">
              <Card className="cursor-pointer hover:border-[#0A5ED7] transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-equity-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Wallet className="h-8 w-8 text-[#0A5ED7]" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('liabilities.equityManagement', 'Equity Management')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('liabilities.equityManagementAr', 'Equity Management Ar')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B]">{t('liabilities.equityManagementDesc', 'Track owner\'s equity, capital, and retained earnings')}</p>
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
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-loans">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('liabilities.totalLoans', 'Total Loans')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A5ED7]">SAR 1,395,000</div>
            <p className="text-xs text-[#64748B] mt-1">{t('liabilities.totalLoansAr', 'Total Loans Ar')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-monthly-payments">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('liabilities.monthlyPayments', 'Monthly Payments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F97316]">SAR 17,083</div>
            <p className="text-xs text-[#64748B] mt-1">{t('liabilities.monthlyPaymentsAr', 'Monthly Payments Ar')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-avg-interest">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('liabilities.avgInterestRate', 'Avg Interest Rate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">4.83%</div>
            <p className="text-xs text-[#64748B] mt-1">{t('liabilities.avgInterestRateAr', 'Avg Interest Rate Ar')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('liabilities.paymentSchedule', 'Payment Schedule')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('liabilities.paymentScheduleDesc', 'Upcoming payment obligations')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('liabilities.month', 'Month')}</TableHead>
                <TableHead className="text-[#64748B]">{t('liabilities.loans', 'Loans')}</TableHead>
                <TableHead className="text-[#64748B]">{t('liabilities.payables', 'Payables')}</TableHead>
                <TableHead className="text-[#64748B]">{t('liabilities.taxes', 'Taxes')}</TableHead>
                <TableHead className="text-[#64748B]">{t('liabilities.total', 'Total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentSchedule.map((schedule, index) => (
                <TableRow key={index} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-schedule-${index}`}>
                  <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{schedule.month}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">SAR {schedule.loans.toLocaleString()}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">SAR {schedule.payables.toLocaleString()}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">SAR {schedule.taxes.toLocaleString()}</TableCell>
                  <TableCell className="font-bold text-[#0A5ED7]">SAR {schedule.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    {
      id: "payables",
      label: t('liabilities.payables', 'Payables'),
      icon: CreditCard,
      content: payablesTab,
    },
    {
      id: "loans",
      label: t('liabilities.loans', 'Loans'),
      icon: Landmark,
      content: loansTab,
    },
  ];

  return (
    <div className="p-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <TabsPageLayout
        title={t('liabilities.title', 'Liabilities Management')}
        description={t('liabilities.description', 'Track and manage all company obligations')}
        defaultTab="payables"
        tabs={tabs}
      />
    </div>
  );
}
