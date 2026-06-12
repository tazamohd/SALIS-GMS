import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { PurchaseOrder, PurchaseOrderItem, Supplier } from "@shared/schema";

interface PurchaseOrderDetailsDialogProps {
  purchaseOrder: PurchaseOrder;
  supplier?: Supplier;
}

export function PurchaseOrderDetailsDialog({ purchaseOrder, supplier }: PurchaseOrderDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(purchaseOrder.status);
  const { toast } = useToast();

  const { data: items } = useQuery<PurchaseOrderItem[]>({
    queryKey: [`/api/purchase-orders/${purchaseOrder.id}/items`],
    enabled: open,
  });

  useEffect(() => {
    setCurrentStatus(purchaseOrder.status);
  }, [purchaseOrder.status]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return await apiRequest("PATCH", `/api/purchase-orders/${purchaseOrder.id}`, {
        status: newStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/purchase-orders' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/purchase-orders'))
      });
      toast({
        title: "Success",
        description: "Purchase order status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
      setCurrentStatus(purchaseOrder.status);
    },
  });

  const deletePOMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/purchase-orders/${purchaseOrder.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/purchase-orders' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/purchase-orders'))
      });
      toast({
        title: "Success",
        description: "Purchase order deleted",
      });
      setOpen(false);
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete purchase order",
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
      confirmed: "bg-yellow-100 text-yellow-800",
      partial: "bg-orange-100 text-orange-800",
      received: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" data-testid={`button-view-po-${purchaseOrder.id}`}>
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details - {purchaseOrder.poNumber}</DialogTitle>
            <DialogDescription className="sr-only">
              View and manage purchase order details, status, and items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <label className="text-sm font-medium text-gray-600">Supplier</label>
                <p className="font-medium">{supplier?.name || "Unknown"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1" data-testid="select-po-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="partial">Partially Received</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Order Date</label>
                <p>{new Date(purchaseOrder.orderDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Expected Delivery</label>
                <p>
                  {purchaseOrder.expectedDeliveryDate
                    ? new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
            </div>

            {/* Notes */}
            {purchaseOrder.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="mt-1 p-3 bg-gray-50 rounded">{purchaseOrder.notes}</p>
              </div>
            )}

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="border rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Part Name</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Part Number</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Quantity</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Unit Price</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(items ?? []).map((item) => (
                      <tr key={item.id} className="border-t" data-testid={`po-item-${item.id}`}>
                        <td className="p-3">{item.partName}</td>
                        <td className="p-3 text-gray-600">{item.partNumber || "-"}</td>
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
                    <span className="font-medium">${parseFloat(purchaseOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${parseFloat(purchaseOrder.taxAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${parseFloat(purchaseOrder.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                data-testid="button-delete-po"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Purchase Order
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-close-po-details">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete purchase order {purchaseOrder.poNumber}? This action cannot
              be undone and will also delete all associated line items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-po">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePOMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete-po"
            >
              {deletePOMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
