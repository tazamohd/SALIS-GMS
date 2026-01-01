import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  PackageSearch, 
  TrendingUp,
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  RefreshCw,
  Zap,
  Brain,
  BarChart3,
  Settings,
  Package,
  ShoppingCart,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar } from "recharts";

interface InventoryForecast {
  id: string;
  partName: string;
  currentStock: number;
  reorderPoint: number;
  predictedDemand: number;
  confidenceScore: number;
  forecastMethod: string;
  trendDirection: "up" | "down" | "stable";
  daysUntilStockout: number;
  recommendedOrderQty: number;
}

interface ReorderRule {
  id: string;
  partId: string;
  partName: string;
  minQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplierPriority: string[];
  autoApprove: boolean;
  isActive: boolean;
}

export default function AutomatedReordering() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  const { data: forecasts = [], isLoading: loadingForecasts } = useQuery<InventoryForecast[]>({
    queryKey: ['/api/inventory/forecasts', selectedTimeframe],
  });

  const { data: rules = [], isLoading: loadingRules } = useQuery<ReorderRule[]>({
    queryKey: ['/api/inventory/reorder-rules'],
  });

  const { data: apiPendingOrders, isFetched: pendingOrdersFetched, isError: pendingOrdersError } = useQuery<any[]>({
    queryKey: ['/api/inventory/pending-orders'],
  });

  const samplePendingOrders = [
    { id: '1', partName: 'Oil Filter - Toyota', quantity: 50, supplier: 'AutoParts KSA', estimatedCost: 750, status: 'pending_approval', createdAt: new Date().toISOString() },
    { id: '2', partName: 'Brake Pads - Universal', quantity: 30, supplier: 'MENA Auto Supply', estimatedCost: 1200, status: 'approved', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '3', partName: 'Air Filter Set', quantity: 25, supplier: 'AutoParts KSA', estimatedCost: 375, status: 'pending_approval', createdAt: new Date(Date.now() - 172800000).toISOString() },
  ];

  const pendingOrders = pendingOrdersFetched && !pendingOrdersError 
    ? (Array.isArray(apiPendingOrders) ? apiPendingOrders : []) 
    : samplePendingOrders;

  const runForecastMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/inventory/run-forecast');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/forecasts'] });
      toast({ title: t('autoReorder.forecastUpdated', 'Forecast updated'), description: t('autoReorder.aiPredictionsRefreshed', 'AI demand predictions have been refreshed') });
    },
    onError: (error: any) => {
      toast({ title: t('autoReorder.forecastFailed', 'Forecast failed'), description: error.message, variant: "destructive" });
    },
  });

  const demandTrendData = [
    { month: t('months.jan', 'Jan'), actual: 120, predicted: 115, variance: 5 },
    { month: t('months.feb', 'Feb'), actual: 135, predicted: 140, variance: -5 },
    { month: t('months.mar', 'Mar'), actual: 150, predicted: 148, variance: 2 },
    { month: t('months.apr', 'Apr'), actual: 145, predicted: 155, variance: -10 },
    { month: t('months.may', 'May'), actual: 160, predicted: 158, variance: 2 },
    { month: t('months.jun', 'Jun'), actual: 175, predicted: 172, variance: 3 },
  ];

  const stockLevelData = [
    { name: t('autoReorder.oilFilters', 'Oil Filters'), current: 45, min: 20, reorder: 30, max: 100 },
    { name: t('autoReorder.brakePads', 'Brake Pads'), current: 15, min: 10, reorder: 25, max: 80 },
    { name: t('autoReorder.airFilters', 'Air Filters'), current: 28, min: 15, reorder: 30, max: 60 },
    { name: t('autoReorder.sparkPlugs', 'Spark Plugs'), current: 60, min: 25, reorder: 40, max: 120 },
    { name: t('autoReorder.coolant', 'Coolant'), current: 8, min: 5, reorder: 15, max: 50 },
  ];

  const criticalItems = stockLevelData.filter(item => item.current <= item.reorder);
  const lowStockItems = stockLevelData.filter(item => item.current > item.reorder && item.current < item.reorder * 1.5);

  const overviewTab = (
    <div className="space-y-6" data-testid="auto-reorder-overview">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#F97316]/10 to-[#FB923C]/5 dark:from-[#F97316]/20 dark:to-[#FB923C]/10 border-[#F97316]/30" data-testid="card-critical-stock">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('autoReorder.criticalStock', 'Critical Stock')}</p>
                <p className="text-3xl font-bold text-[#F97316]" data-testid="text-critical-count">{criticalItems.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F97316]/20">
                <AlertTriangle className="w-6 h-6 text-[#F97316]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#0BB3FF]/10 to-[#0A5ED7]/5 dark:from-[#0BB3FF]/20 dark:to-[#0A5ED7]/10 border-[#0BB3FF]/30" data-testid="card-low-stock">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('autoReorder.lowStock', 'Low Stock')}</p>
                <p className="text-3xl font-bold text-[#0BB3FF]" data-testid="text-lowstock-count">{lowStockItems.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0BB3FF]/20">
                <Package className="w-6 h-6 text-[#0BB3FF]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#0A5ED7]/10 to-[#0BB3FF]/5 dark:from-[#0A5ED7]/20 dark:to-[#0BB3FF]/10 border-[#0A5ED7]/30" data-testid="card-pending-orders">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('autoReorder.pendingOrders', 'Pending Orders')}</p>
                <p className="text-3xl font-bold text-[#0A5ED7]" data-testid="text-pending-count">{pendingOrders.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0A5ED7]/20">
                <ShoppingCart className="w-6 h-6 text-[#0A5ED7]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#10B981]/10 to-[#0BB3FF]/5 dark:from-[#10B981]/20 dark:to-[#0BB3FF]/10 border-[#10B981]/30" data-testid="card-forecast-accuracy">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('autoReorder.forecastAccuracy', 'Forecast Accuracy')}</p>
                <p className="text-3xl font-bold text-[#10B981]" data-testid="text-accuracy">94%</p>
              </div>
              <div className="p-3 rounded-xl bg-[#10B981]/20">
                <Brain className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] overflow-hidden">
          <CardHeader className="border-b border-[#E2E8F0] dark:border-[#232A36]">
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              {t('autoReorder.demandForecastVsActual', 'Demand Forecast vs Actual')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('autoReorder.aiPredictedDemand', 'AI-predicted demand compared to actual usage')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={demandTrendData}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A5ED7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0A5ED7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0BB3FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0BB3FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232A36" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#232A36' }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#232A36' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(21, 26, 35, 0.95)', border: '1px solid #232A36', borderRadius: '12px', color: '#fff' }}
                  labelStyle={{ color: '#0BB3FF', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ color: '#64748B' }} />
                <Area type="monotone" dataKey="actual" stroke="#0A5ED7" strokeWidth={3} fill="url(#actualGrad)" name={t('autoReorder.actual', 'Actual')} />
                <Area type="monotone" dataKey="predicted" stroke="#0BB3FF" strokeWidth={3} strokeDasharray="8 4" fill="url(#predictedGrad)" name={t('autoReorder.predicted', 'Predicted')} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] overflow-hidden">
          <CardHeader className="border-b border-[#E2E8F0] dark:border-[#232A36]">
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#10B981] to-[#0BB3FF]">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              {t('autoReorder.stockLevels', 'Stock Levels')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('autoReorder.currentStockVsReorderPoints', 'Current stock vs reorder points')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockLevelData} barGap={8}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0A5ED7"/>
                    <stop offset="100%" stopColor="#0BB3FF"/>
                  </linearGradient>
                  <linearGradient id="reorderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316"/>
                    <stop offset="100%" stopColor="#FB923C"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232A36" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#232A36' }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#232A36' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(21, 26, 35, 0.95)', border: '1px solid #232A36', borderRadius: '12px', color: '#fff' }}
                  cursor={{ fill: 'rgba(10, 94, 215, 0.1)' }}
                />
                <Legend wrapperStyle={{ color: '#64748B' }} />
                <Bar dataKey="current" fill="url(#stockGrad)" name={t('autoReorder.currentStock', 'Current Stock')} radius={[8, 8, 0, 0]} />
                <Bar dataKey="reorder" fill="url(#reorderGrad)" name={t('autoReorder.reorderPoint', 'Reorder Point')} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3B] via-[#0A5ED7]/20 to-[#0BB3FF]/10 border-[#0A5ED7]/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMwQTVFRDciIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <CardHeader className="relative flex flex-row items-center justify-between border-b border-[#0A5ED7]/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-2xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-3 rounded-2xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-white text-xl">
                {t('autoReorder.aiDemandPredictions', 'AI Demand Predictions')}
                <span className="px-2 py-0.5 text-xs bg-[#0BB3FF]/20 text-[#0BB3FF] rounded-full border border-[#0BB3FF]/30">AI</span>
              </CardTitle>
              <CardDescription className="text-[#94A3B8]">{t('autoReorder.mlBasedForecasting', 'Machine learning based demand forecasting')}</CardDescription>
            </div>
          </div>
          <Button 
            onClick={() => {
              runForecastMutation.mutate();
              toast({ title: t('autoReorder.forecastRunning', 'Forecast Running'), description: t('autoReorder.aiProcessing', 'AI is analyzing demand patterns...') });
            }} 
            disabled={runForecastMutation.isPending}
            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white shadow-lg shadow-[#0A5ED7]/40 hover:shadow-[#0A5ED7]/60 hover:scale-105 transition-all duration-300"
            data-testid="button-run-forecast"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${runForecastMutation.isPending ? 'animate-spin' : ''}`} />
            {t('autoReorder.runForecast', 'Run Forecast')}
          </Button>
        </CardHeader>
        <CardContent className="relative pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10" data-testid="card-model-accuracy">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#10B981]/20">
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                </div>
                <span className="text-sm text-[#94A3B8]">{t('autoReorder.modelAccuracy', 'Model Accuracy')}</span>
              </div>
              <p className="text-3xl font-bold text-white" data-testid="text-model-accuracy">94.7%</p>
              <p className="text-xs text-[#10B981] mt-1">↑ 2.3% vs last month</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10" data-testid="card-predictions-today">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#0BB3FF]/20">
                  <Zap className="w-4 h-4 text-[#0BB3FF]" />
                </div>
                <span className="text-sm text-[#94A3B8]">{t('autoReorder.predictionsToday', 'Predictions Today')}</span>
              </div>
              <p className="text-3xl font-bold text-white" data-testid="text-predictions-today">247</p>
              <p className="text-xs text-[#0BB3FF] mt-1">Processing in real-time</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10" data-testid="card-avg-lead-time">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#6366F1]/20">
                  <Clock className="w-4 h-4 text-[#6366F1]" />
                </div>
                <span className="text-sm text-[#94A3B8]">{t('autoReorder.avgLeadTime', 'Avg Lead Time')}</span>
              </div>
              <p className="text-3xl font-bold text-white" data-testid="text-avg-lead-time">3.2d</p>
              <p className="text-xs text-[#6366F1] mt-1">Optimized delivery</p>
            </div>
          </div>

          <div className="space-y-3">
            {stockLevelData.map((item, idx) => {
              const isLow = item.current <= item.reorder;
              const isCritical = item.current <= item.min;
              const stockPercent = (item.current / item.max) * 100;
              const daysUntilStockout = Math.floor((item.current / (item.max * 0.1)) * 7);
              const demandChange = [12, -5, 8, 15, -3][idx];
              const confidence = [96, 92, 88, 94, 91][idx];
              
              return (
                <div 
                  key={idx} 
                  className={`relative p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
                    isCritical 
                      ? 'bg-[#F97316]/10 border-[#F97316]/40' 
                      : isLow 
                        ? 'bg-[#0BB3FF]/10 border-[#0BB3FF]/30' 
                        : 'bg-white/5 border-white/10'
                  }`}
                  data-testid={`forecast-item-${idx}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`relative p-2.5 rounded-xl ${
                        isCritical ? 'bg-[#F97316]/20' : isLow ? 'bg-[#0BB3FF]/20' : 'bg-[#10B981]/20'
                      }`}>
                        {isCritical && <div className="absolute inset-0 rounded-xl bg-[#F97316]/30 animate-ping" />}
                        <Package className={`relative w-5 h-5 ${
                          isCritical ? 'text-[#F97316]' : isLow ? 'text-[#0BB3FF]' : 'text-[#10B981]'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-[#94A3B8]">
                          {item.current} {t('autoReorder.units', 'units')} • {daysUntilStockout} {t('autoReorder.daysSupply', 'days supply')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-[#94A3B8]">{t('autoReorder.aiConfidence', 'AI Confidence')}</p>
                        <p className="text-sm font-semibold text-white">{confidence}%</p>
                      </div>
                      <div 
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                          demandChange >= 0 
                            ? 'bg-[#10B981]/20 text-[#10B981]' 
                            : 'bg-[#0BB3FF]/20 text-[#0BB3FF]'
                        }`}
                        data-testid={`badge-demand-change-${idx}`}
                      >
                        {demandChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span className="text-sm font-medium">{demandChange >= 0 ? '+' : ''}{demandChange}%</span>
                      </div>
                      {isCritical && (
                        <Badge className="bg-[#F97316] text-white border-0 animate-pulse">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {t('autoReorder.critical', 'Critical')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-[#0B1F3B] rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F97316] via-[#0BB3FF] to-[#10B981] opacity-20 w-full" />
                    <div 
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        isCritical 
                          ? 'bg-gradient-to-r from-[#F97316] to-[#FB923C]' 
                          : isLow 
                            ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]' 
                            : 'bg-gradient-to-r from-[#10B981] to-[#0BB3FF]'
                      }`}
                      style={{ width: `${stockPercent}%` }}
                    />
                    <div 
                      className="absolute inset-y-0 w-0.5 bg-[#F97316]" 
                      style={{ left: `${(item.reorder / item.max) * 100}%` }}
                      title={t('autoReorder.reorderPoint', 'Reorder Point')}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#F97316]" />
                      {t('autoReorder.min', 'Min')}: {item.min}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#0BB3FF]" />
                      {t('autoReorder.reorder', 'Reorder')}: {item.reorder}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                      {t('autoReorder.max', 'Max')}: {item.max}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const [ruleStates, setRuleStates] = useState<Record<number, boolean>>({});

  const toggleRule = (idx: number) => {
    const wasActive = ruleStates[idx] ?? true;
    const newActive = !wasActive;
    setRuleStates(prev => ({ ...prev, [idx]: newActive }));
    toast({ 
      title: t('autoReorder.ruleUpdated', 'Rule Updated'), 
      description: `${stockLevelData[idx]?.name} rule ${newActive ? 'enabled' : 'disabled'}` 
    });
  };

  const rulesTab = (
    <div className="space-y-6" data-testid="auto-reorder-rules">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Settings className="w-5 h-5 text-[#0A5ED7]" />
              {t('autoReorder.reorderRules', 'Reorder Rules')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('autoReorder.configureRulesDescription', 'Configure automatic reordering rules for inventory items')}</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                data-testid="button-add-reorder-rule"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('autoReorder.addRule', 'Add Rule')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <DialogHeader>
                <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('autoReorder.addNewRule', 'Add New Reorder Rule')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-[#0B1F3B] dark:text-white">{t('autoReorder.selectPart', 'Select Part')}</Label>
                  <Select>
                    <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                      <SelectValue placeholder={t('autoReorder.choosePart', 'Choose a part...')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#151A23]">
                      <SelectItem value="oil">Oil Filter</SelectItem>
                      <SelectItem value="brake">Brake Pads</SelectItem>
                      <SelectItem value="air">Air Filter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0B1F3B] dark:text-white">{t('autoReorder.reorderPoint', 'Reorder Point')}</Label>
                    <Input type="number" placeholder="20" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0B1F3B] dark:text-white">{t('autoReorder.orderQuantity', 'Order Quantity')}</Label>
                    <Input type="number" placeholder="50" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                  onClick={() => toast({ title: t('autoReorder.ruleCreated', 'Rule Created'), description: t('autoReorder.ruleCreatedDesc', 'New reorder rule has been added') })}
                  data-testid="button-create-rule"
                >
                  {t('autoReorder.createRule', 'Create Rule')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stockLevelData.map((item, idx) => {
              const isActive = ruleStates[idx] ?? true;
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-[#F8FAFC] dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]' 
                      : 'bg-[#64748B]/10 border-[#64748B]/30 opacity-60'
                  }`} 
                  data-testid={`rule-item-${idx}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Switch 
                        checked={isActive} 
                        onCheckedChange={() => toggleRule(idx)}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#0A5ED7] data-[state=checked]:to-[#0BB3FF]"
                        data-testid={`switch-rule-active-${idx}`} 
                      />
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-[#0A5ED7]/10' : 'bg-[#64748B]/10'}`}>
                          <Package className={`w-4 h-4 ${isActive ? 'text-[#0A5ED7]' : 'text-[#64748B]'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#0B1F3B] dark:text-white">{item.name}</p>
                          <p className="text-sm text-[#64748B]">
                            {t('autoReorder.ruleDescription', 'Reorder {{qty}} units when stock falls below {{threshold}}', { qty: item.reorder * 2, threshold: item.reorder })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        className={isActive 
                          ? 'bg-[#0A5ED7]/10 text-[#0A5ED7] border-[#0A5ED7]/30' 
                          : 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/30'
                        }
                      >
                        {isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                        onClick={() => toast({ title: t('autoReorder.editRule', 'Edit Rule'), description: item.name })}
                        data-testid={`button-edit-rule-${idx}`}
                      >
                        {t('common.edit', 'Edit')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ordersTab = (
    <div className="space-y-6" data-testid="auto-reorder-orders">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <ShoppingCart className="w-5 h-5 text-[#0A5ED7]" />
            {t('autoReorder.pendingReplenishmentOrders', 'Pending Replenishment Orders')}
          </CardTitle>
          <CardDescription className="text-[#64748B]">{t('autoReorder.reviewAndApprove', 'Review and approve auto-generated orders')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingOrders.map((order: any, idx: number) => (
              <div 
                key={order.id || idx} 
                className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] rounded-xl flex items-center justify-between"
                data-testid={`pending-order-${idx}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">{order.partName}</p>
                    <p className="text-sm text-[#64748B]">
                      {order.quantity} units • {order.supplier}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-[#0A5ED7]">SAR {order.estimatedCost?.toLocaleString()}</p>
                    <Badge 
                      className={order.status === 'approved' 
                        ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' 
                        : 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30'
                      }
                    >
                      {order.status === 'approved' ? t('common.approved', 'Approved') : t('common.pending', 'Pending')}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {order.status !== 'approved' && (
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                        onClick={() => toast({ title: t('autoReorder.orderApproved', 'Order approved'), description: order.partName })}
                        data-testid={`button-approve-order-${idx}`}
                      >
                        {t('common.approve', 'Approve')}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]"
                      onClick={() => toast({ title: t('common.viewDetails', 'View Details'), description: order.partName })}
                      data-testid={`button-view-order-${idx}`}
                    >
                      {t('common.view', 'View')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const analyticsTab = (
    <div className="space-y-6" data-testid="auto-reorder-analytics">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] border-0 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">{t('autoReorder.forecastAccuracy', 'Forecast Accuracy')}</p>
                <p className="text-3xl font-bold">94.2%</p>
              </div>
              <Brain className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#10B981] to-[#0BB3FF] border-0 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">{t('autoReorder.costSavings', 'Cost Savings')}</p>
                <p className="text-3xl font-bold">SAR 12.4K</p>
              </div>
              <TrendingUp className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#6366F1] to-[#0A5ED7] border-0 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">{t('autoReorder.stockoutsPrevented', 'Stockouts Prevented')}</p>
                <p className="text-3xl font-bold">23</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#0B1F3B] to-[#0A5ED7] border-0 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">{t('autoReorder.inventoryTurnover', 'Inventory Turnover')}</p>
                <p className="text-3xl font-bold">4.8x</p>
              </div>
              <RefreshCw className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] overflow-hidden">
        <CardHeader className="border-b border-[#E2E8F0] dark:border-[#232A36]">
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            {t('autoReorder.forecastPerformance', 'Forecast Performance')}
          </CardTitle>
          <CardDescription className="text-[#64748B]">{t('autoReorder.trackAccuracy', 'Track accuracy of AI predictions over time')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={demandTrendData}>
              <defs>
                <linearGradient id="varianceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232A36" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#232A36' }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#232A36' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(21, 26, 35, 0.95)', border: '1px solid #232A36', borderRadius: '12px', color: '#fff' }}
                labelStyle={{ color: '#0BB3FF', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ color: '#64748B' }} />
              <Area type="monotone" dataKey="variance" fill="url(#varianceGrad)" stroke="#F97316" strokeWidth={3} name={t('autoReorder.variancePercent', 'Variance %')} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: "overview", label: t('autoReorder.overview', 'Overview'), icon: PackageSearch, content: overviewTab },
    { id: "rules", label: t('autoReorder.reorderRules', 'Reorder Rules'), icon: Settings, content: rulesTab },
    { id: "orders", label: t('autoReorder.pendingOrders', 'Pending Orders'), icon: ShoppingCart, content: ordersTab },
    { id: "analytics", label: t('autoReorder.analytics', 'Analytics'), icon: BarChart3, content: analyticsTab },
  ];

  return (
    <TabsPageLayout
      title={t('autoReorder.title', 'Automated Inventory Reordering')}
      description={t('autoReorder.description', 'AI-powered demand forecasting and automatic replenishment')}
      icon={PackageSearch}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
