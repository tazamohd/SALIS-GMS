import { useState } from "react";
import { AnalyticsPage } from "@/components/layouts";
import { Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function TechnicianPerformance() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedTechnician, setSelectedTechnician] = useState("all");

  const performanceData = [
    { name: "John Smith", tasksCompleted: 45, avgTime: 3.2, quality: 4.8, efficiency: 92 },
    { name: "Sarah Johnson", tasksCompleted: 42, avgTime: 3.5, quality: 4.9, efficiency: 88 },
    { name: "Mike Chen", tasksCompleted: 38, avgTime: 3.8, quality: 4.7, efficiency: 85 },
    { name: "Emily Davis", tasksCompleted: 40, avgTime: 3.4, quality: 4.8, efficiency: 90 },
  ];

  const weeklyTrends = [
    { week: "Week 1", completed: 35, target: 40 },
    { week: "Week 2", completed: 38, target: 40 },
    { week: "Week 3", completed: 42, target: 40 },
    { week: "Week 4", completed: 45, target: 40 },
  ];

  const skillsData = [
    { skill: "Engine Repair", proficiency: 90 },
    { skill: "Diagnostics", proficiency: 85 },
    { skill: "Electrical", proficiency: 80 },
    { skill: "Brake Systems", proficiency: 95 },
    { skill: "Transmission", proficiency: 75 },
  ];

  const topPerformers = [
    { id: 1, name: "John Smith", role: "Senior Technician", tasksCompleted: 45, rating: 4.8, efficiency: 92 },
    { id: 2, name: "Sarah Johnson", role: "Lead Mechanic", tasksCompleted: 42, rating: 4.9, efficiency: 88 },
    { id: 3, name: "Emily Davis", role: "Technician", tasksCompleted: 40, rating: 4.8, efficiency: 90 },
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
      id: "technician",
      label: "Technician",
      type: "select" as const,
      options: [
        { value: "all", label: "All Technicians" },
        { value: "john", label: "John Smith" },
        { value: "sarah", label: "Sarah Johnson" },
        { value: "mike", label: "Mike Chen" },
        { value: "emily", label: "Emily Davis" },
      ],
      value: selectedTechnician,
      onChange: setSelectedTechnician,
    },
  ];

  const sections = [
    {
      title: "Technician Performance Comparison",
      description: "Compare key metrics across all technicians",
      content: (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Legend />
            <Bar dataKey="tasksCompleted" fill="#1f2937" name="Tasks Completed" />
            <Bar dataKey="efficiency" fill="#6b7280" name="Efficiency %" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Completion Trends",
      description: "Weekly task completion vs targets",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyTrends}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Legend />
            <Line type="monotone" dataKey="completed" stroke="#1f2937" strokeWidth={2} name="Completed" />
            <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" name="Target" />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Skills Proficiency",
      description: "Technical skills assessment radar chart",
      content: (
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={skillsData}>
            <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
            <PolarAngleAxis dataKey="skill" className="text-xs" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Proficiency" dataKey="proficiency" stroke="#1f2937" fill="#1f2937" fillOpacity={0.3} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
          </RadarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <AnalyticsPage
      title="Technician Performance"
      description="Track and analyze technician productivity and performance metrics"
      icon={Users}
      filters={filters}
      sections={sections}
    >
      {/* Top Performers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Performing Technicians
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((tech, index) => (
              <div
                key={tech.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                data-testid={`technician-${tech.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-gray-900 dark:text-white">
                    #{index + 1}
                  </div>
                  <Avatar>
                    <AvatarFallback className="bg-gray-800 dark:bg-gray-200 text-white dark:text-black">
                      {tech.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{tech.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tech.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{tech.tasksCompleted}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{tech.rating}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0">
                      {tech.efficiency}% Efficiency
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AnalyticsPage>
  );
}
