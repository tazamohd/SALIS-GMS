import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Download,
  Calendar,
  FileText,
  PieChart,
} from "lucide-react";
import type { PurchaseOrder, Supplier, SparePart, SparePartInventory, SupplierPerformance } from "@shared/schema";

export default function PurchaseAgentReports() {
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: purchaseOrders = [] } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: spareParts = [] } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts"],
  });

  const { data: inventories = [] } = useQuery<SparePartInventory[]>({
    queryKey: ["/api/spare-part-inventories"],
  });

  const { data: performance = [] } = useQuery<SupplierPerformance[]>({
    queryKey: ["/api/supplier-performance"],
  });

  const totalSpend = purchaseOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0);

  const avgOrderValue = purchaseOrders.length > 0 ? totalSpend / purchaseOrders.length : 0;

  const ordersByStatus = {
    pending: purchaseOrders.filter((o) => o.status === "pending").length,
    ordered: purchaseOrders.filter((o) => o.status === "ordered").length,
    received: purchaseOrders.filter((o) => o.status === "received").length,
    cancelled: purchaseOrders.filter((o) => o.status === "cancelled").length,
  };

  const topSuppliers = suppliers
    .map((supplier) => {
      const supplierOrders = purchaseOrders.filter((o) => o.supplierId === supplier.id);
      const supplierSpend = supplierOrders.reduce(
        (sum, o) => sum + parseFloat(o.totalAmount || "0"),
        0
      );
      const supplierPerf = performance.find((p) => p.supplierId === supplier.id);
      return {
        ...supplier,
        orderCount: supplierOrders.length,
        totalSpend: supplierSpend,
        rating: supplierPerf?.overallRating || null,
      };
    })
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5);

  const lowStockItems = inventories.filter(
    (inv) =>
      inv.stockQuantity !== null &&
      inv.minThreshold !== null &&
      inv.stockQuantity <= inv.minThreshold
  );

  const reports = [
    {
      id: "purchase-summary",
      title: "Purchase Summary Report",
      description: "Overview of all purchase orders and spending",
      icon: FileText,
    },
    {
      id: "supplier-performance",
      title: "Supplier Performance Report",
      description: "Supplier ratings, delivery times, and quality metrics",
      icon: Users,
    },
    {
      id: "inventory-analysis",
      title: "Inventory Analysis Report",
      description: "Stock levels, turnover rates, and reorder recommendations",
      icon: Package,
    },
    {
      id: "cost-analysis",
      title: "Cost Analysis Report",
      description: "Spending trends, cost savings, and budget variance",
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
            Procurement Reports
          </h1>
          <p className="text-[#64748B] mt-1">
            Analytics and insights for procurement activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-date-range">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">${totalSpend.toLocaleString()}</div>
                <p className="text-sm text-[#64748B]">Total Spend</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Package className="h-6 w-6 text-[#0A5ED7]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{purchaseOrders.length}</div>
                <p className="text-sm text-[#64748B]">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">${avgOrderValue.toFixed(0)}</div>
                <p className="text-sm text-[#64748B]">Avg Order Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20">
                <Users className="h-6 w-6 text-[#F97316]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{suppliers.filter((s) => s.isActive).length}</div>
                <p className="text-sm text-[#64748B]">Active Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="suppliers" data-testid="tab-suppliers">
            <Users className="h-4 w-4 mr-2" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#0B1F3B] dark:text-white">Order Status Distribution</CardTitle>
                <CardDescription className="text-[#64748B]">Breakdown of orders by current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(ordersByStatus).map(([status, count]) => {
                    const percentage = purchaseOrders.length > 0
                      ? ((count / purchaseOrders.length) * 100).toFixed(1)
                      : 0;
                    const colors: Record<string, string> = {
                      pending: "bg-[#F97316]",
                      ordered: "bg-[#0A5ED7]",
                      received: "bg-green-500",
                      cancelled: "bg-red-500",
                    };
                    return (
                      <div key={status}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm capitalize text-[#0B1F3B] dark:text-white">{status}</span>
                          <span className="text-sm text-[#64748B]">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`${colors[status]} h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#0B1F3B] dark:text-white">Top Suppliers by Spend</CardTitle>
                <CardDescription className="text-[#64748B]">Highest value supplier relationships</CardDescription>
              </CardHeader>
              <CardContent>
                {topSuppliers.length === 0 ? (
                  <p className="text-[#64748B] text-center py-4">No supplier data</p>
                ) : (
                  <div className="space-y-4">
                    {topSuppliers.map((supplier, index) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                        data-testid={`top-supplier-${supplier.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#64748B]">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-[#0B1F3B] dark:text-white">{supplier.name}</p>
                            <p className="text-sm text-[#64748B]">
                              {supplier.orderCount} orders
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#0B1F3B] dark:text-white">${supplier.totalSpend.toLocaleString()}</p>
                          {supplier.rating && (
                            <Badge variant="outline" className="text-xs border-[#E2E8F0] dark:border-[#232A36]">
                              ★ {supplier.rating}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">Inventory Alerts Summary</CardTitle>
              <CardDescription className="text-[#64748B]">Items requiring procurement attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <div className="text-3xl font-bold text-red-500">{lowStockItems.length}</div>
                  <p className="text-sm text-[#64748B] mt-1">Low Stock Items</p>
                </div>
                <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <div className="text-3xl font-bold text-[#F97316]">
                    {inventories.filter((inv) => (inv.stockQuantity || 0) === 0).length}
                  </div>
                  <p className="text-sm text-[#64748B] mt-1">Out of Stock</p>
                </div>
                <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <div className="text-3xl font-bold text-[#0A5ED7]">
                    {ordersByStatus.pending + ordersByStatus.ordered}
                  </div>
                  <p className="text-sm text-[#64748B] mt-1">Orders in Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">Supplier Performance Overview</CardTitle>
              <CardDescription className="text-[#64748B]">Performance metrics for all active suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <p className="text-[#64748B] text-center py-8">No suppliers found</p>
              ) : (
                <div className="space-y-4">
                  {suppliers.filter((s) => s.isActive).map((supplier) => {
                    const supplierPerf = performance.filter((p) => p.supplierId === supplier.id);
                    const avgRating = supplierPerf.length > 0
                      ? (supplierPerf.reduce((sum, p) => sum + parseFloat(p.overallRating || "0"), 0) / supplierPerf.length).toFixed(1)
                      : null;
                    const supplierOrders = purchaseOrders.filter((o) => o.supplierId === supplier.id);

                    return (
                      <div
                        key={supplier.id}
                        className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                        data-testid={`supplier-perf-${supplier.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-[#0B1F3B] dark:text-white">{supplier.name}</h4>
                            <p className="text-sm text-[#64748B]">{supplier.city}, {supplier.country}</p>
                          </div>
                          {avgRating && (
                            <Badge variant="outline" className="text-lg border-[#E2E8F0] dark:border-[#232A36]">★ {avgRating}</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-[#64748B]">Total Orders</p>
                            <p className="font-semibold text-[#0B1F3B] dark:text-white">{supplierOrders.length}</p>
                          </div>
                          <div>
                            <p className="text-[#64748B]">Total Value</p>
                            <p className="font-semibold text-[#0B1F3B] dark:text-white">
                              ${supplierOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#64748B]">Status</p>
                            <Badge variant={supplier.isActive ? "default" : "secondary"}>
                              {supplier.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`report-${report.id}`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                      <report.icon className="h-6 w-6 text-[#0A5ED7]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{report.title}</CardTitle>
                      <CardDescription className="mt-1 text-[#64748B]">{report.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-[#E2E8F0] dark:border-[#232A36]" data-testid={`button-view-${report.id}`}>
                      View Report
                    </Button>
                    <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`button-download-${report.id}`}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
