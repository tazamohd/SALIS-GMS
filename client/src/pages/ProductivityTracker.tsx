import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardPage } from "@/components/layouts";
import { Activity, Clock, CheckCircle, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProductivityTracker() {
  const { t } = useTranslation();
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
      label: t('productivity.metrics.tasksCompletedToday', 'Tasks Completed Today'),
      value: "42",
      icon: CheckCircle,
      color: "text-green-500",
      trend: { value: "+15%", isPositive: true },
    },
    {
      label: t('productivity.metrics.averageEfficiency', 'Average Efficiency'),
      value: "92%",
      icon: TrendingUp,
      color: "text-blue-500",
      trend: { value: "+3%", isPositive: true },
    },
    {
      label: t('productivity.metrics.avgTaskDuration', 'Avg Task Duration'),
      value: "2.4h",
      icon: Clock,
      color: "text-purple-500",
      trend: { value: "-12%", isPositive: true },
    },
    {
      label: t('productivity.metrics.activeTechnicians', 'Active Technicians'),
      value: "4",
      icon: Users,
      color: "text-orange-500",
    },
  ];

  return (
    <DashboardPage
      title={t('productivity.title', 'Productivity Tracker')}
      description={t('productivity.description', 'Monitor team performance and task completion metrics')}
      icon={Activity}
      metrics={metrics}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('productivity.hourlyProductivity', 'Hourly Productivity')}</CardTitle>
            <CardDescription>{t('productivity.hourlyProductivityDesc', 'Tasks completed and efficiency by hour')}</CardDescription>
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
                  name={t('productivity.tasksCompleted', 'Tasks Completed')}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#82ca9d"
                  name={t('productivity.efficiencyPercent', 'Efficiency %')}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('productivity.taskDistribution', 'Task Distribution')}</CardTitle>
            <CardDescription>{t('productivity.taskDistributionDesc', 'Completed vs pending tasks by technician')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={technicianStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#82ca9d" name={t('common.completed', 'Completed')} />
                <Bar dataKey="pending" fill="#ffc658" name={t('common.pending', 'Pending')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('productivity.technicianPerformance', 'Technician Performance')}</CardTitle>
          <CardDescription>{t('productivity.technicianPerformanceDesc', 'Individual productivity metrics and efficiency scores')}</CardDescription>
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
                      {tech.completed} {t('common.completed', 'completed')} • {tech.pending} {t('common.pending', 'pending')} • {t('productivity.avg', 'Avg')}: {tech.avgTime}
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
                    {tech.efficiency}% {t('productivity.efficiency', 'Efficiency')}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('productivity.efficiency', 'Efficiency')}</span>
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
            <CardTitle>{t('productivity.topPerformer', 'Top Performer')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Mike Johnson</p>
                <p className="text-sm text-muted-foreground">96% {t('productivity.efficiency', 'efficiency')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('productivity.mostProductiveHour', 'Most Productive Hour')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">2PM - 4PM</p>
                <p className="text-sm text-muted-foreground">15 {t('productivity.tasksCompletedShort', 'tasks completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('productivity.teamGoalProgress', 'Team Goal Progress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('productivity.dailyTarget', 'Daily Target')}</span>
                <span className="font-medium">42/50</span>
              </div>
              <Progress value={84} className="h-2" />
              <p className="text-xs text-muted-foreground">{t('productivity.goalAchieved', '84% of daily goal achieved')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
