import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Brain, CheckCircle, Gauge, Thermometer, Droplet, Battery, Car, AlertTriangle, Loader2 } from "lucide-react";
import type { Vehicle } from "@shared/schema";

export default function PredictiveDiagnostics() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [prediction, setPrediction] = useState<any>(null);

  const [formData, setFormData] = useState({
    mileage: "",
    engineTemperature: "",
    oilPressure: "",
    brakePadWear: "",
    batteryVoltage: "",
    tireCondition: "",
    lastServiceDate: "",
    fuelLevel: "",
    checkEngineLightOn: false,
    unusualNoises: "",
    additionalSymptoms: "",
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    enabled: !!(user as any)?.garageId,
  });

  const { data: predictions } = useQuery<any[]>({
    queryKey: ["/api/ai/maintenance-predictions"],
    enabled: !!(user as any)?.garageId,
  });

  const predictMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/ai/predictive-diagnostics", data);
    },
    onSuccess: (data) => {
      setPrediction(data);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/maintenance-predictions"] });
      toast({
        title: t('predictiveDiagnostics.predictionGenerated', 'Prediction Generated'),
        description: t('predictiveDiagnostics.predictionGeneratedDesc', 'AI has analyzed the vehicle data successfully.'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('predictiveDiagnostics.predictionError', 'Failed to generate prediction. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);

  const handleAnalyze = () => {
    if (!selectedVehicleId) {
      toast({
        title: t('predictiveDiagnostics.selectVehicle', 'Select Vehicle'),
        description: t('predictiveDiagnostics.selectVehicleFirst', 'Please select a vehicle first.'),
        variant: "destructive",
      });
      return;
    }

    const payload = {
      vehicleId: selectedVehicleId,
      mileage: parseInt(formData.mileage) || 0,
      engineTemperature: formData.engineTemperature ? parseFloat(formData.engineTemperature) : undefined,
      oilPressure: formData.oilPressure ? parseFloat(formData.oilPressure) : undefined,
      brakePadWear: formData.brakePadWear ? parseFloat(formData.brakePadWear) : undefined,
      batteryVoltage: formData.batteryVoltage ? parseFloat(formData.batteryVoltage) : undefined,
      tireCondition: formData.tireCondition || undefined,
      lastServiceDate: formData.lastServiceDate || undefined,
      vehicleMake: selectedVehicle?.make,
      vehicleModel: selectedVehicle?.model,
      vehicleYear: selectedVehicle?.year,
      fuelLevel: formData.fuelLevel ? parseFloat(formData.fuelLevel) : undefined,
      checkEngineLightOn: formData.checkEngineLightOn,
      unusualNoises: formData.unusualNoises || undefined,
      additionalSymptoms: formData.additionalSymptoms || undefined,
    };

    predictMutation.mutate(payload);
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { label: string; className: string; icon: any }> = {
      low: { label: t('predictiveDiagnostics.lowRisk', 'Low Risk'), className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: CheckCircle },
      medium: { label: t('predictiveDiagnostics.mediumRisk', 'Medium Risk'), className: "bg-[#F97316]/10 text-[#F97316]", icon: AlertCircle },
      high: { label: t('predictiveDiagnostics.highRisk', 'High Risk'), className: "bg-[#F97316]/10 text-[#F97316]", icon: AlertTriangle },
      critical: { label: t('predictiveDiagnostics.critical', 'Critical'), className: "bg-red-500/10 text-red-600 dark:text-red-400", icon: AlertCircle },
    };
    const variant = variants[severity?.toLowerCase()] || variants.medium;
    const Icon = variant.icon;
    return (
      <Badge className={variant.className}>
        <Icon className="w-3 h-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  return (
    <StandardPageLayout
      title={t('predictiveDiagnostics.title', 'AI-Powered Predictive Diagnostics')}
      description={t('predictiveDiagnostics.description', 'Analyze vehicle data to predict potential failures and maintenance needs using advanced AI')}
      icon={Brain}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-testid="predictive-diagnostics-page">
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('predictiveDiagnostics.vehicleDataInput', 'Vehicle Data Input')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('predictiveDiagnostics.vehicleDataInputDesc', 'Enter vehicle parameters for AI analysis')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('predictiveDiagnostics.selectVehicle', 'Select Vehicle')}</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger data-testid="select-vehicle" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectValue placeholder={t('predictiveDiagnostics.chooseVehicle', 'Choose a vehicle')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  {vehicles?.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Gauge className="w-4 h-4 text-[#0A5ED7]" />
                {t('predictiveDiagnostics.mileage', 'Mileage (miles)')} *
              </Label>
              <Input
                type="number"
                data-testid="input-mileage"
                placeholder={t('predictiveDiagnostics.mileagePlaceholder', 'e.g., 75000')}
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Thermometer className="w-4 h-4 text-[#0A5ED7]" />
                {t('predictiveDiagnostics.engineTemperature', 'Engine Temperature (°F)')}
              </Label>
              <Input
                type="number"
                data-testid="input-engine-temp"
                placeholder={t('predictiveDiagnostics.engineTempPlaceholder', 'e.g., 195')}
                value={formData.engineTemperature}
                onChange={(e) => setFormData({ ...formData, engineTemperature: e.target.value })}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Droplet className="w-4 h-4 text-[#0A5ED7]" />
                {t('predictiveDiagnostics.oilPressure', 'Oil Pressure (PSI)')}
              </Label>
              <Input
                type="number"
                data-testid="input-oil-pressure"
                placeholder={t('predictiveDiagnostics.oilPressurePlaceholder', 'e.g., 40')}
                value={formData.oilPressure}
                onChange={(e) => setFormData({ ...formData, oilPressure: e.target.value })}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              />
            </div>

            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('predictiveDiagnostics.brakePadWear', 'Brake Pad Wear (%)')}</Label>
              <Input
                type="number"
                data-testid="input-brake-wear"
                placeholder={t('predictiveDiagnostics.brakePadWearPlaceholder', 'e.g., 60')}
                value={formData.brakePadWear}
                onChange={(e) => setFormData({ ...formData, brakePadWear: e.target.value })}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Battery className="w-4 h-4 text-[#0A5ED7]" />
                {t('predictiveDiagnostics.batteryVoltage', 'Battery Voltage (V)')}
              </Label>
              <Input
                type="number"
                step="0.1"
                data-testid="input-battery"
                placeholder={t('predictiveDiagnostics.batteryVoltagePlaceholder', 'e.g., 12.6')}
                value={formData.batteryVoltage}
                onChange={(e) => setFormData({ ...formData, batteryVoltage: e.target.value })}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              />
            </div>

            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('predictiveDiagnostics.fuelLevel', 'Fuel Level (%)')}</Label>
              <Input
                type="number"
                data-testid="input-fuel"
                placeholder={t('predictiveDiagnostics.fuelLevelPlaceholder', 'e.g., 75')}
                value={formData.fuelLevel}
                onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              />
            </div>

            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('predictiveDiagnostics.tireCondition', 'Tire Condition')}</Label>
              <Select value={formData.tireCondition} onValueChange={(val) => setFormData({ ...formData, tireCondition: val })}>
                <SelectTrigger data-testid="select-tire-condition" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectValue placeholder={t('predictiveDiagnostics.selectCondition', 'Select condition')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="excellent">{t('predictiveDiagnostics.excellent', 'Excellent')}</SelectItem>
                  <SelectItem value="good">{t('predictiveDiagnostics.good', 'Good')}</SelectItem>
                  <SelectItem value="fair">{t('predictiveDiagnostics.fair', 'Fair')}</SelectItem>
                  <SelectItem value="poor">{t('predictiveDiagnostics.poor', 'Poor')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('predictiveDiagnostics.lastServiceDate', 'Last Service Date')}</Label>
              <Input
                type="date"
                data-testid="input-last-service"
                value={formData.lastServiceDate}
                onChange={(e) => setFormData({ ...formData, lastServiceDate: e.target.value })}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="check-engine"
                data-testid="checkbox-engine-light"
                checked={formData.checkEngineLightOn}
                onChange={(e) => setFormData({ ...formData, checkEngineLightOn: e.target.checked })}
                className="h-4 w-4 rounded border-[#E2E8F0] dark:border-[#232A36] text-[#0A5ED7]"
              />
              <Label htmlFor="check-engine" className="text-[#0B1F3B] dark:text-white">{t('predictiveDiagnostics.checkEngineLightOn', 'Check Engine Light On')}</Label>
            </div>

            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('predictiveDiagnostics.unusualNoises', 'Unusual Noises or Vibrations')}</Label>
              <Textarea
                data-testid="textarea-noises"
                placeholder={t('predictiveDiagnostics.unusualNoisesPlaceholder', 'Describe any unusual sounds, vibrations, or smells...')}
                value={formData.unusualNoises}
                onChange={(e) => setFormData({ ...formData, unusualNoises: e.target.value })}
                rows={2}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              />
            </div>

            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('predictiveDiagnostics.additionalSymptoms', 'Additional Symptoms')}</Label>
              <Textarea
                data-testid="textarea-symptoms"
                placeholder={t('predictiveDiagnostics.additionalSymptomsPlaceholder', 'Any other issues or observations...')}
                value={formData.additionalSymptoms}
                onChange={(e) => setFormData({ ...formData, additionalSymptoms: e.target.value })}
                rows={2}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={predictMutation.isPending || !selectedVehicleId}
              data-testid="button-analyze"
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
            >
              {predictMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('predictiveDiagnostics.analyzing', 'Analyzing...')}
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  {t('predictiveDiagnostics.generateAIPrediction', 'Generate AI Prediction')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {prediction && (
            <Card className="border-2 border-[#0A5ED7] dark:border-[#0BB3FF] bg-white dark:bg-[#151A23]" data-testid="prediction-result">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                  <Brain className="w-6 h-6 text-[#0A5ED7]" />
                  {t('predictiveDiagnostics.aiPredictionResults', 'AI Prediction Results')}
                </CardTitle>
                <CardDescription className="text-[#64748B]">
                  {t('predictiveDiagnostics.confidence', 'Confidence')}: {(prediction.confidence * 100).toFixed(0)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-[#64748B]">{t('predictiveDiagnostics.severity', 'Severity')}</Label>
                  <div className="mt-1">{getSeverityBadge(prediction.severity)}</div>
                </div>

                <div>
                  <Label className="text-sm text-[#64748B]">{t('predictiveDiagnostics.predictedIssue', 'Predicted Issue')}</Label>
                  <p className="mt-1 text-lg font-semibold text-[#0B1F3B] dark:text-white">
                    {prediction.predictedIssue}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-[#64748B]">{t('predictiveDiagnostics.riskLevel', 'Risk Level')}</Label>
                  <p className="mt-1 text-[#0B1F3B] dark:text-white">
                    {prediction.riskLevel}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-[#64748B]">{t('predictiveDiagnostics.recommendedAction', 'Recommended Action')}</Label>
                  <p className="mt-1 text-[#0B1F3B] dark:text-white">
                    {prediction.recommendedAction}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-[#64748B]">{t('predictiveDiagnostics.timeframe', 'Timeframe')}</Label>
                  <p className="mt-1 font-medium text-[#0B1F3B] dark:text-white">
                    {prediction.estimatedTimeframe}
                  </p>
                </div>

                {prediction.additionalDetails && (
                  <div>
                    <Label className="text-sm text-[#64748B]">{t('predictiveDiagnostics.additionalDetails', 'Additional Details')}</Label>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {prediction.additionalDetails}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Car className="w-5 h-5 text-[#0A5ED7]" />
                {t('predictiveDiagnostics.recentPredictions', 'Recent Predictions')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">{t('predictiveDiagnostics.recentPredictionsDesc', 'AI-generated maintenance predictions')}</CardDescription>
            </CardHeader>
            <CardContent>
              {predictions && predictions.length > 0 ? (
                <div className="space-y-3" data-testid="predictions-list">
                  {predictions.slice(0, 5).map((pred) => (
                    <div key={pred.id} className="p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-[#0B1F3B] dark:text-white">{pred.predictedIssue}</p>
                          <p className="text-sm text-[#64748B] mt-1">{pred.recommendedAction}</p>
                          <p className="text-xs text-[#64748B] mt-1">
                            {new Date(pred.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>{getSeverityBadge(pred.severity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-[#64748B]">
                    {t('predictiveDiagnostics.noPredictionsYet', 'No predictions yet. Analyze a vehicle to get started.')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
