import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsPage } from "@/components/layouts";
import { TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function PerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [metric, setMetric] = useState("revenue");

  const { data: performanceData } = useQuery({
    queryKey: ["/api/analytics/performance", { timeRange, metric }],
  });

  const revenueData = [
    { month: "Jan", revenue: 45000, target: 40000 },
    { month: "Feb", revenue: 52000, target: 45000 },
    { month: "Mar", revenue: 48000, target: 47000 },
    { month: "Apr", revenue: 61000, target: 50000 },
    { month: "May", revenue: 55000, target: 52000 },
    { month: "Jun", revenue: 67000, target: 55000 },
  ];

  const technicianData = [
    { name: "John Doe", efficiency: 95, jobs: 45 },
    { name: "Jane Smith", efficiency: 88, jobs: 38 },
    { name: "Mike Johnson", efficiency: 92, jobs: 42 },
    { name: "Sarah Williams", efficiency: 85, jobs: 35 },
  ];

  const serviceTypeData = [
    { name: "Oil Change", value: 35 },
    { name: "Brake Service", value: 25 },
    { name: "Tire Service", value: 20 },
    { name: "Engine Repair", value: 15 },
    { name: "Other", value: 5 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const filters = [
    {
      id: "timeRange",
      label: "Time Range",
      type: "select" as const,
      options: [
        { value: "7d", label: "Last 7 Days" },
        { value: "30d", label: "Last 30 Days" },
        { value: "90d", label: "Last 90 Days" },
        { value: "1y", label: "Last Year" },
      ],
      value: timeRange,
      onChange: setTimeRange,
    },
    {
      id: "metric",
      label: "Metric",
      type: "select" as const,
      options: [
        { value: "revenue", label: "Revenue" },
        { value: "efficiency", label: "Efficiency" },
        { value: "customer_satisfaction", label: "Customer Satisfaction" },
      ],
      value: metric,
      onChange: setMetric,
    },
  ];

  const sections = [
    {
      title: "Revenue Performance",
      description: "Monthly revenue vs targets",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Actual Revenue" strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Technician Performance",
      description: "Efficiency and job completion rates",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={technicianData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="efficiency" fill="#8884d8" name="Efficiency %" />
            <Bar yAxisId="right" dataKey="jobs" fill="#82ca9d" name="Jobs Completed" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Service Distribution",
      description: "Breakdown of services performed",
      content: (
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
      title: "Key Performance Indicators",
      description: "Summary of critical metrics",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <p className="text-sm text-muted-foreground">Avg Revenue/Job</p>
            </div>
            <p className="text-2xl font-bold">$285</p>
            <p className="text-xs text-green-600">+12% vs last month</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-muted-foreground">Avg Turnaround</p>
            </div>
            <p className="text-2xl font-bold">2.3h</p>
            <p className="text-xs text-green-600">-8% faster</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-500" />
              <p className="text-sm text-muted-foreground">Customer Retention</p>
            </div>
            <p className="text-2xl font-bold">87%</p>
            <p className="text-xs text-green-600">+3% improvement</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <p className="text-sm text-muted-foreground">Growth Rate</p>
            </div>
            <p className="text-2xl font-bold">15%</p>
            <p className="text-xs text-green-600">MoM growth</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnalyticsPage
      title="Performance Analytics"
      description="Comprehensive performance metrics and business analytics"
      icon={TrendingUp}
      filters={filters}
      sections={sections}
    />
  );
}
