// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Calendar, Wrench, Plus } from "lucide-react";
import { Link } from "wouter";
import type { Vehicle } from "@shared/schema";

export default function CustomerMobileVehicles() {
  const { data: vehicles, isLoading } = useQuery<{ data: Vehicle[] }>({
    queryKey: ["/api/vehicles"],
  });

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64 bg-[#F8FAFC] dark:bg-[#0E1117]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5ED7] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">My Vehicles</h2>
          <p className="text-sm text-[#64748B]">{vehicles?.data?.length || 0} vehicle(s)</p>
        </div>
        <Link href="/vehicles">
          <Button size="sm" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952c0] hover:to-[#09a0e6]" data-testid="button-add-vehicle">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {vehicles?.data?.map((vehicle) => (
          <Card 
            key={vehicle.id} 
            className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]"
            data-testid={`vehicle-card-${vehicle.id}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-5 w-5 text-[#0A5ED7] dark:text-[#0BB3FF]" />
                <span className="text-[#0B1F3B] dark:text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#64748B] text-xs">License Plate</p>
                  <p className="font-semibold text-[#0B1F3B] dark:text-white">{vehicle.licensePlate}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-xs">VIN</p>
                  <p className="font-mono text-xs text-[#0B1F3B] dark:text-white">{vehicle.vin?.substring(0, 8)}...</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-xs">Mileage</p>
                  <p className="font-semibold text-[#0B1F3B] dark:text-white">
                    {vehicle.currentMileage?.toLocaleString() || "N/A"} {vehicle.mileageUnit}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B] text-xs">Color</p>
                  <p className="font-semibold text-[#0B1F3B] dark:text-white">{vehicle.color || "N/A"}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/customer-app/booking`} className="flex-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid={`button-book-${vehicle.id}`}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Book Service
                  </Button>
                </Link>
                <Link href={`/customer-app/history?vehicle=${vehicle.id}`} className="flex-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid={`button-history-${vehicle.id}`}
                  >
                    <Wrench className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!vehicles?.data || vehicles.data.length === 0) && (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-8 text-center">
              <Car className="h-16 w-16 mx-auto mb-4 text-[#E2E8F0] dark:text-[#232A36]" />
              <h3 className="text-lg font-semibold mb-2 text-[#0B1F3B] dark:text-white">No Vehicles Yet</h3>
              <p className="text-sm text-[#64748B] mb-4">
                Add your first vehicle to start tracking service history
              </p>
              <Link href="/vehicles">
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952c0] hover:to-[#09a0e6]">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Vehicle
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
