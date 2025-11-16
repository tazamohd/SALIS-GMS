import { useState } from "react";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Glasses, Play, Pause, RotateCw, ZoomIn, ZoomOut, Maximize, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function VRShowroom() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rotation, setRotation] = useState([0]);
  const [zoom, setZoom] = useState([1]);

  const vehicles = [
    {
      id: 1,
      name: "2024 Toyota Camry",
      category: "Sedan",
      color: "Silver",
      price: "$28,500",
      features: ["Hybrid Engine", "Leather Seats", "Sunroof"],
      status: "available"
    },
    {
      id: 2,
      name: "2024 Honda CR-V",
      category: "SUV",
      color: "Blue",
      price: "$32,000",
      features: ["AWD", "Panoramic Roof", "Advanced Safety"],
      status: "available"
    },
    {
      id: 3,
      name: "2024 Ford F-150",
      category: "Truck",
      color: "Black",
      price: "$45,000",
      features: ["4WD", "Towing Package", "Extended Cab"],
      status: "available"
    },
  ];

  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);

  const viewModes = [
    { id: "exterior", label: "Exterior", icon: RotateCw },
    { id: "interior", label: "Interior", icon: Maximize },
    { id: "details", label: "Details", icon: Info },
  ];

  const [viewMode, setViewMode] = useState("exterior");

  return (
    <StandardPageLayout
      title="VR Showroom"
      description="Interactive virtual reality vehicle showroom"
      icon={Glasses}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VR Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedVehicle.name}</CardTitle>
                  <CardDescription>{selectedVehicle.category} • {selectedVehicle.color}</CardDescription>
                </div>
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0">
                  {selectedVehicle.price}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* VR Viewport */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Glasses className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    3D Model Viewer
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Interactive 360° view
                  </p>
                </div>
              </div>

              {/* View Controls */}
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList className="grid w-full grid-cols-3">
                  {viewModes.map(mode => (
                    <TabsTrigger key={mode.id} value={mode.id} data-testid={`tab-${mode.id}`}>
                      <mode.icon className="w-4 h-4 mr-2" />
                      {mode.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  data-testid="button-play"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="outline" size="icon" data-testid="button-reset">
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" data-testid="button-zoom-out">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" data-testid="button-zoom-in">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" data-testid="button-fullscreen">
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>

              {/* Rotation Slider */}
              <div className="space-y-2">
                <Label>Rotation</Label>
                <Slider
                  value={rotation}
                  onValueChange={setRotation}
                  max={360}
                  step={1}
                  data-testid="slider-rotation"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">{rotation[0]}°</p>
              </div>

              {/* Zoom Slider */}
              <div className="space-y-2">
                <Label>Zoom</Label>
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  min={0.5}
                  max={2}
                  step={0.1}
                  data-testid="slider-zoom"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">{zoom[0].toFixed(1)}x</p>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features & Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedVehicle.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    data-testid={`feature-${index}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white" />
                    <span className="text-sm text-gray-900 dark:text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle List Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Vehicles</CardTitle>
              <CardDescription>Select a vehicle to view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicles.map(vehicle => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${
                      selectedVehicle.id === vehicle.id
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    data-testid={`vehicle-${vehicle.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{vehicle.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{vehicle.category}</p>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                        {vehicle.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{vehicle.color}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{vehicle.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* VR Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Glasses className="w-5 h-5" />
                VR Equipment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Headset Status</span>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Controllers</span>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  2 Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tracking</span>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  Optimal
                </Badge>
              </div>
              <Button className="w-full" variant="outline" data-testid="button-launch-vr">
                <Glasses className="w-4 h-4 mr-2" />
                Launch VR Mode
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" data-testid="button-schedule">
                Schedule Test Drive
              </Button>
              <Button className="w-full" variant="outline" data-testid="button-share">
                Share VR Experience
              </Button>
              <Button className="w-full" variant="outline" data-testid="button-save">
                Save to Favorites
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
