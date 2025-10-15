import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  invoice: Invoice;
  customer?: User;
}

export function InvoiceDetailsDialog({ invoice, customer }: InvoiceDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(invoice.status);
  const { toast } = useToast();

  const { data: items } = useQuery<InvoiceItem[]>({
    queryKey: [`/api/invoices/${invoice.id}/items`],
    enabled: open,
  });

  useEffect(() => {
    setCurrentStatus(invoice.status);
  }, [invoice.status]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return await apiRequest("PATCH", `/api/invoices/${invoice.id}`, {
        status: newStatus,
        sentAt: newStatus === 'sent' && !invoice.sentAt ? new Date() : invoice.sentAt,
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

  const handleStatusChange = (newStatus: string) => {
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" data-testid={`button-view-invoice-${invoice.id}`}>
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details - {invoice.invoiceNumber}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <label className="text-sm font-medium text-gray-600">Customer</label>
                <p className="font-medium">{customer?.fullName || customer?.email || "Unknown"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1" data-testid="select-invoice-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Invoice Date</label>
                <p>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Due Date</label>
                <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="mt-1 p-3 bg-gray-50 rounded">{invoice.notes}</p>
              </div>
            )}

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-3">Invoice Items</h3>
              <div className="border rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Type</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Description</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Quantity</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Unit Price</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(items ?? []).map((item) => (
                      <tr key={item.id} className="border-t" data-testid={`invoice-item-${item.id}`}>
                        <td className="p-3 capitalize">{item.itemType}</td>
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">${parseFloat(item.unitPrice).toFixed(2)}</td>
                        <td className="p-3 text-right font-medium">
                          ${parseFloat(item.lineTotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="space-y-2 min-w-[300px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${parseFloat(invoice.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${parseFloat(invoice.taxAmount).toFixed(2)}</span>
                  </div>
                  {parseFloat(invoice.discountAmount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium">-${parseFloat(invoice.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${parseFloat(invoice.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Paid:</span>
                    <span>${parseFloat(invoice.paidAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600 font-semibold border-t pt-2">
                    <span>Balance Due:</span>
                    <span>${parseFloat(invoice.balanceAmount).toFixed(2)}</span>
                  </div>
                </div>
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
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
    </>
  );
}
