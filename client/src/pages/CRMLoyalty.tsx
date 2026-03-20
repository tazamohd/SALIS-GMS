import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TabsPageLayout } from "@/components/layouts";
import {
  Users,
  Trophy,
  TrendingUp,
  TrendingDown,
  Gift,
  Target,
  Search,
  Star,
  DollarSign,
  UserCheck,
  UserX,
  BarChart3,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Award,
  Repeat,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TIER_COLORS: Record<string, string> = {
  Platinum: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  Gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Silver: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  Bronze: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const SEGMENT_COLORS: Record<string, string> = {
  New: "#3b82f6",
  Regular: "#22c55e",
  VIP: "#a855f7",
  "At-Risk": "#f59e0b",
  Churned: "#ef4444",
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ef4444"];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(v);
}

function formatDate(d: string | null | undefined) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Customers Tab
// ---------------------------------------------------------------------------
function CustomersTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);

  // Debounce search
  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as any).__crmSearchTimeout);
    (window as any).__crmSearchTimeout = setTimeout(() => setDebouncedSearch(v), 400);
  };

  const { data, isLoading } = useQuery<{ customers: any[] }>({
    queryKey: ["/api/crm/customers", debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch
        ? `/api/crm/customers?search=${encodeURIComponent(debouncedSearch)}`
        : "/api/crm/customers";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: detail } = useQuery({
    queryKey: ["/api/crm/customers", detailId],
    queryFn: async () => {
      const res = await fetch(`/api/crm/customers/${detailId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!detailId,
  });

  const customers = data?.customers || [];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or phone..."
          className="pl-9"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Visits</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Loyalty Tier</TableHead>
                <TableHead>Last Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c: any) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setDetailId(c.id)}
                  >
                    <TableCell className="font-medium">{c.fullName || "Unknown"}</TableCell>
                    <TableCell>{c.phone || "-"}</TableCell>
                    <TableCell>{c.email || "-"}</TableCell>
                    <TableCell className="text-center">{c.visitCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(c.totalSpend))}</TableCell>
                    <TableCell>
                      <Badge className={TIER_COLORS[c.loyaltyTier] || ""}>
                        {c.loyaltyTier}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(c.lastVisit)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.customer?.fullName || "Customer Detail"}</DialogTitle>
            <DialogDescription>Full customer history and activity</DialogDescription>
          </DialogHeader>
          {detail?.customer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Visits</p>
                  <p className="text-xl font-bold">{detail.customer.visitCount}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold">{formatCurrency(Number(detail.customer.totalSpend))}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Tier</p>
                  <Badge className={TIER_COLORS[detail.customer.loyaltyTier]}>{detail.customer.loyaltyTier}</Badge>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Last Visit</p>
                  <p className="text-sm font-medium">{formatDate(detail.customer.lastVisit)}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {detail.customer.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {detail.customer.phone || "N/A"}</span>
              </div>

              {/* Recent Jobs */}
              {detail.jobs?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Jobs ({detail.jobs.length})</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {detail.jobs.slice(0, 10).map((j: any) => (
                      <div key={j.id} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-1.5">
                        <span>{j.jobNumber} - {j.serviceType}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{j.status}</Badge>
                          <span>{formatCurrency(Number(j.totalCost || 0))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Invoices */}
              {detail.invoices?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Invoices ({detail.invoices.length})</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {detail.invoices.slice(0, 10).map((inv: any) => (
                      <div key={inv.id} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-1.5">
                        <span>{inv.invoiceNumber}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{inv.status}</Badge>
                          <span>{formatCurrency(Number(inv.totalAmount || 0))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segments Tab
// ---------------------------------------------------------------------------
function SegmentsTab() {
  const { data, isLoading } = useQuery<{ segments: any[]; total: number }>({
    queryKey: ["/api/crm/segments"],
    queryFn: async () => {
      const res = await fetch("/api/crm/segments");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const segments = data?.segments || [];
  const total = data?.total || 0;
  const chartData = segments.map((s: any) => ({
    name: s.segment,
    value: s.count,
    fill: SEGMENT_COLORS[s.segment] || "#94a3b8",
  }));

  const SEGMENT_ICONS: Record<string, any> = {
    New: Star,
    Regular: UserCheck,
    VIP: Trophy,
    "At-Risk": AlertTriangle,
    Churned: UserX,
  };

  return (
    <div className="space-y-6">
      {/* Segment cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["New", "Regular", "VIP", "At-Risk", "Churned"].map((seg) => {
          const found = segments.find((s: any) => s.segment === seg);
          const Icon = SEGMENT_ICONS[seg] || Users;
          return (
            <Card key={seg}>
              <CardContent className="pt-4 pb-3 px-4 text-center">
                <Icon
                  className="h-8 w-8 mx-auto mb-2"
                  style={{ color: SEGMENT_COLORS[seg] }}
                />
                <p className="text-sm font-medium">{seg}</p>
                <p className="text-2xl font-bold">{found?.count || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {found?.percentage || 0}% of total
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pie chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" /> Segment Distribution
          </CardTitle>
          <CardDescription>
            {total} total customers across all segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : chartData.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No segment data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  dataKey="value"
                >
                  {chartData.map((entry: any, i: number) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={entry.fill || PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loyalty Program Tab
// ---------------------------------------------------------------------------
function LoyaltyTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [awardOpen, setAwardOpen] = useState(false);
  const [awardForm, setAwardForm] = useState({ customerId: "", points: "", reason: "" });

  const { data, isLoading } = useQuery<{
    totalMembers: number;
    pointsIssued: number;
    pointsRedeemed: number;
    activeCampaigns: number;
    tierDistribution: any[];
  }>({
    queryKey: ["/api/crm/loyalty/summary"],
    queryFn: async () => {
      const res = await fetch("/api/crm/loyalty/summary");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const awardMutation = useMutation({
    mutationFn: async (body: { customerId: string; points: number; reason: string }) => {
      const res = await fetch("/api/crm/loyalty/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Points awarded successfully" });
      setAwardOpen(false);
      setAwardForm({ customerId: "", points: "", reason: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/loyalty/summary"] });
    },
    onError: () => {
      toast({ title: "Failed to award points", variant: "destructive" });
    },
  });

  const tierData = (data?.tierDistribution || []).map((t: any) => ({
    name: t.tier,
    count: t.count,
    fill:
      t.tier === "Platinum" ? "#8b5cf6" :
      t.tier === "Gold" ? "#eab308" :
      t.tier === "Silver" ? "#94a3b8" : "#f97316",
  }));

  const summaryCards = [
    { label: "Total Members", value: data?.totalMembers || 0, icon: Users, color: "text-blue-600" },
    { label: "Points Issued", value: (data?.pointsIssued || 0).toLocaleString(), icon: Gift, color: "text-green-600" },
    { label: "Points Redeemed", value: (data?.pointsRedeemed || 0).toLocaleString(), icon: Award, color: "text-purple-600" },
    { label: "Active Campaigns", value: data?.activeCampaigns || 0, icon: Target, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Award points button */}
      <div className="flex justify-end">
        <Button onClick={() => setAwardOpen(true)}>
          <Gift className="h-4 w-4 mr-2" /> Award Points
        </Button>
      </div>

      {/* Tier distribution chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" /> Tier Distribution
          </CardTitle>
          <CardDescription>Number of members in each loyalty tier</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : tierData.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No tier data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tierData.map((entry: any, i: number) => (
                    <Cell key={`cell-${i}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Award dialog */}
      <Dialog open={awardOpen} onOpenChange={setAwardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Loyalty Points</DialogTitle>
            <DialogDescription>Manually award points to a customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer ID</Label>
              <Input
                placeholder="Enter customer ID"
                value={awardForm.customerId}
                onChange={(e) => setAwardForm((f) => ({ ...f, customerId: e.target.value }))}
              />
            </div>
            <div>
              <Label>Points</Label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={awardForm.points}
                onChange={(e) => setAwardForm((f) => ({ ...f, points: e.target.value }))}
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                placeholder="Reason for awarding points"
                value={awardForm.reason}
                onChange={(e) => setAwardForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAwardOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                awardMutation.mutate({
                  customerId: awardForm.customerId,
                  points: Number(awardForm.points),
                  reason: awardForm.reason,
                })
              }
              disabled={!awardForm.customerId || !awardForm.points || awardMutation.isPending}
            >
              {awardMutation.isPending ? "Awarding..." : "Award Points"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Retention Tab
// ---------------------------------------------------------------------------
function RetentionTab() {
  const { data, isLoading } = useQuery<{
    repeatRate: number;
    churnRate: number;
    avgLifetimeValue: number;
    maxLifetimeValue: number;
    avgVisits: number;
    totalCustomers: number;
    repeatCustomers: number;
    churnRiskCustomers: any[];
    retentionTrend: any[];
  }>({
    queryKey: ["/api/crm/retention"],
    queryFn: async () => {
      const res = await fetch("/api/crm/retention");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const metricCards = [
    {
      label: "Repeat Rate",
      value: `${data?.repeatRate || 0}%`,
      icon: Repeat,
      color: "text-green-600",
      description: "Customers with more than 1 visit",
    },
    {
      label: "Churn Rate",
      value: `${data?.churnRate || 0}%`,
      icon: TrendingDown,
      color: "text-red-600",
      description: "One-time customers",
    },
    {
      label: "Avg Lifetime Value",
      value: formatCurrency(data?.avgLifetimeValue || 0),
      icon: DollarSign,
      color: "text-blue-600",
      description: "Average revenue per customer",
    },
    {
      label: "Avg Visits",
      value: data?.avgVisits || 0,
      icon: Calendar,
      color: "text-purple-600",
      description: "Average visits per customer",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Retention trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Retention Rate Trend
          </CardTitle>
          <CardDescription>Monthly retention rate over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : !data?.retentionTrend?.length ? (
            <p className="text-center py-8 text-muted-foreground">No trend data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.retentionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis unit="%" />
                <Tooltip formatter={(value: any) => [`${value}%`, "Retention Rate"]} />
                <Line
                  type="monotone"
                  dataKey="retentionRate"
                  stroke="#0A5ED7"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Retention Rate"
                />
                <Line
                  type="monotone"
                  dataKey="activeCustomers"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Active Customers"
                  yAxisId={0}
                  hide
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Churn risk customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Churn Risk Customers
          </CardTitle>
          <CardDescription>
            Customers who have not visited in over 60 days
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">Visits</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !data?.churnRiskCustomers?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No at-risk customers found
                  </TableCell>
                </TableRow>
              ) : (
                data.churnRiskCustomers.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.fullName || "Unknown"}</TableCell>
                    <TableCell>{c.email || "-"}</TableCell>
                    <TableCell>{c.phone || "-"}</TableCell>
                    <TableCell className="text-center">{c.visitCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(c.totalSpend))}</TableCell>
                    <TableCell>{formatDate(c.lastVisit)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* LTV card */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-sm text-muted-foreground">Max Lifetime Value</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(data?.maxLifetimeValue || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Highest-spending customer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-sm text-muted-foreground">Repeat Customers</p>
            <p className="text-3xl font-bold mt-1">
              {data?.repeatCustomers || 0}{" "}
              <span className="text-base font-normal text-muted-foreground">
                / {data?.totalCustomers || 0}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">Customers who came back</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaigns Tab (Bonus)
// ---------------------------------------------------------------------------
function CampaignsTab() {
  const { data, isLoading } = useQuery<{ campaigns: any[] }>({
    queryKey: ["/api/crm/campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/crm/campaigns");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const campaigns = data?.campaigns || [];
  const statusColor: Record<string, string> = {
    Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    Paused: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Marketing Campaigns
          </CardTitle>
          <CardDescription>Campaign performance and ROI tracking</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead className="text-center">Sent</TableHead>
                <TableHead className="text-center">Opened</TableHead>
                <TableHead className="text-center">Converted</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">ROI %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    No campaigns found
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.type}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[c.status] || ""}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>{c.targetSegment}</TableCell>
                    <TableCell className="text-center">{c.sent}</TableCell>
                    <TableCell className="text-center">{c.opened}</TableCell>
                    <TableCell className="text-center">{c.converted}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.revenue)}</TableCell>
                    <TableCell className="text-right">
                      {c.roi > 0 ? (
                        <span className="text-green-600 font-medium">{c.roi}%</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main CRM & Loyalty Page
// ---------------------------------------------------------------------------
export default function CRMLoyalty() {
  const [activeTab, setActiveTab] = useState("customers");

  return (
    <TabsPageLayout
      title="CRM & Loyalty Program"
      description="Manage customer relationships, loyalty tiers, and retention strategies"
      icon={Users}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={[
        {
          id: "customers",
          label: "Customers",
          icon: Users,
          content: <CustomersTab />,
        },
        {
          id: "segments",
          label: "Segments",
          icon: Target,
          content: <SegmentsTab />,
        },
        {
          id: "loyalty",
          label: "Loyalty Program",
          icon: Trophy,
          content: <LoyaltyTab />,
        },
        {
          id: "retention",
          label: "Retention",
          icon: TrendingUp,
          content: <RetentionTab />,
        },
        {
          id: "campaigns",
          label: "Campaigns",
          icon: BarChart3,
          content: <CampaignsTab />,
        },
      ]}
    />
  );
}
