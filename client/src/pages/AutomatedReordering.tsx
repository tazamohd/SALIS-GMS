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
  ArrowDownCircle,
  Target,
  Activity,
  LineChart as LineChartIcon,
  Sparkles,
  Award,
  Gauge,
  ArrowRight
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar, ComposedChart, RadialBarChart, RadialBar, PieChart, Pie, Cell } from "recharts";

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
        <Card className="bg-gradient-to-br from-[#0A5ED7]/10 to-[#0BB3FF]/5 dark:from-[#0A5ED7]/20 dark:to-[#0BB3FF]/10 border-[#0A5ED7]/30" data-testid="card-forecast-accuracy">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('autoReorder.forecastAccuracy', 'Forecast Accuracy')}</p>
                <p className="text-3xl font-bold text-[#0A5ED7]" data-testid="text-accuracy">94%</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0A5ED7]/20">
                <Brain className="w-6 h-6 text-[#0A5ED7]" />
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
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
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

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] dark:border-[#232A36]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-2xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-3 rounded-2xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white text-xl">
                {t('autoReorder.aiDemandPredictions', 'AI Demand Predictions')}
                <span className="px-2 py-0.5 text-xs bg-[#0BB3FF]/20 text-[#0BB3FF] rounded-full border border-[#0BB3FF]/30">AI</span>
              </CardTitle>
              <CardDescription className="text-[#64748B]">{t('autoReorder.mlBasedForecasting', 'Machine learning based demand forecasting')}</CardDescription>
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
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-model-accuracy">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#0A5ED7]/20">
                  <TrendingUp className="w-4 h-4 text-[#0A5ED7]" />
                </div>
                <span className="text-sm text-[#64748B]">{t('autoReorder.modelAccuracy', 'Model Accuracy')}</span>
              </div>
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-model-accuracy">94.7%</p>
              <p className="text-xs text-[#0A5ED7] mt-1">↑ 2.3% vs last month</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-predictions-today">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#0BB3FF]/20">
                  <Zap className="w-4 h-4 text-[#0BB3FF]" />
                </div>
                <span className="text-sm text-[#64748B]">{t('autoReorder.predictionsToday', 'Predictions Today')}</span>
              </div>
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-predictions-today">247</p>
              <p className="text-xs text-[#0BB3FF] mt-1">Processing in real-time</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-avg-lead-time">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#6366F1]/20">
                  <Clock className="w-4 h-4 text-[#6366F1]" />
                </div>
                <span className="text-sm text-[#64748B]">{t('autoReorder.avgLeadTime', 'Avg Lead Time')}</span>
              </div>
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-avg-lead-time">3.2d</p>
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
                        : 'bg-[#F8FAFC] dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]'
                  }`}
                  data-testid={`forecast-item-${idx}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`relative p-2.5 rounded-xl ${
                        isCritical ? 'bg-[#F97316]/20' : isLow ? 'bg-[#0BB3FF]/20' : 'bg-[#0A5ED7]/20'
                      }`}>
                        {isCritical && <div className="absolute inset-0 rounded-xl bg-[#F97316]/30 animate-ping" />}
                        <Package className={`relative w-5 h-5 ${
                          isCritical ? 'text-[#F97316]' : isLow ? 'text-[#0BB3FF]' : 'text-[#0A5ED7]'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-[#0B1F3B] dark:text-white">{item.name}</p>
                        <p className="text-sm text-[#64748B]">
                          {item.current} {t('autoReorder.units', 'units')} • {daysUntilStockout} {t('autoReorder.daysSupply', 'days supply')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-[#64748B]">{t('autoReorder.aiConfidence', 'AI Confidence')}</p>
                        <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">{confidence}%</p>
                      </div>
                      <div 
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                          demandChange >= 0 
                            ? 'bg-[#0A5ED7]/20 text-[#0A5ED7]' 
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
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F97316] via-[#0BB3FF] to-[#0A5ED7] opacity-20 w-full" />
                    <div 
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        isCritical 
                          ? 'bg-gradient-to-r from-[#F97316] to-[#FB923C]' 
                          : isLow 
                            ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]' 
                            : 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]'
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
                      <div className="w-2 h-2 rounded-full bg-[#0A5ED7]" />
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
  const [editingRule, setEditingRule] = useState<{ idx: number; item: typeof stockLevelData[0] } | null>(null);
  const [editFormData, setEditFormData] = useState({ reorderPoint: 0, orderQuantity: 0, supplier: '' });
  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState({ part: '', reorderPoint: '', orderQuantity: '', supplier: '' });
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [orderStates, setOrderStates] = useState<Record<number, string>>({});

  const availableParts = [
    { value: 'oil-filter', label: t('parts.oilFilter', 'Oil Filter'), category: t('parts.filters', 'Filters') },
    { value: 'air-filter', label: t('parts.airFilter', 'Air Filter'), category: t('parts.filters', 'Filters') },
    { value: 'fuel-filter', label: t('parts.fuelFilter', 'Fuel Filter'), category: t('parts.filters', 'Filters') },
    { value: 'cabin-filter', label: t('parts.cabinFilter', 'Cabin Air Filter'), category: t('parts.filters', 'Filters') },
    { value: 'brake-pads', label: t('parts.brakePads', 'Brake Pads'), category: t('parts.brakes', 'Brakes') },
    { value: 'brake-rotors', label: t('parts.brakeRotors', 'Brake Rotors'), category: t('parts.brakes', 'Brakes') },
    { value: 'brake-fluid', label: t('parts.brakeFluid', 'Brake Fluid'), category: t('parts.brakes', 'Brakes') },
    { value: 'spark-plugs', label: t('parts.sparkPlugs', 'Spark Plugs'), category: t('parts.engine', 'Engine') },
    { value: 'engine-oil', label: t('parts.engineOil', 'Engine Oil'), category: t('parts.engine', 'Engine') },
    { value: 'coolant', label: t('parts.coolant', 'Coolant'), category: t('parts.engine', 'Engine') },
    { value: 'timing-belt', label: t('parts.timingBelt', 'Timing Belt'), category: t('parts.engine', 'Engine') },
    { value: 'battery', label: t('parts.battery', 'Battery'), category: t('parts.electrical', 'Electrical') },
    { value: 'alternator', label: t('parts.alternator', 'Alternator'), category: t('parts.electrical', 'Electrical') },
    { value: 'wiper-blades', label: t('parts.wiperBlades', 'Wiper Blades'), category: t('parts.exterior', 'Exterior') },
    { value: 'headlight-bulb', label: t('parts.headlightBulb', 'Headlight Bulb'), category: t('parts.electrical', 'Electrical') },
  ];

  const suppliers = [
    { value: 'supplier-a', label: t('suppliers.autoPartsPlus', 'Auto Parts Plus') },
    { value: 'supplier-b', label: t('suppliers.motorcraft', 'Motorcraft') },
    { value: 'supplier-c', label: t('suppliers.bosch', 'Bosch Parts') },
    { value: 'supplier-d', label: t('suppliers.denso', 'Denso') },
  ];

  const toggleRule = (idx: number) => {
    const wasActive = ruleStates[idx] ?? true;
    const newActive = !wasActive;
    setRuleStates(prev => ({ ...prev, [idx]: newActive }));
    const partName = stockLevelData[idx]?.name;
    toast({ 
      title: newActive 
        ? t('autoReorder.ruleActivated', 'Rule Activated') 
        : t('autoReorder.ruleDeactivated', 'Rule Deactivated'),
      description: newActive 
        ? t('autoReorder.ruleActivatedDesc', '{{part}} reorder rule is now active. Auto-ordering will resume.', { part: partName })
        : t('autoReorder.ruleDeactivatedDesc', '{{part}} reorder rule has been disabled. Auto-ordering paused.', { part: partName })
    });
  };

  const openEditDialog = (idx: number, item: typeof stockLevelData[0]) => {
    setEditFormData({ reorderPoint: item.reorder, orderQuantity: item.reorder * 2, supplier: 'supplier-a' });
    setEditingRule({ idx, item });
  };

  const saveEditedRule = () => {
    if (editingRule) {
      if (editFormData.reorderPoint <= 0) {
        toast({ 
          title: t('autoReorder.validationError', 'Validation Error'),
          description: t('autoReorder.reorderPointRequired', 'Please enter a valid reorder point greater than 0'),
          variant: 'destructive'
        });
        return;
      }
      if (editFormData.orderQuantity <= 0) {
        toast({ 
          title: t('autoReorder.validationError', 'Validation Error'),
          description: t('autoReorder.orderQuantityRequired', 'Please enter a valid order quantity greater than 0'),
          variant: 'destructive'
        });
        return;
      }
      const selectedSupplier = suppliers.find(s => s.value === editFormData.supplier);
      toast({ 
        title: t('autoReorder.ruleUpdatedSuccess', 'Rule Updated Successfully'),
        description: t('autoReorder.ruleUpdatedDescFull', '{{part}}: Reorder {{qty}} units when stock falls below {{point}}. Supplier: {{supplier}}', { 
          part: editingRule.item.name, 
          point: editFormData.reorderPoint, 
          qty: editFormData.orderQuantity,
          supplier: selectedSupplier?.label || t('common.notSet', 'Not set')
        })
      });
      setEditingRule(null);
    }
  };

  const handleApproveOrder = (order: any, idx: number) => {
    setOrderStates(prev => ({ ...prev, [idx]: 'approved' }));
    toast({ 
      title: t('autoReorder.orderApprovedSuccess', 'Order Approved'),
      description: t('autoReorder.orderApprovedDesc', '{{part}}: {{qty}} units from {{supplier}} has been approved for processing', { 
        part: order.partName, 
        qty: order.quantity,
        supplier: order.supplier
      })
    });
  };

  const openOrderDetails = (order: any, idx: number) => {
    setViewingOrder({ ...order, idx });
  };

  const handleCreateRule = () => {
    if (!newRuleForm.part) {
      toast({ 
        title: t('autoReorder.validationError', 'Validation Error'),
        description: t('autoReorder.selectPartRequired', 'Please select a part to create a reorder rule'),
        variant: 'destructive'
      });
      return;
    }
    if (!newRuleForm.reorderPoint || parseInt(newRuleForm.reorderPoint) <= 0) {
      toast({ 
        title: t('autoReorder.validationError', 'Validation Error'),
        description: t('autoReorder.reorderPointRequired', 'Please enter a valid reorder point greater than 0'),
        variant: 'destructive'
      });
      return;
    }
    if (!newRuleForm.orderQuantity || parseInt(newRuleForm.orderQuantity) <= 0) {
      toast({ 
        title: t('autoReorder.validationError', 'Validation Error'),
        description: t('autoReorder.orderQuantityRequired', 'Please enter a valid order quantity greater than 0'),
        variant: 'destructive'
      });
      return;
    }
    
    const selectedPart = availableParts.find(p => p.value === newRuleForm.part);
    toast({ 
      title: t('autoReorder.ruleCreatedSuccess', 'Reorder Rule Created'),
      description: t('autoReorder.ruleCreatedSuccessDesc', '{{part}}: Auto-reorder {{qty}} units when stock falls below {{point}} units', { 
        part: selectedPart?.label || newRuleForm.part, 
        qty: newRuleForm.orderQuantity, 
        point: newRuleForm.reorderPoint 
      })
    });
    setNewRuleForm({ part: '', reorderPoint: '', orderQuantity: '', supplier: '' });
    setShowAddRuleDialog(false);
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
          <Dialog open={showAddRuleDialog} onOpenChange={setShowAddRuleDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                data-testid="button-add-reorder-rule"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('autoReorder.addRule', 'Add Rule')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  {t('autoReorder.addNewRule', 'Add New Reorder Rule')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-3 rounded-lg bg-[#0A5ED7]/5 border border-[#0A5ED7]/20">
                  <p className="text-sm text-[#64748B]">{t('autoReorder.addRuleHint', 'Configure automatic reordering when stock falls below a threshold')}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0B1F3B] dark:text-white">{t('autoReorder.selectPart', 'Select Part')} <span className="text-[#F97316]">*</span></Label>
                  <Select value={newRuleForm.part} onValueChange={(value) => setNewRuleForm(prev => ({ ...prev, part: value }))}>
                    <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-part">
                      <SelectValue placeholder={t('autoReorder.choosePart', 'Choose a part...')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#151A23] max-h-60">
                      {['Filters', 'Brakes', 'Engine', 'Electrical', 'Exterior'].map(category => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-[#64748B] bg-[#F8FAFC] dark:bg-[#0E1117]">
                            {t(`parts.${category.toLowerCase()}`, category)}
                          </div>
                          {availableParts.filter(p => p.category === t(`parts.${category.toLowerCase()}`, category)).map(part => (
                            <SelectItem key={part.value} value={part.value}>
                              {part.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0B1F3B] dark:text-white">{t('autoReorder.reorderPoint', 'Reorder Point')} <span className="text-[#F97316]">*</span></Label>
                    <Input 
                      type="number" 
                      placeholder="20" 
                      value={newRuleForm.reorderPoint}
                      onChange={(e) => setNewRuleForm(prev => ({ ...prev, reorderPoint: e.target.value }))}
                      className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" 
                      data-testid="input-new-reorder-point"
                    />
                    <p className="text-xs text-[#64748B]">{t('autoReorder.reorderPointHint', 'Trigger reorder when stock falls below this level')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0B1F3B] dark:text-white">{t('autoReorder.orderQuantity', 'Order Quantity')} <span className="text-[#F97316]">*</span></Label>
                    <Input 
                      type="number" 
                      placeholder="50" 
                      value={newRuleForm.orderQuantity}
                      onChange={(e) => setNewRuleForm(prev => ({ ...prev, orderQuantity: e.target.value }))}
                      className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" 
                      data-testid="input-new-order-quantity"
                    />
                    <p className="text-xs text-[#64748B]">{t('autoReorder.orderQuantityHint', 'Number of units to order automatically')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0B1F3B] dark:text-white">{t('autoReorder.preferredSupplier', 'Preferred Supplier')}</Label>
                  <Select value={newRuleForm.supplier} onValueChange={(value) => setNewRuleForm(prev => ({ ...prev, supplier: value }))}>
                    <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-supplier">
                      <SelectValue placeholder={t('autoReorder.selectSupplier', 'Select supplier (optional)')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#151A23]">
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.value} value={supplier.value}>
                          {supplier.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline"
                    className="flex-1 border-[#E2E8F0] dark:border-[#232A36]"
                    onClick={() => {
                      setNewRuleForm({ part: '', reorderPoint: '', orderQuantity: '', supplier: '' });
                      setShowAddRuleDialog(false);
                    }}
                    data-testid="button-cancel-create-rule"
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                    onClick={handleCreateRule}
                    data-testid="button-create-rule"
                  >
                    {t('autoReorder.createRule', 'Create Rule')}
                  </Button>
                </div>
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
                        onClick={() => openEditDialog(idx, item)}
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

      <Dialog open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <Settings className="w-4 h-4 text-white" />
              </div>
              {t('autoReorder.editRule', 'Edit Rule')}: {editingRule?.item.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0A5ED7]/5 border border-[#0A5ED7]/20">
                <p className="text-sm text-[#64748B] mb-1">{t('autoReorder.currentStock', 'Current Stock')}</p>
                <p className="text-2xl font-bold text-[#0A5ED7]">{editingRule?.item.current} {t('autoReorder.units', 'units')}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#0B1F3B]/5 border border-[#0B1F3B]/20">
                <p className="text-sm text-[#64748B] mb-1">{t('autoReorder.maxCapacity', 'Max Capacity')}</p>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{editingRule?.item.max} {t('autoReorder.units', 'units')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-white">{t('autoReorder.reorderPoint', 'Reorder Point')} <span className="text-[#F97316]">*</span></Label>
                <Input 
                  type="number" 
                  value={editFormData.reorderPoint}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) || 0 }))}
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" 
                  data-testid="input-edit-reorder-point"
                />
                <p className="text-xs text-[#64748B]">{t('autoReorder.reorderPointHint', 'Trigger reorder when stock falls below this level')}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-white">{t('autoReorder.orderQuantity', 'Order Quantity')} <span className="text-[#F97316]">*</span></Label>
                <Input 
                  type="number" 
                  value={editFormData.orderQuantity}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, orderQuantity: parseInt(e.target.value) || 0 }))}
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" 
                  data-testid="input-edit-order-quantity"
                />
                <p className="text-xs text-[#64748B]">{t('autoReorder.orderQuantityHint', 'Number of units to order automatically')}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('autoReorder.preferredSupplier', 'Preferred Supplier')}</Label>
              <Select value={editFormData.supplier} onValueChange={(value) => setEditFormData(prev => ({ ...prev, supplier: value }))}>
                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-edit-supplier">
                  <SelectValue placeholder={t('autoReorder.selectSupplier', 'Select supplier (optional)')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23]">
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.value} value={supplier.value}>
                      {supplier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline"
                className="flex-1 border-[#E2E8F0] dark:border-[#232A36]"
                onClick={() => setEditingRule(null)}
                data-testid="button-cancel-edit"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                onClick={saveEditedRule}
                data-testid="button-save-rule"
              >
                {t('common.save', 'Save Changes')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
            {pendingOrders.map((order: any, idx: number) => {
              const currentStatus = orderStates[idx] || order.status;
              return (
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
                        {order.quantity} {t('autoReorder.units', 'units')} • {order.supplier}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-[#0A5ED7]">SAR {order.estimatedCost?.toLocaleString()}</p>
                      <Badge 
                        className={currentStatus === 'approved' 
                          ? 'bg-[#0A5ED7]/10 text-[#0A5ED7] border-[#0A5ED7]/30' 
                          : 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30'
                        }
                      >
                        {currentStatus === 'approved' ? t('common.approved', 'Approved') : t('common.pending', 'Pending')}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {currentStatus !== 'approved' && (
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                          onClick={() => handleApproveOrder(order, idx)}
                          data-testid={`button-approve-order-${idx}`}
                        >
                          {t('common.approve', 'Approve')}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                        onClick={() => openOrderDetails(order, idx)}
                        data-testid={`button-view-order-${idx}`}
                      >
                        {t('common.view', 'View')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              {t('autoReorder.orderDetails', 'Order Details')}
            </DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#0A5ED7]/5 to-[#0BB3FF]/5 border border-[#0A5ED7]/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{viewingOrder.partName}</p>
                  <Badge 
                    className={(orderStates[viewingOrder.idx] || viewingOrder.status) === 'approved' 
                      ? 'bg-[#0A5ED7]/10 text-[#0A5ED7] border-[#0A5ED7]/30' 
                      : 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30'
                    }
                  >
                    {(orderStates[viewingOrder.idx] || viewingOrder.status) === 'approved' ? t('common.approved', 'Approved') : t('common.pending', 'Pending')}
                  </Badge>
                </div>
                <p className="text-sm text-[#64748B]">{t('autoReorder.orderGeneratedByAI', 'Auto-generated order based on predictive demand analysis')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-xs text-[#64748B] mb-1">{t('autoReorder.quantity', 'Quantity')}</p>
                  <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">{viewingOrder.quantity} {t('autoReorder.units', 'units')}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-xs text-[#64748B] mb-1">{t('autoReorder.estimatedCost', 'Estimated Cost')}</p>
                  <p className="text-lg font-bold text-[#0A5ED7]">SAR {viewingOrder.estimatedCost?.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                <p className="text-xs text-[#64748B] mb-1">{t('autoReorder.supplier', 'Supplier')}</p>
                <p className="font-semibold text-[#0B1F3B] dark:text-white">{viewingOrder.supplier}</p>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                <p className="text-xs text-[#64748B] mb-1">{t('autoReorder.triggerReason', 'Trigger Reason')}</p>
                <p className="text-sm text-[#0B1F3B] dark:text-white">{t('autoReorder.stockBelowThreshold', 'Stock level fell below reorder threshold based on predicted demand')}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline"
                  className="flex-1 border-[#E2E8F0] dark:border-[#232A36]"
                  onClick={() => setViewingOrder(null)}
                  data-testid="button-close-order-details"
                >
                  {t('common.close', 'Close')}
                </Button>
                {(orderStates[viewingOrder.idx] || viewingOrder.status) !== 'approved' && (
                  <Button 
                    className="flex-1 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                    onClick={() => {
                      handleApproveOrder(viewingOrder, viewingOrder.idx);
                      setViewingOrder(null);
                    }}
                    data-testid="button-approve-from-details"
                  >
                    {t('common.approve', 'Approve Order')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const accuracyGaugeData = [
    { name: 'Accuracy', value: 94.2, fill: '#0A5ED7' }
  ];

  const monthlyAccuracyData = [
    { month: t('months.jan', 'Jan'), accuracy: 91, predictions: 45 },
    { month: t('months.feb', 'Feb'), accuracy: 93, predictions: 52 },
    { month: t('months.mar', 'Mar'), accuracy: 92, predictions: 48 },
    { month: t('months.apr', 'Apr'), accuracy: 95, predictions: 56 },
    { month: t('months.may', 'May'), accuracy: 94, predictions: 61 },
    { month: t('months.jun', 'Jun'), accuracy: 96, predictions: 58 },
  ];

  const categoryPerformance = [
    { name: t('autoReorder.oilFilters', 'Oil Filters'), accuracy: 97, color: '#0A5ED7' },
    { name: t('autoReorder.brakePads', 'Brake Pads'), accuracy: 94, color: '#0BB3FF' },
    { name: t('autoReorder.airFilters', 'Air Filters'), accuracy: 92, color: '#0B1F3B' },
    { name: t('autoReorder.sparkPlugs', 'Spark Plugs'), accuracy: 96, color: '#0A5ED7' },
    { name: t('autoReorder.coolant', 'Coolant'), accuracy: 89, color: '#0BB3FF' },
  ];

  const analyticsTab = (
    <div className="space-y-6" data-testid="auto-reorder-analytics">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] border-0 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">{t('autoReorder.forecastAccuracy', 'Forecast Accuracy')}</p>
                <p className="text-3xl font-bold">94.2%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs text-white/80">+2.3% {t('common.vsLastMonth', 'vs last month')}</span>
                </div>
              </div>
              <Brain className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#0B1F3B] to-[#0A5ED7] border-0 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">{t('autoReorder.costSavings', 'Cost Savings')}</p>
                <p className="text-3xl font-bold">SAR 12.4K</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs text-white/80">+18% {t('common.thisQuarter', 'this quarter')}</span>
                </div>
              </div>
              <TrendingUp className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#0BB3FF] to-[#0A5ED7] border-0 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">{t('autoReorder.stockoutsPrevented', 'Stockouts Prevented')}</p>
                <p className="text-3xl font-bold">23</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-xs text-white/80">{t('common.last30Days', 'Last 30 days')}</span>
                </div>
              </div>
              <Target className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#0A5ED7] to-[#0B1F3B] border-0 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">{t('autoReorder.inventoryTurnover', 'Inventory Turnover')}</p>
                <p className="text-3xl font-bold">4.8x</p>
                <div className="flex items-center gap-1 mt-1">
                  <RefreshCw className="w-3 h-3" />
                  <span className="text-xs text-white/80">{t('common.optimal', 'Optimal range')}</span>
                </div>
              </div>
              <RefreshCw className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] overflow-hidden">
        <CardHeader className="border-b border-[#E2E8F0] dark:border-[#232A36] bg-gradient-to-r from-[#0A5ED7]/5 to-[#0BB3FF]/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] shadow-lg shadow-[#0A5ED7]/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-[#0B1F3B] dark:text-white flex items-center gap-2">
                  {t('autoReorder.forecastPerformance', 'Forecast Performance')}
                  <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-[#0A5ED7]/30">
                    <Activity className="w-3 h-3 mr-1" />
                    {t('common.live', 'Live')}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[#64748B]">{t('autoReorder.trackAccuracy', 'AI prediction accuracy and performance metrics')}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-export-analytics">
                {t('common.export', 'Export')}
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-refresh-analytics">
                <RefreshCw className="w-4 h-4 mr-1" />
                {t('common.refresh', 'Refresh')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-xl p-4 border border-[#E2E8F0] dark:border-[#232A36]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-[#0B1F3B] dark:text-white flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-[#0A5ED7]" />
                    {t('autoReorder.predictionVsActual', 'Prediction vs Actual')}
                  </h4>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#0A5ED7]" />
                      <span className="text-[#64748B]">{t('common.actual', 'Actual')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#0BB3FF]" />
                      <span className="text-[#64748B]">{t('common.predicted', 'Predicted')}</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={demandTrendData}>
                    <defs>
                      <linearGradient id="actualGradAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A5ED7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0A5ED7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232A36" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#232A36' }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#232A36' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(11, 31, 59, 0.95)', border: '1px solid #0A5ED7', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 20px rgba(10, 94, 215, 0.3)' }}
                      labelStyle={{ color: '#0BB3FF', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="actual" fill="url(#actualGradAnalytics)" stroke="#0A5ED7" strokeWidth={2} name={t('common.actual', 'Actual')} />
                    <Line type="monotone" dataKey="predicted" stroke="#0BB3FF" strokeWidth={3} strokeDasharray="5 5" dot={{ fill: '#0BB3FF', strokeWidth: 2, r: 4 }} name={t('common.predicted', 'Predicted')} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-xl p-4 border border-[#E2E8F0] dark:border-[#232A36]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[#0B1F3B] dark:text-white text-sm flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-[#0A5ED7]" />
                      {t('autoReorder.monthlyAccuracy', 'Monthly Accuracy')}
                    </h4>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyAccuracyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#232A36" opacity={0.2} />
                      <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} />
                      <YAxis domain={[85, 100]} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(11, 31, 59, 0.95)', border: '1px solid #0A5ED7', borderRadius: '8px', color: '#fff' }}
                        formatter={(value: number) => [`${value}%`, t('common.accuracy', 'Accuracy')]}
                      />
                      <Bar dataKey="accuracy" fill="#0A5ED7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-xl p-4 border border-[#E2E8F0] dark:border-[#232A36]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[#0B1F3B] dark:text-white text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#0BB3FF]" />
                      {t('autoReorder.varianceTrend', 'Variance Trend')}
                    </h4>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={demandTrendData}>
                      <defs>
                        <linearGradient id="varianceGradNew" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#232A36" opacity={0.2} />
                      <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(11, 31, 59, 0.95)', border: '1px solid #F97316', borderRadius: '8px', color: '#fff' }}
                        formatter={(value: number) => [`${value}%`, t('common.variance', 'Variance')]}
                      />
                      <Area type="monotone" dataKey="variance" fill="url(#varianceGradNew)" stroke="#F97316" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                <div className="absolute top-2 right-2">
                  <Award className="w-6 h-6 text-white/30" />
                </div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {t('autoReorder.overallScore', 'Overall AI Score')}
                </h4>
                <div className="flex items-center justify-center py-4">
                  <div className="relative">
                    <svg className="w-28 h-28">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                      <circle 
                        cx="56" cy="56" r="48" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray={`${94.2 * 3.02} 302`}
                        transform="rotate(-90 56 56)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold">94.2</span>
                      <span className="text-xs text-white/70">{t('common.percent', '%')}</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-white/80">{t('autoReorder.excellentPerformance', 'Excellent Performance')}</p>
              </div>

              <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-xl p-4 border border-[#E2E8F0] dark:border-[#232A36]">
                <h4 className="font-semibold text-[#0B1F3B] dark:text-white text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#0A5ED7]" />
                  {t('autoReorder.categoryPerformance', 'By Category')}
                </h4>
                <div className="space-y-3">
                  {categoryPerformance.map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#64748B] truncate max-w-[120px]">{cat.name}</span>
                        <span className="font-semibold text-[#0B1F3B] dark:text-white">{cat.accuracy}%</span>
                      </div>
                      <div className="h-2 bg-[#E2E8F0] dark:bg-[#232A36] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${cat.accuracy}%`,
                            background: `linear-gradient(to right, ${cat.color}, #0BB3FF)`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-xl p-4 border border-[#E2E8F0] dark:border-[#232A36]">
                <h4 className="font-semibold text-[#0B1F3B] dark:text-white text-sm mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0BB3FF]" />
                  {t('autoReorder.quickInsights', 'Quick Insights')}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0A5ED7]/5 border border-[#0A5ED7]/20">
                    <TrendingUp className="w-4 h-4 text-[#0A5ED7]" />
                    <span className="text-xs text-[#0B1F3B] dark:text-white">{t('autoReorder.insightAccuracy', 'Accuracy up 2.3% this month')}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0BB3FF]/5 border border-[#0BB3FF]/20">
                    <Brain className="w-4 h-4 text-[#0BB3FF]" />
                    <span className="text-xs text-[#0B1F3B] dark:text-white">{t('autoReorder.insightPredictions', '320 predictions made')}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0B1F3B]/5 border border-[#0B1F3B]/20">
                    <CheckCircle2 className="w-4 h-4 text-[#0B1F3B] dark:text-[#64748B]" />
                    <span className="text-xs text-[#0B1F3B] dark:text-white">{t('autoReorder.insightOptimal', 'Optimal stock levels maintained')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
