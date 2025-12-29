import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Car,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import {
  insertFleetGroupSchema,
  insertFleetVehicleSchema,
  insertFleetContractSchema,
  insertFleetPricingTierSchema,
  insertFleetMaintenanceScheduleSchema,
  type FleetGroup,
  type FleetVehicle,
  type FleetContract,
  type FleetPricingTier,
  type FleetMaintenanceSchedule,
} from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

const fleetGroupFormSchema = insertFleetGroupSchema.extend({
  discountPercentage: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
});

const fleetVehicleFormSchema = insertFleetVehicleSchema.extend({
  averageMonthlyMileage: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

const fleetContractFormSchema = insertFleetContractSchema.extend({
  maxVehicles: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  discountPercentage: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
});

const pricingTierFormSchema = insertFleetPricingTierSchema.extend({
  garageId: z.string().min(1, "Garage ID required"),
  minVehicles: z.string().min(1, "Required").transform(val => parseInt(val)),
  maxVehicles: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  discountPercentage: z.string().min(1, "Required").transform(val => parseFloat(val)),
  applicableServices: z.string().optional().transform(val => val ? val.split(",").map(s => s.trim()).filter(Boolean) : undefined),
});

const maintenanceScheduleFormSchema = insertFleetMaintenanceScheduleSchema.extend({
  intervalMileage: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  intervalMonths: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  estimatedCost: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
});

type FleetGroupFormData = z.input<typeof fleetGroupFormSchema>;
type FleetVehicleFormData = z.input<typeof fleetVehicleFormSchema>;
type FleetContractFormData = z.input<typeof fleetContractFormSchema>;
type PricingTierFormData = z.input<typeof pricingTierFormSchema>;
type MaintenanceScheduleFormData = z.input<typeof maintenanceScheduleFormSchema>;

export default function FleetManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("groups");
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const { data: fleetGroups = [], isLoading: groupsLoading } = useQuery<FleetGroup[]>({
    queryKey: ["/api/fleet/groups"],
  });

  const { data: fleetVehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/fleet/vehicles/group", selectedGroupId],
    enabled: !!selectedGroupId && selectedTab === "vehicles",
  });

  const { data: allVehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
    enabled: isVehicleDialogOpen,
  });

  const { data: contracts = [] } = useQuery<FleetContract[]>({
    queryKey: ["/api/fleet/contracts/group", selectedGroupId],
    enabled: !!selectedGroupId && selectedTab === "contracts",
  });

  const { data: pricingTiers = [] } = useQuery<FleetPricingTier[]>({
    queryKey: ["/api/fleet/pricing-tiers"],
  });

  const { data: schedules = [] } = useQuery<FleetMaintenanceSchedule[]>({
    queryKey: ["/api/fleet/maintenance-schedules/group", selectedGroupId],
    enabled: !!selectedGroupId && selectedTab === "schedules",
  });

  const groupForm = useForm<FleetGroupFormData>({
    resolver: zodResolver(fleetGroupFormSchema),
    defaultValues: {
      fleetName: "",
      companyName: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      billingAddress: "",
      taxId: "",
      discountPercentage: "0",
      paymentTerms: "net_30",
      preferredPaymentMethod: "",
      notes: "",
    },
  });

  const vehicleForm = useForm<FleetVehicleFormData>({
    resolver: zodResolver(fleetVehicleFormSchema),
    defaultValues: {
      fleetGroupId: "",
      vehicleId: "",
      averageMonthlyMileage: "",
      notes: "",
    },
  });

  const contractForm = useForm<FleetContractFormData>({
    resolver: zodResolver(fleetContractFormSchema),
    defaultValues: {
      fleetGroupId: "",
      contractNumber: "",
      contractType: "standard",
      startDate: "",
      endDate: "",
      maxVehicles: "",
      discountPercentage: "0",
      billingCycle: "monthly",
      terms: "",
    },
  });

  const pricingForm = useForm<PricingTierFormData>({
    resolver: zodResolver(pricingTierFormSchema),
    defaultValues: {
      garageId: (user as any)?.garageId || "",
      tierName: "",
      minVehicles: "",
      maxVehicles: "",
      discountPercentage: "",
      applicableServices: "",
      isActive: true,
    },
  });

  const scheduleForm = useForm<MaintenanceScheduleFormData>({
    resolver: zodResolver(maintenanceScheduleFormSchema),
    defaultValues: {
      fleetGroupId: "",
      scheduleName: "",
      description: "",
      serviceType: "",
      intervalType: "mileage",
      intervalMileage: "",
      intervalMonths: "",
      estimatedCost: "",
    },
  });

  const groupMutation = useMutation({
    mutationFn: async (data: FleetGroupFormData) => {
      const parsed = fleetGroupFormSchema.parse(data);
      if (editingGroupId) {
        return await apiRequest("PATCH", `/api/fleet/groups/${editingGroupId}`, parsed);
      }
      return await apiRequest("POST", "/api/fleet/groups", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/groups"] });
      setIsGroupDialogOpen(false);
      setEditingGroupId(null);
      groupForm.reset();
      toast({
        title: editingGroupId ? t('vehicles.fleetGroupUpdated', 'Fleet Group Updated') : t('vehicles.fleetGroupCreated', 'Fleet Group Created'),
        description: t('vehicles.changesSavedSuccessfully', 'Changes saved successfully'),
      });
    },
  });

  const vehicleMutation = useMutation({
    mutationFn: async (data: FleetVehicleFormData) => {
      const parsed = fleetVehicleFormSchema.parse(data);
      if (editingVehicleId) {
        return await apiRequest("PATCH", `/api/fleet/vehicles/${editingVehicleId}`, parsed);
      }
      return await apiRequest("POST", "/api/fleet/vehicles", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/vehicles/group"] });
      setIsVehicleDialogOpen(false);
      setEditingVehicleId(null);
      vehicleForm.reset();
      toast({
        title: editingVehicleId ? t('vehicles.fleetVehicleUpdated', 'Fleet Vehicle Updated') : t('vehicles.fleetVehicleAdded', 'Fleet Vehicle Added'),
        description: t('vehicles.changesSavedSuccessfully', 'Changes saved successfully'),
      });
    },
  });

  const contractMutation = useMutation({
    mutationFn: async (data: FleetContractFormData) => {
      const parsed = fleetContractFormSchema.parse(data);
      if (editingContractId) {
        return await apiRequest("PATCH", `/api/fleet/contracts/${editingContractId}`, parsed);
      }
      return await apiRequest("POST", "/api/fleet/contracts", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/contracts/group"] });
      setIsContractDialogOpen(false);
      setEditingContractId(null);
      contractForm.reset();
      toast({
        title: editingContractId ? t('vehicles.contractUpdated', 'Contract Updated') : t('vehicles.contractCreated', 'Contract Created'),
        description: t('vehicles.changesSavedSuccessfully', 'Changes saved successfully'),
      });
    },
  });

  const pricingMutation = useMutation({
    mutationFn: async (data: PricingTierFormData) => {
      const parsed = pricingTierFormSchema.parse(data);
      if (editingPricingId) {
        return await apiRequest("PATCH", `/api/fleet/pricing-tiers/${editingPricingId}`, parsed);
      }
      return await apiRequest("POST", "/api/fleet/pricing-tiers", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/pricing-tiers"] });
      setIsPricingDialogOpen(false);
      setEditingPricingId(null);
      pricingForm.reset();
      toast({
        title: editingPricingId ? t('vehicles.pricingTierUpdated', 'Pricing Tier Updated') : t('vehicles.pricingTierCreated', 'Pricing Tier Created'),
        description: t('vehicles.changesSavedSuccessfully', 'Changes saved successfully'),
      });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data: MaintenanceScheduleFormData) => {
      const parsed = maintenanceScheduleFormSchema.parse(data);
      if (editingScheduleId) {
        return await apiRequest("PATCH", `/api/fleet/maintenance-schedules/${editingScheduleId}`, parsed);
      }
      return await apiRequest("POST", "/api/fleet/maintenance-schedules", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/maintenance-schedules/group"] });
      setIsScheduleDialogOpen(false);
      setEditingScheduleId(null);
      scheduleForm.reset();
      toast({
        title: editingScheduleId ? t('vehicles.scheduleUpdated', 'Schedule Updated') : t('vehicles.scheduleCreated', 'Schedule Created'),
        description: t('vehicles.changesSavedSuccessfully', 'Changes saved successfully'),
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fleet/groups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/groups"] });
      toast({ title: t('vehicles.fleetGroupDeleted', 'Fleet Group Deleted'), description: t('vehicles.groupRemovedSuccessfully', 'Group removed successfully') });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fleet/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/vehicles/group"] });
      toast({ title: t('vehicles.fleetVehicleRemoved', 'Fleet Vehicle Removed'), description: t('vehicles.vehicleRemovedFromFleet', 'Vehicle removed from fleet') });
    },
  });

  const deleteContractMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fleet/contracts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/contracts/group"] });
      toast({ title: t('vehicles.contractDeleted', 'Contract Deleted'), description: t('vehicles.contractRemovedSuccessfully', 'Contract removed successfully') });
    },
  });

  const deletePricingMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fleet/pricing-tiers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/pricing-tiers"] });
      toast({ title: t('vehicles.pricingTierDeleted', 'Pricing Tier Deleted'), description: t('vehicles.tierRemovedSuccessfully', 'Tier removed successfully') });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fleet/maintenance-schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/maintenance-schedules/group"] });
      toast({ title: t('vehicles.scheduleDeleted', 'Schedule Deleted'), description: t('vehicles.scheduleRemovedSuccessfully', 'Schedule removed successfully') });
    },
  });

  const handleEditGroup = (group: FleetGroup) => {
    setEditingGroupId(group.id);
    groupForm.reset({
      fleetName: group.fleetName,
      companyName: group.companyName || "",
      contactPerson: group.contactPerson || "",
      contactEmail: group.contactEmail || "",
      contactPhone: group.contactPhone || "",
      billingAddress: group.billingAddress || "",
      taxId: group.taxId || "",
      discountPercentage: group.discountPercentage?.toString() || "0",
      paymentTerms: group.paymentTerms || "net_30",
      preferredPaymentMethod: group.preferredPaymentMethod || "",
      notes: group.notes || "",
    });
    setIsGroupDialogOpen(true);
  };

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicleId(vehicle.fleetVehicle.id);
    vehicleForm.reset({
      fleetGroupId: vehicle.fleetVehicle.fleetGroupId,
      vehicleId: vehicle.fleetVehicle.vehicleId,
      averageMonthlyMileage: vehicle.fleetVehicle.averageMonthlyMileage?.toString() || "",
      notes: vehicle.fleetVehicle.notes || "",
    });
    setIsVehicleDialogOpen(true);
  };

  const handleEditContract = (contract: FleetContract) => {
    setEditingContractId(contract.id);
    contractForm.reset({
      fleetGroupId: contract.fleetGroupId,
      contractNumber: contract.contractNumber,
      contractType: contract.contractType,
      startDate: contract.startDate ? format(new Date(contract.startDate), "yyyy-MM-dd") : "",
      endDate: contract.endDate ? format(new Date(contract.endDate), "yyyy-MM-dd") : "",
      maxVehicles: contract.maxVehicles?.toString() || "",
      discountPercentage: contract.discountPercentage?.toString() || "0",
      billingCycle: contract.billingCycle || "monthly",
      terms: contract.terms || "",
    });
    setIsContractDialogOpen(true);
  };

  const handleEditPricing = (tier: FleetPricingTier) => {
    setEditingPricingId(tier.id);
    pricingForm.reset({
      garageId: tier.garageId,
      tierName: tier.tierName,
      minVehicles: tier.minVehicles.toString(),
      maxVehicles: tier.maxVehicles?.toString() || "",
      discountPercentage: tier.discountPercentage.toString(),
      applicableServices: tier.applicableServices?.join(", ") || "",
      isActive: tier.isActive,
    });
    setIsPricingDialogOpen(true);
  };

  const handleEditSchedule = (schedule: FleetMaintenanceSchedule) => {
    setEditingScheduleId(schedule.id);
    scheduleForm.reset({
      fleetGroupId: schedule.fleetGroupId,
      scheduleName: schedule.scheduleName,
      description: schedule.description || "",
      serviceType: schedule.serviceType,
      intervalType: schedule.intervalType,
      intervalMileage: schedule.intervalMileage?.toString() || "",
      intervalMonths: schedule.intervalMonths?.toString() || "",
      estimatedCost: schedule.estimatedCost?.toString() || "",
    });
    setIsScheduleDialogOpen(true);
  };

  const renderFleetGroupsContent = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salis-black dark:text-white">
          {t('vehicles.fleetGroups', 'Fleet Groups')}
        </h2>
        <Button
          onClick={() => {
            setEditingGroupId(null);
            groupForm.reset();
            setIsGroupDialogOpen(true);
          }}
          className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
          data-testid="button-create-fleet-group"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('vehicles.addFleetGroup', 'Add Fleet Group')}
        </Button>
      </div>

      <div className="border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-salis-gray-light dark:bg-salis-gray-dark">
              <TableHead className="text-salis-black dark:text-white">{t('vehicles.fleetName', 'Fleet Name')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('vehicles.company', 'Company')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('vehicles.contactPerson', 'Contact Person')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('vehicles.contactEmail', 'Contact Email')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('common.discount', 'Discount')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-salis-black dark:text-white text-right">{t('common.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupsLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-salis-gray">
                  {t('vehicles.loadingFleetGroups', 'Loading fleet groups...')}
                </TableCell>
              </TableRow>
            ) : fleetGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-salis-gray">
                  {t('vehicles.noFleetGroupsFound', 'No fleet groups found. Create one to get started.')}
                </TableCell>
              </TableRow>
            ) : (
              fleetGroups.map((group) => (
                <TableRow key={group.id} className="border-b border-salis-gray-light dark:border-salis-gray-dark" data-testid={`row-fleet-group-${group.id}`}>
                  <TableCell className="font-medium text-salis-black dark:text-white">
                    {group.fleetName}
                  </TableCell>
                  <TableCell className="text-salis-gray">{group.companyName || "—"}</TableCell>
                  <TableCell className="text-salis-gray">{group.contactPerson || "—"}</TableCell>
                  <TableCell className="text-salis-gray">{group.contactEmail || "—"}</TableCell>
                  <TableCell className="text-salis-gray">{group.discountPercentage}%</TableCell>
                  <TableCell>
                    <Badge
                      variant={group.isActive ? "default" : "secondary"}
                      className={group.isActive ? "bg-salis-black dark:bg-white text-white dark:text-salis-black" : ""}
                    >
                      {group.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGroup(group)}
                        data-testid={`button-edit-fleet-group-${group.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteGroupMutation.mutate(group.id)}
                        data-testid={`button-delete-fleet-group-${group.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderFleetVehiclesContent = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salis-black dark:text-white">
          {t('vehicles.fleetVehicles', 'Fleet Vehicles')}
        </h2>
        <div className="flex gap-4">
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="w-64" data-testid="select-vehicle-fleet-group">
              <SelectValue placeholder={t('vehicles.selectFleetGroup', 'Select Fleet Group')} />
            </SelectTrigger>
            <SelectContent>
              {fleetGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.fleetName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setEditingVehicleId(null);
              vehicleForm.reset({ fleetGroupId: selectedGroupId });
              setIsVehicleDialogOpen(true);
            }}
            className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
            disabled={!selectedGroupId}
            data-testid="button-add-fleet-vehicle"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('vehicles.addVehicle', 'Add Vehicle')}
          </Button>
        </div>
      </div>

      <div className="border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-salis-gray-light dark:bg-salis-gray-dark">
              <TableHead className="text-salis-black dark:text-white">{t('vehicles.vehicle', 'Vehicle')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('vehicles.makeModel', 'Make/Model')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('vehicles.licensePlate', 'License Plate')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('vehicles.avgMonthlyMileage', 'Avg. Monthly Mileage')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('vehicles.assignedDate', 'Assigned Date')}</TableHead>
              <TableHead className="text-salis-black dark:text-white text-right">{t('common.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!selectedGroupId ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-salis-gray">
                  {t('vehicles.selectFleetGroupToViewVehicles', 'Select a fleet group to view vehicles')}
                </TableCell>
              </TableRow>
            ) : fleetVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-salis-gray">
                  {t('vehicles.noVehiclesAssignedToFleet', 'No vehicles assigned to this fleet group')}
                </TableCell>
              </TableRow>
            ) : (
              fleetVehicles.map((vehicle: any) => (
                <TableRow key={vehicle.fleetVehicle.id} className="border-b border-salis-gray-light dark:border-salis-gray-dark" data-testid={`row-fleet-vehicle-${vehicle.fleetVehicle.id}`}>
                  <TableCell className="font-medium text-salis-black dark:text-white">
                    {vehicle.vehicle?.year} {vehicle.vehicle?.make} {vehicle.vehicle?.model}
                  </TableCell>
                  <TableCell className="text-salis-gray">
                    {vehicle.vehicle?.make} {vehicle.vehicle?.model}
                  </TableCell>
                  <TableCell className="text-salis-gray">{vehicle.vehicle?.licensePlate || "—"}</TableCell>
                  <TableCell className="text-salis-gray">
                    {vehicle.fleetVehicle.averageMonthlyMileage ? `${vehicle.fleetVehicle.averageMonthlyMileage.toLocaleString()} km` : "—"}
                  </TableCell>
                  <TableCell className="text-salis-gray">
                    {vehicle.fleetVehicle.assignedDate ? format(new Date(vehicle.fleetVehicle.assignedDate), "MMM dd, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditVehicle(vehicle)}
                        data-testid={`button-edit-fleet-vehicle-${vehicle.fleetVehicle.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteVehicleMutation.mutate(vehicle.fleetVehicle.id)}
                        data-testid={`button-delete-fleet-vehicle-${vehicle.fleetVehicle.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <>
      <TabsPageLayout
        title={t('vehicles.fleetManagement', 'Fleet Management')}
        description={t('vehicles.manageFleetGroupsVehiclesContracts', 'Manage fleet groups, vehicles, and contracts')}
        icon={Building2}
        tabs={[
          {
            id: "groups",
            label: t('vehicles.groups', 'Groups'),
            icon: Building2,
            content: renderFleetGroupsContent(),
          },
          {
            id: "vehicles",
            label: t('vehicles.vehicles', 'Vehicles'),
            icon: Car,
            content: renderFleetVehiclesContent(),
          },
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingGroupId ? t('vehicles.editFleetGroup', 'Edit Fleet Group') : t('vehicles.createFleetGroup', 'Create Fleet Group')}
            </DialogTitle>
            <DialogDescription>
              {t('vehicles.fleetGroupDescription', 'Manage fleet group information and settings')}
            </DialogDescription>
          </DialogHeader>
          <Form {...groupForm}>
            <form onSubmit={groupForm.handleSubmit((data) => groupMutation.mutate(data))} className="space-y-4">
              <FormField
                control={groupForm.control}
                name="fleetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.fleetName', 'Fleet Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-fleet-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={groupForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.companyName', 'Company Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-company-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={groupForm.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.contactPerson', 'Contact Person')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-contact-person" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.contactEmail', 'Contact Email')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" value={field.value || ""} data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={groupForm.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.discountPercentage', 'Discount Percentage')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" data-testid="input-discount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={groupMutation.isPending}>
                  {groupMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingVehicleId ? t('vehicles.editFleetVehicle', 'Edit Fleet Vehicle') : t('vehicles.addFleetVehicle', 'Add Fleet Vehicle')}
            </DialogTitle>
          </DialogHeader>
          <Form {...vehicleForm}>
            <form onSubmit={vehicleForm.handleSubmit((data) => vehicleMutation.mutate(data))} className="space-y-4">
              <FormField
                control={vehicleForm.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.vehicle', 'Vehicle')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-vehicle">
                          <SelectValue placeholder={t('vehicles.selectVehicle', 'Select vehicle')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allVehicles.map((v: any) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.year} {v.make} {v.model} - {v.licensePlate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vehicleForm.control}
                name="averageMonthlyMileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.avgMonthlyMileage', 'Average Monthly Mileage')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" data-testid="input-mileage" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsVehicleDialogOpen(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={vehicleMutation.isPending}>
                  {vehicleMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
