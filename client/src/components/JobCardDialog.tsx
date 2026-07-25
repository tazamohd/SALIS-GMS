import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Garage, type InsertJobCard } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Form schema matching the backend InsertJobCard type
const jobCardFormSchema = z.object({
  jobNumber: z.string().min(1, "Job number is required"),
  garageId: z.string().min(1, "Garage is required"),
  vehicleInfo: z.object({
    make: z.string().min(1, "Vehicle make is required"),
    model: z.string().min(1, "Vehicle model is required"),
    year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
    licensePlate: z.string().optional(),
  }),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.string().default("medium"),
  estimatedHours: z.preprocess(
    (val) => val === "" || val === null || val === undefined ? undefined : val,
    z.coerce.number().optional()
  ),
});

type JobCardFormData = z.infer<typeof jobCardFormSchema>;

interface JobCardDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function JobCardDialog({ trigger, onSuccess }: JobCardDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Fetch garages for dropdown
  const { data: garages = [] } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const form = useForm<JobCardFormData>({
    resolver: zodResolver(jobCardFormSchema),
    defaultValues: {
      jobNumber: `JOB-${Date.now()}`,
      serviceType: "maintenance",
      priority: "medium",
      vehicleInfo: {
        year: new Date().getFullYear(),
        make: "",
        model: "",
        licensePlate: "",
      },
    },
  });

  const createJobCardMutation = useMutation({
    mutationFn: async (data: JobCardFormData) => {
      const jobCardData: Partial<InsertJobCard> = {
        jobNumber: data.jobNumber,
        garageId: data.garageId,
        vehicleInfo: data.vehicleInfo,
        serviceType: data.serviceType,
        description: data.description,
        priority: data.priority,
        estimatedHours: data.estimatedHours?.toString() || null,
        status: "pending",
      };

      const response = await apiRequest('POST', '/api/job-cards', jobCardData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/integrated/status'] });
      
      toast({
        title: "Success!",
        description: "Job card created successfully",
      });
      
      setOpen(false);
      form.reset({
        jobNumber: `JOB-${Date.now()}`,
        serviceType: "maintenance",
        priority: "medium",
        vehicleInfo: {
          year: new Date().getFullYear(),
          make: "",
          model: "",
          licensePlate: "",
        },
      });
      
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create job card",
      });
    },
  });

  const onSubmit = (data: JobCardFormData) => {
    createJobCardMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button data-testid="button-create-job-card">Create Job Card</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-job-card">
        <DialogHeader>
          <DialogTitle>Create New Job Card</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new job card for vehicle service
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="jobNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Number</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-job-number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="garageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-garage">
                        <SelectValue placeholder="Select garage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {garages.map((garage) => (
                        <SelectItem key={garage.id} value={garage.id}>
                          {garage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleInfo.make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Toyota" data-testid="input-vehicle-make" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleInfo.model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Camry" data-testid="input-vehicle-model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleInfo.year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" data-testid="input-vehicle-year" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleInfo.licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ABC-1234" data-testid="input-license-plate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Service Details</h3>
              <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="customization">Customization</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} type="number" step="0.5" placeholder="2.5" data-testid="input-estimated-hours" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe the service requirements..." 
                        rows={4}
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createJobCardMutation.isPending}
                data-testid="button-submit"
              >
                {createJobCardMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Job Card
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
