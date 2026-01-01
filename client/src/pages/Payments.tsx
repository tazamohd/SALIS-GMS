import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardTablePage } from "@/components/layouts";
import { DollarSign, CheckCircle, Download, Plus, CreditCard, Banknote, Building2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@shared/schema";

type PaymentWithDetails = {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: string;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  invoiceNumber: string;
  customerName: string | null;
};

const paymentFormSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.string().min(1, "Amount is required"),
  paymentMethod: z.enum(["cash", "card", "transfer", "check"]),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

function RecordPaymentDialog({ invoices }: { invoices: Invoice[] }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceId: "",
      amount: "",
      paymentMethod: "cash",
      referenceNumber: "",
      notes: "",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof paymentFormSchema>) => {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          invoiceId: data.invoiceId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber || null,
          notes: data.notes || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to record payment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: t('payments.paymentRecorded', 'Payment Recorded'),
        description: t('payments.paymentRecordedDescription', 'The payment has been successfully recorded'),
      });
      form.reset();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('payments.paymentRecordError', 'Failed to record payment'),
        variant: "destructive",
      });
    },
  });

  const selectedInvoice = invoices.find(i => i.id === form.watch("invoiceId"));

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card": return <CreditCard className="h-4 w-4" />;
      case "cash": return <Banknote className="h-4 w-4" />;
      case "transfer": return <Building2 className="h-4 w-4" />;
      case "check": return <FileText className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
          data-testid="button-record-payment"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('payments.recordPayment', 'Record Payment')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <DialogHeader>
          <DialogTitle className="text-[#0B1F3B] dark:text-white">
            {t('payments.recordPayment', 'Record Payment')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createPaymentMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('payments.selectInvoice', 'Select Invoice')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-[#E2E8F0] dark:border-[#232A36] dark:bg-[#1A1F2B]" data-testid="select-invoice">
                        <SelectValue placeholder={t('payments.selectInvoicePlaceholder', 'Select an invoice')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                      {invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').map(invoice => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNumber} - ${parseFloat(invoice.balanceAmount).toFixed(2)} {t('payments.remaining', 'remaining')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedInvoice && (
              <div className="p-3 bg-[#F1F5F9] dark:bg-[#1A1F2B] rounded-lg text-sm">
                <p className="text-[#64748B]">{t('payments.invoiceTotal', 'Invoice Total')}: <span className="font-semibold text-[#0B1F3B] dark:text-white">${parseFloat(selectedInvoice.totalAmount).toFixed(2)}</span></p>
                <p className="text-[#64748B]">{t('payments.balanceDue', 'Balance Due')}: <span className="font-semibold text-[#F97316]">${parseFloat(selectedInvoice.balanceAmount).toFixed(2)}</span></p>
              </div>
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.amount', 'Amount')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      className="border-[#E2E8F0] dark:border-[#232A36] dark:bg-[#1A1F2B]" 
                      data-testid="input-amount"
                      {...field} 
                    />
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
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('payments.paymentMethod', 'Payment Method')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-[#E2E8F0] dark:border-[#232A36] dark:bg-[#1A1F2B]" data-testid="select-method">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          {t('payments.cash', 'Cash')}
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {t('payments.card', 'Card')}
                        </div>
                      </SelectItem>
                      <SelectItem value="transfer">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {t('payments.bankTransfer', 'Bank Transfer')}
                        </div>
                      </SelectItem>
                      <SelectItem value="check">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {t('payments.check', 'Check')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('payments.referenceNumber', 'Reference Number')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('payments.referenceNumberPlaceholder', 'Transaction ID, Check #, etc.')} 
                      className="border-[#E2E8F0] dark:border-[#232A36] dark:bg-[#1A1F2B]" 
                      data-testid="input-reference"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('payments.notesPlaceholder', 'Optional payment notes...')} 
                      className="border-[#E2E8F0] dark:border-[#232A36] dark:bg-[#1A1F2B]" 
                      data-testid="input-notes"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={createPaymentMutation.isPending}
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
                data-testid="button-submit-payment"
              >
                {createPaymentMutation.isPending ? t('common.saving', 'Saving...') : t('payments.recordPayment', 'Record Payment')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Payments() {
  const { t } = useTranslation();
  const [methodFilter, setMethodFilter] = useState<string>("all");
  
  const { data: payments = [], isLoading } = useQuery<PaymentWithDetails[]>({
    queryKey: ["/api/payments", methodFilter !== "all" ? `?method=${methodFilter}` : ""],
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card": return <CreditCard className="h-4 w-4" />;
      case "cash": return <Banknote className="h-4 w-4" />;
      case "transfer": return <Building2 className="h-4 w-4" />;
      case "check": return <FileText className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const columns: Column<PaymentWithDetails>[] = [
    {
      key: "invoiceNumber",
      label: t('payments.invoiceNumber', 'Invoice #'),
      render: (payment) => (
        <span className="font-mono text-sm text-[#0B1F3B] dark:text-white">{payment.invoiceNumber}</span>
      ),
    },
    {
      key: "customerName",
      label: t('payments.customer', 'Customer'),
      render: (payment) => (
        <div>
          <p className="font-medium text-[#0B1F3B] dark:text-white">{payment.customerName || t('common.unknown', 'Unknown')}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: t('common.amount', 'Amount'),
      render: (payment) => (
        <span className="font-semibold text-[#0B1F3B] dark:text-white">${parseFloat(payment.amount).toFixed(2)}</span>
      ),
    },
    {
      key: "paymentMethod",
      label: t('payments.paymentMethod', 'Payment Method'),
      render: (payment) => (
        <Badge variant="outline" className="capitalize border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] flex items-center gap-1 w-fit">
          {getMethodIcon(payment.paymentMethod)}
          {payment.paymentMethod}
        </Badge>
      ),
    },
    {
      key: "status",
      label: t('common.status', 'Status'),
      render: () => (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('common.completed', 'Completed')}
        </Badge>
      ),
    },
    {
      key: "referenceNumber",
      label: t('payments.referenceNumber', 'Reference #'),
      render: (payment) =>
        payment.referenceNumber ? (
          <span className="font-mono text-xs text-[#64748B]">{payment.referenceNumber}</span>
        ) : (
          <span className="text-[#64748B]">-</span>
        ),
    },
    {
      key: "paymentDate",
      label: t('payments.paidDate', 'Paid Date'),
      render: (payment) => (
        <span className="text-[#64748B]">{new Date(payment.paymentDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: "actions",
      label: t('common.actions', 'Actions'),
      render: (payment) => (
        <Button
          size="sm"
          variant="outline"
          className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-gradient-to-r hover:from-[#0A5ED7] hover:to-[#0BB3FF] hover:text-white hover:border-transparent"
          data-testid={`button-receipt-${payment.id}`}
        >
          <Download className="h-4 w-4 mr-1" />
          {t('payments.receipt', 'Receipt')}
        </Button>
      ),
    },
  ];

  const filters = [
    {
      id: "method",
      label: t('payments.method', 'Method'),
      options: [
        { value: "all", label: t('payments.allMethods', 'All Methods') },
        { value: "card", label: t('payments.card', 'Card') },
        { value: "cash", label: t('payments.cash', 'Cash') },
        { value: "transfer", label: t('payments.bankTransfer', 'Bank Transfer') },
        { value: "check", label: t('payments.check', 'Check') },
      ],
      defaultValue: methodFilter,
    },
  ];

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  const paymentsByMethod = payments.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + parseFloat(p.amount);
    return acc;
  }, {} as Record<string, number>);

  const unpaidInvoicesAmount = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + parseFloat(i.balanceAmount), 0);

  return (
    <StandardTablePage
      title={t('payments.title', 'Payments')}
      description={t('payments.description', 'Track and manage all payment transactions')}
      icon={DollarSign}
      data={payments}
      isLoading={isLoading}
      columns={columns}
      searchPlaceholder={t('payments.searchPayments', 'Search payments...')}
      filters={filters}
      filterValues={{ method: methodFilter }}
      onFilterChange={(id, value) => {
        if (id === "method") setMethodFilter(value);
      }}
      additionalContent={
        <>
          <div className="flex justify-end mb-4">
            <RecordPaymentDialog invoices={invoices} />
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
            <p className="text-sm text-[#64748B]">{t('payments.totalReceived', 'Total Received')}</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] bg-clip-text text-transparent">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
            <p className="text-sm text-[#64748B]">{t('payments.outstandingBalance', 'Outstanding Balance')}</p>
            <p className="text-2xl font-bold text-[#F97316]">${unpaidInvoicesAmount.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
            <p className="text-sm text-[#64748B]">{t('payments.totalTransactions', 'Total Transactions')}</p>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{payments.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
            <p className="text-sm text-[#64748B]">{t('payments.cashPayments', 'Cash Payments')}</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] bg-clip-text text-transparent">
              ${(paymentsByMethod['cash'] || 0).toFixed(2)}
            </p>
          </div>
        </div>
        </>
      }
      emptyState={{
        icon: DollarSign,
        title: t('payments.noPaymentsFound', 'No payments found'),
        description: t('payments.noPaymentsDescription', 'Payment transactions will appear here once customers make payments'),
        actions: [
          {
            label: t('payments.recordPayment', 'Record Payment'),
            onClick: () => {},
            icon: Plus,
          },
        ],
      }}
    />
  );
}
