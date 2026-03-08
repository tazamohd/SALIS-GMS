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
      Current: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200",
      "Due Soon": "bg-[#F97316]/20 text-[#F97316] dark:bg-[#F97316]/30 dark:text-orange-200",
      Overdue: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200",
      Paid: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200",
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input
              placeholder={t('accounting.searchVendorsOrInvoices', 'Search vendors or invoices...')}
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
              <SelectItem value="due-soon">{t('accounting.status.dueSoon', 'Due Soon')}</SelectItem>
              <SelectItem value="overdue">{t('accounting.status.overdue', 'Overdue')}</SelectItem>
              <SelectItem value="paid">{t('accounting.status.paid', 'Paid')}</SelectItem>
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
              <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-make-payment">
                <Plus className="h-4 w-4 mr-2" />
                {t('accounting.makePayment', 'Make Payment')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <DialogHeader>
                <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.makePayment', 'Make Payment')}</DialogTitle>
                <DialogDescription className="text-[#64748B]">
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
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('accounting.vendor', 'Vendor')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-vendor">
                              <SelectValue placeholder={t('accounting.selectVendor', 'Select vendor')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('accounting.invoice', 'Invoice')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('accounting.invoicePlaceholder', 'e.g., VND-INV-2024-0156')} {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-invoice" />
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
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('accounting.referenceOptional', 'Reference (Optional)')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('accounting.referencePlaceholder', 'e.g., Transfer #12345')} {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-reference" />
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
                      {t('accounting.makePayment', 'Make Payment')}
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
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('accounting.vendor', 'Vendor')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('accounting.invoice', 'Invoice')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('accounting.dueDate', 'Due Date')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('accounting.terms', 'Terms')}</TableHead>
                <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('accounting.original', 'Original')}</TableHead>
                <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('accounting.paid', 'Paid')}</TableHead>
                <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('accounting.balance', 'Balance')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payables.map((ap) => (
                <TableRow key={ap.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-ap-${ap.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{ap.vendorName}</p>
                      <p className="text-xs text-[#64748B]">{ap.vendorId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                      {ap.invoiceNumber}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-[#0B1F3B] dark:text-white">{ap.dueDate}</p>
                      {ap.daysUntilDue < 0 && (
                        <p className="text-xs text-red-600 dark:text-red-400">{t('accounting.daysOverdue', '{{days}} days overdue', { days: Math.abs(ap.daysUntilDue) })}</p>
                      )}
                      {ap.daysUntilDue > 0 && ap.daysUntilDue <= 7 && (
                        <p className="text-xs text-[#F97316]">{t('accounting.dueInDays', 'Due in {{days}} days', { days: ap.daysUntilDue })}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#64748B]">
                    {ap.paymentTerms}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[#0B1F3B] dark:text-white">
                    {ap.originalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                    {ap.paidAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-[#0B1F3B] dark:text-white">
                    {ap.balanceDue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(ap.status)}>{getStatusLabel(ap.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white" data-testid={`button-view-${ap.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {ap.status !== "Paid" && (
                        <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white" data-testid={`button-pay-${ap.id}`}>
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
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-payables">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('accounting.totalPayables', 'Total Payables')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t('common.sar', 'SAR')} {totalPayables.toLocaleString()}</p>
            <p className="text-xs text-[#64748B]">{t('accounting.invoicesCount', '{{count}} invoices', { count: unpaidPayables.length })}</p>
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
              {t('common.sar', 'SAR')} {currentPayables.toLocaleString()}
            </p>
            <p className="text-xs text-[#64748B]">{t('accounting.notYetDue', 'Not yet due')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-due-soon">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#F97316]" />
              {t('accounting.status.dueSoon', 'Due Soon')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F97316]">
              {t('common.sar', 'SAR')} {dueSoonPayables.toLocaleString()}
            </p>
            <p className="text-xs text-[#64748B]">{t('accounting.within7Days', 'Within 7 days')}</p>
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
              {t('common.sar', 'SAR')} {overduePayables.toLocaleString()}
            </p>
            <p className="text-xs text-[#64748B]">{t('accounting.requiresAttention', 'Requires attention')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.paymentSchedule', 'Payment Schedule')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.upcomingPaymentsByDueDate', 'Upcoming payments by due date')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: t('accounting.status.overdue', 'Overdue'), amount: overduePayables, color: "bg-red-500" },
              { label: t('accounting.dueThisWeek', 'Due This Week'), amount: dueSoonPayables, color: "bg-[#F97316]" },
              { label: t('accounting.dueThisMonth', 'Due This Month'), amount: currentPayables, color: "bg-green-500" },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-[#0B1F3B] dark:text-white">{item.label}</span>
                  <span className="text-sm font-bold text-[#0B1F3B] dark:text-white">{t('common.sar', 'SAR')} {item.amount.toLocaleString()}</span>
                </div>
                <Progress value={(item.amount / totalPayables) * 100} className="h-2" />
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
            <Link href="/vendor-supplier-portal">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-vendors">
                <Building2 className="h-4 w-4 mr-2" />
                {t('accounting.vendors', 'Vendors')}
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
            <Link href="/accounts-receivable">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-accounts-receivable">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('accounting.accountsReceivable', 'Accounts Receivable')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/cash-flow-statement">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-cash-flow">
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

  const tabs = [
    { id: "payables", label: t('accounting.payables', 'Payables'), icon: Building2, content: payablesTab },
    { id: "overview", label: t('common.overview', 'Overview'), icon: DollarSign, content: overviewTab },
  ];

  return (
    <TabsPageLayout
      title={t('accounting.accountsPayableTitle', 'Accounts Payable - الحسابات الدائنة')}
      description={t('accounting.accountsPayableDescription', 'Manage vendor invoices and payments')}
      icon={Building2}
      tabs={tabs}
      defaultTab="payables"
    />
  );
}
