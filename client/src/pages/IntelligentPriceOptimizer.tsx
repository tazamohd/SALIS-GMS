import { useState } from "react";
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
      title: "Price Optimization Trend",
      description: "Historical vs. AI-recommended pricing with demand correlation",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={marketData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#6B7280" 
              strokeWidth={2}
              name="Current Price"
            />
            <Line 
              type="monotone" 
              dataKey="optimized" 
              stroke="#10B981" 
              strokeWidth={2}
              name="AI Optimized"
            />
            <Line 
              type="monotone" 
              dataKey="demand" 
              stroke="#3B82F6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Demand Index"
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Competitive Market Analysis",
      description: "Real-time pricing comparison with local competitors",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={competitorData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="price" fill="#3B82F6" name="Price ($)" />
            <Bar dataKey="volume" fill="#10B981" name="Monthly Volume" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <AnalyticsPage
      title="Intelligent Price Optimizer"
      description="ML-powered dynamic pricing based on demand, competition, and customer behavior"
      icon={Target}
      sections={sections}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20" data-testid="card-optimized-price">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Optimized Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-optimized-price">${optimizedPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20" data-testid="card-revenue-impact">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Impact</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-revenue-impact">
                  +{revenueImpact}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20" data-testid="card-demand-score">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Demand Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-demand-score">94/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20" data-testid="card-market-position">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Market Position</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-market-position">2nd</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Optimization Settings
            </CardTitle>
            <CardDescription>Configure AI pricing parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger data-testid="select-service-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oil-change">Oil Change</SelectItem>
                  <SelectItem value="brake-service">Brake Service</SelectItem>
                  <SelectItem value="tire-rotation">Tire Rotation</SelectItem>
                  <SelectItem value="inspection">Vehicle Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Current Price ($)</Label>
              <Input
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                data-testid="input-current-price"
              />
            </div>

            <div className="space-y-2">
              <Label>Demand Sensitivity</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={demandSensitivity}
                  onValueChange={setDemandSensitivity}
                  max={100}
                  step={1}
                  className="flex-1"
                  data-testid="slider-demand-sensitivity"
                />
                <span className="text-sm font-medium w-12 text-gray-900 dark:text-white" data-testid="text-sensitivity-value">
                  {demandSensitivity[0]}%
                </span>
              </div>
              <p className="text-xs text-gray-500">
                How much price affects customer demand
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Competition Weight</Label>
                <Badge variant="outline" className="w-full justify-center" data-testid="badge-competition-weight">65%</Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Season Factor</Label>
                <Badge variant="outline" className="w-full justify-center" data-testid="badge-season-factor">High</Badge>
              </div>
            </div>

            <Button 
              onClick={handleOptimize}
              className="w-full"
              data-testid="button-optimize-price"
            >
              <Target className="w-4 h-4 mr-2" />
              Run AI Optimization
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>AI Insights & Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Peak Demand Period</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Increase prices by 12% during summer months (May-Aug)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Bundle Opportunity</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customers buying oil changes also need tire rotation (+35%)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Customer Segment</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Premium customers willing to pay 20% more for same-day service
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Base Price</span>
                <span className="font-semibold text-gray-900 dark:text-white">$125</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Market Adjustment</span>
                <span className="font-semibold text-green-600 dark:text-green-400">+$10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Demand Multiplier</span>
                <span className="font-semibold text-green-600 dark:text-green-400">+$8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Competitive Edge</span>
                <span className="font-semibold text-green-600 dark:text-green-400">+$2</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">Optimized Price</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
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
