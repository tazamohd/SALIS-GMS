import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Wrench,
  FileText,
  Plus,
  Play,
  Download,
  Settings,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { TabsPageLayout, TabConfig } from "@/components/layouts/TabsPageLayout";

const COLORS = ['#0A5ED7', '#0BB3FF', '#64748B', '#94A3B8'];

export default function BusinessIntelligenceDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [createReportOpen, setCreateReportOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    name: "",
    description: "",
    reportType: "revenue",
    schedule: "manual",
  });

  const { data: dashboardMetrics } = useQuery({
    queryKey: ["/api/analytics/dashboard-metrics", selectedPeriod],
  });

  const { data: customReports = [] } = useQuery({
    queryKey: ["/api/analytics/custom-reports"],
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/analytics/custom-reports", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/custom-reports"] });
      toast({
        title: t('bi.reportCreated', 'Report created'),
        description: t('bi.reportCreatedDesc', 'Your custom report has been created successfully.'),
      });
      setCreateReportOpen(false);
      setReportConfig({ name: "", description: "", reportType: "revenue", schedule: "manual" });
    },
  });

  const runReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      return await apiRequest(`/api/analytics/custom-reports/${reportId}/run`, "POST");
    },
    onSuccess: () => {
      toast({
        title: t('bi.reportGenerated', 'Report generated'),
        description: t('bi.reportReadyDownload', 'Your report is ready for download.'),
      });
    },
  });

  const revenueData = [
    { month: t('months.jan', 'Jan'), revenue: 45000, expenses: 32000 },
    { month: t('months.feb', 'Feb'), revenue: 52000, expenses: 35000 },
    { month: t('months.mar', 'Mar'), revenue: 48000, expenses: 33000 },
    { month: t('months.apr', 'Apr'), revenue: 61000, expenses: 38000 },
    { month: t('months.may', 'May'), revenue: 55000, expenses: 36000 },
    { month: t('months.jun', 'Jun'), revenue: 67000, expenses: 40000 },
  ];

  const serviceTypeData = [
    { name: t('services.oilChange', 'Oil Change'), value: 35 },
    { name: t('services.brakeService', 'Brake Service'), value: 25 },
    { name: t('services.tireRotation', 'Tire Rotation'), value: 20 },
    { name: t('services.diagnostics', 'Diagnostics'), value: 15 },
    { name: t('common.other', 'Other'), value: 5 },
  ];

  const kpiCards = [
    {
      title: t('bi.totalRevenue', 'Total Revenue'),
      value: "$328,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: t('bi.activeCustomers', 'Active Customers'),
      value: "1,284",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-[#0A5ED7]",
    },
    {
      title: t('bi.jobCards', 'Job Cards'),
      value: "856",
      change: "-2.1%",
      trend: "down",
      icon: Wrench,
      color: "text-[#F97316]",
    },
    {
      title: t('bi.profitMargin', 'Profit Margin'),
      value: "32.4%",
      change: "+3.7%",
      trend: "up",
      icon: TrendingUp,
      color: "text-[#0BB3FF]",
    },
  ];

  const tabs: TabConfig[] = [
    {
      id: "overview",
      label: t('bi.tabs.overview', 'Overview'),
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi, index) => (
              <Card
                key={index}
                className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid={`card-kpi-${index}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#64748B]">
                        {kpi.title}
                      </p>
                      <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">
                        {kpi.value}
                      </h3>
                      <div className="flex items-center gap-1 mt-2">
                        {kpi.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm ${
                            kpi.trend === "up" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                    <kpi.icon className={`h-12 w-12 ${kpi.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <BarChart3 className="h-5 w-5 text-[#0A5ED7]" />
                {t('bi.revenueVsExpenses', 'Revenue vs Expenses')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0A5ED7" name={t('bi.revenue', 'Revenue')} />
                  <Bar dataKey="expenses" fill="#64748B" name={t('bi.expenses', 'Expenses')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                  <PieChart className="h-5 w-5 text-[#0A5ED7]" />
                  {t('bi.serviceDistribution', 'Service Distribution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={serviceTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                  <TrendingUp className="h-5 w-5 text-[#0A5ED7]" />
                  {t('bi.topPerformers', 'Top Performers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[#64748B]">
                        {t('bi.bestTechnician', 'Best Technician')}
                      </span>
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">
                        John Smith
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[#64748B]">
                        {t('bi.revenueGenerated', 'Revenue Generated')}
                      </span>
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">
                        $48,500
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[#64748B]">
                        {t('bi.topCustomer', 'Top Customer')}
                      </span>
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">
                        ABC Fleet Services
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[#64748B]">
                        {t('bi.lifetimeValue', 'Lifetime Value')}
                      </span>
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">
                        $125,800
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[#64748B]">
                        {t('bi.mostPopularService', 'Most Popular Service')}
                      </span>
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">
                        {t('services.oilChange', 'Oil Change')}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[#64748B]">
                        {t('bi.jobsThisMonth', 'Jobs This Month')}
                      </span>
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">
                        324
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "reports",
      label: t('bi.tabs.customReports', 'Custom Reports'),
      icon: FileText,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <FileText className="h-5 w-5 text-[#0A5ED7]" />
              {t('bi.customReports', 'Custom Reports')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customReports.length === 0 ? (
              <div className="text-center py-12 text-[#64748B]">
                <FileText className="h-12 w-12 mx-auto mb-4 text-[#64748B]" />
                <p>{t('bi.noReportsYet', 'No custom reports created yet.')}</p>
                <Button
                  onClick={() => setCreateReportOpen(true)}
                  className="mt-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90"
                  data-testid="button-create-first-report"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('bi.createFirstReport', 'Create Your First Report')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {customReports.map((report: any) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg"
                    data-testid={`card-report-${report.id}`}
                  >
                    <div>
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                        {report.name}
                      </h3>
                      <p className="text-sm text-[#64748B]">
                        {report.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="capitalize bg-[#0A5ED7]/10 text-[#0A5ED7]">
                          {report.reportType}
                        </Badge>
                        {report.schedule && report.schedule !== "manual" && (
                          <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">
                            <Calendar className="h-3 w-3 mr-1" />
                            {report.schedule}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runReportMutation.mutate(report.id)}
                        disabled={runReportMutation.isPending}
                        className="border-[#E2E8F0] dark:border-[#232A36]"
                        data-testid={`button-run-${report.id}`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {t('bi.run', 'Run')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#E2E8F0] dark:border-[#232A36]"
                        data-testid={`button-download-${report.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "widgets",
      label: t('bi.tabs.widgets', 'Widgets'),
      icon: Settings,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Settings className="h-5 w-5 text-[#0A5ED7]" />
              {t('bi.dashboardWidgets', 'Dashboard Widgets')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#64748B] mb-4">
              {t('bi.customizeWidgetsDesc', 'Customize your dashboard by adding, removing, and rearranging widgets to display the metrics that matter most to you.')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                t('bi.widgets.revenueTracker', 'Revenue Tracker'),
                t('bi.widgets.appointmentCalendar', 'Appointment Calendar'),
                t('bi.widgets.topCustomers', 'Top Customers'),
                t('bi.widgets.inventoryAlerts', 'Inventory Alerts'),
                t('bi.widgets.technicianPerformance', 'Technician Performance'),
                t('bi.widgets.serviceQueue', 'Service Queue')
              ].map((widget, index) => (
                <div
                  key={index}
                  className="p-4 border-2 border-dashed border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center"
                  data-testid={`widget-${index}`}
                >
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{widget}</p>
                  <Button variant="outline" size="sm" className="mt-2 border-[#E2E8F0] dark:border-[#232A36]">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('bi.addWidget', 'Add Widget')}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <>
      <TabsPageLayout
        title={t('bi.title', '📊 Business Intelligence')}
        description={t('bi.description', 'Advanced analytics and custom reporting')}
        icon={BarChart3}
        tabs={tabs}
        defaultTab="overview"
        secondaryActions={[
          {
            label: selectedPeriod,
            onClick: () => {},
            variant: "outline",
          },
        ]}
        primaryAction={{
          label: t('bi.createReport', 'Create Report'),
          onClick: () => setCreateReportOpen(true),
          icon: Plus,
          variant: "default",
        }}
        headerContent={
          <div className="flex justify-end mb-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="week">{t('bi.periods.last7Days', 'Last 7 Days')}</SelectItem>
                <SelectItem value="month">{t('bi.periods.last30Days', 'Last 30 Days')}</SelectItem>
                <SelectItem value="quarter">{t('bi.periods.lastQuarter', 'Last Quarter')}</SelectItem>
                <SelectItem value="year">{t('bi.periods.lastYear', 'Last Year')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Dialog open={createReportOpen} onOpenChange={setCreateReportOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('bi.createCustomReport', 'Create Custom Report')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-name" className="text-[#0B1F3B] dark:text-white">{t('bi.reportName', 'Report Name')}</Label>
              <Input
                id="report-name"
                value={reportConfig.name}
                onChange={(e) =>
                  setReportConfig({ ...reportConfig, name: e.target.value })
                }
                placeholder={t('bi.reportNamePlaceholder', 'e.g., Monthly Revenue Analysis')}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-report-name"
              />
            </div>
            <div>
              <Label htmlFor="report-description" className="text-[#0B1F3B] dark:text-white">{t('bi.reportDescription', 'Description')}</Label>
              <Textarea
                id="report-description"
                value={reportConfig.description}
                onChange={(e) =>
                  setReportConfig({ ...reportConfig, description: e.target.value })
                }
                placeholder={t('bi.reportDescriptionPlaceholder', 'Describe what this report tracks')}
                rows={3}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="textarea-report-description"
              />
            </div>
            <div>
              <Label htmlFor="report-type" className="text-[#0B1F3B] dark:text-white">{t('bi.reportType', 'Report Type')}</Label>
              <Select
                value={reportConfig.reportType}
                onValueChange={(value) =>
                  setReportConfig({ ...reportConfig, reportType: value })
                }
              >
                <SelectTrigger id="report-type" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="revenue">{t('bi.reportTypes.revenueAnalysis', 'Revenue Analysis')}</SelectItem>
                  <SelectItem value="expenses">{t('bi.reportTypes.expenseTracking', 'Expense Tracking')}</SelectItem>
                  <SelectItem value="inventory">{t('bi.reportTypes.inventoryReport', 'Inventory Report')}</SelectItem>
                  <SelectItem value="performance">{t('bi.reportTypes.performanceMetrics', 'Performance Metrics')}</SelectItem>
                  <SelectItem value="custom">{t('bi.reportTypes.customQuery', 'Custom Query')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-schedule" className="text-[#0B1F3B] dark:text-white">{t('bi.schedule', 'Schedule')}</Label>
              <Select
                value={reportConfig.schedule}
                onValueChange={(value) =>
                  setReportConfig({ ...reportConfig, schedule: value })
                }
              >
                <SelectTrigger id="report-schedule" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-report-schedule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="manual">{t('bi.schedules.manual', 'Manual (Run on demand)')}</SelectItem>
                  <SelectItem value="daily">{t('bi.schedules.daily', 'Daily')}</SelectItem>
                  <SelectItem value="weekly">{t('bi.schedules.weekly', 'Weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('bi.schedules.monthly', 'Monthly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateReportOpen(false)}
              className="border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="button-cancel-report"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={() => createReportMutation.mutate(reportConfig)}
              disabled={!reportConfig.name || createReportMutation.isPending}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90"
              data-testid="button-save-report"
            >
              {createReportMutation.isPending ? t('bi.creating', 'Creating...') : t('bi.createReport', 'Create Report')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
