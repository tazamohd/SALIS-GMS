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
      case 'idle': return 'bg-amber-500';
      case 'off': return 'bg-[#64748B]';
      default: return 'bg-[#64748B]';
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
      case 'sent': return <Bell className="h-4 w-4 text-[#0A5ED7]" />;
      case 'snoozed': return <Clock className="h-4 w-4 text-amber-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-[#F97316]" />;
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
    <div className="container mx-auto py-6 space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen" data-testid="page-vehicle-tracking">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3B] dark:text-white" data-testid="text-page-title">
            {t('vehicleTracking.title', 'Real-Time Vehicle Tracking')}
          </h1>
          <p className="text-[#64748B]">
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
            <Label htmlFor="auto-refresh" className="text-sm text-[#64748B]">
              {t('vehicleTracking.autoRefresh', 'Auto-refresh')}
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchTracking()}
            className="border-[#E2E8F0] dark:border-[#232A36]"
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.refresh', 'Refresh')}
          </Button>
          {unreadCount && unreadCount.count > 0 && (
            <Badge variant="destructive" className="rounded-full bg-[#F97316]">
              {unreadCount.count}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <TabsTrigger value="tracking" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-tracking">
            <MapPin className="h-4 w-4" />
            {t('vehicleTracking.tabs.tracking', 'Live Tracking')}
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-reminders">
            <Bell className="h-4 w-4" />
            {t('vehicleTracking.tabs.reminders', 'Service Reminders')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-notifications">
            <BellRing className="h-4 w-4" />
            {t('vehicleTracking.tabs.notifications', 'Notifications')}
            {unreadCount && unreadCount.count > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs bg-[#0A5ED7]/10 text-[#0A5ED7]">
                {unreadCount.count}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-settings">
            <Settings className="h-4 w-4" />
            {t('vehicleTracking.tabs.settings', 'Settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">
                  {t('vehicleTracking.stats.activeVehicles', 'Active Vehicles')}
                </CardTitle>
                <Car className="h-4 w-4 text-[#0A5ED7]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-active-vehicles">
                  {trackingData?.filter(v => v.isMoving).length || 0}
                </div>
                <p className="text-xs text-[#64748B]">
                  {t('vehicleTracking.stats.activeVehiclesDesc', 'Currently in motion')}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">
                  {t('vehicleTracking.stats.totalTracked', 'Total Tracked')}
                </CardTitle>
                <Signal className="h-4 w-4 text-[#0A5ED7]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-tracked">
                  {trackingData?.length || 0}
                </div>
                <p className="text-xs text-[#64748B]">
                  {t('vehicleTracking.stats.totalTrackedDesc', 'Vehicles with GPS')}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">
                  {t('vehicleTracking.stats.avgFuel', 'Avg Fuel Level')}
                </CardTitle>
                <Fuel className="h-4 w-4 text-[#0A5ED7]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-avg-fuel">
                  {trackingData && trackingData.length > 0
                    ? Math.round(trackingData.reduce((acc, v) => acc + (v.fuelLevel || 0), 0) / trackingData.length)
                    : 0}%
                </div>
                <p className="text-xs text-[#64748B]">
                  {t('vehicleTracking.stats.avgFuelDesc', 'Across all vehicles')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="h-96 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <MapPin className="h-5 w-5 text-[#0A5ED7]" />
                {t('vehicleTracking.map.title', 'Vehicle Locations')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('vehicleTracking.map.description', 'Real-time GPS tracking map visualization')}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
              <div className="text-center space-y-4">
                <MapPin className="h-16 w-16 mx-auto text-[#0A5ED7]" />
                <div>
                  <p className="text-lg font-medium text-[#0B1F3B] dark:text-white">{t('vehicleTracking.map.placeholder', 'Map View')}</p>
                  <p className="text-sm text-[#64748B]">
                    {t('vehicleTracking.map.placeholderDesc', 'Interactive map with vehicle markers would be displayed here')}
                  </p>
                  <p className="text-xs text-[#64748B] mt-2">
                    {t('vehicleTracking.map.integration', 'Integrate with Google Maps, Mapbox, or OpenStreetMap')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Activity className="h-5 w-5 text-[#0A5ED7]" />
                {t('vehicleTracking.vehicleList.title', 'Vehicle Status')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('vehicleTracking.vehicleList.description', 'Current status of all tracked vehicles')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                {loadingTracking ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
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
                        className={`flex items-center gap-4 p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg cursor-pointer transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] ${
                          selectedVehicle === vehicle.vehicleId ? 'bg-[#0A5ED7]/5 border-[#0A5ED7]' : ''
                        }`}
                        onClick={() => setSelectedVehicle(vehicle.vehicleId)}
                        data-testid={`vehicle-row-${vehicle.vehicleId}`}
                      >
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 flex items-center justify-center">
                            <Car className="h-6 w-6 text-[#0A5ED7]" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#151A23] ${getEngineStatusColor(vehicle.engineStatus)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#0B1F3B] dark:text-white">
                              {vehicle.vehicle?.make || 'Unknown'} {vehicle.vehicle?.model || ''}
                            </span>
                            {vehicle.isMoving && (
                              <Badge variant="outline" className="text-xs border-[#0A5ED7] text-[#0A5ED7]">
                                <Navigation className="h-3 w-3 mr-1" />
                                {t('vehicleTracking.moving', 'Moving')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#64748B] mt-1">
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
                          <Badge variant={vehicle.engineStatus === 'running' ? 'default' : 'secondary'} className={vehicle.engineStatus === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0' : 'bg-[#64748B]/10 text-[#64748B] border-0'}>
                            <Power className="h-3 w-3 mr-1" />
                            {vehicle.engineStatus}
                          </Badge>
                          <div className="text-xs text-[#64748B] mt-1">
                            {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#64748B]">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-[#0B1F3B] dark:text-white">{t('vehicleTracking.noVehicles', 'No tracked vehicles found')}</p>
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
              <h2 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">{t('vehicleTracking.reminders.title', 'Service Reminders')}</h2>
              <p className="text-sm text-[#64748B]">
                {t('vehicleTracking.reminders.description', 'Upcoming and overdue service reminders')}
              </p>
            </div>
            <Button
              onClick={() => generateRemindersMutation.mutate()}
              disabled={generateRemindersMutation.isPending}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
              data-testid="button-generate-reminders"
            >
              <Wrench className="h-4 w-4 mr-2" />
              {t('vehicleTracking.reminders.generate', 'Generate Reminders')}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">
                  {t('vehicleTracking.reminders.pending', 'Pending')}
                </CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-pending-reminders">
                  {serviceReminders?.filter(r => r.status === 'pending').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">
                  {t('vehicleTracking.reminders.sent', 'Sent')}
                </CardTitle>
                <Bell className="h-4 w-4 text-[#0A5ED7]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0A5ED7] dark:text-[#0BB3FF]" data-testid="text-sent-reminders">
                  {serviceReminders?.filter(r => r.status === 'sent').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">
                  {t('vehicleTracking.reminders.completed', 'Completed')}
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-completed-reminders">
                  {serviceReminders?.filter(r => r.status === 'completed').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vehicleTracking.reminders.list', 'Reminder List')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {loadingReminders ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
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
                        className="flex items-center gap-4 p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg"
                        data-testid={`reminder-row-${reminder.id}`}
                      >
                        <div className="h-10 w-10 rounded-lg bg-[#0A5ED7]/10 flex items-center justify-center">
                          {getReminderStatusIcon(reminder.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#0B1F3B] dark:text-white">{reminder.serviceType}</span>
                            <Badge className={reminder.priority === 'high' ? 'bg-[#F97316]/10 text-[#F97316] border-0' : 'bg-[#64748B]/10 text-[#64748B] border-0'}>
                              {reminder.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#64748B]">
                            Due: {new Date(reminder.reminderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#E2E8F0] dark:border-[#232A36]"
                            onClick={() => updateReminderStatusMutation.mutate({ id: reminder.id, status: 'completed' })}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#64748B]">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-[#0B1F3B] dark:text-white">{t('vehicleTracking.noReminders', 'No service reminders')}</p>
                    <p className="text-sm">{t('vehicleTracking.noRemindersDesc', 'Generate reminders based on vehicle service schedules')}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vehicleTracking.notifications.title', 'Recent Notifications')}</CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('vehicleTracking.notifications.description', 'Your recent alerts and notifications')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {loadingNotifications ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg cursor-pointer transition-colors ${
                          !notification.readAt ? 'bg-[#0A5ED7]/5' : ''
                        }`}
                        onClick={() => markNotificationReadMutation.mutate(notification.id)}
                        data-testid={`notification-${notification.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-[#0B1F3B] dark:text-white">{notification.title}</h4>
                            <p className="text-sm text-[#64748B] mt-1">{notification.body}</p>
                          </div>
                          {!notification.readAt && (
                            <div className="h-2 w-2 rounded-full bg-[#0A5ED7]" />
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#64748B]">
                    <BellRing className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-[#0B1F3B] dark:text-white">{t('vehicleTracking.noNotifications', 'No notifications')}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vehicleTracking.settings.browser', 'Browser Notifications')}</CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('vehicleTracking.settings.browserDesc', 'Enable browser push notifications for real-time alerts')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-[#0A5ED7]" />
                  <span className="text-[#0B1F3B] dark:text-white">{t('vehicleTracking.settings.pushNotifications', 'Push Notifications')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {notificationsEnabled ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">{t('vehicleTracking.settings.enabled', 'Enabled')}</Badge>
                  ) : (
                    <Button size="sm" onClick={requestBrowserNotificationPermission} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
                      {t('vehicleTracking.settings.enable', 'Enable')}
                    </Button>
                  )}
                </div>
              </div>
              {notificationsEnabled && (
                <Button variant="outline" onClick={showDemoNotification} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('vehicleTracking.settings.testNotification', 'Send Test Notification')}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
