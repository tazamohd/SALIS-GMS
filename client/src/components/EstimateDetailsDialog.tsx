import { useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Trash2, FileText, File, Wrench } from "lucide-react";
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
import type { Estimate, EstimateItem, User } from "@shared/schema";

interface EstimateDetailsDialogProps {
  estimateId: string;
  children: ReactNode;
}

export function EstimateDetailsDialog({ estimateId, children }: EstimateDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: estimate } = useQuery<Estimate>({
    queryKey: [`/api/estimates/${estimateId}`],
    enabled: open,
  });

  const { data: items } = useQuery<EstimateItem[]>({
    queryKey: [`/api/estimates/${estimateId}/items`],
    enabled: open,
  });

  const { data: customers } = useQuery<User[]>({
    queryKey: ['/api/customers'],
  });

  const customer = customers?.find(c => c.id === estimate?.customerId);
  const [currentStatus, setCurrentStatus] = useState(estimate?.status || "draft");

  useEffect(() => {
    if (estimate) {
      setCurrentStatus(estimate.status);
    }
  }, [estimate]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return await apiRequest("PATCH", `/api/estimates/${estimateId}`, {
        status: newStatus,
        sentAt: newStatus === 'sent' && !estimate?.sentAt ? new Date() : estimate?.sentAt,
        approvedAt: newStatus === 'accepted' && !estimate?.approvedAt ? new Date() : estimate?.approvedAt,
        rejectedAt: newStatus === 'declined' && !estimate?.rejectedAt ? new Date() : estimate?.rejectedAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/estimates' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/estimates'))
      });
      toast({
        title: "Success",
        description: "Estimate status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
      if (estimate) {
        setCurrentStatus(estimate.status);
      }
    },
  });

  const deleteEstimateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/estimates/${estimateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/estimates' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/estimates'))
      });
      toast({
        title: "Success",
        description: "Estimate deleted",
      });
      setOpen(false);
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete estimate",
        variant: "destructive",
      });
    },
  });

  const convertToJobCardMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/estimates/${estimateId}/convert-to-job-card`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/estimates' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/estimates'))
      });
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
      toast({
        title: "Success",
        description: "Estimate converted to job card",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to convert to job card",
        variant: "destructive",
      });
    },
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/estimates/${estimateId}/convert-to-invoice`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/estimates' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/estimates'))
      });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Success",
        description: "Estimate converted to invoice",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to convert to invoice",
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
      accepted: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (!estimate) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estimate Details - {estimate.estimateNumber}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <label className="text-sm font-medium text-gray-600">Title</label>
                <p className="font-medium" data-testid="text-estimate-title">{estimate.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Customer</label>
                <p className="font-medium" data-testid="text-customer-name">{customer?.fullName || customer?.email || "Unknown"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1" data-testid="select-estimate-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Valid Until</label>
                <p className="font-medium" data-testid="text-valid-until">
                  {estimate.validUntil ? new Date(estimate.validUntil).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            {estimate.description && (
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="mt-1 text-gray-700" data-testid="text-description">{estimate.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-3">Items</h3>
              <div className="space-y-2">
                {(items ?? []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded" data-testid={`estimate-item-${item.id}`}>
                    <div className="flex-1">
                      <p className="font-medium" data-testid={`item-description-${item.id}`}>{item.description}</p>
                      <p className="text-sm text-gray-500">
                        {item.itemType} • Qty: {item.quantity} • ${parseFloat(item.unitPrice).toFixed(2)} each
                      </p>
                    </div>
                    <p className="font-semibold" data-testid={`item-total-${item.id}`}>${parseFloat(item.lineTotal).toFixed(2)}</p>
                  </div>
                ))}
                {(items ?? []).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No items</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold" data-testid="text-estimate-subtotal">${parseFloat(estimate.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({parseFloat(estimate.taxRate).toFixed(0)}%):</span>
                  <span className="font-semibold" data-testid="text-estimate-tax">${parseFloat(estimate.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold" data-testid="text-estimate-discount">${parseFloat(estimate.discountAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span data-testid="text-estimate-total">${parseFloat(estimate.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {estimate.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="mt-1 text-gray-700" data-testid="text-estimate-notes">{estimate.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              {!estimate.convertedToJobCardId && !estimate.convertedToInvoiceId && estimate.status === 'accepted' && (
                <>
                  <Button
                    onClick={() => convertToJobCardMutation.mutate()}
                    disabled={convertToJobCardMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-convert-to-job-card"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    {convertToJobCardMutation.isPending ? "Converting..." : "Convert to Job Card"}
                  </Button>
                  <Button
                    onClick={() => convertToInvoiceMutation.mutate()}
                    disabled={convertToInvoiceMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-convert-to-invoice"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {convertToInvoiceMutation.isPending ? "Converting..." : "Convert to Invoice"}
                  </Button>
                </>
              )}
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                data-testid="button-delete-estimate"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this estimate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEstimateMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
