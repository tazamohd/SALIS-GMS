import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StandardPageLayout } from "@/components/layouts";
import {
  Shield,
  Activity,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  Database,
  Eye,
  ShieldAlert,
  UserX,
  Settings,
} from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  garageId: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface AuditLogResponse {
  entries: AuditEntry[];
  total: number;
}

interface AuditStats {
  total: number;
  last24h: number;
  actionCounts: Record<string, number>;
  resourceCounts: Record<string, number>;
  severityCounts: { low: number; medium: number; high: number; critical: number };
  topUsers: { name: string; count: number }[];
}

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  LOGIN: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  LOGIN_FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  EXPORT: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const severityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AuditTrail() {
  const { toast } = useToast();
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const queryParams = new URLSearchParams();
  if (actionFilter && actionFilter !== "all") queryParams.set("action", actionFilter);
  if (resourceFilter && resourceFilter !== "all") queryParams.set("resource", resourceFilter);
  if (severityFilter && severityFilter !== "all") queryParams.set("severity", severityFilter);
  if (fromDate) queryParams.set("from", new Date(fromDate).toISOString());
  if (toDate) queryParams.set("to", new Date(toDate).toISOString());

  const { data: logData, isLoading: logLoading } = useQuery<AuditLogResponse>({
    queryKey: ["/api/audit/log", actionFilter, resourceFilter, severityFilter, fromDate, toDate],
    queryFn: async () => {
      const res = await fetch(`/api/audit/log?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch audit log");
      return res.json();
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AuditStats>({
    queryKey: ["/api/audit/stats"],
  });

  const seedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/audit/seed"),
    onSuccess: () => {
      toast({ title: "Demo Data Created", description: "Audit trail demo entries have been seeded." });
      queryClient.invalidateQueries({ queryKey: ["/api/audit/log"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit/stats"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to seed demo data.", variant: "destructive" });
    },
  });

  const entries = logData?.entries || [];
  const total = logData?.total || 0;

  const failedLogins = entries.filter((e) => e.action === "LOGIN_FAILED");
  const highSeverity = entries.filter((e) => e.severity === "high" || e.severity === "critical");
  const roleChanges = entries.filter(
    (e) => e.resource === "user" && e.action === "UPDATE" && e.details.toLowerCase().includes("role")
  );

  return (
    <StandardPageLayout title="Audit Trail & Security" description="Monitor system activity, track changes, and review security events" icon={Shield}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {total} total entries
          </Badge>
        </div>
        <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} variant="outline" size="sm">
          <Database className="w-4 h-4 mr-2" />
          Seed Demo Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last 24h</p>
                <p className="text-2xl font-bold">{stats?.last24h || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Events</p>
                <p className="text-2xl font-bold">{stats?.severityCounts?.critical || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Severity</p>
                <p className="text-2xl font-bold">{stats?.severityCounts?.high || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="log" className="space-y-4">
        <TabsList>
          <TabsTrigger value="log">Audit Log</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* ===== AUDIT LOG TAB ===== */}
        <TabsContent value="log" className="space-y-4">
          {/* Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Action</label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="CREATE">Create</SelectItem>
                      <SelectItem value="UPDATE">Update</SelectItem>
                      <SelectItem value="DELETE">Delete</SelectItem>
                      <SelectItem value="LOGIN">Login</SelectItem>
                      <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                      <SelectItem value="EXPORT">Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Resource</label>
                  <Select value={resourceFilter} onValueChange={setResourceFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Resources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      <SelectItem value="auth">Auth</SelectItem>
                      <SelectItem value="job_card">Job Card</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="settings">Settings</SelectItem>
                      <SelectItem value="purchase_order">Purchase Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Severity</label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">From</label>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-[150px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">To</label>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-[150px]" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActionFilter("all");
                    setResourceFilter("all");
                    setSeverityFilter("all");
                    setFromDate("");
                    setToDate("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Table */}
          <Card>
            <CardContent className="p-0">
              {logLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading audit log...</div>
              ) : entries.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No audit entries found</p>
                  <p className="text-sm mt-1">Click "Seed Demo Data" to populate sample entries.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium">Timestamp</th>
                        <th className="text-left p-3 font-medium">User</th>
                        <th className="text-left p-3 font-medium">Action</th>
                        <th className="text-left p-3 font-medium">Resource</th>
                        <th className="text-left p-3 font-medium">Details</th>
                        <th className="text-left p-3 font-medium">Severity</th>
                        <th className="text-left p-3 font-medium">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 whitespace-nowrap text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 font-medium">{entry.userName}</td>
                          <td className="p-3">
                            <Badge className={actionColors[entry.action] || "bg-gray-100 text-gray-800"} variant="secondary">
                              {entry.action}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className="capitalize">{entry.resource.replace(/_/g, " ")}</span>
                            <span className="text-muted-foreground ml-1 text-xs">({entry.resourceId})</span>
                          </td>
                          <td className="p-3 max-w-[300px] truncate">{entry.details}</td>
                          <td className="p-3">
                            <Badge className={severityColors[entry.severity]} variant="secondary">
                              {entry.severity}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground font-mono text-xs">{entry.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== STATISTICS TAB ===== */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Top Actions (Last 24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && Object.keys(stats.actionCounts).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(stats.actionCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([action, count]) => {
                        const max = Math.max(...Object.values(stats.actionCounts));
                        const pct = max > 0 ? (count / max) * 100 : 0;
                        return (
                          <div key={action} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{action}</span>
                              <span className="text-muted-foreground">{count}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No activity in the last 24 hours.</p>
                )}
              </CardContent>
            </Card>

            {/* Top Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Top Resources (Last 24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && Object.keys(stats.resourceCounts).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(stats.resourceCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([resource, count]) => {
                        const max = Math.max(...Object.values(stats.resourceCounts));
                        const pct = max > 0 ? (count / max) * 100 : 0;
                        return (
                          <div key={resource} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium capitalize">{resource.replace(/_/g, " ")}</span>
                              <span className="text-muted-foreground">{count}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No activity in the last 24 hours.</p>
                )}
              </CardContent>
            </Card>

            {/* Severity Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Severity Breakdown (Last 24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="space-y-3">
                    {(["low", "medium", "high", "critical"] as const).map((sev) => {
                      const count = stats.severityCounts[sev];
                      const total = stats.last24h || 1;
                      const pct = (count / total) * 100;
                      const colors: Record<string, string> = {
                        low: "bg-green-500",
                        medium: "bg-yellow-500",
                        high: "bg-orange-500",
                        critical: "bg-red-500",
                      };
                      return (
                        <div key={sev} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium capitalize">{sev}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${colors[sev]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                )}
              </CardContent>
            </Card>

            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Most Active Users (Last 24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && stats.topUsers.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topUsers.map((user, idx) => (
                      <div key={user.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                            {idx + 1}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <Badge variant="secondary">{user.count} actions</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No user activity in the last 24 hours.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== SECURITY TAB ===== */}
        <TabsContent value="security" className="space-y-4">
          {/* Failed Logins */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserX className="w-4 h-4 text-red-500" />
                Recent Failed Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {failedLogins.length > 0 ? (
                <div className="space-y-2">
                  {failedLogins.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="font-medium text-sm">{entry.userName}</p>
                          <p className="text-xs text-muted-foreground">{entry.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                        <p className="text-xs font-mono text-muted-foreground">{entry.ipAddress}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No failed login attempts found.</p>
              )}
            </CardContent>
          </Card>

          {/* High Severity Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                High & Critical Severity Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {highSeverity.length > 0 ? (
                <div className="space-y-2">
                  {highSeverity.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="font-medium text-sm">
                            {entry.userName} - {entry.action}
                          </p>
                          <p className="text-xs text-muted-foreground">{entry.details}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={severityColors[entry.severity]} variant="secondary">
                          {entry.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No high severity events found.</p>
              )}
            </CardContent>
          </Card>

          {/* Role Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-500" />
                Role & Permission Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roleChanges.length > 0 ? (
                <div className="space-y-2">
                  {roleChanges.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{entry.userName}</p>
                          <p className="text-xs text-muted-foreground">{entry.details}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No role changes found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardPageLayout>
  );
}
