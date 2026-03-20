import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Warehouse,
  AlertTriangle,
  Truck,
  RefreshCw,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Star,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Search as SearchIcon,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CHART_COLORS = ["#0A5ED7", "#0BB3FF", "#F97316", "#10B981", "#8B5CF6", "#EC4899", "#F59E0B", "#6366F1"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function StatusBadge({ status }: { status: string }) {
  if (status === "in_stock") {
    return (
      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-0">
        <CheckCircle className="w-3 h-3 mr-1" />
        In Stock
      </Badge>
    );
  }
  if (status === "low") {
    return (
      <Badge className="bg-[#F97316]/10 text-[#F97316] border-0">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Low Stock
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-0">
      <XCircle className="w-3 h-3 mr-1" />
      Out of Stock
    </Badge>
  );
}

export default function InventoryManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [stockSearch, setStockSearch] = useState("");
  const [reorderingItems, setReorderingItems] = useState<Set<string>>(new Set());

  // ---- Data Queries ----

  const { data: overview, isLoading: overviewLoading } = useQuery<any>({
    queryKey: ["/api/inventory/overview"],
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery<any>({
    queryKey: ["/api/inventory/items"],
  });

  const { data: lowStockData, isLoading: lowStockLoading } = useQuery<any>({
    queryKey: ["/api/inventory/low-stock"],
  });

  const { data: suppliersData } = useQuery<any>({
    queryKey: ["/api/inventory/suppliers"],
  });

  const { data: turnoverData } = useQuery<any>({
    queryKey: ["/api/inventory/turnover"],
  });

  const { data: valuationData } = useQuery<any>({
    queryKey: ["/api/inventory/valuation"],
  });

  // ---- Reorder Mutation ----

  const reorderMutation = useMutation({
    mutationFn: async (payload: { supplierId: string; items: any[]; notes?: string }) => {
      const res = await apiRequest("POST", "/api/inventory/reorder", payload);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/overview"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      toast({
        title: "Purchase Order Created",
        description: data.message || "Reorder submitted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Reorder Failed",
        description: "Could not create the purchase order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReorderItem = (item: any) => {
    const suppliersList = suppliersData?.suppliers || [];
    const defaultSupplier = suppliersList[0];
    if (!defaultSupplier) {
      toast({
        title: "No Supplier",
        description: "Please add a supplier before creating reorders.",
        variant: "destructive",
      });
      return;
    }

    setReorderingItems((prev) => new Set(prev).add(item.inventoryId || item.sparePartId));

    reorderMutation.mutate(
      {
        supplierId: defaultSupplier.id,
        items: [
          {
            partName: item.partName,
            partNumber: item.partNumber,
            quantity: item.suggestedReorderQty || item.minThreshold * 2,
            unitPrice: item.costPrice || 0,
          },
        ],
        notes: `Reorder for ${item.partName} - low stock alert`,
      },
      {
        onSettled: () => {
          setReorderingItems((prev) => {
            const next = new Set(prev);
            next.delete(item.inventoryId || item.sparePartId);
            return next;
          });
        },
      }
    );
  };

  const handleBulkReorder = () => {
    const lowItems = lowStockData?.items || [];
    const suppliersList = suppliersData?.suppliers || [];
    const defaultSupplier = suppliersList[0];

    if (!defaultSupplier) {
      toast({ title: "No Supplier", description: "Please add a supplier first.", variant: "destructive" });
      return;
    }

    if (lowItems.length === 0) {
      toast({ title: "Nothing to Reorder", description: "No items are below threshold." });
      return;
    }

    const poItems = lowItems.map((item: any) => ({
      partName: item.partName,
      partNumber: item.partNumber,
      quantity: item.suggestedReorderQty || item.minThreshold * 2,
      unitPrice: item.costPrice || 0,
    }));

    reorderMutation.mutate({
      supplierId: defaultSupplier.id,
      items: poItems,
      notes: `Bulk reorder - ${lowItems.length} items below threshold`,
    });
  };

  // ---- Derived data ----

  const items = itemsData?.items || [];
  const lowStockItems = lowStockData?.items || [];
  const suppliersList = suppliersData?.suppliers || [];
  const turnover = turnoverData?.turnover || [];
  const categoryBreakdown = overview?.categoryBreakdown || [];
  const valuation = valuationData || {};

  const filteredItems = items.filter(
    (item: any) =>
      stockSearch === "" ||
      item.partName?.toLowerCase().includes(stockSearch.toLowerCase()) ||
      item.partNumber?.toLowerCase().includes(stockSearch.toLowerCase()) ||
      item.category?.toLowerCase().includes(stockSearch.toLowerCase())
  );

  // ========== TAB: OVERVIEW ==========
  const overviewContent = (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] border-0 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-medium text-white/90">Total Items</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold">{overview?.totalItems ?? 0}</div>
            <p className="text-xs text-white/70 mt-1">Active inventory items</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">Total Value</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(overview?.totalValue ?? 0)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Inventory at cost</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#F97316]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-[#F97316]">{overview?.lowStockCount ?? 0}</div>
            <p className="text-xs text-[#64748B] mt-1">Items below threshold</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{overview?.outOfStockCount ?? 0}</div>
            <p className="text-xs text-[#64748B] mt-1">Needs immediate reorder</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Health by Category - Bar Chart */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0A5ED7]" />
              Stock by Category
            </CardTitle>
            <CardDescription className="text-[#64748B]">Quantity distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px" }}
                  />
                  <Bar dataKey="totalQuantity" fill="#0A5ED7" radius={[4, 4, 0, 0]} name="Quantity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-[#64748B]">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Value Distribution - Pie Chart */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Value Distribution
            </CardTitle>
            <CardDescription className="text-[#64748B]">Inventory value by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="totalValue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ category, percent }) =>
                      `${category} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {categoryBreakdown.map((_: any, idx: number) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-[#64748B]">
                No valuation data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Valuation Summary */}
      {valuation.totalCostValue !== undefined && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0A5ED7]" />
              Valuation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                <div className="text-sm text-[#64748B]">Cost Value</div>
                <div className="text-lg font-bold text-[#0B1F3B] dark:text-white">{formatCurrency(valuation.totalCostValue ?? 0)}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                <div className="text-sm text-[#64748B]">Selling Value</div>
                <div className="text-lg font-bold text-[#0B1F3B] dark:text-white">{formatCurrency(valuation.totalSellingValue ?? 0)}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                <div className="text-sm text-[#64748B]">Potential Profit</div>
                <div className="text-lg font-bold text-green-600">{formatCurrency(valuation.potentialProfit ?? 0)}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                <div className="text-sm text-[#64748B]">Total Quantity</div>
                <div className="text-lg font-bold text-[#0B1F3B] dark:text-white">{valuation.totalQuantity ?? 0}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                <div className="text-sm text-[#64748B]">Total SKUs</div>
                <div className="text-lg font-bold text-[#0B1F3B] dark:text-white">{valuation.totalItems ?? 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Turnover Analysis */}
      {turnover.length > 0 && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#8B5CF6]" />
              Turnover Analysis
            </CardTitle>
            <CardDescription className="text-[#64748B]">Inventory movement speed by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={turnover}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="turnoverRatio" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Turnover Ratio" />
                <Bar dataKey="totalStock" fill="#0BB3FF" radius={[4, 4, 0, 0]} name="Total Stock" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ========== TAB: STOCK LEVELS ==========
  const stockLevelsContent = (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-4 w-4" />
        <Input
          placeholder="Search by name, part number, or category..."
          value={stockSearch}
          onChange={(e) => setStockSearch(e.target.value)}
          className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
        />
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-0">
          {itemsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-[#64748B]">Loading inventory items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
              <p className="text-[#64748B]">No inventory items found</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#0B1F3B] dark:text-white">Part Name</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Part Number</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Category</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Quantity</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Min Threshold</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Reorder Point</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Status</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Unit Cost</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Line Value</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item: any) => (
                  <TableRow key={item.inventoryId} className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                    <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{item.partName}</TableCell>
                    <TableCell className="text-[#64748B] font-mono text-sm">{item.partNumber}</TableCell>
                    <TableCell>
                      <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0BB3FF]/10 dark:text-[#0BB3FF] border-0">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-[#0B1F3B] dark:text-white">{item.stockQuantity}</TableCell>
                    <TableCell className="text-right text-[#64748B]">{item.minThreshold}</TableCell>
                    <TableCell className="text-right text-[#64748B]">{item.reorderPoint}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell className="text-right text-[#64748B]">{formatCurrency(item.costPrice)}</TableCell>
                    <TableCell className="text-right font-medium text-[#0B1F3B] dark:text-white">{formatCurrency(item.lineValue)}</TableCell>
                    <TableCell>
                      {(item.status === "low" || item.status === "out_of_stock") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                          onClick={() => handleReorderItem(item)}
                          disabled={reorderingItems.has(item.inventoryId || item.sparePartId)}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          {reorderingItems.has(item.inventoryId || item.sparePartId) ? "Ordering..." : "Reorder"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ========== TAB: SUPPLIERS ==========
  const suppliersContent = (
    <div className="space-y-4">
      {suppliersList.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white mb-2">No Suppliers Found</h3>
          <p className="text-[#64748B]">Add suppliers to track performance and manage orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliersList.map((supplier: any) => (
            <Card key={supplier.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{supplier.name}</CardTitle>
                    {supplier.contactPerson && (
                      <CardDescription className="text-[#64748B]">{supplier.contactPerson}</CardDescription>
                    )}
                  </div>
                  {supplier.overallRating !== null && supplier.overallRating > 0 && (
                    <div className="flex items-center gap-1 bg-[#F97316]/10 text-[#F97316] px-2 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-sm font-semibold">{supplier.overallRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-1.5 text-sm">
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {(supplier.city || supplier.country) && (
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{[supplier.city, supplier.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#232A36]">
                  <div className="text-center p-2 rounded bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <div className="text-xs text-[#64748B]">On-Time Delivery</div>
                    <div className="text-sm font-bold text-[#0B1F3B] dark:text-white">
                      {supplier.onTimeDeliveryRate !== null ? `${supplier.onTimeDeliveryRate}%` : "N/A"}
                    </div>
                  </div>
                  <div className="text-center p-2 rounded bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <div className="text-xs text-[#64748B]">Avg Lead Time</div>
                    <div className="text-sm font-bold text-[#0B1F3B] dark:text-white">
                      {supplier.averageLeadTime !== null ? `${supplier.averageLeadTime} days` : "N/A"}
                    </div>
                  </div>
                  <div className="text-center p-2 rounded bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <div className="text-xs text-[#64748B]">Quality Score</div>
                    <div className="text-sm font-bold text-[#0B1F3B] dark:text-white">
                      {supplier.qualityScore !== null ? `${supplier.qualityScore}/100` : "N/A"}
                    </div>
                  </div>
                  <div className="text-center p-2 rounded bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <div className="text-xs text-[#64748B]">Total Orders</div>
                    <div className="text-sm font-bold text-[#0B1F3B] dark:text-white">{supplier.totalOrders}</div>
                  </div>
                </div>

                {supplier.paymentTerms && (
                  <div className="pt-1">
                    <Badge variant="outline" className="text-xs border-[#E2E8F0] dark:border-[#232A36]">
                      <Clock className="w-3 h-3 mr-1" />
                      {supplier.paymentTerms}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ========== TAB: AUTO-REORDER ==========
  const autoReorderContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">Items Needing Reorder</h3>
          <p className="text-sm text-[#64748B]">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""} below minimum threshold
          </p>
        </div>
        <Button
          onClick={handleBulkReorder}
          disabled={lowStockItems.length === 0 || reorderMutation.isPending}
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {reorderMutation.isPending ? "Processing..." : `Bulk Reorder All (${lowStockItems.length})`}
        </Button>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-0">
          {lowStockLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-[#64748B]">Checking stock levels...</p>
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white mb-2">All Stock Levels Healthy</h3>
              <p className="text-[#64748B]">No items are currently below their minimum threshold.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#0B1F3B] dark:text-white">Part Name</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Part Number</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Category</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Current Stock</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Min Threshold</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Suggested Order Qty</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Est. Cost</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Status</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item: any) => {
                  const suggestedQty = item.suggestedReorderQty || item.minThreshold * 2;
                  const estCost = suggestedQty * (item.costPrice || 0);
                  const itemKey = item.inventoryId || item.sparePartId;

                  return (
                    <TableRow key={itemKey} className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                      <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{item.partName}</TableCell>
                      <TableCell className="text-[#64748B] font-mono text-sm">{item.partNumber}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0BB3FF]/10 dark:text-[#0BB3FF] border-0">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">{item.stockQuantity}</TableCell>
                      <TableCell className="text-right text-[#64748B]">{item.minThreshold}</TableCell>
                      <TableCell className="text-right font-semibold text-[#0B1F3B] dark:text-white">{suggestedQty}</TableCell>
                      <TableCell className="text-right text-[#64748B]">{formatCurrency(estCost)}</TableCell>
                      <TableCell><StatusBadge status={item.status} /></TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleReorderItem(item)}
                          disabled={reorderingItems.has(itemKey)}
                          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          {reorderingItems.has(itemKey) ? "Ordering..." : "Create PO"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <TabsPageLayout
      title="Inventory & Supply Chain"
      description="Complete inventory management with stock monitoring, supplier performance, and automated reordering"
      icon={Warehouse}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={[
        {
          id: "overview",
          label: "Overview",
          icon: Package,
          content: overviewContent,
          badge: overview?.lowStockCount && overview.lowStockCount > 0 ? overview.lowStockCount : undefined,
        },
        {
          id: "stock-levels",
          label: "Stock Levels",
          icon: BarChart3,
          content: stockLevelsContent,
          badge: items.length || undefined,
        },
        {
          id: "suppliers",
          label: "Suppliers",
          icon: Truck,
          content: suppliersContent,
          badge: suppliersList.length || undefined,
        },
        {
          id: "auto-reorder",
          label: "Auto-Reorder",
          icon: RefreshCw,
          content: autoReorderContent,
          badge: lowStockItems.length > 0 ? lowStockItems.length : undefined,
        },
      ]}
    />
  );
}
