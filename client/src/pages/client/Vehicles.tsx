import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Calendar, FileText, Wrench, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function ClientVehicles() {
  const { user } = useAuth();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["/api/vehicles", user?.id],
    enabled: !!user?.id,
  });

  const { data: jobCards } = useQuery({
    queryKey: ["/api/job-cards"],
    enabled: !!user?.id,
  });

  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user?.id,
  });

  const myVehicles = Array.isArray(vehicles)
    ? vehicles.filter((v: any) => v.customerId === user?.id)
    : [];

  const getVehicleHistory = (vehicleId: string) => {
    const vehicleJobs = Array.isArray(jobCards)
      ? jobCards.filter((jc: any) => jc.vehicleId === vehicleId)
      : [];
    const vehicleAppts = Array.isArray(appointments)
      ? appointments.filter((a: any) => a.vehicleId === vehicleId)
      : [];
    return { jobs: vehicleJobs, appointments: vehicleAppts };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            My Vehicles
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your vehicles and view service history
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      ) : myVehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Vehicles Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Contact your service center to add vehicles to your account
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myVehicles.map((vehicle: any) => {
            const history = getVehicleHistory(vehicle.id);
            const lastService = history.jobs.length > 0
              ? history.jobs.sort((a: any, b: any) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0]
              : null;

            return (
              <Card key={vehicle.id} data-testid={`vehicle-card-${vehicle.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {vehicle.make} {vehicle.model}
                        </CardTitle>
                        <CardDescription>{vehicle.year}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">License Plate</span>
                      <span className="font-medium">{vehicle.licensePlate}</span>
                    </div>
                    {vehicle.vin && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">VIN</span>
                        <span className="font-mono text-xs">{vehicle.vin}</span>
                      </div>
                    )}
                    {vehicle.color && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Color</span>
                        <span className="font-medium">{vehicle.color}</span>
                      </div>
                    )}
                    {vehicle.mileage && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mileage</span>
                        <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                    )}
                  </div>

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview" data-testid={`tab-overview-${vehicle.id}`}>
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="history" data-testid={`tab-history-${vehicle.id}`}>
                        History
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-3 mt-4">
                      {lastService ? (
                        <div className="p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Last Service</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(lastService.createdAt).toLocaleDateString()}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {lastService.status}
                          </Badge>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg border text-center text-sm text-muted-foreground">
                          No service history yet
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-lg border text-center">
                          <div className="text-2xl font-bold text-primary">
                            {history.jobs.length}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Services</p>
                        </div>
                        <div className="p-3 rounded-lg border text-center">
                          <div className="text-2xl font-bold text-primary">
                            {history.appointments.length}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Appointments</p>
                        </div>
                      </div>

                      <Link href="/client/appointments">
                        <Button className="w-full" data-testid={`button-book-${vehicle.id}`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Service
                        </Button>
                      </Link>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-2 mt-4">
                      {history.jobs.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                          No service history
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {history.jobs
                            .sort((a: any, b: any) => 
                              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            )
                            .slice(0, 5)
                            .map((job: any) => (
                              <div
                                key={job.id}
                                className="p-3 rounded-lg border text-sm"
                                data-testid={`job-${job.id}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">Job #{job.jobNumber}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {job.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
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
