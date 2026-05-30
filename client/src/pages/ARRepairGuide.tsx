import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Layers, CheckCircle, ArrowRight, Play, Loader2 } from 'lucide-react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
}

interface AIRepairStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function ARRepairGuide() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedGuide, setSelectedGuide] = useState<string>('');

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const repairGuideMutation = useMutation({
    mutationFn: async (payload: { vehicleId: number; guide: string }) => {
      const res = await apiRequest('POST', '/api/ai/repair-guide', payload);
      return res.json();
    },
  });

  const defaultRepairSteps: AIRepairStep[] = [
    { id: 1, title: t('arRepairGuide.steps.safetyCheck', 'Safety Check'), description: t('arRepairGuide.steps.safetyCheckDesc', 'Ensure vehicle is on level ground and parking brake engaged'), completed: true },
    { id: 2, title: t('arRepairGuide.steps.locateOilFilter', 'Locate Oil Filter'), description: t('arRepairGuide.steps.locateOilFilterDesc', 'Find oil filter under vehicle near engine block'), completed: true },
    { id: 3, title: t('arRepairGuide.steps.removeFilter', 'Remove Filter'), description: t('arRepairGuide.steps.removeFilterDesc', 'Use filter wrench to loosen and remove old filter'), completed: false },
    { id: 4, title: t('arRepairGuide.steps.installNewFilter', 'Install New Filter'), description: t('arRepairGuide.steps.installNewFilterDesc', 'Apply oil to gasket and hand-tighten new filter'), completed: false },
    { id: 5, title: t('arRepairGuide.steps.addFreshOil', 'Add Fresh Oil'), description: t('arRepairGuide.steps.addFreshOilDesc', 'Pour specified amount of oil into engine'), completed: false },
  ];

  const repairSteps: AIRepairStep[] = repairGuideMutation.data?.steps ?? defaultRepairSteps;

  const guides = [
    t('arRepairGuide.guides.oilChange', 'Oil Change'),
    t('arRepairGuide.guides.brakeReplacement', 'Brake Replacement'),
    t('arRepairGuide.guides.airFilterReplacement', 'Air Filter Replacement'),
    t('arRepairGuide.guides.batteryReplacement', 'Battery Replacement'),
    t('arRepairGuide.guides.tireRotation', 'Tire Rotation'),
    t('arRepairGuide.guides.sparkPlugReplacement', 'Spark Plug Replacement'),
  ];

  const handleGuideSelect = (guide: string) => {
    setSelectedGuide(guide);
    setActiveStep(0);
    if (selectedVehicleId) {
      repairGuideMutation.mutate({
        vehicleId: Number(selectedVehicleId),
        guide,
      });
    }
  };

  return (
    <StandardPageLayout
      title={t('arRepairGuide.title', 'AR Repair Guide Viewer')}
      description={t('arRepairGuide.description', 'Augmented reality step-by-step repair instructions with overlay annotations')}
      icon={Layers}
    >
      {/* Vehicle Selection */}
      <Card className="mb-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('arRepairGuide.selectVehicle', 'Select Vehicle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger className="w-[300px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-vehicle">
                <SelectValue placeholder={vehiclesLoading ? t('common.loading', 'Loading...') : t('arRepairGuide.selectVehiclePlaceholder', 'Choose a vehicle')} />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.licensePlate ? `(${vehicle.licensePlate})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {repairGuideMutation.isPending && (
              <div className="flex items-center gap-2 text-[#0A5ED7]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t('arRepairGuide.generatingSteps', 'Generating AI repair steps...')}</span>
              </div>
            )}
          </div>
          {repairGuideMutation.data?.vehicleInfo && (
            <p className="text-sm text-[#64748B] mt-2">
              {t('arRepairGuide.aiGeneratedFor', 'AI-generated steps tailored for your vehicle')}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[#0B1F3B] dark:text-white">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#0A5ED7]" />
                {t('arRepairGuide.arCameraView', 'AR Camera View')}
              </span>
              <Button
                onClick={() => setIsARActive(!isARActive)}
                className={isARActive ? 'bg-[#F97316] hover:bg-[#F97316]/90' : 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90'}
                data-testid="button-toggle-ar"
              >
                {isARActive ? t('arRepairGuide.stopAR', 'Stop AR') : t('arRepairGuide.startAR', 'Start AR')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-[#0E1117] to-[#151A23] rounded-lg h-[500px] overflow-hidden">
              {isARActive ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full bg-gradient-to-br from-[#151A23] to-[#0E1117]">
                    <div className="absolute top-1/3 left-1/4 w-32 h-32 border-4 border-[#0A5ED7] rounded-lg animate-pulse">
                      <div className="absolute -top-8 left-0 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white px-3 py-1 rounded text-sm font-semibold">
                        {repairSteps[activeStep]?.title || t('arRepairGuide.oilFilter', 'Oil Filter')}
                      </div>
                      <div className="absolute top-full left-0 mt-2 bg-white dark:bg-[#151A23] px-3 py-2 rounded shadow-lg max-w-xs border border-[#E2E8F0] dark:border-[#232A36]">
                        <p className="text-xs text-[#0B1F3B] dark:text-white">
                          {repairSteps[activeStep]?.description}
                        </p>
                      </div>
                    </div>

                    <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                    <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-[#F97316] rounded-full animate-ping" />

                    <div className="absolute top-4 right-4 bg-[#0E1117]/90 text-white px-4 py-2 rounded-lg border border-[#232A36]">
                      <p className="text-sm">{t('arRepairGuide.stepOf', 'Step {{current}} of {{total}}', { current: activeStep + 1, total: repairSteps.length })}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Play className="h-20 w-20 text-[#64748B] mb-4" />
                  <p className="text-[#64748B]">{t('arRepairGuide.clickStartAR', "Click 'Start AR' to begin guided repair")}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="button-prev-step"
              >
                {t('arRepairGuide.previousStep', 'Previous Step')}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#E2E8F0] dark:border-[#232A36]"
                onClick={() => setActiveStep(Math.min(repairSteps.length - 1, activeStep + 1))}
                disabled={activeStep === repairSteps.length - 1}
                data-testid="button-next-step"
              >
                {t('arRepairGuide.nextStep', 'Next Step')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">
              {t('arRepairGuide.repairSteps', 'Repair Steps')}
              {repairGuideMutation.data && (
                <Badge className="ml-2 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white text-xs">AI</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {repairGuideMutation.isPending ? (
              <div className="flex flex-col items-center py-8 text-[#64748B]">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm">{t('arRepairGuide.generatingSteps', 'Generating AI repair steps...')}</p>
              </div>
            ) : (
              repairSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    index === activeStep
                      ? 'border-[#0A5ED7] bg-[#0A5ED7]/10'
                      : 'border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0BB3FF]'
                  }`}
                  onClick={() => setActiveStep(index)}
                  data-testid={`step-${index}`}
                >
                  <div className="flex items-start gap-3">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#E2E8F0] dark:border-[#232A36] flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-[#0B1F3B] dark:text-white">
                        {step.title}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('arRepairGuide.availableARGuides', 'Available AR Guides')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {guides.map((guide, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg hover:shadow-md hover:border-[#0A5ED7] transition-all cursor-pointer ${
                  selectedGuide === guide
                    ? 'border-[#0A5ED7] bg-[#0A5ED7]/10'
                    : 'border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]'
                }`}
                onClick={() => handleGuideSelect(guide)}
                data-testid={`guide-${index}`}
              >
                <h4 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">{guide}</h4>
                <Badge variant="outline" className="text-xs border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">{Math.floor(Math.random() * 8) + 3} {t('arRepairGuide.stepsLabel', 'steps')}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
