import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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

const reminderSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  reminderType: z.string().min(1, "Please select a reminder type"),
  dueDate: z.string().min(1, "Please select a due date"),
  mileageDue: z.string().optional(),
  description: z.string().min(1, "Please add a description"),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

export default function ServiceReminders() {
  const { t } = useTranslation();
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
        title: t('serviceReminders.reminderCreated', 'Reminder Created'),
        description: t('serviceReminders.reminderSetSuccess', 'Your service reminder has been set successfully.'),
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
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-page-title">
            {t('serviceReminders.title', 'Service Reminders')}
          </h1>
          <p className="text-[#64748B] mt-1">
            {t('serviceReminders.description', 'Stay on top of your vehicle maintenance schedule')}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white" data-testid="button-add-reminder">
              <Plus className="h-4 w-4 mr-2" />
              {t('serviceReminders.addReminder', 'Add Reminder')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <DialogHeader>
              <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.createReminder', 'Create Service Reminder')}</DialogTitle>
              <DialogDescription className="text-[#64748B]">
                {t('serviceReminders.setupReminder', 'Set up a reminder for upcoming vehicle maintenance')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.vehicle', 'Vehicle')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-vehicle">
                            <SelectValue placeholder={t('serviceReminders.selectVehicle', 'Select vehicle')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          {myVehicles.map((vehicle: any) => (
                            <SelectItem key={vehicle.id} value={vehicle.id} className="text-[#0B1F3B] dark:text-white">
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.reminderType', 'Reminder Type')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-type">
                            <SelectValue placeholder={t('serviceReminders.selectType', 'Select type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="oil_change" className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.oilChange', 'Oil Change')}</SelectItem>
                          <SelectItem value="tire_rotation" className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.tireRotation', 'Tire Rotation')}</SelectItem>
                          <SelectItem value="brake_inspection" className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.brakeInspection', 'Brake Inspection')}</SelectItem>
                          <SelectItem value="registration" className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.registrationRenewal', 'Registration Renewal')}</SelectItem>
                          <SelectItem value="inspection" className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.annualInspection', 'Annual Inspection')}</SelectItem>
                          <SelectItem value="other" className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.other', 'Other')}</SelectItem>
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.dueDate', 'Due Date')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                          {...field} 
                          data-testid="input-due-date" 
                        />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.mileageDueOptional', 'Mileage Due (Optional)')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t('serviceReminders.mileagePlaceholder', 'e.g., 50000')}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]"
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('serviceReminders.additionalNotes', 'Additional notes about this service...')}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]"
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
                    className="flex-1 border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                    data-testid="button-cancel"
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
                    data-testid="button-submit"
                  >
                    {createMutation.isPending ? t('serviceReminders.creating', 'Creating...') : t('serviceReminders.createReminder', 'Create Reminder')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-active-reminders">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.activeReminders', 'Active Reminders')} ({activeReminders.length})</CardTitle>
          <CardDescription className="text-[#64748B]">{t('serviceReminders.upcomingMaintenance', 'Upcoming maintenance and service reminders')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 bg-[#E2E8F0] dark:bg-[#232A36]" />
              <Skeleton className="h-24 bg-[#E2E8F0] dark:bg-[#232A36]" />
            </div>
          ) : activeReminders.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('serviceReminders.noActiveReminders', 'No active reminders')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeReminders.map((reminder: any) => (
                <div
                  key={reminder.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]"
                  data-testid={`reminder-${reminder.id}`}
                >
                  <AlertCircle className="h-5 w-5 text-[#F97316] mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium capitalize text-[#0B1F3B] dark:text-white">
                          {reminder.reminderType.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-[#64748B]">
                          {getVehicleInfo(reminder.vehicleId)}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">
                        {new Date(reminder.dueDate).toLocaleDateString()}
                      </Badge>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-[#0B1F3B] dark:text-white">{reminder.description}</p>
                    )}
                    {reminder.mileageDue && (
                      <p className="text-xs text-[#64748B]">
                        {t('serviceReminders.dueAt', 'Due at')}: {reminder.mileageDue.toLocaleString()} {t('serviceReminders.km', 'km')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {completedReminders.length > 0 && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-completed-reminders">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('serviceReminders.completed', 'Completed')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('serviceReminders.recentlyCompleted', 'Recently completed service reminders')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedReminders.slice(0, 5).map((reminder: any) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117] opacity-60"
                  data-testid={`completed-reminder-${reminder.id}`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium capitalize text-[#0B1F3B] dark:text-white">
                        {reminder.reminderType.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {getVehicleInfo(reminder.vehicleId)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                    {t('serviceReminders.completed', 'Completed')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
