import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Link } from "wouter";
import type { PurchaseOrder, SparePart, SparePartInventory, Supplier } from "@shared/schema";

export default function PurchaseAgentDashboard() {
  const { data: purchaseOrders = [] } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: spareParts = [] } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts"],
  });

  const { data: inventories = [] } = useQuery<SparePartInventory[]>({
    queryKey: ["/api/spare-part-inventories"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const pendingOrders = purchaseOrders.filter((po) => po.status === "pending" || po.status === "ordered");
  const lowStockItems = inventories.filter((inv) => 
    inv.stockQuantity !== null && 
    inv.minThreshold !== null && 
    inv.stockQuantity <= inv.minThreshold
  );
  const activeSuppliers = suppliers.filter((s) => s.isActive);

  const totalOrderValue = purchaseOrders
    .filter((po) => po.status !== "cancelled")
    .reduce((sum, po) => sum + parseFloat(po.totalAmount || "0"), 0);

  const stats = [
    {
      title: "Pending Orders",
      value: pendingOrders.length,
      icon: Clock,
      color: "text-[#F97316]",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      trend: "+3 this week",
      trendUp: true,
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      trend: "Needs attention",
      trendUp: false,
    },
    {
      title: "Active Suppliers",
      value: activeSuppliers.length,
      icon: Users,
      color: "text-[#0A5ED7]",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trend: "+2 this month",
      trendUp: true,
    },
    {
      title: "Total Order Value",
      value: `$${totalOrderValue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      trend: "+15% vs last month",
      trendUp: true,
    },
  ];

  const recentOrders = purchaseOrders.slice(0, 5);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      ordered: { variant: "default", label: "Ordered" },
      received: { variant: "outline", label: "Received" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const { variant, label } = config[status] || { variant: "secondary", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
          Purchase Agent Dashboard
        </h1>
        <p className="text-[#64748B] mt-1">
          Manage procurement, track orders, and monitor inventory levels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trendUp ? "text-green-500" : "text-red-500"}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-[#64748B]">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[#0B1F3B] dark:text-white">Recent Purchase Orders</CardTitle>
              <CardDescription className="text-[#64748B]">Latest procurement activities</CardDescription>
            </div>
            <Link href="/purchase-agent/orders">
              <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-view-all-orders">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-center text-[#64748B] py-8">No purchase orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`order-${order.id}`}
                  >
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">
                        {order.poNumber}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">${order.totalAmount}</span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[#0B1F3B] dark:text-white">Low Stock Alerts</CardTitle>
              <CardDescription className="text-[#64748B]">Items requiring immediate attention</CardDescription>
            </div>
            <Link href="/purchase-agent/inventory">
              <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-view-inventory">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-[#64748B]">
                  All inventory levels are healthy!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockItems.slice(0, 5).map((inv) => {
                  const part = spareParts.find(p => p.id === inv.sparePartId);
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20"
                      data-testid={`low-stock-${inv.id}`}
                    >
                      <div>
                        <p className="font-medium text-[#0B1F3B] dark:text-white">
                          {part?.name || "Unknown Part"}
                        </p>
                        <p className="text-sm text-[#64748B]">{part?.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          {inv.stockQuantity} in stock
                        </p>
                        <p className="text-xs text-[#64748B]">
                          Min: {inv.minThreshold}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">Quick Actions</CardTitle>
          <CardDescription className="text-[#64748B]">Common procurement tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/purchase-agent/orders">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                data-testid="button-create-order"
              >
                <ShoppingCart className="h-6 w-6 text-[#0A5ED7]" />
                <span className="text-[#0B1F3B] dark:text-white">Create Order</span>
              </Button>
            </Link>
            <Link href="/purchase-agent/suppliers">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                data-testid="button-manage-suppliers"
              >
                <Users className="h-6 w-6 text-[#0A5ED7]" />
                <span className="text-[#0B1F3B] dark:text-white">Manage Suppliers</span>
              </Button>
            </Link>
            <Link href="/purchase-agent/price-compare">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                data-testid="button-compare-prices"
              >
                <TrendingUp className="h-6 w-6 text-[#0A5ED7]" />
                <span className="text-[#0B1F3B] dark:text-white">Compare Prices</span>
              </Button>
            </Link>
            <Link href="/purchase-agent/inventory">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                data-testid="button-check-inventory"
              >
                <Package className="h-6 w-6 text-[#0A5ED7]" />
                <span className="text-[#0B1F3B] dark:text-white">Check Inventory</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
