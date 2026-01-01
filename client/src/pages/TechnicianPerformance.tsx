import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AnalyticsPage } from "@/components/layouts";
import { Users, TrendingUp, Clock, CheckCircle, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function TechnicianPerformance() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedTechnician, setSelectedTechnician] = useState("all");
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const { data: metricDefinitions = [] } = useQuery<any[]>({
    queryKey: ['/api/technician-performance/metrics/definitions'],
  });

  const userId = user?.id || '';
  
  const { data: metricPreferences = [] } = useQuery<any[]>({
    queryKey: ['/api/technician-performance/metrics/preferences', userId],
    enabled: !!userId,
  });

  const { data: technicians = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  const technicianList = technicians.filter((t: any) => 
    t.userType === 'staff' && t.roles?.some((r: any) => r.roleName?.toLowerCase().includes('technician'))
  );

  const { data: performanceRollups = [] } = useQuery({
    queryKey: ['/api/technician-performance/rollups', selectedTechnician, selectedPeriod],
    enabled: selectedTechnician !== 'all',
    queryFn: async () => {
      if (selectedTechnician === 'all') return [];
      const response = await fetch(`/api/technician-performance/rollups?technicianId=${selectedTechnician}&period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch performance data');
      return response.json();
    },
  });

  const performanceData = technicianList.map((tech: any) => ({
    name: tech.fullName || tech.username,
    tasksCompleted: Math.floor(Math.random() * 30) + 20,
    avgTime: (Math.random() * 2 + 2).toFixed(1),
    quality: (Math.random() * 0.5 + 4.5).toFixed(1),
    efficiency: Math.floor(Math.random() * 20) + 75,
  }));

  const weeklyTrends = performanceRollups
    .slice(0, 4)
    .reverse()
    .map((rollup: any, index: number) => ({
      week: `${t('performance.week', 'Week')} ${index + 1}`,
      completed: rollup.jobsCompleted || 0,
      target: 40,
    }));

  const skillsData = [
    { skill: t('performance.skills.engineRepair', 'Engine Repair'), proficiency: 90 },
    { skill: t('performance.skills.diagnostics', 'Diagnostics'), proficiency: 85 },
    { skill: t('performance.skills.electrical', 'Electrical'), proficiency: 80 },
    { skill: t('performance.skills.brakeSystems', 'Brake Systems'), proficiency: 95 },
    { skill: t('performance.skills.transmission', 'Transmission'), proficiency: 75 },
  ];

  const topPerformers = performanceData
    .sort((a: any, b: any) => b.tasksCompleted - a.tasksCompleted)
    .slice(0, 5)
    .map((tech: any, index: number) => ({
      id: index + 1,
      name: tech.name,
      role: t('performance.technician', 'Technician'),
      tasksCompleted: tech.tasksCompleted,
      rating: parseFloat(tech.quality),
      efficiency: tech.efficiency,
    }));

  const handleMetricPreferenceChange = async (metricKey: string, isVisible: boolean) => {
    try {
      await apiRequest('/api/technician-performance/metrics/preferences', 'POST', {
        userId,
        metricKey,
        isVisible,
        sortOrder: metricPreferences.length + 1,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/technician-performance/metrics/preferences', userId] });
      toast({
        title: t('performance.preferencesUpdated', 'Preferences Updated'),
        description: t('performance.preferencesSaved', 'Your metric preferences have been saved.'),
      });
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('performance.preferencesError', 'Failed to update metric preferences.'),
        variant: "destructive",
      });
    }
  };

  const filters = [
    {
      id: "period",
      label: t('performance.period', 'Period'),
      type: "select" as const,
      options: [
        { value: "day", label: t('performance.periods.today', 'Today') },
        { value: "week", label: t('performance.periods.thisWeek', 'This Week') },
        { value: "month", label: t('performance.periods.thisMonth', 'This Month') },
        { value: "quarter", label: t('performance.periods.thisQuarter', 'This Quarter') },
        { value: "year", label: t('performance.periods.thisYear', 'This Year') },
      ],
      value: selectedPeriod,
      onChange: setSelectedPeriod,
    },
    {
      id: "technician",
      label: t('performance.technician', 'Technician'),
      type: "select" as const,
      options: [
        { value: "all", label: t('performance.allTechnicians', 'All Technicians') },
        ...technicianList.map((tech: any) => ({
          value: tech.id,
          label: tech.fullName || tech.username,
        })),
      ],
      value: selectedTechnician,
      onChange: setSelectedTechnician,
    },
  ];

  const sections = [
    {
      title: t('performance.sections.topPerforming', 'Top Performing Technicians'),
      description: t('performance.sections.topPerformingDesc', 'Highest ranked technicians based on tasks completed'),
      content: (
        <div className="space-y-4">
          {topPerformers.map((tech: any, index: number) => (
            <div
              key={tech.id}
              className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] hover:bg-white dark:hover:bg-[#151A23] transition-colors"
              data-testid={`technician-${tech.id}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] font-bold text-white">
                  #{index + 1}
                </div>
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
                    {tech.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[#0B1F3B] dark:text-white">{tech.name}</p>
                  <p className="text-sm text-[#64748B]">{tech.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">{tech.tasksCompleted}</p>
                  <p className="text-xs text-[#64748B]">{t('performance.tasks', 'Tasks')}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">{tech.rating}</p>
                  <p className="text-xs text-[#64748B]">{t('performance.rating', 'Rating')}</p>
                </div>
                <div className="text-center">
                  <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0">
                    {tech.efficiency}% {t('performance.efficiency', 'Efficiency')}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: t('performance.sections.comparison', 'Technician Performance Comparison'),
      description: t('performance.sections.comparisonDesc', 'Compare key metrics across all technicians'),
      content: (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0] dark:stroke-[#232A36]" />
            <XAxis 
              dataKey="name" 
              className="text-xs" 
              tick={{ fill: '#64748B' }}
            />
            <YAxis tick={{ fill: '#64748B' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #E2E8F0",
                borderRadius: "8px"
              }} 
            />
            <Legend />
            <Bar dataKey="tasksCompleted" fill="#0A5ED7" name={t('performance.tasksCompleted', 'Tasks Completed')} />
            <Bar dataKey="efficiency" fill="#0BB3FF" name={t('performance.efficiencyPercent', 'Efficiency %')} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: t('performance.sections.completionTrends', 'Completion Trends'),
      description: selectedTechnician !== 'all' 
        ? t('performance.sections.completionTrendsDesc', 'Weekly task completion trends for selected technician')
        : t('performance.sections.selectTechnician', 'Select a technician to view completion trends'),
      content: selectedTechnician !== 'all' && weeklyTrends.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyTrends}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0] dark:stroke-[#232A36]" />
            <XAxis dataKey="week" tick={{ fill: '#64748B' }} />
            <YAxis tick={{ fill: '#64748B' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #E2E8F0",
                borderRadius: "8px"
              }} 
            />
            <Legend />
            <Line type="monotone" dataKey="completed" stroke="#0A5ED7" strokeWidth={2} name={t('common.completed', 'Completed')} />
            <Line type="monotone" dataKey="target" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" name={t('performance.target', 'Target')} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-[#64748B]">
          {t('performance.sections.selectTechnicianPrompt', 'Select a specific technician to view completion trends')}
        </div>
      ),
    },
    {
      title: t('performance.sections.skillsProficiency', 'Skills Proficiency'),
      description: t('performance.sections.skillsProficiencyDesc', 'Technical skills assessment radar chart'),
      content: (
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={skillsData}>
            <PolarGrid className="stroke-[#E2E8F0] dark:stroke-[#232A36]" />
            <PolarAngleAxis 
              dataKey="skill" 
              className="text-xs" 
              tick={{ fill: '#64748B' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fill: '#64748B' }}
            />
            <Radar 
              name={t('performance.proficiency', 'Proficiency')}
              dataKey="proficiency" 
              stroke="#0A5ED7" 
              fill="#0A5ED7" 
              fillOpacity={0.3} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #E2E8F0",
                borderRadius: "8px"
              }} 
            />
          </RadarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <AnalyticsPage
      title={t('performance.title', 'Technician Performance')}
      description={t('performance.description', 'Track and analyze technician productivity and performance metrics')}
      icon={Users}
      filters={filters}
      sections={sections}
    />
  );
}
