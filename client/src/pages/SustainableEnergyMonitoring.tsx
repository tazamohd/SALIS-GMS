// @ts-nocheck
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnalyticsPage } from "@/components/layouts";
import { Zap, Leaf, TrendingDown, Battery } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

export default function SustainableEnergyMonitoring() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedFacility, setSelectedFacility] = useState("all");

  const energyConsumption = [
    { time: "00:00", solar: 0, grid: 45, total: 45 },
    { time: "04:00", solar: 0, grid: 42, total: 42 },
    { time: "08:00", solar: 35, grid: 30, total: 65 },
    { time: "12:00", solar: 85, grid: 15, total: 100 },
    { time: "16:00", solar: 60, grid: 25, total: 85 },
    { time: "20:00", solar: 10, grid: 50, total: 60 },
  ];

  const energyBreakdown = [
    { name: t('energy.solarEnergy', 'Solar Energy'), value: 45, color: "#0A5ED7" },
    { name: t('energy.gridPower', 'Grid Power'), value: 35, color: "#64748B" },
    { name: t('energy.energySavings', 'Energy Savings'), value: 20, color: "#10b981" },
  ];

  const monthlyComparison = [
    { month: t('months.jan', 'Jan'), consumption: 2400, savings: 300, cost: 1200 },
    { month: t('months.feb', 'Feb'), consumption: 2200, savings: 400, cost: 1100 },
    { month: t('months.mar', 'Mar'), consumption: 2100, savings: 450, cost: 1050 },
    { month: t('months.apr', 'Apr'), consumption: 2000, savings: 500, cost: 1000 },
    { month: t('months.may', 'May'), consumption: 1900, savings: 550, cost: 950 },
    { month: t('months.jun', 'Jun'), consumption: 1850, savings: 600, cost: 925 },
  ];

  const kpis = [
    {
      label: t('energy.totalEnergySaved', 'Total Energy Saved'),
      value: "2,400 kWh",
      change: "-15%",
      icon: TrendingDown,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: t('energy.solarGeneration', 'Solar Generation'),
      value: "1,850 kWh",
      change: "+22%",
      icon: Zap,
      color: "text-[#0A5ED7]",
    },
    {
      label: t('energy.carbonOffset', 'Carbon Offset'),
      value: "1.8 tons",
      change: "+18%",
      icon: Leaf,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: t('energy.batteryStorage', 'Battery Storage'),
      value: "85%",
      change: "+5%",
      icon: Battery,
      color: "text-[#0BB3FF]",
    },
  ];

  const filters = [
    {
      id: "period",
      label: t('energy.period', 'Period'),
      type: "select" as const,
      options: [
        { value: "day", label: t('energy.today', 'Today') },
        { value: "week", label: t('energy.thisWeek', 'This Week') },
        { value: "month", label: t('energy.thisMonth', 'This Month') },
        { value: "year", label: t('energy.thisYear', 'This Year') },
      ],
      value: selectedPeriod,
      onChange: setSelectedPeriod,
    },
    {
      id: "facility",
      label: t('energy.facility', 'Facility'),
      type: "select" as const,
      options: [
        { value: "all", label: t('energy.allFacilities', 'All Facilities') },
        { value: "main", label: t('energy.mainWorkshop', 'Main Workshop') },
        { value: "branch1", label: t('energy.branch1', 'Branch 1') },
        { value: "branch2", label: t('energy.branch2', 'Branch 2') },
      ],
      value: selectedFacility,
      onChange: setSelectedFacility,
    },
  ];

  const sections = [
    {
      title: t('energy.consumptionTimeline', 'Energy Consumption Timeline'),
      description: t('energy.consumptionTimelineDesc', 'Real-time energy usage from solar and grid sources'),
      content: (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={energyConsumption}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0] dark:stroke-[#232A36]" />
            <XAxis dataKey="time" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
            <Legend />
            <Area type="monotone" dataKey="solar" stackId="1" stroke="#0A5ED7" fill="#0A5ED7" fillOpacity={0.6} name={t('energy.solar', 'Solar')} />
            <Area type="monotone" dataKey="grid" stackId="1" stroke="#64748B" fill="#64748B" fillOpacity={0.6} name={t('energy.grid', 'Grid')} />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: t('energy.sourceDistribution', 'Energy Source Distribution'),
      description: t('energy.sourceDistributionDesc', 'Breakdown of energy sources and savings'),
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={energyBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {energyBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-4">
            {energyBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-[#0B1F3B] dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: t('energy.monthlyTrends', 'Monthly Trends & Cost Analysis'),
      description: t('energy.monthlyTrendsDesc', 'Energy consumption, savings, and cost over time'),
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0] dark:stroke-[#232A36]" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
            <Legend />
            <Bar dataKey="consumption" fill="#64748B" name={t('energy.consumptionKwh', 'Consumption (kWh)')} />
            <Bar dataKey="savings" fill="#10b981" name={t('energy.savingsKwh', 'Savings (kWh)')} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <AnalyticsPage
      title={t('energy.title', 'Sustainable Energy Monitoring')}
      description={t('energy.description', 'Track solar energy generation, consumption, and environmental impact')}
      icon={Leaf}
      filters={filters}
      sections={sections}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                <Badge className={`${kpi.change.startsWith('+') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'} border-0`}>
                  {kpi.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{kpi.value}</p>
              <p className="text-sm text-[#64748B]">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
            {t('energy.environmentalImpact', 'Environmental Impact')}
          </CardTitle>
          <CardDescription className="text-[#64748B]">{t('energy.sustainabilityContribution', 'Your contribution to sustainability')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-[#64748B] mb-2">{t('energy.co2Reduction', 'CO2 Reduction')}</p>
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white mb-1">1.8 tons</p>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] mb-2">{t('energy.treesEquivalent', 'Trees Equivalent')}</p>
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white mb-1">95 trees</p>
              <Progress value={65} className="h-2" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] mb-2">{t('energy.costSavings', 'Cost Savings')}</p>
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white mb-1">$2,450</p>
              <Progress value={82} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </AnalyticsPage>
  );
}
