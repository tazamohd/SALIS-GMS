import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Watch, Activity, Heart, Footprints, Battery, Wifi, AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WearableIntegration() {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthMonitoring, setHealthMonitoring] = useState(true);

  const devices = [
    {
      id: 1,
      name: "Apple Watch Series 9",
      type: t('wearable.smartwatch', 'Smartwatch'),
      status: "connected",
      battery: 75,
      lastSync: t('wearable.minAgo', '2 min ago')
    },
    {
      id: 2,
      name: "Samsung Galaxy Watch",
      type: t('wearable.smartwatch', 'Smartwatch'),
      status: "disconnected",
      battery: 45,
      lastSync: t('wearable.hourAgo', '1 hour ago')
    },
    {
      id: 3,
      name: "Fitbit Charge 5",
      type: t('wearable.fitnessTracker', 'Fitness Tracker'),
      status: "connected",
      battery: 92,
      lastSync: t('wearable.minAgoSingle', '1 min ago')
    },
  ];

  const notifications = [
    { id: 1, type: t('wearable.task', 'task'), message: t('wearable.newTaskAssigned', 'New task assigned: Oil Change for Toyota Camry'), time: t('wearable.fiveMinAgo', '5 min ago'), priority: "high" },
    { id: 2, type: t('wearable.alert', 'alert'), message: t('wearable.customerArrived', 'Customer arrived for appointment'), time: t('wearable.fifteenMinAgo', '15 min ago'), priority: "medium" },
    { id: 3, type: t('wearable.reminder', 'reminder'), message: t('wearable.lunchBreak', 'Lunch break in 30 minutes'), time: t('wearable.thirtyMinAgo', '30 min ago'), priority: "low" },
  ];

  const healthMetrics = [
    { label: t('wearable.stepsToday', 'Steps Today'), value: "8,245", goal: 10000, icon: Footprints, color: "text-[#0A5ED7] dark:text-[#0BB3FF]" },
    { label: t('wearable.heartRate', 'Heart Rate'), value: t('wearable.bpm', '72 bpm'), goal: null, icon: Heart, color: "text-red-600 dark:text-red-400" },
    { label: t('wearable.activeMinutes', 'Active Minutes'), value: t('wearable.minValue', '45 min'), goal: 60, icon: Activity, color: "text-emerald-600 dark:text-emerald-400" },
  ];

  const getStatusBadge = (status: string) => {
    return status === "connected"
      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
      : "bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-[#F97316]";
      case "medium":
        return "border-amber-500 dark:border-amber-400";
      default:
        return "border-[#E2E8F0] dark:border-[#232A36]";
    }
  };

  return (
    <StandardPageLayout
      title={t('wearable.title', 'Wearable Integration')}
      description={t('wearable.description', 'Connect and manage wearable devices for real-time updates')}
      icon={Watch}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Watch className="w-5 h-5 text-[#0A5ED7]" />
                {t('wearable.connectedDevices', 'Connected Devices')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">{t('wearable.manageDevices', 'Manage your wearable devices')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map(device => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`device-${device.id}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 dark:from-[#0A5ED7]/20 dark:to-[#0BB3FF]/20 rounded-lg flex items-center justify-center">
                        <Watch className="w-6 h-6 text-[#0A5ED7] dark:text-[#0BB3FF]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#0B1F3B] dark:text-white">{device.name}</p>
                        <p className="text-sm text-[#64748B]">{device.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Battery className="w-4 h-4 text-[#64748B]" />
                          <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{device.battery}%</span>
                        </div>
                        <p className="text-xs text-[#64748B]">{device.lastSync}</p>
                      </div>
                      <Badge className={`${getStatusBadge(device.status)} border-0 capitalize`}>
                        {device.status === 'connected' ? t('wearable.connected', 'connected') : t('wearable.disconnected', 'disconnected')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" variant="outline" data-testid="button-add-device">
                <Wifi className="w-4 h-4 mr-2" />
                {t('wearable.addNewDevice', 'Add New Device')}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('wearable.recentNotifications', 'Recent Notifications')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('wearable.messagesSynced', 'Messages synced to your wearable devices')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} bg-[#F8FAFC] dark:bg-[#0E1117] rounded-r-lg`}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[#64748B] mt-1">
                          {notification.time}
                        </p>
                      </div>
                      <Badge className="bg-[#F8FAFC] dark:bg-[#232A36] text-[#0B1F3B] dark:text-white border-0 capitalize">
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Activity className="w-5 h-5 text-[#0A5ED7]" />
                {t('wearable.healthActivity', 'Health & Activity')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">{t('wearable.dailyHealthMetrics', 'Daily health metrics from connected devices')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="space-y-3 p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]" data-testid={`metric-${index}`}>
                    <div className="flex items-center gap-2">
                      <metric.icon className={`w-5 h-5 ${metric.color}`} />
                      <span className="text-sm font-medium text-[#64748B]">
                        {metric.label}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{metric.value}</p>
                    {metric.goal && (
                      <>
                        <Progress
                          value={(parseInt(metric.value.replace(/,/g, '')) / metric.goal) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-[#64748B]">
                          {t('wearable.goal', 'Goal')}: {metric.goal.toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('wearable.connectionStatus', 'Connection Status')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#F97316]" />
                  )}
                  <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                    {isConnected ? t('wearable.connected', 'Connected') : t('wearable.disconnected', 'Disconnected')}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConnected(!isConnected)}
                  className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                  data-testid="button-toggle-connection"
                >
                  {isConnected ? t('wearable.disconnect', 'Disconnect') : t('wearable.connect', 'Connect')}
                </Button>
              </div>
              <div className="text-sm text-[#64748B]">
                <p>{t('wearable.lastSynced', 'Last synced')}: {t('wearable.twoMinutesAgo', '2 minutes ago')}</p>
                <p>{t('wearable.nextSync', 'Next sync')}: {t('wearable.inThreeMinutes', 'In 3 minutes')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('common.settings', 'Settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-[#0B1F3B] dark:text-white">{t('wearable.pushNotifications', 'Push Notifications')}</Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  data-testid="switch-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="health" className="text-[#0B1F3B] dark:text-white">{t('wearable.healthMonitoring', 'Health Monitoring')}</Label>
                <Switch
                  id="health"
                  checked={healthMonitoring}
                  onCheckedChange={setHealthMonitoring}
                  data-testid="switch-health"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-sync" className="text-[#0B1F3B] dark:text-white">{t('wearable.autoSync', 'Auto Sync')}</Label>
                <Switch id="auto-sync" defaultChecked data-testid="switch-auto-sync" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="vibration" className="text-[#0B1F3B] dark:text-white">{t('wearable.vibrationAlerts', 'Vibration Alerts')}</Label>
                <Switch id="vibration" defaultChecked data-testid="switch-vibration" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('common.quick_actions', 'Quick Actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" variant="outline" data-testid="button-sync">
                {t('wearable.syncNow', 'Sync Now')}
              </Button>
              <Button className="w-full border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" variant="outline" data-testid="button-test">
                {t('wearable.sendTestNotification', 'Send Test Notification')}
              </Button>
              <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-history">
                {t('wearable.viewSyncHistory', 'View Sync History')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
