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
  Building2,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Download,
  Plus,
  FileText,
  ExternalLink,
  Calendar,
  TrendingUp,
  CreditCard,
  Eye,
  Send,
} from "lucide-react";

const paymentSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.string().min(1, "Amount is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  reference: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const payables = [
  {
    id: "AP-001",
    vendorId: "VND-001",
    vendorName: "AutoParts Supplier Co",
    invoiceNumber: "VND-INV-2024-0156",
    invoiceDate: "2024-01-20",
    dueDate: "2024-02-19",
    originalAmount: 28500,
    paidAmount: 0,
    balanceDue: 28500,
    daysUntilDue: 18,
    status: "Current",
    paymentTerms: "Net 30",
  },
  {
    id: "AP-002",
    vendorId: "VND-002",
    vendorName: "Saudi Electricity Company",
    invoiceNumber: "SEC-2024-0125",
    invoiceDate: "2024-01-25",
    dueDate: "2024-02-10",
    originalAmount: 4500,
    paidAmount: 0,
    balanceDue: 4500,
    daysUntilDue: 9,
    status: "Due Soon",
    paymentTerms: "Net 15",
  },
  {
    id: "AP-003",
    vendorId: "VND-003",
    vendorName: "Premium Oil Distributors",
    invoiceNumber: "POD-2024-0089",
    invoiceDate: "2024-01-15",
    dueDate: "2024-01-30",
    originalAmount: 15000,
    paidAmount: 0,
    balanceDue: 15000,
    daysUntilDue: -2,
    status: "Overdue",
    paymentTerms: "Net 15",
  },
  {
    id: "AP-004",
    vendorId: "VND-004",
    vendorName: "Equipment Leasing Corp",
    invoiceNumber: "ELC-2024-0012",
    invoiceDate: "2024-01-01",
    dueDate: "2024-01-31",
    originalAmount: 8500,
    paidAmount: 0,
    balanceDue: 8500,
    daysUntilDue: -1,
    status: "Overdue",
    paymentTerms: "Net 30",
  },
  {
    id: "AP-005",
    vendorId: "VND-005",
    vendorName: "Office Supplies Ltd",
    invoiceNumber: "OSL-2024-0045",
    invoiceDate: "2024-01-18",
    dueDate: "2024-02-17",
    originalAmount: 2500,
    paidAmount: 1000,
    balanceDue: 1500,
    daysUntilDue: 16,
    status: "Current",
    paymentTerms: "Net 30",
  },
  {
    id: "AP-006",
    vendorId: "VND-006",
    vendorName: "Insurance Provider SA",
    invoiceNumber: "IP-2024-Q1",
    invoiceDate: "2024-01-01",
    dueDate: "2024-01-15",
    originalAmount: 14000,
    paidAmount: 14000,
    balanceDue: 0,
    daysUntilDue: 0,
    status: "Paid",
    paymentTerms: "Net 15",
  },
];

const vendors = [
  { id: "VND-001", name: "AutoParts Supplier Co" },
  { id: "VND-002", name: "Saudi Electricity Company" },
  { id: "VND-003", name: "Premium Oil Distributors" },
  { id: "VND-004", name: "Equipment Leasing Corp" },
  { id: "VND-005", name: "Office Supplies Ltd" },
  { id: "VND-006", name: "Insurance Provider SA" },
];

export default function AccountsPayable() {
  const { t } = useTranslation();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      vendorId: "",
      invoiceId: "",
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      reference: "",
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    console.log("Make payment:", data);
    setIsPaymentDialogOpen(false);
    form.reset();
  };

  const unpaidPayables = payables.filter((p) => p.status !== "Paid");
  const totalPayables = unpaidPayables.reduce((sum, p) => sum + p.balanceDue, 0);
  const currentPayables = unpaidPayables.filter((p) => p.status === "Current").reduce((sum, p) => sum + p.balanceDue, 0);
  const overduePayables = unpaidPayables.filter((p) => p.status === "Overdue").reduce((sum, p) => sum + p.balanceDue, 0);
  const dueSoonPayables = unpaidPayables.filter((p) => p.status === "Due Soon").reduce((sum, p) => sum + p.balanceDue, 0);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Current: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      "Due Soon": "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      Overdue: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      Paid: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    };
    return styles[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Current: t('accounting.status.current', 'Current'),
      "Due Soon": t('accounting.status.dueSoon', 'Due Soon'),
      Overdue: t('accounting.status.overdue', 'Overdue'),
      Paid: t('accounting.status.paid', 'Paid'),
    };
    return labels[status] || status;
  };

  const payablesTab = (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('accounting.searchVendorsOrInvoices', 'Search vendors or invoices...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
              <SelectValue placeholder={t('common.status', 'Status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('accounting.allStatus', 'All Status')}</SelectItem>
              <SelectItem value="current">{t('accounting.status.current', 'Current')}</SelectItem>
              <SelectItem value="due-soon">{t('accounting.status.dueSoon', 'Due Soon')}</SelectItem>
              <SelectItem value="overdue">{t('accounting.status.overdue', 'Overdue')}</SelectItem>
              <SelectItem value="paid">{t('accounting.status.paid', 'Paid')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export', 'Export')}
          </Button>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-make-payment">
                <Plus className="h-4 w-4 mr-2" />
                {t('accounting.makePayment', 'Make Payment')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('accounting.makePayment', 'Make Payment')}</DialogTitle>
                <DialogDescription>
                  {t('accounting.recordPaymentToVendor', 'Record a payment to a vendor')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('accounting.vendor', 'Vendor')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-vendor">
                              <SelectValue placeholder={t('accounting.selectVendor', 'Select vendor')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
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
                        <FormLabel>{t('accounting.invoice', 'Invoice')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('accounting.invoicePlaceholder', 'e.g., VND-INV-2024-0156')} {...field} data-testid="input-invoice" />
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
                          <FormLabel>{t('accounting.amountSAR', 'Amount (SAR)')}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} data-testid="input-amount" />
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
                          <FormLabel>{t('accounting.paymentDate', 'Payment Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-payment-date" />
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
                        <FormLabel>{t('accounting.paymentMethod', 'Payment Method')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-payment-method">
                              <SelectValue placeholder={t('accounting.selectMethod', 'Select method')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bank_transfer">{t('accounting.bankTransfer', 'Bank Transfer')}</SelectItem>
                            <SelectItem value="check">{t('accounting.check', 'Check')}</SelectItem>
                            <SelectItem value="cash">{t('accounting.cash', 'Cash')}</SelectItem>
                            <SelectItem value="wire">{t('accounting.wireTransfer', 'Wire Transfer')}</SelectItem>
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
                        <FormLabel>{t('accounting.referenceOptional', 'Reference (Optional)')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('accounting.referencePlaceholder', 'e.g., Transfer #12345')} {...field} data-testid="input-reference" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="submit" data-testid="button-save-payment">
                      {t('accounting.makePayment', 'Make Payment')}
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
                <TableHead>{t('accounting.vendor', 'Vendor')}</TableHead>
                <TableHead>{t('accounting.invoice', 'Invoice')}</TableHead>
                <TableHead>{t('accounting.dueDate', 'Due Date')}</TableHead>
                <TableHead>{t('accounting.terms', 'Terms')}</TableHead>
                <TableHead className="text-right">{t('accounting.original', 'Original')}</TableHead>
                <TableHead className="text-right">{t('accounting.paid', 'Paid')}</TableHead>
                <TableHead className="text-right">{t('accounting.balance', 'Balance')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead>{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payables.map((ap) => (
                <TableRow key={ap.id} data-testid={`row-ap-${ap.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ap.vendorName}</p>
                      <p className="text-xs text-muted-foreground">{ap.vendorId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {ap.invoiceNumber}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{ap.dueDate}</p>
                      {ap.daysUntilDue < 0 && (
                        <p className="text-xs text-red-600">{t('accounting.daysOverdue', '{{days}} days overdue', { days: Math.abs(ap.daysUntilDue) })}</p>
                      )}
                      {ap.daysUntilDue > 0 && ap.daysUntilDue <= 7 && (
                        <p className="text-xs text-yellow-600">{t('accounting.dueInDays', 'Due in {{days}} days', { days: ap.daysUntilDue })}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ap.paymentTerms}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {ap.originalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-600">
                    {ap.paidAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {ap.balanceDue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(ap.status)}>{getStatusLabel(ap.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" data-testid={`button-view-${ap.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {ap.status !== "Paid" && (
                        <Button variant="ghost" size="sm" data-testid={`button-pay-${ap.id}`}>
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      )}
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
        <Card data-testid="card-total-payables">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('accounting.totalPayables', 'Total Payables')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{t('common.sar', 'SAR')} {totalPayables.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t('accounting.invoicesCount', '{{count}} invoices', { count: unpaidPayables.length })}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-current">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {t('accounting.status.current', 'Current')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {t('common.sar', 'SAR')} {currentPayables.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{t('accounting.notYetDue', 'Not yet due')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-due-soon">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              {t('accounting.status.dueSoon', 'Due Soon')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {t('common.sar', 'SAR')} {dueSoonPayables.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{t('accounting.within7Days', 'Within 7 days')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-overdue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              {t('accounting.status.overdue', 'Overdue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {t('common.sar', 'SAR')} {overduePayables.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{t('accounting.requiresAttention', 'Requires attention')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('accounting.paymentSchedule', 'Payment Schedule')}</CardTitle>
          <CardDescription>{t('accounting.upcomingPaymentsByDueDate', 'Upcoming payments by due date')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: t('accounting.status.overdue', 'Overdue'), amount: overduePayables, color: "bg-red-500" },
              { label: t('accounting.dueThisWeek', 'Due This Week'), amount: dueSoonPayables, color: "bg-yellow-500" },
              { label: t('accounting.dueThisMonth', 'Due This Month'), amount: currentPayables, color: "bg-green-500" },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-bold">{t('common.sar', 'SAR')} {item.amount.toLocaleString()}</span>
                </div>
                <Progress value={(item.amount / totalPayables) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('accounting.relatedModules', 'Related Modules')}</CardTitle>
          <CardDescription>{t('accounting.navigateToRelatedPages', 'Navigate to related pages')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/vendor-supplier-portal">
              <Button variant="outline" className="w-full justify-start" data-testid="link-vendors">
                <Building2 className="h-4 w-4 mr-2" />
                {t('accounting.vendors', 'Vendors')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/general-ledger">
              <Button variant="outline" className="w-full justify-start" data-testid="link-general-ledger">
                <FileText className="h-4 w-4 mr-2" />
                {t('accounting.generalLedger', 'General Ledger')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/accounts-receivable">
              <Button variant="outline" className="w-full justify-start" data-testid="link-accounts-receivable">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('accounting.accountsReceivable', 'Accounts Receivable')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/cash-flow-statement">
              <Button variant="outline" className="w-full justify-start" data-testid="link-cash-flow">
                <Calendar className="h-4 w-4 mr-2" />
                {t('accounting.cashFlow', 'Cash Flow')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const scheduledTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('accounting.paymentQueue', 'Payment Queue')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('accounting.prioritizedPaymentsList', 'Prioritized list of payments requiring action')}
          </p>
        </div>
        <Button data-testid="button-process-batch">
          <Send className="h-4 w-4 mr-2" />
          {t('accounting.processBatchPayment', 'Process Batch Payment')}
        </Button>
      </div>

      <div className="space-y-4">
        {payables
          .filter((p) => p.status !== "Paid")
          .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
          .map((ap, index) => (
            <Card key={ap.id} data-testid={`card-scheduled-${ap.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{ap.vendorName}</p>
                      <p className="text-sm text-muted-foreground">
                        {ap.invoiceNumber} • {t('accounting.due', 'Due')}: {ap.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold font-mono">{t('common.sar', 'SAR')} {ap.balanceDue.toLocaleString()}</p>
                      <Badge className={getStatusBadge(ap.status)}>{getStatusLabel(ap.status)}</Badge>
                    </div>
                    <Button size="sm" data-testid={`button-pay-now-${ap.id}`}>
                      {t('accounting.payNow', 'Pay Now')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  const tabs = [
    { id: "payables", label: t('accounting.payables', 'Payables'), icon: FileText, content: payablesTab },
    { id: "overview", label: t('accounting.overview', 'Overview'), icon: TrendingUp, content: overviewTab },
    { id: "scheduled", label: t('accounting.scheduled', 'Scheduled'), icon: Calendar, content: scheduledTab },
  ];

  return (
    <TabsPageLayout
      title={t('accounting.accountsPayableTitle', 'Accounts Payable - الذمم الدائنة')}
      description={t('accounting.accountsPayableDescription', 'Manage vendor invoices and payments')}
      icon={CreditCard}
      tabs={tabs}
      defaultTab="payables"
    />
  );
}
