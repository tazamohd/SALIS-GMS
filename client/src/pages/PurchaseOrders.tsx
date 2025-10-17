import { useState } from "react";
import { ShoppingCart, Plus, Building2, Eye, Edit, Trash2, MoreVertical, CheckCircle, Send, XCircle, Package as PackageIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";

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
      case 'draft': return 'bg-dark-steel/30 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-purple-100 text-purple-700';
      case 'partial': return 'bg-yellow-100 text-yellow-700';
      case 'received': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-dark-steel/30 text-gray-700';
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-chrome-silver">
            Purchase Orders
          </h1>
          <p className="font-['Poppins',Helvetica] font-normal text-sm text-chrome-silver/60 mt-1">
            Manage purchase orders and track supplier deliveries
          </p>
        </div>
        <div className="flex gap-2">
          <AddSupplierDialog />
          <CreatePurchaseOrderDialog />
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-midnight-blue border-dark-steel mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="w-[250px]">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Garage</label>
              <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
                <SelectTrigger data-testid="select-garage-filter-po">
                  <Building2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Garages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Garages</SelectItem>
                  {(garages ?? []).map((garage) => (
                    <SelectItem key={garage.id} value={garage.id}>
                      {garage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[250px]">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="partial">Partially Received</SelectItem>
                  <SelectItem value="received">Fully Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {!isLoading && purchaseOrders && purchaseOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-midnight-blue border-dark-steel bg-midnight-blue border-dark-steel">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-chrome-silver/60">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-midnight-blue border-dark-steel bg-midnight-blue border-dark-steel">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-chrome-silver/60">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {purchaseOrders.filter(po => ['draft', 'sent'].includes(po.status)).length}
                  </p>
                </div>
                <PackageIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-midnight-blue border-dark-steel bg-midnight-blue border-dark-steel">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-chrome-silver/60">Confirmed</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {purchaseOrders.filter(po => po.status === 'confirmed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-midnight-blue border-dark-steel bg-midnight-blue border-dark-steel">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-chrome-silver/60">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${purchaseOrders.reduce((sum, po) => sum + parseFloat(po.totalAmount), 0).toFixed(2)}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Purchase Orders List */}
      <Card className="bg-midnight-blue border-dark-steel bg-midnight-blue border-dark-steel">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : (purchaseOrders ?? []).length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-600 mb-2">
                No Purchase Orders
              </h3>
              <p className="text-sm text-chrome-silver/50 mb-4">
                Create your first purchase order to start managing inventory
              </p>
              <CreatePurchaseOrderDialog />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-steel">
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-chrome-silver">
                      PO Number
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-chrome-silver">
                      Supplier
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-chrome-silver">
                      Order Date
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-chrome-silver">
                      Expected Delivery
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-chrome-silver">
                      Total Amount
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-chrome-silver">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-chrome-silver">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders?.map((po) => (
                    <tr key={po.id} className="border-b border-gray-100 hover:bg-dark-steel/20" data-testid={`po-row-${po.id}`}>
                      <td className="py-3 px-4">
                        <span className="font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver">
                          {po.poNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {getSupplierName(po.supplierId)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-['Poppins',Helvetica] font-semibold text-sm text-chrome-silver">
                          ${parseFloat(po.totalAmount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(po.status)} capitalize`}>
                          {po.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
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
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
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
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
