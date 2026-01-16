import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Search,
  Target,
  Lightbulb,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

export default function CustomerLTVAnalysis() {
  const { t } = useTranslation();
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: ltvData = [] } = useQuery({
    queryKey: ["/api/analytics/customer-ltv", riskFilter],
  });

  const ltvSegments = [
    { segment: "High Value", count: 45, avgLTV: 245000, totalRevenue: 11025000 },
    { segment: "Medium Value", count: 128, avgLTV: 85000, totalRevenue: 10880000 },
    { segment: "Low Value", count: 342, avgLTV: 25000, totalRevenue: 8550000 },
    { segment: "New Customers", count: 89, avgLTV: 8500, totalRevenue: 756500 },
  ];

  const customers = [
    {
      id: "1",
      name: "ABC Fleet Services",
      totalRevenue: 125800,
      visits: 48,
      avgOrderValue: 2621,
      firstVisit: "2022-01-15",
      lastVisit: "2024-10-20",
      predictedLTV: 245000,
      retentionRisk: "low",
      retentionScore: 92,
      churnProbability: 8,
      recommendedAction: "Offer premium maintenance package",
    },
    {
      id: "2",
      name: "Smith Auto Group",
      totalRevenue: 98500,
      visits: 32,
      avgOrderValue: 3078,
      firstVisit: "2021-06-22",
      lastVisit: "2024-10-18",
      predictedLTV: 185000,
      retentionRisk: "low",
      retentionScore: 88,
      churnProbability: 12,
      recommendedAction: "Continue excellent service",
    },
    {
      id: "3",
      name: "Johnson Motors",
      totalRevenue: 45300,
      visits: 18,
      avgOrderValue: 2517,
      firstVisit: "2023-03-10",
      lastVisit: "2024-09-05",
      predictedLTV: 98000,
      retentionRisk: "medium",
      retentionScore: 65,
      churnProbability: 35,
      recommendedAction: "Send personalized re-engagement offer",
    },
    {
      id: "4",
      name: "Davis Transport",
      totalRevenue: 87200,
      visits: 12,
      avgOrderValue: 7267,
      firstVisit: "2020-11-08",
      lastVisit: "2024-04-22",
      predictedLTV: 152000,
      retentionRisk: "high",
      retentionScore: 42,
      churnProbability: 58,
      recommendedAction: "Urgent: Schedule follow-up call",
    },
  ];

  const scatterData = customers.map(c => ({
    x: c.visits,
    y: c.avgOrderValue,
    z: c.predictedLTV / 1000,
    name: c.name,
    risk: c.retentionRisk,
  }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-[#0A5ED7]";
      case "medium":
        return "text-[#F97316]";
      case "high":
        return "text-[#F97316]";
      default:
        return "text-[#64748B]";
    }
  };

  const getRiskBadge = (risk: string) => {
    const variants: Record<string, any> = {
      low: "default",
      medium: "secondary",
      high: "destructive",
    };
    return (
      <Badge variant={variants[risk] || "secondary"} className="capitalize">
        {risk} Risk
      </Badge>
    );
  };

  const summaryCards = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-customers">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('customers.ltv.totalCustomers', 'Total Customers')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">604</h3>
              <p className="text-sm text-[#0A5ED7] mt-1">+23 this month</p>
            </div>
            <Users className="h-12 w-12 text-[#0A5ED7]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-avg-ltv">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('customers.ltv.avgLTV', 'Avg LTV')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">$51,600</h3>
              <p className="text-sm text-[#0A5ED7] mt-1">+8.5% vs last year</p>
            </div>
            <DollarSign className="h-12 w-12 text-[#0A5ED7]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-high-risk">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('customers.ltv.highRisk', 'High Risk')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">42</h3>
              <p className="text-sm text-[#F97316] mt-1">{t('customers.ltv.needAttention', 'Need attention')}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-[#F97316]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-retention-rate">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('customers.ltv.retentionRate', 'Retention Rate')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">87.3%</h3>
              <p className="text-sm text-[#0A5ED7] mt-1">+2.1% improvement</p>
            </div>
            <CheckCircle className="h-12 w-12 text-[#0A5ED7]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ltvSegmentsChart = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.ltv.segmentsByLTV', 'Customer Segments by LTV')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ltvSegments}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="segment" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#0A5ED7" name="Customer Count" />
            <Bar yAxisId="right" dataKey="avgLTV" fill="#0BB3FF" name="Avg LTV ($)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const allCustomersTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input
              placeholder={t('customers.searchPlaceholder', 'Search customers...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="input-search-customers"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
              data-testid={`customer-${customer.id}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                    {customer.name}
                  </h3>
                  {getRiskBadge(customer.retentionRisk)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-[#64748B]">
                  <div>
                    <span className="font-medium">{t('customers.ltv.revenue', 'Revenue:')} </span>${customer.totalRevenue.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">{t('customers.ltv.visits', 'Visits:')} </span>{customer.visits}
                  </div>
                  <div>
                    <span className="font-medium">{t('customers.ltv.avgOrder', 'Avg Order:')} </span>${customer.avgOrderValue.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">{t('customers.ltv.lastVisit', 'Last Visit:')} </span>{new Date(customer.lastVisit).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                  ${customer.predictedLTV.toLocaleString()}
                </p>
                <p className="text-xs text-[#64748B]">{t('customers.ltv.predictedLTV', 'Predicted LTV')}</p>
                <p className={`text-sm font-medium mt-1 ${getRiskColor(customer.retentionRisk)}`}>
                  {customer.retentionScore}% retention
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const highValueTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.ltv.highValueCustomers', 'High Value Customers (Top 10%)')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[#64748B] mb-4">
          {t('customers.ltv.highValueDescription', 'These customers represent your most valuable relationships. Focus on retention and expansion opportunities.')}
        </p>
        <div className="space-y-3">
          {customers.filter(c => c.predictedLTV > 150000).map((customer) => (
            <div
              key={customer.id}
              className="p-4 border-2 border-[#0A5ED7]/30 rounded-lg bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10"
              data-testid={`high-value-${customer.id}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{customer.name}</h3>
                  <p className="text-sm text-[#64748B] mt-1">
                    LTV: ${customer.predictedLTV.toLocaleString()} | {customer.visits} visits
                  </p>
                  <p className="text-sm text-[#0A5ED7] mt-2 font-medium">
                    ✓ {customer.recommendedAction}
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">VIP</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const atRiskTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
          <AlertTriangle className="h-5 w-5 text-[#F97316]" />
          {t('customers.ltv.atRiskCustomers', 'At-Risk Customers')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[#64748B] mb-4">
          {t('customers.ltv.atRiskDescription', 'These customers show signs of potential churn. Immediate action recommended.')}
        </p>
        <div className="space-y-3">
          {customers.filter(c => c.retentionRisk === "high" || c.retentionRisk === "medium").map((customer) => (
            <div
              key={customer.id}
              className="p-4 border-2 border-[#F97316]/30 rounded-lg bg-[#F97316]/5 dark:bg-[#F97316]/10"
              data-testid={`at-risk-${customer.id}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{customer.name}</h3>
                    {getRiskBadge(customer.retentionRisk)}
                  </div>
                  <p className="text-sm text-[#64748B]">
                    Churn Probability: {customer.churnProbability}% | Last visit: {new Date(customer.lastVisit).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-[#F97316] mt-2 font-medium">
                    → {customer.recommendedAction}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`button-action-${customer.id}`}>
                  {t('customers.ltv.takeAction', 'Take Action')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const insightsTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.ltv.insights', 'Customer Value Insights')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="Visits" />
            <YAxis type="number" dataKey="y" name="Avg Order Value" />
            <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Predicted LTV" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Customers" data={scatterData} fill="#0A5ED7" />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
            <h4 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">{t('customers.ltv.keyFinding', 'Key Finding')}</h4>
            <p className="text-sm text-[#64748B]">
              {t('customers.ltv.keyFindingText', 'Customers with 20+ visits have 3.2x higher lifetime value')}
            </p>
          </div>
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
            <h4 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">{t('customers.ltv.recommendation', 'Recommendation')}</h4>
            <p className="text-sm text-[#64748B]">
              {t('customers.ltv.recommendationText', 'Focus retention efforts on customers with 5-15 visits')}
            </p>
          </div>
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
            <h4 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">{t('customers.ltv.opportunity', 'Opportunity')}</h4>
            <p className="text-sm text-[#64748B]">
              {t('customers.ltv.opportunityText', '42 customers at risk represent $6.4M potential loss')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TabsPageLayout
      title={t('customers.ltv.title', '📈 Customer Lifetime Value')}
      description={t('customers.ltv.description', 'Predict customer value and identify retention risks')}
      icon={TrendingUp}
      secondaryActions={[
        {
          label: riskFilter === "all" ? t('customers.ltv.riskFilters.allCustomers', 'All Customers') : riskFilter === "low" ? t('customers.ltv.riskFilters.lowRisk', 'Low Risk') : riskFilter === "medium" ? t('customers.ltv.riskFilters.mediumRisk', 'Medium Risk') : t('customers.ltv.riskFilters.highRisk', 'High Risk'),
          icon: Target,
          onClick: () => {},
          variant: "outline",
          testId: "select-risk-filter",
        }
      ]}
      headerContent={
        <div className="space-y-6">
          <div className="flex justify-end">
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40" data-testid="select-risk-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('customers.ltv.riskFilters.allCustomers', 'All Customers')}</SelectItem>
                <SelectItem value="low">{t('customers.ltv.riskFilters.lowRisk', 'Low Risk')}</SelectItem>
                <SelectItem value="medium">{t('customers.ltv.riskFilters.mediumRisk', 'Medium Risk')}</SelectItem>
                <SelectItem value="high">{t('customers.ltv.riskFilters.highRisk', 'High Risk')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {summaryCards}
          {ltvSegmentsChart}
        </div>
      }
      tabs={[
        {
          id: "all",
          label: t('customers.ltv.tabs.allCustomers', 'All Customers'),
          icon: Users,
          content: allCustomersTab,
        },
        {
          id: "high-value",
          label: t('customers.ltv.tabs.highValue', 'High Value'),
          icon: TrendingUp,
          content: highValueTab,
        },
        {
          id: "at-risk",
          label: t('customers.ltv.tabs.atRisk', 'At Risk'),
          icon: AlertTriangle,
          content: atRiskTab,
        },
        {
          id: "insights",
          label: t('customers.ltv.tabs.insights', 'Insights'),
          icon: Lightbulb,
          content: insightsTab,
        },
      ]}
      defaultTab="all"
    />
  );
}
