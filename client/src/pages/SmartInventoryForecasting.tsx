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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900";
      case "warning": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900";
      case "healthy": return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  const getActionLabel = (status: string) => {
    switch (status) {
      case "critical": return "Reorder Now";
      case "warning": return "Schedule Order";
      case "healthy": return "Monitor";
      default: return "Review";
    }
  };

  const metrics = [
    {
      label: "Forecast Accuracy",
      value: "91.5%",
      icon: Brain,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Critical Items",
      value: "3",
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: "Auto Orders",
      value: "12",
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Cost Savings",
      value: "$4.2K",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <DashboardPage
      title="Smart Inventory Forecasting"
      description="ML-powered demand prediction with automated reordering recommendations"
      icon={Brain}
      metrics={metrics}
    >

      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>8-Week Demand Forecast</CardTitle>
          <CardDescription>
            ML-predicted demand vs. actual consumption with confidence intervals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="demand" 
                stroke="#93C5FD" 
                fill="#DBEAFE" 
                fillOpacity={0.3}
                name="Expected Demand"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#6B7280" 
                strokeWidth={2}
                name="Actual Usage"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#3B82F6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="AI Prediction"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Alerts & Recommendations</CardTitle>
              <CardDescription>
                AI-powered reordering suggestions based on demand forecasts
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-refresh-forecast">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partForecast.map((item, idx) => (
              <Card key={idx} className={`border ${getStatusColor(item.status)}`} data-testid={`card-part-${idx}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white" data-testid={`text-part-name-${idx}`}>
                          {item.part}
                        </h3>
                        <Badge variant="outline" className={getStatusColor(item.status)} data-testid={`badge-part-status-${idx}`}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-part-sku-${idx}`}>
                        SKU: {item.sku}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      variant={item.status === "critical" ? "default" : "outline"}
                      data-testid={`button-action-${idx}`}
                    >
                      {getActionLabel(item.status)}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-current-stock-${idx}`}>
                        {item.current} units
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">8-Week Forecast</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-forecasted-stock-${idx}`}>
                        {item.forecasted} units
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Reorder Point</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-reorder-point-${idx}`}>
                        {item.reorderPoint} units
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Lead Time</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-lead-time-${idx}`}>
                        {item.leadTime} days
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">ML Confidence</span>
                      <span className="font-medium text-gray-900 dark:text-white" data-testid={`text-confidence-${idx}`}>
                        {item.confidence}%
                      </span>
                    </div>
                    <Progress value={item.confidence} className="h-2" data-testid={`progress-confidence-${idx}`} />
                  </div>

                  {item.current < item.reorderPoint && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                      <div className="flex items-start gap-2">
                        <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            AI Recommendation
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Order {Math.max(item.forecasted - item.current + item.reorderPoint, 0)} units 
                            now to avoid stockout. Next peak demand in 2 weeks.
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
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Optimization Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  Reduced Waste
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Prevented $2.1K in obsolete inventory last month
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  Improved Turnover
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Inventory turns increased by 18% with ML forecasting
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  Seasonal Patterns
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI detected 3 seasonal trends affecting brake pad demand
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Automated Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Auto-Reorder Rules
                  </p>
                  <p className="text-xs text-gray-500">Triggered when below threshold</p>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400" data-testid="badge-auto-reorder">
                  Active
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Supplier Alerts
                  </p>
                  <p className="text-xs text-gray-500">Notify on long lead times</p>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400" data-testid="badge-supplier-alerts">
                  Active
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Price Monitoring
                  </p>
                  <p className="text-xs text-gray-500">Track supplier price changes</p>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400" data-testid="badge-price-monitoring">
                  Active
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Demand Alerts
                  </p>
                  <p className="text-xs text-gray-500">Notify on unusual spikes</p>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400" data-testid="badge-demand-alerts">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
