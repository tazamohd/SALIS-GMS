import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Car, Wrench, Brain } from "lucide-react";
import type { AIMaintenancePrediction } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PredictiveMaintenance() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: predictions, isLoading } = useQuery<AIMaintenancePrediction[]>({
    queryKey: ["/api/ai/maintenance-predictions"],
  });

  const handleAcknowledge = async (predictionId: string) => {
    try {
      await apiRequest(`/api/ai/maintenance-predictions/${predictionId}/acknowledge`, "POST", {});
      queryClient.invalidateQueries({ queryKey: ["/api/ai/maintenance-predictions"] });
      toast({
        title: t('predictiveMaintenance.predictionAcknowledged', 'Prediction Acknowledged'),
        description: t('predictiveMaintenance.markedAsAcknowledged', 'The maintenance prediction has been marked as acknowledged.'),
      });
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('predictiveMaintenance.failedToAcknowledge', 'Failed to acknowledge prediction. Please try again.'),
        variant: "destructive",
      });
    }
  };

  const handleRunAnalysis = async () => {
    try {
      toast({
        title: t('predictiveMaintenance.analysisStarted', 'Analysis Started'),
        description: t('predictiveMaintenance.aiAnalyzing', 'AI is analyzing service history patterns...'),
      });
      
      await apiRequest("/api/ai/maintenance-predictions/analyze", "POST", {});
      
      queryClient.invalidateQueries({ queryKey: ["/api/ai/maintenance-predictions"] });
      
      toast({
        title: t('predictiveMaintenance.analysisComplete', 'Analysis Complete'),
        description: t('predictiveMaintenance.newPredictionsGenerated', 'New maintenance predictions have been generated.'),
      });
    } catch (error) {
      toast({
        title: t('predictiveMaintenance.analysisFailed', 'Analysis Failed'),
        description: t('predictiveMaintenance.failedToRunAnalysis', 'Failed to run predictive analysis. Please try again.'),
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const filteredPredictions = predictions?.filter((pred) => {
    const matchesSeverity = severityFilter === "all" || pred.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || pred.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  const stats = {
    total: predictions?.length || 0,
    pending: predictions?.filter((p) => p.status === "pending").length || 0,
    critical: predictions?.filter((p) => p.severity === "critical").length || 0,
    acknowledged: predictions?.filter((p) => p.status === "acknowledged").length || 0,
  };

  return (
    <StandardPageLayout
      title={t('predictiveMaintenance.title', 'Predictive Maintenance')}
      description={t('predictiveMaintenance.description', 'AI-powered maintenance predictions based on service history analysis')}
      icon={Brain}
      actions={[
        {
          label: t('predictiveMaintenance.runAnalysis', 'Run Analysis'),
          onClick: handleRunAnalysis,
          icon: TrendingUp,
          variant: "default",
        },
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('predictiveMaintenance.totalPredictions', 'Total Predictions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('predictiveMaintenance.pendingReview', 'Pending Review')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('predictiveMaintenance.criticalIssues', 'Critical Issues')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.critical}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('predictiveMaintenance.acknowledged', 'Acknowledged')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.acknowledged}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">{t('common.filter', 'Filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t('predictiveMaintenance.severity', 'Severity')}
                </label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger data-testid="select-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('predictiveMaintenance.allSeverities', 'All Severities')}</SelectItem>
                    <SelectItem value="critical">{t('predictiveMaintenance.critical', 'Critical')}</SelectItem>
                    <SelectItem value="high">{t('predictiveMaintenance.high', 'High')}</SelectItem>
                    <SelectItem value="medium">{t('predictiveMaintenance.medium', 'Medium')}</SelectItem>
                    <SelectItem value="low">{t('predictiveMaintenance.low', 'Low')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t('common.status', 'Status')}
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('predictiveMaintenance.allStatuses', 'All Statuses')}</SelectItem>
                    <SelectItem value="pending">{t('common.pending', 'Pending')}</SelectItem>
                    <SelectItem value="acknowledged">{t('predictiveMaintenance.acknowledged', 'Acknowledged')}</SelectItem>
                    <SelectItem value="resolved">{t('predictiveMaintenance.resolved', 'Resolved')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredPredictions && filteredPredictions.length > 0 ? (
            filteredPredictions.map((prediction) => (
              <Card
                key={prediction.id}
                className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
                data-testid={`card-prediction-${prediction.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <CardTitle className="text-gray-900 dark:text-white">
                          {String(prediction.predictedIssue)}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap mt-2">
                        <Badge className={getSeverityColor(prediction.severity || "")}>
                          {String(prediction.severity || '')}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-gray-600 dark:text-gray-400"
                        >
                          {String(prediction.status || '')}
                        </Badge>
                        {prediction.confidence && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('predictiveMaintenance.confidence', 'Confidence')}: {String(prediction.confidence)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Wrench className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {t('predictiveMaintenance.recommendedAction', 'Recommended Action')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {String(prediction.recommendedAction || t('predictiveMaintenance.noRecommendation', 'No recommendation available'))}
                      </p>
                    </div>
                  </div>

                  {prediction.estimatedTimeframe ? (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {t('predictiveMaintenance.estimatedTimeframe', 'Estimated Timeframe')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {String(prediction.estimatedTimeframe)}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {prediction.basedOnData ? (
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {t('predictiveMaintenance.analysisBasedOn', 'Analysis Based On')}
                        </p>
                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                          <pre className="whitespace-pre-wrap font-mono text-xs">
                            {(() => {
                              const data = prediction.basedOnData;
                              return typeof data === 'object' && data !== null
                                ? JSON.stringify(data, null, 2)
                                : String(data ?? '');
                            })()}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex gap-2 pt-2">
                    {prediction.status === "pending" && (
                      <Button
                        onClick={() => handleAcknowledge(prediction.id)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        data-testid={`button-acknowledge-${prediction.id}`}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t('predictiveMaintenance.acknowledge', 'Acknowledge')}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-view-vehicle-${prediction.id}`}
                    >
                      <Car className="mr-2 h-4 w-4" />
                      {t('predictiveMaintenance.viewVehicle', 'View Vehicle')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {t('predictiveMaintenance.noPredictions', 'No maintenance predictions found.')}
                  <br />
                  {t('predictiveMaintenance.clickRunAnalysis', 'Click "Run Analysis" to generate predictions based on service history.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </StandardPageLayout>
  );
}
