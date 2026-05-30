import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AnalyticsPage } from "@/components/layouts";
import { TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface PerformanceResponse {
  revenueByMonth: Array<{ month: string; revenue: number; target: number }>;
  technicianStats: Array<{ name: string; efficiency: number; jobs: number }>;
  serviceDistribution: Array<{ name: string; value: number }>;
  kpis: {
    avgRevenuePerJob: number;
    avgTurnaroundHours: string;
    customerRetentionPct: number;
    momGrowthPct: number;
  };
}

const COLORS = ["#0A5ED7", "#0BB3FF", "#64748B", "#94A3B8", "#CBD5E1"];

const Empty = ({ msg }: { msg: string }) => (
  <p className="text-sm text-[#64748B] py-12 text-center">{msg}</p>
);

export default function PerformanceAnalytics() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("30d");
  const [metric, setMetric] = useState("revenue");

  const { data, isLoading } = useQuery<PerformanceResponse>({
    queryKey: [`/api/analytics/performance?timeRange=${timeRange}&metric=${metric}`],
  });

  const revenueData = data?.revenueByMonth ?? [];
  const technicianData = data?.technicianStats ?? [];
  const serviceTypeData = data?.serviceDistribution ?? [];
  const kpis = data?.kpis;

  const filters = [
    {
      id: "timeRange",
      label: t('analytics.timeRange', 'Time Range'),
      type: "select" as const,
      options: [
        { value: "7d", label: t('analytics.timeRanges.last7Days', 'Last 7 Days') },
        { value: "30d", label: t('analytics.timeRanges.last30Days', 'Last 30 Days') },
        { value: "90d", label: t('analytics.timeRanges.last90Days', 'Last 90 Days') },
        { value: "1y", label: t('analytics.timeRanges.lastYear', 'Last Year') },
      ],
      value: timeRange,
      onChange: setTimeRange,
    },
    {
      id: "metric",
      label: t('analytics.metric', 'Metric'),
      type: "select" as const,
      options: [
        { value: "revenue", label: t('analytics.metrics.revenue', 'Revenue') },
        { value: "efficiency", label: t('analytics.metrics.efficiency', 'Efficiency') },
        { value: "customer_satisfaction", label: t('analytics.metrics.customerSatisfaction', 'Customer Satisfaction') },
      ],
      value: metric,
      onChange: setMetric,
    },
  ];

  const loadingText = t('common.loading', 'Loading...');

  const sections = [
    {
      title: t('analytics.revenuePerformance', 'Revenue Performance'),
      description: t('analytics.monthlyRevenueVsTargets', 'Monthly revenue vs targets'),
      content: revenueData.length === 0 ? (
        <Empty msg={isLoading ? loadingText : t('analytics.noRevenueData', 'No paid invoices in the selected window.')} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#0A5ED7" name={t('analytics.actualRevenue', 'Actual Revenue')} strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="#0BB3FF" name={t('analytics.target', 'Target')} strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: t('analytics.technicianPerformance', 'Technician Performance'),
      description: t('analytics.efficiencyAndJobCompletion', 'Efficiency and job completion rates'),
      content: technicianData.length === 0 ? (
        <Empty msg={isLoading ? loadingText : t('analytics.noTechnicianData', 'No technician activity in the selected window.')} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={technicianData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" stroke="#64748B" />
            <YAxis yAxisId="left" orientation="left" stroke="#0A5ED7" />
            <YAxis yAxisId="right" orientation="right" stroke="#0BB3FF" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="efficiency" fill="#0A5ED7" name={t('analytics.efficiencyPercent', 'Efficiency %')} />
            <Bar yAxisId="right" dataKey="jobs" fill="#0BB3FF" name={t('analytics.jobsCompleted', 'Jobs Completed')} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: t('analytics.serviceDistribution', 'Service Distribution'),
      description: t('analytics.breakdownOfServices', 'Breakdown of services performed'),
      content: serviceTypeData.length === 0 ? (
        <Empty msg={isLoading ? loadingText : t('analytics.noServiceData', 'No service mix data yet.')} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={serviceTypeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {serviceTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: t('analytics.keyPerformanceIndicators', 'Key Performance Indicators'),
      description: t('analytics.summaryOfCriticalMetrics', 'Summary of critical metrics'),
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <p className="text-sm text-[#64748B]">{t('analytics.avgRevenuePerJob', 'Avg Revenue/Job')}</p>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="kpi-revenue-per-job">
              {kpis ? `SAR ${kpis.avgRevenuePerJob.toLocaleString()}` : "--"}
            </p>
          </div>
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-[#0A5ED7]" />
              <p className="text-sm text-[#64748B]">{t('analytics.avgTurnaround', 'Avg Turnaround')}</p>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="kpi-turnaround">
              {kpis ? `${kpis.avgTurnaroundHours}h` : "--"}
            </p>
          </div>
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-[#0BB3FF]" />
              <p className="text-sm text-[#64748B]">{t('analytics.customerRetention', 'Customer Retention')}</p>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="kpi-retention">
              {kpis ? `${kpis.customerRetentionPct}%` : "--"}
            </p>
          </div>
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-[#F97316]" />
              <p className="text-sm text-[#64748B]">{t('analytics.growthRate', 'MoM Growth')}</p>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="kpi-mom-growth">
              {kpis ? `${kpis.momGrowthPct >= 0 ? "+" : ""}${kpis.momGrowthPct}%` : "--"}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnalyticsPage
      title={t('analytics.title', 'Performance Analytics')}
      description={t('analytics.description', 'Live KPIs across revenue, technicians, and service mix')}
      icon={TrendingUp}
      filters={filters}
      sections={sections}
    />
  );
}
