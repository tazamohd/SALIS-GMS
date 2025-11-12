import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Thermometer, Droplet, Gauge, Zap, AlertTriangle, CheckCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function IoTDashboard() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const { toast } = useToast();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/iot/dashboard/summary'],
  });

  const { data: sensors = [], isLoading: sensorsLoading } = useQuery({
    queryKey: ['/api/iot/sensors'],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/iot/alerts'],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const { data: latestReadings } = useQuery({
    queryKey: ['/api/iot/vehicles', selectedVehicleId, 'latest-readings'],
    enabled: !!selectedVehicleId,
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return await apiRequest(`/api/iot/alerts/${alertId}/acknowledge`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/iot/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/iot/dashboard/summary'] });
      toast({
        title: "Alert Acknowledged",
        description: "The alert has been acknowledged successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert.",
        variant: "destructive",
      });
    },
  });

  const isConnected = summary && summary.totalSensors > 0;
  const activeAlerts = Array.isArray(alerts) ? alerts.filter((a: any) => a.status === 'active') : [];

  const sensorStats = [
    {
      name: 'Total Sensors',
      value: summary?.totalSensors || 0,
      unit: 'devices',
      status: 'normal',
      icon: Zap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      name: 'Active Sensors',
      value: summary?.activeSensors || 0,
      unit: 'online',
      status: 'normal',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      name: 'Active Alerts',
      value: summary?.activeAlerts || 0,
      unit: 'pending',
      status: summary?.activeAlerts > 0 ? 'warning' : 'normal',
      icon: AlertTriangle,
      color: summary?.activeAlerts > 0 ? 'text-orange-500' : 'text-gray-500',
      bgColor: summary?.activeAlerts > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-900/30',
    },
    {
      name: 'Critical Alerts',
      value: summary?.criticalAlerts || 0,
      unit: 'urgent',
      status: summary?.criticalAlerts > 0 ? 'critical' : 'normal',
      icon: AlertTriangle,
      color: summary?.criticalAlerts > 0 ? 'text-red-500' : 'text-gray-500',
      bgColor: summary?.criticalAlerts > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-900/30',
    },
  ];

  const getLatestReadingValue = (sensorType: string) => {
    if (!latestReadings || !latestReadings[sensorType]) return null;
    return parseFloat(latestReadings[sensorType].value);
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat'] text-gray-900 dark:text-white mb-2">
              IoT Sensor Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-['Poppins']">
              Real-time monitoring of connected sensors across all service bays
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select vehicle..." />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(vehicles) && vehicles.map((vehicle: any) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-500" />
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                    Connected
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-500" />
                  <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0">
                    No Sensors
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {summaryLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {sensorStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.name} className="bg-white dark:bg-salis-black">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Live
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white" data-testid={`value-${stat.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        {stat.value}
                      </span>
                      <span className="text-sm text-gray-500">{stat.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Tabs defaultValue="sensors" className="space-y-6">
            <TabsList>
              <TabsTrigger value="sensors" data-testid="tab-sensors">
                <Zap className="h-4 w-4 mr-2" />
                Sensor List ({sensors.length})
              </TabsTrigger>
              <TabsTrigger value="alerts" data-testid="tab-alerts">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alerts ({activeAlerts.length})
              </TabsTrigger>
              {selectedVehicleId && (
                <TabsTrigger value="live" data-testid="tab-live">
                  <Activity className="h-4 w-4 mr-2" />
                  Live Monitoring
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="sensors">
              <Card className="bg-white dark:bg-salis-black">
                <CardHeader>
                  <CardTitle>Installed Sensors</CardTitle>
                </CardHeader>
                <CardContent>
                  {sensorsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  ) : !Array.isArray(sensors) || sensors.length === 0 ? (
                    <div className="text-center py-12">
                      <Zap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No sensors configured yet
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr className="text-left">
                            <th className="pb-3">Sensor ID</th>
                            <th className="pb-3">Type</th>
                            <th className="pb-3">Vehicle</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">Last Communication</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sensors.map((sensor: any) => {
                            const vehicle = vehicles.find((v: any) => v.id === sensor.vehicleId);
                            return (
                              <tr key={sensor.id} className="border-b" data-testid={`sensor-row-${sensor.id}`}>
                                <td className="py-3 font-mono text-xs">{sensor.sensorIdentifier}</td>
                                <td className="py-3">{sensor.sensorType}</td>
                                <td className="py-3">
                                  {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown'}
                                </td>
                                <td className="py-3">
                                  <Badge className={sensor.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 border-0' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 border-0'}>
                                    {sensor.status}
                                  </Badge>
                                </td>
                                <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {sensor.lastCommunication ? new Date(sensor.lastCommunication).toLocaleString() : 'Never'}
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
              <Card className="bg-white dark:bg-salis-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Active Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alertsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  ) : activeAlerts.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No active alerts - all systems normal
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeAlerts.map((alert: any) => {
                        const vehicle = vehicles.find((v: any) => v.id === alert.vehicleId);
                        return (
                          <div
                            key={alert.id}
                            className={`p-4 rounded-lg border ${
                              alert.severity === 'critical'
                                ? 'border-red-200 bg-red-50 dark:bg-red-900/10'
                                : alert.severity === 'high'
                                ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/10'
                                : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10'
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
                                      ? 'text-orange-500'
                                      : 'text-yellow-500'
                                  }`}
                                />
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {alert.alertType}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                      {alert.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {alert.message}
                                  </p>
                                  {vehicle && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Vehicle: {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(alert.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                data-testid={`button-acknowledge-${alert.id}`}
                                onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                                disabled={acknowledgeAlertMutation.isPending}
                              >
                                {acknowledgeAlertMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Acknowledge'
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white dark:bg-salis-black">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Latest Sensor Readings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(latestReadings).map(([sensorType, reading]: [string, any]) => (
                          <div key={sensorType} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <span className="font-medium capitalize">{sensorType.replace(/_/g, ' ')}</span>
                            <div className="text-right">
                              <span className="text-lg font-bold">{parseFloat(reading.value).toFixed(2)}</span>
                              {reading.unit && <span className="text-sm text-gray-500 ml-1">{reading.unit}</span>}
                              <div className="text-xs text-gray-500">
                                {new Date(reading.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
}
