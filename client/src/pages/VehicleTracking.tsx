import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  MapPin, 
  Navigation, 
  Fuel, 
  Gauge, 
  Car,
  Bell,
  BellRing,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  Activity,
  RefreshCw,
  Settings,
  Smartphone,
  Signal,
  Power,
  TrendingUp,
  Eye,
  History
} from 'lucide-react';

interface VehicleTrackingData {
  id: string;
  vehicleId: string;
  latitude: string;
  longitude: string;
  speed: number;
  heading: number;
  engineStatus: string;
  fuelLevel: number;
  odometer: number;
  isMoving: boolean;
  lastUpdated: string;
  deviceId?: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    vin: string;
  };
}

interface ServiceReminder {
  id: string;
  vehicleId: string;
  serviceType: string;
  reminderDate: string;
  status: string;
  mileageThreshold?: number;
  notes?: string;
  priority: string;
}

interface PushNotification {
  id: string;
  title: string;
  body: string;
  notificationType: string;
  priority: string;
  status: string;
  createdAt: string;
  readAt?: string;
}

interface NotificationPreference {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  serviceReminders: boolean;
  appointmentReminders: boolean;
  statusUpdates: boolean;
  promotions: boolean;
  vehicleAlerts: boolean;
}

export default function VehicleTracking() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tracking');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: trackingData, isLoading: loadingTracking, refetch: refetchTracking } = useQuery<VehicleTrackingData[]>({
    queryKey: ['/api/vehicle-tracking'],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const { data: serviceReminders, isLoading: loadingReminders, refetch: refetchReminders } = useQuery<ServiceReminder[]>({
    queryKey: ['/api/service-reminders/due'],
  });

  const { data: notifications, isLoading: loadingNotifications } = useQuery<PushNotification[]>({
    queryKey: ['/api/push-notifications'],
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/push-notifications/unread-count'],
    refetchInterval: 30000,
  });

  const { data: notificationPrefs } = useQuery<NotificationPreference>({
    queryKey: ['/api/notification-preferences'],
  });

  const generateRemindersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/service-reminders/generate', {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-reminders/due'] });
      toast({
        title: t('vehicleTracking.remindersGenerated', 'Reminders Generated'),
        description: t('vehicleTracking.remindersGeneratedDesc', `${data.generated} service reminders created`),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('vehicleTracking.remindersFailed', 'Failed to generate reminders'),
        variant: 'destructive',
      });
    },
  });

  const updateReminderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/service-reminders/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-reminders/due'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('vehicleTracking.reminderUpdated', 'Reminder status updated'),
      });
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('PATCH', `/api/push-notifications/${id}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/push-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/push-notifications/unread-count'] });
    },
  });

  const updateNotificationPrefsMutation = useMutation({
    mutationFn: async (prefs: NotificationPreference) => {
      const response = await apiRequest('PUT', '/api/notification-preferences', prefs);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('vehicleTracking.prefsUpdated', 'Notification preferences saved'),
      });
    },
  });

  const requestBrowserNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast({
          title: t('vehicleTracking.notificationsEnabled', 'Notifications Enabled'),
          description: t('vehicleTracking.notificationsEnabledDesc', 'You will receive browser notifications'),
        });
      }
    }
  }, [t, toast]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const showDemoNotification = () => {
    if (notificationsEnabled && 'Notification' in window) {
      new Notification('SALIS AUTO', {
        body: 'Service reminder: Oil change due for Toyota Camry',
        icon: '/favicon.ico',
        tag: 'service-reminder',
      });
    }
  };

  const getEngineStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'off': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getReminderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'sent': return <Bell className="h-4 w-4 text-blue-500" />;
      case 'snoozed': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const formatSpeed = (speed: number) => {
    return `${speed} km/h`;
  };

  const formatFuelLevel = (level: number) => {
    return `${level}%`;
  };

  const formatOdometer = (km: number) => {
    return `${km.toLocaleString()} km`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="page-vehicle-tracking">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            {t('vehicleTracking.title', 'Real-Time Vehicle Tracking')}
          </h1>
          <p className="text-muted-foreground">
            {t('vehicleTracking.description', 'Monitor vehicle locations, service reminders, and notifications')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              data-testid="switch-auto-refresh"
            />
            <Label htmlFor="auto-refresh" className="text-sm">
              {t('vehicleTracking.autoRefresh', 'Auto-refresh')}
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchTracking()}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.refresh', 'Refresh')}
          </Button>
          {unreadCount && unreadCount.count > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount.count}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tracking" className="flex items-center gap-2" data-testid="tab-tracking">
            <MapPin className="h-4 w-4" />
            {t('vehicleTracking.tabs.tracking', 'Live Tracking')}
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2" data-testid="tab-reminders">
            <Bell className="h-4 w-4" />
            {t('vehicleTracking.tabs.reminders', 'Service Reminders')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
            <BellRing className="h-4 w-4" />
            {t('vehicleTracking.tabs.notifications', 'Notifications')}
            {unreadCount && unreadCount.count > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {unreadCount.count}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2" data-testid="tab-settings">
            <Settings className="h-4 w-4" />
            {t('vehicleTracking.tabs.settings', 'Settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('vehicleTracking.stats.activeVehicles', 'Active Vehicles')}
                </CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-vehicles">
                  {trackingData?.filter(v => v.isMoving).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('vehicleTracking.stats.activeVehiclesDesc', 'Currently in motion')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('vehicleTracking.stats.totalTracked', 'Total Tracked')}
                </CardTitle>
                <Signal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-tracked">
                  {trackingData?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('vehicleTracking.stats.totalTrackedDesc', 'Vehicles with GPS')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('vehicleTracking.stats.avgFuel', 'Avg Fuel Level')}
                </CardTitle>
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-fuel">
                  {trackingData && trackingData.length > 0
                    ? Math.round(trackingData.reduce((acc, v) => acc + (v.fuelLevel || 0), 0) / trackingData.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('vehicleTracking.stats.avgFuelDesc', 'Across all vehicles')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('vehicleTracking.map.title', 'Vehicle Locations')}
              </CardTitle>
              <CardDescription>
                {t('vehicleTracking.map.description', 'Real-time GPS tracking map visualization')}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center space-y-4">
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">{t('vehicleTracking.map.placeholder', 'Map View')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('vehicleTracking.map.placeholderDesc', 'Interactive map with vehicle markers would be displayed here')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('vehicleTracking.map.integration', 'Integrate with Google Maps, Mapbox, or OpenStreetMap')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('vehicleTracking.vehicleList.title', 'Vehicle Status')}
              </CardTitle>
              <CardDescription>
                {t('vehicleTracking.vehicleList.description', 'Current status of all tracked vehicles')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                {loadingTracking ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                ) : trackingData && trackingData.length > 0 ? (
                  <div className="space-y-3">
                    {trackingData.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          selectedVehicle === vehicle.vehicleId ? 'bg-accent border-primary' : ''
                        }`}
                        onClick={() => setSelectedVehicle(vehicle.vehicleId)}
                        data-testid={`vehicle-row-${vehicle.vehicleId}`}
                      >
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Car className="h-6 w-6 text-primary" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getEngineStatusColor(vehicle.engineStatus)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {vehicle.vehicle?.make || 'Unknown'} {vehicle.vehicle?.model || ''}
                            </span>
                            {vehicle.isMoving && (
                              <Badge variant="outline" className="text-xs">
                                <Navigation className="h-3 w-3 mr-1" />
                                {t('vehicleTracking.moving', 'Moving')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Gauge className="h-3 w-3" />
                              {formatSpeed(vehicle.speed || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Fuel className="h-3 w-3" />
                              {formatFuelLevel(vehicle.fuelLevel || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {formatOdometer(vehicle.odometer || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <Badge variant={vehicle.engineStatus === 'running' ? 'default' : 'secondary'}>
                            <Power className="h-3 w-3 mr-1" />
                            {vehicle.engineStatus}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('vehicleTracking.noVehicles', 'No tracked vehicles found')}</p>
                    <p className="text-sm">{t('vehicleTracking.noVehiclesDesc', 'Connect GPS devices to start tracking')}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t('vehicleTracking.reminders.title', 'Service Reminders')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('vehicleTracking.reminders.description', 'Upcoming and overdue service reminders')}
              </p>
            </div>
            <Button
              onClick={() => generateRemindersMutation.mutate()}
              disabled={generateRemindersMutation.isPending}
              data-testid="button-generate-reminders"
            >
              <Wrench className="h-4 w-4 mr-2" />
              {t('vehicleTracking.reminders.generate', 'Generate Reminders')}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('vehicleTracking.reminders.pending', 'Pending')}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-reminders">
                  {serviceReminders?.filter(r => r.status === 'pending').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('vehicleTracking.reminders.sent', 'Sent')}
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-sent-reminders">
                  {serviceReminders?.filter(r => r.status === 'sent').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('vehicleTracking.reminders.completed', 'Completed')}
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-completed-reminders">
                  {serviceReminders?.filter(r => r.status === 'completed').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('vehicleTracking.reminders.list', 'Reminder List')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {loadingReminders ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                ) : serviceReminders && serviceReminders.length > 0 ? (
                  <div className="space-y-3">
                    {serviceReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                        data-testid={`reminder-row-${reminder.id}`}
                      >
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getReminderStatusIcon(reminder.status)}
                            <span className="font-medium">{reminder.serviceType}</span>
                            <Badge variant={getPriorityColor(reminder.priority) as any}>
                              {reminder.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(reminder.reminderDate).toLocaleDateString()}
                            </span>
                            {reminder.mileageThreshold && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {reminder.mileageThreshold.toLocaleString()} km
                              </span>
                            )}
                          </div>
                          {reminder.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{reminder.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {reminder.status !== 'completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateReminderStatusMutation.mutate({ id: reminder.id, status: 'completed' })}
                                data-testid={`button-complete-${reminder.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateReminderStatusMutation.mutate({ id: reminder.id, status: 'snoozed' })}
                                data-testid={`button-snooze-${reminder.id}`}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('vehicleTracking.reminders.noReminders', 'No service reminders')}</p>
                    <p className="text-sm">{t('vehicleTracking.reminders.noRemindersDesc', 'Click "Generate Reminders" to create new reminders')}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t('vehicleTracking.notifications.title', 'Push Notifications')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('vehicleTracking.notifications.description', 'View and manage your notifications')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!notificationsEnabled && (
                <Button
                  variant="outline"
                  onClick={requestBrowserNotificationPermission}
                  data-testid="button-enable-notifications"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {t('vehicleTracking.notifications.enable', 'Enable Browser Notifications')}
                </Button>
              )}
              {notificationsEnabled && (
                <Button
                  variant="outline"
                  onClick={showDemoNotification}
                  data-testid="button-test-notification"
                >
                  <BellRing className="h-4 w-4 mr-2" />
                  {t('vehicleTracking.notifications.test', 'Test Notification')}
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {t('vehicleTracking.notifications.history', 'Notification History')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {loadingNotifications ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-64" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          !notification.readAt ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                        onClick={() => {
                          if (!notification.readAt) {
                            markNotificationReadMutation.mutate(notification.id);
                          }
                        }}
                        data-testid={`notification-row-${notification.id}`}
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <BellRing className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{notification.title}</span>
                            {!notification.readAt && (
                              <Badge variant="default" className="text-xs">
                                {t('vehicleTracking.notifications.new', 'New')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.body}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                            <Badge variant="outline" className="text-xs">
                              {notification.notificationType}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant={getPriorityColor(notification.priority) as any}>
                          {notification.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BellRing className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('vehicleTracking.notifications.noNotifications', 'No notifications yet')}</p>
                    <p className="text-sm">{t('vehicleTracking.notifications.noNotificationsDesc', 'You will see notifications here when they arrive')}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('vehicleTracking.settings.title', 'Notification Settings')}
              </CardTitle>
              <CardDescription>
                {t('vehicleTracking.settings.description', 'Configure how you receive notifications')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">{t('vehicleTracking.settings.channels', 'Notification Channels')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>{t('vehicleTracking.settings.push', 'Push Notifications')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('vehicleTracking.settings.pushDesc', 'Receive browser push notifications')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationPrefs?.pushEnabled ?? true}
                      onCheckedChange={(checked) => {
                        if (notificationPrefs) {
                          updateNotificationPrefsMutation.mutate({ ...notificationPrefs, pushEnabled: checked });
                        }
                      }}
                      data-testid="switch-push-enabled"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>{t('vehicleTracking.settings.email', 'Email Notifications')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('vehicleTracking.settings.emailDesc', 'Receive notifications via email')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationPrefs?.emailEnabled ?? true}
                      onCheckedChange={(checked) => {
                        if (notificationPrefs) {
                          updateNotificationPrefsMutation.mutate({ ...notificationPrefs, emailEnabled: checked });
                        }
                      }}
                      data-testid="switch-email-enabled"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>{t('vehicleTracking.settings.sms', 'SMS Notifications')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('vehicleTracking.settings.smsDesc', 'Receive notifications via SMS')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationPrefs?.smsEnabled ?? true}
                      onCheckedChange={(checked) => {
                        if (notificationPrefs) {
                          updateNotificationPrefsMutation.mutate({ ...notificationPrefs, smsEnabled: checked });
                        }
                      }}
                      data-testid="switch-sms-enabled"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">{t('vehicleTracking.settings.types', 'Notification Types')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vehicleTracking.settings.serviceReminders', 'Service Reminders')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('vehicleTracking.settings.serviceRemindersDesc', 'Reminders for upcoming service')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs?.serviceReminders ?? true}
                      onCheckedChange={(checked) => {
                        if (notificationPrefs) {
                          updateNotificationPrefsMutation.mutate({ ...notificationPrefs, serviceReminders: checked });
                        }
                      }}
                      data-testid="switch-service-reminders"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vehicleTracking.settings.appointmentReminders', 'Appointment Reminders')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('vehicleTracking.settings.appointmentRemindersDesc', 'Reminders for scheduled appointments')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs?.appointmentReminders ?? true}
                      onCheckedChange={(checked) => {
                        if (notificationPrefs) {
                          updateNotificationPrefsMutation.mutate({ ...notificationPrefs, appointmentReminders: checked });
                        }
                      }}
                      data-testid="switch-appointment-reminders"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vehicleTracking.settings.statusUpdates', 'Status Updates')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('vehicleTracking.settings.statusUpdatesDesc', 'Updates on vehicle service status')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs?.statusUpdates ?? true}
                      onCheckedChange={(checked) => {
                        if (notificationPrefs) {
                          updateNotificationPrefsMutation.mutate({ ...notificationPrefs, statusUpdates: checked });
                        }
                      }}
                      data-testid="switch-status-updates"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vehicleTracking.settings.vehicleAlerts', 'Vehicle Alerts')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('vehicleTracking.settings.vehicleAlertsDesc', 'Alerts for vehicle issues')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs?.vehicleAlerts ?? true}
                      onCheckedChange={(checked) => {
                        if (notificationPrefs) {
                          updateNotificationPrefsMutation.mutate({ ...notificationPrefs, vehicleAlerts: checked });
                        }
                      }}
                      data-testid="switch-vehicle-alerts"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vehicleTracking.settings.promotions', 'Promotions & Offers')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('vehicleTracking.settings.promotionsDesc', 'Special offers and promotions')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs?.promotions ?? false}
                      onCheckedChange={(checked) => {
                        if (notificationPrefs) {
                          updateNotificationPrefsMutation.mutate({ ...notificationPrefs, promotions: checked });
                        }
                      }}
                      data-testid="switch-promotions"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{t('vehicleTracking.settings.browserStatus', 'Browser Notification Status')}</p>
                    <p className="text-sm text-muted-foreground">
                      {notificationsEnabled
                        ? t('vehicleTracking.settings.browserEnabled', 'Browser notifications are enabled')
                        : t('vehicleTracking.settings.browserDisabled', 'Browser notifications are disabled')}
                    </p>
                  </div>
                </div>
                {notificationsEnabled ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t('common.enabled', 'Enabled')}
                  </Badge>
                ) : (
                  <Button size="sm" onClick={requestBrowserNotificationPermission}>
                    {t('vehicleTracking.settings.enableBrowser', 'Enable')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
