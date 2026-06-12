// @ts-nocheck
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnalyticsPage } from "@/components/layouts";
import { Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function StaffPerformanceReview() {
  const { t } = useTranslation();
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
    { month: t('staffReview.months.jan', 'Jan'), average: 82, target: 85 },
    { month: t('staffReview.months.feb', 'Feb'), average: 84, target: 85 },
    { month: t('staffReview.months.mar', 'Mar'), average: 86, target: 85 },
    { month: t('staffReview.months.apr', 'Apr'), average: 88, target: 85 },
    { month: t('staffReview.months.may', 'May'), average: 87, target: 85 },
    { month: t('staffReview.months.jun', 'Jun'), average: 90, target: 85 },
  ];

  const topPerformers = [
    { name: "John Smith", role: t('staffReview.roles.seniorTechnician', 'Senior Technician'), score: 91.2, tasks: 145 },
    { name: "Sarah Johnson", role: t('staffReview.roles.leadMechanic', 'Lead Mechanic'), score: 90.8, tasks: 132 },
    { name: "Emily Davis", role: t('staffReview.roles.technician', 'Technician'), score: 89.8, tasks: 128 },
  ];

  const kpiData = [
    { category: t('staffReview.kpi.efficiency', 'Efficiency'), value: 88 },
    { category: t('staffReview.kpi.quality', 'Quality'), value: 89 },
    { category: t('staffReview.kpi.punctuality', 'Punctuality'), value: 90 },
    { category: t('staffReview.kpi.teamwork', 'Teamwork'), value: 90 },
    { category: t('staffReview.kpi.customerSatisfaction', 'Customer Satisfaction'), value: 92 },
  ];

  const filters = [
    {
      id: "period",
      label: t('staffReview.period', 'Period'),
      type: "select" as const,
      options: [
        { value: "week", label: t('staffReview.periods.thisWeek', 'This Week') },
        { value: "month", label: t('staffReview.periods.thisMonth', 'This Month') },
        { value: "quarter", label: t('staffReview.periods.thisQuarter', 'This Quarter') },
        { value: "year", label: t('staffReview.periods.thisYear', 'This Year') },
      ],
      value: selectedPeriod,
      onChange: setSelectedPeriod,
    },
    {
      id: "department",
      label: t('staffReview.department', 'Department'),
      type: "select" as const,
      options: [
        { value: "all", label: t('staffReview.departments.all', 'All Departments') },
        { value: "mechanics", label: t('staffReview.departments.mechanics', 'Mechanics') },
        { value: "service", label: t('staffReview.departments.serviceAdvisors', 'Service Advisors') },
        { value: "admin", label: t('staffReview.departments.administration', 'Administration') },
      ],
      value: selectedDepartment,
      onChange: setSelectedDepartment,
    },
  ];

  const sections = [
    {
      title: t('staffReview.sections.teamOverview', 'Team Performance Overview'),
      description: t('staffReview.sections.teamOverviewDesc', 'Individual performance metrics across key areas'),
      content: (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0] dark:stroke-[#232A36]" />
            <XAxis dataKey="name" className="text-xs" tick={{ fill: '#64748B' }} />
            <YAxis tick={{ fill: '#64748B' }} />
            <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px" }} />
            <Legend />
            <Bar dataKey="efficiency" fill="#0A5ED7" name={t('staffReview.kpi.efficiency', 'Efficiency')} />
            <Bar dataKey="quality" fill="#0BB3FF" name={t('staffReview.kpi.quality', 'Quality')} />
            <Bar dataKey="punctuality" fill="#64748B" name={t('staffReview.kpi.punctuality', 'Punctuality')} />
            <Bar dataKey="teamwork" fill="#0B1F3B" name={t('staffReview.kpi.teamwork', 'Teamwork')} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: t('staffReview.sections.performanceTrends', 'Performance Trends'),
      description: t('staffReview.sections.performanceTrendsDesc', 'Average team performance over time vs target'),
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0] dark:stroke-[#232A36]" />
            <XAxis dataKey="month" tick={{ fill: '#64748B' }} />
            <YAxis tick={{ fill: '#64748B' }} />
            <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey="average" stroke="#0A5ED7" strokeWidth={2} name={t('staffReview.averageScore', 'Average Score')} />
            <Line type="monotone" dataKey="target" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" name={t('staffReview.target', 'Target')} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: t('staffReview.sections.kpiTitle', 'Key Performance Indicators'),
      description: t('staffReview.sections.kpiDesc', 'Overall team KPIs radar chart'),
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={kpiData}>
              <PolarGrid className="stroke-[#E2E8F0] dark:stroke-[#232A36]" />
              <PolarAngleAxis dataKey="category" className="text-xs" tick={{ fill: '#64748B' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748B' }} />
              <Radar name={t('staffReview.performance', 'Performance')} dataKey="value" stroke="#0A5ED7" fill="#0A5ED7" fillOpacity={0.3} />
              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px" }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="space-y-4">
            {kpiData.map((kpi) => (
              <div key={kpi.category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{kpi.category}</span>
                  <span className="text-sm font-bold text-[#0B1F3B] dark:text-white">{kpi.value}%</span>
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
      title={t('staffReview.title', 'Staff Performance Review')}
      description={t('staffReview.description', 'Comprehensive performance analytics and reviews')}
      icon={Award}
      filters={filters}
      sections={sections}
    >
      <Card className="mb-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <TrendingUp className="w-5 h-5 text-[#0A5ED7]" />
            {t('staffReview.topPerformers', 'Top Performers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div
                key={performer.name}
                className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`performer-${index}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] font-bold text-white">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">{performer.name}</p>
                    <p className="text-sm text-[#64748B]">{performer.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{performer.score}</p>
                  <p className="text-sm text-[#64748B]">{performer.tasks} {t('staffReview.tasksCompleted', 'tasks completed')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AnalyticsPage>
  );
}
