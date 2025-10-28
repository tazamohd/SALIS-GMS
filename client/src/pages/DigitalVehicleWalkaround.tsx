import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, CheckCircle, AlertTriangle, FileText, Plus, Image, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DigitalVehicleWalkaround() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWalkaround, setSelectedWalkaround] = useState<any>(null);
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
      toast({ title: "Walkaround created", description: "Vehicle inspection saved successfully." });
      setIsCreateDialogOpen(false);
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
        {type === "pre_service" ? "Pre-Service" : type === "post_service" ? "Post-Service" : type || "Unknown"}
      </Badge>
    );
  };

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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            📸 Digital Vehicle Walkaround
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Document vehicle condition with photos and annotations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-walkaround">
              <Plus className="h-4 w-4 mr-2" />
              New Walkaround
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Vehicle Walkaround</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Job Card</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                    placeholder="JC-2024-XXXX"
                    data-testid="input-job-card"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                    data-testid="select-type"
                  >
                    <option value="pre_service">Pre-Service</option>
                    <option value="post_service">Post-Service</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Mileage</label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                    placeholder="0"
                    data-testid="input-mileage"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Fuel Level</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                    data-testid="select-fuel"
                  >
                    <option value="1/4">1/4</option>
                    <option value="1/2">1/2</option>
                    <option value="3/4">3/4</option>
                    <option value="full">Full</option>
                  </select>
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Take photos from all angles
                </p>
                <Button variant="outline" size="sm" data-testid="button-take-photos">
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  createWalkaround.mutate({
                    jobCardId: "1",
                    vehicleId: "1",
                    technicianId: "1",
                    walkaroundType: "pre_service",
                    photos: [],
                  });
                }}
                data-testid="button-save-walkaround"
              >
                Save Walkaround
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-total-walkarounds">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Walkarounds</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalWalkarounds}</h3>
              </div>
              <Camera className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-completed-today">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.completedToday}</h3>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-pending-signature">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Signature</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.pendingSignature}</h3>
              </div>
              <FileText className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-damage-reported">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Damage Reported</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.damageReported}</h3>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {walkaroundsArray.length === 0 && !isLoading && (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Vehicle Walkarounds
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No digital walkarounds found. Create your first inspection to get started.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Create First Walkaround
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Walkarounds List */}
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
                          {walkaround.jobCardNumber || "Job Card N/A"}
                        </h3>
                        {getWalkaroundTypeBadge(walkaround.walkaroundType)}
                        {walkaround.signedAt && (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" /> Signed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {walkaround.customerName || "Customer N/A"} - {walkaround.vehicle || "Vehicle N/A"}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {walkaround.createdAt ? new Date(walkaround.createdAt).toLocaleString() : "Date N/A"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="photos" className="space-y-4">
                    <TabsList className="bg-gray-100 dark:bg-salis-gray-dark">
                      <TabsTrigger value="photos" data-testid={`tab-photos-${walkaround.id || index}`}>
                        Photos ({photos.length})
                      </TabsTrigger>
                      <TabsTrigger value="details" data-testid={`tab-details-${walkaround.id || index}`}>Details</TabsTrigger>
                      <TabsTrigger value="damage" data-testid={`tab-damage-${walkaround.id || index}`}>
                        Damage Report ({damagePrevious.length + damageNew.length})
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
                                <img src={photo.url} alt={photo.angle || "Photo"} className="w-full h-32 object-cover" />
                              ) : (
                                <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                  <Camera className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Image className="h-8 w-8 text-white" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1 text-center capitalize">
                                {photo.angle ? photo.angle.replace("_", " ") : "Photo"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">No photos available</p>
                      )}
                    </TabsContent>

                    <TabsContent value="details">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Technician:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {walkaround.technicianName || "Not available"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Mileage:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {walkaround.mileageReading 
                              ? `${walkaround.mileageReading.toLocaleString()} miles`
                              : "Not recorded"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Fuel Level:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {walkaround.fuelLevel || "Not recorded"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Interior:</span>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {walkaround.interiorCondition || "Not recorded"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="damage">
                      <div className="space-y-4">
                        {damagePrevious.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Previously Noted Damage</h4>
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
                              New Damage Identified
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
                            No damage reported
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
    </div>
  );
}
