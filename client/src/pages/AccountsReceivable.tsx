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
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Download,
  Plus,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Calendar,
  TrendingUp,
  Send,
  Eye,
} from "lucide-react";

const paymentSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.string().min(1, "Amount is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  reference: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const receivables = [
  {
    id: "AR-001",
    customerId: "CUST-001",
    customerName: "Ahmed Al-Rashid",
    invoiceNumber: "INV-2024-0089",
    invoiceDate: "2024-01-15",
    dueDate: "2024-02-14",
    originalAmount: 15000,
    paidAmount: 0,
    balanceDue: 15000,
    daysOverdue: 0,
    status: "Current",
    email: "ahmed@example.com",
    phone: "+966 50 123 4567",
  },
  {
    id: "AR-002",
    customerId: "CUST-002",
    customerName: "Fatima Al-Hassan",
    invoiceNumber: "INV-2024-0078",
    invoiceDate: "2024-01-08",
    dueDate: "2024-02-07",
    originalAmount: 8500,
    paidAmount: 4000,
    balanceDue: 4500,
    daysOverdue: 0,
    status: "Current",
    email: "fatima@example.com",
    phone: "+966 55 234 5678",
  },
  {
    id: "AR-003",
    customerId: "CUST-003",
    customerName: "Khalid Motors",
    invoiceNumber: "INV-2024-0065",
    invoiceDate: "2023-12-20",
    dueDate: "2024-01-19",
    originalAmount: 25000,
    paidAmount: 0,
    balanceDue: 25000,
    daysOverdue: 12,
    status: "Overdue",
    email: "accounts@khalidmotors.com",
    phone: "+966 11 456 7890",
  },
  {
    id: "AR-004",
    customerId: "CUST-004",
    customerName: "Mohammed Transport Co",
    invoiceNumber: "INV-2024-0052",
    invoiceDate: "2023-12-10",
    dueDate: "2024-01-09",
    originalAmount: 18500,
    paidAmount: 10000,
    balanceDue: 8500,
    daysOverdue: 22,
    status: "Overdue",
    email: "billing@mtransport.com",
    phone: "+966 12 567 8901",
  },
  {
    id: "AR-005",
    customerId: "CUST-005",
    customerName: "Sara Al-Mahmoud",
    invoiceNumber: "INV-2024-0045",
    invoiceDate: "2023-11-25",
    dueDate: "2023-12-25",
    originalAmount: 12000,
    paidAmount: 0,
    balanceDue: 12000,
    daysOverdue: 37,
    status: "Past Due",
    email: "sara.m@email.com",
    phone: "+966 50 678 9012",
  },
  {
    id: "AR-006",
    customerId: "CUST-006",
    customerName: "Al-Faisal Trading",
    invoiceNumber: "INV-2024-0032",
    invoiceDate: "2023-10-15",
    dueDate: "2023-11-14",
    originalAmount: 35000,
    paidAmount: 20000,
    balanceDue: 15000,
    daysOverdue: 78,
    status: "Delinquent",
    email: "finance@alfaisal.com",
    phone: "+966 13 789 0123",
  },
];

const customers = [
  { id: "CUST-001", name: "Ahmed Al-Rashid" },
  { id: "CUST-002", name: "Fatima Al-Hassan" },
  { id: "CUST-003", name: "Khalid Motors" },
  { id: "CUST-004", name: "Mohammed Transport Co" },
  { id: "CUST-005", name: "Sara Al-Mahmoud" },
  { id: "CUST-006", name: "Al-Faisal Trading" },
];

export default function AccountsReceivable() {
  const { t } = useTranslation();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customerId: "",
      invoiceId: "",
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      reference: "",
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    console.log("Record payment:", data);
    setIsPaymentDialogOpen(false);
    form.reset();
  };

  const totalReceivables = receivables.reduce((sum, r) => sum + r.balanceDue, 0);
  const currentReceivables = receivables.filter((r) => r.status === "Current").reduce((sum, r) => sum + r.balanceDue, 0);
  const overdueReceivables = receivables.filter((r) => r.status !== "Current").reduce((sum, r) => sum + r.balanceDue, 0);
  const avgDaysOverdue = Math.round(
    receivables.filter((r) => r.daysOverdue > 0).reduce((sum, r) => sum + r.daysOverdue, 0) /
      receivables.filter((r) => r.daysOverdue > 0).length || 0
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Current: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200",
      Overdue: "bg-[#F97316]/20 text-[#F97316] dark:bg-[#F97316]/30 dark:text-orange-200",
      "Past Due": "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200",
      Delinquent: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200",
    };
    return styles[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Current: t('accounting.status.current', 'Current'),
      Overdue: t('accounting.status.overdue', 'Overdue'),
      "Past Due": t('accounting.status.pastDue', 'Past Due'),
      Delinquent: t('accounting.status.delinquent', 'Delinquent'),
    };
    return labels[status] || status;
  };

  const receivablesTab = (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input
              placeholder={t('accounting.searchCustomersOrInvoices', 'Search customers or invoices...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              data-testid="input-search"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-status-filter">
              <SelectValue placeholder={t('common.status', 'Status')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <SelectItem value="all">{t('accounting.allStatus', 'All Status')}</SelectItem>
              <SelectItem value="current">{t('accounting.status.current', 'Current')}</SelectItem>
              <SelectItem value="overdue">{t('accounting.status.overdue', 'Overdue')}</SelectItem>
              <SelectItem value="past-due">{t('accounting.status.pastDue', 'Past Due')}</SelectItem>
              <SelectItem value="delinquent">{t('accounting.status.delinquent', 'Delinquent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export', 'Export')}
          </Button>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-record-payment">
                <Plus className="h-4 w-4 mr-2" />
                {t('accounting.recordPayment', 'Record Payment')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <DialogHeader>
                <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.recordPayment', 'Record Payment')}</DialogTitle>
                <DialogDescription className="text-[#64748B]">
                  {t('accounting.recordPaymentFromCustomer', 'Record a payment received from a customer')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('accounting.customer', 'Customer')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-customer">
                              <SelectValue placeholder={t('accounting.selectCustomer', 'Select customer')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('accounting.invoice', 'Invoice')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('accounting.invoicePlaceholderAR', 'e.g., INV-2024-0089')} {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-invoice" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('accounting.amountSAR', 'Amount (SAR)')}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('accounting.paymentDate', 'Payment Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-payment-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('accounting.paymentMethod', 'Payment Method')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-payment-method">
                              <SelectValue placeholder={t('accounting.selectMethod', 'Select method')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                            <SelectItem value="cash">{t('accounting.cash', 'Cash')}</SelectItem>
                            <SelectItem value="bank_transfer">{t('accounting.bankTransfer', 'Bank Transfer')}</SelectItem>
                            <SelectItem value="credit_card">{t('accounting.creditCard', 'Credit Card')}</SelectItem>
                            <SelectItem value="check">{t('accounting.check', 'Check')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('accounting.referenceOptional', 'Reference (Optional)')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('accounting.checkReferencePlaceholder', 'e.g., Check #12345')} {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-reference" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-save-payment">
                      {t('accounting.recordPayment', 'Record Payment')}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]">
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('accounting.customer', 'Customer')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('accounting.invoice', 'Invoice')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('accounting.dueDate', 'Due Date')}</TableHead>
                <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('accounting.original', 'Original')}</TableHead>
                <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('accounting.paid', 'Paid')}</TableHead>
                <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('accounting.balance', 'Balance')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables.map((ar) => (
                <TableRow key={ar.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-ar-${ar.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{ar.customerName}</p>
                      <p className="text-xs text-[#64748B]">{ar.customerId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                      {ar.invoiceNumber}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-[#0B1F3B] dark:text-white">{ar.dueDate}</p>
                      {ar.daysOverdue > 0 && (
                        <p className="text-xs text-red-600 dark:text-red-400">{t('accounting.daysOverdue', '{{days}} days overdue', { days: ar.daysOverdue })}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[#0B1F3B] dark:text-white">
                    {ar.originalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                    {ar.paidAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-[#0B1F3B] dark:text-white">
                    {ar.balanceDue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(ar.status)}>{getStatusLabel(ar.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white" data-testid={`button-view-${ar.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white" data-testid={`button-email-${ar.id}`}>
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white" data-testid={`button-call-${ar.id}`}>
                        <Phone className="h-4 w-4" />
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

  const overviewTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-receivables">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('accounting.totalReceivables', 'Total Receivables')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t('common.sar', 'SAR')} {totalReceivables.toLocaleString()}</p>
            <p className="text-xs text-[#64748B]">{t('accounting.invoicesCount', '{{count}} invoices', { count: receivables.length })}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-current">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {t('accounting.status.current', 'Current')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {t('common.sar', 'SAR')} {currentReceivables.toLocaleString()}
            </p>
            <p className="text-xs text-[#64748B]">
              {t('accounting.percentOfTotal', '{{percent}}% of total', { percent: ((currentReceivables / totalReceivables) * 100).toFixed(0) })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-overdue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              {t('accounting.status.overdue', 'Overdue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {t('common.sar', 'SAR')} {overdueReceivables.toLocaleString()}
            </p>
            <p className="text-xs text-[#64748B]">
              {t('accounting.percentOfTotal', '{{percent}}% of total', { percent: ((overdueReceivables / totalReceivables) * 100).toFixed(0) })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-avg-days">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('accounting.avgDaysOverdue', 'Avg Days Overdue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{avgDaysOverdue}</p>
            <p className="text-xs text-[#64748B]">{t('accounting.daysAverage', 'days average')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.agingAnalysis', 'Aging Analysis')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.receivablesBreakdownByAge', 'Receivables breakdown by age')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: t('accounting.aging.current', 'Current (0-30 days)'), amount: 19500, percentage: 24 },
              { label: t('accounting.aging.31to60', '31-60 days'), amount: 33500, percentage: 42 },
              { label: t('accounting.aging.61to90', '61-90 days'), amount: 12000, percentage: 15 },
              { label: t('accounting.aging.over90', 'Over 90 days'), amount: 15000, percentage: 19 },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-[#0B1F3B] dark:text-white">{item.label}</span>
                  <span className="text-sm font-bold text-[#0B1F3B] dark:text-white">{t('common.sar', 'SAR')} {item.amount.toLocaleString()}</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.relatedModules', 'Related Modules')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.navigateToRelatedPages', 'Navigate to related pages')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/invoices">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-invoices">
                <FileText className="h-4 w-4 mr-2" />
                {t('accounting.invoices', 'Invoices')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-customers">
                <Users className="h-4 w-4 mr-2" />
                {t('accounting.customers', 'Customers')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/general-ledger">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-general-ledger">
                <FileText className="h-4 w-4 mr-2" />
                {t('accounting.generalLedger', 'General Ledger')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/accounts-payable">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-accounts-payable">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('accounting.accountsPayable', 'Accounts Payable')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: "receivables", label: t('accounting.receivables', 'Receivables'), icon: Users, content: receivablesTab },
    { id: "overview", label: t('common.overview', 'Overview'), icon: DollarSign, content: overviewTab },
  ];

  return (
    <TabsPageLayout
      title={t('accounting.accountsReceivableTitle', 'Accounts Receivable')}
      description={t('accounting.accountsReceivableDescription', 'Manage customer invoices and collections')}
      icon={Users}
      tabs={tabs}
      defaultTab="receivables"
    />
  );
}
