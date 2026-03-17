import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Car, Wrench, Brain, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

interface PredictionItem {
  serviceType: string;
  predictedDate: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  basedOn: string;
  estimatedCost: number;
}

interface VehiclePrediction {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  predictions: PredictionItem[];
}

interface MaintenanceStats {
  vehicleCount: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  estimatedRevenue: number;
}

export default function PredictiveMaintenance() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set());

  const { data: predictionsData, isLoading: predictionsLoading } = useQuery<{ predictions: VehiclePrediction[] }>({
    queryKey: ["/api/predictive-maintenance/predictions"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<MaintenanceStats>({
    queryKey: ["/api/predictive-maintenance/stats"],
  });

  const predictions = predictionsData?.predictions || [];

  const toggleVehicle = (vehicleId: string) => {
    setExpandedVehicles(prev => {
      const next = new Set(prev);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });
  };

  const handleRunAnalysis = async () => {
    toast({
      title: t('predictiveMaintenance.analysisStarted', 'Analysis Started'),
      description: t('predictiveMaintenance.aiAnalyzing', 'AI is analyzing service history patterns...'),
    });
    queryClient.invalidateQueries({ queryKey: ["/api/predictive-maintenance/predictions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/predictive-maintenance/stats"] });
    toast({
      title: t('predictiveMaintenance.analysisComplete', 'Analysis Complete'),
      description: t('predictiveMaintenance.newPredictionsGenerated', 'Maintenance predictions have been refreshed.'),
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high":
        return "bg-[#F97316]/10 text-[#F97316]";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-[#F8FAFC] text-[#64748B] dark:bg-[#0E1117]";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-[#F97316]" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  // Filter vehicles: keep vehicles that have at least one prediction matching the urgency filter
  const filteredPredictions = predictions.map(v => {
    if (urgencyFilter === "all") return v;
    return {
      ...v,
      predictions: v.predictions.filter(p => p.urgency === urgencyFilter),
    };
  }).filter(v => v.predictions.length > 0);

  // Get the highest urgency for a vehicle (for sorting/display)
  const getVehicleTopUrgency = (v: VehiclePrediction): string => {
    const order = ['critical', 'high', 'medium', 'low'];
    for (const u of order) {
      if (v.predictions.some(p => p.urgency === u)) return u;
    }
    return 'low';
  };

  const isLoading = predictionsLoading || statsLoading;

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
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">
                {t('predictiveMaintenance.vehicles', 'Vehicles')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.vehicleCount || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                {t('predictiveMaintenance.critical', 'Critical')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.critical || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#F97316]">
                {t('predictiveMaintenance.high', 'High')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#F97316]">
                {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.high || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                {t('predictiveMaintenance.medium', 'Medium')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.medium || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                {t('predictiveMaintenance.low', 'Low')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.low || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  {t('predictiveMaintenance.estimatedRevenue', 'Est. Revenue')}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A5ED7]">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : `$${(stats?.estimatedRevenue || 0).toLocaleString()}`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgency Filter */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('common.filter', 'Filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <label className="text-sm font-medium text-[#64748B] mb-2 block">
                {t('predictiveMaintenance.urgency', 'Urgency')}
              </label>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger data-testid="select-urgency" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="all" className="text-[#0B1F3B] dark:text-white">{t('predictiveMaintenance.allUrgencies', 'All Urgencies')}</SelectItem>
                  <SelectItem value="critical" className="text-[#0B1F3B] dark:text-white">{t('predictiveMaintenance.critical', 'Critical')}</SelectItem>
                  <SelectItem value="high" className="text-[#0B1F3B] dark:text-white">{t('predictiveMaintenance.high', 'High')}</SelectItem>
                  <SelectItem value="medium" className="text-[#0B1F3B] dark:text-white">{t('predictiveMaintenance.medium', 'Medium')}</SelectItem>
                  <SelectItem value="low" className="text-[#0B1F3B] dark:text-white">{t('predictiveMaintenance.low', 'Low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Predictions List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredPredictions.length > 0 ? (
            filteredPredictions.map((vehicle) => {
              const isExpanded = expandedVehicles.has(vehicle.vehicleId);
              const topUrgency = getVehicleTopUrgency(vehicle);
              const urgentCount = vehicle.predictions.filter(p => p.urgency === 'critical' || p.urgency === 'high').length;

              return (
                <Card
                  key={vehicle.vehicleId}
                  className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-lg transition-shadow"
                  data-testid={`card-vehicle-${vehicle.vehicleId}`}
                >
                  {/* Vehicle Header - clickable to expand */}
                  <CardHeader
                    className="cursor-pointer select-none"
                    onClick={() => toggleVehicle(vehicle.vehicleId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-[#0A5ED7]" />
                        <div>
                          <CardTitle className="text-[#0B1F3B] dark:text-white text-lg">
                            {vehicle.vehicleName}
                          </CardTitle>
                          <CardDescription className="text-[#64748B]">
                            {vehicle.licensePlate || 'No plate'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getUrgencyColor(topUrgency)}>
                          {topUrgency}
                        </Badge>
                        {urgentCount > 0 && (
                          <span className="text-sm text-[#64748B]">
                            {urgentCount} urgent
                          </span>
                        )}
                        <span className="text-sm text-[#64748B]">
                          {vehicle.predictions.length} services
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-[#64748B]" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-[#64748B]" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded Prediction Cards */}
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {vehicle.predictions.map((pred, idx) => (
                          <div
                            key={idx}
                            className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 bg-[#F8FAFC] dark:bg-[#0E1117]"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getUrgencyIcon(pred.urgency)}
                                <span className="font-medium text-[#0B1F3B] dark:text-white">
                                  {pred.serviceType}
                                </span>
                              </div>
                              <Badge className={getUrgencyColor(pred.urgency)} variant="secondary">
                                {pred.urgency}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-[#64748B] flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  Predicted Date
                                </span>
                                <span className="text-[#0B1F3B] dark:text-white font-medium">
                                  {pred.predictedDate}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-[#64748B] flex items-center gap-1">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  Est. Cost
                                </span>
                                <span className="text-[#0B1F3B] dark:text-white font-medium">
                                  ${pred.estimatedCost}
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[#64748B]">Confidence</span>
                                  <span className="text-[#0B1F3B] dark:text-white font-medium">
                                    {Math.round(pred.confidence * 100)}%
                                  </span>
                                </div>
                                <Progress
                                  value={pred.confidence * 100}
                                  className="h-2"
                                />
                              </div>

                              <div className="flex items-start gap-1 pt-1">
                                <Brain className="h-3.5 w-3.5 text-[#0A5ED7] mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-[#64748B]">
                                  {pred.basedOn}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          ) : (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-16 w-16 text-[#64748B] mb-4" />
                <p className="text-[#64748B] text-center">
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
