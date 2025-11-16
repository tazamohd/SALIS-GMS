import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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

const COLORS = ['#000000', '#4B5563', '#6B7280', '#9CA3AF'];

export default function BusinessIntelligenceDashboard() {
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
        title: "Report created",
        description: "Your custom report has been created successfully.",
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
        title: "Report generated",
        description: "Your report is ready for download.",
      });
    },
  });

  const revenueData = [
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 35000 },
    { month: "Mar", revenue: 48000, expenses: 33000 },
    { month: "Apr", revenue: 61000, expenses: 38000 },
    { month: "May", revenue: 55000, expenses: 36000 },
    { month: "Jun", revenue: 67000, expenses: 40000 },
  ];

  const serviceTypeData = [
    { name: "Oil Change", value: 35 },
    { name: "Brake Service", value: 25 },
    { name: "Tire Rotation", value: 20 },
    { name: "Diagnostics", value: 15 },
    { name: "Other", value: 5 },
  ];

  const kpiCards = [
    {
      title: "Total Revenue",
      value: "$328,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Customers",
      value: "1,284",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Job Cards",
      value: "856",
      change: "-2.1%",
      trend: "down",
      icon: Wrench,
      color: "text-orange-600",
    },
    {
      title: "Profit Margin",
      value: "32.4%",
      change: "+3.7%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  const tabs: TabConfig[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi, index) => (
              <Card
                key={index}
                className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800"
                data-testid={`card-kpi-${index}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {kpi.title}
                      </p>
                      <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
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

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue vs Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#000000" name="Revenue" />
                  <Bar dataKey="expenses" fill="#6B7280" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Service Distribution
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

            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Best Technician
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        John Smith
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Revenue Generated
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        $48,500
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Top Customer
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ABC Fleet Services
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Lifetime Value
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        $125,800
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Most Popular Service
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Oil Change
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Jobs This Month
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
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
      label: "Custom Reports",
      icon: FileText,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Custom Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customReports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No custom reports created yet.</p>
                <Button
                  onClick={() => setCreateReportOpen(true)}
                  className="mt-4"
                  data-testid="button-create-first-report"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Report
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {customReports.map((report: any) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                    data-testid={`card-report-${report.id}`}
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {report.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {report.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="capitalize">
                          {report.reportType}
                        </Badge>
                        {report.schedule && report.schedule !== "manual" && (
                          <Badge variant="outline">
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
                        data-testid={`button-run-${report.id}`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
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
      label: "Widgets",
      icon: Settings,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dashboard Widgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Customize your dashboard by adding, removing, and rearranging widgets to display the metrics that matter most to you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Revenue Tracker", "Appointment Calendar", "Top Customers", "Inventory Alerts", "Technician Performance", "Service Queue"].map((widget, index) => (
                <div
                  key={index}
                  className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center"
                  data-testid={`widget-${index}`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">{widget}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
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
        title="📊 Business Intelligence"
        description="Advanced analytics and custom reporting"
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
          label: "Create Report",
          onClick: () => setCreateReportOpen(true),
          icon: Plus,
          variant: "default",
        }}
        headerContent={
          <div className="flex justify-end mb-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Dialog open={createReportOpen} onOpenChange={setCreateReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportConfig.name}
                onChange={(e) =>
                  setReportConfig({ ...reportConfig, name: e.target.value })
                }
                placeholder="e.g., Monthly Revenue Analysis"
                data-testid="input-report-name"
              />
            </div>
            <div>
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                value={reportConfig.description}
                onChange={(e) =>
                  setReportConfig({ ...reportConfig, description: e.target.value })
                }
                placeholder="Describe what this report tracks"
                rows={3}
                data-testid="textarea-report-description"
              />
            </div>
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select
                value={reportConfig.reportType}
                onValueChange={(value) =>
                  setReportConfig({ ...reportConfig, reportType: value })
                }
              >
                <SelectTrigger id="report-type" data-testid="select-report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue Analysis</SelectItem>
                  <SelectItem value="expenses">Expense Tracking</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="performance">Performance Metrics</SelectItem>
                  <SelectItem value="custom">Custom Query</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-schedule">Schedule</Label>
              <Select
                value={reportConfig.schedule}
                onValueChange={(value) =>
                  setReportConfig({ ...reportConfig, schedule: value })
                }
              >
                <SelectTrigger id="report-schedule" data-testid="select-report-schedule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual (Run on demand)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateReportOpen(false)}
              data-testid="button-cancel-report"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createReportMutation.mutate(reportConfig)}
              disabled={!reportConfig.name || createReportMutation.isPending}
              data-testid="button-save-report"
            >
              {createReportMutation.isPending ? "Creating..." : "Create Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
