import { useState } from "react";
import { AnalyticsPage } from "@/components/layouts";
import { Award, TrendingUp, Clock, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function StaffPerformanceReview() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const performanceData = [
    { name: "John Smith", efficiency: 92, quality: 88, punctuality: 95, teamwork: 90 },
    { name: "Sarah Johnson", efficiency: 88, quality: 94, punctuality: 92, teamwork: 89 },
    { name: "Mike Chen", efficiency: 85, quality: 87, punctuality: 88, teamwork: 92 },
    { name: "Emily Davis", efficiency: 90, quality: 91, punctuality: 90, teamwork: 88 },
    { name: "David Wilson", efficiency: 87, quality: 89, punctuality: 86, teamwork: 91 },
  ];

  const monthlyTrends = [
    { month: "Jan", average: 82, target: 85 },
    { month: "Feb", average: 84, target: 85 },
    { month: "Mar", average: 86, target: 85 },
    { month: "Apr", average: 88, target: 85 },
    { month: "May", average: 87, target: 85 },
    { month: "Jun", average: 90, target: 85 },
  ];

  const topPerformers = [
    { name: "John Smith", role: "Senior Technician", score: 91.2, tasks: 145 },
    { name: "Sarah Johnson", role: "Lead Mechanic", score: 90.8, tasks: 132 },
    { name: "Emily Davis", role: "Technician", score: 89.8, tasks: 128 },
  ];

  const kpiData = [
    { category: "Efficiency", value: 88 },
    { category: "Quality", value: 89 },
    { category: "Punctuality", value: 90 },
    { category: "Teamwork", value: 90 },
    { category: "Customer Satisfaction", value: 92 },
  ];

  const filters = [
    {
      id: "period",
      label: "Period",
      type: "select" as const,
      options: [
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
        { value: "quarter", label: "This Quarter" },
        { value: "year", label: "This Year" },
      ],
      value: selectedPeriod,
      onChange: setSelectedPeriod,
    },
    {
      id: "department",
      label: "Department",
      type: "select" as const,
      options: [
        { value: "all", label: "All Departments" },
        { value: "mechanics", label: "Mechanics" },
        { value: "service", label: "Service Advisors" },
        { value: "admin", label: "Administration" },
      ],
      value: selectedDepartment,
      onChange: setSelectedDepartment,
    },
  ];

  const sections = [
    {
      title: "Team Performance Overview",
      description: "Individual performance metrics across key areas",
      content: (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Legend />
            <Bar dataKey="efficiency" fill="#1f2937" name="Efficiency" />
            <Bar dataKey="quality" fill="#4b5563" name="Quality" />
            <Bar dataKey="punctuality" fill="#6b7280" name="Punctuality" />
            <Bar dataKey="teamwork" fill="#9ca3af" name="Teamwork" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Performance Trends",
      description: "Average team performance over time vs target",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Legend />
            <Line type="monotone" dataKey="average" stroke="#1f2937" strokeWidth={2} name="Average Score" />
            <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" name="Target" />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Key Performance Indicators",
      description: "Overall team KPIs radar chart",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={kpiData}>
              <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
              <PolarAngleAxis dataKey="category" className="text-xs" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Performance" dataKey="value" stroke="#1f2937" fill="#1f2937" fillOpacity={0.3} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="space-y-4">
            {kpiData.map((kpi) => (
              <div key={kpi.category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{kpi.category}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{kpi.value}%</span>
                </div>
                <Progress value={kpi.value} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnalyticsPage
      title="Staff Performance Review"
      description="Comprehensive performance analytics and reviews"
      icon={Award}
      filters={filters}
      sections={sections}
    >
      {/* Top Performers Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div
                key={performer.name}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                data-testid={`performer-${index}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-gray-900 dark:text-white">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{performer.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{performer.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{performer.score}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{performer.tasks} tasks completed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AnalyticsPage>
  );
}
