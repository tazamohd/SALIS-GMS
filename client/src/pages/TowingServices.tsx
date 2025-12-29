import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, MapPin, Phone, Clock } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

const towingJobSchema = z.object({
  customerId: z.string().optional(),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  vehicleInfo: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  towType: z.enum(["flatbed", "wheel_lift", "dolly", "integrated"]),
  distance: z.number().min(0).optional(),
  estimatedCost: z.number().min(0).optional(),
  priority: z.enum(["low", "medium", "high", "emergency"]).default("medium"),
  status: z.enum(["requested", "dispatched", "in_progress", "completed", "cancelled"]).default("requested"),
  notes: z.string().optional(),
});

type TowingJobFormData = z.infer<typeof towingJobSchema>;

export default function TowingServices() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: jobs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/towing-jobs"],
  });

  const jobForm = useForm<TowingJobFormData>({
    resolver: zodResolver(towingJobSchema),
    defaultValues: {
      pickupLocation: "",
      dropoffLocation: "",
      vehicleInfo: "",
      customerName: "",
      customerPhone: "",
      towType: "flatbed",
      distance: 0,
      estimatedCost: 0,
      priority: "medium",
      status: "requested",
      notes: "",
    }
  });

  const createJobMutation = useMutation({
    mutationFn: (data: TowingJobFormData) => apiRequest("POST", "/api/towing-jobs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/towing-jobs"] });
      toast({ title: t('common.success', 'Success'), description: t('towing.jobCreatedSuccessfully', 'Towing job created successfully') });
      setIsJobDialogOpen(false);
      jobForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('towing.failedToCreateJob', 'Failed to create towing job'), variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/towing-jobs/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/towing-jobs"] });
      toast({ title: t('common.success', 'Success'), description: t('towing.jobStatusUpdated', 'Job status updated') });
    },
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      requested: "bg-yellow-500 text-white",
      dispatched: "bg-blue-500 text-white",
      in_progress: "bg-purple-500 text-white",
      completed: "bg-green-500 text-white",
      cancelled: "bg-red-500 text-white",
    };
    return colors[status] || "bg-salis-gray text-white";
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-salis-gray text-white",
      medium: "bg-blue-500 text-white",
      high: "bg-orange-500 text-white",
      emergency: "bg-red-600 text-white",
    };
    return colors[priority] || "bg-salis-gray text-white";
  };

  const filteredJobs = statusFilter === "all" ? jobs : jobs.filter((job: any) => job.status === statusFilter);

  return (
    <StandardPageLayout
      title={t('towing.towingServices', 'Towing Services')}
      description={t('towing.manageTowingJobRequests', 'Manage towing job requests and dispatch operations')}
      icon={Truck}
      actions={[
        {
          label: t('towing.createTowingJob', 'Create Towing Job'),
          icon: Truck,
          onClick: () => setIsJobDialogOpen(true),
        }
      ]}
    >
      <div className="flex gap-2 items-center mb-4">
        <span className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins">{t('common.filterByStatus', 'Filter by status')}:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('towing.allJobs', 'All Jobs')}</SelectItem>
            <SelectItem value="requested">{t('status.requested', 'Requested')}</SelectItem>
            <SelectItem value="dispatched">{t('status.dispatched', 'Dispatched')}</SelectItem>
            <SelectItem value="in_progress">{t('common.inProgress', 'In Progress')}</SelectItem>
            <SelectItem value="completed">{t('common.completed', 'Completed')}</SelectItem>
            <SelectItem value="cancelled">{t('status.cancelled', 'Cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
        <CardHeader>
          <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('towing.towingJobs', 'Towing Jobs')}</CardTitle>
          <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
            {t('towing.allTowingServiceRequests', 'All towing service requests and their current status')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-salis-gray font-poppins" data-testid="text-loading">{t('common.loading', 'Loading')}...</p>
          ) : filteredJobs.length === 0 ? (
            <p className="text-salis-gray font-poppins" data-testid="text-no-jobs">{t('towing.noTowingJobsFound', 'No towing jobs found')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('customers.customer', 'Customer')}</TableHead>
                  <TableHead>{t('towing.pickup', 'Pickup')}</TableHead>
                  <TableHead>{t('towing.dropoff', 'Dropoff')}</TableHead>
                  <TableHead>{t('common.type', 'Type')}</TableHead>
                  <TableHead>{t('common.priority', 'Priority')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead>{t('common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job: any) => (
                  <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                    <TableCell data-testid={`text-customer-${job.id}`}>
                      <div>
                        <p className="font-medium">{job.customerName}</p>
                        <p className="text-sm text-salis-gray dark:text-salis-gray-light">{job.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-pickup-${job.id}`}>{job.pickupLocation}</TableCell>
                    <TableCell data-testid={`text-dropoff-${job.id}`}>{job.dropoffLocation}</TableCell>
                    <TableCell data-testid={`text-type-${job.id}`}>{job.towType}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadge(job.priority)} data-testid={`badge-priority-${job.id}`}>
                        {job.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(job.status)} data-testid={`badge-status-${job.id}`}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.status === "requested" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: job.id, status: "dispatched" })}
                          data-testid={`button-dispatch-${job.id}`}
                        >
                          {t('towing.dispatch', 'Dispatch')}
                        </Button>
                      )}
                      {job.status === "dispatched" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: job.id, status: "in_progress" })}
                          data-testid={`button-start-${job.id}`}
                        >
                          {t('towing.start', 'Start')}
                        </Button>
                      )}
                      {job.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: job.id, status: "completed" })}
                          className="bg-green-500 hover:bg-green-600"
                          data-testid={`button-complete-${job.id}`}
                        >
                          {t('towing.complete', 'Complete')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('towing.createTowingJob', 'Create Towing Job')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('towing.createNewTowingRequest', 'Create a new towing service request')}
            </DialogDescription>
          </DialogHeader>
          <Form {...jobForm}>
            <form onSubmit={jobForm.handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={jobForm.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('customers.customerName', 'Customer Name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" data-testid="input-customer-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('customers.customerPhone', 'Customer Phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 123-4567" data-testid="input-customer-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={jobForm.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('towing.pickupLocation', 'Pickup Location')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main St, City, State ZIP" data-testid="input-pickup-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={jobForm.control}
                name="dropoffLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('towing.dropoffLocation', 'Dropoff Location')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="456 Oak Ave, City, State ZIP" data-testid="input-dropoff-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={jobForm.control}
                name="vehicleInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('towing.vehicleInformation', 'Vehicle Information')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="2020 Honda Civic, License: ABC123" data-testid="input-vehicle-info" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={jobForm.control}
                  name="towType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('towing.towType', 'Tow Type')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tow-type">
                            <SelectValue placeholder={t('towing.selectTowType', 'Select tow type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="flatbed">{t('towing.flatbed', 'Flatbed')}</SelectItem>
                          <SelectItem value="wheel_lift">{t('towing.wheelLift', 'Wheel Lift')}</SelectItem>
                          <SelectItem value="dolly">{t('towing.dolly', 'Dolly')}</SelectItem>
                          <SelectItem value="integrated">{t('towing.integrated', 'Integrated')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.priority', 'Priority')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder={t('common.selectPriority', 'Select priority')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">{t('priority.low', 'Low')}</SelectItem>
                          <SelectItem value="medium">{t('priority.medium', 'Medium')}</SelectItem>
                          <SelectItem value="high">{t('priority.high', 'High')}</SelectItem>
                          <SelectItem value="emergency">{t('priority.emergency', 'Emergency')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={jobForm.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('towing.distanceMiles', 'Distance (miles)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-distance"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="estimatedCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('towing.estimatedCost', 'Estimated Cost')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-estimated-cost"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={jobForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.notes', 'Notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('towing.additionalDetails', 'Additional details...')} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createJobMutation.isPending} data-testid="button-submit-job">
                  {createJobMutation.isPending ? t('common.creating', 'Creating...') : t('towing.createJob', 'Create Job')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}
