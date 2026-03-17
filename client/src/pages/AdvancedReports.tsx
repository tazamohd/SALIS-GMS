import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3, TrendingUp, Users, Package, DollarSign, Wrench,
  Download, AlertTriangle, CheckCircle, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { useToast } from "@/hooks/use-toast";

interface SummaryData {
  totalRevenue: number;
  totalJobs: number;
  completedJobs: number;
  totalCustomers: number;
  totalParts: number;
  lowStockParts: number;
}

interface RevenueRow {
  period: string;
  invoiceCount: string;
  revenue: string;
  tax: string;
}

interface TechnicianRow {
  id: number;
  name: string;
  totalJobs: string;
  completedJobs: string;
  avgHours: string;
  totalRevenue: string;
}

interface InventoryRow {
  name: string;
  partNumber: string;
  category: string;
  stockQuantity: number;
  minQuantity: number;
  sellingPrice: string;
  costPrice: string;
  stockStatus: "low" | "medium" | "healthy";
}

interface CustomerRow {
  id: number;
  name: string;
  email: string;
  totalVisits: string;
  totalSpent: string;
  lastVisit: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#151A23] p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg shadow-lg">
        <p className="font-semibold text-[#0B1F3B] dark:text-white mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">${parseFloat(entry.value).toFixed(2)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function SummaryTab() {
  const { data: summary } = useQuery<SummaryData>({
    queryKey: ["/api/reports/summary"],
  });

  const metrics = [
    {
      title: "Total Revenue",
      value: `$${(summary?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Total Jobs",
      value: summary?.totalJobs || 0,
      icon: Wrench,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Completed Jobs",
      value: summary?.completedJobs || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Total Customers",
      value: summary?.totalCustomers || 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Total Parts",
      value: summary?.totalParts || 0,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Low Stock Parts",
      value: summary?.lowStockParts || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold mt-1">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${metric.bg}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RevenueTab() {
  const [groupBy, setGroupBy] = useState("month");
  const { data } = useQuery<{ data: RevenueRow[]; groupBy: string }>({
    queryKey: ["/api/reports/revenue", groupBy],
    queryFn: async () => {
      const res = await fetch(`/api/reports/revenue?groupBy=${groupBy}`);
      return res.json();
    },
  });

  const chartData = (data?.data || []).map((row) => ({
    period: row.period,
    revenue: parseFloat(row.revenue),
    tax: parseFloat(row.tax),
    invoices: parseInt(row.invoiceCount),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Revenue Over Time</h3>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-6">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="period" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0A5ED7"
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="tax"
                  stroke="#6366F1"
                  strokeWidth={2}
                  name="Tax"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No revenue data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TechnicianTab() {
  const { data } = useQuery<{ data: TechnicianRow[] }>({
    queryKey: ["/api/reports/technician-performance"],
  });

  const technicians = data?.data || [];
  const maxJobs = Math.max(...technicians.map((t) => parseInt(t.totalJobs) || 1), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technician Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Total Jobs</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Avg Hours</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Workload</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicians.length > 0 ? (
              technicians.map((tech) => {
                const total = parseInt(tech.totalJobs) || 0;
                const completed = parseInt(tech.completedJobs) || 0;
                const completionRate = total > 0 ? (completed / total) * 100 : 0;
                return (
                  <TableRow key={tech.id}>
                    <TableCell className="font-medium">{tech.name}</TableCell>
                    <TableCell>{total}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {completed}
                        <Badge variant={completionRate >= 80 ? "default" : completionRate >= 50 ? "secondary" : "destructive"}>
                          {completionRate.toFixed(0)}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{parseFloat(tech.avgHours).toFixed(1)}h</TableCell>
                    <TableCell>${parseFloat(tech.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="w-[150px]">
                      <Progress value={(total / maxJobs) * 100} className="h-2" />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No technician data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function InventoryTab() {
  const { data } = useQuery<{ data: InventoryRow[] }>({
    queryKey: ["/api/reports/inventory-turnover"],
  });

  const items = data?.data || [];

  const statusConfig: Record<string, { variant: "destructive" | "secondary" | "default"; label: string }> = {
    low: { variant: "destructive", label: "Low Stock" },
    medium: { variant: "secondary", label: "Medium" },
    healthy: { variant: "default", label: "Healthy" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Turnover</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Name</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Min Qty</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item, index) => {
                const config = statusConfig[item.stockStatus] || statusConfig.healthy;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.partNumber}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.stockQuantity}</TableCell>
                    <TableCell>{item.minQuantity}</TableCell>
                    <TableCell>${parseFloat(item.costPrice).toFixed(2)}</TableCell>
                    <TableCell>${parseFloat(item.sellingPrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No inventory data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CustomerTab() {
  const { data } = useQuery<{ data: CustomerRow[] }>({
    queryKey: ["/api/reports/customer-analytics"],
  });

  const customers = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total Visits</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.totalVisits}</TableCell>
                  <TableCell>
                    ${parseFloat(customer.totalSpent).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {customer.lastVisit
                      ? new Date(customer.lastVisit).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No customer data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdvancedReports() {
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Export Coming Soon",
      description: "Report export functionality will be available in a future update.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
            Advanced Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive analytics and business intelligence
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="technicians">Technician Performance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <SummaryTab />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueTab />
        </TabsContent>

        <TabsContent value="technicians">
          <TechnicianTab />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
