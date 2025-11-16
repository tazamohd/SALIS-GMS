import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, FileText, Package, Building2, Users, UserCheck, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

const COLORS = ['#000000', '#404040', '#737373', '#a3a3a3', '#d4d4d4', '#e5e5e5'];

const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-salis-black p-3 border border-gray-200 dark:border-salis-gray-dark rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
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

const CustomCountTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-salis-black p-3 border border-gray-200 dark:border-salis-gray-dark rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPercentTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-salis-black p-3 border border-gray-200 dark:border-salis-gray-dark rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value.toFixed(1)}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Reports() {
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const buildQueryUrl = (base: string) => {
    const params = new URLSearchParams();
    if (selectedGarageId !== "all") params.append("garage_id", selectedGarageId);
    if (dateRange.from) params.append("start_date", dateRange.from.toISOString());
    if (dateRange.to) params.append("end_date", dateRange.to.toISOString());
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  };

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

  const revenueUrl = buildQueryUrl("/api/reports/revenue");
  const { data: revenueReport, isLoading: revenueLoading } = useQuery<{
    totalRevenue: string;
    paidAmount: string;
    pendingAmount: string;
    invoicesByStatus: { status: string; count: number; total: string }[];
    revenueByMonth: { month: string; revenue: string }[];
    paymentsByMethod: { method: string; total: string; count: number }[];
    comparison?: {
      previousMonth: {
        revenue: number;
        change: number;
        percentChange: number;
      };
      previousYear: {
        revenue: number;
        change: number;
        percentChange: number;
      };
    };
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

  const inventoryUrl = buildQueryUrl("/api/reports/inventory");
  const { data: inventoryReport, isLoading: inventoryLoading } = useQuery<{
    totalTools: number;
    availableTools: number;
    inUseTools: number;
    toolsByCategory: { category: string; count: number }[];
  }>({
    queryKey: [inventoryUrl],
  });

  const technicianPerformanceUrl = buildQueryUrl("/api/reports/technician-performance");
  const { data: technicianPerformance, isLoading: technicianLoading } = useQuery<{
    technicians: {
      id: string;
      name: string;
      jobsCompleted: number;
      avgCompletionTime: number;
      revenueGenerated: number;
      efficiencyRating: number;
      jobsByStatus: { status: string; count: number }[];
    }[];
  }>({
    queryKey: [technicianPerformanceUrl],
  });

  const customerAnalyticsUrl = buildQueryUrl("/api/reports/customer-analytics");
  const { data: customerAnalytics, isLoading: customerLoading } = useQuery<{
    customers: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      lifetimeValue: number;
      totalInvoices: number;
      totalVisits: number;
      avgInvoiceValue: number;
      lastVisit: Date | null;
      status: string;
    }[];
  }>({
    queryKey: [customerAnalyticsUrl],
  });

  const overviewTabContent = (
    <div className="space-y-6">
      {overviewLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white/60">Loading overview...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${overview?.totalRevenue || "0"}</div>
              <p className="text-xs text-gray-900 dark:text-white/60 mt-1">All time</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalInvoices || 0}</div>
              <p className="text-xs text-gray-900 dark:text-white/60 mt-1">{overview?.pendingInvoices || 0} pending</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Job Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalJobCards || 0}</div>
              <p className="text-xs text-gray-900 dark:text-white/60 mt-1">{overview?.activeJobCards || 0} active</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalCustomers || 0}</div>
              <p className="text-xs text-gray-900 dark:text-white/60 mt-1">Total registered</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const revenueTabContent = (
    <div className="space-y-6">
      {revenueLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white/60">Loading revenue data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">${revenueReport?.totalRevenue || "0"}</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Paid Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">${revenueReport?.paidAmount || "0"}</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">${revenueReport?.pendingAmount || "0"}</div>
              </CardContent>
            </Card>
          </div>

          {revenueReport?.comparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Month-over-Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-900 dark:text-white/60">Previous Month</span>
                      <span className="text-sm font-medium">${revenueReport.comparison.previousMonth.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {revenueReport.comparison.previousMonth.change >= 0 ? (
                        <ArrowUp className="w-4 h-4 text-gray-800 dark:text-gray-200" data-testid="icon-mom-up" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-gray-900 dark:text-white" data-testid="icon-mom-down" />
                      )}
                      <span className={`text-xl font-bold ${revenueReport.comparison.previousMonth.change >= 0 ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`} data-testid="text-mom-change">
                        {revenueReport.comparison.previousMonth.change >= 0 ? '+' : ''}${revenueReport.comparison.previousMonth.change.toFixed(2)}
                      </span>
                      <span className={`text-sm ${revenueReport.comparison.previousMonth.percentChange >= 0 ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`} data-testid="text-mom-percent">
                        ({revenueReport.comparison.previousMonth.percentChange >= 0 ? '+' : ''}{revenueReport.comparison.previousMonth.percentChange.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Year-over-Year</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-900 dark:text-white/60">Same Period Last Year</span>
                      <span className="text-sm font-medium">${revenueReport.comparison.previousYear.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {revenueReport.comparison.previousYear.change >= 0 ? (
                        <ArrowUp className="w-4 h-4 text-gray-800 dark:text-gray-200" data-testid="icon-yoy-up" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-gray-900 dark:text-white" data-testid="icon-yoy-down" />
                      )}
                      <span className={`text-xl font-bold ${revenueReport.comparison.previousYear.change >= 0 ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`} data-testid="text-yoy-change">
                        {revenueReport.comparison.previousYear.change >= 0 ? '+' : ''}${revenueReport.comparison.previousYear.change.toFixed(2)}
                      </span>
                      <span className={`text-sm ${revenueReport.comparison.previousYear.percentChange >= 0 ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`} data-testid="text-yoy-percent">
                        ({revenueReport.comparison.previousYear.percentChange >= 0 ? '+' : ''}{revenueReport.comparison.previousYear.percentChange.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {revenueReport?.revenueByMonth && revenueReport.revenueByMonth.length > 0 && (
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueReport.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomCurrencyTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {revenueReport?.invoicesByStatus && revenueReport.invoicesByStatus.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Invoices by Status</CardTitle>
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

              {revenueReport?.paymentsByMethod && revenueReport.paymentsByMethod.length > 0 && (
                <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Payments by Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={revenueReport.paymentsByMethod}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="method" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip content={<CustomCurrencyTooltip />} />
                        <Bar dataKey="total" fill="#404040" name="Total Amount" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  const jobCardsTabContent = (
    <div className="space-y-6">
      {jobCardsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white/60">Loading job card analytics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Job Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobCardAnalytics?.totalJobCards || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg. Completion Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobCardAnalytics?.averageCompletionTime || 0}h</div>
              </CardContent>
            </Card>
          </div>

          {jobCardAnalytics?.byStatus && jobCardAnalytics.byStatus.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Job Cards by Status</CardTitle>
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
                <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Job Cards by Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={jobCardAnalytics.byPriority}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="priority" />
                        <YAxis />
                        <Tooltip content={<CustomCountTooltip />} />
                        <Bar dataKey="count" fill="#8b5cf6" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  const techniciansTabContent = (
    <div className="space-y-6">
      {technicianLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white/60">Loading technician performance...</p>
        </div>
      ) : (
        <>
          {technicianPerformance?.technicians && technicianPerformance.technicians.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {technicianPerformance.technicians.map((tech) => (
                  <Card key={tech.id} data-testid={`card-technician-${tech.id}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold">{tech.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Jobs Completed</span>
                        <span className="font-semibold text-gray-900 dark:text-white" data-testid={`text-jobs-${tech.id}`}>
                          {tech.jobsCompleted}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. Completion</span>
                        <span className="font-semibold" data-testid={`text-avg-time-${tech.id}`}>
                          {tech.avgCompletionTime} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Revenue Generated</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200" data-testid={`text-revenue-${tech.id}`}>
                          ${tech.revenueGenerated.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Efficiency Rating</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" data-testid={`text-efficiency-${tech.id}`}>
                            {tech.efficiencyRating}%
                          </span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-700 dark:bg-gray-400 rounded-full"
                              style={{ width: `${tech.efficiencyRating}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {tech.jobsByStatus && tech.jobsByStatus.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs text-gray-900 dark:text-white/60 mb-2">Job Status Breakdown</div>
                          <div className="grid grid-cols-2 gap-2">
                            {tech.jobsByStatus.map((status) => (
                              <div key={status.status} className="flex justify-between text-xs">
                                <span className="text-gray-600 capitalize">{status.status}:</span>
                                <span className="font-medium">{status.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Jobs Completed by Technician</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={technicianPerformance.technicians}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomCountTooltip />} />
                        <Legend />
                        <Bar dataKey="jobsCompleted" fill="#3b82f6" name="Jobs Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Revenue Generated by Technician</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={technicianPerformance.technicians}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip content={<CustomCurrencyTooltip />} />
                        <Legend />
                        <Bar dataKey="revenueGenerated" fill="#404040" name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Average Completion Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={technicianPerformance.technicians}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomCountTooltip />} />
                        <Legend />
                        <Bar dataKey="avgCompletionTime" fill="#f59e0b" name="Avg. Days" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Efficiency Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={technicianPerformance.technicians}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip content={<CustomPercentTooltip />} />
                        <Legend />
                        <Bar dataKey="efficiencyRating" fill="#8b5cf6" name="Efficiency" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-900 dark:text-white/50 mb-4" />
              <p className="text-gray-900 dark:text-white/60 text-lg">No technician performance data available</p>
              <p className="text-gray-900 dark:text-white/50 text-sm mt-2">
                Technicians will appear here once they start completing jobs
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  const customersTabContent = (
    <div className="space-y-6">
      {customerLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white/60">Loading customer analytics...</p>
        </div>
      ) : (
        <>
          {customerAnalytics?.customers && customerAnalytics.customers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customerAnalytics.customers.slice(0, 10).map((customer) => (
                  <Card key={customer.id} data-testid={`card-customer-${customer.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{customer.name}</CardTitle>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            customer.status === 'active' ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                            customer.status === 'recent' ? 'bg-gray-100 dark:bg-salis-gray-dark text-gray-900 dark:text-white' :
                            'bg-gray-100 dark:bg-salis-gray-dark text-gray-700 dark:text-gray-300'
                          }`}
                          data-testid={`status-${customer.id}`}
                        >
                          {customer.status}
                        </span>
                      </div>
                      {customer.email && (
                        <p className="text-xs text-gray-900 dark:text-white/60 truncate">{customer.email}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Lifetime Value</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200" data-testid={`text-ltv-${customer.id}`}>
                          ${customer.lifetimeValue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Invoices</span>
                        <span className="font-semibold" data-testid={`text-invoices-${customer.id}`}>
                          {customer.totalInvoices}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Visits</span>
                        <span className="font-semibold" data-testid={`text-visits-${customer.id}`}>
                          {customer.totalVisits}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. Invoice</span>
                        <span className="font-semibold" data-testid={`text-avg-invoice-${customer.id}`}>
                          ${customer.avgInvoiceValue.toFixed(2)}
                        </span>
                      </div>
                      {customer.lastVisit && (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-xs text-gray-900 dark:text-white/60">Last Visit</span>
                          <span className="text-xs font-medium">
                            {new Date(customer.lastVisit).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Top 10 Customers by Lifetime Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={customerAnalytics.customers.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip content={<CustomCurrencyTooltip />} />
                        <Legend />
                        <Bar dataKey="lifetimeValue" fill="#404040" name="Lifetime Value" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Visit Frequency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={customerAnalytics.customers.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip content={<CustomCountTooltip />} />
                        <Legend />
                        <Bar dataKey="totalVisits" fill="#3b82f6" name="Total Visits" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Average Invoice Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={customerAnalytics.customers.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip content={<CustomCurrencyTooltip />} />
                        <Legend />
                        <Bar dataKey="avgInvoiceValue" fill="#f59e0b" name="Avg. Invoice" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Customer Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Active', value: customerAnalytics.customers.filter(c => c.status === 'active').length },
                            { name: 'Recent', value: customerAnalytics.customers.filter(c => c.status === 'recent').length },
                            { name: 'Inactive', value: customerAnalytics.customers.filter(c => c.status === 'inactive').length },
                          ].filter(item => item.value > 0)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {[
                            { name: 'Active', value: customerAnalytics.customers.filter(c => c.status === 'active').length },
                            { name: 'Recent', value: customerAnalytics.customers.filter(c => c.status === 'recent').length },
                            { name: 'Inactive', value: customerAnalytics.customers.filter(c => c.status === 'inactive').length },
                          ].filter(item => item.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 mx-auto text-gray-900 dark:text-white/50 mb-4" />
              <p className="text-gray-900 dark:text-white/60 text-lg">No customer data available</p>
              <p className="text-gray-900 dark:text-white/50 text-sm mt-2">
                Customer analytics will appear here once you have invoices and appointments
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  const inventoryTabContent = (
    <div className="space-y-6">
      {inventoryLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white/60">Loading inventory data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryReport?.totalTools || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{inventoryReport?.availableTools || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">In Use</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{inventoryReport?.inUseTools || 0}</div>
              </CardContent>
            </Card>
          </div>

          {inventoryReport?.toolsByCategory && inventoryReport.toolsByCategory.length > 0 && (
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Tools by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryReport.toolsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip content={<CustomCountTooltip />} />
                    <Bar dataKey="count" fill="#06b6d4" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const headerContent = (
    <div className="flex gap-2 mb-6">
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
  );

  return (
    <TabsPageLayout
      title="Reports & Analytics"
      description="Comprehensive business insights and metrics"
      icon={BarChart3}
      headerContent={headerContent}
      defaultTab="overview"
      tabs={[
        {
          id: "overview",
          label: "Overview",
          icon: BarChart3,
          content: overviewTabContent,
        },
        {
          id: "revenue",
          label: "Revenue",
          icon: TrendingUp,
          content: revenueTabContent,
        },
        {
          id: "job-cards",
          label: "Job Cards",
          icon: FileText,
          content: jobCardsTabContent,
        },
        {
          id: "technicians",
          label: "Technicians",
          icon: Users,
          content: techniciansTabContent,
        },
        {
          id: "customers",
          label: "Customers",
          icon: UserCheck,
          content: customersTabContent,
        },
        {
          id: "inventory",
          label: "Inventory",
          icon: Package,
          content: inventoryTabContent,
        },
      ]}
    />
  );
}
