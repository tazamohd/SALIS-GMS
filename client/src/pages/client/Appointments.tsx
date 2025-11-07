import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Clock, Car, Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const bookingSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  scheduledDate: z.date({ required_error: "Please select a date" }),
  serviceType: z.string().min(1, "Please describe the service needed"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function ClientAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["/api/vehicles", user?.id],
    enabled: !!user?.id,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user?.id,
  });

  const { data: garages } = useQuery({
    queryKey: ["/api/garages"],
    enabled: !!user?.id,
  });

  const myVehicles = Array.isArray(vehicles)
    ? vehicles.filter((v: any) => v.customerId === user?.id)
    : [];

  const myAppointments = Array.isArray(appointments)
    ? appointments.filter((a: any) => {
        const vehicle = myVehicles.find((v: any) => v.id === a.vehicleId);
        return !!vehicle;
      })
    : [];

  const upcomingAppointments = myAppointments.filter(
    (a: any) => new Date(a.scheduledDate) >= new Date() && 
                a.status !== "cancelled" && 
                a.status !== "completed"
  );

  const pastAppointments = myAppointments.filter(
    (a: any) => new Date(a.scheduledDate) < new Date() || 
                a.status === "cancelled" || 
                a.status === "completed"
  );

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const vehicle = myVehicles.find((v: any) => v.id === data.vehicleId);
      const garage = Array.isArray(garages) && garages.length > 0 
        ? garages[0] 
        : { id: vehicle?.garageId };

      return fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: data.vehicleId,
          garageId: garage.id,
          scheduledDate: data.scheduledDate.toISOString(),
          serviceType: data.serviceType,
          notes: data.notes || "",
          status: "scheduled",
        }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Appointment Booked",
        description: "Your service appointment has been scheduled successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to book appointment. Please try again.",
      });
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    createMutation.mutate(data);
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = myVehicles.find((v: any) => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}` : "Unknown Vehicle";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your service appointments
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-book-new">
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book Service Appointment</DialogTitle>
              <DialogDescription>
                Schedule a service appointment for your vehicle
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vehicle">
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {myVehicles.map((vehicle: any) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
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
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="button-select-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                      <FormControl>
                        <Textarea
                          placeholder="Describe the service needed (e.g., Oil change, Brake inspection)"
                          {...field}
                          data-testid="input-service-type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information..."
                          {...field}
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1"
                    data-testid="button-submit"
                  >
                    {createMutation.isPending ? "Booking..." : "Book Appointment"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Appointments */}
      <Card data-testid="card-upcoming">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your scheduled service appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                  data-testid={`appointment-${appointment.id}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{getVehicleInfo(appointment.vehicleId)}</p>
                        <p className="text-sm text-muted-foreground">{appointment.serviceType}</p>
                      </div>
                      <Badge variant={
                        appointment.status === "confirmed" ? "default" :
                        appointment.status === "scheduled" ? "secondary" : "outline"
                      }>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(appointment.scheduledDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        Note: {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card data-testid="card-past">
        <CardHeader>
          <CardTitle>Past Appointments</CardTitle>
          <CardDescription>Your appointment history</CardDescription>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : pastAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No past appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastAppointments
                .sort((a: any, b: any) => 
                  new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
                )
                .slice(0, 5)
                .map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    data-testid={`past-appointment-${appointment.id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{getVehicleInfo(appointment.vehicleId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appointment.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{appointment.status}</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
