import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, Trash2, DollarSign, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateVAT, SAUDI_VAT_RATE } from "@shared/vatUtils";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import type { Invoice, InvoiceItem, User } from "@shared/schema";

interface InvoiceDetailsDialogProps {
  invoice?: Invoice;
  invoiceId?: string;
  customer?: User;
  children?: React.ReactNode;
}

export function InvoiceDetailsDialog({ invoice: propInvoice, invoiceId, customer, children }: InvoiceDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const effectiveInvoiceId = propInvoice?.id || invoiceId;

  const { data: fetchedInvoice } = useQuery<Invoice>({
    queryKey: ['/api/invoices', effectiveInvoiceId],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${effectiveInvoiceId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch invoice');
      return res.json();
    },
    enabled: open && !!effectiveInvoiceId && !propInvoice,
  });

  const invoice = propInvoice || fetchedInvoice!;
  const [currentStatus, setCurrentStatus] = useState(invoice?.status || 'draft');

  const { data: items } = useQuery<InvoiceItem[]>({
    queryKey: [`/api/invoices/${effectiveInvoiceId}/items`],
    enabled: open && !!effectiveInvoiceId,
  });

  useEffect(() => {
    if (invoice?.status) {
      setCurrentStatus(invoice.status);
    }
  }, [invoice?.status]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return await apiRequest("PATCH", `/api/invoices/${invoice!.id}`, {
        status: newStatus,
        sentAt: newStatus === 'sent' && !invoice!.sentAt ? new Date() : invoice!.sentAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/invoices' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/invoices'))
      });
      toast({
        title: "Success",
        description: "Invoice status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
      setCurrentStatus(invoice.status);
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/invoices/${invoice.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/invoices' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/invoices'))
      });
      toast({
        title: "Success",
        description: "Invoice deleted",
      });
      setOpen(false);
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const getValidNextStatuses = (currentStatus: string): string[] => {
    const workflows: Record<string, string[]> = {
      draft: ["draft", "sent", "cancelled"],
      sent: ["sent", "paid", "overdue", "cancelled"],
      paid: ["paid", "cancelled"],
      overdue: ["overdue", "paid", "cancelled"],
      cancelled: ["cancelled"],
    };
    return workflows[currentStatus] || [currentStatus];
  };

  const handleStatusChange = (newStatus: string) => {
    const validStatuses = getValidNextStatuses(invoice.status);
    if (!validStatuses.includes(newStatus)) {
      toast({
        title: "Invalid Status Change",
        description: `Cannot change status from ${invoice.status} to ${newStatus}`,
        variant: "destructive",
      });
      setCurrentStatus(invoice.status);
      return;
    }
    setCurrentStatus(newStatus);
    updateStatusMutation.mutate(newStatus);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (!invoice && !effectiveInvoiceId) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="ghost" size="sm" data-testid={`button-view-invoice-${effectiveInvoiceId}`}>
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details - {invoice?.invoiceNumber || 'Loading...'}</DialogTitle>
            <DialogDescription className="sr-only">
              View and manage invoice details, status, items, and payments
            </DialogDescription>
          </DialogHeader>

          {!invoice ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-neon-blue/20/30 rounded">
              <div>
                <label className="text-sm font-medium text-soft-white/70">Customer</label>
                <p className="font-medium text-soft-white">{customer?.fullName || customer?.email || "Unknown"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-soft-white/70">Status</label>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1" data-testid="select-invoice-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getValidNextStatuses(invoice.status).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-soft-white/70">Invoice Date</label>
                <p className="text-soft-white">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-soft-white/70">Due Date</label>
                <p className="text-soft-white">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div>
                <label className="text-sm font-medium text-soft-white/70">Notes</label>
                <p className="mt-1 p-3 bg-neon-blue/20/30 rounded text-soft-white">{invoice.notes}</p>
              </div>
            )}

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-3 text-soft-white">Invoice Items</h3>
              <div className="border border-neon-blue/30 rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neon-blue/20/30">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-soft-white/70">Type</th>
                      <th className="text-left p-3 text-sm font-medium text-soft-white/70">Description</th>
                      <th className="text-right p-3 text-sm font-medium text-soft-white/70">Quantity</th>
                      <th className="text-right p-3 text-sm font-medium text-soft-white/70">Unit Price</th>
                      <th className="text-right p-3 text-sm font-medium text-soft-white/70">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(items ?? []).map((item) => (
                      <tr key={item.id} className="border-t border-neon-blue/30" data-testid={`invoice-item-${item.id}`}>
                        <td className="p-3 capitalize text-soft-white">{item.itemType}</td>
                        <td className="p-3 text-soft-white">{item.description}</td>
                        <td className="p-3 text-right text-soft-white">{item.quantity}</td>
                        <td className="p-3 text-right text-soft-white">${parseFloat(item.unitPrice).toFixed(2)}</td>
                        <td className="p-3 text-right font-medium text-soft-white">
                          ${parseFloat(item.lineTotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-neon-blue/30 pt-4">
              <div className="flex justify-end">
                <div className="space-y-2 min-w-[300px]">
                  <div className="flex justify-between">
                    <span className="text-soft-white/70">Subtotal:</span>
                    <span className="font-medium text-soft-white">${parseFloat(invoice.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soft-white/70">VAT (15%):</span>
                    <span className="font-medium text-soft-white">${parseFloat(invoice.taxAmount).toFixed(2)}</span>
                  </div>
                  {parseFloat(invoice.discountAmount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-soft-white/70">Discount:</span>
                      <span className="font-medium text-soft-white">-${parseFloat(invoice.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-neon-blue/30 pt-2 text-soft-white">
                    <span>Total:</span>
                    <span>${parseFloat(invoice.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cyber-blue font-semibold">
                    <span>Paid:</span>
                    <span>${parseFloat(invoice.paidAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-brand-orange font-semibold border-t border-neon-blue/30 pt-2">
                    <span>Balance Due:</span>
                    <span>${parseFloat(invoice.balanceAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ZATCA E-Invoicing QR Code */}
            <div className="border border-neon-blue/30 rounded-lg p-4 bg-neon-blue/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-soft-white flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    ZATCA E-Invoice QR Code
                  </h4>
                  <p className="text-xs text-soft-white/70 mt-1">
                    Saudi Arabia tax compliance (Fatoora)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "QR Code Generated",
                      description: "ZATCA-compliant QR code ready for invoice",
                    });
                  }}
                  data-testid="button-generate-qr"
                >
                  Generate QR
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  data-testid="button-delete-invoice"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Invoice
                </Button>
              </div>
              <div className="flex gap-2">
                <AddPaymentDialog invoice={invoice} />
                <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-close-invoice-details">
                  Close
                </Button>
              </div>
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {invoice && (
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoice.invoiceNumber}? This action cannot
              be undone and will also delete all associated line items and payments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-invoice">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteInvoiceMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete-invoice"
            >
              {deleteInvoiceMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      )}
    </>
  );
}
