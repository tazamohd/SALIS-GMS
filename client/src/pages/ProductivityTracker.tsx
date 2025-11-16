import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardPage } from "@/components/layouts";
import { Activity, Clock, CheckCircle, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProductivityTracker() {
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const { data: productivityData } = useQuery({
    queryKey: ["/api/productivity", selectedPeriod],
  });

  const hourlyProductivity = [
    { hour: "8AM", tasks: 8, efficiency: 85 },
    { hour: "10AM", tasks: 12, efficiency: 92 },
    { hour: "12PM", tasks: 10, efficiency: 78 },
    { hour: "2PM", tasks: 15, efficiency: 95 },
    { hour: "4PM", tasks: 11, efficiency: 88 },
    { hour: "6PM", tasks: 6, efficiency: 82 },
  ];

  const technicianStats = [
    { name: "John Doe", completed: 12, pending: 3, avgTime: "2.3h", efficiency: 94 },
    { name: "Jane Smith", completed: 10, pending: 2, avgTime: "2.5h", efficiency: 91 },
    { name: "Mike Johnson", completed: 11, pending: 4, avgTime: "2.1h", efficiency: 96 },
    { name: "Sarah Williams", completed: 9, pending: 1, avgTime: "2.8h", efficiency: 88 },
  ];

  const metrics = [
    {
      label: "Tasks Completed Today",
      value: "42",
      icon: CheckCircle,
      color: "text-green-500",
      trend: { value: "+15%", isPositive: true },
    },
    {
      label: "Average Efficiency",
      value: "92%",
      icon: TrendingUp,
      color: "text-blue-500",
      trend: { value: "+3%", isPositive: true },
    },
    {
      label: "Avg Task Duration",
      value: "2.4h",
      icon: Clock,
      color: "text-purple-500",
      trend: { value: "-12%", isPositive: true },
    },
    {
      label: "Active Technicians",
      value: "4",
      icon: Users,
      color: "text-orange-500",
    },
  ];

  return (
    <DashboardPage
      title="Productivity Tracker"
      description="Monitor team performance and task completion metrics"
      icon={Activity}
      metrics={metrics}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Productivity</CardTitle>
            <CardDescription>Tasks completed and efficiency by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyProductivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="tasks"
                  stroke="#8884d8"
                  name="Tasks Completed"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#82ca9d"
                  name="Efficiency %"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Completed vs pending tasks by technician</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={technicianStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                <Bar dataKey="pending" fill="#ffc658" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Technician Performance</CardTitle>
          <CardDescription>Individual productivity metrics and efficiency scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicianStats.map((tech, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg"
                data-testid={`technician-stats-${idx}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{tech.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {tech.completed} completed • {tech.pending} pending • Avg: {tech.avgTime}
                    </p>
                  </div>
                  <Badge
                    className={
                      tech.efficiency >= 95
                        ? "bg-green-100 text-green-700"
                        : tech.efficiency >= 90
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {tech.efficiency}% Efficiency
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className="font-medium">{tech.efficiency}%</span>
                  </div>
                  <Progress value={tech.efficiency} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Mike Johnson</p>
                <p className="text-sm text-muted-foreground">96% efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Productive Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">2PM - 4PM</p>
                <p className="text-sm text-muted-foreground">15 tasks completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Daily Target</span>
                <span className="font-medium">42/50</span>
              </div>
              <Progress value={84} className="h-2" />
              <p className="text-xs text-muted-foreground">84% of daily goal achieved</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
