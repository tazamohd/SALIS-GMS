import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsPageLayout, TabConfig } from "@/components/layouts/TabsPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, Clock, Wrench, Package, Calendar, MessageSquare, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function AIAutomation() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("estimation");

  const [estimationForm, setEstimationForm] = useState({
    serviceType: "",
    vehicleId: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
  });

  const [predictionForm, setPredictionForm] = useState({
    vehicleId: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    mileage: "",
  });

  const [partsForm, setPartsForm] = useState({
    serviceType: "",
    vehicleId: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    description: "",
  });

  const [chatMessage, setChatMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { data: estimations = [] } = useQuery({
    queryKey: ['/api/ai/job-estimations'],
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['/api/ai/maintenance-predictions'],
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['/api/ai/parts-recommendations'],
  });

  const { data: scheduleOpts = [] } = useQuery({
    queryKey: ['/api/ai/schedule-optimizations'],
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/ai/chat-conversations'],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const estimateJobMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/ai/estimate-job', 'POST', data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/job-estimations'] });
      if (data?.error) {
        toast({ 
          title: t('aiAutomation.estimationCompletedWithWarnings', 'Estimation completed with warnings'), 
          description: data.error,
          variant: "destructive" 
        });
      } else {
        toast({ title: t('aiAutomation.jobEstimationCompleted', 'Job estimation completed'), description: t('aiAutomation.aiGeneratedEstimates', 'AI has generated time and cost estimates') });
      }
      setEstimationForm({ serviceType: "", vehicleId: "", vehicleMake: "", vehicleModel: "", vehicleYear: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: t('aiAutomation.estimationFailed', 'Estimation failed'), 
        description: error.message || t('aiAutomation.failedToGenerateEstimation', 'Failed to generate AI estimation'),
        variant: "destructive" 
      });
    },
  });

  const predictMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/ai/predict-maintenance', 'POST', data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/maintenance-predictions'] });
      if (data?.error) {
        toast({ 
          title: t('aiAutomation.predictionCompletedWithWarnings', 'Prediction completed with warnings'), 
          description: data.error,
          variant: "destructive" 
        });
      } else {
        toast({ title: t('aiAutomation.maintenancePredictionCreated', 'Maintenance prediction created'), description: t('aiAutomation.aiAnalyzedVehicle', 'AI has analyzed the vehicle and made predictions') });
      }
      setPredictionForm({ vehicleId: "", vehicleMake: "", vehicleModel: "", vehicleYear: "", mileage: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: t('aiAutomation.maintenancePredictionFailed', 'Maintenance prediction failed'), 
        description: error.message || t('aiAutomation.failedToAnalyzeVehicle', 'Failed to analyze vehicle and predict maintenance issues'),
        variant: "destructive" 
      });
    },
  });

  const recommendPartsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/ai/recommend-parts', 'POST', data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/parts-recommendations'] });
      if (data?.error) {
        toast({ 
          title: t('aiAutomation.recommendationCompletedWithWarnings', 'Recommendation completed with warnings'), 
          description: data.error,
          variant: "destructive" 
        });
      } else {
        toast({ title: t('aiAutomation.partsRecommendationReady', 'Parts recommendation ready'), description: t('aiAutomation.aiSuggestedParts', 'AI has suggested parts for this service') });
      }
      setPartsForm({ serviceType: "", vehicleId: "", vehicleMake: "", vehicleModel: "", vehicleYear: "", description: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: t('aiAutomation.partsRecommendationFailed', 'Parts recommendation failed'), 
        description: error.message || t('aiAutomation.failedToGeneratePartsRecommendations', 'Failed to generate parts recommendations'),
        variant: "destructive" 
      });
    },
  });

  const optimizeScheduleMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/ai/optimize-schedule', 'POST', { appointments: [], technicians: [] });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/schedule-optimizations'] });
      if (data?.error) {
        toast({ 
          title: t('aiAutomation.optimizationCompletedWithWarnings', 'Optimization completed with warnings'), 
          description: data.error,
          variant: "destructive" 
        });
      } else {
        toast({ title: t('aiAutomation.scheduleOptimized', 'Schedule optimized'), description: t('aiAutomation.aiAnalyzedSchedule', 'AI has analyzed your schedule and made optimization suggestions') });
      }
    },
    onError: (error: any) => {
      toast({ 
        title: t('aiAutomation.scheduleOptimizationFailed', 'Schedule optimization failed'), 
        description: error.message || t('aiAutomation.failedToOptimizeSchedule', 'Failed to optimize schedule'),
        variant: "destructive" 
      });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; conversationId?: string }) => {
      return await apiRequest('/api/ai/chat', 'POST', data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/chat-conversations'] });
      if (data?.error) {
        toast({ 
          title: t('aiAutomation.chatMessageCompletedWithWarnings', 'Chat message completed with warnings'), 
          description: data.error,
          variant: "destructive" 
        });
      }
      setChatMessage("");
    },
    onError: (error: any) => {
      toast({ 
        title: t('aiAutomation.chatMessageFailed', 'Chat message failed'), 
        description: error.message || t('aiAutomation.failedToSendMessage', 'Failed to send message to AI chatbot'),
        variant: "destructive" 
      });
    },
  });

  const acknowledgePredictionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/ai/maintenance-predictions/${id}/acknowledge`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/maintenance-predictions'] });
      toast({ title: t('aiAutomation.predictionAcknowledged', 'Prediction acknowledged') });
    },
    onError: (error: any) => {
      toast({ 
        title: t('aiAutomation.acknowledgementFailed', 'Acknowledgement failed'), 
        description: error.message || t('aiAutomation.failedToAcknowledgePrediction', 'Failed to acknowledge prediction'),
        variant: "destructive" 
      });
    },
  });

  const tabs: TabConfig[] = [
    {
      id: "estimation",
      label: t('aiAutomation.jobEstimation', 'Job Estimation'),
      icon: Clock,
      content: (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('aiAutomation.aiJobTimeCostEstimation', 'AI Job Time & Cost Estimation')}</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">{t('aiAutomation.getAiPoweredEstimates', 'Get AI-powered estimates for job duration and costs based on historical data')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-type" className="text-gray-900 dark:text-white">{t('aiAutomation.serviceType', 'Service Type')}</Label>
                  <Input
                    id="service-type"
                    data-testid="input-service-type"
                    placeholder={t('aiAutomation.serviceTypePlaceholder', 'e.g., Oil Change, Brake Repair')}
                    value={estimationForm.serviceType}
                    onChange={(e) => setEstimationForm({ ...estimationForm, serviceType: e.target.value })}
                    className="bg-gray-100 dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white placeholder:text-gray-900 dark:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimation-vehicle" className="text-gray-900 dark:text-white">{t('aiAutomation.vehicle', 'Vehicle')}</Label>
                  <Select value={estimationForm.vehicleId} onValueChange={(value) => {
                    const vehicle = vehicles.find((v: any) => v.id === value);
                    setEstimationForm({
                      ...estimationForm,
                      vehicleId: value,
                      vehicleMake: vehicle?.make || "",
                      vehicleModel: vehicle?.model || "",
                      vehicleYear: vehicle?.year || "",
                    });
                  }}>
                    <SelectTrigger id="estimation-vehicle" data-testid="select-estimation-vehicle" className="bg-gray-100 dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white">
                      <SelectValue placeholder={t('aiAutomation.selectVehicle', 'Select vehicle')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                      {vehicles.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id} className="text-gray-900 dark:text-white">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => estimateJobMutation.mutate(estimationForm)}
                disabled={estimateJobMutation.isPending || !estimationForm.serviceType}
                data-testid="button-estimate-job"
              >
                {estimateJobMutation.isPending ? t('aiAutomation.estimating', 'Estimating...') : t('aiAutomation.getAiEstimation', 'Get AI Estimation')}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('aiAutomation.recentEstimations', 'Recent Estimations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estimations.length === 0 ? (
                  <p className="text-gray-900 dark:text-white/50 text-sm" data-testid="text-no-estimations">{t('aiAutomation.noEstimationsYet', 'No estimations yet')}</p>
                ) : (
                  estimations.map((est: any) => (
                    <div key={est.id} className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg space-y-2" data-testid={`card-estimation-${est.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{est.serviceType}</h4>
                          <p className="text-sm text-gray-900 dark:text-white/60">
                            {est.createdAt && format(new Date(est.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge variant={est.confidence && parseFloat(est.confidence) > 0.8 ? "default" : "secondary"}>
                          {est.confidence ? `${(parseFloat(est.confidence) * 100).toFixed(0)}% ${t('aiAutomation.confident', 'confident')}` : t('common.notAvailable', 'N/A')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-900 dark:text-white/60">{t('aiAutomation.estimatedHours', 'Estimated Hours')}:</span>
                          <span className="ml-2 font-medium">{est.estimatedHours || t('common.notAvailable', 'N/A')}</span>
                        </div>
                        <div>
                          <span className="text-gray-900 dark:text-white/60">{t('aiAutomation.estimatedCost', 'Estimated Cost')}:</span>
                          <span className="ml-2 font-medium">${est.estimatedCost || t('common.notAvailable', 'N/A')}</span>
                        </div>
                      </div>
                      {est.reasoning && (
                        <p className="text-sm text-gray-900 dark:text-white/60 mt-2">{est.reasoning}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "maintenance",
      label: t('aiAutomation.maintenancePrediction', 'Maintenance Prediction'),
      icon: Wrench,
      content: (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('aiAutomation.predictiveMaintenanceAnalysis', 'Predictive Maintenance Analysis')}</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">{t('aiAutomation.aiAnalyzesVehicleHistory', 'AI analyzes vehicle history to predict potential issues before they occur')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prediction-vehicle" className="text-gray-900 dark:text-white">{t('aiAutomation.vehicle', 'Vehicle')}</Label>
                  <Select value={predictionForm.vehicleId} onValueChange={(value) => {
                    const vehicle = vehicles.find((v: any) => v.id === value);
                    setPredictionForm({
                      ...predictionForm,
                      vehicleId: value,
                      vehicleMake: vehicle?.make || "",
                      vehicleModel: vehicle?.model || "",
                      vehicleYear: vehicle?.year || "",
                    });
                  }}>
                    <SelectTrigger id="prediction-vehicle" data-testid="select-prediction-vehicle" className="bg-gray-100 dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white">
                      <SelectValue placeholder={t('aiAutomation.selectVehicle', 'Select vehicle')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                      {vehicles.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id} className="text-gray-900 dark:text-white">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-gray-900 dark:text-white">{t('aiAutomation.currentMileage', 'Current Mileage')}</Label>
                  <Input
                    id="mileage"
                    data-testid="input-mileage"
                    type="number"
                    placeholder={t('aiAutomation.mileagePlaceholder', 'e.g., 50000')}
                    value={predictionForm.mileage}
                    onChange={(e) => setPredictionForm({ ...predictionForm, mileage: e.target.value })}
                    className="bg-gray-100 dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white placeholder:text-gray-900 dark:text-white/50"
                  />
                </div>
              </div>
              <Button
                onClick={() => predictMaintenanceMutation.mutate(predictionForm)}
                disabled={predictMaintenanceMutation.isPending || !predictionForm.vehicleId}
                data-testid="button-predict-maintenance"
              >
                {predictMaintenanceMutation.isPending ? t('aiAutomation.analyzing', 'Analyzing...') : t('aiAutomation.analyzeVehicle', 'Analyze Vehicle')}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('aiAutomation.maintenancePredictions', 'Maintenance Predictions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.length === 0 ? (
                  <p className="text-gray-900 dark:text-white/60 text-sm" data-testid="text-no-predictions">{t('aiAutomation.noPredictionsYet', 'No predictions yet')}</p>
                ) : (
                  predictions.map((pred: any) => (
                    <div key={pred.id} className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg space-y-2" data-testid={`card-prediction-${pred.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-gray-700 dark:text-gray-300 mt-0.5" />
                          <div>
                            <h4 className="font-semibold">{pred.predictedIssue}</h4>
                            <p className="text-sm text-gray-900 dark:text-white/60">
                              {pred.createdAt && format(new Date(pred.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={pred.status === 'acknowledged' ? "default" : "secondary"}>
                            {pred.status || t('common.pending', 'pending')}
                          </Badge>
                          {pred.status !== 'acknowledged' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgePredictionMutation.mutate(pred.id)}
                              data-testid={`button-acknowledge-${pred.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {pred.recommendedAction && (
                        <p className="text-sm"><span className="font-medium">{t('aiAutomation.recommended', 'Recommended')}:</span> {pred.recommendedAction}</p>
                      )}
                      {pred.estimatedTimeframe && (
                        <p className="text-sm text-gray-900 dark:text-white/60">{t('aiAutomation.timeframe', 'Timeframe')}: {pred.estimatedTimeframe}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "parts",
      label: t('aiAutomation.partsRecommendations', 'Parts Recommendations'),
      icon: Package,
      content: (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('aiAutomation.aiPartsRecommendations', 'AI Parts Recommendations')}</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">{t('aiAutomation.getIntelligentPartsSuggestions', 'Get intelligent parts suggestions based on service type and vehicle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parts-service-type">{t('aiAutomation.serviceType', 'Service Type')}</Label>
                  <Input
                    id="parts-service-type"
                    data-testid="input-parts-service-type"
                    placeholder={t('aiAutomation.partsServiceTypePlaceholder', 'e.g., Brake Service')}
                    value={partsForm.serviceType}
                    onChange={(e) => setPartsForm({ ...partsForm, serviceType: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parts-vehicle">{t('aiAutomation.vehicle', 'Vehicle')}</Label>
                  <Select value={partsForm.vehicleId} onValueChange={(value) => {
                    const vehicle = vehicles.find((v: any) => v.id === value);
                    setPartsForm({
                      ...partsForm,
                      vehicleId: value,
                      vehicleMake: vehicle?.make || "",
                      vehicleModel: vehicle?.model || "",
                      vehicleYear: vehicle?.year || "",
                    });
                  }}>
                    <SelectTrigger id="parts-vehicle" data-testid="select-parts-vehicle">
                      <SelectValue placeholder={t('aiAutomation.selectVehicle', 'Select vehicle')} />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parts-description">{t('aiAutomation.additionalDetailsOptional', 'Additional Details (Optional)')}</Label>
                <Textarea
                  id="parts-description"
                  data-testid="input-parts-description"
                  placeholder={t('aiAutomation.describeSpecificRequirements', 'Describe any specific requirements...')}
                  value={partsForm.description}
                  onChange={(e) => setPartsForm({ ...partsForm, description: e.target.value })}
                />
              </div>
              <Button
                onClick={() => recommendPartsMutation.mutate(partsForm)}
                disabled={recommendPartsMutation.isPending || !partsForm.serviceType}
                data-testid="button-recommend-parts"
              >
                {recommendPartsMutation.isPending ? t('aiAutomation.analyzing', 'Analyzing...') : t('aiAutomation.getRecommendations', 'Get Recommendations')}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('aiAutomation.partsRecommendations', 'Parts Recommendations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.length === 0 ? (
                  <p className="text-gray-900 dark:text-white/50 text-sm" data-testid="text-no-recommendations">{t('aiAutomation.noRecommendationsYet', 'No recommendations yet')}</p>
                ) : (
                  recommendations.map((rec: any) => (
                    <div key={rec.id} className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg space-y-2" data-testid={`card-recommendation-${rec.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{rec.partName}</h4>
                          <p className="text-sm text-gray-900 dark:text-white/60">{rec.serviceType}</p>
                        </div>
                        <Badge variant={rec.priority === 'high' ? "destructive" : rec.priority === 'medium' ? "default" : "secondary"}>
                          {rec.priority || t('aiAutomation.normal', 'normal')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-900 dark:text-white/60">{t('aiAutomation.quantity', 'Quantity')}:</span>
                          <span className="ml-2 font-medium">{rec.quantity || 1}</span>
                        </div>
                        <div>
                          <span className="text-gray-900 dark:text-white/60">{t('aiAutomation.estimatedCost', 'Estimated Cost')}:</span>
                          <span className="ml-2 font-medium">${rec.estimatedCost || t('common.notAvailable', 'N/A')}</span>
                        </div>
                        <div>
                          <span className="text-gray-900 dark:text-white/60">{t('aiAutomation.confidence', 'Confidence')}:</span>
                          <span className="ml-2 font-medium">{rec.confidence ? `${(parseFloat(rec.confidence) * 100).toFixed(0)}%` : t('common.notAvailable', 'N/A')}</span>
                        </div>
                      </div>
                      {rec.reasoning && (
                        <p className="text-sm text-gray-900 dark:text-white/60 mt-2">{rec.reasoning}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "scheduling",
      label: t('aiAutomation.scheduleOptimization', 'Schedule Optimization'),
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('aiAutomation.aiScheduleOptimization', 'AI Schedule Optimization')}</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">{t('aiAutomation.optimizeTechnicianSchedules', 'Optimize technician schedules for maximum efficiency')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => optimizeScheduleMutation.mutate()}
                disabled={optimizeScheduleMutation.isPending}
                data-testid="button-optimize-schedule"
              >
                {optimizeScheduleMutation.isPending ? t('aiAutomation.optimizing', 'Optimizing...') : t('aiAutomation.runOptimization', 'Run Optimization')}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('aiAutomation.optimizationHistory', 'Optimization History')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduleOpts.length === 0 ? (
                  <p className="text-gray-900 dark:text-white/50 text-sm" data-testid="text-no-optimizations">{t('aiAutomation.noOptimizationsYet', 'No optimizations yet')}</p>
                ) : (
                  scheduleOpts.map((opt: any) => (
                    <div key={opt.id} className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg space-y-2" data-testid={`card-optimization-${opt.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{t('aiAutomation.optimization', 'Optimization')} #{opt.id}</h4>
                          <p className="text-sm text-gray-900 dark:text-white/60">
                            {opt.createdAt && format(new Date(opt.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <Badge variant="default">
                          {opt.improvementPercentage ? `+${opt.improvementPercentage}%` : t('aiAutomation.completed', 'Completed')}
                        </Badge>
                      </div>
                      {opt.suggestions && opt.suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{t('aiAutomation.suggestions', 'Suggestions')}:</p>
                          <ul className="list-disc list-inside text-sm text-gray-900 dark:text-white/60">
                            {opt.suggestions.map((suggestion: string, idx: number) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "chat",
      label: t('aiAutomation.aiChatbot', 'AI Chatbot'),
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('aiAutomation.aiChatAssistant', 'AI Chat Assistant')}</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">{t('aiAutomation.askQuestionsAboutServices', 'Ask questions about services, parts, or get recommendations')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('aiAutomation.typeYourMessage', 'Type your message...')}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && chatMessage.trim()) {
                      chatMutation.mutate({ message: chatMessage, conversationId: selectedConversation || undefined });
                    }
                  }}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={() => {
                    if (chatMessage.trim()) {
                      chatMutation.mutate({ message: chatMessage, conversationId: selectedConversation || undefined });
                    }
                  }}
                  disabled={chatMutation.isPending || !chatMessage.trim()}
                  data-testid="button-send-message"
                >
                  {chatMutation.isPending ? t('aiAutomation.sending', 'Sending...') : t('aiAutomation.send', 'Send')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('aiAutomation.conversations', 'Conversations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <p className="text-gray-900 dark:text-white/50 text-sm" data-testid="text-no-conversations">{t('aiAutomation.noConversationsYet', 'No conversations yet')}</p>
                ) : (
                  conversations.map((conv: any) => (
                    <div 
                      key={conv.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conv.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-salis-gray-dark hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                      data-testid={`card-conversation-${conv.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{conv.title || t('aiAutomation.conversation', 'Conversation')}</h4>
                          <p className="text-sm text-gray-900 dark:text-white/60">
                            {conv.createdAt && format(new Date(conv.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <Badge variant={conv.status === 'active' ? "default" : "secondary"}>
                          {conv.status || t('aiAutomation.active', 'active')}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <TabsPageLayout
      title={t('aiAutomation.title', 'AI Automation Hub')}
      description={t('aiAutomation.description', 'Leverage artificial intelligence to automate and optimize garage operations')}
      icon={Brain}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
