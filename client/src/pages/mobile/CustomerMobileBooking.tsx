import { useState } from "react";
import { useQuery, useMutation } from "@tantml:query/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Car, Clock } from "lucide-react";
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
      // Reset form
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
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Service</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Schedule your next service appointment</p>
      </div>

      {/* Quick Service Cards */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Popular Services</h3>
        <div className="grid grid-cols-2 gap-2">
          <Card 
            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400"
            onClick={() => setServiceType("Oil Change")}
            data-testid="service-oil-change"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">🛢️</div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">Oil Change</div>
            </CardContent>
          </Card>
          <Card 
            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400"
            onClick={() => setServiceType("Brake Inspection")}
            data-testid="service-brakes"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">🔧</div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">Brake Service</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Form */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base text-gray-900 dark:text-white">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="vehicle" className="text-gray-700 dark:text-gray-300">Select Vehicle *</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger id="vehicle" data-testid="select-vehicle">
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
              <Label htmlFor="service" className="text-gray-700 dark:text-gray-300">Service Type *</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger id="service" data-testid="select-service">
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
              <Label htmlFor="date" className="text-gray-700 dark:text-gray-300">Preferred Date *</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="pl-10"
                  data-testid="input-date"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="time" className="text-gray-700 dark:text-gray-300">Preferred Time *</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="time" data-testid="select-time">
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
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Additional Notes</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe any issues or special requests..."
                rows={3}
                data-testid="textarea-notes"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
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
