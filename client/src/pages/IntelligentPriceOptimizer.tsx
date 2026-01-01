import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, TrendingDown, Target, Zap, DollarSign, Users, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AnalyticsPage } from "@/components/layouts";

const marketData = [
  { month: "Jan", current: 125, optimized: 145, demand: 85 },
  { month: "Feb", current: 130, optimized: 155, demand: 90 },
  { month: "Mar", current: 135, optimized: 165, demand: 95 },
  { month: "Apr", current: 128, optimized: 158, demand: 88 },
  { month: "May", current: 140, optimized: 175, demand: 98 },
  { month: "Jun", current: 145, optimized: 182, demand: 102 },
];

const competitorData = [
  { name: "Your Garage", price: 145, volume: 250 },
  { name: "Competitor A", price: 135, volume: 200 },
  { name: "Competitor B", price: 155, volume: 180 },
  { name: "Market Avg", price: 148, volume: 220 },
];

export default function IntelligentPriceOptimizer() {
  const { t } = useTranslation();
  const [serviceType, setServiceType] = useState("oil-change");
  const [currentPrice, setCurrentPrice] = useState("125");
  const [demandSensitivity, setDemandSensitivity] = useState([50]);
  const [optimizedPrice, setOptimizedPrice] = useState(145);
  const [revenueImpact, setRevenueImpact] = useState(16);

  const handleOptimize = () => {
    const base = parseFloat(currentPrice);
    const sensitivity = demandSensitivity[0] / 100;
    const optimized = base * (1 + (0.2 * sensitivity));
    const revenue = ((optimized - base) / base) * 100;
    
    setOptimizedPrice(Math.round(optimized));
    setRevenueImpact(Math.round(revenue));
  };

  const sections = [
    {
      title: t('priceOptimizer.priceOptimizationTrend', 'Price Optimization Trend'),
      description: t('priceOptimizer.historicalVsAIRecommended', 'Historical vs. AI-recommended pricing with demand correlation'),
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={marketData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-[#232A36]" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg, #fff)', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#64748B" 
              strokeWidth={2}
              name={t('priceOptimizer.currentPrice', 'Current Price')}
            />
            <Line 
              type="monotone" 
              dataKey="optimized" 
              stroke="#0A5ED7" 
              strokeWidth={2}
              name={t('priceOptimizer.aiOptimized', 'AI Optimized')}
            />
            <Line 
              type="monotone" 
              dataKey="demand" 
              stroke="#0BB3FF" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name={t('priceOptimizer.demandIndex', 'Demand Index')}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: t('priceOptimizer.competitiveMarketAnalysis', 'Competitive Market Analysis'),
      description: t('priceOptimizer.realTimePricingComparison', 'Real-time pricing comparison with local competitors'),
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={competitorData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-[#232A36]" />
            <XAxis dataKey="name" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg, #fff)', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="price" fill="#0A5ED7" name={t('priceOptimizer.priceDollar', 'Price ($)')} />
            <Bar dataKey="volume" fill="#0BB3FF" name={t('priceOptimizer.monthlyVolume', 'Monthly Volume')} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <AnalyticsPage
      title={t('nav.intelligent_price_optimizer', 'Intelligent Price Optimizer')}
      description={t('priceOptimizer.mlPoweredDynamicPricing', 'ML-powered dynamic pricing based on demand, competition, and customer behavior')}
      icon={Target}
      sections={sections}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-[#0A5ED7]/30 dark:border-[#0A5ED7]/50 bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10" data-testid="card-optimized-price">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-[#0A5ED7]" />
              <div>
                <p className="text-sm text-[#64748B]">{t('priceOptimizer.optimizedPrice', 'Optimized Price')}</p>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-optimized-price">${optimizedPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20" data-testid="card-revenue-impact">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-[#64748B]">{t('priceOptimizer.revenueImpact', 'Revenue Impact')}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-revenue-impact">
                  +{revenueImpact}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20" data-testid="card-demand-score">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-[#64748B]">{t('priceOptimizer.demandScore', 'Demand Score')}</p>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-demand-score">94/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#F97316]/30 dark:border-[#F97316]/50 bg-[#F97316]/5 dark:bg-[#F97316]/10" data-testid="card-market-position">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-[#F97316]" />
              <div>
                <p className="text-sm text-[#64748B]">{t('priceOptimizer.marketPosition', 'Market Position')}</p>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-market-position">2nd</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Zap className="w-5 h-5 text-[#F97316]" />
              {t('priceOptimizer.optimizationSettings', 'Optimization Settings')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('priceOptimizer.configureAIPricingParameters', 'Configure AI pricing parameters')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('priceOptimizer.serviceType', 'Service Type')}</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-service-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="oil-change">{t('priceOptimizer.oilChange', 'Oil Change')}</SelectItem>
                  <SelectItem value="brake-service">{t('priceOptimizer.brakeService', 'Brake Service')}</SelectItem>
                  <SelectItem value="tire-rotation">{t('priceOptimizer.tireRotation', 'Tire Rotation')}</SelectItem>
                  <SelectItem value="inspection">{t('priceOptimizer.vehicleInspection', 'Vehicle Inspection')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('priceOptimizer.currentPriceDollar', 'Current Price ($)')}</Label>
              <Input
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-current-price"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('priceOptimizer.demandSensitivity', 'Demand Sensitivity')}</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={demandSensitivity}
                  onValueChange={setDemandSensitivity}
                  max={100}
                  step={1}
                  className="flex-1"
                  data-testid="slider-demand-sensitivity"
                />
                <span className="text-sm font-medium w-12 text-[#0B1F3B] dark:text-white" data-testid="text-sensitivity-value">
                  {demandSensitivity[0]}%
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                {t('priceOptimizer.howMuchPriceAffectsDemand', 'How much price affects customer demand')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#64748B]">{t('priceOptimizer.competitionWeight', 'Competition Weight')}</Label>
                <Badge variant="outline" className="w-full justify-center border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="badge-competition-weight">65%</Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#64748B]">{t('priceOptimizer.seasonFactor', 'Season Factor')}</Label>
                <Badge variant="outline" className="w-full justify-center border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="badge-season-factor">{t('priceOptimizer.high', 'High')}</Badge>
              </div>
            </div>

            <Button 
              onClick={handleOptimize}
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
              data-testid="button-optimize-price"
            >
              <Target className="w-4 h-4 mr-2" />
              {t('priceOptimizer.runAIOptimization', 'Run AI Optimization')}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('priceOptimizer.aiInsightsStrategy', 'AI Insights & Strategy')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10 rounded-lg border border-[#0A5ED7]/20">
              <TrendingUp className="w-5 h-5 text-[#0A5ED7] mt-0.5" />
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white text-sm">{t('priceOptimizer.peakDemandPeriod', 'Peak Demand Period')}</p>
                <p className="text-sm text-[#64748B]">
                  {t('priceOptimizer.increasePricesSummer', 'Increase prices by 12% during summer months (May-Aug)')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-900/30">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white text-sm">{t('priceOptimizer.bundleOpportunity', 'Bundle Opportunity')}</p>
                <p className="text-sm text-[#64748B]">
                  {t('priceOptimizer.customersOilChangeTireRotation', 'Customers buying oil changes also need tire rotation (+35%)')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50 dark:border-purple-900/30">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white text-sm">{t('priceOptimizer.customerSegment', 'Customer Segment')}</p>
                <p className="text-sm text-[#64748B]">
                  {t('priceOptimizer.premiumCustomersSameDayService', 'Premium customers willing to pay 20% more for same-day service')}
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B]">{t('priceOptimizer.basePrice', 'Base Price')}</span>
                <span className="font-semibold text-[#0B1F3B] dark:text-white">$125</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B]">{t('priceOptimizer.marketAdjustment', 'Market Adjustment')}</span>
                <span className="font-semibold text-green-600 dark:text-green-400">+$10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B]">{t('priceOptimizer.demandMultiplier', 'Demand Multiplier')}</span>
                <span className="font-semibold text-green-600 dark:text-green-400">+$8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B]">{t('priceOptimizer.competitiveEdge', 'Competitive Edge')}</span>
                <span className="font-semibold text-green-600 dark:text-green-400">+$2</span>
              </div>
              <div className="border-t border-[#E2E8F0] dark:border-[#232A36] pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#0B1F3B] dark:text-white">{t('priceOptimizer.optimizedPrice', 'Optimized Price')}</span>
                  <span className="text-xl font-bold text-[#0A5ED7]">
                    ${optimizedPrice}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnalyticsPage>
  );
}
