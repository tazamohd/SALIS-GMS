import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Eye, Edit, Calendar, User, Wrench, Building2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { JobCard, Garage, User as UserType, InsertJobCard, TechnicianProfile } from "@shared/schema";
import { insertJobCardSchema } from "@shared/schema";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

// Extend the insertJobCardSchema for the form (with string types for numbers and dates)
const jobCardFormSchema = insertJobCardSchema.extend({
  estimatedHours: z.string().optional(),
  totalCost: z.string().optional(),
  scheduledDate: z.string().optional(),
  vehicleInfo: z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().min(1, "Year is required"),
    licensePlate: z.string().min(1, "License plate is required"),
    vin: z.string().optional(),
  }),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  startedAt: true,
  completedAt: true,
  actualHours: true,
  status: true,
});

type JobCardFormData = z.infer<typeof jobCardFormSchema>;

export function JobCards() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [filterGarageId, setFilterGarageId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const { data: users } = useQuery<UserType[]>({
    queryKey: ['/api/users'],
  });

  // Fetch technicians for assignment dropdown
  const { data: technicians } = useQuery<UserType[]>({
    queryKey: ['/api/technicians', filterGarageId],
    queryFn: () =>
      fetch(
        `/api/technicians${filterGarageId !== "all" ? `?garage_id=${filterGarageId}` : ""}`
      ).then((r) => r.json()),
  });

  const jobCardsUrl = `/api/job-cards${filterGarageId !== "all" ? `?garage_id=${filterGarageId}` : ""}`;
  const { data: jobCards, isLoading } = useQuery<JobCard[]>({
    queryKey: [jobCardsUrl],
  });

  const createForm = useForm<JobCardFormData>({
    resolver: zodResolver(jobCardFormSchema),
    defaultValues: {
      jobNumber: "",
      garageId: "",
      branchId: "",
      customerId: "",
      priority: "medium",
      serviceType: "",
      description: "",
      estimatedHours: "",
      totalCost: "",
      assignedTo: "",
      scheduledDate: "",
      notes: "",
      vehicleInfo: {
        make: "",
        model: "",
        year: "",
        licensePlate: "",
        vin: "",
      },
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: JobCardFormData) => {
      return apiRequest("POST", "/api/job-cards", {
        ...data,
        vehicleInfo: data.vehicleInfo,
        estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : null,
        totalCost: data.totalCost ? parseFloat(data.totalCost) : null,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === 'string' && key.startsWith('/api/job-cards');
      }});
      setIsCreateOpen(false);
      createForm.reset();
      toast({
        title: "Success",
        description: "Job card created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job card",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, jobCard }: { id: string; status: string; jobCard: JobCard }) => {
      const updates: any = { status };
      if (status === 'in_progress' && !jobCard.startedAt) {
        updates.startedAt = new Date().toISOString();
      } else if (status === 'completed' && !jobCard.completedAt) {
        updates.completedAt = new Date().toISOString();
      }
      return apiRequest("PUT", `/api/job-cards/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === 'string' && key.startsWith('/api/job-cards');
      }});
      toast({
        title: "Success",
        description: "Job card status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = createForm.handleSubmit((data) => {
    createMutation.mutate(data);
  });

  const handleViewDetails = (jobCard: JobCard) => {
    setSelectedJobCard(jobCard);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = (jobCard: JobCard, newStatus: string) => {
    setSelectedJobCard(jobCard);
    updateStatusMutation.mutate({ id: jobCard.id, status: newStatus, jobCard });
  };

  // Filter job cards
  const filteredJobCards = (jobCards ?? []).filter((jc) => {
    if (filterStatus !== "all" && jc.status !== filterStatus) return false;
    if (filterPriority !== "all" && jc.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-[#222029]">
            Job Cards
          </h1>
          <p className="font-['Poppins',Helvetica] font-normal text-sm text-[#999999] mt-1">
            Manage service job cards and track progress
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-create-job-card"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job Card
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Garage</Label>
              <Select value={filterGarageId} onValueChange={setFilterGarageId}>
                <SelectTrigger data-testid="select-filter-garage">
                  <Building2 className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Garages</SelectItem>
                  {(garages ?? []).map((garage) => (
                    <SelectItem key={garage.id} value={garage.id}>
                      {garage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="select-filter-status">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger data-testid="select-filter-priority">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Cards Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading job cards...</p>
        </div>
      ) : filteredJobCards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No job cards found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first job card to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobCards.map((jobCard) => {
            const vehicle = jobCard.vehicleInfo as any;
            const garage = garages?.find(g => g.id === jobCard.garageId);
            const assignedTech = users?.find(u => u.id === jobCard.assignedTo);

            return (
              <Card key={jobCard.id} className="hover:shadow-lg transition-shadow" data-testid={`card-job-card-${jobCard.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">
                        {jobCard.jobNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {vehicle?.make} {vehicle?.model} ({vehicle?.year})
                      </p>
                      <p className="text-xs text-gray-400">{vehicle?.licensePlate}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={statusColors[jobCard.status as keyof typeof statusColors]}>
                        {jobCard.status}
                      </Badge>
                      <Badge className={priorityColors[jobCard.priority as keyof typeof priorityColors]}>
                        {jobCard.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{garage?.name || 'Unknown Garage'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Wrench className="w-4 h-4" />
                      <span>{jobCard.serviceType}</span>
                    </div>
                    {assignedTech && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{assignedTech.fullName || assignedTech.email}</span>
                      </div>
                    )}
                    {jobCard.scheduledDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(jobCard.scheduledDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                    {jobCard.description}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(jobCard)}
                      className="flex-1"
                      data-testid={`button-view-details-${jobCard.id}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    {jobCard.status !== 'completed' && jobCard.status !== 'cancelled' && (
                      <Select
                        value={jobCard.status}
                        onValueChange={(status) => handleStatusChange(jobCard, status)}
                      >
                        <SelectTrigger className="flex-1" data-testid={`select-status-${jobCard.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Job Card Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Job Card</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobNumber">Job Number *</Label>
                <Input
                  id="jobNumber"
                  {...createForm.register("jobNumber")}
                  placeholder="JC-2025-001"
                  data-testid="input-job-number"
                />
                {createForm.formState.errors.jobNumber && (
                  <p className="text-sm text-red-600 mt-1">{createForm.formState.errors.jobNumber.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="garageId">Garage *</Label>
                <Select
                  value={createForm.watch("garageId")}
                  onValueChange={(value) => createForm.setValue("garageId", value)}
                >
                  <SelectTrigger id="garageId" data-testid="select-garage">
                    <SelectValue placeholder="Select garage" />
                  </SelectTrigger>
                  <SelectContent>
                    {(garages ?? []).map((garage) => (
                      <SelectItem key={garage.id} value={garage.id}>
                        {garage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createForm.formState.errors.garageId && (
                  <p className="text-sm text-red-600 mt-1">{createForm.formState.errors.garageId.message}</p>
                )}
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    {...createForm.register("vehicleInfo.make")}
                    placeholder="Toyota"
                    data-testid="input-vehicle-make"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    {...createForm.register("vehicleInfo.model")}
                    placeholder="Camry"
                    data-testid="input-vehicle-model"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    {...createForm.register("vehicleInfo.year")}
                    placeholder="2023"
                    data-testid="input-vehicle-year"
                  />
                </div>
                <div>
                  <Label htmlFor="licensePlate">License Plate *</Label>
                  <Input
                    id="licensePlate"
                    {...createForm.register("vehicleInfo.licensePlate")}
                    placeholder="ABC-1234"
                    data-testid="input-vehicle-license"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="vin">VIN (Optional)</Label>
                  <Input
                    id="vin"
                    {...createForm.register("vehicleInfo.vin")}
                    placeholder="1HGBH41JXMN109186"
                    data-testid="input-vehicle-vin"
                  />
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Service Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select
                    value={createForm.watch("serviceType")}
                    onValueChange={(value) => createForm.setValue("serviceType", value)}
                  >
                    <SelectTrigger id="serviceType" data-testid="select-service-type">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="bodywork">Bodywork</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...createForm.register("description")}
                    placeholder="Describe the service required..."
                    rows={3}
                    data-testid="input-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={createForm.watch("priority")}
                      onValueChange={(value: any) => createForm.setValue("priority", value)}
                    >
                      <SelectTrigger id="priority" data-testid="select-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assign Technician</Label>
                    <Select
                      value={createForm.watch("assignedTo")}
                      onValueChange={(value) => createForm.setValue("assignedTo", value)}
                    >
                      <SelectTrigger id="assignedTo" data-testid="select-technician">
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians?.map((tech) => {
                          // Fetch technician profile inline
                          const profileQuery = useQuery<TechnicianProfile>({
                            queryKey: ['/api/technician-profiles', tech.id],
                            queryFn: () => fetch(`/api/technician-profiles/${tech.id}`).then((r) => r.json()),
                          });
                          const profile = profileQuery.data;

                          return (
                            <SelectItem key={tech.id} value={tech.id} data-testid={`option-tech-${tech.id}`}>
                              <div className="flex items-center gap-2">
                                <span>{tech.fullName || tech.email}</span>
                                {profile?.level && (
                                  <span className="text-xs text-muted-foreground">
                                    ({profile.level}
                                    {profile.speciality ? ` - ${profile.speciality}` : ""})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      step="0.5"
                      {...createForm.register("estimatedHours")}
                      placeholder="4.5"
                      data-testid="input-estimated-hours"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalCost">Total Cost</Label>
                    <Input
                      id="totalCost"
                      type="number"
                      step="0.01"
                      {...createForm.register("totalCost")}
                      placeholder="500.00"
                      data-testid="input-total-cost"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      {...createForm.register("scheduledDate")}
                      data-testid="input-scheduled-date"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...createForm.register("notes")}
                    placeholder="Additional notes..."
                    rows={2}
                    data-testid="input-notes"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createMutation.isPending}
                data-testid="button-submit-create"
              >
                {createMutation.isPending ? "Creating..." : "Create Job Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Job Card Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Card Details</DialogTitle>
          </DialogHeader>
          {selectedJobCard && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Job Number</Label>
                  <p className="font-semibold">{selectedJobCard.jobNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedJobCard.status as keyof typeof statusColors]}>
                      {selectedJobCard.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Priority</Label>
                  <div className="mt-1">
                    <Badge className={priorityColors[selectedJobCard.priority as keyof typeof priorityColors]}>
                      {selectedJobCard.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Service Type</Label>
                  <p className="font-semibold capitalize">{selectedJobCard.serviceType}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Vehicle</Label>
                    <p className="font-semibold">
                      {(selectedJobCard.vehicleInfo as any)?.make} {(selectedJobCard.vehicleInfo as any)?.model} ({(selectedJobCard.vehicleInfo as any)?.year})
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">License Plate</Label>
                    <p className="font-semibold">{(selectedJobCard.vehicleInfo as any)?.licensePlate}</p>
                  </div>
                  {(selectedJobCard.vehicleInfo as any)?.vin && (
                    <div className="col-span-2">
                      <Label className="text-gray-600">VIN</Label>
                      <p className="font-semibold">{(selectedJobCard.vehicleInfo as any)?.vin}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-gray-600">Description</Label>
                <p className="mt-1">{selectedJobCard.description}</p>
              </div>

              {selectedJobCard.notes && (
                <div className="border-t pt-4">
                  <Label className="text-gray-600">Notes</Label>
                  <p className="mt-1">{selectedJobCard.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedJobCard.estimatedHours && (
                    <div>
                      <Label className="text-gray-600">Estimated Hours</Label>
                      <p className="font-semibold">{selectedJobCard.estimatedHours}h</p>
                    </div>
                  )}
                  {selectedJobCard.actualHours && (
                    <div>
                      <Label className="text-gray-600">Actual Hours</Label>
                      <p className="font-semibold">{selectedJobCard.actualHours}h</p>
                    </div>
                  )}
                  {selectedJobCard.totalCost && (
                    <div>
                      <Label className="text-gray-600">Total Cost</Label>
                      <p className="font-semibold">${selectedJobCard.totalCost}</p>
                    </div>
                  )}
                  {selectedJobCard.scheduledDate && (
                    <div>
                      <Label className="text-gray-600">Scheduled Date</Label>
                      <p className="font-semibold">
                        {new Date(selectedJobCard.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedJobCard.startedAt && (
                    <div>
                      <Label className="text-gray-600">Started At</Label>
                      <p className="font-semibold">
                        {new Date(selectedJobCard.startedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedJobCard.completedAt && (
                    <div>
                      <Label className="text-gray-600">Completed At</Label>
                      <p className="font-semibold">
                        {new Date(selectedJobCard.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
              data-testid="button-close-details"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
