/**
 * SALIS AUTO - Operations Command Center
 * Unified real-time dashboard showing all departments at a glance.
 * The "brain" of the garage management system.
 */

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CommandCenterData, AlertItem, WorkflowEvent } from "../../../shared/workflows";

export default function CommandCenter() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery<CommandCenterData>({
    queryKey: ["/api/command-center/live"],
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  });

  // System health monitoring
  const { data: systemHealth } = useQuery<{
    apiResponseTime: number;
    activeConnections: number;
    dbQueryCount: number;
    uptime: number;
  }>({
    queryKey: ["/api/command-center/health"],
    refetchInterval: 15000,
    retry: false,
    queryFn: async () => {
      const start = performance.now();
      const res = await fetch("/api/command-center/health");
      const elapsed = Math.round(performance.now() - start);
      if (!res.ok) return { apiResponseTime: elapsed, activeConnections: 0, dbQueryCount: 0, uptime: 0 };
      const body = await res.json();
      return { ...body, apiResponseTime: elapsed };
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Operations Command Center</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-4 bg-muted rounded w-32" /></CardHeader>
              <CardContent><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Operations Command Center</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load command center data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operations Command Center</h1>
          <p className="text-muted-foreground">Real-time overview across all departments</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Live - Auto-refreshing
        </Badge>
      </div>

      {/* Alerts Section */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert) => (
            <AlertBanner key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* System Health Section */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">
                {systemHealth?.apiResponseTime ?? '--'}
                <span className="text-sm font-normal text-muted-foreground">ms</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">API Response Time</div>
              <div className={`mt-1 h-1.5 rounded-full ${
                (systemHealth?.apiResponseTime ?? 0) < 200 ? 'bg-emerald-500' :
                (systemHealth?.apiResponseTime ?? 0) < 500 ? 'bg-amber-500' : 'bg-red-500'
              }`} style={{ width: `${Math.min(100, ((systemHealth?.apiResponseTime ?? 0) / 10))}%` }} />
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{systemHealth?.activeConnections ?? '--'}</div>
              <div className="text-xs text-muted-foreground mt-1">Active WebSocket Connections</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{systemHealth?.dbQueryCount ?? '--'}</div>
              <div className="text-xs text-muted-foreground mt-1">DB Queries (last min)</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">
                {systemHealth?.uptime ? `${Math.floor(systemHealth.uptime / 3600)}h` : '--'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Service Department */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Service Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{data.service.activeJobs}</span>
              <span className="text-sm text-muted-foreground">Active Jobs</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Pending: </span>
                <span className="font-medium">{data.service.pendingJobs}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Done Today: </span>
                <span className="font-medium text-green-600">{data.service.completedToday}</span>
              </div>
              {data.service.overdueJobs > 0 && (
                <div className="col-span-2">
                  <span className="text-destructive font-medium">{data.service.overdueJobs} overdue</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parts & Inventory */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parts & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{data.parts.stockHealth}%</span>
              <span className="text-sm text-muted-foreground">Stock Health</span>
            </div>
            <Progress value={data.parts.stockHealth} className="h-2" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Low Stock: </span>
                <span className="font-medium text-amber-600">{data.parts.lowStockAlerts}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pending POs: </span>
                <span className="font-medium">{data.parts.pendingPOs}</span>
              </div>
              {data.parts.stockoutCount > 0 && (
                <div className="col-span-2">
                  <span className="text-destructive font-medium">{data.parts.stockoutCount} out of stock</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Finance */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Finance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">
                {new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(data.finance.dailyRevenue)}
              </span>
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div>
                <span className="text-muted-foreground">Monthly: </span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(data.finance.monthlyRevenue)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Outstanding AR: </span>
                <span className="font-medium text-amber-600">
                  {new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(data.finance.outstandingAR)}
                </span>
              </div>
              {data.finance.overdueInvoices > 0 && (
                <div>
                  <span className="text-destructive font-medium">{data.finance.overdueInvoices} overdue invoices</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* HR / Workforce */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Workforce</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{data.hr.totalStaff}</span>
              <span className="text-sm text-muted-foreground">Total Staff</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div>
                <span className="text-muted-foreground">Present Today: </span>
                <span className="font-medium">{data.hr.presentToday || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Attendance: </span>
                <span className="font-medium">{data.hr.attendanceRate > 0 ? `${data.hr.attendanceRate}%` : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Experience */}
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customer Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{data.customer.appointmentsToday}</span>
              <span className="text-sm text-muted-foreground">Today's Appts</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div>
                <span className="text-muted-foreground">Walk-ins: </span>
                <span className="font-medium">{data.customer.walkIns}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Rating: </span>
                <span className="font-medium">{data.customer.avgRating > 0 ? `${data.customer.avgRating}/5` : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {data.recentEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent events. Activity will appear here as the system processes workflows.</p>
            ) : (
              <div className="space-y-3">
                {data.recentEvents.map((event, i) => (
                  <EventItem key={i} event={event} />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function AlertBanner({ alert }: { alert: AlertItem }) {
  const severityStyles: Record<string, { container: string; badge: string; icon: string }> = {
    critical: {
      container: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 animate-pulse',
      badge: 'bg-red-500 text-white hover:bg-red-600',
      icon: '!!!',
    },
    warning: {
      container: 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400',
      badge: 'bg-amber-500 text-white hover:bg-amber-600',
      icon: '!!',
    },
    info: {
      container: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400',
      badge: 'bg-blue-500 text-white hover:bg-blue-600',
      icon: 'i',
    },
  };

  const styles = severityStyles[alert.severity] || severityStyles.info;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-l-4 border ${styles.container}`}>
      <Badge className={`shrink-0 ${styles.badge}`}>
        {alert.severity.toUpperCase()}
      </Badge>
      <Badge variant="outline" className="shrink-0">
        {alert.department}
      </Badge>
      <span className="text-sm font-medium flex-1">{alert.message}</span>
      {alert.severity === 'critical' && (
        <span className="text-xs font-bold text-red-600 dark:text-red-400 shrink-0">REQUIRES ATTENTION</span>
      )}
    </div>
  );
}

function EventItem({ event }: { event: WorkflowEvent }) {
  const typeLabels: Record<string, string> = {
    'job.completed': 'Job Completed',
    'job.assigned': 'Job Assigned',
    'job.started': 'Job Started',
    'appointment.confirmed': 'Appointment Confirmed',
    'appointment.checked_in': 'Customer Checked In',
    'payment.received': 'Payment Received',
    'inventory.low_stock': 'Low Stock Alert',
    'invoice.overdue': 'Invoice Overdue',
    'purchase_order.received': 'PO Received',
    'technician.clock_in': 'Technician Clocked In',
  };

  const label = typeLabels[event.type] || event.type;
  const time = new Date(event.timestamp).toLocaleTimeString();

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground text-xs w-16 shrink-0">{time}</span>
      <Badge variant="outline" className="shrink-0 text-xs">{event.entityType}</Badge>
      <span>{label}</span>
      {event.data?.label && <span className="text-muted-foreground">- {event.data.label}</span>}
    </div>
  );
}
