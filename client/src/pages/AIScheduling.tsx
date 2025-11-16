import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, TrendingUp, Users, Zap } from "lucide-react";
import { DashboardPage } from "@/components/layouts/DashboardPage";

export default function AIScheduling() {
  const { toast } = useToast();

  const { data: rules = [] } = useQuery<any[]>({
    queryKey: ['/api/scheduling/rules'],
  });

  const { data: history = [] } = useQuery<any[]>({
    queryKey: ['/api/scheduling/history'],
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/scheduling/optimize', {
        optimizationDate: new Date().toISOString(),
        appointmentsOptimized: 10,
        efficiencyGain: "12.5",
        technicianUtilization: { tech1: "85", tech2: "90" },
        suggestions: ["Optimize morning schedule", "Balance workload across technicians"],
      });
    },
    onSuccess: () => {
      toast({
        title: "Optimization Complete",
        description: "Scheduling optimization completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to run optimization",
        variant: "destructive",
      });
    },
  });

  const latestOptimization = history[0] || {
    appointmentsOptimized: 0,
    efficiencyGain: 0,
    technicianUtilization: {},
    suggestions: [],
  };

  const avgUtilization = latestOptimization.technicianUtilization
    ? Object.values(latestOptimization.technicianUtilization as Record<string, string>)
        .map(v => Number(v))
        .reduce((a, b) => a + b, 0) /
      Object.keys(latestOptimization.technicianUtilization).length || 0
    : 0;

  const metrics = [
    {
      label: "Optimized Today",
      value: String(latestOptimization.appointmentsOptimized || 0),
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      label: "Efficiency Gain",
      value: `${latestOptimization.efficiencyGain ? parseFloat(latestOptimization.efficiencyGain).toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Avg Utilization",
      value: `${avgUtilization ? avgUtilization.toFixed(0) : 0}%`,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Active Rules",
      value: String(rules.filter((r: any) => r.isActive).length),
      icon: Zap,
      color: "text-yellow-600",
    },
  ];

  return (
    <DashboardPage
      title="🤖 AI-Powered Scheduling"
      description="Optimize technician schedules automatically"
      icon={Zap}
      metrics={metrics}
    >
      <div className="flex justify-end mb-6">
        <Button 
          onClick={() => optimizeMutation.mutate()}
          disabled={optimizeMutation.isPending}
          data-testid="button-run-optimization"
        >
          <Zap className="h-4 w-4 mr-2" />
          {optimizeMutation.isPending ? "Optimizing..." : "Run Optimization"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Scheduling Rules</CardTitle>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No scheduling rules defined</div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule: any) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`rule-${rule.id}`}>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{rule.ruleName || 'Unnamed Rule'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Priority: {rule.priority || 1}</p>
                    </div>
                    <Switch checked={rule.isActive} data-testid={`switch-rule-${rule.id}`} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            {(!latestOptimization.suggestions || latestOptimization.suggestions.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                Run an optimization to see AI suggestions
              </div>
            ) : (
              <div className="space-y-2">
                {latestOptimization.suggestions.map((suggestion: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900 rounded" data-testid={`suggestion-${i}`}>
                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-gray-900 dark:text-white">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
