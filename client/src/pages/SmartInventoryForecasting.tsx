import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Package, TrendingUp, AlertCircle, RefreshCw, Brain, CheckCircle } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DashboardPage } from "@/components/layouts";

const forecastData = [
  { week: "W1", actual: 45, predicted: 43, demand: 50 },
  { week: "W2", actual: 52, predicted: 54, demand: 55 },
  { week: "W3", actual: 48, predicted: 49, demand: 52 },
  { week: "W4", actual: 61, predicted: 58, demand: 65 },
  { week: "W5", actual: null, predicted: 67, demand: 70 },
  { week: "W6", actual: null, predicted: 72, demand: 75 },
  { week: "W7", actual: null, predicted: 68, demand: 72 },
  { week: "W8", actual: null, predicted: 64, demand: 68 },
];

const partForecast = [
  { 
    part: "Engine Oil Filter", 
    sku: "OF-1234",
    current: 45, 
    forecasted: 28, 
    reorderPoint: 30,
    leadTime: 3,
    status: "critical",
    confidence: 94
  },
  { 
    part: "Brake Pads - Front", 
    sku: "BP-5678",
    current: 82, 
    forecasted: 45, 
    reorderPoint: 40,
    leadTime: 5,
    status: "healthy",
    confidence: 89
  },
  { 
    part: "Air Filter", 
    sku: "AF-9012",
    current: 23, 
    forecasted: 38, 
    reorderPoint: 25,
    leadTime: 2,
    status: "warning",
    confidence: 92
  },
  { 
    part: "Spark Plugs", 
    sku: "SP-3456",
    current: 120, 
    forecasted: 65, 
    reorderPoint: 50,
    leadTime: 4,
    status: "healthy",
    confidence: 87
  },
];

export default function SmartInventoryForecasting() {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-red-500/10 text-red-700 dark:text-red-400 border-0";
      case "warning": return "bg-[#F97316]/10 text-[#F97316] border-0";
      case "healthy": return "bg-green-500/10 text-green-700 dark:text-green-400 border-0";
      default: return "bg-[#64748B]/10 text-[#64748B] border-0";
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "critical": return "border-red-200 dark:border-red-900/50";
      case "warning": return "border-[#F97316]/30 dark:border-[#F97316]/20";
      case "healthy": return "border-green-200 dark:border-green-900/50";
      default: return "border-[#E2E8F0] dark:border-[#232A36]";
    }
  };

  const getActionLabel = (status: string) => {
    switch (status) {
      case "critical": return t('smartInventory.reorderNow', 'Reorder Now');
      case "warning": return t('smartInventory.scheduleOrder', 'Schedule Order');
      case "healthy": return t('smartInventory.monitor', 'Monitor');
      default: return t('smartInventory.review', 'Review');
    }
  };

  const metrics = [
    {
      label: t('smartInventory.forecastAccuracy', 'Forecast Accuracy'),
      value: "91.5%",
      icon: Brain,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      label: t('smartInventory.criticalItems', 'Critical Items'),
      value: "3",
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: t('smartInventory.autoOrders', 'Auto Orders'),
      value: "12",
      icon: Package,
      color: "text-[#0A5ED7] dark:text-[#0BB3FF]",
    },
    {
      label: t('smartInventory.costSavings', 'Cost Savings'),
      value: "$4.2K",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <DashboardPage
      title={t('smartInventory.title', 'Smart Inventory Forecasting')}
      description={t('smartInventory.description', 'ML-powered demand prediction with automated reordering recommendations')}
      icon={Brain}
      metrics={metrics}
    >

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('smartInventory.eightWeekDemandForecast', '8-Week Demand Forecast')}</CardTitle>
          <CardDescription className="text-[#64748B]">
            {t('smartInventory.mlPredictedDemand', 'ML-predicted demand vs. actual consumption with confidence intervals')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-[#232A36]" />
              <XAxis dataKey="week" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#0B1F3B' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="demand" 
                stroke="#0BB3FF" 
                fill="#0BB3FF" 
                fillOpacity={0.15}
                name={t('smartInventory.expectedDemand', 'Expected Demand')}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#64748B" 
                strokeWidth={2}
                name={t('smartInventory.actualUsage', 'Actual Usage')}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#0A5ED7" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name={t('smartInventory.aiPrediction', 'AI Prediction')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('smartInventory.inventoryAlertsRecommendations', 'Inventory Alerts & Recommendations')}</CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('smartInventory.aiPoweredReordering', 'AI-powered reordering suggestions based on demand forecasts')}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="button-refresh-forecast">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('common.refresh', 'Refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partForecast.map((item, idx) => (
              <Card key={idx} className={`bg-white dark:bg-[#151A23] border ${getStatusBorderColor(item.status)}`} data-testid={`card-part-${idx}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-part-name-${idx}`}>
                          {item.part}
                        </h3>
                        <Badge className={getStatusColor(item.status)} data-testid={`badge-part-status-${idx}`}>
                          {t(`smartInventory.${item.status}`, item.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#64748B]" data-testid={`text-part-sku-${idx}`}>
                        {t('smartInventory.sku', 'SKU')}: {item.sku}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      className={item.status === "critical" ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white" : "border-[#E2E8F0] dark:border-[#232A36]"}
                      variant={item.status === "critical" ? "default" : "outline"}
                      data-testid={`button-action-${idx}`}
                    >
                      {getActionLabel(item.status)}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">{t('smartInventory.currentStock', 'Current Stock')}</p>
                      <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-current-stock-${idx}`}>
                        {item.current} {t('smartInventory.units', 'units')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">{t('smartInventory.eightWeekForecast', '8-Week Forecast')}</p>
                      <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-forecasted-stock-${idx}`}>
                        {item.forecasted} {t('smartInventory.units', 'units')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">{t('smartInventory.reorderPoint', 'Reorder Point')}</p>
                      <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-reorder-point-${idx}`}>
                        {item.reorderPoint} {t('smartInventory.units', 'units')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">{t('smartInventory.leadTime', 'Lead Time')}</p>
                      <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-lead-time-${idx}`}>
                        {item.leadTime} {t('smartInventory.days', 'days')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#64748B]">{t('smartInventory.mlConfidence', 'ML Confidence')}</span>
                      <span className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-confidence-${idx}`}>
                        {item.confidence}%
                      </span>
                    </div>
                    <Progress value={item.confidence} className="h-2" data-testid={`progress-confidence-${idx}`} />
                  </div>

                  {item.current < item.reorderPoint && (
                    <div className="mt-4 p-3 bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 rounded-lg border border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30">
                      <div className="flex items-start gap-2">
                        <Brain className="w-4 h-4 text-[#0A5ED7] dark:text-[#0BB3FF] mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#0A5ED7] dark:text-[#0BB3FF]">
                            {t('smartInventory.aiRecommendation', 'AI Recommendation')}
                          </p>
                          <p className="text-sm text-[#0B1F3B] dark:text-white">
                            {t('smartInventory.orderUnitsNow', `Order ${Math.max(item.forecasted - item.current + item.reorderPoint, 0)} units now to avoid stockout. Next peak demand in 2 weeks.`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('smartInventory.optimizationInsights', 'Optimization Insights')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-200 dark:border-green-900/50">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white text-sm">
                  {t('smartInventory.reducedWaste', 'Reduced Waste')}
                </p>
                <p className="text-sm text-[#64748B]">
                  {t('smartInventory.preventedObsolete', 'Prevented $2.1K in obsolete inventory last month')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#0A5ED7]/10 rounded-lg border border-[#0A5ED7]/20">
              <TrendingUp className="w-5 h-5 text-[#0A5ED7] dark:text-[#0BB3FF] mt-0.5" />
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white text-sm">
                  {t('smartInventory.improvedTurnover', 'Improved Turnover')}
                </p>
                <p className="text-sm text-[#64748B]">
                  {t('smartInventory.inventoryTurnsIncreased', 'Inventory turns increased by 18% with ML forecasting')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-900/50">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white text-sm">
                  {t('smartInventory.seasonalPatterns', 'Seasonal Patterns')}
                </p>
                <p className="text-sm text-[#64748B]">
                  {t('smartInventory.aiDetectedTrends', 'AI detected 3 seasonal trends affecting brake pad demand')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('smartInventory.automatedActions', 'Automated Actions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-[#E2E8F0] dark:border-[#232A36]">
                <div>
                  <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                    {t('smartInventory.autoReorderRules', 'Auto-Reorder Rules')}
                  </p>
                  <p className="text-xs text-[#64748B]">{t('smartInventory.triggeredBelowThreshold', 'Triggered when below threshold')}</p>
                </div>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-0" data-testid="badge-auto-reorder">
                  {t('common.active', 'Active')}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#E2E8F0] dark:border-[#232A36]">
                <div>
                  <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                    {t('smartInventory.supplierAlerts', 'Supplier Alerts')}
                  </p>
                  <p className="text-xs text-[#64748B]">{t('smartInventory.notifyLongLeadTimes', 'Notify on long lead times')}</p>
                </div>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-0" data-testid="badge-supplier-alerts">
                  {t('common.active', 'Active')}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#E2E8F0] dark:border-[#232A36]">
                <div>
                  <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                    {t('smartInventory.priceMonitoring', 'Price Monitoring')}
                  </p>
                  <p className="text-xs text-[#64748B]">{t('smartInventory.trackPriceChanges', 'Track supplier price changes')}</p>
                </div>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-0" data-testid="badge-price-monitoring">
                  {t('common.active', 'Active')}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                    {t('smartInventory.demandAlerts', 'Demand Alerts')}
                  </p>
                  <p className="text-xs text-[#64748B]">{t('smartInventory.notifyUnusualSpikes', 'Notify on unusual spikes')}</p>
                </div>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-0" data-testid="badge-demand-alerts">
                  {t('common.active', 'Active')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
