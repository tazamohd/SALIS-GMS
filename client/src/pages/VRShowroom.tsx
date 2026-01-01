import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Glasses, Play, Pause, RotateCw, ZoomIn, ZoomOut, Maximize, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function VRShowroom() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [rotation, setRotation] = useState([0]);
  const [zoom, setZoom] = useState([1]);

  const vehicles = [
    {
      id: 1,
      name: "2024 Toyota Camry",
      category: t('vrShowroom.sedan', 'Sedan'),
      color: t('vrShowroom.silver', 'Silver'),
      price: "$28,500",
      features: [t('vrShowroom.hybridEngine', 'Hybrid Engine'), t('vrShowroom.leatherSeats', 'Leather Seats'), t('vrShowroom.sunroof', 'Sunroof')],
      status: "available"
    },
    {
      id: 2,
      name: "2024 Honda CR-V",
      category: t('vrShowroom.suv', 'SUV'),
      color: t('vrShowroom.blue', 'Blue'),
      price: "$32,000",
      features: [t('vrShowroom.awd', 'AWD'), t('vrShowroom.panoramicRoof', 'Panoramic Roof'), t('vrShowroom.advancedSafety', 'Advanced Safety')],
      status: "available"
    },
    {
      id: 3,
      name: "2024 Ford F-150",
      category: t('vrShowroom.truck', 'Truck'),
      color: t('vrShowroom.black', 'Black'),
      price: "$45,000",
      features: [t('vrShowroom.fourWD', '4WD'), t('vrShowroom.towingPackage', 'Towing Package'), t('vrShowroom.extendedCab', 'Extended Cab')],
      status: "available"
    },
  ];

  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);

  const viewModes = [
    { id: "exterior", label: t('vrShowroom.exterior', 'Exterior'), icon: RotateCw },
    { id: "interior", label: t('vrShowroom.interior', 'Interior'), icon: Maximize },
    { id: "details", label: t('common.details', 'Details'), icon: Info },
  ];

  const [viewMode, setViewMode] = useState("exterior");

  return (
    <StandardPageLayout
      title={t('vrShowroom.title', 'VR Showroom')}
      description={t('vrShowroom.description', 'Interactive virtual reality vehicle showroom')}
      icon={Glasses}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#0B1F3B] dark:text-white">{selectedVehicle.name}</CardTitle>
                  <CardDescription className="text-[#64748B]">{selectedVehicle.category} • {selectedVehicle.color}</CardDescription>
                </div>
                <Badge className="bg-[#F8FAFC] dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border border-[#E2E8F0] dark:border-[#232A36]">
                  {selectedVehicle.price}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] dark:from-[#0E1117] dark:to-[#151A23] rounded-lg flex items-center justify-center border border-[#E2E8F0] dark:border-[#232A36]">
                <div className="text-center">
                  <Glasses className="w-16 h-16 mx-auto mb-4 text-[#64748B]" />
                  <p className="text-lg font-medium text-[#0B1F3B] dark:text-white">
                    {t('vrShowroom.3dModelViewer', '3D Model Viewer')}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {t('vrShowroom.interactive360View', 'Interactive 360° view')}
                  </p>
                </div>
              </div>

              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList className="grid w-full grid-cols-3 bg-[#F8FAFC] dark:bg-[#0E1117]">
                  {viewModes.map(mode => (
                    <TabsTrigger key={mode.id} value={mode.id} data-testid={`tab-${mode.id}`} className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#151A23]">
                      <mode.icon className="w-4 h-4 mr-2" />
                      {mode.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="button-play"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="outline" size="icon" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-reset">
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-zoom-out">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-zoom-in">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-fullscreen">
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-white">{t('vrShowroom.rotation', 'Rotation')}</Label>
                <Slider
                  value={rotation}
                  onValueChange={setRotation}
                  max={360}
                  step={1}
                  data-testid="slider-rotation"
                />
                <p className="text-sm text-[#64748B]">{rotation[0]}°</p>
              </div>

              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-white">{t('vrShowroom.zoom', 'Zoom')}</Label>
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  min={0.5}
                  max={2}
                  step={0.1}
                  data-testid="slider-zoom"
                />
                <p className="text-sm text-[#64748B]">{zoom[0].toFixed(1)}x</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vrShowroom.featuresAndSpecs', 'Features & Specifications')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedVehicle.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`feature-${index}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]" />
                    <span className="text-sm text-[#0B1F3B] dark:text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vrShowroom.availableVehicles', 'Available Vehicles')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('vrShowroom.selectVehicleToView', 'Select a vehicle to view')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicles.map(vehicle => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${
                      selectedVehicle.id === vehicle.id
                        ? 'border-[#0A5ED7] bg-[#0A5ED7]/10'
                        : 'border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0BB3FF]'
                    }`}
                    data-testid={`vehicle-${vehicle.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#0B1F3B] dark:text-white">{vehicle.name}</p>
                        <p className="text-sm text-[#64748B]">{vehicle.category}</p>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                        {t('vrShowroom.available', 'available')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">{vehicle.color}</span>
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">{vehicle.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Glasses className="w-5 h-5 text-[#0A5ED7]" />
                {t('vrShowroom.vrEquipment', 'VR Equipment')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">{t('vrShowroom.headsetStatus', 'Headset Status')}</span>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  {t('vrShowroom.connected', 'Connected')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">{t('vrShowroom.controllers', 'Controllers')}</span>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  {t('vrShowroom.twoActive', '2 Active')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">{t('vrShowroom.tracking', 'Tracking')}</span>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  {t('vrShowroom.optimal', 'Optimal')}
                </Badge>
              </div>
              <Button className="w-full border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-launch-vr">
                <Glasses className="w-4 h-4 mr-2" />
                {t('vrShowroom.launchVRMode', 'Launch VR Mode')}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('common.actions', 'Actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-schedule">
                {t('vrShowroom.scheduleTestDrive', 'Schedule Test Drive')}
              </Button>
              <Button className="w-full border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-share">
                {t('vrShowroom.shareVRExperience', 'Share VR Experience')}
              </Button>
              <Button className="w-full border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-save">
                {t('vrShowroom.saveToFavorites', 'Save to Favorites')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
