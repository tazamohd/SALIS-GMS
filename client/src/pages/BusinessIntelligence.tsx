import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TrendingUp, DollarSign, Users, Clock, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DashboardPage } from "@/components/layouts/DashboardPage";

const COLORS = ['#0A5ED7', '#0BB3FF', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

export default function BusinessIntelligence() {
  const { t } = useTranslation();
  const [garageId, setGarageId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: garages } = useQuery<any[]>({
    queryKey: ['/api/garages'],
  });

  useEffect(() => {
    if (garages && garages.length > 0 && !garageId) {
      setGarageId(garages[0].id);
    }
  }, [garages, garageId]);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const { data: profitableServices } = useQuery({
    queryKey: ['/api/bi/profitable-services', { garageId, startDate, endDate }],
    enabled: !!garageId && !!startDate && !!endDate,
  });

  const { data: peakHours } = useQuery({
    queryKey: ['/api/bi/peak-hours', { garageId, startDate, endDate }],
    enabled: !!garageId && !!startDate && !!endDate,
  });

  const { data: technicianUtilization } = useQuery({
    queryKey: ['/api/bi/technician-utilization', { garageId, startDate, endDate }],
    enabled: !!garageId && !!startDate && !!endDate,
  });

  const { data: acquisitionCost } = useQuery({
    queryKey: ['/api/bi/customer-acquisition-cost', { garageId, startDate, endDate }],
    enabled: !!garageId && !!startDate && !!endDate,
  });

  const { data: customerLifetime } = useQuery({
    queryKey: ['/api/bi/customer-lifetime-value', { garageId, startDate, endDate }],
    enabled: !!garageId && !!startDate && !!endDate,
  });

  const topCustomers = customerLifetime?.customers
    ?.sort((a: any, b: any) => b.lifetimeValue - a.lifetimeValue)
    ?.slice(0, 5) || [];

  const avgLifetimeValue = customerLifetime?.customers?.length > 0
    ? customerLifetime.customers.reduce((sum: number, c: any) => sum + c.lifetimeValue, 0) / customerLifetime.customers.length
    : 0;

  const metrics = [
    {
      label: t('analytics.avgCustomerLifetimeValue', 'Avg. Customer Lifetime Value'),
      value: `$${avgLifetimeValue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-[#0B1F3B] dark:text-white",
    },
    {
      label: t('analytics.customerAcquisitionCost', 'Customer Acquisition Cost'),
      value: `$${(acquisitionCost?.acquisitionCost || 0).toFixed(2)}`,
      icon: Users,
      color: "text-[#0B1F3B] dark:text-white",
    },
    {
      label: t('analytics.peakHour', 'Peak Hour'),
      value: `${peakHours?.peakHour || 0}:00`,
      icon: Clock,
      color: "text-[#0B1F3B] dark:text-white",
    },
    {
      label: t('analytics.peakDay', 'Peak Day'),
      value: peakHours?.peakDay || t('common.notAvailable', 'N/A'),
      icon: TrendingUp,
      color: "text-[#0B1F3B] dark:text-white",
    },
  ];

  return (
    <DashboardPage
      title={t('nav.business_intelligence', 'Business Intelligence')}
      description={t('analytics.biDescription', 'Track key metrics and insights for your garage business')}
      icon={TrendingUp}
      metrics={metrics}
    >
      <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] mb-6">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('common.filter', 'Filters')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('analytics.selectGarageAndDateRange', 'Select garage and date range for analysis')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="garage">{t('analytics.garage', 'Garage')}</Label>
            <Select value={garageId} onValueChange={setGarageId}>
              <SelectTrigger id="garage" data-testid="select-garage">
                <SelectValue placeholder={t('analytics.selectGarage', 'Select garage')} />
              </SelectTrigger>
              <SelectContent>
                {garages?.map((garage) => (
                  <SelectItem key={garage.id} value={garage.id}>
                    {garage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">{t('common.from', 'Start Date')}</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="input-start-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">{t('common.to', 'End Date')}</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="input-end-date"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('analytics.mostProfitableServices', 'Most Profitable Services')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('analytics.revenueCostProfit', 'Revenue, cost, and profit by service type')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitableServices?.services || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="serviceType" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#0A5ED7" name={t('analytics.revenue', 'Revenue')} />
                <Bar dataKey="cost" fill="#F97316" name={t('analytics.cost', 'Cost')} />
                <Bar dataKey="profit" fill="#22c55e" name={t('analytics.profit', 'Profit')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('analytics.profitMarginByService', 'Profit Margin by Service')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('analytics.percentageProfitMargin', 'Percentage profit margin for each service type')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={profitableServices?.services || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.serviceType}: ${entry.profitMargin.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#0A5ED7"
                  dataKey="profitMargin"
                >
                  {profitableServices?.services?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('analytics.hourlyDistribution', 'Hourly Distribution')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('analytics.appointmentsRevenueByHour', 'Appointments and revenue by hour of day')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={peakHours?.hourlyDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="hour" stroke="#64748B" />
                <YAxis yAxisId="left" stroke="#64748B" />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#0A5ED7" name={t('nav.appointments', 'Appointments')} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#0BB3FF" name={t('analytics.revenueAmount', 'Revenue ($)')} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('analytics.dailyDistribution', 'Daily Distribution')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('analytics.appointmentsRevenueByDay', 'Appointments and revenue by day of week')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHours?.dailyDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" />
                <YAxis yAxisId="left" stroke="#64748B" />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#0A5ED7" name={t('nav.appointments', 'Appointments')} />
                <Bar yAxisId="right" dataKey="revenue" fill="#22c55e" name={t('analytics.revenueAmount', 'Revenue ($)')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('analytics.technicianUtilizationRates', 'Technician Utilization Rates')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('analytics.hoursWorkedVsAvailable', 'Hours worked vs available by technician')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={technicianUtilization?.technicians || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalHoursWorked" fill="#0A5ED7" name={t('analytics.hoursWorked', 'Hours Worked')} />
                <Bar dataKey="totalHoursAvailable" fill="#0BB3FF" name={t('analytics.hoursAvailable', 'Hours Available')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('analytics.customerAcquisitionSources', 'Customer Acquisition Sources')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('analytics.newCustomersByChannel', 'New customers by acquisition channel')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={acquisitionCost?.customersBySource || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.source}: ${entry.count}`}
                  outerRadius={80}
                  fill="#0A5ED7"
                  dataKey="count"
                >
                  {acquisitionCost?.customersBySource?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] mb-6">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('analytics.topCustomersByLifetimeValue', 'Top Customers by Lifetime Value')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('analytics.top5CustomersByRevenue', 'Top 5 customers ranked by total revenue')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCustomers.map((customer: any, index: number) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg"
                data-testid={`customer-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{customer.name || t('common.unknown', 'Unknown')}</p>
                    <p className="text-sm text-[#64748B]">
                      {customer.totalInvoices} {t('nav.invoices', 'invoices')} • {customer.totalVisits} {t('analytics.visits', 'visits')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                    ${customer.lifetimeValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {t('analytics.avg', 'Avg')}: ${customer.avgInvoiceValue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('analytics.technicianPerformanceDetails', 'Technician Performance Details')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('analytics.detailedMetricsForTechnicians', 'Detailed metrics for each technician')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicianUtilization?.technicians?.map((tech: any) => (
              <div
                key={tech.id}
                className="flex items-center justify-between p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg"
                data-testid={`technician-${tech.id}`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-8 h-8 text-[#0A5ED7]" />
                  <div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{tech.name}</p>
                    <p className="text-sm text-[#64748B]">
                      {tech.jobsCompleted} {t('analytics.jobsCompleted', 'jobs completed')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('analytics.utilization', 'Utilization')}</p>
                    <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">{tech.utilizationRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">{t('analytics.hoursWorked', 'Hours Worked')}</p>
                    <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">{tech.totalHoursWorked.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">{t('analytics.revenue', 'Revenue')}</p>
                    <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                      ${tech.revenueGenerated.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
