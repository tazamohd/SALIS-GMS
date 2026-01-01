import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardPage } from "@/components/layouts";
import { TrendingUp, Package, Users, Calendar, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PredictiveDemandForecasting() {
  const { t } = useTranslation();
  const [forecastPeriod, setForecastPeriod] = useState("30");

  const { data: forecastData } = useQuery({
    queryKey: ["/api/forecasting/demand", forecastPeriod],
  });

  const demandForecast = [
    { week: t('demandForecasting.week1', 'Week 1'), predicted: 120, historical: 115, confidence: 95 },
    { week: t('demandForecasting.week2', 'Week 2'), predicted: 135, historical: 128, confidence: 92 },
    { week: t('demandForecasting.week3', 'Week 3'), predicted: 145, historical: 140, confidence: 90 },
    { week: t('demandForecasting.week4', 'Week 4'), predicted: 130, historical: null, confidence: 88 },
  ];

  const partsDemand = [
    { part: t('demandForecasting.oilFilters', 'Oil Filters'), current: 85, forecasted: 120, reorderPoint: 100 },
    { part: t('demandForecasting.brakePads', 'Brake Pads'), current: 45, forecasted: 75, reorderPoint: 60 },
    { part: t('demandForecasting.airFilters', 'Air Filters'), current: 92, forecasted: 95, reorderPoint: 80 },
    { part: t('demandForecasting.sparkPlugs', 'Spark Plugs'), current: 110, forecasted: 140, reorderPoint: 120 },
  ];

  const metrics = [
    {
      label: t('demandForecasting.forecastAccuracy', 'Forecast Accuracy'),
      value: "93.5%",
      icon: TrendingUp,
      color: "text-green-500",
      trend: { value: "+2.5%", isPositive: true },
    },
    {
      label: t('demandForecasting.predictedPeakDay', 'Predicted Peak Day'),
      value: t('demandForecasting.thursday', 'Thursday'),
      icon: Calendar,
      color: "text-[#0A5ED7]",
    },
    {
      label: t('demandForecasting.partsReorderAlerts', 'Parts Reorder Alerts'),
      value: "3",
      icon: Package,
      color: "text-[#F97316]",
    },
    {
      label: t('demandForecasting.avgDailyAppointments', 'Avg Daily Appointments'),
      value: "32",
      icon: Users,
      color: "text-purple-500",
      trend: { value: "+8%", isPositive: true },
    },
  ];

  return (
    <DashboardPage
      title={t('demandForecasting.title', 'Predictive Demand Forecasting')}
      description={t('demandForecasting.description', 'AI-powered forecasting for service demand and inventory planning')}
      icon={TrendingUp}
      metrics={metrics}
    >
      <div className="mb-6">
        <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
          <SelectTrigger className="w-64 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-forecast-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <SelectItem value="7">{t('demandForecasting.next7Days', 'Next 7 Days')}</SelectItem>
            <SelectItem value="30">{t('demandForecasting.next30Days', 'Next 30 Days')}</SelectItem>
            <SelectItem value="90">{t('demandForecasting.next90Days', 'Next 90 Days')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('demandForecasting.serviceDemandForecast', 'Service Demand Forecast')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('demandForecasting.serviceDemandForecastDesc', 'Predicted vs historical appointment demand')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-[#232A36]" />
                <XAxis dataKey="week" stroke="#64748B" />
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
                  dataKey="historical"
                  stroke="#0A5ED7"
                  name={t('demandForecasting.historical', 'Historical')}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#0BB3FF"
                  name={t('demandForecasting.predicted', 'Predicted')}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('demandForecasting.partsInventoryForecast', 'Parts Inventory Forecast')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('demandForecasting.partsInventoryForecastDesc', 'Current stock vs forecasted demand')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={partsDemand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-[#232A36]" />
                <XAxis dataKey="part" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg, #fff)', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="current" fill="#0A5ED7" name={t('demandForecasting.currentStock', 'Current Stock')} />
                <Bar dataKey="forecasted" fill="#0BB3FF" name={t('demandForecasting.forecastedNeed', 'Forecasted Need')} />
                <Bar dataKey="reorderPoint" fill="#F97316" name={t('demandForecasting.reorderPoint', 'Reorder Point')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <AlertTriangle className="h-5 w-5 text-[#F97316]" />
            {t('demandForecasting.reorderRecommendations', 'Reorder Recommendations')}
          </CardTitle>
          <CardDescription className="text-[#64748B]">{t('demandForecasting.reorderRecommendationsDesc', 'Parts requiring attention based on forecasted demand')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {partsDemand
              .filter((part) => part.current < part.reorderPoint)
              .map((part, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-[#F97316]/30 bg-[#F97316]/5 dark:bg-[#F97316]/10 rounded-lg"
                  data-testid={`reorder-alert-${idx}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{part.part}</p>
                      <p className="text-sm text-[#64748B]">
                        {t('demandForecasting.current', 'Current')}: {part.current} {t('demandForecasting.units', 'units')} • {t('demandForecasting.forecastedNeedLabel', 'Forecasted need')}: {part.forecasted} {t('demandForecasting.units', 'units')}
                      </p>
                    </div>
                    <Badge className="bg-[#F97316] text-white hover:bg-[#F97316]/90">
                      {t('demandForecasting.reorder', 'Reorder')} {part.forecasted - part.current} {t('demandForecasting.units', 'units')}
                    </Badge>
                  </div>
                </div>
              ))}
            {partsDemand.filter((part) => part.current < part.reorderPoint).length === 0 && (
              <p className="text-center text-[#64748B] py-4">
                {t('demandForecasting.allPartsStocked', 'All parts are adequately stocked')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('demandForecasting.forecastConfidenceLevels', 'Forecast Confidence Levels')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('demandForecasting.forecastConfidenceLevelsDesc', 'Prediction accuracy by forecast period')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demandForecast.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-sm font-medium w-20 text-[#0B1F3B] dark:text-white">{item.week}</span>
                <div className="flex-1 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] h-2 rounded-full"
                    style={{ width: `${item.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right text-[#0B1F3B] dark:text-white">{item.confidence}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
