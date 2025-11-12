import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
    enabled: !!user?.garageId,
  });

  const { data: predictions } = useQuery<any[]>({
    queryKey: ["/api/ai/maintenance-predictions"],
    enabled: !!user?.garageId,
  });

  const predictMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/ai/predictive-diagnostics", data);
    },
    onSuccess: (data) => {
      setPrediction(data);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/maintenance-predictions"] });
      toast({
        title: "Prediction Generated",
        description: "AI has analyzed the vehicle data successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate prediction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);

  const handleAnalyze = () => {
    if (!selectedVehicleId) {
      toast({
        title: "Select Vehicle",
        description: "Please select a vehicle first.",
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
      low: { label: "Low Risk", className: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300", icon: CheckCircle },
      medium: { label: "Medium Risk", className: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300", icon: AlertCircle },
      high: { label: "High Risk", className: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300", icon: AlertTriangle },
      critical: { label: "Critical", className: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300", icon: AlertCircle },
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
    <div className="p-8 space-y-8" data-testid="predictive-diagnostics-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          AI-Powered Predictive Diagnostics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analyze vehicle data to predict potential failures and maintenance needs using advanced AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Data Input</CardTitle>
            <CardDescription>Enter vehicle parameters for AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vehicle Selection */}
            <div>
              <Label>Select Vehicle</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger data-testid="select-vehicle">
                  <SelectValue placeholder="Choose a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles?.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mileage */}
            <div>
              <Label className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Mileage (miles) *
              </Label>
              <Input
                type="number"
                data-testid="input-mileage"
                placeholder="e.g., 75000"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              />
            </div>

            {/* Engine Temperature */}
            <div>
              <Label className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Engine Temperature (°F)
              </Label>
              <Input
                type="number"
                data-testid="input-engine-temp"
                placeholder="e.g., 195"
                value={formData.engineTemperature}
                onChange={(e) => setFormData({ ...formData, engineTemperature: e.target.value })}
              />
            </div>

            {/* Oil Pressure */}
            <div>
              <Label className="flex items-center gap-2">
                <Droplet className="w-4 h-4" />
                Oil Pressure (PSI)
              </Label>
              <Input
                type="number"
                data-testid="input-oil-pressure"
                placeholder="e.g., 40"
                value={formData.oilPressure}
                onChange={(e) => setFormData({ ...formData, oilPressure: e.target.value })}
              />
            </div>

            {/* Brake Pad Wear */}
            <div>
              <Label>Brake Pad Wear (%)</Label>
              <Input
                type="number"
                data-testid="input-brake-wear"
                placeholder="e.g., 60"
                value={formData.brakePadWear}
                onChange={(e) => setFormData({ ...formData, brakePadWear: e.target.value })}
              />
            </div>

            {/* Battery Voltage */}
            <div>
              <Label className="flex items-center gap-2">
                <Battery className="w-4 h-4" />
                Battery Voltage (V)
              </Label>
              <Input
                type="number"
                step="0.1"
                data-testid="input-battery"
                placeholder="e.g., 12.6"
                value={formData.batteryVoltage}
                onChange={(e) => setFormData({ ...formData, batteryVoltage: e.target.value })}
              />
            </div>

            {/* Fuel Level */}
            <div>
              <Label>Fuel Level (%)</Label>
              <Input
                type="number"
                data-testid="input-fuel"
                placeholder="e.g., 75"
                value={formData.fuelLevel}
                onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
              />
            </div>

            {/* Tire Condition */}
            <div>
              <Label>Tire Condition</Label>
              <Select value={formData.tireCondition} onValueChange={(val) => setFormData({ ...formData, tireCondition: val })}>
                <SelectTrigger data-testid="select-tire-condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Last Service Date */}
            <div>
              <Label>Last Service Date</Label>
              <Input
                type="date"
                data-testid="input-last-service"
                value={formData.lastServiceDate}
                onChange={(e) => setFormData({ ...formData, lastServiceDate: e.target.value })}
              />
            </div>

            {/* Check Engine Light */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="check-engine"
                data-testid="checkbox-engine-light"
                checked={formData.checkEngineLightOn}
                onChange={(e) => setFormData({ ...formData, checkEngineLightOn: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="check-engine">Check Engine Light On</Label>
            </div>

            {/* Unusual Noises */}
            <div>
              <Label>Unusual Noises or Vibrations</Label>
              <Textarea
                data-testid="textarea-noises"
                placeholder="Describe any unusual sounds, vibrations, or smells..."
                value={formData.unusualNoises}
                onChange={(e) => setFormData({ ...formData, unusualNoises: e.target.value })}
                rows={2}
              />
            </div>

            {/* Additional Symptoms */}
            <div>
              <Label>Additional Symptoms</Label>
              <Textarea
                data-testid="textarea-symptoms"
                placeholder="Any other issues or observations..."
                value={formData.additionalSymptoms}
                onChange={(e) => setFormData({ ...formData, additionalSymptoms: e.target.value })}
                rows={2}
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={predictMutation.isPending || !selectedVehicleId}
              data-testid="button-analyze"
              className="w-full"
            >
              {predictMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Prediction
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {prediction && (
            <Card className="border-2 border-blue-500 dark:border-blue-700" data-testid="prediction-result">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-blue-600" />
                  AI Prediction Results
                </CardTitle>
                <CardDescription>
                  Confidence: {(prediction.confidence * 100).toFixed(0)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Severity</Label>
                  <div className="mt-1">{getSeverityBadge(prediction.severity)}</div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Predicted Issue</Label>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {prediction.predictedIssue}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Risk Level</Label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {prediction.riskLevel}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Recommended Action</Label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {prediction.recommendedAction}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Timeframe</Label>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {prediction.estimatedTimeframe}
                  </p>
                </div>

                {prediction.additionalDetails && (
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Additional Details</Label>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {prediction.additionalDetails}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Recent Predictions
              </CardTitle>
              <CardDescription>AI-generated maintenance predictions</CardDescription>
            </CardHeader>
            <CardContent>
              {predictions && predictions.length > 0 ? (
                <div className="space-y-3" data-testid="predictions-list">
                  {predictions.slice(0, 5).map((pred) => (
                    <div key={pred.id} className="p-3 border rounded-lg dark:border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{pred.predictedIssue}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pred.recommendedAction}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(pred.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>{getSeverityBadge(pred.severity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No predictions yet. Analyze a vehicle to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
