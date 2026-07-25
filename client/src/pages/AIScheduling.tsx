import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, TrendingUp, Users, Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import { DashboardPage } from "@/components/layouts/DashboardPage";

interface Assignment {
  jobId: string;
  technicianId: string;
  technicianName: string;
  score: number;
  reasons: string[];
}

interface TechUtilization {
  id: string;
  name: string;
  assignedJobs: number;
  currentLoad: number;
  maxLoad: number;
  utilization: number;
}

interface OptimizationResult {
  id: string;
  timestamp: string;
  appointmentsOptimized: number;
  efficiencyGain: string;
  technicianUtilization: Record<string, string>;
  suggestions: string[];
  assignments: Assignment[];
  report: {
    totalJobs: number;
    averageScore: number;
    technicianUtilization: TechUtilization[];
    unassignedJobs: number;
  };
}

export default function AIScheduling() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [latestResult, setLatestResult] = useState<OptimizationResult | null>(null);

  const { data: rules = [] } = useQuery<any[]>({
    queryKey: ['/api/scheduling/rules'],
  });

  const { data: history = [] } = useQuery<OptimizationResult[]>({
    queryKey: ['/api/scheduling/history'],
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/scheduling/optimize', {});
      return res.json();
    },
    onSuccess: (data: OptimizationResult) => {
      setLatestResult(data);
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

  // Use latest result from mutation or first history entry
  const displayResult = latestResult || history[0] || null;

  const latestOptimization = displayResult || {
    appointmentsOptimized: 0,
    efficiencyGain: '0',
    technicianUtilization: {},
    suggestions: [],
  };

  const avgUtilization = latestOptimization.technicianUtilization
    ? Object.values(latestOptimization.technicianUtilization as Record<string, string>)
        .map(v => Number(v))
        .reduce((a, b) => a + b, 0) /
      (Object.keys(latestOptimization.technicianUtilization).length || 1)
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
      value: `${latestOptimization.efficiencyGain ? parseFloat(latestOptimization.efficiencyGain as string).toFixed(1) : 0}%`,
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

  function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-500';
  }

  function getScoreBadge(score: number) {
    if (score >= 80) return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Good</Badge>;
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Fair</Badge>;
  }

  function getUtilizationColor(util: number): string {
    if (util >= 90) return 'bg-red-500';
    if (util >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  return (
    <DashboardPage
      title={t('aiScheduling.title', 'AI-Powered Scheduling')}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimization Results - Assignments */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              {t('aiScheduling.optimizationResults', 'Optimization Results')}
              {displayResult?.report && (
                <Badge variant="outline" className="ml-2">
                  Avg Score: {displayResult.report.averageScore}%
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!displayResult?.assignments || displayResult.assignments.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">
                {t('aiScheduling.runOptimizationToSeeResults', 'Run an optimization to see assignment results')}
              </div>
            ) : (
              <div className="space-y-3">
                {displayResult.assignments.map((assignment: Assignment) => (
                  <div
                    key={assignment.jobId}
                    className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`assignment-${assignment.jobId}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                          Job {assignment.jobId}
                        </h3>
                        <span className="text-[#64748B]">&#8594;</span>
                        <span className="font-medium text-[#0A5ED7] dark:text-[#0BB3FF]">
                          {assignment.technicianName}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {assignment.reasons.map((reason, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20 dark:text-[#0BB3FF]"
                          >
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(assignment.score)}`}>
                          {assignment.score}%
                        </div>
                        {getScoreBadge(assignment.score)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technician Utilization Chart */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              {t('aiScheduling.technicianUtilization', 'Technician Utilization')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!displayResult?.report?.technicianUtilization || displayResult.report.technicianUtilization.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">
                {t('aiScheduling.noUtilizationData', 'No utilization data available')}
              </div>
            ) : (
              <div className="space-y-4">
                {displayResult.report.technicianUtilization.map((tech: TechUtilization) => (
                  <div key={tech.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{tech.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#64748B] text-xs">
                          {tech.currentLoad + tech.assignedJobs}/{tech.maxLoad} jobs
                        </span>
                        <span className={`font-semibold ${tech.utilization >= 90 ? 'text-red-500' : tech.utilization >= 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {tech.utilization}%
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full h-3 bg-[#E2E8F0] dark:bg-[#232A36] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getUtilizationColor(tech.utilization)}`}
                        style={{ width: `${Math.min(tech.utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#F97316]" />
              {t('aiScheduling.aiSuggestions', 'AI Suggestions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!latestOptimization.suggestions || (latestOptimization.suggestions as string[]).length === 0) ? (
              <div className="text-center py-8 text-[#64748B]">
                {t('aiScheduling.runOptimizationToSeeSuggestions', 'Run an optimization to see AI suggestions')}
              </div>
            ) : (
              <div className="space-y-2">
                {(latestOptimization.suggestions as string[]).map((suggestion: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 rounded-lg border border-[#0A5ED7]/20" data-testid={`suggestion-${i}`}>
                    <Zap className="h-5 w-5 text-[#0A5ED7] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#0B1F3B] dark:text-white">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduling Rules */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('aiScheduling.schedulingRules', 'Scheduling Rules')}</CardTitle>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">{t('aiScheduling.noSchedulingRulesDefined', 'No scheduling rules defined')}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rules.map((rule: any) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`rule-${rule.id}`}>
                    <div>
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{rule.ruleName || t('aiScheduling.unnamedRule', 'Unnamed Rule')}</h3>
                      <p className="text-sm text-[#64748B]">{rule.description || `${t('aiScheduling.priority', 'Priority')}: ${rule.priority || 1}`}</p>
                    </div>
                    <Switch checked={rule.isActive} data-testid={`switch-rule-${rule.id}`} />
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
