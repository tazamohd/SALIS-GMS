import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, CheckCircle, AlertTriangle, FileText, Plus, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DigitalVehicleWalkaround() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWalkaround, setSelectedWalkaround] = useState<any>(null);
  const { toast } = useToast();

  const { data: walkarounds = [] } = useQuery({
    queryKey: ["/api/vehicle-walkarounds"],
  });

  const createWalkaround = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/vehicle-walkarounds", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Walkaround created", description: "Vehicle inspection saved successfully." });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-walkarounds"] });
    },
  });

  // Mock data
  const mockWalkarounds = [
    {
      id: "1",
      jobCardNumber: "JC-2024-1850",
      customerName: "John Smith",
      vehicle: "2020 Honda Civic",
      technicianName: "Mike Davis",
      walkaroundType: "pre_service",
      mileageReading: 45230,
      fuelLevel: "3/4",
      interiorCondition: "good",
      photos: [
        { angle: "front", url: "https://via.placeholder.com/300x200", annotations: [] },
        { angle: "driver_side", url: "https://via.placeholder.com/300x200", annotations: ["Minor scratch on door"] },
        { angle: "rear", url: "https://via.placeholder.com/300x200", annotations: [] },
        { angle: "passenger_side", url: "https://via.placeholder.com/300x200", annotations: [] },
        { angle: "interior", url: "https://via.placeholder.com/300x200", annotations: ["Clean interior"] },
      ],
      damagePreviouslyNoted: ["Small dent on rear bumper"],
      newDamageIdentified: ["Minor scratch on driver door"],
      signedAt: "2024-10-26T09:15:00Z",
      createdAt: "2024-10-26T09:00:00Z",
    },
    {
      id: "2",
      jobCardNumber: "JC-2024-1851",
      customerName: "Sarah Johnson",
      vehicle: "2019 Toyota Camry",
      technicianName: "Emily Brown",
      walkaroundType: "post_service",
      mileageReading: 62150,
      fuelLevel: "1/2",
      interiorCondition: "excellent",
      photos: [
        { angle: "front", url: "https://via.placeholder.com/300x200", annotations: [] },
        { angle: "driver_side", url: "https://via.placeholder.com/300x200", annotations: [] },
        { angle: "rear", url: "https://via.placeholder.com/300x200", annotations: [] },
        { angle: "passenger_side", url: "https://via.placeholder.com/300x200", annotations: [] },
      ],
      damagePreviouslyNoted: [],
      newDamageIdentified: [],
      signedAt: "2024-10-26T15:00:00Z",
      createdAt: "2024-10-26T14:45:00Z",
    },
  ];

  const stats = {
    totalWalkarounds: 124,
    completedToday: 8,
    pendingSignature: 3,
    damageReported: 12,
  };

  const getWalkaroundTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "pre_service" ? "secondary" : "default"}>
        {type === "pre_service" ? "Pre-Service" : "Post-Service"}
      </Badge>
    );
  };

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
                    walkaroundType: "pre_service",
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

      {/* Walkarounds List */}
      <div className="space-y-4">
        {mockWalkarounds.map((walkaround) => (
          <Card
            key={walkaround.id}
            className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800"
            data-testid={`walkaround-${walkaround.id}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{walkaround.jobCardNumber}</h3>
                    {getWalkaroundTypeBadge(walkaround.walkaroundType)}
                    {walkaround.signedAt && (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" /> Signed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {walkaround.customerName} - {walkaround.vehicle}
                  </p>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(walkaround.createdAt).toLocaleString()}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="photos" className="space-y-4">
                <TabsList className="bg-gray-100 dark:bg-salis-gray-dark">
                  <TabsTrigger value="photos" data-testid={`tab-photos-${walkaround.id}`}>Photos</TabsTrigger>
                  <TabsTrigger value="details" data-testid={`tab-details-${walkaround.id}`}>Details</TabsTrigger>
                  <TabsTrigger value="damage" data-testid={`tab-damage-${walkaround.id}`}>Damage Report</TabsTrigger>
                </TabsList>

                <TabsContent value="photos">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {walkaround.photos.map((photo: any, index: number) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800"
                        data-testid={`photo-${index}`}
                      >
                        <img src={photo.url} alt={photo.angle} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Image className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1 text-center capitalize">
                          {photo.angle.replace("_", " ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="details">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Technician:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{walkaround.technicianName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Mileage:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{walkaround.mileageReading.toLocaleString()} miles</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fuel Level:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{walkaround.fuelLevel}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Interior:</span>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{walkaround.interiorCondition}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="damage">
                  <div className="space-y-4">
                    {walkaround.damagePreviouslyNoted.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Previously Noted Damage</h4>
                        <ul className="space-y-1">
                          {walkaround.damagePreviouslyNoted.map((damage: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {damage}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {walkaround.newDamageIdentified.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          New Damage Identified
                        </h4>
                        <ul className="space-y-1">
                          {walkaround.newDamageIdentified.map((damage: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-red-600">•</span>
                              {damage}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {walkaround.damagePreviouslyNoted.length === 0 && walkaround.newDamageIdentified.length === 0 && (
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
        ))}
      </div>
    </div>
  );
}
