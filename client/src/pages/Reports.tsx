import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, FileText, Package, Building2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DateRangePicker, type DateRange } from "@/components/DateRangePicker";
import { subDays } from "date-fns";
import type { Garage } from "@shared/schema";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function Reports() {
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const overviewUrl = `/api/reports/overview${selectedGarageId !== "all" ? `?garage_id=${selectedGarageId}` : ""}`;
  const { data: overview, isLoading: overviewLoading } = useQuery<{
    totalRevenue: string;
    totalInvoices: number;
    totalJobCards: number;
    totalCustomers: number;
    pendingInvoices: number;
    activeJobCards: number;
  }>({
    queryKey: [overviewUrl],
  });

  const buildQueryUrl = (base: string) => {
    const params = new URLSearchParams();
    if (selectedGarageId !== "all") params.append("garage_id", selectedGarageId);
    if (dateRange.from) params.append("start_date", dateRange.from.toISOString());
    if (dateRange.to) params.append("end_date", dateRange.to.toISOString());
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  };

  const revenueUrl = buildQueryUrl("/api/reports/revenue");
  const { data: revenueReport, isLoading: revenueLoading } = useQuery<{
    totalRevenue: string;
    paidAmount: string;
    pendingAmount: string;
    invoicesByStatus: { status: string; count: number; total: string }[];
    revenueByMonth: { month: string; revenue: string }[];
    paymentsByMethod: { method: string; total: string; count: number }[];
  }>({
    queryKey: [revenueUrl],
  });

  const jobCardsUrl = buildQueryUrl("/api/reports/job-cards");
  const { data: jobCardAnalytics, isLoading: jobCardsLoading } = useQuery<{
    totalJobCards: number;
    byStatus: { status: string; count: number }[];
    byPriority: { priority: string; count: number }[];
    averageCompletionTime: number;
  }>({
    queryKey: [jobCardsUrl],
  });

  const inventoryUrl = `/api/reports/inventory${selectedGarageId !== "all" ? `?garage_id=${selectedGarageId}` : ""}`;
  const { data: inventoryReport, isLoading: inventoryLoading } = useQuery<{
    totalTools: number;
    availableTools: number;
    inUseTools: number;
    toolsByCategory: { category: string; count: number }[];
  }>({
    queryKey: [inventoryUrl],
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-[#222029]">
            Reports & Analytics
          </h1>
          <p className="font-['Poppins',Helvetica] font-normal text-sm text-[#999999] mt-1">
            Comprehensive business insights and metrics
          </p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-[280px]"
          />
          <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
            <SelectTrigger className="w-[200px]" data-testid="select-garage-filter">
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" data-testid="tab-revenue">
            <TrendingUp className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="job-cards" data-testid="tab-job-cards">
            <FileText className="w-4 h-4 mr-2" />
            Job Cards
          </TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">
            <Package className="w-4 h-4 mr-2" />
            Inventory
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {overviewLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading overview...</p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${overview?.totalRevenue || "0"}</div>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview?.totalInvoices || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">{overview?.pendingInvoices || 0} pending</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Job Cards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview?.totalJobCards || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">{overview?.activeJobCards || 0} active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview?.totalCustomers || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">Total registered</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {revenueLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading revenue data...</p>
            </div>
          ) : (
            <>
              {/* Revenue Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">${revenueReport?.totalRevenue || "0"}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Paid Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">${revenueReport?.paidAmount || "0"}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">${revenueReport?.pendingAmount || "0"}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue by Month Chart */}
              {revenueReport?.revenueByMonth && revenueReport.revenueByMonth.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueReport.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Invoices by Status */}
              {revenueReport?.invoicesByStatus && revenueReport.invoicesByStatus.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Invoices by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={revenueReport.invoicesByStatus}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {revenueReport.invoicesByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Payments by Method */}
                  {revenueReport?.paymentsByMethod && revenueReport.paymentsByMethod.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Payments by Method</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={revenueReport.paymentsByMethod}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="method" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Job Cards Tab */}
        <TabsContent value="job-cards" className="space-y-6">
          {jobCardsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading job card analytics...</p>
            </div>
          ) : (
            <>
              {/* Job Card Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Job Cards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{jobCardAnalytics?.totalJobCards || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Avg. Completion Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{jobCardAnalytics?.averageCompletionTime || 0}h</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {jobCardAnalytics?.byStatus && jobCardAnalytics.byStatus.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Cards by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={jobCardAnalytics.byStatus}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {jobCardAnalytics.byStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {jobCardAnalytics?.byPriority && jobCardAnalytics.byPriority.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Job Cards by Priority</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={jobCardAnalytics.byPriority}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="priority" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {inventoryLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading inventory data...</p>
            </div>
          ) : (
            <>
              {/* Inventory Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inventoryReport?.totalTools || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{inventoryReport?.availableTools || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">In Use</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{inventoryReport?.inUseTools || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tools by Category */}
              {inventoryReport?.toolsByCategory && inventoryReport.toolsByCategory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tools by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={inventoryReport.toolsByCategory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#06b6d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
