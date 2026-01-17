import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Radio, Activity, AlertTriangle, MapPin, Gauge } from "lucide-react";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

const createAlertSchema = (t: (key: string, fallback: string) => string) => z.object({
  vehicleId: z.string().min(1, t('telematics.vehicleIdRequired', 'Vehicle ID is required')),
  alertType: z.enum(["speeding", "harsh_braking", "idling", "geofence_violation", "maintenance_due", "low_battery", "engine_fault"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  message: z.string().min(1, t('telematics.messageRequired', 'Message is required')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type AlertFormData = z.infer<ReturnType<typeof createAlertSchema>>;

export default function TelematicsIntegration() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("feeds");
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  const { data: feeds = [], isLoading: feedsLoading } = useQuery<any[]>({
    queryKey: ["/api/telematics/feeds"],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<any[]>({
    queryKey: ["/api/telematics/alerts"],
  });

  const alertSchema = createAlertSchema(t);
  const alertForm = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      vehicleId: "",
      alertType: "speeding",
      severity: "medium",
      message: "",
      latitude: 0,
      longitude: 0,
    }
  });

  const createAlertMutation = useMutation({
    mutationFn: (data: AlertFormData) => apiRequest("POST", "/api/telematics/alerts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telematics/alerts"] });
      toast({ title: t('common.success', 'Success'), description: t('telematics.alertCreated', 'Alert created successfully') });
      setIsAlertDialogOpen(false);
      alertForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('telematics.alertCreateFailed', 'Failed to create alert'), variant: "destructive" });
    }
  });

  const resolveAlertMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/telematics/alerts/${id}/resolve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telematics/alerts"] });
      toast({ title: t('common.success', 'Success'), description: t('telematics.alertResolved', 'Alert resolved') });
    },
  });

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-[#0A5ED7]/10 text-[#0A5ED7]",
      medium: "bg-[#F97316]/10 text-[#F97316]",
      high: "bg-[#F97316]/10 text-[#F97316]",
      critical: "bg-red-500/10 text-red-600",
    };
    return colors[severity] || "bg-[#64748B]/10 text-[#64748B]";
  };

  const feedsContent = (
    <div className="space-y-4">
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('telematics.realTimeFeeds', 'Real-Time Telemetry Feeds')}</CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('telematics.liveVehicleData', 'Live vehicle location and sensor data')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedsLoading ? (
                <p className="text-[#64748B]" data-testid="text-loading">{t('common.loading', 'Loading feeds...')}</p>
              ) : feeds.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-[#0A5ED7]" />
                  </div>
                  <p className="text-[#64748B]" data-testid="text-no-feeds">{t('telematics.noFeeds', 'No telemetry feeds available')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                        <TableHead className="text-[#64748B]">{t('telematics.vehicle', 'Vehicle')}</TableHead>
                        <TableHead className="text-[#64748B]">{t('telematics.device', 'Device')}</TableHead>
                        <TableHead className="text-[#64748B]">{t('telematics.location', 'Location')}</TableHead>
                        <TableHead className="text-[#64748B]">{t('telematics.speed', 'Speed')}</TableHead>
                        <TableHead className="text-[#64748B]">{t('telematics.fuelLevel', 'Fuel Level')}</TableHead>
                        <TableHead className="text-[#64748B]">{t('telematics.timestamp', 'Timestamp')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeds.map((feed: any) => (
                        <TableRow key={feed.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-feed-${feed.id}`}>
                          <TableCell className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-vehicle-${feed.id}`}>{feed.vehicleId || t('common.notAvailable', 'N/A')}</TableCell>
                          <TableCell className="text-[#64748B]" data-testid={`text-device-${feed.id}`}>{feed.deviceId || t('common.notAvailable', 'N/A')}</TableCell>
                          <TableCell className="text-[#64748B]" data-testid={`text-location-${feed.id}`}>
                            {feed.latitude && feed.longitude ? `${feed.latitude.toFixed(6)}, ${feed.longitude.toFixed(6)}` : t('common.unknown', 'Unknown')}
                          </TableCell>
                          <TableCell className="text-[#64748B]" data-testid={`text-speed-${feed.id}`}>
                            {feed.speed !== null && feed.speed !== undefined ? `${feed.speed} ${t('telematics.mph', 'mph')}` : t('common.notAvailable', 'N/A')}
                          </TableCell>
                          <TableCell className="text-[#64748B]" data-testid={`text-fuel-${feed.id}`}>
                            {feed.fuelLevel !== null && feed.fuelLevel !== undefined ? `${feed.fuelLevel}%` : t('common.notAvailable', 'N/A')}
                          </TableCell>
                          <TableCell className="text-[#64748B]" data-testid={`text-timestamp-${feed.id}`}>
                            {feed.timestamp ? new Date(feed.timestamp).toLocaleString() : t('common.notAvailable', 'N/A')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );

  const alertsContent = (
    <div className="space-y-4">
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('telematics.alerts', 'Telematics Alerts')}</CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('telematics.vehicleAlerts', 'Vehicle alerts and notifications')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <p className="text-[#64748B]" data-testid="text-loading-alerts">{t('telematics.loadingAlerts', 'Loading alerts...')}</p>
              ) : alerts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-[#0A5ED7]" />
                  </div>
                  <p className="text-[#64748B]" data-testid="text-no-alerts">{t('telematics.noAlerts', 'No alerts found')}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {alerts.map((alert: any) => (
                    <Card key={alert.id} className="border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`card-alert-${alert.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <AlertTriangle className={`h-5 w-5 ${alert.severity === "critical" ? "text-red-600" : "text-[#F97316]"}`} />
                              <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-alert-type-${alert.id}`}>
                                {String(t(`telematics.alertTypes.${alert.alertType}`, alert.alertType.replace(/_/g, " ").toUpperCase()))}
                              </h3>
                              <Badge className={getSeverityBadge(alert.severity)} data-testid={`badge-severity-${alert.id}`}>
                                {String(t(`telematics.severityLevels.${alert.severity}`, alert.severity))}
                              </Badge>
                              {alert.isResolved && (
                                <Badge className="bg-green-500/10 text-green-600" data-testid={`badge-resolved-${alert.id}`}>
                                  {t('telematics.resolved', 'Resolved')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#64748B] mb-2" data-testid={`text-alert-message-${alert.id}`}>
                              {alert.message}
                            </p>
                            <div className="flex gap-4 text-sm text-[#64748B]">
                              <span data-testid={`text-alert-vehicle-${alert.id}`}>{t('telematics.vehicle', 'Vehicle')}: {alert.vehicleId}</span>
                              <span data-testid={`text-alert-timestamp-${alert.id}`}>
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {!alert.isResolved && (
                            <Button
                              size="sm"
                              onClick={() => resolveAlertMutation.mutate(alert.id)}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                              data-testid={`button-resolve-${alert.id}`}
                            >
                              {t('telematics.resolve', 'Resolve')}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );

  return (
    <>
      <TabsPageLayout
        title={t('telematics.title', 'Telematics Integration')}
        description={t('telematics.description', 'Real-time vehicle tracking, telemetry feeds, and alerts')}
        icon={Radio}
        primaryAction={{
          label: t('telematics.createAlert', 'Create Alert'),
          icon: AlertTriangle,
          onClick: () => setIsAlertDialogOpen(true),
          testId: "button-create-alert"
        }}
        tabs={[
          {
            id: "feeds",
            label: t('telematics.telemetryFeeds', 'Telemetry Feeds'),
            icon: Activity,
            content: feedsContent
          },
          {
            id: "alerts",
            label: t('telematics.alertsTab', 'Alerts'),
            icon: AlertTriangle,
            content: alertsContent
          }
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('telematics.createTelematicsAlert', 'Create Telematics Alert')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('telematics.createNewAlert', 'Create a new vehicle alert')}
            </DialogDescription>
          </DialogHeader>
          <Form {...alertForm}>
            <form onSubmit={alertForm.handleSubmit((data) => createAlertMutation.mutate(data))} className="space-y-4">
              <FormField
                control={alertForm.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('telematics.vehicleId', 'Vehicle ID')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="VEH-12345" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-vehicle-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={alertForm.control}
                  name="alertType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('telematics.alertType', 'Alert Type')}</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#0E1117] px-3 py-2 text-sm text-[#0B1F3B] dark:text-white"
                          data-testid="select-alert-type"
                        >
                          <option value="speeding">{t('telematics.speeding', 'Speeding')}</option>
                          <option value="harsh_braking">{t('telematics.harshBraking', 'Harsh Braking')}</option>
                          <option value="idling">{t('telematics.idling', 'Idling')}</option>
                          <option value="geofence_violation">{t('telematics.geofenceViolation', 'Geofence Violation')}</option>
                          <option value="maintenance_due">{t('telematics.maintenanceDue', 'Maintenance Due')}</option>
                          <option value="low_battery">{t('telematics.lowBattery', 'Low Battery')}</option>
                          <option value="engine_fault">{t('telematics.engineFault', 'Engine Fault')}</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alertForm.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('telematics.severity', 'Severity')}</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#0E1117] px-3 py-2 text-sm text-[#0B1F3B] dark:text-white"
                          data-testid="select-severity"
                        >
                          <option value="low">{t('telematics.low', 'Low')}</option>
                          <option value="medium">{t('telematics.medium', 'Medium')}</option>
                          <option value="high">{t('telematics.high', 'High')}</option>
                          <option value="critical">{t('telematics.critical', 'Critical')}</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={alertForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('telematics.message', 'Message')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('telematics.alertDescriptionPlaceholder', 'Alert description...')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-message" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={alertForm.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('telematics.latitudeOptional', 'Latitude (optional)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.000001"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                          data-testid="input-latitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alertForm.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('telematics.longitudeOptional', 'Longitude (optional)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.000001"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                          data-testid="input-longitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createAlertMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white" data-testid="button-submit-alert">
                  {createAlertMutation.isPending ? t('telematics.creating', 'Creating...') : t('telematics.createAlert', 'Create Alert')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
