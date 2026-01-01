import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        title: t('common.success', 'Success'),
        description: t('inventory.purchaseOrderDeleted', 'Purchase order deleted successfully'),
      });
      setDeleteConfirmOpen(false);
      setPoToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('inventory.failedToDeletePurchaseOrder', 'Failed to delete purchase order'),
        variant: "destructive",
      });
    },
  });

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
        title: t('common.success', 'Success'),
        description: t('inventory.purchaseOrderStatusUpdated', 'Purchase order status updated'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('inventory.failedToUpdateStatus', 'Failed to update status'),
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-[#64748B]/10 text-[#64748B] dark:bg-[#64748B]/20';
      case 'sent': return 'bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20 dark:text-[#0BB3FF]';
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'partial': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'received': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-[#64748B]/10 text-[#64748B] dark:bg-[#64748B]/20';
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
      label: t('inventory.poNumber', 'PO Number'),
      render: (po: PurchaseOrder) => (
        <span className="font-['Poppins',Helvetica] font-medium text-sm text-[#0B1F3B] dark:text-white">
          {po.poNumber}
        </span>
      ),
    },
    {
      key: "supplier",
      label: t('inventory.supplier', 'Supplier'),
      render: (po: PurchaseOrder) => (
        <span className="text-sm text-[#64748B]">
          {getSupplierName(po.supplierId)}
        </span>
      ),
    },
    {
      key: "orderDate",
      label: t('inventory.orderDate', 'Order Date'),
      render: (po: PurchaseOrder) => (
        <span className="text-sm text-[#64748B]">
          {new Date(po.orderDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "expectedDelivery",
      label: t('inventory.expectedDelivery', 'Expected Delivery'),
      render: (po: PurchaseOrder) => (
        <span className="text-sm text-[#64748B]">
          {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: t('inventory.totalAmount', 'Total Amount'),
      render: (po: PurchaseOrder) => (
        <span className="font-['Poppins',Helvetica] font-semibold text-sm text-[#0B1F3B] dark:text-white">
          ${parseFloat(po.totalAmount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: t('common.status', 'Status'),
      render: (po: PurchaseOrder) => (
        <Badge className={`${getStatusColor(po.status)} capitalize border-0`}>
          {po.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: t('common.actions', 'Actions'),
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
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              {po.status === 'draft' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'sent')}>
                    <Send className="w-4 h-4 mr-2" />
                    {t('inventory.sendToSupplier', 'Send to Supplier')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {po.status === 'sent' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'confirmed')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('inventory.markAsConfirmed', 'Mark as Confirmed')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {po.status === 'confirmed' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'partial')}>
                    <PackageIcon className="w-4 h-4 mr-2" />
                    {t('inventory.markAsPartiallyReceived', 'Mark as Partially Received')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'received')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('inventory.markAsFullyReceived', 'Mark as Fully Received')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {po.status === 'partial' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'received')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('inventory.markAsFullyReceived', 'Mark as Fully Received')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {['draft', 'sent'].includes(po.status) && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(po, 'cancelled')}>
                    <XCircle className="w-4 h-4 mr-2" />
                    {t('inventory.cancelOrder', 'Cancel Order')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {po.status === 'draft' && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(po)}
                  className="text-[#F97316]"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('common.delete', 'Delete')}
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
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('inventory.totalOrders', 'Total Orders')}</p>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{purchaseOrders.length}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-[#0A5ED7]" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('common.pending', 'Pending')}</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {purchaseOrders.filter(po => ['draft', 'sent'].includes(po.status)).length}
              </p>
            </div>
            <PackageIcon className="w-8 h-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('inventory.confirmed', 'Confirmed')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {purchaseOrders.filter(po => po.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('inventory.totalValue', 'Total Value')}</p>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                ${purchaseOrders.reduce((sum, po) => sum + parseFloat(po.totalAmount), 0).toFixed(2)}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-[#0A5ED7]" />
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
        title={t('inventory.purchaseOrders', 'Purchase Orders')}
        description={t('inventory.managePurchaseOrders', 'Manage purchase orders and track supplier deliveries')}
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
            label: t('inventory.garage', 'Garage'),
            options: [{ label: t('inventory.allGarages', 'All Garages'), value: "all" }, ...garageOptions],
            defaultValue: "all",
          },
          {
            id: "status",
            label: t('common.status', 'Status'),
            options: [
              { label: t('inventory.allStatus', 'All Status'), value: "all" },
              { label: t('inventory.draft', 'Draft'), value: "draft" },
              { label: t('inventory.sent', 'Sent'), value: "sent" },
              { label: t('inventory.confirmed', 'Confirmed'), value: "confirmed" },
              { label: t('inventory.partiallyReceived', 'Partially Received'), value: "partial" },
              { label: t('inventory.fullyReceived', 'Fully Received'), value: "received" },
              { label: t('inventory.cancelled', 'Cancelled'), value: "cancelled" },
            ],
            defaultValue: "all",
          },
        ]}
        emptyState={{
          icon: ShoppingCart,
          title: t('inventory.noPurchaseOrders', 'No Purchase Orders'),
          description: t('inventory.createFirstPurchaseOrder', 'Create your first purchase order to start managing inventory'),
        }}
        additionalContent={summaryCards}
      />
      
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.deletePurchaseOrder', 'Delete Purchase Order')}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#64748B]">
              {t('inventory.confirmDeletePO', 'Are you sure you want to delete PO {{poNumber}}? This action cannot be undone.', { poNumber: poToDelete?.poNumber })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#E2E8F0] dark:border-[#232A36]">{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => poToDelete && deleteMutation.mutate(poToDelete.id)}
              className="bg-[#F97316] hover:bg-[#F97316]/90 text-white"
            >
              {deleteMutation.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
