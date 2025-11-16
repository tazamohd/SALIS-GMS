import { useState } from "react";
import { AnalyticsPage } from "@/components/layouts";
import { Zap, Leaf, TrendingDown, Battery } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

export default function SustainableEnergyMonitoring() {
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
    { name: "Solar Energy", value: 45, color: "#fbbf24" },
    { name: "Grid Power", value: 35, color: "#9ca3af" },
    { name: "Energy Savings", value: 20, color: "#10b981" },
  ];

  const monthlyComparison = [
    { month: "Jan", consumption: 2400, savings: 300, cost: 1200 },
    { month: "Feb", consumption: 2200, savings: 400, cost: 1100 },
    { month: "Mar", consumption: 2100, savings: 450, cost: 1050 },
    { month: "Apr", consumption: 2000, savings: 500, cost: 1000 },
    { month: "May", consumption: 1900, savings: 550, cost: 950 },
    { month: "Jun", consumption: 1850, savings: 600, cost: 925 },
  ];

  const kpis = [
    {
      label: "Total Energy Saved",
      value: "2,400 kWh",
      change: "-15%",
      icon: TrendingDown,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Solar Generation",
      value: "1,850 kWh",
      change: "+22%",
      icon: Zap,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Carbon Offset",
      value: "1.8 tons",
      change: "+18%",
      icon: Leaf,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Battery Storage",
      value: "85%",
      change: "+5%",
      icon: Battery,
      color: "text-blue-600 dark:text-blue-400",
    },
  ];

  const filters = [
    {
      id: "period",
      label: "Period",
      type: "select" as const,
      options: [
        { value: "day", label: "Today" },
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
        { value: "year", label: "This Year" },
      ],
      value: selectedPeriod,
      onChange: setSelectedPeriod,
    },
    {
      id: "facility",
      label: "Facility",
      type: "select" as const,
      options: [
        { value: "all", label: "All Facilities" },
        { value: "main", label: "Main Workshop" },
        { value: "branch1", label: "Branch 1" },
        { value: "branch2", label: "Branch 2" },
      ],
      value: selectedFacility,
      onChange: setSelectedFacility,
    },
  ];

  const sections = [
    {
      title: "Energy Consumption Timeline",
      description: "Real-time energy usage from solar and grid sources",
      content: (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={energyConsumption}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Legend />
            <Area type="monotone" dataKey="solar" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.6} name="Solar" />
            <Area type="monotone" dataKey="grid" stackId="1" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.6} name="Grid" />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Energy Source Distribution",
      description: "Breakdown of energy sources and savings",
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
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-4">
            {energyBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Monthly Trends & Cost Analysis",
      description: "Energy consumption, savings, and cost over time",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Legend />
            <Bar dataKey="consumption" fill="#9ca3af" name="Consumption (kWh)" />
            <Bar dataKey="savings" fill="#10b981" name="Savings (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <AnalyticsPage
      title="Sustainable Energy Monitoring"
      description="Track solar energy generation, consumption, and environmental impact"
      icon={Leaf}
      filters={filters}
      sections={sections}
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                <Badge className={`${kpi.change.startsWith('+') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'} border-0`}>
                  {kpi.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Environmental Impact */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
            Environmental Impact
          </CardTitle>
          <CardDescription>Your contribution to sustainability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">CO2 Reduction</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">1.8 tons</p>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Trees Equivalent</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">95 trees</p>
              <Progress value={65} className="h-2" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cost Savings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$2,450</p>
              <Progress value={82} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </AnalyticsPage>
  );
}
