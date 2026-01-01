import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
} from "lucide-react";
import type { PurchaseOrder, Supplier } from "@shared/schema";

export default function PurchaseAgentTracking() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: purchaseOrders = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const activeOrders = purchaseOrders.filter(
    (o) => o.status === "ordered" || o.status === "pending"
  );

  const filteredOrders = activeOrders.filter((order) =>
    order.poNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || "Unknown";
  };

  const getOrderProgress = (status: string) => {
    const stages: Record<string, number> = {
      pending: 25,
      ordered: 50,
      shipped: 75,
      received: 100,
    };
    return stages[status] || 0;
  };

  const getStatusDetails = (status: string) => {
    const config: Record<string, { label: string; icon: any; color: string }> = {
      pending: { label: "Pending Confirmation", icon: Clock, color: "text-[#F97316]" },
      ordered: { label: "Order Placed", icon: Package, color: "text-[#0A5ED7]" },
      shipped: { label: "In Transit", icon: Truck, color: "text-purple-500" },
      received: { label: "Delivered", icon: CheckCircle, color: "text-green-500" },
    };
    return config[status] || config.pending;
  };

  const getDaysUntilDelivery = (expectedDate: string | Date | null) => {
    if (!expectedDate) return null;
    const today = new Date();
    const delivery = new Date(expectedDate);
    const diff = Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const overdueOrders = activeOrders.filter((o) => {
    const days = getDaysUntilDelivery(o.expectedDeliveryDate);
    return days !== null && days < 0;
  });

  const dueSoonOrders = activeOrders.filter((o) => {
    const days = getDaysUntilDelivery(o.expectedDeliveryDate);
    return days !== null && days >= 0 && days <= 3;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
            Order Tracking
          </h1>
          <p className="text-[#64748B] mt-1">
            Track the status of all active purchase orders
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Package className="h-6 w-6 text-[#0A5ED7]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{activeOrders.length}</div>
                <p className="text-sm text-[#64748B]">Active Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20">
                <Clock className="h-6 w-6 text-[#F97316]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F97316]">
                  {purchaseOrders.filter((o) => o.status === "pending").length}
                </div>
                <p className="text-sm text-[#64748B]">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
                <Truck className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">
                  {purchaseOrders.filter((o) => o.status === "ordered").length}
                </div>
                <p className="text-sm text-[#64748B]">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-white dark:bg-[#151A23] ${overdueOrders.length > 0 ? "border-red-200 dark:border-red-800" : "border-[#E2E8F0] dark:border-[#232A36]"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{overdueOrders.length}</div>
                <p className="text-sm text-[#64748B]">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {dueSoonOrders.length > 0 && (
        <Card className="bg-white dark:bg-[#151A23] border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-700 dark:text-yellow-400">
                Arriving Soon
              </CardTitle>
            </div>
            <CardDescription className="text-[#64748B]">
              {dueSoonOrders.length} order{dueSoonOrders.length !== 1 ? "s" : ""} expected within 3 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dueSoonOrders.map((order) => {
                const days = getDaysUntilDelivery(order.expectedDeliveryDate);
                return (
                  <div
                    key={order.id}
                    className="p-3 bg-white dark:bg-[#151A23] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid={`arriving-soon-${order.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-[#0B1F3B] dark:text-white">{order.poNumber}</p>
                        <p className="text-sm text-[#64748B]">{getSupplierName(order.supplierId)}</p>
                      </div>
                      <Badge variant="secondary">
                        {days === 0 ? "Today" : `${days} day${days !== 1 ? "s" : ""}`}
                      </Badge>
                    </div>
                    <Progress value={getOrderProgress(order.status)} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#64748B]">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">
              No active orders to track
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusDetails = getStatusDetails(order.status);
                const StatusIcon = statusDetails.icon;
                const daysUntil = getDaysUntilDelivery(order.expectedDeliveryDate);

                return (
                  <div
                    key={order.id}
                    className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`tracking-order-${order.id}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-white dark:bg-[#151A23] ${statusDetails.color}`}>
                          <StatusIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-[#0B1F3B] dark:text-white">{order.poNumber}</h3>
                          <p className="text-sm text-[#64748B]">
                            {getSupplierName(order.supplierId)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-[#0B1F3B] dark:text-white">${order.totalAmount}</p>
                        {order.expectedDeliveryDate && (
                          <p className="text-sm text-[#64748B] flex items-center justify-end gap-1">
                            <MapPin className="h-3 w-3" />
                            Expected: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                            {daysUntil !== null && (
                              <Badge
                                variant={daysUntil < 0 ? "destructive" : daysUntil <= 3 ? "secondary" : "outline"}
                                className="ml-2"
                              >
                                {daysUntil < 0
                                  ? `${Math.abs(daysUntil)} days overdue`
                                  : daysUntil === 0
                                  ? "Due today"
                                  : `${daysUntil} days`}
                              </Badge>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={statusDetails.color}>{statusDetails.label}</span>
                        <span className="text-[#64748B]">{getOrderProgress(order.status)}% Complete</span>
                      </div>
                      <div className="relative">
                        <Progress value={getOrderProgress(order.status)} className="h-2" />
                        <div className="flex justify-between mt-1 text-xs text-[#64748B]">
                          <span>Placed</span>
                          <span>Confirmed</span>
                          <span>Shipped</span>
                          <span>Delivered</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`button-details-${order.id}`}>
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`button-contact-${order.id}`}>
                        Contact Supplier
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
