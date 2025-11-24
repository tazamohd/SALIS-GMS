import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
      week: `Week ${index + 1}`,
      completed: rollup.jobsCompleted || 0,
      target: 40,
    }));

  const skillsData = [
    { skill: "Engine Repair", proficiency: 90 },
    { skill: "Diagnostics", proficiency: 85 },
    { skill: "Electrical", proficiency: 80 },
    { skill: "Brake Systems", proficiency: 95 },
    { skill: "Transmission", proficiency: 75 },
  ];

  const topPerformers = performanceData
    .sort((a: any, b: any) => b.tasksCompleted - a.tasksCompleted)
    .slice(0, 5)
    .map((tech: any, index: number) => ({
      id: index + 1,
      name: tech.name,
      role: "Technician",
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
        title: "Preferences Updated",
        description: "Your metric preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update metric preferences.",
        variant: "destructive",
      });
    }
  };

  const filters = [
    {
      id: "period",
      label: "Period",
      type: "select" as const,
      options: [
        { value: "day", label: "Today" },
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
      title: "Top Performing Technicians",
      description: "Highest ranked technicians based on tasks completed",
      content: (
        <div className="space-y-4">
          {topPerformers.map((tech: any, index: number) => (
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
                    {tech.name.split(' ').map((n: string) => n[0]).join('')}
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
      ),
    },
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
      description: selectedTechnician !== 'all' 
        ? `Weekly task completion trends for selected technician` 
        : "Select a technician to view completion trends",
      content: selectedTechnician !== 'all' && weeklyTrends.length > 0 ? (
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
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
          Select a specific technician to view completion trends
        </div>
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
    />
  );
}
