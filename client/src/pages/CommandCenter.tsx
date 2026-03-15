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
    refetchInterval: 30000, // Auto-refresh every 30 seconds
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
  const severityStyles = {
    critical: 'bg-destructive/10 border-destructive text-destructive',
    warning: 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400',
    info: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400',
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${severityStyles[alert.severity]}`}>
      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'} className="shrink-0">
        {alert.department}
      </Badge>
      <span className="text-sm font-medium">{alert.message}</span>
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
