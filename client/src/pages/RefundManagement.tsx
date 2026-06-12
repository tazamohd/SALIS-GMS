import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, CheckCircle, XCircle, DollarSign, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { StandardPageLayout } from "@/components/layouts";

const refundSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.string().min(1, "Amount is required"),
  reason: z.string().min(1, "Reason is required"),
  refundMethod: z.enum(["original", "store_credit", "cash", "check"]),
  notes: z.string().optional(),
});

type RefundFormData = z.infer<typeof refundSchema>;

export default function RefundManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any | null>(null);

  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ["/api/garages"],
  });

  useEffect(() => {
    if (!selectedGarageId && garages.length > 0) {
      setSelectedGarageId(garages[0].id);
    }
  }, [garages, selectedGarageId]);

  const { data: refunds = [], isLoading } = useQuery<any[]>({
    queryKey: [
      "/api/refunds",
      { garageId: selectedGarageId, status: statusFilter !== "all" ? statusFilter : undefined },
    ],
    enabled: !!selectedGarageId,
  });

  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
  });

  const refundForm = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      invoiceId: "",
      amount: "",
      reason: "",
      refundMethod: "original",
      notes: "",
    },
  });

  const createRefundMutation = useMutation({
    mutationFn: async (data: RefundFormData) => {
      const payload = {
        ...data,
        garageId: selectedGarageId,
        amount: parseFloat(data.amount),
        status: "pending",
      };
      return apiRequest("POST", "/api/refunds", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/refunds')
      });
      toast({ title: "Refund request created successfully" });
      setRefundDialogOpen(false);
      refundForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create refund request", variant: "destructive" });
    },
  });

  const approveRefundMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/refunds/${id}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/refunds')
      });
      toast({ title: "Refund approved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve refund", variant: "destructive" });
    },
  });

  const processRefundMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/refunds/${id}/process`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/refunds')
      });
      toast({ title: "Refund processed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process refund", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "outline", icon: AlertTriangle, className: "border-[#F97316] text-[#F97316]" },
      approved: { variant: "default", icon: CheckCircle, className: "bg-[#0A5ED7] text-white" },
      processed: { variant: "default", icon: CheckCircle, className: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" },
      rejected: { variant: "destructive", icon: XCircle, className: "bg-red-500 text-white" },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <StandardPageLayout
      title={t('payments.refunds.title', 'Refund Management')}
      description={t('payments.refunds.description', 'Manage customer refunds with approval workflow')}
      icon={DollarSign}
    >
      <div className="flex gap-2 items-center mb-6">
        <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
          <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-garage">
            <SelectValue placeholder="Select garage" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            {garages.map((garage) => (
              <SelectItem key={garage.id} value={garage.id} data-testid={`select-garage-${garage.id}`}>
                {garage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => refundForm.reset()} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90" data-testid="button-create-refund">
                <Plus className="h-4 w-4 mr-2" />
                {t('payments.refunds.createRefund', 'Create Refund')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="dialog-refund-form">
              <DialogHeader>
                <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('payments.refunds.createRefundRequest', 'Create Refund Request')}</DialogTitle>
                <DialogDescription className="text-[#64748B]">{t('payments.refunds.initiateRefund', 'Initiate a refund for a customer invoice')}</DialogDescription>
              </DialogHeader>
              <Form {...refundForm}>
                <form onSubmit={refundForm.handleSubmit((data) => createRefundMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={refundForm.control}
                    name="invoiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('invoices.invoice', 'Invoice')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-refund-invoice">
                              <SelectValue placeholder={t('payments.refunds.selectInvoice', 'Select invoice')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                            {invoices.map((invoice) => (
                              <SelectItem key={invoice.id} value={invoice.id} data-testid={`select-invoice-${invoice.id}`}>
                                {t('invoices.invoice', 'Invoice')} #{invoice.id.slice(0, 8)} - ${invoice.totalAmount}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={refundForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('payments.refunds.refundAmount', 'Refund Amount')}</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-refund-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={refundForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('payments.refunds.reason', 'Reason')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('payments.refunds.reasonPlaceholder', 'e.g., Customer dissatisfaction')} {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-refund-reason" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={refundForm.control}
                    name="refundMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('payments.refunds.refundMethod', 'Refund Method')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-refund-method">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                            <SelectItem value="original" data-testid="select-method-original">{t('payments.refunds.methods.original', 'Original Payment Method')}</SelectItem>
                            <SelectItem value="store_credit" data-testid="select-method-credit">{t('payments.refunds.methods.storeCredit', 'Store Credit')}</SelectItem>
                            <SelectItem value="cash" data-testid="select-method-cash">{t('payments.methods.cash', 'Cash')}</SelectItem>
                            <SelectItem value="check" data-testid="select-method-check">{t('payments.methods.check', 'Check')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={refundForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">{t('payments.refunds.notesOptional', 'Notes (Optional)')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('payments.refunds.notesPlaceholder', 'Additional notes...')} {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="textarea-refund-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createRefundMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90" data-testid="button-submit-refund">
                      {createRefundMutation.isPending ? t('common.creating', 'Creating...') : t('payments.refunds.createRefund', 'Create Refund')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('payments.refunds.refundRequests', 'Refund Requests')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('payments.refunds.reviewAndProcess', 'Review and process customer refund requests')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#64748B]">{t('common.loading', 'Loading...')}</div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]" data-testid="text-no-refunds">
              {t('payments.refunds.noRefundsFound', 'No refund requests found')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('invoices.invoice', 'Invoice')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.amount', 'Amount')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('payments.refunds.reason', 'Reason')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('payments.refunds.method', 'Method')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('payments.refunds.requested', 'Requested')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => (
                  <TableRow key={refund.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-refund-${refund.id}`}>
                    <TableCell className="font-mono text-sm text-[#0B1F3B] dark:text-white" data-testid={`text-refund-invoice-${refund.id}`}>
                      #{refund.invoiceId.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-refund-amount-${refund.id}`}>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-[#0A5ED7]" />
                        {parseFloat(refund.amount).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-[#64748B]" data-testid={`text-refund-reason-${refund.id}`}>{refund.reason}</TableCell>
                    <TableCell className="text-[#64748B] capitalize" data-testid={`text-refund-method-${refund.id}`}>
                      {refund.refundMethod.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]" data-testid={`text-refund-date-${refund.id}`}>
                      {format(new Date(refund.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell data-testid={`badge-refund-status-${refund.id}`}>
                      {getStatusBadge(refund.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {refund.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => approveRefundMutation.mutate(refund.id)}
                            disabled={approveRefundMutation.isPending}
                            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90"
                            data-testid={`button-approve-refund-${refund.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t('payments.refunds.approve', 'Approve')}
                          </Button>
                        )}
                        {refund.status === "approved" && (
                          <Button
                            size="sm"
                            onClick={() => processRefundMutation.mutate(refund.id)}
                            disabled={processRefundMutation.isPending}
                            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90"
                            data-testid={`button-process-refund-${refund.id}`}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            {t('payments.refunds.process', 'Process')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
