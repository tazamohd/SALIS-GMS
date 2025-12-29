import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Layers, CheckCircle, ArrowRight, Play } from 'lucide-react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export default function ARRepairGuide() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isARActive, setIsARActive] = useState(false);

  const repairSteps = [
    { id: 1, title: t('arRepairGuide.steps.safetyCheck', 'Safety Check'), description: t('arRepairGuide.steps.safetyCheckDesc', 'Ensure vehicle is on level ground and parking brake engaged'), completed: true },
    { id: 2, title: t('arRepairGuide.steps.locateOilFilter', 'Locate Oil Filter'), description: t('arRepairGuide.steps.locateOilFilterDesc', 'Find oil filter under vehicle near engine block'), completed: true },
    { id: 3, title: t('arRepairGuide.steps.removeFilter', 'Remove Filter'), description: t('arRepairGuide.steps.removeFilterDesc', 'Use filter wrench to loosen and remove old filter'), completed: false },
    { id: 4, title: t('arRepairGuide.steps.installNewFilter', 'Install New Filter'), description: t('arRepairGuide.steps.installNewFilterDesc', 'Apply oil to gasket and hand-tighten new filter'), completed: false },
    { id: 5, title: t('arRepairGuide.steps.addFreshOil', 'Add Fresh Oil'), description: t('arRepairGuide.steps.addFreshOilDesc', 'Pour specified amount of oil into engine'), completed: false },
  ];

  const guides = [
    t('arRepairGuide.guides.oilChange', 'Oil Change'),
    t('arRepairGuide.guides.brakeReplacement', 'Brake Replacement'),
    t('arRepairGuide.guides.airFilterReplacement', 'Air Filter Replacement'),
    t('arRepairGuide.guides.batteryReplacement', 'Battery Replacement'),
    t('arRepairGuide.guides.tireRotation', 'Tire Rotation'),
    t('arRepairGuide.guides.sparkPlugReplacement', 'Spark Plug Replacement'),
  ];

  return (
    <StandardPageLayout
      title={t('arRepairGuide.title', 'AR Repair Guide Viewer')}
      description={t('arRepairGuide.description', 'Augmented reality step-by-step repair instructions with overlay annotations')}
      icon={Layers}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
                {t('arRepairGuide.arCameraView', 'AR Camera View')}
              </span>
              <Button
                onClick={() => setIsARActive(!isARActive)}
                className={isARActive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
                data-testid="button-toggle-ar"
              >
                {isARActive ? t('arRepairGuide.stopAR', 'Stop AR') : t('arRepairGuide.startAR', 'Start AR')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg h-[500px] overflow-hidden">
              {isARActive ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full bg-gradient-to-br from-gray-700 to-gray-600">
                    <div className="absolute top-1/3 left-1/4 w-32 h-32 border-4 border-indigo-500 rounded-lg animate-pulse">
                      <div className="absolute -top-8 left-0 bg-indigo-600 text-white px-3 py-1 rounded text-sm font-semibold">
                        {t('arRepairGuide.oilFilter', 'Oil Filter')}
                      </div>
                      <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 px-3 py-2 rounded shadow-lg max-w-xs">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          {repairSteps[activeStep]?.description}
                        </p>
                      </div>
                    </div>

                    <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                    <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-yellow-500 rounded-full animate-ping" />

                    <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                      <p className="text-sm">{t('arRepairGuide.stepOf', 'Step {{current}} of {{total}}', { current: activeStep + 1, total: repairSteps.length })}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Play className="h-20 w-20 text-gray-600 mb-4" />
                  <p className="text-gray-400">{t('arRepairGuide.clickStartAR', "Click 'Start AR' to begin guided repair")}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                data-testid="button-prev-step"
              >
                {t('arRepairGuide.previousStep', 'Previous Step')}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
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

        <Card className="bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle>{t('arRepairGuide.repairSteps', 'Repair Steps')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {repairSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  index === activeStep
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                }`}
                onClick={() => setActiveStep(index)}
                data-testid={`step-${index}`}
              >
                <div className="flex items-start gap-3">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-white dark:bg-salis-black">
        <CardHeader>
          <CardTitle>{t('arRepairGuide.availableARGuides', 'Available AR Guides')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {guides.map((guide, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                data-testid={`guide-${index}`}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{guide}</h4>
                <Badge variant="outline" className="text-xs">{Math.floor(Math.random() * 8) + 3} {t('arRepairGuide.stepsLabel', 'steps')}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
