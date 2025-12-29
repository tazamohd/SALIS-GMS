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

  const { data: pendingOrders = [] } = useQuery<any[]>({
    queryKey: ['/api/inventory/pending-orders'],
  });

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
        <Card data-testid="card-critical-stock">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('autoReorder.criticalStock', 'Critical Stock')}</p>
                <p className="text-3xl font-bold text-red-500" data-testid="text-critical-count">{criticalItems.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-low-stock">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('autoReorder.lowStock', 'Low Stock')}</p>
                <p className="text-3xl font-bold text-yellow-500" data-testid="text-lowstock-count">{lowStockItems.length}</p>
              </div>
              <Package className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-pending-orders">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('autoReorder.pendingOrders', 'Pending Orders')}</p>
                <p className="text-3xl font-bold" data-testid="text-pending-count">{pendingOrders.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-forecast-accuracy">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('autoReorder.forecastAccuracy', 'Forecast Accuracy')}</p>
                <p className="text-3xl font-bold text-green-500" data-testid="text-accuracy">94%</p>
              </div>
              <Brain className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('autoReorder.demandForecastVsActual', 'Demand Forecast vs Actual')}
            </CardTitle>
            <CardDescription>{t('autoReorder.aiPredictedDemand', 'AI-predicted demand compared to actual usage')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#10b981" name={t('autoReorder.actual', 'Actual')} strokeWidth={2} />
                <Line type="monotone" dataKey="predicted" stroke="#6366f1" name={t('autoReorder.predicted', 'Predicted')} strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('autoReorder.stockLevels', 'Stock Levels')}
            </CardTitle>
            <CardDescription>{t('autoReorder.currentStockVsReorderPoints', 'Current stock vs reorder points')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockLevelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#10b981" name={t('autoReorder.currentStock', 'Current Stock')} />
                <Bar dataKey="reorder" fill="#f59e0b" name={t('autoReorder.reorderPoint', 'Reorder Point')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {t('autoReorder.aiDemandPredictions', 'AI Demand Predictions')}
            </CardTitle>
            <CardDescription>{t('autoReorder.mlBasedForecasting', 'Machine learning based demand forecasting')}</CardDescription>
          </div>
          <Button 
            onClick={() => runForecastMutation.mutate()} 
            disabled={runForecastMutation.isPending}
            data-testid="button-run-forecast"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${runForecastMutation.isPending ? 'animate-spin' : ''}`} />
            {t('autoReorder.runForecast', 'Run Forecast')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stockLevelData.map((item, idx) => {
              const isLow = item.current <= item.reorder;
              const stockPercent = (item.current / item.max) * 100;
              const daysUntilStockout = Math.floor((item.current / (item.max * 0.1)) * 7);
              
              return (
                <div key={idx} className="p-4 border rounded-lg" data-testid={`forecast-item-${idx}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Package className={`w-5 h-5 ${isLow ? 'text-red-500' : 'text-green-500'}`} />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('autoReorder.unitsInStock', '{{count}} units in stock ({{days}} days supply)', { count: item.current, days: daysUntilStockout })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLow && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {t('autoReorder.reorderNow', 'Reorder Now')}
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {t('autoReorder.demandIncrease', '+12% demand')}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('autoReorder.stockLevel', 'Stock Level')}</span>
                      <span>{stockPercent.toFixed(0)}%</span>
                    </div>
                    <Progress value={stockPercent} className={`h-2 ${isLow ? '[&>div]:bg-red-500' : ''}`} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('autoReorder.min', 'Min')}: {item.min}</span>
                      <span>{t('autoReorder.reorder', 'Reorder')}: {item.reorder}</span>
                      <span>{t('autoReorder.max', 'Max')}: {item.max}</span>
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

  const rulesTab = (
    <div className="space-y-6" data-testid="auto-reorder-rules">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('autoReorder.reorderRules', 'Reorder Rules')}</CardTitle>
            <CardDescription>{t('autoReorder.configureRulesDescription', 'Configure automatic reordering rules for inventory items')}</CardDescription>
          </div>
          <Button data-testid="button-add-reorder-rule">
            <Settings className="w-4 h-4 mr-2" />
            {t('autoReorder.addRule', 'Add Rule')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stockLevelData.map((item, idx) => (
              <div key={idx} className="p-4 border rounded-lg flex items-center justify-between" data-testid={`rule-item-${idx}`}>
                <div className="flex items-center gap-4">
                  <Switch checked={true} data-testid={`switch-rule-active-${idx}`} />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('autoReorder.ruleDescription', 'Reorder {{qty}} units when stock falls below {{threshold}}', { qty: item.reorder * 2, threshold: item.reorder })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{t('autoReorder.autoApproveOff', 'Auto-approve: Off')}</Badge>
                  <Button variant="ghost" size="sm" data-testid={`button-edit-rule-${idx}`}>{t('common.edit', 'Edit')}</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ordersTab = (
    <div className="space-y-6" data-testid="auto-reorder-orders">
      <Card>
        <CardHeader>
          <CardTitle>{t('autoReorder.pendingReplenishmentOrders', 'Pending Replenishment Orders')}</CardTitle>
          <CardDescription>{t('autoReorder.reviewAndApprove', 'Review and approve auto-generated orders')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('autoReorder.noPendingOrders', 'No pending orders')}</p>
            <p className="text-sm">{t('autoReorder.ordersWillAppear', 'Orders will appear here when stock levels trigger reorder rules')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const analyticsTab = (
    <div className="space-y-6" data-testid="auto-reorder-analytics">
      <Card>
        <CardHeader>
          <CardTitle>{t('autoReorder.forecastPerformance', 'Forecast Performance')}</CardTitle>
          <CardDescription>{t('autoReorder.trackAccuracy', 'Track accuracy of AI predictions over time')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={demandTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="variance" fill="#f59e0b" stroke="#f59e0b" name={t('autoReorder.variancePercent', 'Variance %')} />
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
