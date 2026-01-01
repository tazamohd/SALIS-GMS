import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Sparkles, Package, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { StandardPageLayout } from '@/components/layouts';

export default function SmartPartsRecommender() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const { data: recentRecommendations = [] } = useQuery({
    queryKey: ['/api/ai/parts-recommendations'],
  });

  const getRecommendationsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/ai/recommend-parts', 'POST', data);
    },
    onSuccess: (data: any) => {
      setRecommendations(data.recommendations || []);
      queryClient.invalidateQueries({ queryKey: ['/api/ai/parts-recommendations'] });
      toast({
        title: t('smartParts.aiAnalysisComplete', 'AI Analysis Complete'),
        description: t('smartParts.foundRecommendedParts', `Found ${data.recommendations?.length || 0} recommended parts using GPT-5.`),
      });
    },
    onError: () => {
      toast({
        title: t('smartParts.analysisFailed', 'Analysis Failed'),
        description: t('smartParts.failedToGetRecommendations', 'Failed to get AI recommendations. Please try again.'),
        variant: 'destructive',
      });
    },
  });

  const handleGetRecommendations = () => {
    if (!vehicleMake || !vehicleModel || !vehicleYear || !serviceType) {
      toast({
        title: t('smartParts.missingInformation', 'Missing Information'),
        description: t('smartParts.fillAllDetails', 'Please fill in all vehicle and service details.'),
        variant: 'destructive',
      });
      return;
    }

    getRecommendationsMutation.mutate({
      vehicleMake,
      vehicleModel,
      vehicleYear: parseInt(vehicleYear),
      serviceType,
      description: symptoms || undefined,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-0';
      case 'high':
        return 'bg-[#F97316]/10 text-[#F97316] border-0';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-0';
      default:
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-0';
    }
  };

  return (
    <StandardPageLayout
      title={t('smartParts.title', 'Smart Parts Recommender')}
      description={t('smartParts.description', 'AI-powered parts recommendations using GPT-5 analysis and vehicle compatibility data')}
      icon={Brain}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t('smartParts.vehicleServiceDetails', 'Vehicle & Service Details')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="make" className="text-[#0B1F3B] dark:text-white">{t('smartParts.vehicleMake', 'Vehicle Make')}</Label>
              <Input
                id="make"
                placeholder={t('smartParts.vehicleMakePlaceholder', 'e.g., Toyota')}
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-make"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-[#0B1F3B] dark:text-white">{t('smartParts.vehicleModel', 'Vehicle Model')}</Label>
              <Input
                id="model"
                placeholder={t('smartParts.vehicleModelPlaceholder', 'e.g., Camry')}
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-model"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-[#0B1F3B] dark:text-white">{t('smartParts.year', 'Year')}</Label>
              <Input
                id="year"
                type="number"
                placeholder={t('smartParts.yearPlaceholder', 'e.g., 2020')}
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-type" className="text-[#0B1F3B] dark:text-white">{t('smartParts.serviceType', 'Service Type')}</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger id="service-type" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-service-type">
                  <SelectValue placeholder={t('smartParts.selectServiceType', 'Select service type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brake_service">{t('smartParts.brakeService', 'Brake Service')}</SelectItem>
                  <SelectItem value="oil_change">{t('smartParts.oilChange', 'Oil Change')}</SelectItem>
                  <SelectItem value="tire_replacement">{t('smartParts.tireReplacement', 'Tire Replacement')}</SelectItem>
                  <SelectItem value="engine_repair">{t('smartParts.engineRepair', 'Engine Repair')}</SelectItem>
                  <SelectItem value="transmission">{t('smartParts.transmissionService', 'Transmission Service')}</SelectItem>
                  <SelectItem value="electrical">{t('smartParts.electricalRepair', 'Electrical Repair')}</SelectItem>
                  <SelectItem value="suspension">{t('smartParts.suspensionService', 'Suspension Service')}</SelectItem>
                  <SelectItem value="cooling_system">{t('smartParts.coolingSystem', 'Cooling System')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms" className="text-[#0B1F3B] dark:text-white">{t('smartParts.symptomsOptional', 'Symptoms (Optional)')}</Label>
              <Textarea
                id="symptoms"
                placeholder={t('smartParts.symptomsPlaceholder', 'Describe any specific symptoms or issues...')}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-symptoms"
              />
            </div>

            <Button
              onClick={handleGetRecommendations}
              disabled={getRecommendationsMutation.isPending}
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
              data-testid="button-get-recommendations"
            >
              {getRecommendationsMutation.isPending ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  {t('smartParts.aiAnalyzing', 'AI Analyzing...')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('smartParts.getAiRecommendations', 'Get AI Recommendations')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Package className="h-5 w-5 text-[#0A5ED7]" />
              {t('smartParts.aiRecommendedParts', 'AI-Recommended Parts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <p className="text-[#0B1F3B] dark:text-white font-medium mb-2">
                  {t('smartParts.noRecommendationsYet', 'No recommendations yet')}
                </p>
                <p className="text-sm text-[#64748B]">
                  {t('smartParts.enterVehicleDetails', "Enter vehicle details and click 'Get AI Recommendations' to start")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg hover:shadow-md transition-shadow bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`recommendation-${index}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-[#0B1F3B] dark:text-white">
                          {rec.partName || `${t('smartParts.part', 'Part')} ${index + 1}`}
                        </h3>
                        <p className="text-sm text-[#64748B]">
                          {t('smartParts.partNumber', 'Part #')}: {rec.partNumber || t('common.notAvailable', 'N/A')}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority || t('smartParts.standard', 'standard')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-[#0B1F3B] dark:text-white">
                          {t('smartParts.compatibility', 'Compatibility')}: <strong>{rec.compatibility || 95}%</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#0A5ED7]" />
                        <span className="text-sm text-[#0B1F3B] dark:text-white">
                          {t('smartParts.estCost', 'Est. Cost')}: <strong>${rec.estimatedCost || 0}</strong>
                        </span>
                      </div>
                    </div>

                    {rec.reason && (
                      <div className="p-3 bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 rounded-lg">
                        <p className="text-xs font-semibold text-[#0A5ED7] dark:text-[#0BB3FF] mb-1">
                          {t('smartParts.aiReasoning', 'AI Reasoning')}:
                        </p>
                        <p className="text-sm text-[#0B1F3B] dark:text-white">
                          {rec.reason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`button-add-${index}`}>
                        {t('smartParts.addToJobCard', 'Add to Job Card')}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white" data-testid={`button-check-stock-${index}`}>
                        {t('smartParts.checkStock', 'Check Stock')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('smartParts.recentAiRecommendations', 'Recent AI Recommendations')}</CardTitle>
        </CardHeader>
        <CardContent>
          {(!Array.isArray(recentRecommendations) || recentRecommendations.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">{t('smartParts.noRecommendationHistory', 'No recommendation history yet')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                  <tr className="text-left">
                    <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('common.date', 'Date')}</th>
                    <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('smartParts.vehicle', 'Vehicle')}</th>
                    <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('smartParts.serviceType', 'Service Type')}</th>
                    <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('smartParts.partsRecommended', 'Parts Recommended')}</th>
                    <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(recentRecommendations) && recentRecommendations.map((rec: any) => (
                    <tr key={rec.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`history-row-${rec.id}`}>
                      <td className="py-3 text-[#64748B]">{new Date(rec.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-[#0B1F3B] dark:text-white">{rec.vehicleYear} {rec.vehicleMake} {rec.vehicleModel}</td>
                      <td className="py-3 text-[#64748B]">{rec.serviceType}</td>
                      <td className="py-3 text-[#0B1F3B] dark:text-white">{rec.recommendedParts?.length || 0} {t('smartParts.parts', 'parts')}</td>
                      <td className="py-3">
                        <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0BB3FF]/10 dark:text-[#0BB3FF] border-0">{rec.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
