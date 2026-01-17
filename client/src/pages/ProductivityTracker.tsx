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
    { name: t('sample.technicianName1', 'Ahmed Al-Rashid'), completed: 12, pending: 3, avgTime: "2.3h", efficiency: 94 },
    { name: t('sample.technicianName2', 'Fatima Hassan'), completed: 10, pending: 2, avgTime: "2.5h", efficiency: 91 },
    { name: t('sample.technicianName3', 'Omar Khalid'), completed: 11, pending: 4, avgTime: "2.1h", efficiency: 96 },
    { name: t('sample.technicianName4', 'Sara Mohammed'), completed: 9, pending: 1, avgTime: "2.8h", efficiency: 88 },
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
      color: "text-[#0A5ED7]",
      trend: { value: "+3%", isPositive: true },
    },
    {
      label: t('productivity.metrics.avgTaskDuration', 'Avg Task Duration'),
      value: "2.4h",
      icon: Clock,
      color: "text-[#0BB3FF]",
      trend: { value: "-12%", isPositive: true },
    },
    {
      label: t('productivity.metrics.activeTechnicians', 'Active Technicians'),
      value: "4",
      icon: Users,
      color: "text-[#F97316]",
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
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('productivity.hourlyProductivity', 'Hourly Productivity')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('productivity.hourlyProductivityDesc', 'Tasks completed and efficiency by hour')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyProductivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0] dark:stroke-[#232A36]" />
                <XAxis dataKey="hour" tick={{ fill: '#64748B' }} />
                <YAxis yAxisId="left" tick={{ fill: '#64748B' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px" }} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="tasks"
                  stroke="#0A5ED7"
                  name={t('productivity.tasksCompleted', 'Tasks Completed')}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#0BB3FF"
                  name={t('productivity.efficiencyPercent', 'Efficiency %')}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('productivity.taskDistribution', 'Task Distribution')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('productivity.taskDistributionDesc', 'Completed vs pending tasks by technician')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={technicianStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0] dark:stroke-[#232A36]" />
                <XAxis dataKey="name" tick={{ fill: '#64748B' }} />
                <YAxis tick={{ fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="completed" fill="#0A5ED7" name={t('common.completed', 'Completed')} />
                <Bar dataKey="pending" fill="#F97316" name={t('common.pending', 'Pending')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('productivity.technicianPerformance', 'Technician Performance')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('productivity.technicianPerformanceDesc', 'Individual productivity metrics and efficiency scores')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicianStats.map((tech, idx) => (
              <div
                key={idx}
                className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`technician-stats-${idx}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{tech.name}</p>
                    <p className="text-sm text-[#64748B]">
                      {tech.completed} {t('common.completed', 'completed')} • {tech.pending} {t('common.pending', 'pending')} • {t('productivity.avg', 'Avg')}: {tech.avgTime}
                    </p>
                  </div>
                  <Badge
                    className={
                      tech.efficiency >= 95
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : tech.efficiency >= 90
                        ? "bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20"
                        : "bg-[#F97316]/10 text-[#F97316] dark:bg-[#F97316]/20"
                    }
                  >
                    {tech.efficiency}% {t('productivity.efficiency', 'Efficiency')}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">{t('productivity.efficiency', 'Efficiency')}</span>
                    <span className="font-medium text-[#0B1F3B] dark:text-white">{tech.efficiency}%</span>
                  </div>
                  <Progress value={tech.efficiency} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('productivity.topPerformer', 'Top Performer')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-[#0B1F3B] dark:text-white">{t('sample.technicianName3', 'Omar Khalid')}</p>
                <p className="text-sm text-[#64748B]">96% {t('productivity.efficiency', 'efficiency')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('productivity.mostProductiveHour', 'Most Productive Hour')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#0A5ED7]" />
              </div>
              <div>
                <p className="font-semibold text-[#0B1F3B] dark:text-white">2PM - 4PM</p>
                <p className="text-sm text-[#64748B]">15 {t('productivity.tasksCompletedShort', 'tasks completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('productivity.teamGoalProgress', 'Team Goal Progress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">{t('productivity.dailyTarget', 'Daily Target')}</span>
                <span className="font-medium text-[#0B1F3B] dark:text-white">42/50</span>
              </div>
              <Progress value={84} className="h-2" />
              <p className="text-xs text-[#64748B]">{t('productivity.goalAchieved', '84% of daily goal achieved')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
