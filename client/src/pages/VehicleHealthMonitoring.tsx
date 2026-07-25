import { useTranslation } from "react-i18next";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, AlertTriangle, CheckCircle, Radio, Thermometer, Gauge, 
  Battery, Droplet, Wind, Zap, TrendingUp, Car
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const healthScore = 87;

const sensorData = [
  { time: "10:00", temp: 195, pressure: 32, rpm: 2200, voltage: 14.2 },
  { time: "10:15", temp: 198, pressure: 31, rpm: 2400, voltage: 14.1 },
  { time: "10:30", temp: 202, pressure: 33, rpm: 2100, voltage: 14.3 },
  { time: "10:45", temp: 205, pressure: 32, rpm: 2600, voltage: 14.0 },
  { time: "11:00", temp: 208, pressure: 30, rpm: 2300, voltage: 14.2 },
  { time: "11:15", temp: 210, pressure: 31, rpm: 2500, voltage: 13.9 },
];

export default function VehicleHealthMonitoring() {
  const { t } = useTranslation();

  const sensors = [
    {
      name: t('vehicleHealth.engineTemperature', 'Engine Temperature'),
      value: "210°F",
      status: "warning",
      icon: Thermometer,
      trend: "+5°F",
      healthy: "195-220°F",
      metric: 95
    },
    {
      name: t('vehicleHealth.oilPressure', 'Oil Pressure'),
      value: "31 PSI",
      status: "healthy",
      icon: Droplet,
      trend: "-1 PSI",
      healthy: "25-65 PSI",
      metric: 88
    },
    {
      name: t('vehicleHealth.batteryVoltage', 'Battery Voltage'),
      value: "13.9V",
      status: "healthy",
      icon: Battery,
      trend: "-0.3V",
      healthy: "12.6-14.7V",
      metric: 92
    },
    {
      name: t('vehicleHealth.tirePressure', 'Tire Pressure (Avg)'),
      value: "31.5 PSI",
      status: "critical",
      icon: Wind,
      trend: "-2.5 PSI",
      healthy: "32-35 PSI",
      metric: 68
    },
    {
      name: t('vehicleHealth.engineRPM', 'Engine RPM'),
      value: "2,500",
      status: "healthy",
      icon: Gauge,
      trend: "+200",
      healthy: "600-6,000",
      metric: 90
    },
    {
      name: t('vehicleHealth.fuelLevel', 'Fuel Level'),
      value: "42%",
      status: "healthy",
      icon: Droplet,
      trend: "-8%",
      healthy: "10-100%",
      metric: 85
    },
  ];

  const alerts = [
    {
      severity: "critical",
      title: t('vehicleHealth.lowTirePressure', 'Low Tire Pressure Detected'),
      description: t('vehicleHealth.lowTirePressureDesc', 'Rear right tire at 28 PSI (recommended: 32-35 PSI)'),
      time: t('vehicleHealth.minAgo', '5 min ago'),
      action: t('vehicleHealth.inflateTire', 'Inflate tire or check for leak')
    },
    {
      severity: "warning",
      title: t('vehicleHealth.engineTempRising', 'Engine Temperature Rising'),
      description: t('vehicleHealth.engineTempRisingDesc', 'Currently at 210°F, approaching upper limit of 220°F'),
      time: t('vehicleHealth.minAgo12', '12 min ago'),
      action: t('vehicleHealth.monitorCoolant', 'Monitor coolant levels and check for leaks')
    },
    {
      severity: "info",
      title: t('vehicleHealth.oilChangeDue', 'Oil Change Due Soon'),
      description: t('vehicleHealth.oilChangeDueDesc', 'Next service in 450 miles or 2 weeks'),
      time: t('vehicleHealth.hourAgo', '1 hour ago'),
      action: t('vehicleHealth.scheduleMaintenance', 'Schedule maintenance appointment')
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-[#F97316] bg-[#F97316]/10 border-[#F97316]/20";
      case "warning": return "text-[#F97316] bg-[#F97316]/10 border-[#F97316]/20";
      case "healthy": return "text-[#0A5ED7] bg-[#0A5ED7]/10 border-[#0A5ED7]/20";
      default: return "text-[#0A5ED7] bg-[#0A5ED7]/10 border-[#0A5ED7]/20";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return AlertTriangle;
      case "warning": return AlertTriangle;
      case "info": return CheckCircle;
      default: return Activity;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "critical": return t('common.critical', 'Critical');
      case "warning": return t('common.warning', 'Warning');
      case "healthy": return t('common.healthy', 'Healthy');
      default: return status;
    }
  };

  return (
    <StandardPageLayout
      title={t('vehicleHealth.title', 'Real-Time Vehicle Health Monitoring')}
      description={t('vehicleHealth.description', 'IoT sensor integration with predictive maintenance alerts')}
      icon={Activity}
    >
      <div className="space-y-6">
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-gradient-to-br from-[#0A5ED7]/5 to-[#0BB3FF]/5 dark:from-[#0A5ED7]/10 dark:to-[#0BB3FF]/10" data-testid="card-health-score">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center shadow-lg">
                  <Car className="w-10 h-10 text-[#0A5ED7]" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">{t('vehicleHealth.overallHealthScore', 'Overall Health Score')}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-health-score">{healthScore}</p>
                    <p className="text-[#64748B]">/100</p>
                  </div>
                  <p className="text-sm text-[#0A5ED7] mt-1" data-testid="text-health-trend">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {t('vehicleHealth.fromLastWeek', '+3 from last week')}
                  </p>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-0" data-testid="badge-health-status">
                  {t('common.healthy', 'Healthy')}
                </Badge>
                <div>
                  <p className="text-xs text-[#64748B]">{t('vehicleHealth.connectedSince', 'Connected Since')}</p>
                  <p className="text-sm font-medium text-[#0B1F3B] dark:text-white" data-testid="text-connection-time">10:00 AM</p>
                </div>
                <div className="flex items-center gap-1 text-[#0A5ED7]" data-testid="badge-live-status">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span className="text-xs">{t('common.live', 'Live')}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Progress value={healthScore} className="h-3" data-testid="progress-health-score" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor, idx) => {
            const Icon = sensor.icon;
            return (
              <Card key={idx} className={`border bg-white dark:bg-[#151A23] ${getStatusColor(sensor.status)}`} data-testid={`card-sensor-${idx}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(sensor.status)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-sensor-name-${idx}`}>
                          {sensor.name}
                        </p>
                        <p className="text-xs text-[#64748B]" data-testid={`text-sensor-range-${idx}`}>{sensor.healthy}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(sensor.status)} border`} data-testid={`badge-sensor-status-${idx}`}>
                      {getStatusLabel(sensor.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid={`text-sensor-value-${idx}`}>
                      {sensor.value}
                    </p>
                    <span className={`text-sm ${
                      sensor.trend.startsWith("+") ? "text-[#F97316]" : "text-[#0A5ED7]"
                    }`} data-testid={`text-sensor-trend-${idx}`}>
                      {sensor.trend}
                    </span>
                  </div>
                  
                  <Progress value={sensor.metric} className="h-2" data-testid={`progress-sensor-${idx}`} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vehicleHealth.liveSensorTelemetry', 'Live Sensor Telemetry')}</CardTitle>
            <CardDescription className="text-[#64748B]">
              {t('vehicleHealth.realTimeMonitoring', 'Real-time monitoring of critical vehicle systems')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="temp" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-[#F8FAFC] dark:bg-[#0E1117]">
                <TabsTrigger value="temp" data-testid="tab-temperature">{t('vehicleHealth.temperature', 'Temperature')}</TabsTrigger>
                <TabsTrigger value="pressure" data-testid="tab-pressure">{t('vehicleHealth.pressure', 'Pressure')}</TabsTrigger>
                <TabsTrigger value="rpm" data-testid="tab-rpm">{t('vehicleHealth.rpm', 'RPM')}</TabsTrigger>
                <TabsTrigger value="voltage" data-testid="tab-voltage">{t('vehicleHealth.voltage', 'Voltage')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="temp" className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="time" stroke="#64748B" />
                    <YAxis stroke="#64748B" domain={[190, 215]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#151A23', 
                        border: '1px solid #232A36',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#F97316" 
                      fill="#F97316" 
                      fillOpacity={0.2}
                      name={t('vehicleHealth.engineTempF', 'Engine Temp (°F)')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="pressure" className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="time" stroke="#64748B" />
                    <YAxis stroke="#64748B" domain={[25, 35]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#151A23', 
                        border: '1px solid #232A36',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pressure" 
                      stroke="#0A5ED7" 
                      strokeWidth={2}
                      name={t('vehicleHealth.oilPressurePSI', 'Oil Pressure (PSI)')}
                      dot={{ r: 4, fill: '#0A5ED7' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="rpm" className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="time" stroke="#64748B" />
                    <YAxis stroke="#64748B" domain={[2000, 3000]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#151A23', 
                        border: '1px solid #232A36',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rpm" 
                      stroke="#0BB3FF" 
                      fill="#0BB3FF" 
                      fillOpacity={0.2}
                      name={t('vehicleHealth.engineRPM', 'Engine RPM')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="voltage" className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="time" stroke="#64748B" />
                    <YAxis stroke="#64748B" domain={[13, 15]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#151A23', 
                        border: '1px solid #232A36',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="voltage" 
                      stroke="#0A5ED7" 
                      strokeWidth={2}
                      name={t('vehicleHealth.batteryVoltageV', 'Battery Voltage (V)')}
                      dot={{ r: 4, fill: '#0A5ED7' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vehicleHealth.activeAlerts', 'Active Alerts & Recommendations')}</CardTitle>
            <CardDescription className="text-[#64748B]">
              {t('vehicleHealth.iotNotifications', 'IoT-triggered notifications and predictive maintenance suggestions')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, idx) => {
                const Icon = getSeverityIcon(alert.severity);
                return (
                  <Card key={idx} className={`border bg-white dark:bg-[#151A23] ${getStatusColor(alert.severity)}`} data-testid={`card-alert-${idx}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(alert.severity)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-alert-title-${idx}`}>
                              {alert.title}
                            </h4>
                            <span className="text-xs text-[#64748B]" data-testid={`text-alert-time-${idx}`}>{alert.time}</span>
                          </div>
                          <p className="text-sm text-[#64748B] mb-2" data-testid={`text-alert-description-${idx}`}>
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-[#0A5ED7]" />
                            <p className="text-xs font-medium text-[#0A5ED7]" data-testid={`text-alert-action-${idx}`}>
                              {alert.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
