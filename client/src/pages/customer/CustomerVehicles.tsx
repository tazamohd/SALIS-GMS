import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Calendar, Wrench } from "lucide-react";
import { format } from "date-fns";
import type { Vehicle, JobCard } from "@shared/schema";
import { StandardPageLayout } from "@/components/layouts";

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
    <StandardPageLayout
      title="My Vehicles"
      description="View your vehicles and service history"
      icon={Car}
    >
      {loadingVehicles ? (
        <div className="text-center py-12 text-[#64748B]">Loading vehicles...</div>
      ) : activeVehicles.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="text-center py-12">
            <Car className="h-16 w-16 text-[#64748B] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white mb-2">
              No vehicles registered
            </h3>
            <p className="text-[#64748B]">
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
              <Card key={vehicle.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-vehicle-${vehicle.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] p-3 rounded-lg">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-[#0B1F3B] dark:text-white" data-testid={`text-vehicle-name-${vehicle.id}`}>
                          {vehicle.make} {vehicle.model}
                        </CardTitle>
                        <CardDescription className="mt-1 text-[#64748B]">
                          {vehicle.year} • License: {vehicle.licensePlate}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                      {vehicle.vin && (
                        <div>
                          <p className="text-sm text-[#64748B]">VIN</p>
                          <p className="font-medium mt-1 text-[#0B1F3B] dark:text-white">{vehicle.vin}</p>
                        </div>
                      )}
                      {vehicle.color && (
                        <div>
                          <p className="text-sm text-[#64748B]">Color</p>
                          <p className="font-medium mt-1 text-[#0B1F3B] dark:text-white">{vehicle.color}</p>
                        </div>
                      )}
                      {vehicle.mileage && (
                        <div>
                          <p className="text-sm text-[#64748B]">Mileage</p>
                          <p className="font-medium mt-1 text-[#0B1F3B] dark:text-white">{vehicle.mileage.toLocaleString()} mi</p>
                        </div>
                      )}
                      {vehicle.engineType && (
                        <div>
                          <p className="text-sm text-[#64748B]">Engine</p>
                          <p className="font-medium mt-1 capitalize text-[#0B1F3B] dark:text-white">{vehicle.engineType}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#E2E8F0] dark:border-[#232A36] pt-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-[#0B1F3B] dark:text-white">
                        <Wrench className="h-5 w-5 text-[#0A5ED7]" />
                        Service History ({completedJobs.length} services)
                      </h3>
                      
                      {loadingJobCards ? (
                        <div className="text-center py-8 text-[#64748B]">Loading service history...</div>
                      ) : completedJobs.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-[#64748B]">No service history available</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {completedJobs.slice(0, 5).map(job => (
                            <div 
                              key={job.id} 
                              className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                              data-testid={`card-job-${job.id}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="bg-[#0BB3FF]/20 p-2 rounded">
                                  <Calendar className="h-4 w-4 text-[#0A5ED7] dark:text-[#0BB3FF]" />
                                </div>
                                <div>
                                  <p className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-job-service-${job.id}`}>
                                    {job.serviceType}
                                  </p>
                                  <p className="text-sm text-[#64748B]">
                                    Job #{job.jobNumber}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-[#64748B]">
                                  {job.completedAt ? format(new Date(job.completedAt), 'PPP') : 'N/A'}
                                </p>
                                {job.totalCost && (
                                  <p className="font-medium text-[#0B1F3B] dark:text-white">${Number(job.totalCost).toFixed(2)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {completedJobs.length > 5 && (
                            <p className="text-sm text-[#64748B] text-center pt-2">
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
    </StandardPageLayout>
  );
}
