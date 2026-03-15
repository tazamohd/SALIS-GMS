/**
 * SALIS AUTO - AI Business Intelligence Dashboard
 * Cross-department AI insights, revenue forecasts, and demand predictions.
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { AIInsight, RevenueForecast, DemandPrediction } from "../../../shared/workflows";

export default function AIInsights() {
  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useQuery<AIInsight[]>({
    queryKey: ["/api/ai/insights"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: revenueForecast, isLoading: forecastLoading } = useQuery<RevenueForecast[]>({
    queryKey: ["/api/ai/forecast/revenue"],
    staleTime: 10 * 60 * 1000,
  });

  const { data: demandPredictions, isLoading: demandLoading } = useQuery<DemandPrediction[]>({
    queryKey: ["/api/ai/forecast/demand"],
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Business Intelligence</h1>
          <p className="text-muted-foreground">Cross-department insights powered by AI analysis</p>
        </div>
        <Button onClick={() => refetchInsights()} variant="outline" disabled={insightsLoading}>
          {insightsLoading ? 'Analyzing...' : 'Refresh Insights'}
        </Button>
      </div>

      {/* AI Insights */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        {insightsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6"><div className="h-24 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No insights available yet. AI analysis requires transaction data to generate insights.
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Revenue Forecast */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Revenue Forecast</h2>
        {forecastLoading ? (
          <Card className="animate-pulse"><CardContent className="pt-6"><div className="h-32 bg-muted rounded" /></CardContent></Card>
        ) : revenueForecast && revenueForecast.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueForecast.map((forecast) => (
              <Card key={forecast.period}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{forecast.period}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(forecast.predicted)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(forecast.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Based on: {forecast.factors.join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Insufficient revenue data for forecasting. At least 2 months of invoice data needed.
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Demand Predictions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Service Demand Predictions</h2>
        {demandLoading ? (
          <Card className="animate-pulse"><CardContent className="pt-6"><div className="h-32 bg-muted rounded" /></CardContent></Card>
        ) : demandPredictions && demandPredictions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demandPredictions.map((prediction, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm capitalize">{prediction.serviceType}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{prediction.expectedDemand}</div>
                  <div className="text-sm text-muted-foreground">Expected jobs - {prediction.period}</div>
                  <Badge variant="outline" className="text-xs mt-2">
                    {Math.round(prediction.confidence * 100)}% confidence
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Insufficient job data for demand prediction. At least 1 month of job cards needed.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const impactColors = {
    high: 'border-l-destructive',
    medium: 'border-l-amber-500',
    low: 'border-l-blue-500',
  };

  const categoryIcons: Record<string, string> = {
    revenue: 'Revenue',
    demand: 'Demand',
    parts: 'Inventory',
    workforce: 'HR',
    customer: 'Customer',
    cashflow: 'Cash Flow',
    anomaly: 'Alert',
  };

  return (
    <Card className={`border-l-4 ${impactColors[insight.impact]}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {categoryIcons[insight.category] || insight.category}
            </Badge>
            <Badge
              variant={insight.impact === 'high' ? 'destructive' : 'outline'}
              className="text-xs"
            >
              {insight.impact}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        {insight.actionable && insight.suggestedAction && (
          <div className="bg-muted/50 rounded p-2 text-xs">
            <span className="font-medium">Suggested: </span>
            {insight.suggestedAction}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
