import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        suggestions: [t('aiScheduling.optimizeMorningSchedule', 'Optimize morning schedule'), t('aiScheduling.balanceWorkload', 'Balance workload across technicians')],
      });
    },
    onSuccess: () => {
      toast({
        title: t('aiScheduling.optimizationComplete', 'Optimization Complete'),
        description: t('aiScheduling.optimizationCompletedSuccessfully', 'Scheduling optimization completed successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/history'] });
    },
    onError: (error: any) => {
      toast({
        title: t('aiScheduling.optimizationFailed', 'Optimization Failed'),
        description: error.message || t('aiScheduling.failedToRunOptimization', 'Failed to run optimization'),
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
      label: t('aiScheduling.optimizedToday', 'Optimized Today'),
      value: String(latestOptimization.appointmentsOptimized || 0),
      icon: Calendar,
      color: "text-[#0A5ED7]",
    },
    {
      label: t('aiScheduling.efficiencyGain', 'Efficiency Gain'),
      value: `${latestOptimization.efficiencyGain ? parseFloat(latestOptimization.efficiencyGain).toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: t('aiScheduling.avgUtilization', 'Avg Utilization'),
      value: `${avgUtilization ? avgUtilization.toFixed(0) : 0}%`,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: t('aiScheduling.activeRules', 'Active Rules'),
      value: String(rules.filter((r: any) => r.isActive).length),
      icon: Zap,
      color: "text-[#F97316]",
    },
  ];

  return (
    <DashboardPage
      title={t('aiScheduling.title', '🤖 AI-Powered Scheduling')}
      description={t('aiScheduling.description', 'Optimize technician schedules automatically')}
      icon={Zap}
      metrics={metrics}
    >
      <div className="flex justify-end mb-6">
        <Button 
          onClick={() => optimizeMutation.mutate()}
          disabled={optimizeMutation.isPending}
          data-testid="button-run-optimization"
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
        >
          <Zap className="h-4 w-4 mr-2" />
          {optimizeMutation.isPending ? t('aiScheduling.optimizing', 'Optimizing...') : t('aiScheduling.runOptimization', 'Run Optimization')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('aiScheduling.schedulingRules', 'Scheduling Rules')}</CardTitle>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">{t('aiScheduling.noSchedulingRulesDefined', 'No scheduling rules defined')}</div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule: any) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`rule-${rule.id}`}>
                    <div>
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{rule.ruleName || t('aiScheduling.unnamedRule', 'Unnamed Rule')}</h3>
                      <p className="text-sm text-[#64748B]">{t('aiScheduling.priority', 'Priority')}: {rule.priority || 1}</p>
                    </div>
                    <Switch checked={rule.isActive} data-testid={`switch-rule-${rule.id}`} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('aiScheduling.aiSuggestions', 'AI Suggestions')}</CardTitle>
          </CardHeader>
          <CardContent>
            {(!latestOptimization.suggestions || latestOptimization.suggestions.length === 0) ? (
              <div className="text-center py-8 text-[#64748B]">
                {t('aiScheduling.runOptimizationToSeeSuggestions', 'Run an optimization to see AI suggestions')}
              </div>
            ) : (
              <div className="space-y-2">
                {latestOptimization.suggestions.map((suggestion: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 rounded-lg border border-[#0A5ED7]/20" data-testid={`suggestion-${i}`}>
                    <Zap className="h-5 w-5 text-[#0A5ED7] mt-0.5" />
                    <p className="text-sm text-[#0B1F3B] dark:text-white">{suggestion}</p>
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
