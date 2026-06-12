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
import { Truck } from "lucide-react";
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
      requested: "bg-[#64748B] text-white",
      dispatched: "bg-[#0A5ED7] text-white",
      in_progress: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white",
      completed: "bg-[#0A5ED7] text-white",
      cancelled: "bg-[#F97316] text-white",
    };
    return colors[status] || "bg-[#64748B] text-white";
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-[#64748B] text-white",
      medium: "bg-[#0A5ED7] text-white",
      high: "bg-[#F97316] text-white",
      emergency: "bg-[#F97316] text-white",
    };
    return colors[priority] || "bg-[#64748B] text-white";
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
        <span className="text-sm text-[#64748B]">{t('common.filterByStatus', 'Filter by status')}:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <SelectItem value="all" className="text-[#0B1F3B] dark:text-white">{t('towing.allJobs', 'All Jobs')}</SelectItem>
            <SelectItem value="requested" className="text-[#0B1F3B] dark:text-white">{t('status.requested', 'Requested')}</SelectItem>
            <SelectItem value="dispatched" className="text-[#0B1F3B] dark:text-white">{t('status.dispatched', 'Dispatched')}</SelectItem>
            <SelectItem value="in_progress" className="text-[#0B1F3B] dark:text-white">{t('common.inProgress', 'In Progress')}</SelectItem>
            <SelectItem value="completed" className="text-[#0B1F3B] dark:text-white">{t('common.completed', 'Completed')}</SelectItem>
            <SelectItem value="cancelled" className="text-[#0B1F3B] dark:text-white">{t('status.cancelled', 'Cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('towing.towingJobs', 'Towing Jobs')}</CardTitle>
          <CardDescription className="text-[#64748B]">
            {t('towing.allTowingServiceRequests', 'All towing service requests and their current status')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-[#64748B]" data-testid="text-loading">{t('common.loading', 'Loading')}...</p>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 mx-auto text-[#64748B] mb-4" />
              <p className="text-[#0B1F3B] dark:text-white font-medium" data-testid="text-no-jobs">{t('towing.noTowingJobsFound', 'No towing jobs found')}</p>
              <p className="text-sm text-[#64748B] mt-1">{t('towing.createFirstJob', 'Create your first towing job to get started')}</p>
            </div>
          ) : (
            <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC] dark:bg-[#0E1117] border-b border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('customers.customer', 'Customer')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('towing.pickup', 'Pickup')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('towing.dropoff', 'Dropoff')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.type', 'Type')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.priority', 'Priority')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job: any) => (
                    <TableRow key={job.id} className="border-b border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid={`row-job-${job.id}`}>
                      <TableCell data-testid={`text-customer-${job.id}`}>
                        <div>
                          <p className="font-medium text-[#0B1F3B] dark:text-white">{job.customerName}</p>
                          <p className="text-sm text-[#64748B]">{job.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#0B1F3B] dark:text-white" data-testid={`text-pickup-${job.id}`}>{job.pickupLocation}</TableCell>
                      <TableCell className="text-[#0B1F3B] dark:text-white" data-testid={`text-dropoff-${job.id}`}>{job.dropoffLocation}</TableCell>
                      <TableCell className="text-[#0B1F3B] dark:text-white capitalize" data-testid={`text-type-${job.id}`}>{job.towType?.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadge(job.priority)} data-testid={`badge-priority-${job.id}`}>
                          {job.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(job.status)} data-testid={`badge-status-${job.id}`}>
                          {job.status?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.status === "requested" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: job.id, status: "dispatched" })}
                            className="bg-[#0A5ED7] text-white hover:bg-[#0A5ED7]/90"
                            data-testid={`button-dispatch-${job.id}`}
                          >
                            {t('towing.dispatch', 'Dispatch')}
                          </Button>
                        )}
                        {job.status === "dispatched" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: job.id, status: "in_progress" })}
                            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
                            data-testid={`button-start-${job.id}`}
                          >
                            {t('towing.start', 'Start')}
                          </Button>
                        )}
                        {job.status === "in_progress" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: job.id, status: "completed" })}
                            className="bg-[#0A5ED7] text-white hover:bg-[#0A5ED7]/90"
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
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('towing.createTowingJob', 'Create Towing Job')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('customers.customerName', 'Customer Name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]" data-testid="input-customer-name" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('customers.customerPhone', 'Customer Phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 123-4567" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]" data-testid="input-customer-phone" />
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('towing.pickupLocation', 'Pickup Location')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main St, City, State ZIP" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]" data-testid="input-pickup-location" />
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('towing.dropoffLocation', 'Dropoff Location')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="456 Oak Ave, City, State ZIP" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]" data-testid="input-dropoff-location" />
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('towing.vehicleInformation', 'Vehicle Information')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="2020 Honda Civic, License: ABC123" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]" data-testid="input-vehicle-info" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('towing.towType', 'Tow Type')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-tow-type">
                            <SelectValue placeholder={t('towing.selectTowType', 'Select tow type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="flatbed" className="text-[#0B1F3B] dark:text-white">{t('towing.flatbed', 'Flatbed')}</SelectItem>
                          <SelectItem value="wheel_lift" className="text-[#0B1F3B] dark:text-white">{t('towing.wheelLift', 'Wheel Lift')}</SelectItem>
                          <SelectItem value="dolly" className="text-[#0B1F3B] dark:text-white">{t('towing.dolly', 'Dolly')}</SelectItem>
                          <SelectItem value="integrated" className="text-[#0B1F3B] dark:text-white">{t('towing.integrated', 'Integrated')}</SelectItem>
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.priority', 'Priority')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-priority">
                            <SelectValue placeholder={t('common.selectPriority', 'Select priority')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="low" className="text-[#0B1F3B] dark:text-white">{t('priority.low', 'Low')}</SelectItem>
                          <SelectItem value="medium" className="text-[#0B1F3B] dark:text-white">{t('priority.medium', 'Medium')}</SelectItem>
                          <SelectItem value="high" className="text-[#0B1F3B] dark:text-white">{t('priority.high', 'High')}</SelectItem>
                          <SelectItem value="emergency" className="text-[#0B1F3B] dark:text-white">{t('priority.emergency', 'Emergency')}</SelectItem>
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('towing.distanceMiles', 'Distance (miles)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('towing.estimatedCost', 'Estimated Cost')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('towing.additionalDetails', 'Additional details...')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]" data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createJobMutation.isPending} 
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 hover:opacity-90"
                  data-testid="button-submit-job"
                >
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
