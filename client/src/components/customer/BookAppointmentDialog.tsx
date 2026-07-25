import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import type { Vehicle, User } from "@shared/schema";

// Extend schema for customer booking (some fields are auto-filled)
const bookingSchema = insertAppointmentSchema.extend({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  appointmentDate: z.string().min(1, "Please select a date and time"),
  serviceType: z.string().min(1, "Please select a service type"),
  description: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookAppointmentDialog({ open, onOpenChange }: BookAppointmentDialogProps) {
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/customer/profile'],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/customer/vehicles'],
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      garageId: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      vehicleInfo: {},
      serviceType: '',
      description: '',
      appointmentDate: '',
      duration: 60,
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const selectedVehicle = vehicles.find(v => v.id === data.vehicleId);
      if (!selectedVehicle) throw new Error("Vehicle not found");

      const appointmentData = {
        garageId: selectedVehicle.garageId, // Use garage from vehicle
        customerName: user?.fullName || user?.email || '',
        customerPhone: user?.phone || '',
        customerEmail: user?.email || '',
        vehicleInfo: {
          id: selectedVehicle.id,
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          year: selectedVehicle.year,
          licensePlate: selectedVehicle.licensePlate,
        },
        serviceType: data.serviceType,
        description: data.description || '',
        appointmentDate: new Date(data.appointmentDate),
        duration: data.duration || 60,
      };

      return apiRequest('POST', '/api/customer/book-appointment', appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/appointments'] });
      toast({
        title: "Success",
        description: "Your appointment has been booked successfully!",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
  };

  const activeVehicles = vehicles.filter(v => v.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">Book an Appointment</DialogTitle>
          <DialogDescription>
            Schedule a service appointment for your vehicle
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-vehicle">
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id} data-testid={`select-vehicle-${vehicle.id}`}>
                          {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-service-type">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      data-testid="input-appointment-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger data-testid="select-duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the service needed or any concerns..."
                      {...field} 
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={bookingMutation.isPending}
                data-testid="button-submit"
              >
                {bookingMutation.isPending ? 'Booking...' : 'Book Appointment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
