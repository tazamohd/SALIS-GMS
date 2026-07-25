import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Box, RotateCcw, Eye, Layers, Activity, Settings, Loader2 } from 'lucide-react';
import { TabsPageLayout } from '@/components/layouts';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  year?: number;
}

interface VehicleDetail {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  year?: number;
  mileage?: number;
  status?: string;
}

interface ServiceHistoryEntry {
  id: string;
  date: string;
  type: string;
  description: string;
  nextServiceDate?: string;
}

interface SensorStats {
  label: string;
  value: string;
  status: string;
  color: string;
}

export default function DigitalTwinViewer() {
  const { t } = useTranslation();
  const [rotationX, setRotationX] = useState(20);
  const [rotationY, setRotationY] = useState(45);
  const [zoom, setZoom] = useState(100);
  const [activeLayer, setActiveLayer] = useState('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [liveStats, setLiveStats] = useState<SensorStats[] | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const resetView = () => {
    setRotationX(20);
    setRotationY(45);
    setZoom(100);
  };

  // Fetch list of vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  // Fetch selected vehicle details
  const { data: vehicleDetail } = useQuery<VehicleDetail>({
    queryKey: ['/api/vehicles', selectedVehicleId],
    enabled: !!selectedVehicleId,
  });

  // Fetch service history for selected vehicle
  const { data: serviceHistory = [] } = useQuery<ServiceHistoryEntry[]>({
    queryKey: ['/api/service-history', { vehicleId: selectedVehicleId }],
    enabled: !!selectedVehicleId,
  });

  // WebSocket connection for live sensor updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'sensor_update') {
          setLiveStats(data.stats);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {
      // WebSocket error - will use fallback data
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  // Derive stats from live data, vehicle detail, or defaults
  const defaultStats: SensorStats[] = [
    { label: t('digitalTwin.engineTemp', 'Engine Temp'), value: '92°C', status: 'normal', color: 'text-green-500' },
    { label: t('digitalTwin.oilPressure', 'Oil Pressure'), value: '45 PSI', status: 'normal', color: 'text-green-500' },
    { label: t('digitalTwin.battery', 'Battery'), value: '12.6V', status: 'normal', color: 'text-green-500' },
    { label: t('digitalTwin.tirePressure', 'Tire Pressure'), value: '32 PSI', status: 'warning', color: 'text-[#F97316]' },
  ];

  const vehicleStats = liveStats || defaultStats;

  // Derive last service and next service from service history
  const lastService = serviceHistory.length > 0
    ? serviceHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
  const nextServiceDue = lastService?.nextServiceDate || null;

  const viewerTab = (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-3 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#0B1F3B] dark:text-white">
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#0A5ED7]" />
              {t('digitalTwin.3dVehicleModel', '3D Vehicle Model')}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={resetView} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-reset-view">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('digitalTwin.resetView', 'Reset View')}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Vehicle Selector */}
          <div className="mb-4">
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger className="w-full bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="vehicle-selector">
                <SelectValue placeholder={vehiclesLoading ? t('common.loading', 'Loading...') : t('digitalTwin.selectVehicle', 'Select a vehicle...')} />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(vehicles) && vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''} - {vehicle.licensePlate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Info Bar */}
          {vehicleDetail && (
            <div className="mb-4 flex flex-wrap gap-4 p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
              <div className="text-sm text-[#0B1F3B] dark:text-white">
                <span className="text-[#64748B]">{t('digitalTwin.vehicle', 'Vehicle')}:</span>{' '}
                {vehicleDetail.make} {vehicleDetail.model}
              </div>
              {vehicleDetail.mileage && (
                <div className="text-sm text-[#0B1F3B] dark:text-white">
                  <span className="text-[#64748B]">{t('digitalTwin.mileage', 'Mileage')}:</span>{' '}
                  {vehicleDetail.mileage.toLocaleString()} km
                </div>
              )}
              {lastService && (
                <div className="text-sm text-[#0B1F3B] dark:text-white">
                  <span className="text-[#64748B]">{t('digitalTwin.lastService', 'Last Service')}:</span>{' '}
                  {new Date(lastService.date).toLocaleDateString()}
                </div>
              )}
              {nextServiceDue && (
                <div className="text-sm text-[#0B1F3B] dark:text-white">
                  <span className="text-[#64748B]">{t('digitalTwin.nextServiceDue', 'Next Service Due')}:</span>{' '}
                  <Badge variant="outline" className="text-[#F97316] border-[#F97316]/30">
                    {new Date(nextServiceDue).toLocaleDateString()}
                  </Badge>
                </div>
              )}
            </div>
          )}

          <div className="relative bg-gradient-to-b from-[#0E1117] to-[#151A23] rounded-lg p-8 h-[500px] flex items-center justify-center overflow-hidden border border-[#232A36]">
            <div
              className="relative transition-transform duration-300"
              style={{
                transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${zoom / 100})`,
              }}
              data-testid="vehicle-3d-model"
            >
              <div className="relative w-64 h-40">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] rounded-lg shadow-2xl border-4 border-[#0BB3FF]">
                  <div className="absolute top-4 left-8 right-8 h-16 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-t-lg opacity-80" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-[#0E1117] rounded-full border-2 border-[#232A36]" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-[#0E1117] rounded-full border-2 border-[#232A36]" />
                </div>

                {(activeLayer === 'sensors' || activeLayer === 'all') && (
                  <>
                    <div className="absolute top-2 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-pulse" title={t('digitalTwin.frontSensor', 'Front sensor')} />
                    <div className="absolute bottom-2 left-4 w-3 h-3 bg-[#F97316] rounded-full animate-pulse" title={t('digitalTwin.wheelSensor', 'Wheel sensor')} />
                    <div className="absolute bottom-2 right-4 w-3 h-3 bg-[#F97316] rounded-full animate-pulse" title={t('digitalTwin.wheelSensor', 'Wheel sensor')} />
                    <div className="absolute top-1/2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse" title={t('digitalTwin.sideSensor', 'Side sensor')} />
                  </>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A5ED7]/20 to-transparent pointer-events-none">
              <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0BB3FF" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                  {t('digitalTwin.rotationX', 'Rotation X')}: {rotationX}°
                </label>
                <Slider
                  value={[rotationX]}
                  onValueChange={(val) => setRotationX(val[0])}
                  min={-90}
                  max={90}
                  step={1}
                  data-testid="slider-rotation-x"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                  {t('digitalTwin.rotationY', 'Rotation Y')}: {rotationY}°
                </label>
                <Slider
                  value={[rotationY]}
                  onValueChange={(val) => setRotationY(val[0])}
                  min={0}
                  max={360}
                  step={1}
                  data-testid="slider-rotation-y"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                  {t('digitalTwin.zoom', 'Zoom')}: {zoom}%
                </label>
                <Slider
                  value={[zoom]}
                  onValueChange={(val) => setZoom(val[0])}
                  min={50}
                  max={200}
                  step={5}
                  data-testid="slider-zoom"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Layers className="h-5 w-5 text-[#0BB3FF]" />
            {t('digitalTwin.viewLayers', 'View Layers')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant={activeLayer === 'all' ? 'default' : 'outline'}
            className={`w-full justify-start ${activeLayer === 'all' ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white' : 'border-[#E2E8F0] dark:border-[#232A36]'}`}
            onClick={() => setActiveLayer('all')}
            data-testid="button-layer-all"
          >
            {t('digitalTwin.allLayers', 'All Layers')}
          </Button>
          <Button
            variant={activeLayer === 'sensors' ? 'default' : 'outline'}
            className={`w-full justify-start ${activeLayer === 'sensors' ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white' : 'border-[#E2E8F0] dark:border-[#232A36]'}`}
            onClick={() => setActiveLayer('sensors')}
            data-testid="button-layer-sensors"
          >
            {t('digitalTwin.sensorsOnly', 'Sensors Only')}
          </Button>
          <Button
            variant={activeLayer === 'structure' ? 'default' : 'outline'}
            className={`w-full justify-start ${activeLayer === 'structure' ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white' : 'border-[#E2E8F0] dark:border-[#232A36]'}`}
            onClick={() => setActiveLayer('structure')}
            data-testid="button-layer-structure"
          >
            {t('digitalTwin.structureOnly', 'Structure Only')}
          </Button>
        </CardContent>

        <CardHeader className="pt-6">
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Activity className="h-5 w-5 text-green-500" />
            {t('digitalTwin.liveTelemetry', 'Live Telemetry')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vehicleStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded border border-[#E2E8F0] dark:border-[#232A36]">
              <span className="text-sm text-[#0B1F3B] dark:text-white">{stat.label}</span>
              <Badge variant="outline" className={`${stat.color} border-[#E2E8F0] dark:border-[#232A36]`}>
                {stat.value}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const diagnosticsTab = (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">{t('digitalTwin.engineStatus', 'Engine Status')}</h4>
        <p className="text-sm text-green-700 dark:text-green-300">{t('digitalTwin.allSystemsOperational', 'All systems operational')}</p>
      </div>
      <div className="p-4 bg-[#F97316]/10 rounded-lg border border-[#F97316]/30">
        <h4 className="font-semibold text-[#F97316] mb-2">{t('digitalTwin.tirePressure', 'Tire Pressure')}</h4>
        <p className="text-sm text-[#F97316]/80">{t('digitalTwin.frontLeftLow', 'Front left: 30 PSI (low)')}</p>
      </div>
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">{t('digitalTwin.brakeSystem', 'Brake System')}</h4>
        <p className="text-sm text-green-700 dark:text-green-300">{t('digitalTwin.optimalPerformance', 'Optimal performance')}</p>
      </div>
    </div>
  );

  const historyTab = (
    <div>
      {serviceHistory.length === 0 ? (
        <div className="text-center py-8 text-[#64748B]">
          <p>{selectedVehicleId ? t('digitalTwin.noServiceHistory', 'No service history for this vehicle') : t('digitalTwin.selectVehicleForHistory', 'Select a vehicle to view service history')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {serviceHistory.map((entry) => (
            <div key={entry.id} className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-[#0B1F3B] dark:text-white">{entry.type}</span>
                <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">
                  {new Date(entry.date).toLocaleDateString()}
                </Badge>
              </div>
              <p className="text-sm text-[#64748B]">{entry.description}</p>
              {entry.nextServiceDate && (
                <p className="text-xs text-[#F97316] mt-1">
                  {t('digitalTwin.nextServiceDue', 'Next Service Due')}: {new Date(entry.nextServiceDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <TabsPageLayout
      title={t('digitalTwin.title', 'Digital Twin 3D Viewer')}
      description={t('digitalTwin.description', 'Interactive 3D vehicle visualization with real-time sensor data and diagnostic overlays')}
      icon={Box}
      tabs={[
        {
          id: "viewer",
          label: t('digitalTwin.3dViewer', '3D Viewer'),
          icon: Eye,
          content: viewerTab,
        },
        {
          id: "diagnostics",
          label: t('digitalTwin.diagnostics', 'Diagnostics'),
          icon: Activity,
          content: diagnosticsTab,
        },
        {
          id: "history",
          label: t('digitalTwin.history', 'History'),
          content: historyTab,
        },
        {
          id: "settings",
          label: t('common.settings', 'Settings'),
          icon: Settings,
          content: (
            <div className="text-center py-8 text-[#64748B]">
              <p>{t('common.comingSoon', 'Settings coming soon')}</p>
            </div>
          ),
        },
      ]}
      defaultTab="viewer"
    />
  );
}
