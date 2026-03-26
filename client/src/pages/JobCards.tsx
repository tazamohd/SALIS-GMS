import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Eye, Edit, Calendar, User, Wrench, Building2, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { JobCard, Garage, User as UserType, InsertJobCard, TechnicianProfile } from "@shared/schema";
import { insertJobCardSchema } from "@shared/schema";
import { StandardPageLayout } from "@/components/layouts";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";

const priorityColors = {
  low: "bg-[#64748B]/10 text-[#64748B]",
  medium: "bg-[#0A5ED7]/10 text-[#0A5ED7]",
  high: "bg-[#F97316]/10 text-[#F97316]",
  urgent: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  pending: "bg-[#64748B]/10 text-[#64748B]",
  assigned: "bg-[#0A5ED7]/10 text-[#0A5ED7]",
  in_progress: "bg-[#0BB3FF]/10 text-[#0BB3FF]",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

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
  const { t } = useTranslation();
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

  const { data: technicians } = useQuery<UserType[]>({
    queryKey: ['/api/technicians', filterGarageId],
    queryFn: () =>
      fetch(
        `/api/technicians${filterGarageId !== "all" ? `?garage_id=${filterGarageId}` : ""}`
      ).then((r) => r.json()),
  });

  const { data: technicianProfiles } = useQuery<TechnicianProfile[]>({
    queryKey: ['/api/technician-profiles'],
    enabled: !!technicians && technicians.length > 0,
  });

  const jobCardsUrl = `/api/job-cards${filterGarageId !== "all" ? `?garage_id=${filterGarageId}` : ""}`;
  const { data: jobCards, isLoading, error, refetch } = useQuery<JobCard[]>({
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
        title: t('common.success', 'Success'),
        description: t('jobCards.createSuccess', 'Job card created successfully'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('jobCards.createError', 'Failed to create job card'),
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
        title: t('common.success', 'Success'),
        description: t('jobCards.statusUpdated', 'Job card status updated'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('jobCards.statusUpdateError', 'Failed to update status'),
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

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message="Failed to load job cards" retry={refetch} />;

  const filteredJobCards = (jobCards ?? []).filter((jc) => {
    if (filterStatus !== "all" && jc.status !== filterStatus) return false;
    if (filterPriority !== "all" && jc.priority !== filterPriority) return false;
    return true;
  });

  return (
    <>
      <StandardPageLayout
        title={t('jobCards.title', 'Job Cards')}
        description={t('jobCards.description', 'Manage service job cards and track progress')}
        icon={Wrench}
        actions={[
          {
            label: t('jobCards.create', 'Create Job Card'),
            onClick: () => setIsCreateOpen(true),
            icon: Plus,
            variant: "default",
          },
        ]}
      >
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-[#0B1F3B] dark:text-white">{t('jobCards.garage', 'Garage')}</Label>
                <Select value={filterGarageId} onValueChange={setFilterGarageId}>
                  <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-filter-garage">
                    <Building2 className="w-4 h-4 mr-2 text-[#0A5ED7]" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('jobCards.allGarages', 'All Garages')}</SelectItem>
                    {(garages ?? []).map((garage) => (
                      <SelectItem key={garage.id} value={garage.id}>
                        {garage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-filter-status">
                    <Filter className="w-4 h-4 mr-2 text-[#0A5ED7]" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('jobCards.allStatuses', 'All Statuses')}</SelectItem>
                    <SelectItem value="pending">{t('jobCards.status.pending', 'Pending')}</SelectItem>
                    <SelectItem value="assigned">{t('jobCards.status.assigned', 'Assigned')}</SelectItem>
                    <SelectItem value="in_progress">{t('jobCards.status.inProgress', 'In Progress')}</SelectItem>
                    <SelectItem value="completed">{t('jobCards.status.completed', 'Completed')}</SelectItem>
                    <SelectItem value="cancelled">{t('jobCards.status.cancelled', 'Cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#0B1F3B] dark:text-white">{t('jobCards.priority', 'Priority')}</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-filter-priority">
                    <Filter className="w-4 h-4 mr-2 text-[#0A5ED7]" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('jobCards.allPriorities', 'All Priorities')}</SelectItem>
                    <SelectItem value="low">{t('jobCards.priority.low', 'Low')}</SelectItem>
                    <SelectItem value="medium">{t('jobCards.priority.medium', 'Medium')}</SelectItem>
                    <SelectItem value="high">{t('jobCards.priority.high', 'High')}</SelectItem>
                    <SelectItem value="urgent">{t('jobCards.priority.urgent', 'Urgent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#64748B]">{t('jobCards.loading', 'Loading job cards...')}</p>
          </div>
        ) : filteredJobCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                <Wrench className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0A5ED7]/20" />
              <div className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-[#0BB3FF]/20" />
            </div>
            <h3 className="text-xl font-semibold text-[#0B1F3B] dark:text-white mb-2">
              {t('jobCards.noJobCards', 'No Job Cards Found')}
            </h3>
            <p className="text-[#64748B] mb-6 text-center max-w-md">
              {t('jobCards.emptyDescription', 'Get started by creating your first service job card.')}
            </p>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('jobCards.create', 'Create Job Card')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobCards.map((jobCard) => {
              const vehicle = jobCard.vehicleInfo as any;
              const garage = garages?.find(g => g.id === jobCard.garageId);
              const assignedTech = users?.find(u => u.id === jobCard.assignedTo);

              return (
                <Card 
                  key={jobCard.id} 
                  className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-lg hover:border-[#0A5ED7]/30 transition-all" 
                  data-testid={`card-job-card-${jobCard.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-[#0B1F3B] dark:text-white">
                          {jobCard.jobNumber}
                        </CardTitle>
                        <p className="text-sm text-[#64748B] mt-1">
                          {vehicle?.make} {vehicle?.model} ({vehicle?.year})
                        </p>
                        <p className="text-xs text-[#64748B]">{vehicle?.licensePlate}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={statusColors[jobCard.status] || statusColors.pending}>
                          {t(`jobCards.status.${jobCard.status}`, jobCard.status)}
                        </Badge>
                        <Badge className={priorityColors[jobCard.priority as keyof typeof priorityColors]}>
                          {t(`jobCards.priority.${jobCard.priority}`, jobCard.priority)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <Building2 className="w-4 h-4 text-[#0A5ED7]" />
                        <span>{garage?.name || t('jobCards.unknownGarage', 'Unknown Garage')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <Wrench className="w-4 h-4 text-[#0A5ED7]" />
                        <span>{jobCard.serviceType}</span>
                      </div>
                      {assignedTech && (
                        <div className="flex items-center gap-2 text-[#64748B]">
                          <User className="w-4 h-4 text-[#0A5ED7]" />
                          <span>{assignedTech.fullName || assignedTech.email}</span>
                        </div>
                      )}
                      {jobCard.scheduledDate && (
                        <div className="flex items-center gap-2 text-[#64748B]">
                          <Calendar className="w-4 h-4 text-[#0A5ED7]" />
                          <span>{new Date(jobCard.scheduledDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#64748B] mt-3 line-clamp-2">
                      {jobCard.description}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(jobCard)}
                        className="flex-1 border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                        data-testid={`button-view-details-${jobCard.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t('common.details', 'Details')}
                      </Button>
                      {jobCard.status !== 'completed' && jobCard.status !== 'cancelled' && (
                        <Select
                          value={jobCard.status}
                          onValueChange={(status) => handleStatusChange(jobCard, status)}
                        >
                          <SelectTrigger className="flex-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`select-status-${jobCard.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t('jobCards.status.pending', 'Pending')}</SelectItem>
                            <SelectItem value="assigned">{t('jobCards.status.assigned', 'Assigned')}</SelectItem>
                            <SelectItem value="in_progress">{t('jobCards.status.inProgress', 'In Progress')}</SelectItem>
                            <SelectItem value="completed">{t('jobCards.status.completed', 'Completed')}</SelectItem>
                            <SelectItem value="cancelled">{t('jobCards.status.cancelled', 'Cancelled')}</SelectItem>
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
      </StandardPageLayout>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('jobCards.createNew', 'Create New Job Card')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobNumber" className="text-[#0B1F3B] dark:text-white">{t('jobCards.jobNumber', 'Job Number')} *</Label>
                <Input
                  id="jobNumber"
                  {...createForm.register("jobNumber")}
                  placeholder="JC-2025-001"
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-job-number"
                />
                {createForm.formState.errors.jobNumber && (
                  <p className="text-sm text-[#F97316] mt-1">{createForm.formState.errors.jobNumber.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="garageId" className="text-[#0B1F3B] dark:text-white">{t('jobCards.garage', 'Garage')} *</Label>
                <Select
                  value={createForm.watch("garageId")}
                  onValueChange={(value) => createForm.setValue("garageId", value)}
                >
                  <SelectTrigger id="garageId" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-garage">
                    <SelectValue placeholder={t('jobCards.selectGarage', 'Select garage')} />
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
                  <p className="text-sm text-[#F97316] mt-1">{createForm.formState.errors.garageId.message}</p>
                )}
              </div>
            </div>

            <div className="border-t border-[#E2E8F0] dark:border-[#232A36] pt-4">
              <h3 className="font-semibold mb-3 text-[#0B1F3B] dark:text-white">{t('jobCards.vehicleInfo', 'Vehicle Information')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make" className="text-[#0B1F3B] dark:text-white">{t('jobCards.make', 'Make')} *</Label>
                  <Input
                    id="make"
                    {...createForm.register("vehicleInfo.make")}
                    placeholder="Toyota"
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid="input-vehicle-make"
                  />
                </div>
                <div>
                  <Label htmlFor="model" className="text-[#0B1F3B] dark:text-white">{t('jobCards.model', 'Model')} *</Label>
                  <Input
                    id="model"
                    {...createForm.register("vehicleInfo.model")}
                    placeholder="Camry"
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid="input-vehicle-model"
                  />
                </div>
                <div>
                  <Label htmlFor="year" className="text-[#0B1F3B] dark:text-white">{t('jobCards.year', 'Year')} *</Label>
                  <Input
                    id="year"
                    {...createForm.register("vehicleInfo.year")}
                    placeholder="2023"
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid="input-vehicle-year"
                  />
                </div>
                <div>
                  <Label htmlFor="licensePlate" className="text-[#0B1F3B] dark:text-white">{t('jobCards.licensePlate', 'License Plate')} *</Label>
                  <Input
                    id="licensePlate"
                    {...createForm.register("vehicleInfo.licensePlate")}
                    placeholder="ABC-1234"
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid="input-vehicle-license"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="vin" className="text-[#0B1F3B] dark:text-white">{t('jobCards.vinOptional', 'VIN (Optional)')}</Label>
                  <Input
                    id="vin"
                    {...createForm.register("vehicleInfo.vin")}
                    placeholder="1HGBH41JXMN109186"
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid="input-vehicle-vin"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E2E8F0] dark:border-[#232A36] pt-4">
              <h3 className="font-semibold mb-3 text-[#0B1F3B] dark:text-white">{t('jobCards.serviceDetails', 'Service Details')}</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceType" className="text-[#0B1F3B] dark:text-white">{t('jobCards.serviceType', 'Service Type')} *</Label>
                  <Select
                    value={createForm.watch("serviceType")}
                    onValueChange={(value) => createForm.setValue("serviceType", value)}
                  >
                    <SelectTrigger id="serviceType" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-service-type">
                      <SelectValue placeholder={t('jobCards.selectServiceType', 'Select service type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">{t('jobCards.serviceTypes.maintenance', 'Maintenance')}</SelectItem>
                      <SelectItem value="repair">{t('jobCards.serviceTypes.repair', 'Repair')}</SelectItem>
                      <SelectItem value="diagnostic">{t('jobCards.serviceTypes.diagnostic', 'Diagnostic')}</SelectItem>
                      <SelectItem value="inspection">{t('jobCards.serviceTypes.inspection', 'Inspection')}</SelectItem>
                      <SelectItem value="bodywork">{t('jobCards.serviceTypes.bodywork', 'Bodywork')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description" className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')} *</Label>
                  <Textarea
                    id="description"
                    {...createForm.register("description")}
                    placeholder={t('jobCards.descriptionPlaceholder', 'Describe the service required...')}
                    rows={3}
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid="input-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority" className="text-[#0B1F3B] dark:text-white">{t('jobCards.priority', 'Priority')} *</Label>
                    <Select
                      value={createForm.watch("priority")}
                      onValueChange={(value: any) => createForm.setValue("priority", value)}
                    >
                      <SelectTrigger id="priority" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('jobCards.priority.low', 'Low')}</SelectItem>
                        <SelectItem value="medium">{t('jobCards.priority.medium', 'Medium')}</SelectItem>
                        <SelectItem value="high">{t('jobCards.priority.high', 'High')}</SelectItem>
                        <SelectItem value="urgent">{t('jobCards.priority.urgent', 'Urgent')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo" className="text-[#0B1F3B] dark:text-white">{t('jobCards.assignTo', 'Assign To')}</Label>
                    <Select
                      value={createForm.watch("assignedTo") || ""}
                      onValueChange={(value) => createForm.setValue("assignedTo", value)}
                    >
                      <SelectTrigger id="assignedTo" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-assigned-to">
                        <SelectValue placeholder={t('jobCards.selectTechnician', 'Select technician')} />
                      </SelectTrigger>
                      <SelectContent>
                        {(technicians ?? []).map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.fullName || tech.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedHours" className="text-[#0B1F3B] dark:text-white">{t('jobCards.estimatedHours', 'Estimated Hours')}</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      step="0.5"
                      {...createForm.register("estimatedHours")}
                      placeholder="2.5"
                      className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                      data-testid="input-estimated-hours"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledDate" className="text-[#0B1F3B] dark:text-white">{t('jobCards.scheduledDate', 'Scheduled Date')}</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      {...createForm.register("scheduledDate")}
                      className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                      data-testid="input-scheduled-date"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-[#0B1F3B] dark:text-white">{t('jobCards.notes', 'Notes')}</Label>
                  <Textarea
                    id="notes"
                    {...createForm.register("notes")}
                    placeholder={t('jobCards.notesPlaceholder', 'Additional notes...')}
                    rows={2}
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
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
                className="border-[#E2E8F0] dark:border-[#232A36]"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
                data-testid="button-create-submit"
              >
                {createMutation.isPending ? t('common.creating', 'Creating...') : t('jobCards.create', 'Create Job Card')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{selectedJobCard?.jobNumber}</DialogTitle>
          </DialogHeader>
          {selectedJobCard && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={statusColors[selectedJobCard.status] || statusColors.pending}>
                  {t(`jobCards.status.${selectedJobCard.status}`, selectedJobCard.status)}
                </Badge>
                <Badge className={priorityColors[selectedJobCard.priority as keyof typeof priorityColors]}>
                  {t(`jobCards.priority.${selectedJobCard.priority}`, selectedJobCard.priority)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-[#64748B]">{t('jobCards.vehicle', 'Vehicle')}</Label>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">
                    {(selectedJobCard.vehicleInfo as any)?.make} {(selectedJobCard.vehicleInfo as any)?.model}
                  </p>
                </div>
                <div>
                  <Label className="text-[#64748B]">{t('jobCards.licensePlate', 'License Plate')}</Label>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{(selectedJobCard.vehicleInfo as any)?.licensePlate}</p>
                </div>
                <div>
                  <Label className="text-[#64748B]">{t('jobCards.serviceType', 'Service Type')}</Label>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedJobCard.serviceType}</p>
                </div>
                <div>
                  <Label className="text-[#64748B]">{t('jobCards.estimatedHours', 'Estimated Hours')}</Label>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedJobCard.estimatedHours || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-[#64748B]">{t('common.description', 'Description')}</Label>
                <p className="text-sm text-[#0B1F3B] dark:text-white mt-1">{selectedJobCard.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
              className="border-[#E2E8F0] dark:border-[#232A36]"
            >
              {t('common.close', 'Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
