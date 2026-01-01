import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DashboardPage } from '@/components/layouts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Thermometer, Droplet, Gauge, Zap, AlertTriangle, CheckCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface IoTSummary {
  totalSensors: number;
  activeSensors: number;
  activeAlerts: number;
  criticalAlerts: number;
}

interface IoTSensor {
  id: string;
  sensorIdentifier: string;
  sensorType: string;
  vehicleId: string;
  status: string;
  lastCommunication: string | null;
}

interface IoTAlert {
  id: string;
  status: string;
  severity: string;
  alertType: string;
  message: string;
  vehicleId: string;
  createdAt: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
}

interface SensorReading {
  value: number;
  unit?: string;
  timestamp: string;
}

export default function IoTDashboard() {
  const { t } = useTranslation();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const { toast } = useToast();

  const { data: summary, isLoading: summaryLoading } = useQuery<IoTSummary>({
    queryKey: ['/api/iot/dashboard/summary'],
  });

  const { data: sensors = [], isLoading: sensorsLoading } = useQuery<IoTSensor[]>({
    queryKey: ['/api/iot/sensors'],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<IoTAlert[]>({
    queryKey: ['/api/iot/alerts'],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: latestReadings } = useQuery<Record<string, SensorReading>>({
    queryKey: ['/api/iot/vehicles', selectedVehicleId, 'latest-readings'],
    enabled: !!selectedVehicleId,
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return await apiRequest('POST', `/api/iot/alerts/${alertId}/acknowledge`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/iot/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/iot/dashboard/summary'] });
      toast({
        title: t('iot.alertAcknowledged', 'Alert Acknowledged'),
        description: t('iot.alertAcknowledgedDesc', 'The alert has been acknowledged successfully.'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('iot.acknowledgeError', 'Failed to acknowledge alert.'),
        variant: "destructive",
      });
    },
  });

  const isConnected = summary && summary.totalSensors > 0;
  const activeAlerts = Array.isArray(alerts) ? alerts.filter((a) => a.status === 'active') : [];

  const metrics = [
    {
      label: t('iot.totalSensors', 'Total Sensors'),
      value: summary?.totalSensors || 0,
      icon: Zap,
      color: 'text-[#0A5ED7]',
    },
    {
      label: t('iot.activeSensors', 'Active Sensors'),
      value: summary?.activeSensors || 0,
      icon: CheckCircle,
      color: 'text-emerald-500',
    },
    {
      label: t('iot.activeAlerts', 'Active Alerts'),
      value: summary?.activeAlerts || 0,
      icon: AlertTriangle,
      color: (summary?.activeAlerts ?? 0) > 0 ? 'text-[#F97316]' : 'text-[#64748B]',
    },
    {
      label: t('iot.criticalAlerts', 'Critical Alerts'),
      value: summary?.criticalAlerts || 0,
      icon: AlertTriangle,
      color: (summary?.criticalAlerts ?? 0) > 0 ? 'text-red-500' : 'text-[#64748B]',
    },
  ];

  if (summaryLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F8FAFC] dark:bg-[#0E1117]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A5ED7]" />
      </div>
    );
  }

  return (
    <DashboardPage
      title={t('iot.title', 'IoT Sensor Dashboard')}
      description={t('iot.description', 'Real-time monitoring of connected sensors across all service bays')}
      icon={Activity}
      metrics={metrics}
    >
      <div className="mb-6 flex items-center justify-between">
        <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
          <SelectTrigger className="w-64 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
            <SelectValue placeholder={t('iot.selectVehicle', 'Select vehicle...')} />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(vehicles) && vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-5 w-5 text-emerald-500" />
              <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0">
                {t('iot.connected', 'Connected')}
              </Badge>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-red-500" />
              <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0">
                {t('iot.noSensors', 'No Sensors')}
              </Badge>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="sensors" className="space-y-6">
        <TabsList className="bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
          <TabsTrigger value="sensors" data-testid="tab-sensors">
            <Zap className="h-4 w-4 mr-2" />
            {t('iot.sensorList', 'Sensor List')} ({sensors.length})
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {t('iot.alerts', 'Alerts')} ({activeAlerts.length})
          </TabsTrigger>
          {selectedVehicleId && (
            <TabsTrigger value="live" data-testid="tab-live">
              <Activity className="h-4 w-4 mr-2" />
              {t('iot.liveMonitoring', 'Live Monitoring')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="sensors">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('iot.installedSensors', 'Installed Sensors')}</CardTitle>
            </CardHeader>
            <CardContent>
              {sensorsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0A5ED7]" />
                </div>
              ) : !Array.isArray(sensors) || sensors.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="h-16 w-16 mx-auto mb-4 text-[#64748B]" />
                  <p className="text-[#64748B]">
                    {t('iot.noSensorsConfigured', 'No sensors configured yet')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                      <tr className="text-left">
                        <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('iot.sensorId', 'Sensor ID')}</th>
                        <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('iot.type', 'Type')}</th>
                        <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('iot.vehicle', 'Vehicle')}</th>
                        <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('iot.status', 'Status')}</th>
                        <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('iot.lastCommunication', 'Last Communication')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sensors.map((sensor) => {
                        const vehicle = vehicles.find((v) => v.id === sensor.vehicleId);
                        return (
                          <tr key={sensor.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`sensor-row-${sensor.id}`}>
                            <td className="py-3 font-mono text-xs text-[#0B1F3B] dark:text-white">{sensor.sensorIdentifier}</td>
                            <td className="py-3 text-[#0B1F3B] dark:text-white">{sensor.sensorType}</td>
                            <td className="py-3 text-[#0B1F3B] dark:text-white">
                              {vehicle ? `${vehicle.make} ${vehicle.model}` : t('iot.unknown', 'Unknown')}
                            </td>
                            <td className="py-3">
                              <Badge className={sensor.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0' : 'bg-[#F8FAFC] text-[#64748B] dark:bg-[#232A36] border-0'}>
                                {sensor.status === 'active' ? t('iot.active', 'active') : sensor.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-sm text-[#64748B]">
                              {sensor.lastCommunication ? new Date(sensor.lastCommunication).toLocaleString() : t('iot.never', 'Never')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <AlertTriangle className="h-5 w-5 text-[#F97316]" />
                {t('iot.activeAlertsTitle', 'Active Alerts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0A5ED7]" />
                </div>
              ) : activeAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
                  <p className="text-[#64748B]">
                    {t('iot.noActiveAlerts', 'No active alerts - all systems normal')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => {
                    const vehicle = vehicles.find((v) => v.id === alert.vehicleId);
                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${
                          alert.severity === 'critical'
                            ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                            : alert.severity === 'high'
                            ? 'border-[#F97316]/30 bg-orange-50 dark:bg-orange-900/10'
                            : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
                        }`}
                        data-testid={`alert-${alert.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <AlertTriangle
                              className={`h-5 w-5 mt-0.5 ${
                                alert.severity === 'critical'
                                  ? 'text-red-500'
                                  : alert.severity === 'high'
                                  ? 'text-[#F97316]'
                                  : 'text-yellow-500'
                              }`}
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-[#0B1F3B] dark:text-white">
                                  {alert.alertType}
                                </h4>
                                <Badge variant="outline" className="text-xs border-[#E2E8F0] dark:border-[#232A36]">
                                  {alert.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-[#64748B] mt-1">
                                {alert.message}
                              </p>
                              {vehicle && (
                                <p className="text-xs text-[#64748B] mt-1">
                                  {t('iot.vehicleLabel', 'Vehicle')}: {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                                </p>
                              )}
                              <p className="text-xs text-[#64748B] mt-1">
                                {new Date(alert.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-[#E2E8F0] dark:border-[#232A36]"
                            data-testid={`button-acknowledge-${alert.id}`}
                            onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                            disabled={acknowledgeAlertMutation.isPending}
                          >
                            {acknowledgeAlertMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t('iot.acknowledge', 'Acknowledge')
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {selectedVehicleId && latestReadings && (
          <TabsContent value="live">
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                  <Activity className="h-5 w-5 text-[#0A5ED7]" />
                  {t('iot.latestReadings', 'Latest Sensor Readings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(latestReadings).map(([sensorType, reading]) => (
                    <div key={sensorType} className="flex justify-between items-center p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                      <span className="font-medium capitalize text-[#0B1F3B] dark:text-white">{sensorType.replace(/_/g, ' ')}</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#0B1F3B] dark:text-white">{reading.value.toFixed(2)}</span>
                        {reading.unit && <span className="text-sm text-[#64748B] ml-1">{reading.unit}</span>}
                        <div className="text-xs text-[#64748B]">
                          {new Date(reading.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </DashboardPage>
  );
}
