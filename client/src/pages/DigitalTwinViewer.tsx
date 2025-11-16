import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Box, RotateCcw, Eye, Layers, Activity, Settings } from 'lucide-react';
import { TabsPageLayout } from '@/components/layouts';

export default function DigitalTwinViewer() {
  const [rotationX, setRotationX] = useState(20);
  const [rotationY, setRotationY] = useState(45);
  const [zoom, setZoom] = useState(100);
  const [activeLayer, setActiveLayer] = useState('all');

  const resetView = () => {
    setRotationX(20);
    setRotationY(45);
    setZoom(100);
  };

  const vehicleStats = [
    { label: 'Engine Temp', value: '92°C', status: 'normal', color: 'text-green-500' },
    { label: 'Oil Pressure', value: '45 PSI', status: 'normal', color: 'text-green-500' },
    { label: 'Battery', value: '12.6V', status: 'normal', color: 'text-green-500' },
    { label: 'Tire Pressure', value: '32 PSI', status: 'warning', color: 'text-yellow-500' },
  ];

  const viewerTab = (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-3 bg-white dark:bg-salis-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-cyan-600" />
              3D Vehicle Model
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={resetView} data-testid="button-reset-view">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-8 h-[500px] flex items-center justify-center overflow-hidden">
            <div
              className="relative transition-transform duration-300"
              style={{
                transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${zoom / 100})`,
              }}
              data-testid="vehicle-3d-model"
            >
              <div className="relative w-64 h-40">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-2xl border-4 border-blue-400">
                  <div className="absolute top-4 left-8 right-8 h-16 bg-gradient-to-r from-blue-700 to-blue-500 rounded-t-lg" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-gray-900 rounded-full border-2 border-gray-400" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-gray-900 rounded-full border-2 border-gray-400" />
                </div>
                
                {(activeLayer === 'sensors' || activeLayer === 'all') && (
                  <>
                    <div className="absolute top-2 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Front sensor" />
                    <div className="absolute bottom-2 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" title="Wheel sensor" />
                    <div className="absolute bottom-2 right-4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" title="Wheel sensor" />
                    <div className="absolute top-1/2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Side sensor" />
                  </>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-950/50 to-transparent pointer-events-none">
              <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="cyan" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rotation X: {rotationX}°
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rotation Y: {rotationY}°
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Zoom: {zoom}%
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

      <Card className="bg-white dark:bg-salis-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" />
            View Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant={activeLayer === 'all' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setActiveLayer('all')}
            data-testid="button-layer-all"
          >
            All Layers
          </Button>
          <Button
            variant={activeLayer === 'sensors' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setActiveLayer('sensors')}
            data-testid="button-layer-sensors"
          >
            Sensors Only
          </Button>
          <Button
            variant={activeLayer === 'structure' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setActiveLayer('structure')}
            data-testid="button-layer-structure"
          >
            Structure Only
          </Button>
        </CardContent>

        <CardHeader className="pt-6">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Live Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vehicleStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-700 dark:text-gray-300">{stat.label}</span>
              <Badge variant="outline" className={stat.color}>
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
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Engine Status</h4>
        <p className="text-sm text-green-700 dark:text-green-300">All systems operational</p>
      </div>
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Tire Pressure</h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">Front left: 30 PSI (low)</p>
      </div>
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Brake System</h4>
        <p className="text-sm text-green-700 dark:text-green-300">Optimal performance</p>
      </div>
    </div>
  );

  const historyTab = (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
      <p>No simulation history available</p>
    </div>
  );

  return (
    <TabsPageLayout
      title="Digital Twin 3D Viewer"
      description="Interactive 3D vehicle visualization with real-time sensor data and diagnostic overlays"
      icon={Box}
      tabs={[
        {
          id: "viewer",
          label: "3D Viewer",
          icon: Eye,
          content: viewerTab,
        },
        {
          id: "diagnostics",
          label: "Diagnostics",
          icon: Activity,
          content: diagnosticsTab,
        },
        {
          id: "history",
          label: "History",
          content: historyTab,
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          content: (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Settings coming soon</p>
            </div>
          ),
        },
      ]}
      defaultTab="viewer"
    />
  );
}
