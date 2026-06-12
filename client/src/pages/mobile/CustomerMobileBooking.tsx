import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Vehicle } from "@shared/schema";

export default function CustomerMobileBooking() {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const { data: vehicles } = useQuery<{ data: Vehicle[] }>({
    queryKey: ["/api/vehicles"],
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/appointments", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked!",
        description: "Your service appointment has been scheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setSelectedVehicle("");
      setServiceType("");
      setDate("");
      setTime("");
      setDescription("");
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle || !serviceType || !date || !time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate({
      vehicleId: selectedVehicle,
      serviceType,
      appointmentDate: date,
      appointmentTime: time,
      customerNotes: description,
      status: "scheduled",
    });
  };

  const serviceTypes = [
    "Oil Change",
    "Tire Rotation",
    "Brake Inspection",
    "General Maintenance",
    "Diagnostic",
    "AC Service",
    "Engine Repair",
    "Transmission Service",
    "Other",
  ];

  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  ];

  return (
    <div className="p-4 space-y-4 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <div>
        <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">Book Service</h2>
        <p className="text-sm text-[#64748B]">Schedule your next service appointment</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-[#0B1F3B] dark:text-gray-300">Popular Services</h3>
        <div className="grid grid-cols-2 gap-2">
          <Card 
            className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] cursor-pointer hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF]"
            onClick={() => setServiceType("Oil Change")}
            data-testid="service-oil-change"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">🛢️</div>
              <div className="text-xs font-medium text-[#0B1F3B] dark:text-white">Oil Change</div>
            </CardContent>
          </Card>
          <Card 
            className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] cursor-pointer hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF]"
            onClick={() => setServiceType("Brake Inspection")}
            data-testid="service-brakes"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">🔧</div>
              <div className="text-xs font-medium text-[#0B1F3B] dark:text-white">Brake Service</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-base text-[#0B1F3B] dark:text-white">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="vehicle" className="text-[#0B1F3B] dark:text-gray-300">Select Vehicle *</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger id="vehicle" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-vehicle">
                  <SelectValue placeholder="Choose a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles?.data?.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="service" className="text-[#0B1F3B] dark:text-gray-300">Service Type *</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger id="service" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-service">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date" className="text-[#0B1F3B] dark:text-gray-300">Preferred Date *</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-date"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="time" className="text-[#0B1F3B] dark:text-gray-300">Preferred Time *</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="time" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-[#0B1F3B] dark:text-gray-300">Additional Notes</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe any issues or special requests..."
                rows={3}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="textarea-notes"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952c0] hover:to-[#09a0e6] text-white"
              disabled={bookingMutation.isPending}
              data-testid="button-book-appointment"
            >
              {bookingMutation.isPending ? "Booking..." : "Book Appointment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
