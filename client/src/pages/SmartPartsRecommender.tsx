import { useState } from 'react';
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
        title: 'AI Analysis Complete',
        description: `Found ${data.recommendations?.length || 0} recommended parts using GPT-5.`,
      });
    },
    onError: () => {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to get AI recommendations. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleGetRecommendations = () => {
    if (!vehicleMake || !vehicleModel || !vehicleYear || !serviceType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all vehicle and service details.',
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
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  return (
    <StandardPageLayout
      title="Smart Parts Recommender"
      description="AI-powered parts recommendations using GPT-5 analysis and vehicle compatibility data"
      icon={Brain}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-1 bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Vehicle & Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="make">Vehicle Make</Label>
              <Input
                id="make"
                placeholder="e.g., Toyota"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                data-testid="input-make"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Vehicle Model</Label>
              <Input
                id="model"
                placeholder="e.g., Camry"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                data-testid="input-model"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="e.g., 2020"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                data-testid="input-year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-type">Service Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger id="service-type" data-testid="select-service-type">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brake_service">Brake Service</SelectItem>
                  <SelectItem value="oil_change">Oil Change</SelectItem>
                  <SelectItem value="tire_replacement">Tire Replacement</SelectItem>
                  <SelectItem value="engine_repair">Engine Repair</SelectItem>
                  <SelectItem value="transmission">Transmission Service</SelectItem>
                  <SelectItem value="electrical">Electrical Repair</SelectItem>
                  <SelectItem value="suspension">Suspension Service</SelectItem>
                  <SelectItem value="cooling_system">Cooling System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms (Optional)</Label>
              <Textarea
                id="symptoms"
                placeholder="Describe any specific symptoms or issues..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                data-testid="input-symptoms"
              />
            </div>

            <Button
              onClick={handleGetRecommendations}
              disabled={getRecommendationsMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
              data-testid="button-get-recommendations"
            >
              {getRecommendationsMutation.isPending ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  AI Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations Display */}
        <Card className="lg:col-span-2 bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              AI-Recommended Parts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No recommendations yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Enter vehicle details and click 'Get AI Recommendations' to start
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    data-testid={`recommendation-${index}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {rec.partName || `Part ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Part #: {rec.partNumber || 'N/A'}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority || 'standard'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Compatibility: <strong>{rec.compatibility || 95}%</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          Est. Cost: <strong>${rec.estimatedCost || 0}</strong>
                        </span>
                      </div>
                    </div>

                    {rec.reason && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 mb-1">
                          AI Reasoning:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {rec.reason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" data-testid={`button-add-${index}`}>
                        Add to Job Card
                      </Button>
                      <Button size="sm" variant="ghost" data-testid={`button-check-stock-${index}`}>
                        Check Stock
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Recommendations */}
      <Card className="mt-6 bg-white dark:bg-salis-black">
        <CardHeader>
          <CardTitle>Recent AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {(!Array.isArray(recentRecommendations) || recentRecommendations.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No recommendation history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3">Service Type</th>
                    <th className="pb-3">Parts Recommended</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(recentRecommendations) && recentRecommendations.map((rec: any) => (
                    <tr key={rec.id} className="border-b" data-testid={`history-row-${rec.id}`}>
                      <td className="py-3">{new Date(rec.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">{rec.vehicleYear} {rec.vehicleMake} {rec.vehicleModel}</td>
                      <td className="py-3">{rec.serviceType}</td>
                      <td className="py-3">{rec.recommendedParts?.length || 0} parts</td>
                      <td className="py-3">
                        <Badge variant="outline">{rec.status}</Badge>
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
