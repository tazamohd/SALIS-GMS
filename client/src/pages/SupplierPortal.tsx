import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Truck,
  ShoppingCart,
  BarChart3,
  PieChart as PieChartIcon,
  Star,
  Plus,
  Phone,
  Mail,
  MapPin,
  Package,
  Clock,
  TrendingUp,
  DollarSign,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  LineChart,
  Line,
} from "recharts";

const CHART_COLORS = ["#0A5ED7", "#0BB3FF", "#F97316", "#10B981", "#8B5CF6", "#EC4899", "#F59E0B", "#6366F1"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "SAR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatCurrencyDecimal(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "SAR" }).format(value);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    inactive: { label: "Inactive", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    draft: { label: "Draft", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    confirmed: { label: "Confirmed", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
    shipped: { label: "Shipped", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    delivered: { label: "Delivered", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  };
  const v = variants[status] || { label: status, className: "bg-gray-100 text-gray-600" };
  return <Badge className={v.className}>{v.label}</Badge>;
}

// ─── Suppliers Tab ───────────────────────────────────────────────────────────

function SuppliersTab() {
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({ name: "", contactPerson: "", email: "", phone: "", address: "", categories: "", paymentTerms: "Net 30", leadTimeDays: "5" });
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/supplier-portal/suppliers"],
    queryFn: () => apiRequest("GET", "/api/supplier-portal/suppliers").then(r => r.json()),
  });

  const addMutation = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/supplier-portal/suppliers", body).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-portal/suppliers"] });
      setShowAddDialog(false);
      setForm({ name: "", contactPerson: "", email: "", phone: "", address: "", categories: "", paymentTerms: "Net 30", leadTimeDays: "5" });
      toast({ title: "Supplier added", description: "New supplier has been added successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add supplier.", variant: "destructive" });
    },
  });

  const suppliers = (data?.suppliers || []).filter((s: any) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    addMutation.mutate({
      name: form.name,
      contactPerson: form.contactPerson,
      email: form.email,
      phone: form.phone,
      address: form.address,
      categories: form.categories.split(",").map((c: string) => c.trim()).filter(Boolean),
      paymentTerms: form.paymentTerms,
      leadTimeDays: parseInt(form.leadTimeDays) || 5,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading suppliers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {suppliers.map((supplier: any) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <CardDescription>{supplier.contactPerson}</CardDescription>
                  </div>
                  <StatusBadge status={supplier.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <StarRating rating={supplier.rating} />

                <div className="flex flex-wrap gap-1">
                  {supplier.categories.map((cat: string) => (
                    <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                  ))}
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {supplier.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> {supplier.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" /> {supplier.address}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <div className="text-xs text-muted-foreground">Orders</div>
                    <div className="text-lg font-semibold">{supplier.orderCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Total Spend</div>
                    <div className="text-lg font-semibold">{formatCurrency(supplier.totalSpend)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Terms: {supplier.paymentTerms}</span>
                  <span>Lead: {supplier.leadTimeDays} days</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Supplier name" />
              </div>
              <div>
                <Label>Contact Person *</Label>
                <Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} placeholder="Contact name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+966 ..." />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
            </div>
            <div>
              <Label>Categories (comma-separated)</Label>
              <Input value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} placeholder="Engine Parts, Filters, Belts" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Terms</Label>
                <Input value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} placeholder="Net 30" />
              </div>
              <div>
                <Label>Lead Time (days)</Label>
                <Input type="number" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.contactPerson || !form.email || addMutation.isPending}>
              {addMutation.isPending ? "Adding..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Orders Tab ──────────────────────────────────────────────────────────────

function OrdersTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/supplier-portal/orders"],
    queryFn: () => apiRequest("GET", "/api/supplier-portal/orders").then(r => r.json()),
  });

  const orders = (data?.orders || []).filter((o: any) => {
    const matchesSearch = !search || o.poNumber.toLowerCase().includes(search.toLowerCase()) || o.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search PO # or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {["all", "draft", "submitted", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Tracking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">{order.poNumber}</TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <span className="text-sm">
                          {order.items.map((it: any) => it.partName).join(", ")}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({order.items.reduce((s: number, it: any) => s + it.quantity, 0)} items)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrencyDecimal(order.total)}</TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell>
                      <div className="text-sm">{order.expectedDelivery}</div>
                      {order.actualDelivery && (
                        <div className="text-xs text-muted-foreground">
                          Actual: {order.actualDelivery}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.trackingNumber ? (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <ExternalLink className="h-3 w-3" />
                          {order.trackingNumber}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Performance Tab ─────────────────────────────────────────────────────────

function PerformanceTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/supplier-portal/performance"],
    queryFn: () => apiRequest("GET", "/api/supplier-portal/performance").then(r => r.json()),
  });

  const performance = data?.performance || [];

  const barData = performance.map((p: any) => ({
    name: p.supplierName.split(" ").slice(0, 2).join(" "),
    "On-Time %": p.onTimePercent,
    "Quality Score": p.qualityScore,
  }));

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading performance data...</div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Comparison</CardTitle>
              <CardDescription>On-time delivery, quality scores, and response times</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead className="text-center">Total Orders</TableHead>
                    <TableHead className="text-center">On-Time %</TableHead>
                    <TableHead className="text-center">Quality Score</TableHead>
                    <TableHead className="text-center">Avg Response Time</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performance.map((p: any) => (
                    <TableRow key={p.supplierId}>
                      <TableCell className="font-medium">{p.supplierName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.categories.slice(0, 2).map((c: string) => (
                            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                          ))}
                          {p.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{p.categories.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{p.totalOrders}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${p.onTimePercent >= 90 ? "text-green-600" : p.onTimePercent >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                          {p.onTimePercent}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${p.qualityScore >= 90 ? "text-green-600" : p.qualityScore >= 75 ? "text-yellow-600" : "text-red-600"}`}>
                          {p.qualityScore}/100
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {p.avgResponseTimeHours}h
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <StarRating rating={p.rating} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison Chart</CardTitle>
              <CardDescription>Visual comparison of on-time delivery and quality scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="On-Time %" fill="#0A5ED7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Quality Score" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Analytics Tab ───────────────────────────────────────────────────────────

function AnalyticsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/supplier-portal/analytics"],
    queryFn: () => apiRequest("GET", "/api/supplier-portal/analytics").then(r => r.json()),
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>;
  }

  const { spendBySupplier, spendByCategory, monthlySpend, summary } = data || { spendBySupplier: [], spendByCategory: [], monthlySpend: [], summary: {} };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Spend</div>
                <div className="text-xl font-bold">{formatCurrency(summary?.totalSpend || 0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Orders</div>
                <div className="text-xl font-bold">{summary?.totalOrders || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg Order Value</div>
                <div className="text-xl font-bold">{formatCurrency(summary?.avgOrderValue || 0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Active Suppliers</div>
                <div className="text-xl font-bold">{summary?.activeSuppliers || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Supplier Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Supplier</CardTitle>
            <CardDescription>Distribution of total procurement spend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={spendBySupplier}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name.split(" ").slice(0, 2).join(" ")} (${(percent * 100).toFixed(0)}%)`}
                  labelLine
                >
                  {spendBySupplier.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spend by Category Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
            <CardDescription>Procurement breakdown by parts category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={spendByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#0A5ED7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Spend Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spend Trend</CardTitle>
          <CardDescription>Procurement spending over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlySpend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: number, name: string) => name === "spend" ? formatCurrency(value) : value} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#0A5ED7" strokeWidth={2} dot={{ r: 4 }} name="Spend (SAR)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SupplierPortal() {
  const [activeTab, setActiveTab] = useState("suppliers");

  return (
    <TabsPageLayout
      title="Supplier Portal"
      description="Manage suppliers, purchase orders, performance, and procurement analytics"
      icon={Truck}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={[
        {
          id: "suppliers",
          label: "Suppliers",
          icon: Truck,
          content: <SuppliersTab />,
        },
        {
          id: "orders",
          label: "Orders",
          icon: ShoppingCart,
          content: <OrdersTab />,
        },
        {
          id: "performance",
          label: "Performance",
          icon: BarChart3,
          content: <PerformanceTab />,
        },
        {
          id: "analytics",
          label: "Analytics",
          icon: PieChartIcon,
          content: <AnalyticsTab />,
        },
      ]}
    />
  );
}
