import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { PurchaseOrder, Supplier } from "@shared/schema";

export default function PurchaseAgentOrders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: purchaseOrders = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/purchase-orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({ title: "Order status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update order", variant: "destructive" });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/purchase-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({ title: "Order deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete order", variant: "destructive" });
    },
  });

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      ordered: { variant: "default", icon: Package },
      received: { variant: "outline", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
    };
    const { variant, icon: Icon } = config[status] || { variant: "secondary", icon: Clock };
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || "Unknown";
  };

  const handleViewDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderMutation.mutate({ id: orderId, status: newStatus });
  };

  const orderStats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter((o) => o.status === "pending").length,
    ordered: purchaseOrders.filter((o) => o.status === "ordered").length,
    received: purchaseOrders.filter((o) => o.status === "received").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
            Purchase Orders
          </h1>
          <p className="text-[#64748B] mt-1">
            Manage and track all procurement orders
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-create-order">
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{orderStats.total}</div>
            <p className="text-sm text-[#64748B]">Total Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#F97316]">{orderStats.pending}</div>
            <p className="text-sm text-[#64748B]">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#0A5ED7]">{orderStats.ordered}</div>
            <p className="text-sm text-[#64748B]">Ordered</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{orderStats.received}</div>
            <p className="text-sm text-[#64748B]">Received</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-status-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#64748B]">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">
              No purchase orders found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#0B1F3B] dark:text-white">Order #</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Supplier</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Date</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Total</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Status</TableHead>
                  <TableHead className="text-right text-[#0B1F3B] dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-order-${order.id}`}>
                    <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{order.poNumber}</TableCell>
                    <TableCell className="text-[#64748B]">{getSupplierName(order.supplierId)}</TableCell>
                    <TableCell className="text-[#64748B]">
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="font-semibold text-[#0B1F3B] dark:text-white">${order.totalAmount}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                          data-testid={`button-view-${order.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-32 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`select-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="ordered">Ordered</SelectItem>
                            <SelectItem value="received">Received</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOrderMutation.mutate(order.id)}
                          data-testid={`button-delete-${order.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">Order Details - {selectedOrder?.poNumber}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              View complete purchase order information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#64748B]">Supplier</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{getSupplierName(selectedOrder.supplierId)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Status</p>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Order Date</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">
                    {selectedOrder.orderDate
                      ? new Date(selectedOrder.orderDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Expected Delivery</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">
                    {selectedOrder.expectedDeliveryDate
                      ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Subtotal</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">${selectedOrder.subtotal}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Total</p>
                  <p className="font-bold text-lg text-[#0B1F3B] dark:text-white">${selectedOrder.totalAmount}</p>
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-[#64748B]">Notes</p>
                  <p className="mt-1 text-[#0B1F3B] dark:text-white">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
