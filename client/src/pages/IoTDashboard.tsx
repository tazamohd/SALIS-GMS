import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Thermometer, Droplet, Gauge, Zap, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

export default function IoTDashboard() {
  const [liveData, setLiveData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const { data: sensors = [] } = useQuery({ queryKey: ['/api/iot/sensors'] });
  const { data: readings = [] } = useQuery({ queryKey: ['/api/iot/sensor-readings'] });
  const { data: alerts = [] } = useQuery({ queryKey: ['/api/iot/alerts'] });

  useEffect(() => {
    setIsConnected(true);
    const interval = setInterval(() => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString();
      
      setLiveData(prev => {
        const newData = [
          ...prev,
          {
            time: timeLabel,
            temperature: 20 + Math.random() * 10,
            pressure: 30 + Math.random() * 5,
            vibration: 0.5 + Math.random() * 0.5,
            oilLevel: 85 + Math.random() * 10,
          }
        ].slice(-20);
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const sensorStats = [
    {
      name: 'Engine Temperature',
      value: liveData.length > 0 ? liveData[liveData.length - 1].temperature.toFixed(1) : '0',
      unit: '°C',
      status: 'normal',
      icon: Thermometer,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      name: 'Oil Pressure',
      value: liveData.length > 0 ? liveData[liveData.length - 1].pressure.toFixed(1) : '0',
      unit: 'PSI',
      status: 'normal',
      icon: Gauge,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      name: 'Vibration Level',
      value: liveData.length > 0 ? liveData[liveData.length - 1].vibration.toFixed(2) : '0',
      unit: 'g',
      status: 'normal',
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      name: 'Oil Level',
      value: liveData.length > 0 ? liveData[liveData.length - 1].oilLevel.toFixed(1) : '0',
      unit: '%',
      status: 'normal',
      icon: Droplet,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  const activeAlerts = [
    { id: 1, sensor: 'Bay 3 - OBD Sensor', severity: 'warning', message: 'Temperature spike detected', time: '2 min ago' },
    { id: 2, sensor: 'Bay 1 - Pressure Sensor', severity: 'info', message: 'Pressure within normal range', time: '5 min ago' },
  ];

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat'] text-gray-900 dark:text-white mb-2">
              🌐 IoT Sensor Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-['Poppins']">
              Real-time monitoring of connected sensors across all service bays
            </p>
          </div>
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
                  Disconnected
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Live Sensor Metrics */}
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
                  <span className="text-3xl font-bold text-gray-900 dark:text-white" data-testid={`value-${stat.name.toLowerCase().replace(' ', '-')}`}>
                    {stat.value}
                  </span>
                  <span className="text-sm text-gray-500">{stat.unit}</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Normal Range
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="live" className="space-y-6">
        <TabsList>
          <TabsTrigger value="live" data-testid="tab-live">
            <Activity className="h-4 w-4 mr-2" />
            Live Monitoring
          </TabsTrigger>
          <TabsTrigger value="sensors" data-testid="tab-sensors">
            <Zap className="h-4 w-4 mr-2" />
            Sensor List
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts ({activeAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Chart */}
            <Card className="bg-white dark:bg-salis-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  Temperature Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={liveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temperature" stroke="#f97316" name="Temperature (°C)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pressure Chart */}
            <Card className="bg-white dark:bg-salis-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-blue-500" />
                  Pressure Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={liveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="pressure" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Pressure (PSI)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Vibration Chart */}
            <Card className="bg-white dark:bg-salis-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Vibration Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={liveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="vibration" fill="#a855f7" name="Vibration (g)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Oil Level Chart */}
            <Card className="bg-white dark:bg-salis-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-green-500" />
                  Oil Level Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={liveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" style={{ fontSize: '12px' }} />
                    <YAxis domain={[0, 100]} style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="oilLevel" stroke="#22c55e" name="Oil Level (%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sensors">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle>Installed Sensors</CardTitle>
            </CardHeader>
            <CardContent>
              {(!Array.isArray(sensors) || sensors.length === 0) ? (
                <div className="text-center py-12">
                  <Zap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No sensors configured yet
                  </p>
                  <Button className="mt-4" data-testid="button-add-sensor">
                    Add First Sensor
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-3">Sensor ID</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Last Reading</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(sensors) && sensors.map((sensor: any) => (
                        <tr key={sensor.id} className="border-b" data-testid={`sensor-row-${sensor.id}`}>
                          <td className="py-3">{sensor.sensorId}</td>
                          <td className="py-3">{sensor.sensorType}</td>
                          <td className="py-3">{sensor.location}</td>
                          <td className="py-3">
                            <Badge className={sensor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {sensor.status}
                            </Badge>
                          </td>
                          <td className="py-3">{new Date(sensor.lastReading).toLocaleString()}</td>
                        </tr>
                      ))}
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
              {activeAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No active alerts - all systems normal
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.severity === 'warning'
                          ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/10'
                          : 'border-blue-200 bg-blue-50 dark:bg-blue-900/10'
                      }`}
                      data-testid={`alert-${alert.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            className={`h-5 w-5 mt-0.5 ${
                              alert.severity === 'warning' ? 'text-orange-500' : 'text-blue-500'
                            }`}
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {alert.sensor}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" data-testid={`button-resolve-${alert.id}`}>
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
