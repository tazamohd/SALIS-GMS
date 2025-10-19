import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Calendar, Wrench } from "lucide-react";
import { format } from "date-fns";
import type { Vehicle, JobCard } from "@shared/schema";

export function CustomerVehicles() {
  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/customer/vehicles'],
  });

  const { data: jobCards = [], isLoading: loadingJobCards } = useQuery<JobCard[]>({
    queryKey: ['/api/customer/job-cards'],
  });

  const activeVehicles = vehicles.filter(v => v.isActive);

  const getVehicleJobCards = (vehicleId: string) => {
    return jobCards.filter(jc => {
      if (typeof jc.vehicleInfo === 'object' && jc.vehicleInfo && 'id' in jc.vehicleInfo) {
        return (jc.vehicleInfo as any).id === vehicleId;
      }
      return false;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          My Vehicles
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View your vehicles and service history
        </p>
      </div>

      {loadingVehicles ? (
        <div className="text-center py-12 text-gray-500">Loading vehicles...</div>
      ) : activeVehicles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No vehicles registered
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Contact the garage to register your vehicles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeVehicles.map(vehicle => {
            const vehicleJobs = getVehicleJobCards(vehicle.id);
            const completedJobs = vehicleJobs.filter(j => j.status === 'completed');

            return (
              <Card key={vehicle.id} data-testid={`card-vehicle-${vehicle.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 dark:bg-salis-gray-dark p-3 rounded-lg">
                        <Car className="h-6 w-6 text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl" data-testid={`text-vehicle-name-${vehicle.id}`}>
                          {vehicle.make} {vehicle.model}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {vehicle.year} • License: {vehicle.licensePlate}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Vehicle Details */}
                    <div className="grid gap-4 md:grid-cols-4">
                      {vehicle.vin && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">VIN</p>
                          <p className="font-medium mt-1">{vehicle.vin}</p>
                        </div>
                      )}
                      {vehicle.color && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Color</p>
                          <p className="font-medium mt-1">{vehicle.color}</p>
                        </div>
                      )}
                      {vehicle.mileage && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Mileage</p>
                          <p className="font-medium mt-1">{vehicle.mileage.toLocaleString()} mi</p>
                        </div>
                      )}
                      {vehicle.engineType && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Engine</p>
                          <p className="font-medium mt-1 capitalize">{vehicle.engineType}</p>
                        </div>
                      )}
                    </div>

                    {/* Service History */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Wrench className="h-5 w-5" />
                        Service History ({completedJobs.length} services)
                      </h3>
                      
                      {loadingJobCards ? (
                        <div className="text-center py-8 text-gray-500">Loading service history...</div>
                      ) : completedJobs.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No service history available</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {completedJobs.slice(0, 5).map(job => (
                            <div 
                              key={job.id} 
                              className="flex items-center justify-between p-4 border rounded-lg"
                              data-testid={`card-job-${job.id}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded">
                                  <Calendar className="h-4 w-4 text-gray-800 dark:text-gray-200" />
                                </div>
                                <div>
                                  <p className="font-medium" data-testid={`text-job-service-${job.id}`}>
                                    {job.serviceType}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Job #{job.jobNumber}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {job.completedAt ? format(new Date(job.completedAt), 'PPP') : 'N/A'}
                                </p>
                                {job.totalCost && (
                                  <p className="font-medium">${Number(job.totalCost).toFixed(2)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {completedJobs.length > 5 && (
                            <p className="text-sm text-gray-500 text-center pt-2">
                              And {completedJobs.length - 5} more services...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
