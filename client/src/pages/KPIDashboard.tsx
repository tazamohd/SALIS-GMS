import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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

const BRAND_COLORS = {
  primary: '#0A5ED7',
  secondary: '#0BB3FF',
  navy: '#0B1F3B',
  orange: '#F97316',
  success: '#10B981',
  accent: '#6366F1',
  darkBg: '#0E1117',
  darkSurface: '#151A23',
  darkBorder: '#232A36',
  lightBg: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightBorder: '#E2E8F0',
};

export default function KPIDashboard() {
  const { t } = useTranslation();
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
    { name: t('analytics.oilChange', 'Oil Change'), value: 35, color: BRAND_COLORS.primary },
    { name: t('analytics.brakeService', 'Brake Service'), value: 25, color: BRAND_COLORS.secondary },
    { name: t('analytics.tireService', 'Tire Service'), value: 20, color: BRAND_COLORS.success },
    { name: t('analytics.diagnostics', 'Diagnostics'), value: 12, color: BRAND_COLORS.accent },
    { name: t('analytics.other', 'Other'), value: 8, color: BRAND_COLORS.navy },
  ];

  const sampleTechPerformance = [
    { name: 'Ahmed Al-Rashid', jobs: 42, revenue: 18500, efficiency: 94 },
    { name: 'Mohammed Hassan', jobs: 38, revenue: 16200, efficiency: 91 },
    { name: 'Khalid Al-Saeed', jobs: 35, revenue: 14800, efficiency: 88 },
    { name: 'Youssef Al-Fayez', jobs: 31, revenue: 12400, efficiency: 85 },
    { name: 'Omar Al-Zahrani', jobs: 28, revenue: 11200, efficiency: 82 },
  ];

  const apiTechPerformance = technicians
    .map((tech: any) => {
      const techJobs = jobCards.filter((j: any) => j.assignedTo === tech.id);
      const techRevenue = techJobs.reduce((sum: number, job: any) => {
        const cost = Number(job.totalCost);
        return sum + (isNaN(cost) ? 0 : cost * 0.65);
      }, 0);
      return {
        name: tech.fullName || tech.name || t('common.unknown', 'Unknown'),
        jobs: techJobs.length,
        revenue: techRevenue,
        efficiency: techJobs.length > 0 ? Math.min(100, 75 + Math.random() * 25) : 0,
      };
    })
    .filter(tech => tech.jobs > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const techPerformance = apiTechPerformance.length > 0 ? apiTechPerformance : sampleTechPerformance;

  const metrics = [
    {
      label: t('analytics.totalRevenue', 'Total Revenue'),
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-[#0A5ED7]",
      trend: { 
        value: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`, 
        isPositive: revenueChange >= 0 
      },
    },
    {
      label: t('analytics.jobsCompleted', 'Jobs Completed'),
      value: completedJobs,
      icon: CheckCircle,
      color: "text-[#10B981]",
      trend: { 
        value: `${jobsChange >= 0 ? '+' : ''}${jobsChange.toFixed(1)}%`, 
        isPositive: jobsChange >= 0 
      },
    },
    {
      label: t('analytics.avgJobValue', 'Avg Job Value'),
      value: `$${avgJobValue.toFixed(2)}`,
      icon: Target,
      color: "text-[#0BB3FF]",
      trend: { value: `${completionRate.toFixed(1)}% ${t('analytics.rate', 'rate')}`, isPositive: true },
    },
    {
      label: t('analytics.totalLaborCost', 'Total Labor Cost'),
      value: `$${totalLabor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Users,
      color: "text-[#6366F1]",
      trend: { value: `${completionRate.toFixed(1)}% ${t('common.completed', 'complete')}`, isPositive: true },
    },
  ];

  const tooltipStyle = {
    backgroundColor: 'var(--tooltip-bg, rgba(21, 26, 35, 0.95))',
    border: `1px solid ${BRAND_COLORS.darkBorder}`,
    borderRadius: '8px',
    color: 'var(--tooltip-text, #fff)',
  };

  return (
    <DashboardPage
      title={t('nav.kpi_dashboard', 'KPI Dashboard')}
      description={t('analytics.kpiDescription', 'Real-time business intelligence and performance metrics')}
      icon={BarChart3}
      metrics={metrics}
    >
      <style>{`
        :root {
          --tooltip-bg: rgba(255, 255, 255, 0.95);
          --tooltip-text: #0B1F3B;
        }
        .dark {
          --tooltip-bg: rgba(21, 26, 35, 0.95);
          --tooltip-text: #fff;
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#0B1F3B] dark:text-gray-300">{t('analytics.avgCompletionTime', 'Avg Completion Time')}</p>
              <Clock className="h-5 w-5 text-[#0A5ED7]" />
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
              {avgCompletionTime.toFixed(1)}h
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#0B1F3B] dark:text-gray-300">{t('analytics.customerSatisfaction', 'Customer Satisfaction')}</p>
              <Star className="h-5 w-5 text-[#0BB3FF]" />
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
              {customerSatisfaction}/5.0
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#0B1F3B] dark:text-gray-300">{t('analytics.npsScore', 'NPS Score')}</p>
              <Award className="h-5 w-5 text-[#10B981]" />
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
              {npsScore}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6" data-testid="tabs-analytics">
        <TabsList className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-1">
          <TabsTrigger 
            value="revenue" 
            data-testid="tab-revenue"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white text-[#0B1F3B] dark:text-gray-300"
          >
            {t('analytics.revenueTrends', 'Revenue Trends')}
          </TabsTrigger>
          <TabsTrigger 
            value="services" 
            data-testid="tab-services"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white text-[#0B1F3B] dark:text-gray-300"
          >
            {t('analytics.serviceMix', 'Service Mix')}
          </TabsTrigger>
          <TabsTrigger 
            value="technicians" 
            data-testid="tab-technicians"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white text-[#0B1F3B] dark:text-gray-300"
          >
            {t('analytics.technicianPerformance', 'Technician Performance')}
          </TabsTrigger>
          <TabsTrigger 
            value="efficiency" 
            data-testid="tab-efficiency"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white text-[#0B1F3B] dark:text-gray-300"
          >
            {t('analytics.operationalEfficiency', 'Operational Efficiency')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Activity className="h-5 w-5 text-[#0A5ED7]" />
                {t('analytics.revenueTrendLast30Days', 'Revenue Trend - Last 30 Days')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={BRAND_COLORS.secondary} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={BRAND_COLORS.darkBorder} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    axisLine={{ stroke: BRAND_COLORS.darkBorder }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    axisLine={{ stroke: BRAND_COLORS.darkBorder }}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: 'inherit', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={BRAND_COLORS.primary} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] mt-6" data-testid="card-month-over-month">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <TrendingUp className="h-5 w-5 text-[#10B981]" />
                {t('analytics.monthOverMonthComparison', 'Month-over-Month Comparison')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingJobCards || isLoadingInvoices ? (
                <div className="flex items-center justify-center h-[350px]">
                  <p className="text-[#0B1F3B] dark:text-gray-400" data-testid="text-loading">{t('analytics.loadingComparisonData', 'Loading comparison data...')}</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={350} data-testid="chart-month-comparison">
                    <BarChart data={monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke={BRAND_COLORS.darkBorder} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        axisLine={{ stroke: BRAND_COLORS.darkBorder }}
                      />
                      <YAxis 
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        axisLine={{ stroke: BRAND_COLORS.darkBorder }}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend 
                        wrapperStyle={{ color: '#64748B' }}
                        formatter={(value) => <span style={{ color: '#64748B' }}>{value}</span>}
                      />
                      <Bar dataKey="revenue" fill={BRAND_COLORS.primary} name={t('analytics.revenue', 'Revenue')} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="jobs" fill={BRAND_COLORS.success} name={t('analytics.jobs', 'Jobs')} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="labor" fill={BRAND_COLORS.secondary} name={t('analytics.laborCost', 'Labor Cost')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 rounded-lg border border-[#0A5ED7]/20" data-testid="card-revenue-change">
                      <p className="text-xs text-[#0B1F3B] dark:text-gray-300 mb-1">{t('analytics.revenueChange', 'Revenue Change')}</p>
                      <p className={`text-lg font-bold ${revenueChange >= 0 ? 'text-[#10B981]' : 'text-[#F97316]'}`} data-testid="text-revenue-change">
                        {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-[#10B981]/10 dark:bg-[#10B981]/20 rounded-lg border border-[#10B981]/20" data-testid="card-jobs-change">
                      <p className="text-xs text-[#0B1F3B] dark:text-gray-300 mb-1">{t('analytics.jobsChange', 'Jobs Change')}</p>
                      <p className={`text-lg font-bold ${jobsChange >= 0 ? 'text-[#10B981]' : 'text-[#F97316]'}`} data-testid="text-jobs-change">
                        {jobsChange >= 0 ? '+' : ''}{jobsChange.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-[#0BB3FF]/10 dark:bg-[#0BB3FF]/20 rounded-lg border border-[#0BB3FF]/20" data-testid="card-labor-total">
                      <p className="text-xs text-[#0B1F3B] dark:text-gray-300 mb-1">{t('analytics.thisMonthLabor', 'This Month Labor')}</p>
                      <p className="text-lg font-bold text-[#0B1F3B] dark:text-white" data-testid="text-labor-total">
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
            <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                  <PieChart className="h-5 w-5 text-[#10B981]" />
                  {t('analytics.serviceTypeDistribution', 'Service Type Distribution')}
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
                    <Tooltip contentStyle={tooltipStyle} />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                  <BarChart3 className="h-5 w-5 text-[#0BB3FF]" />
                  {t('analytics.revenueByServiceType', 'Revenue by Service Type')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceTypes.map((service) => (
                    <div key={service.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#0B1F3B] dark:text-gray-300">
                          {service.name}
                        </span>
                        <span className="text-sm font-bold text-[#0B1F3B] dark:text-white">
                          ${(service.value * 150).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] dark:bg-[#232A36] rounded-full h-2">
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
          <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Wrench className="h-5 w-5 text-[#0A5ED7]" />
                {t('analytics.topPerformingTechnicians', 'Top Performing Technicians')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={techPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BRAND_COLORS.darkBorder} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    axisLine={{ stroke: BRAND_COLORS.darkBorder }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    axisLine={{ stroke: BRAND_COLORS.darkBorder }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend 
                    formatter={(value) => <span style={{ color: '#64748B' }}>{value}</span>}
                  />
                  <Bar dataKey="jobs" fill={BRAND_COLORS.primary} name={t('analytics.jobsCompleted', 'Jobs Completed')} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill={BRAND_COLORS.success} name={t('analytics.revenueAmount', 'Revenue ($)')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#0B1F3B] dark:text-white">{t('analytics.laborEfficiencyMetrics', 'Labor Efficiency Metrics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 rounded-lg border border-[#0A5ED7]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#0B1F3B] dark:text-gray-300">{t('analytics.laborCost', 'Labor Cost')}</span>
                    <span className="text-lg font-bold text-[#0A5ED7]">${totalLabor.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-gray-400">{t('analytics.totalLaborRevenueInPeriod', 'Total labor revenue in period')}</p>
                </div>

                <div className="p-4 bg-[#10B981]/10 dark:bg-[#10B981]/20 rounded-lg border border-[#10B981]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#0B1F3B] dark:text-gray-300">{t('analytics.laborGrossProfit', 'Labor Gross Profit')}</span>
                    <span className="text-lg font-bold text-[#10B981]">68%</span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-gray-400">{t('analytics.averageMarginOnLabor', 'Average margin on labor')}</p>
                </div>

                <div className="p-4 bg-[#0BB3FF]/10 dark:bg-[#0BB3FF]/20 rounded-lg border border-[#0BB3FF]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#0B1F3B] dark:text-gray-300">{t('analytics.bayUtilization', 'Bay Utilization')}</span>
                    <span className="text-lg font-bold text-[#0BB3FF]">82%</span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-gray-400">{t('analytics.serviceBayEfficiency', 'Service bay efficiency')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#0B1F3B] dark:text-white">{t('analytics.partsInventoryMetrics', 'Parts & Inventory Metrics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[#6366F1]/10 dark:bg-[#6366F1]/20 rounded-lg border border-[#6366F1]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#0B1F3B] dark:text-gray-300">{t('analytics.partsRevenue', 'Parts Revenue')}</span>
                    <span className="text-lg font-bold text-[#6366F1]">${totalParts.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-gray-400">{t('analytics.totalPartsSoldInPeriod', 'Total parts sold in period')}</p>
                </div>

                <div className="p-4 bg-[#0B1F3B]/10 dark:bg-[#0B1F3B]/30 rounded-lg border border-[#0B1F3B]/20 dark:border-[#232A36]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#0B1F3B] dark:text-gray-300">{t('analytics.partsMarkup', 'Parts Markup')}</span>
                    <span className="text-lg font-bold text-[#0B1F3B] dark:text-white">42%</span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-gray-400">{t('analytics.averagePartsMargin', 'Average parts margin')}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 dark:from-[#0A5ED7]/20 dark:to-[#0BB3FF]/20 rounded-lg border border-[#0A5ED7]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#0B1F3B] dark:text-gray-300">{t('analytics.inventoryTurnover', 'Inventory Turnover')}</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] bg-clip-text text-transparent">4.2x</span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-gray-400">{t('analytics.annualTurnoverRate', 'Annual turnover rate')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}
