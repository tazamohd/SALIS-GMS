import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardPage } from "@/components/layouts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, CheckCircle, AlertTriangle, FileText, Plus, Image, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DigitalVehicleWalkaround() {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWalkaround, setSelectedWalkaround] = useState<any>(null);
  const [formData, setFormData] = useState({
    jobCardId: "",
    vehicleId: "",
    technicianId: "",
    walkaroundType: "pre_service",
    mileageReading: "",
    fuelLevel: "1/2",
  });
  const { toast } = useToast();

  const { data: walkarounds = [], isLoading } = useQuery({
    queryKey: ["/api/vehicle-walkarounds"],
  });

  const walkaroundsArray = (walkarounds as any[]) || [];

  const createWalkaround = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/digital-walkaround", "POST", data);
    },
    onSuccess: () => {
      toast({ title: t('vehicles.walkaroundCreated', 'Walkaround created'), description: t('vehicles.vehicleInspectionSavedSuccessfully', 'Vehicle inspection saved successfully.') });
      setIsCreateDialogOpen(false);
      setFormData({ jobCardId: "", vehicleId: "", technicianId: "", walkaroundType: "pre_service", mileageReading: "", fuelLevel: "1/2" });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-walkarounds"] });
    },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const stats = {
    totalWalkarounds: walkaroundsArray.length || 0,
    completedToday: walkaroundsArray.filter((w: any) => {
      if (!w.createdAt) return false;
      const created = new Date(w.createdAt);
      return created >= todayStart;
    }).length || 0,
    pendingSignature: walkaroundsArray.filter((w: any) => !w.signedAt).length || 0,
    damageReported: walkaroundsArray.filter((w: any) => {
      const newDamage = w.newDamageIdentified || [];
      return Array.isArray(newDamage) && newDamage.length > 0;
    }).length || 0,
  };

  const getWalkaroundTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "pre_service" ? "secondary" : "default"}>
        {type === "pre_service" ? t('vehicles.preService', 'Pre-Service') : type === "post_service" ? t('vehicles.postService', 'Post-Service') : type || t('common.unknown', 'Unknown')}
      </Badge>
    );
  };

  const metrics = [
    { label: t('vehicles.totalWalkarounds', 'Total Walkarounds'), value: stats.totalWalkarounds, icon: Camera, color: "text-blue-600" },
    { label: t('vehicles.completedToday', 'Completed Today'), value: stats.completedToday, icon: CheckCircle, color: "text-green-600" },
    { label: t('vehicles.pendingSignature', 'Pending Signature'), value: stats.pendingSignature, icon: FileText, color: "text-yellow-600" },
    { label: t('vehicles.damageReported', 'Damage Reported'), value: stats.damageReported, icon: AlertTriangle, color: "text-red-600" },
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-96"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-128"></div>
        </div>
      </div>
    );
  }

  return (
    <DashboardPage
      title={t('vehicles.digitalVehicleWalkaround', '📸 Digital Vehicle Walkaround')}
      description={t('vehicles.documentVehicleConditionWithPhotos', 'Document vehicle condition with photos and annotations')}
      icon={Camera}
      metrics={metrics}
    >
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button data-testid="button-create-walkaround" className="mb-6">
            <Plus className="h-4 w-4 mr-2" />
            {t('vehicles.newWalkaround', 'New Walkaround')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('vehicles.createVehicleWalkaround', 'Create Vehicle Walkaround')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t('vehicles.jobCardId', 'Job Card ID')}</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  placeholder={t('vehicles.enterJobCardId', 'Enter job card ID')}
                  value={formData.jobCardId}
                  onChange={(e) => setFormData({ ...formData, jobCardId: e.target.value })}
                  data-testid="input-job-card"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('vehicles.vehicleId', 'Vehicle ID')}</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  placeholder={t('vehicles.enterVehicleId', 'Enter vehicle ID')}
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  data-testid="input-vehicle-id"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t('vehicles.technicianId', 'Technician ID')}</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  placeholder={t('vehicles.enterTechnicianId', 'Enter technician ID')}
                  value={formData.technicianId}
                  onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                  data-testid="input-technician-id"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('common.type', 'Type')}</label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  value={formData.walkaroundType}
                  onChange={(e) => setFormData({ ...formData, walkaroundType: e.target.value })}
                  data-testid="select-type"
                >
                  <option value="pre_service">{t('vehicles.preService', 'Pre-Service')}</option>
                  <option value="post_service">{t('vehicles.postService', 'Post-Service')}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t('vehicles.mileage', 'Mileage')}</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  placeholder="0"
                  value={formData.mileageReading}
                  onChange={(e) => setFormData({ ...formData, mileageReading: e.target.value })}
                  data-testid="input-mileage"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('vehicles.fuelLevel', 'Fuel Level')}</label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  value={formData.fuelLevel}
                  onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
                  data-testid="select-fuel"
                >
                  <option value="1/4">1/4</option>
                  <option value="1/2">1/2</option>
                  <option value="3/4">3/4</option>
                  <option value="full">{t('vehicles.full', 'Full')}</option>
                </select>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!formData.jobCardId || !formData.vehicleId || !formData.technicianId) {
                  toast({ title: t('common.error', 'Validation error'), description: t('vehicles.pleaseFillAllRequiredFields', 'Please fill in all required fields'), variant: "destructive" });
                  return;
                }
                createWalkaround.mutate({
                  jobCardId: formData.jobCardId,
                  vehicleId: formData.vehicleId,
                  technicianId: formData.technicianId,
                  walkaroundType: formData.walkaroundType,
                  photos: [],
                  mileageReading: formData.mileageReading ? parseInt(formData.mileageReading) : undefined,
                  fuelLevel: formData.fuelLevel,
                });
              }}
              disabled={createWalkaround.isPending}
              data-testid="button-save-walkaround"
            >
              {createWalkaround.isPending ? t('common.saving', 'Saving...') : t('vehicles.saveWalkaround', 'Save Walkaround')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {walkaroundsArray.length === 0 && !isLoading && (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('vehicles.noVehicleWalkarounds', 'No Vehicle Walkarounds')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('vehicles.noDigitalWalkaroundsFoundCreateFirst', 'No digital walkarounds found. Create your first inspection to get started.')}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                {t('vehicles.createFirstWalkaround', 'Create First Walkaround')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {walkaroundsArray.length > 0 && (
        <div className="space-y-4">
          {walkaroundsArray.map((walkaround: any, index: number) => {
            const photos = walkaround.photos || [];
            const damagePrevious = walkaround.damagePreviouslyNoted || [];
            const damageNew = walkaround.newDamageIdentified || [];
            
            return (
              <Card
                key={`walkaround-${walkaround.id || index}`}
                className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800"
                data-testid={`walkaround-${walkaround.id || index}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {walkaround.jobCardNumber || t('vehicles.jobCardNA', 'Job Card N/A')}
                        </h3>
                        {getWalkaroundTypeBadge(walkaround.walkaroundType)}
                        {walkaround.signedAt && (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" /> {t('vehicles.signed', 'Signed')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {walkaround.customerName || t('vehicles.customerNA', 'Customer N/A')} - {walkaround.vehicle || t('vehicles.vehicleNA', 'Vehicle N/A')}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {walkaround.createdAt ? new Date(walkaround.createdAt).toLocaleString() : t('vehicles.dateNA', 'Date N/A')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="photos" className="space-y-4">
                    <TabsList className="bg-gray-100 dark:bg-salis-gray-dark">
                      <TabsTrigger value="photos" data-testid={`tab-photos-${walkaround.id || index}`}>
                        {t('vehicles.photos', 'Photos')} ({photos.length})
                      </TabsTrigger>
                      <TabsTrigger value="details" data-testid={`tab-details-${walkaround.id || index}`}>{t('common.details', 'Details')}</TabsTrigger>
                      <TabsTrigger value="damage" data-testid={`tab-damage-${walkaround.id || index}`}>
                        {t('vehicles.damageReport', 'Damage Report')} ({damagePrevious.length + damageNew.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="photos">
                      {photos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {photos.map((photo: any, photoIndex: number) => (
                            <div
                              key={`photo-${photoIndex}`}
                              className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800"
                              data-testid={`photo-${photoIndex}`}
                            >
                              {photo.url ? (
                                <img src={photo.url} alt={photo.angle || t('vehicles.photo', 'Photo')} className="w-full h-32 object-cover" />
                              ) : (
                                <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                  <Camera className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Image className="h-8 w-8 text-white" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1 text-center capitalize">
                                {photo.angle ? photo.angle.replace("_", " ") : t('vehicles.photo', 'Photo')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('vehicles.noPhotosAvailable', 'No photos available')}</p>
                      )}
                    </TabsContent>

                    <TabsContent value="details">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t('vehicles.technician', 'Technician')}:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {walkaround.technicianName || t('common.notAvailable', 'Not available')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t('vehicles.mileage', 'Mileage')}:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {walkaround.mileageReading 
                              ? `${walkaround.mileageReading.toLocaleString()} ${t('vehicles.miles', 'miles')}`
                              : t('vehicles.notRecorded', 'Not recorded')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t('vehicles.fuelLevel', 'Fuel Level')}:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {walkaround.fuelLevel || t('vehicles.notRecorded', 'Not recorded')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t('vehicles.interior', 'Interior')}:</span>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {walkaround.interiorCondition || t('vehicles.notRecorded', 'Not recorded')}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="damage">
                      <div className="space-y-4">
                        {damagePrevious.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('vehicles.previouslyNotedDamage', 'Previously Noted Damage')}</h4>
                            <ul className="space-y-1">
                              {damagePrevious.map((damage: string, dmgIndex: number) => (
                                <li key={`prev-${dmgIndex}`} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <span className="text-gray-400">•</span>
                                  {damage}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {damageNew.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              {t('vehicles.newDamageIdentified', 'New Damage Identified')}
                            </h4>
                            <ul className="space-y-1">
                              {damageNew.map((damage: string, dmgIndex: number) => (
                                <li key={`new-${dmgIndex}`} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <span className="text-red-600">•</span>
                                  {damage}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {damagePrevious.length === 0 && damageNew.length === 0 && (
                          <p className="text-sm text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {t('vehicles.noDamageReported', 'No damage reported')}
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardPage>
  );
}
