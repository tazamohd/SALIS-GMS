import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Plus, Calendar, Car, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

const reminderSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  reminderType: z.string().min(1, "Please select a reminder type"),
  dueDate: z.string().min(1, "Please select a due date"),
  mileageDue: z.string().optional(),
  description: z.string().min(1, "Please add a description"),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

export default function ServiceReminders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles", (user as any)?.id],
    enabled: !!(user as any)?.id,
  });

  const { data: reminders, isLoading } = useQuery({
    queryKey: ["/api/customers", (user as any)?.id, "service-reminders"],
    enabled: !!(user as any)?.id,
  });

  const myVehicles = Array.isArray(vehicles)
    ? vehicles.filter((v: any) => v.customerId === (user as any)?.id)
    : [];

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ReminderFormValues) => {
      const { apiRequest } = await import("@/lib/queryClient");
      return apiRequest("POST", `/api/customers/${(user as any)?.id}/service-reminders`, {
        vehicleId: data.vehicleId,
        reminderType: data.reminderType,
        dueDate: new Date(data.dueDate).toISOString(),
        mileageDue: data.mileageDue ? parseInt(data.mileageDue) : null,
        description: data.description,
        isCompleted: false,
        notificationSent: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", (user as any)?.id, "service-reminders"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Reminder Created",
        description: "Your service reminder has been set successfully.",
      });
    },
  });

  const onSubmit = (data: ReminderFormValues) => {
    createMutation.mutate(data);
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = myVehicles.find((v: any) => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}` : "Unknown Vehicle";
  };

  const activeReminders = Array.isArray(reminders)
    ? reminders.filter((r: any) => !r.isCompleted && r.customerId === (user as any)?.id)
    : [];

  const completedReminders = Array.isArray(reminders)
    ? reminders.filter((r: any) => r.isCompleted && r.customerId === (user as any)?.id)
    : [];

  return (
    <>
      <StandardPageLayout
        title="Service Reminders"
        description="Stay on top of your vehicle maintenance schedule"
        icon={Bell}
        actions={[
          {
            label: "Add Reminder",
            icon: Plus,
            onClick: () => setDialogOpen(true),
            variant: "default",
          },
        ]}
      >
        {/* Active Reminders */}
        <Card data-testid="card-active-reminders">
          <CardHeader>
            <CardTitle>Active Reminders ({activeReminders.length})</CardTitle>
            <CardDescription>Upcoming maintenance and service reminders</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : activeReminders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active reminders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeReminders.map((reminder: any) => (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-4 p-4 rounded-lg border"
                    data-testid={`reminder-${reminder.id}`}
                  >
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium capitalize">
                            {reminder.reminderType.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getVehicleInfo(reminder.vehicleId)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {new Date(reminder.dueDate).toLocaleDateString()}
                        </Badge>
                      </div>
                      {reminder.description && (
                        <p className="text-sm">{reminder.description}</p>
                      )}
                      {reminder.mileageDue && (
                        <p className="text-xs text-muted-foreground">
                          Due at: {reminder.mileageDue.toLocaleString()} km
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <Card data-testid="card-completed-reminders">
            <CardHeader>
              <CardTitle>Completed</CardTitle>
              <CardDescription>Recently completed service reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedReminders.slice(0, 5).map((reminder: any) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 rounded-lg border opacity-60"
                    data-testid={`completed-reminder-${reminder.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {reminder.reminderType.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getVehicleInfo(reminder.vehicleId)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Completed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </StandardPageLayout>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Service Reminder</DialogTitle>
              <DialogDescription>
                Set up a reminder for upcoming vehicle maintenance
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
                  name="reminderType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="oil_change">Oil Change</SelectItem>
                          <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                          <SelectItem value="brake_inspection">Brake Inspection</SelectItem>
                          <SelectItem value="registration">Registration Renewal</SelectItem>
                          <SelectItem value="inspection">Annual Inspection</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-due-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mileageDue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage Due (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 50000"
                          {...field}
                          data-testid="input-mileage"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about this service..."
                          {...field}
                          data-testid="input-description"
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
                    {createMutation.isPending ? "Creating..." : "Create Reminder"}
                  </Button>
                </div>
              </form>
            </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
