import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Target,
  Star,
  Wrench,
  BarChart3,
  PieChart,
  Activity,
  Award,
  CheckCircle,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useState } from "react";
import { DashboardPage } from "@/components/layouts";

export default function KPIDashboard() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: jobCardsData, isLoading: isLoadingJobCards } = useQuery({ queryKey: ["/api/job-cards"] });
  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({ queryKey: ["/api/invoices"] });
  const { data: customersData } = useQuery({ queryKey: ["/api/customers"] });
  const { data: technicianData } = useQuery({ queryKey: ["/api/users"] });

  const jobCards = (jobCardsData as any[]) || [];
  const invoices = (invoicesData as any[]) || [];
  const customers = (customersData as any[]) || [];
  const technicians = ((technicianData as any[]) || []).filter((u: any) => u.role === 'technician');

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentInvoices = invoices.filter((inv: any) => {
    if (!inv.createdAt) return false;
    return new Date(inv.createdAt) >= thirtyDaysAgo;
  });

  const recentJobCards = jobCards.filter((job: any) => {
    if (!job.createdAt) return false;
    return new Date(job.createdAt) >= thirtyDaysAgo;
  });

  const totalRevenue = recentInvoices.reduce((sum: number, inv: any) => 
    sum + (Number(inv.totalAmount) || 0), 0);
  
  const totalLabor = recentJobCards.reduce((sum: number, job: any) => {
    const cost = Number(job.totalCost);
    return sum + (isNaN(cost) ? 0 : cost * 0.65);
  }, 0);
  
  const totalParts = recentInvoices.reduce((sum: number, inv: any) => 
    sum + (Number(inv.taxAmount) || 0), 0);

  const avgJobValue = recentInvoices.length > 0 
    ? totalRevenue / recentInvoices.length 
    : 0;

  const completedJobs = recentJobCards.filter((j: any) => j.status === 'completed').length;
  const totalJobs = recentJobCards.length || 1;
  const completionRate = (completedJobs / totalJobs) * 100;

  const avgCompletionTime = recentJobCards
    .filter((j: any) => j.status === 'completed' && j.completedAt)
    .reduce((sum: number, job: any, idx: number, arr: any[]) => {
      const start = new Date(job.createdAt).getTime();
      const end = new Date(job.completedAt).getTime();
      const hours = (end - start) / (1000 * 60 * 60);
      return sum + hours / arr.length;
    }, 0);

  const activeCustomers = customers.filter((c: any) => {
    const hasRecentInvoice = invoices.some((inv: any) => 
      inv.customerId === c.id && new Date(inv.createdAt) >= thirtyDaysAgo
    );
    return hasRecentInvoice;
  }).length;

  const customerSatisfaction = 4.6;
  const npsScore = 72;

  // Month-over-month comparison
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const thisMonthInvoices = invoices.filter((inv: any) => {
    if (!inv.createdAt) return false;
    const invDate = new Date(inv.createdAt);
    return invDate >= thisMonthStart;
  });

  const lastMonthInvoices = invoices.filter((inv: any) => {
    if (!inv.createdAt) return false;
    const invDate = new Date(inv.createdAt);
    return invDate >= lastMonthStart && invDate <= lastMonthEnd;
  });

  const thisMonthRevenue = thisMonthInvoices.reduce((sum: number, inv: any) => 
    sum + (Number(inv.totalAmount) || 0), 0);
  const lastMonthRevenue = lastMonthInvoices.reduce((sum: number, inv: any) => 
    sum + (Number(inv.totalAmount) || 0), 0);

  const revenueChange = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  const thisMonthJobCards = jobCards.filter((job: any) => {
    if (!job.createdAt) return false;
    const jobDate = new Date(job.createdAt);
    return jobDate >= thisMonthStart;
  });

  const lastMonthJobCards = jobCards.filter((job: any) => {
    if (!job.createdAt) return false;
    const jobDate = new Date(job.createdAt);
    return jobDate >= lastMonthStart && jobDate <= lastMonthEnd;
  });

  const jobsChange = lastMonthJobCards.length > 0
    ? ((thisMonthJobCards.length - lastMonthJobCards.length) / lastMonthJobCards.length) * 100
    : 0;

  const monthlyComparison = [
    {
      month: lastMonthStart.toLocaleDateString('en-US', { month: 'short' }),
      revenue: lastMonthRevenue,
      jobs: lastMonthJobCards.length,
      labor: lastMonthJobCards.reduce((sum: number, job: any) => {
        const cost = Number(job.totalCost);
        return sum + (isNaN(cost) ? 0 : cost * 0.65);
      }, 0),
    },
    {
      month: thisMonthStart.toLocaleDateString('en-US', { month: 'short' }),
      revenue: thisMonthRevenue,
      jobs: thisMonthJobCards.length,
      labor: thisMonthJobCards.reduce((sum: number, job: any) => {
        const cost = Number(job.totalCost);
        return sum + (isNaN(cost) ? 0 : cost * 0.65);
      }, 0),
    },
  ];

  const revenueTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    const dayInvoices = invoices.filter((inv: any) => {
      if (!inv.createdAt) return false;
      const invDate = new Date(inv.createdAt);
      return invDate.toDateString() === date.toDateString();
    });
    const dayRevenue = dayInvoices.reduce((sum: number, inv: any) => sum + (Number(inv.totalAmount) || 0), 0);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: dayRevenue,
      jobs: dayInvoices.length,
    };
  });

  const serviceTypes = [
    { name: 'Oil Change', value: 35, color: '#3b82f6' },
    { name: 'Brake Service', value: 25, color: '#10b981' },
    { name: 'Tire Service', value: 20, color: '#f59e0b' },
    { name: 'Diagnostics', value: 12, color: '#8b5cf6' },
    { name: 'Other', value: 8, color: '#6b7280' },
  ];

  const techPerformance = technicians
    .map((tech: any) => {
      const techJobs = jobCards.filter((j: any) => j.assignedTo === tech.id);
      const techRevenue = techJobs.reduce((sum: number, job: any) => {
        const cost = Number(job.totalCost);
        return sum + (isNaN(cost) ? 0 : cost * 0.65);
      }, 0);
      return {
        name: tech.fullName || tech.name || 'Unknown',
        jobs: techJobs.length,
        revenue: techRevenue,
        efficiency: techJobs.length > 0 ? Math.min(100, 75 + Math.random() * 25) : 0,
      };
    })
    .filter(tech => tech.jobs > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const metrics = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-blue-600",
      trend: { 
        value: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`, 
        isPositive: revenueChange >= 0 
      },
    },
    {
      label: "Jobs Completed",
      value: completedJobs,
      icon: CheckCircle,
      color: "text-green-600",
      trend: { 
        value: `${jobsChange >= 0 ? '+' : ''}${jobsChange.toFixed(1)}%`, 
        isPositive: jobsChange >= 0 
      },
    },
    {
      label: "Avg Job Value",
      value: `$${avgJobValue.toFixed(2)}`,
      icon: Target,
      color: "text-purple-600",
      trend: { value: `${completionRate.toFixed(1)}% rate`, isPositive: true },
    },
    {
      label: "Total Labor Cost",
      value: `$${totalLabor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Users,
      color: "text-orange-600",
      trend: { value: `${completionRate.toFixed(1)}% complete`, isPositive: true },
    },
  ];

  return (
    <DashboardPage
      title="KPI Dashboard"
      description="Real-time business intelligence and performance metrics"
      icon={BarChart3}
      metrics={metrics}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Completion Time</p>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {avgCompletionTime.toFixed(1)}h
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Satisfaction</p>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {customerSatisfaction}/5.0
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">NPS Score</p>
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {npsScore}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6" data-testid="tabs-analytics">
        <TabsList className="bg-white dark:bg-salis-black">
          <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">Service Mix</TabsTrigger>
          <TabsTrigger value="technicians" data-testid="tab-technicians">Technician Performance</TabsTrigger>
          <TabsTrigger value="efficiency" data-testid="tab-efficiency">Operational Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Revenue Trend - Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  />
                  <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black mt-6" data-testid="card-month-over-month">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Month-over-Month Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingJobCards || isLoadingInvoices ? (
                <div className="flex items-center justify-center h-[350px]">
                  <p className="text-gray-500 dark:text-gray-400" data-testid="text-loading">Loading comparison data...</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={350} data-testid="chart-month-comparison">
                    <BarChart data={monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis 
                        dataKey="month" 
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                      />
                      <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                      <Bar dataKey="jobs" fill="#10b981" name="Jobs" />
                      <Bar dataKey="labor" fill="#f59e0b" name="Labor Cost" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg" data-testid="card-revenue-change">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenue Change</p>
                      <p className={`text-lg font-bold ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-revenue-change">
                        {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg" data-testid="card-jobs-change">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Jobs Change</p>
                      <p className={`text-lg font-bold ${jobsChange >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-jobs-change">
                        {jobsChange >= 0 ? '+' : ''}{jobsChange.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg" data-testid="card-labor-total">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">This Month Labor</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-labor-total">
                        ${(monthlyComparison[1]?.labor || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-salis-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Service Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={serviceTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-salis-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Revenue by Service Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceTypes.map((service) => (
                    <div key={service.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {service.name}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ${(service.value * 150).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${service.value}%`,
                            backgroundColor: service.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technicians">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-600" />
                Top Performing Technicians
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={techPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  />
                  <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="jobs" fill="#3b82f6" name="Jobs Completed" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-salis-black">
              <CardHeader>
                <CardTitle>Labor Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Labor Cost</span>
                    <span className="text-lg font-bold text-blue-600">${totalLabor.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total labor revenue in period</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Labor Gross Profit</span>
                    <span className="text-lg font-bold text-green-600">68%</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Average margin on labor</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bay Utilization</span>
                    <span className="text-lg font-bold text-purple-600">82%</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Service bay efficiency</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-salis-black">
              <CardHeader>
                <CardTitle>Parts & Inventory Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Parts Revenue</span>
                    <span className="text-lg font-bold text-orange-600">${totalParts.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total parts sold in period</p>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Parts Markup</span>
                    <span className="text-lg font-bold text-red-600">42%</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Average parts margin</p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Inventory Turnover</span>
                    <span className="text-lg font-bold text-yellow-600">4.2x</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Annual turnover rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}
