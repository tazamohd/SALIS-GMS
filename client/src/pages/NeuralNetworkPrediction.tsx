import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AnalyticsPage } from "@/components/layouts";
import { Brain, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PredictionResponse {
  type: "demand" | "parts" | "revenue";
  data: Array<Record<string, any>>;
}

interface AccuracyResponse {
  overall: number;
  byCategory: { serviceDemand: number; partsForecast: number; revenueForecast: number };
  samples: number;
}

export default function NeuralNetworkPrediction() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("7d");
  const [predictionType, setPredictionType] = useState("demand");

  const { data: predictions, isLoading: predictionsLoading } = useQuery<PredictionResponse>({
    queryKey: [`/api/ai/predictions?timeRange=${timeRange}&predictionType=${predictionType}`],
  });

  const { data: accuracy } = useQuery<AccuracyResponse>({
    queryKey: ["/api/ai/accuracy"],
  });

  const demandSeries = predictions?.type === "demand" ? predictions.data : [];
  const partsSeries = predictions?.type === "parts" ? predictions.data : [];
  const revenueSeries = predictions?.type === "revenue" ? predictions.data : [];

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

  const fmtPct = (n?: number) => (typeof n === "number" ? `${n}%` : "--");

  const sections = [
    {
      title: t('neuralNetwork.serviceDemandForecast', 'Service Demand Forecast'),
      description: t('neuralNetwork.serviceDemandForecastDesc', 'Predicted vs actual service demand over the selected window'),
      content: predictionType === "demand" ? (
        demandSeries.length === 0 ? (
          <p className="text-sm text-[#64748B] py-12 text-center">
            {predictionsLoading
              ? t('common.loading', 'Loading...')
              : t('neuralNetwork.noDemandData', 'No demand data yet — complete some jobs to start predictions.')}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-[#232A36]" />
              <XAxis dataKey="day" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="predicted" stroke="#0A5ED7" name={t('neuralNetwork.predicted', 'Predicted')} strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="#0BB3FF" name={t('neuralNetwork.actual', 'Actual')} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )
      ) : (
        <p className="text-sm text-[#64748B] py-12 text-center">
          {t('neuralNetwork.switchToDemand', 'Switch the prediction type to "Service Demand" to view this chart.')}
        </p>
      ),
    },
    {
      title: t('neuralNetwork.partsDemandForecast', 'Parts Demand Forecast'),
      description: t('neuralNetwork.partsDemandForecastDesc', 'Predicted inventory requirements'),
      content: predictionType === "parts" ? (
        partsSeries.length === 0 ? (
          <p className="text-sm text-[#64748B] py-12 text-center">
            {predictionsLoading ? t('common.loading', 'Loading...') : t('neuralNetwork.noPartsData', 'No parts forecast available yet.')}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={partsSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-[#232A36]" />
              <XAxis dataKey="part" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#0A5ED7" name={t('neuralNetwork.currentStock', 'Current Stock')} />
              <Bar dataKey="forecast" fill="#0BB3FF" name={t('neuralNetwork.forecastedNeed', 'Forecasted Need')} />
            </BarChart>
          </ResponsiveContainer>
        )
      ) : (
        <p className="text-sm text-[#64748B] py-12 text-center">
          {t('neuralNetwork.switchToParts', 'Switch the prediction type to "Parts Demand" to view this chart.')}
        </p>
      ),
    },
    {
      title: t('neuralNetwork.revenueForecast', 'Revenue Forecast'),
      description: t('neuralNetwork.revenueForecastDesc', '3-month revenue projection from historical paid invoices'),
      content: predictionType === "revenue" ? (
        revenueSeries.length === 0 ? (
          <p className="text-sm text-[#64748B] py-12 text-center">
            {predictionsLoading ? t('common.loading', 'Loading...') : t('neuralNetwork.noRevenueData', 'Need at least 2 months of paid invoices to forecast revenue.')}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-[#232A36]" />
              <XAxis dataKey="period" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Legend />
              <Bar dataKey="predicted" fill="#0A5ED7" name={t('neuralNetwork.predicted', 'Predicted')} />
            </BarChart>
          </ResponsiveContainer>
        )
      ) : (
        <p className="text-sm text-[#64748B] py-12 text-center">
          {t('neuralNetwork.switchToRevenue', 'Switch the prediction type to "Revenue Forecast" to view this chart.')}
        </p>
      ),
    },
    {
      title: t('neuralNetwork.modelAccuracy', 'Model Accuracy'),
      description: t('neuralNetwork.modelAccuracyDesc', `Calculated from ${accuracy?.samples ?? 0} recent comparisons`),
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
            <div>
              <p className="text-sm text-[#64748B]">{t('neuralNetwork.overallAccuracy', 'Overall Accuracy')}</p>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-accuracy-overall">
                {fmtPct(accuracy?.overall)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
              <p className="text-sm text-[#64748B]">{t('neuralNetwork.serviceDemand', 'Service Demand')}</p>
              <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">{fmtPct(accuracy?.byCategory?.serviceDemand)}</p>
            </div>
            <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
              <p className="text-sm text-[#64748B]">{t('neuralNetwork.partsForecast', 'Parts Forecast')}</p>
              <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">{fmtPct(accuracy?.byCategory?.partsForecast)}</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnalyticsPage
      title={t('neuralNetwork.title', 'Neural Network Predictions')}
      description={t('neuralNetwork.description', 'Statistical forecasting and demand prediction from your garage data')}
      icon={Brain}
      filters={filters}
      sections={sections}
    />
  );
}
