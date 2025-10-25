import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

// Extend insert schemas to handle form inputs (strings that need to be converted to numbers)
const fleetGroupFormSchema = insertFleetGroupSchema.extend({
  discountPercentage: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
});

const fleetVehicleFormSchema = insertFleetVehicleSchema.extend({
  assignedMileage: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

const fleetContractFormSchema = insertFleetContractSchema.extend({
  numberOfVehicles: z.string().min(1, "Required").transform(val => parseInt(val)),
  discountPercentage: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
});

const pricingTierFormSchema = insertFleetPricingTierSchema.extend({
  minVehicles: z.string().min(1, "Required").transform(val => parseInt(val)),
  maxVehicles: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  discountPercentage: z.string().min(1, "Required").transform(val => parseFloat(val)),
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
  const { toast } = useToast();
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

  // Fetch fleet groups
  const { data: fleetGroups = [], isLoading: groupsLoading } = useQuery<FleetGroup[]>({
    queryKey: ["/api/fleet/groups"],
  });

  // Fetch fleet vehicles for selected group
  const { data: fleetVehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/fleet/vehicles/group", selectedGroupId],
    enabled: !!selectedGroupId && selectedTab === "vehicles",
  });

  // Fetch all vehicles for the dropdown
  const { data: allVehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
    enabled: isVehicleDialogOpen,
  });

  // Fetch fleet contracts for selected group
  const { data: contracts = [] } = useQuery<FleetContract[]>({
    queryKey: ["/api/fleet/contracts/group", selectedGroupId],
    enabled: !!selectedGroupId && selectedTab === "contracts",
  });

  // Fetch pricing tiers
  const { data: pricingTiers = [] } = useQuery<FleetPricingTier[]>({
    queryKey: ["/api/fleet/pricing-tiers"],
  });

  // Fetch maintenance schedules for selected group
  const { data: schedules = [] } = useQuery<FleetMaintenanceSchedule[]>({
    queryKey: ["/api/fleet/maintenance-schedules/group", selectedGroupId],
    enabled: !!selectedGroupId && selectedTab === "schedules",
  });

  // Fleet Group Form
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

  // Fleet Vehicle Form
  const vehicleForm = useForm<FleetVehicleFormData>({
    resolver: zodResolver(fleetVehicleFormSchema),
    defaultValues: {
      fleetGroupId: "",
      vehicleId: "",
      assignedMileage: "",
      notes: "",
    },
  });

  // Contract Form
  const contractForm = useForm<FleetContractFormData>({
    resolver: zodResolver(fleetContractFormSchema),
    defaultValues: {
      fleetGroupId: "",
      contractNumber: "",
      contractType: "standard",
      startDate: "",
      endDate: "",
      numberOfVehicles: "",
      discountPercentage: "0",
      paymentTerms: "net_30",
      billingCycle: "monthly",
      terms: "",
      notes: "",
    },
  });

  // Pricing Tier Form
  const pricingForm = useForm<PricingTierFormData>({
    resolver: zodResolver(pricingTierFormSchema),
    defaultValues: {
      tierName: "",
      description: "",
      minVehicles: "",
      maxVehicles: "",
      discountPercentage: "",
      serviceTypes: "",
      isActive: true,
    },
  });

  // Maintenance Schedule Form
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

  // Create/Update Fleet Group Mutation
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
        title: editingGroupId ? "Fleet Group Updated" : "Fleet Group Created",
        description: "Changes saved successfully",
      });
    },
  });

  // Create/Update Fleet Vehicle Mutation
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
        title: editingVehicleId ? "Fleet Vehicle Updated" : "Fleet Vehicle Added",
        description: "Changes saved successfully",
      });
    },
  });

  // Create/Update Contract Mutation
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
        title: editingContractId ? "Contract Updated" : "Contract Created",
        description: "Changes saved successfully",
      });
    },
  });

  // Create/Update Pricing Tier Mutation
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
        title: editingPricingId ? "Pricing Tier Updated" : "Pricing Tier Created",
        description: "Changes saved successfully",
      });
    },
  });

  // Create/Update Maintenance Schedule Mutation
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
        title: editingScheduleId ? "Schedule Updated" : "Schedule Created",
        description: "Changes saved successfully",
      });
    },
  });

  // Delete Mutations
  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fleet/groups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/groups"] });
      toast({ title: "Fleet Group Deleted", description: "Group removed successfully" });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fleet/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/vehicles/group"] });
      toast({ title: "Fleet Vehicle Removed", description: "Vehicle removed from fleet" });
    },
  });

  const deleteContractMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fleet/contracts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/contracts/group"] });
      toast({ title: "Contract Deleted", description: "Contract removed successfully" });
    },
  });

  const deletePricingMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fleet/pricing-tiers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/pricing-tiers"] });
      toast({ title: "Pricing Tier Deleted", description: "Tier removed successfully" });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fleet/maintenance-schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/maintenance-schedules/group"] });
      toast({ title: "Schedule Deleted", description: "Schedule removed successfully" });
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
      assignedMileage: vehicle.fleetVehicle.assignedMileage?.toString() || "",
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
      numberOfVehicles: contract.numberOfVehicles.toString(),
      discountPercentage: contract.discountPercentage?.toString() || "0",
      paymentTerms: contract.paymentTerms || "net_30",
      billingCycle: contract.billingCycle || "monthly",
      terms: contract.terms || "",
      notes: contract.notes || "",
    });
    setIsContractDialogOpen(true);
  };

  const handleEditPricing = (tier: FleetPricingTier) => {
    setEditingPricingId(tier.id);
    pricingForm.reset({
      fleetGroupId: tier.fleetGroupId || "",
      tierName: tier.tierName,
      description: tier.description || "",
      minVehicles: tier.minVehicles.toString(),
      maxVehicles: tier.maxVehicles?.toString() || "",
      discountPercentage: tier.discountPercentage.toString(),
      serviceTypes: tier.serviceTypes?.join(", ") || "",
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

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-salis-black min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-semibold text-salis-black dark:text-white">
            Fleet Management
          </h1>
          <p className="text-sm text-salis-gray mt-1">
            Manage corporate fleet clients, contracts, and maintenance schedules
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-salis-gray-light dark:bg-salis-gray-dark">
          <TabsTrigger value="groups" className="flex items-center gap-2" data-testid="tab-fleet-groups">
            <Building2 className="h-4 w-4" />
            Fleet Groups
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2" data-testid="tab-fleet-vehicles">
            <Car className="h-4 w-4" />
            Fleet Vehicles
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2" data-testid="tab-contracts">
            <FileText className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2" data-testid="tab-pricing">
            <DollarSign className="h-4 w-4" />
            Pricing Tiers
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2" data-testid="tab-schedules">
            <Calendar className="h-4 w-4" />
            Maintenance Schedules
          </TabsTrigger>
        </TabsList>

        {/* Fleet Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">
              Fleet Groups
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
              Add Fleet Group
            </Button>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-salis-gray-light dark:bg-salis-gray-dark">
                  <TableHead className="text-salis-black dark:text-white">Fleet Name</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Company</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Contact Person</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Contact Email</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Discount</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Status</TableHead>
                  <TableHead className="text-salis-black dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-salis-gray">
                      Loading fleet groups...
                    </TableCell>
                  </TableRow>
                ) : fleetGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-salis-gray">
                      No fleet groups found. Create one to get started.
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
                          {group.isActive ? "Active" : "Inactive"}
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
        </TabsContent>

        {/* Fleet Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">
              Fleet Vehicles
            </h2>
            <div className="flex gap-4">
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="w-64" data-testid="select-vehicle-fleet-group">
                  <SelectValue placeholder="Select Fleet Group" />
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
                Add Vehicle
              </Button>
            </div>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-salis-gray-light dark:bg-salis-gray-dark">
                  <TableHead className="text-salis-black dark:text-white">Vehicle</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Make/Model</TableHead>
                  <TableHead className="text-salis-black dark:text-white">License Plate</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Assigned Mileage</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Assigned Date</TableHead>
                  <TableHead className="text-salis-black dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedGroupId ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-salis-gray">
                      Select a fleet group to view vehicles
                    </TableCell>
                  </TableRow>
                ) : fleetVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-salis-gray">
                      No vehicles assigned to this fleet group
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
                        {vehicle.fleetVehicle.assignedMileage ? `${vehicle.fleetVehicle.assignedMileage} km` : "—"}
                      </TableCell>
                      <TableCell className="text-salis-gray">
                        {vehicle.fleetVehicle.assignedAt ? format(new Date(vehicle.fleetVehicle.assignedAt), "MMM dd, yyyy") : "—"}
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
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">
              Fleet Contracts
            </h2>
            <div className="flex gap-4">
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="w-64" data-testid="select-contract-fleet-group">
                  <SelectValue placeholder="Select Fleet Group" />
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
                  setEditingContractId(null);
                  contractForm.reset({ fleetGroupId: selectedGroupId });
                  setIsContractDialogOpen(true);
                }}
                className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                disabled={!selectedGroupId}
                data-testid="button-create-contract"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contract
              </Button>
            </div>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-salis-gray-light dark:bg-salis-gray-dark">
                  <TableHead className="text-salis-black dark:text-white">Contract #</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Type</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Start Date</TableHead>
                  <TableHead className="text-salis-black dark:text-white">End Date</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Vehicles</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Status</TableHead>
                  <TableHead className="text-salis-black dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedGroupId ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-salis-gray">
                      Select a fleet group to view contracts
                    </TableCell>
                  </TableRow>
                ) : contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-salis-gray">
                      No contracts found for this fleet group
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => (
                    <TableRow key={contract.id} className="border-b border-salis-gray-light dark:border-salis-gray-dark" data-testid={`row-contract-${contract.id}`}>
                      <TableCell className="font-medium text-salis-black dark:text-white">
                        {contract.contractNumber}
                      </TableCell>
                      <TableCell className="text-salis-gray">{contract.contractType}</TableCell>
                      <TableCell className="text-salis-gray">
                        {contract.startDate ? format(new Date(contract.startDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-salis-gray">
                        {contract.endDate ? format(new Date(contract.endDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-salis-gray">{contract.numberOfVehicles}</TableCell>
                      <TableCell>
                        <Badge className="bg-salis-black dark:bg-white text-white dark:text-salis-black">
                          {contract.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditContract(contract)}
                            data-testid={`button-edit-contract-${contract.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteContractMutation.mutate(contract.id)}
                            data-testid={`button-delete-contract-${contract.id}`}
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
        </TabsContent>

        {/* Pricing Tiers Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">
              Fleet Pricing Tiers
            </h2>
            <Button
              onClick={() => {
                setEditingPricingId(null);
                pricingForm.reset();
                setIsPricingDialogOpen(true);
              }}
              className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
              data-testid="button-create-pricing-tier"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Pricing Tier
            </Button>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-salis-gray-light dark:bg-salis-gray-dark">
                  <TableHead className="text-salis-black dark:text-white">Tier Name</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Description</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Min Vehicles</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Max Vehicles</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Discount</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Status</TableHead>
                  <TableHead className="text-salis-black dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingTiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-salis-gray">
                      No pricing tiers found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  pricingTiers.map((tier) => (
                    <TableRow key={tier.id} className="border-b border-salis-gray-light dark:border-salis-gray-dark" data-testid={`row-pricing-tier-${tier.id}`}>
                      <TableCell className="font-medium text-salis-black dark:text-white">
                        {tier.tierName}
                      </TableCell>
                      <TableCell className="text-salis-gray">{tier.description || "—"}</TableCell>
                      <TableCell className="text-salis-gray">{tier.minVehicles}</TableCell>
                      <TableCell className="text-salis-gray">{tier.maxVehicles || "No limit"}</TableCell>
                      <TableCell className="text-salis-gray">{tier.discountPercentage}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={tier.isActive ? "default" : "secondary"}
                          className={tier.isActive ? "bg-salis-black dark:bg-white text-white dark:text-salis-black" : ""}
                        >
                          {tier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPricing(tier)}
                            data-testid={`button-edit-pricing-tier-${tier.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePricingMutation.mutate(tier.id)}
                            data-testid={`button-delete-pricing-tier-${tier.id}`}
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
        </TabsContent>

        {/* Maintenance Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">
              Fleet Maintenance Schedules
            </h2>
            <div className="flex gap-4">
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="w-64" data-testid="select-schedule-fleet-group">
                  <SelectValue placeholder="Select Fleet Group" />
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
                  setEditingScheduleId(null);
                  scheduleForm.reset({ fleetGroupId: selectedGroupId });
                  setIsScheduleDialogOpen(true);
                }}
                className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                disabled={!selectedGroupId}
                data-testid="button-create-schedule"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Schedule
              </Button>
            </div>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-salis-gray-light dark:bg-salis-gray-dark">
                  <TableHead className="text-salis-black dark:text-white">Schedule Name</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Service Type</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Interval Type</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Interval</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Est. Cost</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Status</TableHead>
                  <TableHead className="text-salis-black dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedGroupId ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-salis-gray">
                      Select a fleet group to view maintenance schedules
                    </TableCell>
                  </TableRow>
                ) : schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-salis-gray">
                      No maintenance schedules found for this fleet group
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.id} className="border-b border-salis-gray-light dark:border-salis-gray-dark" data-testid={`row-schedule-${schedule.id}`}>
                      <TableCell className="font-medium text-salis-black dark:text-white">
                        {schedule.scheduleName}
                      </TableCell>
                      <TableCell className="text-salis-gray">{schedule.serviceType}</TableCell>
                      <TableCell className="text-salis-gray capitalize">{schedule.intervalType}</TableCell>
                      <TableCell className="text-salis-gray">
                        {schedule.intervalType === "mileage" && schedule.intervalMileage && `${schedule.intervalMileage} km`}
                        {schedule.intervalType === "time" && schedule.intervalMonths && `${schedule.intervalMonths} months`}
                        {schedule.intervalType === "both" &&
                          `${schedule.intervalMileage || 0} km / ${schedule.intervalMonths || 0} months`}
                      </TableCell>
                      <TableCell className="text-salis-gray">
                        ${schedule.estimatedCost || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={schedule.isActive ? "default" : "secondary"}
                          className={schedule.isActive ? "bg-salis-black dark:bg-white text-white dark:text-salis-black" : ""}
                        >
                          {schedule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSchedule(schedule)}
                            data-testid={`button-edit-schedule-${schedule.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                            data-testid={`button-delete-schedule-${schedule.id}`}
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
        </TabsContent>
      </Tabs>

      {/* Fleet Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingGroupId ? "Edit Fleet Group" : "Create Fleet Group"}
            </DialogTitle>
            <DialogDescription className="text-salis-gray">
              {editingGroupId
                ? "Update fleet group details"
                : "Add a new corporate fleet client"}
            </DialogDescription>
          </DialogHeader>
          <Form {...groupForm}>
            <form
              onSubmit={groupForm.handleSubmit((data) => groupMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={groupForm.control}
                  name="fleetName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Fleet Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ABC Company Fleet" data-testid="input-fleet-name" />
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
                      <FormLabel className="text-salis-black dark:text-white">Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ABC Company" data-testid="input-company-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Smith" data-testid="input-contact-person" />
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
                      <FormLabel className="text-salis-black dark:text-white">Contact Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="john@company.com" data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1234567890" data-testid="input-contact-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Tax ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123-45-6789" data-testid="input-tax-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Discount %</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="10" data-testid="input-discount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Payment Terms</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-payment-terms">
                            <SelectValue placeholder="Select terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="net_30">Net 30</SelectItem>
                            <SelectItem value="net_60">Net 60</SelectItem>
                            <SelectItem value="prepaid">Prepaid</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={groupForm.control}
                name="billingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Billing Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="123 Main St..." data-testid="input-billing-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={groupForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes..." data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGroupDialogOpen(false)}
                  data-testid="button-cancel-group"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={groupMutation.isPending}
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  data-testid="button-submit-fleet-group"
                >
                  {groupMutation.isPending
                    ? "Saving..."
                    : editingGroupId
                    ? "Update"
                    : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Fleet Vehicle Dialog */}
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingVehicleId ? "Edit Fleet Vehicle" : "Add Fleet Vehicle"}
            </DialogTitle>
            <DialogDescription className="text-salis-gray">
              Assign a vehicle to this fleet group
            </DialogDescription>
          </DialogHeader>
          <Form {...vehicleForm}>
            <form
              onSubmit={vehicleForm.handleSubmit((data) => vehicleMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={vehicleForm.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Vehicle *</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger data-testid="select-vehicle">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {allVehicles.map((vehicle: any) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vehicleForm.control}
                name="assignedMileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Assigned Mileage (km)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="50000" data-testid="input-assigned-mileage" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vehicleForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Assignment notes..." data-testid="input-vehicle-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVehicleDialogOpen(false)}
                  data-testid="button-cancel-vehicle"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={vehicleMutation.isPending}
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  data-testid="button-submit-fleet-vehicle"
                >
                  {vehicleMutation.isPending ? "Saving..." : editingVehicleId ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Contract Dialog */}
      <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingContractId ? "Edit Contract" : "Create Contract"}
            </DialogTitle>
          </DialogHeader>
          <Form {...contractForm}>
            <form
              onSubmit={contractForm.handleSubmit((data) => contractMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={contractForm.control}
                  name="contractNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Contract Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="CNT-2024-001" data-testid="input-contract-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Contract Type *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-contract-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Start Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">End Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="numberOfVehicles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Number of Vehicles *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="10" data-testid="input-num-vehicles" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Discount %</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="15" data-testid="input-contract-discount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsContractDialogOpen(false)}
                  data-testid="button-cancel-contract"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={contractMutation.isPending}
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  data-testid="button-submit-contract"
                >
                  {contractMutation.isPending ? "Saving..." : editingContractId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Pricing Tier Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingPricingId ? "Edit Pricing Tier" : "Create Pricing Tier"}
            </DialogTitle>
          </DialogHeader>
          <Form {...pricingForm}>
            <form
              onSubmit={pricingForm.handleSubmit((data) => pricingMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={pricingForm.control}
                  name="tierName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Tier Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Bronze Tier" data-testid="input-tier-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={pricingForm.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Discount % *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="10" data-testid="input-tier-discount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={pricingForm.control}
                  name="minVehicles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Min Vehicles *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="5" data-testid="input-min-vehicles" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={pricingForm.control}
                  name="maxVehicles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Max Vehicles</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="20" data-testid="input-max-vehicles" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={pricingForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Tier description..." data-testid="input-tier-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPricingDialogOpen(false)}
                  data-testid="button-cancel-pricing"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={pricingMutation.isPending}
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  data-testid="button-submit-pricing-tier"
                >
                  {pricingMutation.isPending ? "Saving..." : editingPricingId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Maintenance Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingScheduleId ? "Edit Maintenance Schedule" : "Create Maintenance Schedule"}
            </DialogTitle>
          </DialogHeader>
          <Form {...scheduleForm}>
            <form
              onSubmit={scheduleForm.handleSubmit((data) => scheduleMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={scheduleForm.control}
                  name="scheduleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Schedule Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Oil Change Schedule" data-testid="input-schedule-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Service Type *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Oil Change" data-testid="input-service-type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="intervalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Interval Type *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-interval-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mileage">Mileage</SelectItem>
                            <SelectItem value="time">Time</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="intervalMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Interval Mileage (km)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="5000" data-testid="input-interval-mileage" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="intervalMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Interval Months</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="6" data-testid="input-interval-months" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="estimatedCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Estimated Cost</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="150.00" data-testid="input-estimated-cost" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={scheduleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Schedule description..." data-testid="input-schedule-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsScheduleDialogOpen(false)}
                  data-testid="button-cancel-schedule"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={scheduleMutation.isPending}
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  data-testid="button-submit-schedule"
                >
                  {scheduleMutation.isPending ? "Saving..." : editingScheduleId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
