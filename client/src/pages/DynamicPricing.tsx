import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Calculator, 
  TrendingUp, 
  Car, 
  DollarSign, 
  ChevronRight,
  BarChart3,
  Settings,
  Check,
  X,
  AlertTriangle,
  Gauge,
  Wrench,
  Sparkles
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ServiceType {
  value: string;
  label: string;
  category: string;
}

interface VehicleClass {
  value: string;
  label: string;
}

interface PricingResult {
  basePrice: number;
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  factors: {
    vehicleMake?: string;
    complexityFactor?: number;
    partsAvailabilityFactor?: number;
    laborIntensityFactor?: number;
    luxuryPremiumFactor?: number;
    ageAdjustment?: number;
    vehicleAge?: number;
  };
  confidence: number;
}

interface VehicleFactor {
  id: string;
  vehicleMake: string;
  vehicleCategory: string;
  complexityFactor: string;
  partsAvailabilityFactor: string;
  laborIntensityFactor: string;
  luxuryPremiumFactor: string;
}

interface MarketData {
  id: string;
  serviceType: string;
  vehicleClass: string;
  region: string;
  avgPrice: string;
  minPrice: string;
  maxPrice: string;
  sampleSize: number;
  effectiveDate: string;
}

const vehicleMakes = [
  'Toyota', 'Lexus', 'Honda', 'Nissan', 'Hyundai', 'Kia',
  'Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Land Rover',
  'Ford', 'Chevrolet'
];

export default function DynamicPricing() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calculator');
  
  const [serviceType, setServiceType] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleClass, setVehicleClass] = useState('');
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);

  const { data: serviceTypes, isLoading: loadingServices } = useQuery<ServiceType[]>({
    queryKey: ['/api/dynamic-pricing/service-types'],
  });

  const { data: vehicleClasses, isLoading: loadingClasses } = useQuery<VehicleClass[]>({
    queryKey: ['/api/dynamic-pricing/vehicle-classes'],
  });

  const { data: vehicleFactors, isLoading: loadingFactors } = useQuery<VehicleFactor[]>({
    queryKey: ['/api/dynamic-pricing/vehicle-factors'],
  });

  const { data: marketData, isLoading: loadingMarket } = useQuery<MarketData[]>({
    queryKey: ['/api/dynamic-pricing/market-data'],
  });

  const calculateMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('POST', '/api/dynamic-pricing/calculate', params);
      return response.json();
    },
    onSuccess: (data) => {
      setPricingResult(data);
      toast({
        title: t('dynamicPricing.calculated', 'Price Calculated'),
        description: t('dynamicPricing.suggestionReady', 'Dynamic pricing suggestion is ready'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('dynamicPricing.calculationFailed', 'Failed to calculate price'),
        variant: 'destructive',
      });
    },
  });

  const handleCalculate = () => {
    if (!serviceType) {
      toast({
        title: t('common.error', 'Error'),
        description: t('dynamicPricing.selectService', 'Please select a service type'),
        variant: 'destructive',
      });
      return;
    }

    calculateMutation.mutate({
      serviceType,
      vehicleMake: vehicleMake || undefined,
      vehicleYear: vehicleYear ? parseInt(vehicleYear) : undefined,
      vehicleClass: vehicleClass || undefined,
      region: 'saudi_arabia',
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return t('dynamicPricing.highConfidence', 'High Confidence');
    if (confidence >= 60) return t('dynamicPricing.mediumConfidence', 'Medium Confidence');
    return t('dynamicPricing.lowConfidence', 'Low Confidence');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            {t('dynamicPricing.title', 'Dynamic Pricing')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('dynamicPricing.subtitle', 'Intelligent pricing suggestions based on market data and vehicle factors')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#151A23] border border-[#232A36]">
          <TabsTrigger value="calculator" className="data-[state=active]:bg-[#0A5ED7]" data-testid="tab-calculator">
            <Calculator className="h-4 w-4 mr-2" />
            {t('dynamicPricing.priceCalculator', 'Price Calculator')}
          </TabsTrigger>
          <TabsTrigger value="market" className="data-[state=active]:bg-[#0A5ED7]" data-testid="tab-market">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('dynamicPricing.marketData', 'Market Data')}
          </TabsTrigger>
          <TabsTrigger value="factors" className="data-[state=active]:bg-[#0A5ED7]" data-testid="tab-factors">
            <Settings className="h-4 w-4 mr-2" />
            {t('dynamicPricing.vehicleFactors', 'Vehicle Factors')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#151A23] border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-[#0A5ED7]" />
                  {t('dynamicPricing.serviceDetails', 'Service Details')}
                </CardTitle>
                <CardDescription>
                  {t('dynamicPricing.enterDetails', 'Enter service and vehicle details to calculate pricing')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">{t('dynamicPricing.serviceType', 'Service Type')} *</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger id="serviceType" className="bg-[#0E1117] border-[#232A36]" data-testid="select-service-type">
                      <SelectValue placeholder={t('dynamicPricing.selectServiceType', 'Select service type')} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingServices ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        serviceTypes?.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            {service.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleMake">{t('dynamicPricing.vehicleMake', 'Vehicle Make')}</Label>
                  <Select value={vehicleMake} onValueChange={setVehicleMake}>
                    <SelectTrigger id="vehicleMake" className="bg-[#0E1117] border-[#232A36]" data-testid="select-vehicle-make">
                      <SelectValue placeholder={t('dynamicPricing.selectMake', 'Select vehicle make')} />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleMakes.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">{t('dynamicPricing.vehicleYear', 'Vehicle Year')}</Label>
                  <Select value={vehicleYear} onValueChange={setVehicleYear}>
                    <SelectTrigger id="vehicleYear" className="bg-[#0E1117] border-[#232A36]" data-testid="select-vehicle-year">
                      <SelectValue placeholder={t('dynamicPricing.selectYear', 'Select year')} />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleClass">{t('dynamicPricing.vehicleClass', 'Vehicle Class')}</Label>
                  <Select value={vehicleClass} onValueChange={setVehicleClass}>
                    <SelectTrigger id="vehicleClass" className="bg-[#0E1117] border-[#232A36]" data-testid="select-vehicle-class">
                      <SelectValue placeholder={t('dynamicPricing.selectClass', 'Select vehicle class')} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingClasses ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        vehicleClasses?.map((vc) => (
                          <SelectItem key={vc.value} value={vc.value}>
                            {vc.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCalculate} 
                  className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90"
                  disabled={calculateMutation.isPending}
                  data-testid="button-calculate"
                >
                  {calculateMutation.isPending ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      {t('dynamicPricing.calculating', 'Calculating...')}
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      {t('dynamicPricing.calculatePrice', 'Calculate Price')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#151A23] border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#F97316]" />
                  {t('dynamicPricing.pricingSuggestion', 'Pricing Suggestion')}
                </CardTitle>
                <CardDescription>
                  {t('dynamicPricing.aiGeneratedPricing', 'AI-generated pricing recommendation')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pricingResult ? (
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-br from-[#0A5ED7]/20 to-[#0BB3FF]/20 rounded-lg border border-[#0A5ED7]/30">
                      <p className="text-sm text-muted-foreground mb-1">
                        {t('dynamicPricing.suggestedPrice', 'Suggested Price')}
                      </p>
                      <p className="text-4xl font-bold text-[#0BB3FF]" data-testid="text-suggested-price">
                        SAR {pricingResult.suggestedPrice.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-center gap-4 mt-3">
                        <span className="text-sm text-muted-foreground">
                          {t('dynamicPricing.range', 'Range')}: SAR {pricingResult.minPrice.toLocaleString()} - SAR {pricingResult.maxPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t('dynamicPricing.basePrice', 'Base Market Price')}
                        </span>
                        <span className="font-medium">SAR {pricingResult.basePrice.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Gauge className="h-4 w-4" />
                          {t('dynamicPricing.confidence', 'Confidence')}
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress value={pricingResult.confidence} className="w-20 h-2" />
                          <span className={`font-medium ${getConfidenceColor(pricingResult.confidence)}`}>
                            {pricingResult.confidence}%
                          </span>
                        </div>
                      </div>

                      <Badge className={`${getConfidenceColor(pricingResult.confidence)} bg-transparent border`}>
                        {getConfidenceLabel(pricingResult.confidence)}
                      </Badge>
                    </div>

                    {Object.keys(pricingResult.factors).length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-[#232A36]">
                        <p className="text-sm font-medium text-foreground">
                          {t('dynamicPricing.appliedFactors', 'Applied Factors')}
                        </p>
                        <div className="space-y-2">
                          {pricingResult.factors.vehicleMake && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{t('dynamicPricing.vehicleMake', 'Vehicle Make')}</span>
                              <span>{pricingResult.factors.vehicleMake}</span>
                            </div>
                          )}
                          {pricingResult.factors.complexityFactor && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{t('dynamicPricing.complexity', 'Complexity')}</span>
                              <span>{(pricingResult.factors.complexityFactor * 100).toFixed(0)}%</span>
                            </div>
                          )}
                          {pricingResult.factors.luxuryPremiumFactor && pricingResult.factors.luxuryPremiumFactor > 1 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{t('dynamicPricing.luxuryPremium', 'Luxury Premium')}</span>
                              <span>+{((pricingResult.factors.luxuryPremiumFactor - 1) * 100).toFixed(0)}%</span>
                            </div>
                          )}
                          {pricingResult.factors.vehicleAge && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{t('dynamicPricing.vehicleAge', 'Vehicle Age')}</span>
                              <span>{pricingResult.factors.vehicleAge} years (+{((pricingResult.factors.ageAdjustment || 1) - 1) * 100}%)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('dynamicPricing.enterDetailsToCalculate', 'Enter service and vehicle details to calculate pricing')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <Card className="bg-[#151A23] border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#0A5ED7]" />
                {t('dynamicPricing.marketPricingData', 'Market Pricing Data')}
              </CardTitle>
              <CardDescription>
                {t('dynamicPricing.marketDataDescription', 'Regional pricing benchmarks for different service types')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMarket ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : marketData && marketData.length > 0 ? (
                <div className="space-y-3">
                  {marketData.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-[#0E1117] border border-[#232A36]"
                      data-testid={`market-data-${item.id}`}
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.serviceType.replace(/_/g, ' ')}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{item.vehicleClass}</Badge>
                          <span>•</span>
                          <span>{item.region.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#0BB3FF]">SAR {parseFloat(item.avgPrice).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('dynamicPricing.range', 'Range')}: SAR {parseFloat(item.minPrice).toLocaleString()} - {parseFloat(item.maxPrice).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('dynamicPricing.noMarketData', 'No market data available')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-6">
          <Card className="bg-[#151A23] border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Car className="h-5 w-5 text-[#0A5ED7]" />
                {t('dynamicPricing.vehiclePricingFactors', 'Vehicle Pricing Factors')}
              </CardTitle>
              <CardDescription>
                {t('dynamicPricing.factorsDescription', 'Pricing adjustments based on vehicle make and characteristics')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFactors ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : vehicleFactors && vehicleFactors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicleFactors.map((factor) => (
                    <div 
                      key={factor.id} 
                      className="p-4 rounded-lg bg-[#0E1117] border border-[#232A36]"
                      data-testid={`vehicle-factor-${factor.id}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-foreground">{factor.vehicleMake}</p>
                        <Badge variant="outline">{factor.vehicleCategory}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('dynamicPricing.complexity', 'Complexity')}</span>
                          <span className="text-[#0BB3FF]">{(parseFloat(factor.complexityFactor) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('dynamicPricing.partsAvailability', 'Parts Availability')}</span>
                          <span className="text-[#0BB3FF]">{(parseFloat(factor.partsAvailabilityFactor) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('dynamicPricing.laborIntensity', 'Labor Intensity')}</span>
                          <span className="text-[#0BB3FF]">{(parseFloat(factor.laborIntensityFactor) * 100).toFixed(0)}%</span>
                        </div>
                        {parseFloat(factor.luxuryPremiumFactor) > 1 && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t('dynamicPricing.luxuryPremium', 'Luxury Premium')}</span>
                            <span className="text-[#F97316]">+{((parseFloat(factor.luxuryPremiumFactor) - 1) * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('dynamicPricing.noVehicleFactors', 'No vehicle pricing factors available')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
