import { useState } from "react";
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
  const [isConnected, setIsConnected] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthMonitoring, setHealthMonitoring] = useState(true);

  const devices = [
    {
      id: 1,
      name: "Apple Watch Series 9",
      type: "Smartwatch",
      status: "connected",
      battery: 75,
      lastSync: "2 min ago"
    },
    {
      id: 2,
      name: "Samsung Galaxy Watch",
      type: "Smartwatch",
      status: "disconnected",
      battery: 45,
      lastSync: "1 hour ago"
    },
    {
      id: 3,
      name: "Fitbit Charge 5",
      type: "Fitness Tracker",
      status: "connected",
      battery: 92,
      lastSync: "1 min ago"
    },
  ];

  const notifications = [
    { id: 1, type: "task", message: "New task assigned: Oil Change for Toyota Camry", time: "5 min ago", priority: "high" },
    { id: 2, type: "alert", message: "Customer arrived for appointment", time: "15 min ago", priority: "medium" },
    { id: 3, type: "reminder", message: "Lunch break in 30 minutes", time: "30 min ago", priority: "low" },
  ];

  const healthMetrics = [
    { label: "Steps Today", value: "8,245", goal: 10000, icon: Footprints, color: "text-blue-600 dark:text-blue-400" },
    { label: "Heart Rate", value: "72 bpm", goal: null, icon: Heart, color: "text-red-600 dark:text-red-400" },
    { label: "Active Minutes", value: "45 min", goal: 60, icon: Activity, color: "text-green-600 dark:text-green-400" },
  ];

  const getStatusBadge = (status: string) => {
    return status === "connected"
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 dark:border-red-400";
      case "medium":
        return "border-yellow-500 dark:border-yellow-400";
      default:
        return "border-gray-300 dark:border-gray-700";
    }
  };

  return (
    <StandardPageLayout
      title="Wearable Integration"
      description="Connect and manage wearable devices for real-time updates"
      icon={Watch}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connected Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Watch className="w-5 h-5" />
                Connected Devices
              </CardTitle>
              <CardDescription>Manage your wearable devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map(device => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    data-testid={`device-${device.id}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Watch className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{device.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{device.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Battery className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium">{device.battery}%</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{device.lastSync}</p>
                      </div>
                      <Badge className={`${getStatusBadge(device.status)} border-0 capitalize`}>
                        {device.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline" data-testid="button-add-device">
                <Wifi className="w-4 h-4 mr-2" />
                Add New Device
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Messages synced to your wearable devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} bg-gray-50 dark:bg-gray-800/50 rounded-r-lg`}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                      <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-0 capitalize">
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Health & Activity
              </CardTitle>
              <CardDescription>Daily health metrics from connected devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="space-y-3" data-testid={`metric-${index}`}>
                    <div className="flex items-center gap-2">
                      <metric.icon className={`w-5 h-5 ${metric.color}`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {metric.label}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                    {metric.goal && (
                      <>
                        <Progress
                          value={(parseInt(metric.value.replace(/,/g, '')) / metric.goal) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Goal: {metric.goal.toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="text-sm font-medium">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConnected(!isConnected)}
                  data-testid="button-toggle-connection"
                >
                  {isConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Last synced: 2 minutes ago</p>
                <p>Next sync: In 3 minutes</p>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Push Notifications</Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  data-testid="switch-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="health">Health Monitoring</Label>
                <Switch
                  id="health"
                  checked={healthMonitoring}
                  onCheckedChange={setHealthMonitoring}
                  data-testid="switch-health"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-sync">Auto Sync</Label>
                <Switch id="auto-sync" defaultChecked data-testid="switch-auto-sync" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="vibration">Vibration Alerts</Label>
                <Switch id="vibration" defaultChecked data-testid="switch-vibration" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" data-testid="button-sync">
                Sync Now
              </Button>
              <Button className="w-full" variant="outline" data-testid="button-test">
                Send Test Notification
              </Button>
              <Button className="w-full" variant="outline" data-testid="button-history">
                View Sync History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
