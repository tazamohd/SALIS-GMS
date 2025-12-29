import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation, Radio, Map, Route, AlertTriangle, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TabsPageLayout, TabConfig } from '@/components/layouts';

export default function FleetTracking() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [isGeofenceDialogOpen, setIsGeofenceDialogOpen] = useState(false);
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    zoneType: 'service_area',
    centerLatitude: '',
    centerLongitude: '',
    radius: '',
    alertOnEntry: false,
    alertOnExit: false,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const { data: geofences = [], isLoading: geofencesLoading } = useQuery({
    queryKey: ['/api/fleet/geofences'],
  });

  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ['/api/fleet/routes'],
  });

  const { data: geofenceEvents = [] } = useQuery({
    queryKey: ['/api/fleet/geofence-events'],
  });

  const createGeofenceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/fleet/geofences', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fleet/geofences'] });
      setIsGeofenceDialogOpen(false);
      setNewGeofence({
        name: '',
        zoneType: 'service_area',
        centerLatitude: '',
        centerLongitude: '',
        radius: '',
        alertOnEntry: false,
        alertOnExit: false,
      });
      toast({
        title: t('vehicles.geofenceCreated', 'Geofence Created'),
        description: t('vehicles.geofenceCreatedSuccessfully', 'The geofence zone has been created successfully.'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('vehicles.failedToCreateGeofence', 'Failed to create geofence zone.'),
        variant: "destructive",
      });
    },
  });

  const deleteGeofenceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/fleet/geofences/${id}`, 'DELETE', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fleet/geofences'] });
      toast({
        title: t('vehicles.geofenceDeleted', 'Geofence Deleted'),
        description: t('vehicles.geofenceDeletedSuccessfully', 'The geofence zone has been deleted successfully.'),
      });
    },
  });

  const handleCreateGeofence = () => {
    if (!newGeofence.name || !newGeofence.centerLatitude || !newGeofence.centerLongitude || !newGeofence.radius) {
      toast({
        title: t('common.error', 'Validation Error'),
        description: t('vehicles.pleaseFillAllRequiredFields', 'Please fill in all required fields.'),
        variant: "destructive",
      });
      return;
    }

    const geometry = {
      type: "Point",
      coordinates: [parseFloat(newGeofence.centerLongitude), parseFloat(newGeofence.centerLatitude)],
    };

    createGeofenceMutation.mutate({
      ...newGeofence,
      centerLatitude: parseFloat(newGeofence.centerLatitude),
      centerLongitude: parseFloat(newGeofence.centerLongitude),
      radius: parseFloat(newGeofence.radius),
      geometry,
    });
  };

  const activeVehicles = vehicles.length;
  const activeGeofences = geofences.filter((g: any) => g.isActive).length;
  const activeRoutes = routes.filter((r: any) => r.status === 'in_progress').length;
  const recentEvents = geofenceEvents.filter((e: any) => {
    const eventTime = new Date(e.timestamp);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return eventTime > hourAgo;
  }).length;

  const tabs: TabConfig[] = [
    {
      id: 'overview',
      label: t('vehicles.fleetOverview', 'Fleet Overview'),
      icon: Map,
      content: (
        <Card className="bg-white dark:bg-salis-black">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('vehicles.liveFleetOverview', 'Live Fleet Overview')}</CardTitle>
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder={t('vehicles.filterByVehicle', 'Filter by vehicle...')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('vehicles.allVehicles', 'All Vehicles')}</SelectItem>
                {vehicles.map((vehicle: any) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('vehicles.noVehiclesFoundAddToTrack', 'No vehicles found. Add vehicles to start tracking.')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3">{t('vehicles.vehicle', 'Vehicle')}</th>
                      <th className="pb-3">{t('common.status', 'Status')}</th>
                      <th className="pb-3">{t('vehicles.lastKnownLocation', 'Last Known Location')}</th>
                      <th className="pb-3">{t('vehicles.speed', 'Speed')}</th>
                      <th className="pb-3">{t('vehicles.lastUpdated', 'Last Updated')}</th>
                      <th className="pb-3">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle: any) => (
                      <tr key={vehicle.id} className="border-b" data-testid={`vehicle-row-${vehicle.id}`}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                              <div className="text-sm text-gray-500">{vehicle.licensePlate}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 border-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('common.active', 'Active')}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('vehicles.awaitingGPSData', 'Awaiting GPS data')}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">-</span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">-</span>
                        </td>
                        <td className="py-3">
                          <Button size="sm" variant="outline" data-testid={`button-view-${vehicle.id}`}>
                            <Navigation className="h-4 w-4 mr-1" />
                            {t('common.view', 'View')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'geofences',
      label: t('vehicles.geofences', 'Geofences'),
      icon: Radio,
      badge: geofences.length,
      content: (
        <Card className="bg-white dark:bg-salis-black">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('vehicles.geofenceZones', 'Geofence Zones')}</CardTitle>
            <Button onClick={() => setIsGeofenceDialogOpen(true)} data-testid="button-create-geofence">
              <Radio className="h-4 w-4 mr-2" />
              {t('vehicles.createGeofence', 'Create Geofence')}
            </Button>
          </CardHeader>
          <CardContent>
            {geofencesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : geofences.length === 0 ? (
              <div className="text-center py-12">
                <Radio className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('vehicles.noGeofenceZonesConfigured', 'No geofence zones configured yet')}
                </p>
                <Button className="mt-4" onClick={() => setIsGeofenceDialogOpen(true)}>
                  {t('vehicles.createFirstGeofence', 'Create First Geofence')}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3">{t('vehicles.name', 'Name')}</th>
                      <th className="pb-3">{t('common.type', 'Type')}</th>
                      <th className="pb-3">{t('vehicles.center', 'Center')}</th>
                      <th className="pb-3">{t('vehicles.radius', 'Radius')}</th>
                      <th className="pb-3">{t('vehicles.alerts', 'Alerts')}</th>
                      <th className="pb-3">{t('common.status', 'Status')}</th>
                      <th className="pb-3">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geofences.map((zone: any) => (
                      <tr key={zone.id} className="border-b" data-testid={`geofence-row-${zone.id}`}>
                        <td className="py-3 font-medium">{zone.name}</td>
                        <td className="py-3">
                          <Badge variant="outline">{zone.zoneType}</Badge>
                        </td>
                        <td className="py-3 text-sm font-mono">
                          {zone.centerLatitude?.toFixed(4)}, {zone.centerLongitude?.toFixed(4)}
                        </td>
                        <td className="py-3 text-sm">{zone.radius ? `${zone.radius}m` : '-'}</td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            {zone.alertOnEntry && <Badge variant="outline" className="text-xs">{t('vehicles.entry', 'Entry')}</Badge>}
                            {zone.alertOnExit && <Badge variant="outline" className="text-xs">{t('vehicles.exit', 'Exit')}</Badge>}
                            {!zone.alertOnEntry && !zone.alertOnExit && <span className="text-sm text-gray-500">{t('common.none', 'None')}</span>}
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge className={zone.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 border-0' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 border-0'}>
                            {zone.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteGeofenceMutation.mutate(zone.id)}
                            disabled={deleteGeofenceMutation.isPending}
                            data-testid={`button-delete-${zone.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'routes',
      label: t('vehicles.routes', 'Routes'),
      icon: Route,
      badge: routes.length,
      content: (
        <Card className="bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle>{t('vehicles.plannedRoutes', 'Planned Routes')}</CardTitle>
          </CardHeader>
          <CardContent>
            {routesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : routes.length === 0 ? (
              <div className="text-center py-12">
                <Route className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('vehicles.noRoutesPlannedYet', 'No routes planned yet')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {routes.map((route: any) => (
                  <div key={route.id} className="p-4 border rounded-lg" data-testid={`route-${route.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-lg">{route.routeName}</h3>
                      <Badge variant="outline">{route.status}</Badge>
                    </div>
                    {route.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{route.description}</p>
                    )}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{t('vehicles.distance', 'Distance')}:</span>
                        <span className="ml-2 font-medium">{route.totalDistance ? `${route.totalDistance} km` : '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('vehicles.duration', 'Duration')}:</span>
                        <span className="ml-2 font-medium">{route.estimatedDuration ? `${route.estimatedDuration} min` : '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('vehicles.created', 'Created')}:</span>
                        <span className="ml-2 font-medium">{format(new Date(route.createdAt), 'PP')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'events',
      label: t('vehicles.events', 'Events'),
      icon: AlertTriangle,
      badge: geofenceEvents.length,
      content: (
        <Card className="bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle>{t('vehicles.geofenceEvents', 'Geofence Events')}</CardTitle>
          </CardHeader>
          <CardContent>
            {geofenceEvents.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('vehicles.noGeofenceEventsRecorded', 'No geofence events recorded yet')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {geofenceEvents.map((event: any) => (
                  <div key={event.id} className="p-4 border rounded-lg" data-testid={`event-${event.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${event.eventType === 'entry' ? 'text-green-500' : 'text-orange-500'}`} />
                        <div>
                          <div className="font-medium">
                            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} {t('vehicles.event', 'Event')}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {format(new Date(event.timestamp), 'PPpp')}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.eventType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <>
      <TabsPageLayout
        title={t('vehicles.fleetTrackingGPSManagement', 'Fleet Tracking & GPS Management')}
        description={t('vehicles.realTimeVehicleTrackingGeofencingRouteManagement', 'Real-time vehicle tracking, geofencing, and route management')}
        icon={MapPin}
        tabs={tabs}
        defaultTab="overview"
        headerContent={
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[
              { name: t('vehicles.activeVehicles', 'Active Vehicles'), value: activeVehicles, icon: MapPin, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
              { name: t('vehicles.activeGeofences', 'Active Geofences'), value: activeGeofences, icon: Radio, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
              { name: t('vehicles.activeRoutes', 'Active Routes'), value: activeRoutes, icon: Route, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
              { name: t('vehicles.recentEvents', 'Recent Events'), value: recentEvents, icon: AlertTriangle, color: recentEvents > 0 ? 'text-orange-500' : 'text-gray-500', bgColor: recentEvents > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-900/30' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.name} className="bg-white dark:bg-salis-black">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <Badge variant="outline" className="text-xs">{t('vehicles.live', 'Live')}</Badge>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.name}</h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid={`stat-${stat.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        }
      />

      <Dialog open={isGeofenceDialogOpen} onOpenChange={setIsGeofenceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('vehicles.createGeofenceZone', 'Create Geofence Zone')}</DialogTitle>
            <DialogDescription>
              {t('vehicles.defineCircularGeofenceZone', 'Define a circular geofence zone to monitor vehicle entry and exit events.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('vehicles.zoneName', 'Zone Name')} *</Label>
              <Input
                id="name"
                placeholder={t('vehicles.zoneNamePlaceholder', 'e.g., Downtown Service Area')}
                value={newGeofence.name}
                onChange={(e) => setNewGeofence({ ...newGeofence, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="zoneType">{t('vehicles.zoneType', 'Zone Type')}</Label>
              <Select value={newGeofence.zoneType} onValueChange={(value) => setNewGeofence({ ...newGeofence, zoneType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service_area">{t('vehicles.serviceArea', 'Service Area')}</SelectItem>
                  <SelectItem value="restricted">{t('vehicles.restrictedArea', 'Restricted Area')}</SelectItem>
                  <SelectItem value="preferred_route">{t('vehicles.preferredRoute', 'Preferred Route')}</SelectItem>
                  <SelectItem value="customer_location">{t('vehicles.customerLocation', 'Customer Location')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">{t('vehicles.latitude', 'Latitude')} *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 24.7136"
                  value={newGeofence.centerLatitude}
                  onChange={(e) => setNewGeofence({ ...newGeofence, centerLatitude: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="longitude">{t('vehicles.longitude', 'Longitude')} *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 46.6753"
                  value={newGeofence.centerLongitude}
                  onChange={(e) => setNewGeofence({ ...newGeofence, centerLongitude: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="radius">{t('vehicles.radiusMeters', 'Radius (meters)')} *</Label>
              <Input
                id="radius"
                type="number"
                placeholder="e.g., 500"
                value={newGeofence.radius}
                onChange={(e) => setNewGeofence({ ...newGeofence, radius: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGeofence.alertOnEntry}
                  onChange={(e) => setNewGeofence({ ...newGeofence, alertOnEntry: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">{t('vehicles.alertOnEntry', 'Alert on Entry')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGeofence.alertOnExit}
                  onChange={(e) => setNewGeofence({ ...newGeofence, alertOnExit: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">{t('vehicles.alertOnExit', 'Alert on Exit')}</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGeofenceDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleCreateGeofence} disabled={createGeofenceMutation.isPending}>
              {createGeofenceMutation.isPending ? t('vehicles.creating', 'Creating...') : t('vehicles.createGeofence', 'Create Geofence')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
