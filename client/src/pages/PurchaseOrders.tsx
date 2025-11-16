import { useState } from "react";
import { ShoppingCart, Plus, Building2, Eye, Edit, Trash2, MoreVertical, CheckCircle, Send, XCircle, Package as PackageIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AddSupplierDialog } from "@/components/AddSupplierDialog";
import { CreatePurchaseOrderDialog } from "@/components/CreatePurchaseOrderDialog";
import { PurchaseOrderDetailsDialog } from "@/components/PurchaseOrderDetailsDialog";
import type { PurchaseOrder, Supplier, Garage, PurchaseOrderItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StandardTablePage } from "@/components/layouts";

export function PurchaseOrders() {
  const { toast } = useToast();
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const poQueryParams = new URLSearchParams();
  if (selectedGarageId !== "all") {
    poQueryParams.append("garage_id", selectedGarageId);
  }
  if (statusFilter !== "all") {
    poQueryParams.append("status", statusFilter);
  }
  const poUrl = `/api/purchase-orders${poQueryParams.toString() ? `?${poQueryParams.toString()}` : ''}`;

  const { data: purchaseOrders, isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: [poUrl],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/purchase-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/purchase-orders' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/purchase-orders'))
      });
      toast({
        title: "Success",
        description: "Purchase order deleted successfully",
      });
      setDeleteConfirmOpen(false);
      setPoToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete purchase order",
        variant: "destructive",
      });
    },
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/purchase-orders/${id}`, { status });
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
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 dark:bg-salis-gray-dark text-gray-700 dark:text-gray-300';
      case 'sent': return 'bg-gray-200 text-gray-700';
      case 'confirmed': return 'bg-gray-300 text-gray-800';
      case 'partial': return 'bg-gray-400 text-gray-900';
      case 'received': return 'bg-gray-500 text-white';
      case 'cancelled': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-100 dark:bg-salis-gray-dark text-gray-700 dark:text-gray-300';
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = (suppliers ?? []).find(s => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  const handleDelete = (po: PurchaseOrder) => {
    setPoToDelete(po);
    setDeleteConfirmOpen(true);
  };

  const handleStatusChange = (po: PurchaseOrder, newStatus: string) => {
    updateStatusMutation.mutate({ id: po.id, status: newStatus });
  };

  const columns = [
    {
      key: "poNumber",
      label: "PO Number",
      render: (po: PurchaseOrder) => (
        <span className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white">
          {po.poNumber}
        </span>
      ),
    },
    {
      key: "supplier",
      label: "Supplier",
      render: (po: PurchaseOrder) => (
        <span className="text-sm text-gray-700">
          {getSupplierName(po.supplierId)}
        </span>
      ),
    },
    {
      key: "orderDate",
      label: "Order Date",
      render: (po: PurchaseOrder) => (
        <span className="text-sm text-gray-700">
          {new Date(po.orderDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "expectedDelivery",
      label: "Expected Delivery",
      render: (po: PurchaseOrder) => (
        <span className="text-sm text-gray-700">
          {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (po: PurchaseOrder) => (
        <span className="font-['Poppins',Helvetica] font-semibold text-sm text-gray-900 dark:text-white">
          ${parseFloat(po.totalAmount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (po: PurchaseOrder) => (
        <Badge className={`${getStatusColor(po.status)} capitalize`}>
          {po.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (po: PurchaseOrder) => (
        <div className="flex items-center gap-2">
          <PurchaseOrderDetailsDialog
            purchaseOrder={po}
            supplier={suppliers?.find(s => s.id === po.supplierId)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                data-testid={`button-actions-${po.id}`}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {po.status === 'draft' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'sent')}>
                    <Send className="w-4 h-4 mr-2" />
                    Send to Supplier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {po.status === 'sent' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'confirmed')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {po.status === 'confirmed' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'partial')}>
                    <PackageIcon className="w-4 h-4 mr-2" />
                    Mark as Partially Received
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'received')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Fully Received
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {po.status === 'partial' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'received')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Fully Received
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {['draft', 'sent'].includes(po.status) && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'cancelled')}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {po.status === 'draft' && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(po)}
                  className="text-gray-800 dark:text-gray-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const summaryCards = !isLoading && purchaseOrders && purchaseOrders.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 dark:text-white/60">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-gray-700" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 dark:text-white/60">Pending</p>
              <p className="text-2xl font-bold text-gray-700">
                {purchaseOrders.filter(po => ['draft', 'sent'].includes(po.status)).length}
              </p>
            </div>
            <PackageIcon className="w-8 h-8 text-gray-700" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 dark:text-white/60">Confirmed</p>
              <p className="text-2xl font-bold text-gray-800">
                {purchaseOrders.filter(po => po.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-gray-800" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 dark:text-white/60">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${purchaseOrders.reduce((sum, po) => sum + parseFloat(po.totalAmount), 0).toFixed(2)}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-gray-900" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const garageOptions = (garages ?? []).map(garage => ({
    label: garage.name,
    value: garage.id,
  }));

  return (
    <>
      <StandardTablePage
        title="Purchase Orders"
        description="Manage purchase orders and track supplier deliveries"
        icon={ShoppingCart}
        data={purchaseOrders ?? []}
        isLoading={isLoading}
        columns={columns}
        mode="controlled"
        filterValues={{ garageId: selectedGarageId, status: statusFilter }}
        onFilterChange={(id, value) => {
          if (id === "garageId") setSelectedGarageId(value);
          if (id === "status") setStatusFilter(value);
        }}
        filters={[
          {
            id: "garageId",
            label: "Garage",
            options: [{ label: "All Garages", value: "all" }, ...garageOptions],
            defaultValue: "all",
          },
          {
            id: "status",
            label: "Status",
            options: [
              { label: "All Status", value: "all" },
              { label: "Draft", value: "draft" },
              { label: "Sent", value: "sent" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Partially Received", value: "partial" },
              { label: "Fully Received", value: "received" },
              { label: "Cancelled", value: "cancelled" },
            ],
            defaultValue: "all",
          },
        ]}
        emptyState={{
          icon: ShoppingCart,
          title: "No Purchase Orders",
          description: "Create your first purchase order to start managing inventory",
        }}
        additionalContent={summaryCards}
      />
      
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete PO {poToDelete?.poNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => poToDelete && deleteMutation.mutate(poToDelete.id)}
              className="bg-salis-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
