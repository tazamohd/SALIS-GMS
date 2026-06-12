import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardPage } from "@/components/layouts/DashboardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronRight,
  BarChart3,
  ListChecks,
  FileWarning,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────

interface QCInspection {
  id: string;
  jobCardRef: string;
  vehicleInfo: string;
  serviceType: string;
  inspector: string;
  result: "pass" | "fail" | "conditional" | "pending";
  notes: string;
  completedItems: number;
  totalItems: number;
  inspectionTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

interface QCStats {
  totalInspections: number;
  passed: number;
  failed: number;
  conditional: number;
  pending: number;
  passRate: number;
  reworkRate: number;
  avgInspectionTime: number;
  commonDefects: { category: string; count: number }[];
  trendData: { date: string; pass: number; fail: number; conditional: number }[];
  openDefects: number;
  totalDefects: number;
}

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

interface ChecklistTemplate {
  id: string;
  serviceType: string;
  name: string;
  items: ChecklistItem[];
}

interface QCDefect {
  id: string;
  inspectionId: string;
  jobCardRef: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  resolutionNotes: string;
  reportedBy: string;
  createdAt: string;
  resolvedAt: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getResultBadge(result: string) {
  switch (result) {
    case "pass":
      return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100"><CheckCircle className="w-3 h-3 mr-1" />Pass</Badge>;
    case "fail":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Fail</Badge>;
    case "conditional":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100"><AlertTriangle className="w-3 h-3 mr-1" />Conditional</Badge>;
    case "pending":
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    default:
      return <Badge variant="secondary">{result}</Badge>;
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100">High</Badge>;
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100">Medium</Badge>;
    case "low":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">Low</Badge>;
    default:
      return <Badge variant="secondary">{severity}</Badge>;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "open":
      return <Badge variant="destructive">Open</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100">In Progress</Badge>;
    case "resolved":
      return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">Resolved</Badge>;
    case "closed":
      return <Badge variant="secondary">Closed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Component ──────────────────────────────────────────────────────────────

export default function QualityControl() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inspectionFilter, setInspectionFilter] = useState("all");
  const [defectSeverityFilter, setDefectSeverityFilter] = useState("all");
  const [defectStatusFilter, setDefectStatusFilter] = useState("all");
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());

  // ── Data Fetching ──────────────────────────────────────────────────────

  const { data: statsData, isLoading: statsLoading } = useQuery<QCStats>({
    queryKey: ["/api/qc/stats"],
  });

  const { data: inspectionsData, isLoading: inspectionsLoading } = useQuery<{ inspections: QCInspection[] }>({
    queryKey: ["/api/qc/inspections", inspectionFilter],
  });

  const { data: checklistsData, isLoading: checklistsLoading } = useQuery<{ checklists: ChecklistTemplate[] }>({
    queryKey: ["/api/qc/checklists"],
  });

  const { data: defectsData, isLoading: defectsLoading } = useQuery<{ defects: QCDefect[] }>({
    queryKey: ["/api/qc/defects", defectSeverityFilter, defectStatusFilter],
  });

  const stats = statsData;
  const inspectionsList = inspectionsData?.inspections || [];
  const checklists = checklistsData?.checklists || [];
  const defectsList = defectsData?.defects || [];

  // Client-side filtering
  const filteredInspections = inspectionFilter === "all"
    ? inspectionsList
    : inspectionsList.filter(i => i.result === inspectionFilter);

  const filteredDefects = defectsList.filter(d => {
    if (defectSeverityFilter !== "all" && d.severity !== defectSeverityFilter) return false;
    if (defectStatusFilter !== "all" && d.status !== defectStatusFilter) return false;
    return true;
  });

  const toggleChecklist = (id: string) => {
    setExpandedChecklists(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Metrics ────────────────────────────────────────────────────────────

  const metrics = [
    {
      label: t("qc.totalInspections", "Total Inspections"),
      value: stats?.totalInspections ?? 0,
      icon: ClipboardCheck,
      trend: { value: "+12% this month", isPositive: true },
    },
    {
      label: t("qc.passRate", "Pass Rate"),
      value: `${stats?.passRate ?? 0}%`,
      icon: CheckCircle,
      trend: { value: stats?.passRate && stats.passRate >= 80 ? "On target" : "Below target", isPositive: (stats?.passRate ?? 0) >= 80 },
    },
    {
      label: t("qc.reworkRate", "Rework Rate"),
      value: `${stats?.reworkRate ?? 0}%`,
      icon: TrendingUp,
      trend: { value: stats?.reworkRate && stats.reworkRate <= 15 ? "Acceptable" : "Needs attention", isPositive: (stats?.reworkRate ?? 0) <= 15 },
    },
    {
      label: t("qc.pendingInspections", "Pending Inspections"),
      value: stats?.pending ?? 0,
      icon: Clock,
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <DashboardPage
      title={t("qc.title", "Quality Control & Inspections")}
      description={t("qc.description", "Monitor inspection results, manage QC checklists, and track defect resolution")}
      icon={Shield}
      metrics={metrics}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4 hidden sm:block" />
            {t("qc.tabs.dashboard", "Dashboard")}
          </TabsTrigger>
          <TabsTrigger value="inspections" className="gap-2">
            <ClipboardCheck className="w-4 h-4 hidden sm:block" />
            {t("qc.tabs.inspections", "Inspections")}
          </TabsTrigger>
          <TabsTrigger value="checklists" className="gap-2">
            <ListChecks className="w-4 h-4 hidden sm:block" />
            {t("qc.tabs.checklists", "Checklists")}
          </TabsTrigger>
          <TabsTrigger value="defects" className="gap-2">
            <FileWarning className="w-4 h-4 hidden sm:block" />
            {t("qc.tabs.defects", "Defect Log")}
          </TabsTrigger>
        </TabsList>

        {/* ── Dashboard Tab ─────────────────────────────────────────────── */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pass/Fail Trend Chart */}
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#0B1F3B] dark:text-white">
                  {t("qc.chart.passFailTrend", "Pass/Fail Trend (Last 7 Days)")}
                </CardTitle>
                <CardDescription className="text-[#64748B]">
                  {t("qc.chart.trendDesc", "Daily inspection results breakdown")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-[#64748B]">Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.trendData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748B" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #E2E8F0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="pass" name="Pass" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fail" name="Fail" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="conditional" name="Conditional" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Common Defects */}
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#0B1F3B] dark:text-white">
                  {t("qc.chart.commonDefects", "Common Defect Categories")}
                </CardTitle>
                <CardDescription className="text-[#64748B]">
                  {t("qc.chart.defectsDesc", "Most frequently reported defect types")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-[#64748B]">Loading...</div>
                ) : (
                  <div className="space-y-4">
                    {(stats?.commonDefects || []).map((defect, idx) => {
                      const maxCount = Math.max(...(stats?.commonDefects || []).map(d => d.count), 1);
                      const pct = Math.round((defect.count / maxCount) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#0B1F3B] dark:text-white font-medium">{defect.category}</span>
                            <span className="text-[#64748B]">{defect.count} {defect.count === 1 ? "defect" : "defects"}</span>
                          </div>
                          <div className="w-full bg-[#E2E8F0] dark:bg-[#232A36] rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] h-2.5 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {(!stats?.commonDefects || stats.commonDefects.length === 0) && (
                      <div className="text-center text-[#64748B] py-8">No defect data available</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#0B1F3B] dark:text-white">
                  {t("qc.summary", "Inspection Summary")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30">
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{stats?.passed ?? 0}</div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Passed</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                    <div className="text-3xl font-bold text-red-700 dark:text-red-400">{stats?.failed ?? 0}</div>
                    <div className="text-sm text-red-600 dark:text-red-500 mt-1">Failed</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30">
                    <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats?.conditional ?? 0}</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">Conditional</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30">
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats?.pending ?? 0}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-500 mt-1">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#0B1F3B] dark:text-white">
                  {t("qc.quickStats", "Performance Metrics")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Average Inspection Time</span>
                  <span className="text-[#0B1F3B] dark:text-white font-semibold">{stats?.avgInspectionTime ?? 0} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Open Defects</span>
                  <Badge variant={stats?.openDefects && stats.openDefects > 0 ? "destructive" : "secondary"}>
                    {stats?.openDefects ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Total Defects Logged</span>
                  <span className="text-[#0B1F3B] dark:text-white font-semibold">{stats?.totalDefects ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">First-Pass Yield</span>
                  <span className="text-[#0B1F3B] dark:text-white font-semibold">{stats?.passRate ?? 0}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Inspections Tab ───────────────────────────────────────────── */}
        <TabsContent value="inspections" className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-[#0B1F3B] dark:text-white">
                    {t("qc.inspections.title", "QC Inspections")}
                  </CardTitle>
                  <CardDescription className="text-[#64748B]">
                    {t("qc.inspections.desc", "All quality control inspections with results")}
                  </CardDescription>
                </div>
                <Select value={inspectionFilter} onValueChange={setInspectionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {inspectionsLoading ? (
                <div className="text-center py-8 text-[#64748B]">Loading inspections...</div>
              ) : filteredInspections.length === 0 ? (
                <div className="text-center py-8 text-[#64748B]">No inspections found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Card #</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Inspector</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInspections.map((insp) => (
                        <TableRow key={insp.id}>
                          <TableCell className="font-mono text-sm font-medium text-[#0A5ED7] dark:text-[#0BB3FF]">
                            {insp.jobCardRef}
                          </TableCell>
                          <TableCell className="text-[#0B1F3B] dark:text-white">
                            {insp.vehicleInfo}
                          </TableCell>
                          <TableCell className="text-[#64748B]">{insp.serviceType}</TableCell>
                          <TableCell className="text-[#0B1F3B] dark:text-white">{insp.inspector}</TableCell>
                          <TableCell className="text-[#64748B] text-sm">{formatDate(insp.createdAt)}</TableCell>
                          <TableCell>
                            <span className="text-sm text-[#64748B]">
                              {insp.completedItems}/{insp.totalItems}
                            </span>
                          </TableCell>
                          <TableCell>{getResultBadge(insp.result)}</TableCell>
                          <TableCell className="text-[#64748B]">
                            {insp.inspectionTimeMinutes > 0 ? `${insp.inspectionTimeMinutes} min` : "--"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Checklists Tab ────────────────────────────────────────────── */}
        <TabsContent value="checklists" className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">
                {t("qc.checklists.title", "QC Checklist Templates")}
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                {t("qc.checklists.desc", "Standard quality control checklists by service type")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checklistsLoading ? (
                <div className="text-center py-8 text-[#64748B]">Loading checklists...</div>
              ) : (
                <div className="space-y-3">
                  {checklists.map((checklist) => {
                    const isExpanded = expandedChecklists.has(checklist.id);
                    const requiredCount = checklist.items.filter(i => i.required).length;
                    return (
                      <Collapsible key={checklist.id} open={isExpanded} onOpenChange={() => toggleChecklist(checklist.id)}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#1A2030] cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-[#0A5ED7]" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-[#64748B]" />
                              )}
                              <div>
                                <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{checklist.name}</h3>
                                <p className="text-sm text-[#64748B]">{checklist.serviceType}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary">{checklist.items.length} items</Badge>
                              <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0BB3FF]/10 dark:text-[#0BB3FF] hover:bg-[#0A5ED7]/10">
                                {requiredCount} required
                              </Badge>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-8 mt-2 mb-4 space-y-2">
                            {checklist.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]"
                              >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                                  item.required
                                    ? "border-[#0A5ED7] dark:border-[#0BB3FF]"
                                    : "border-[#CBD5E1] dark:border-[#64748B]"
                                }`}>
                                  {item.required && (
                                    <div className="w-2.5 h-2.5 rounded-sm bg-[#0A5ED7] dark:bg-[#0BB3FF]" />
                                  )}
                                </div>
                                <span className="text-sm text-[#0B1F3B] dark:text-white flex-1">{item.label}</span>
                                {item.required ? (
                                  <Badge variant="outline" className="text-xs border-[#0A5ED7]/30 text-[#0A5ED7] dark:border-[#0BB3FF]/30 dark:text-[#0BB3FF]">Required</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Optional</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Defect Log Tab ────────────────────────────────────────────── */}
        <TabsContent value="defects" className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-[#0B1F3B] dark:text-white">
                    {t("qc.defects.title", "Defect Log")}
                  </CardTitle>
                  <CardDescription className="text-[#64748B]">
                    {t("qc.defects.desc", "Track defects found during quality inspections")}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={defectSeverityFilter} onValueChange={setDefectSeverityFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={defectStatusFilter} onValueChange={setDefectStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {defectsLoading ? (
                <div className="text-center py-8 text-[#64748B]">Loading defects...</div>
              ) : filteredDefects.length === 0 ? (
                <div className="text-center py-8 text-[#64748B]">No defects found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Job Card</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Resolution Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDefects.map((defect) => (
                        <TableRow key={defect.id}>
                          <TableCell className="font-mono text-sm text-[#64748B]">{defect.id}</TableCell>
                          <TableCell className="text-[#0B1F3B] dark:text-white max-w-[250px]">
                            <span className="line-clamp-2">{defect.description}</span>
                          </TableCell>
                          <TableCell>{getSeverityBadge(defect.severity)}</TableCell>
                          <TableCell className="text-[#64748B]">{defect.category}</TableCell>
                          <TableCell className="font-mono text-sm text-[#0A5ED7] dark:text-[#0BB3FF]">
                            {defect.jobCardRef}
                          </TableCell>
                          <TableCell>{getStatusBadge(defect.status)}</TableCell>
                          <TableCell className="text-[#0B1F3B] dark:text-white">{defect.reportedBy}</TableCell>
                          <TableCell className="text-[#64748B] max-w-[200px]">
                            <span className="line-clamp-2">{defect.resolutionNotes || "--"}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}
