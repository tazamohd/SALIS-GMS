import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AnalyticsPage } from "@/components/layouts";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NeuralNetworkPrediction() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("7d");
  const [predictionType, setPredictionType] = useState("demand");

  const { data: predictions } = useQuery({
    queryKey: ["/api/ai/predictions", { timeRange, predictionType }],
  });

  const { data: accuracy } = useQuery({
    queryKey: ["/api/ai/accuracy"],
  });

  const demandData = [
    { day: t('neuralNetwork.mon', 'Mon'), predicted: 45, actual: 42 },
    { day: t('neuralNetwork.tue', 'Tue'), predicted: 52, actual: 55 },
    { day: t('neuralNetwork.wed', 'Wed'), predicted: 48, actual: 46 },
    { day: t('neuralNetwork.thu', 'Thu'), predicted: 60, actual: 58 },
    { day: t('neuralNetwork.fri', 'Fri'), predicted: 72, actual: 70 },
    { day: t('neuralNetwork.sat', 'Sat'), predicted: 35, actual: 38 },
    { day: t('neuralNetwork.sun', 'Sun'), predicted: 28, actual: 25 },
  ];

  const partsDemandData = [
    { part: t('neuralNetwork.oilFilters', 'Oil Filters'), forecast: 120, current: 95 },
    { part: t('neuralNetwork.brakePads', 'Brake Pads'), forecast: 85, current: 70 },
    { part: t('neuralNetwork.airFilters', 'Air Filters'), forecast: 65, current: 55 },
    { part: t('neuralNetwork.sparkPlugs', 'Spark Plugs'), forecast: 90, current: 88 },
    { part: t('neuralNetwork.batteries', 'Batteries'), forecast: 45, current: 40 },
  ];

  const filters = [
    {
      id: "timeRange",
      label: t('neuralNetwork.timeRange', 'Time Range'),
      type: "select" as const,
      options: [
        { value: "7d", label: t('neuralNetwork.last7Days', 'Last 7 Days') },
        { value: "30d", label: t('neuralNetwork.last30Days', 'Last 30 Days') },
        { value: "90d", label: t('neuralNetwork.last90Days', 'Last 90 Days') },
      ],
      value: timeRange,
      onChange: setTimeRange,
    },
    {
      id: "predictionType",
      label: t('neuralNetwork.predictionType', 'Prediction Type'),
      type: "select" as const,
      options: [
        { value: "demand", label: t('neuralNetwork.serviceDemand', 'Service Demand') },
        { value: "parts", label: t('neuralNetwork.partsDemand', 'Parts Demand') },
        { value: "revenue", label: t('neuralNetwork.revenueForecast', 'Revenue Forecast') },
      ],
      value: predictionType,
      onChange: setPredictionType,
    },
  ];

  const sections = [
    {
      title: t('neuralNetwork.serviceDemandForecast', 'Service Demand Forecast'),
      description: t('neuralNetwork.serviceDemandForecastDesc', 'AI-powered prediction of upcoming service demand'),
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={demandData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-[#232A36]" />
            <XAxis dataKey="day" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg, #fff)', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="predicted" stroke="#0A5ED7" name={t('neuralNetwork.predicted', 'Predicted')} strokeWidth={2} />
            <Line type="monotone" dataKey="actual" stroke="#0BB3FF" name={t('neuralNetwork.actual', 'Actual')} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: t('neuralNetwork.partsDemandForecast', 'Parts Demand Forecast'),
      description: t('neuralNetwork.partsDemandForecastDesc', 'Predicted inventory requirements for the next 30 days'),
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={partsDemandData}>
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
            <Bar dataKey="current" fill="#0A5ED7" name={t('neuralNetwork.currentStock', 'Current Stock')} />
            <Bar dataKey="forecast" fill="#0BB3FF" name={t('neuralNetwork.forecastedNeed', 'Forecasted Need')} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: t('neuralNetwork.modelAccuracy', 'Model Accuracy'),
      description: t('neuralNetwork.modelAccuracyDesc', 'Historical accuracy of AI predictions'),
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
            <div>
              <p className="text-sm text-[#64748B]">{t('neuralNetwork.overallAccuracy', 'Overall Accuracy')}</p>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">92.5%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
              <p className="text-sm text-[#64748B]">{t('neuralNetwork.serviceDemand', 'Service Demand')}</p>
              <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">94.2%</p>
            </div>
            <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
              <p className="text-sm text-[#64748B]">{t('neuralNetwork.partsForecast', 'Parts Forecast')}</p>
              <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">90.8%</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const sectionsWithAlert = [
    {
      title: t('neuralNetwork.predictionAlerts', 'Prediction Alerts'),
      description: t('neuralNetwork.predictionAlertsDesc', 'Important forecasts requiring attention'),
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
            <p className="font-medium text-[#0B1F3B] dark:text-white">{t('neuralNetwork.highDemandFriday', 'High demand expected on Friday')}</p>
            <p className="text-sm text-[#64748B]">{t('neuralNetwork.highDemandFridayDesc', 'Predicted 72 service appointments - 40% above average')}</p>
          </div>
          <div className="p-3 bg-[#F97316]/5 dark:bg-[#F97316]/10 border border-[#F97316]/30 rounded-lg">
            <p className="font-medium text-[#0B1F3B] dark:text-white">{t('neuralNetwork.oilFilterLow', 'Oil filter stock running low')}</p>
            <p className="text-sm text-[#64748B]">{t('neuralNetwork.oilFilterLowDesc', 'Current: 95 units, Forecast need: 120 units')}</p>
          </div>
        </div>
      ),
    },
    ...sections,
  ];

  return (
    <AnalyticsPage
      title={t('neuralNetwork.title', 'Neural Network Predictions')}
      description={t('neuralNetwork.description', 'AI-powered forecasting and demand prediction')}
      icon={Brain}
      filters={filters}
      sections={sectionsWithAlert}
    />
  );
}
