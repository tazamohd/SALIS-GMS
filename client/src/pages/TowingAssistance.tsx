import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { TabsPageLayout } from "@/components/layouts";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Pencil,
  Trash2,
  Truck,
  Radio,
} from "lucide-react";
import { format } from "date-fns";
import {
  insertTowingRequestSchema,
  insertTowTruckSchema,
  type TowingRequest,
  type TowTruck,
  type Vehicle,
  type User,
} from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

const towingRequestFormSchema = insertTowingRequestSchema.extend({
  pickupLatitude: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  pickupLongitude: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  dropoffLatitude: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  dropoffLongitude: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  serviceCost: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  distance: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  estimatedArrival: z.string().optional(),
  actualArrival: z.string().optional(),
});

const towTruckFormSchema = insertTowTruckSchema.extend({
  lastKnownLatitude: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  lastKnownLongitude: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
});

type TowingRequestFormData = z.input<typeof towingRequestFormSchema>;
type TowTruckFormData = z.input<typeof towTruckFormSchema>;

export default function TowingAssistance() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("requests");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isTruckDialogOpen, setIsTruckDialogOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editingTruckId, setEditingTruckId] = useState<string | null>(null);

  const { data: towingRequests = [], isLoading: requestsLoading } = useQuery<TowingRequest[]>({
    queryKey: ["/api/towing-requests"],
  });

  const { data: towTrucks = [], isLoading: trucksLoading } = useQuery<TowTruck[]>({
    queryKey: ["/api/tow-trucks"],
  });

  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ["/api/customers"],
    enabled: isRequestDialogOpen,
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    enabled: isRequestDialogOpen,
  });

  const { data: drivers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isRequestDialogOpen || isTruckDialogOpen,
  });

  const requestForm = useForm<TowingRequestFormData>({
    resolver: zodResolver(towingRequestFormSchema),
    defaultValues: {
      garageId: (user as any)?.garageId || "",
      requestNumber: "",
      customerId: "",
      vehicleId: "",
      serviceType: "towing",
      pickupLocation: "",
      pickupLatitude: "",
      pickupLongitude: "",
      dropoffLocation: "",
      dropoffLatitude: "",
      dropoffLongitude: "",
      urgency: "normal",
      status: "requested",
      assignedDriverId: "",
      estimatedArrival: "",
      actualArrival: "",
      serviceCost: "",
      distance: "",
      notes: "",
      customerNotes: "",
    },
  });

  const truckForm = useForm<TowTruckFormData>({
    resolver: zodResolver(towTruckFormSchema),
    defaultValues: {
      garageId: (user as any)?.garageId || "",
      truckName: "",
      truckNumber: "",
      licensePlate: "",
      capacity: "light_duty",
      currentDriverId: "",
      status: "available",
      currentLocation: "",
      gpsEnabled: false,
      lastKnownLatitude: "",
      lastKnownLongitude: "",
      isActive: true,
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: TowingRequestFormData) => {
      const parsed = towingRequestFormSchema.parse(data);
      if (editingRequestId) {
        return await apiRequest("PATCH", `/api/towing-requests/${editingRequestId}`, parsed);
      }
      return await apiRequest("POST", "/api/towing-requests", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/towing-requests"] });
      setIsRequestDialogOpen(false);
      setEditingRequestId(null);
      requestForm.reset();
      toast({
        title: editingRequestId ? t('towingAssistance.requestUpdated', 'Request Updated') : t('towingAssistance.requestCreated', 'Request Created'),
        description: t('towingAssistance.towingRequestSaved', 'Towing request saved successfully'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('towingAssistance.failedToSaveRequest', 'Failed to save towing request'),
        variant: "destructive",
      });
    },
  });

  const truckMutation = useMutation({
    mutationFn: async (data: TowTruckFormData) => {
      const parsed = towTruckFormSchema.parse(data);
      if (editingTruckId) {
        return await apiRequest("PATCH", `/api/tow-trucks/${editingTruckId}`, parsed);
      }
      return await apiRequest("POST", "/api/tow-trucks", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tow-trucks"] });
      setIsTruckDialogOpen(false);
      setEditingTruckId(null);
      truckForm.reset();
      toast({
        title: editingTruckId ? t('towingAssistance.truckUpdated', 'Truck Updated') : t('towingAssistance.truckCreated', 'Truck Created'),
        description: t('towingAssistance.towTruckSaved', 'Tow truck saved successfully'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('towingAssistance.failedToSaveTruck', 'Failed to save tow truck'),
        variant: "destructive",
      });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/towing-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/towing-requests"] });
      toast({ title: t('towingAssistance.requestDeleted', 'Request Deleted'), description: t('towingAssistance.towingRequestRemoved', 'Towing request removed successfully') });
    },
  });

  const deleteTruckMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tow-trucks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tow-trucks"] });
      toast({ title: t('towingAssistance.truckDeleted', 'Truck Deleted'), description: t('towingAssistance.towTruckRemoved', 'Tow truck removed successfully') });
    },
  });

  const handleEditRequest = (request: TowingRequest) => {
    setEditingRequestId(request.id);
    requestForm.reset({
      garageId: request.garageId,
      requestNumber: request.requestNumber || "",
      customerId: request.customerId,
      vehicleId: request.vehicleId || "",
      serviceType: request.serviceType,
      pickupLocation: request.pickupLocation,
      pickupLatitude: request.pickupLatitude?.toString() || "",
      pickupLongitude: request.pickupLongitude?.toString() || "",
      dropoffLocation: request.dropoffLocation || "",
      dropoffLatitude: request.dropoffLatitude?.toString() || "",
      dropoffLongitude: request.dropoffLongitude?.toString() || "",
      urgency: request.urgency || "normal",
      status: request.status || "requested",
      assignedDriverId: request.assignedDriverId || "",
      estimatedArrival: request.estimatedArrival ? format(new Date(request.estimatedArrival), "yyyy-MM-dd'T'HH:mm") : "",
      actualArrival: request.actualArrival ? format(new Date(request.actualArrival), "yyyy-MM-dd'T'HH:mm") : "",
      serviceCost: request.serviceCost?.toString() || "",
      distance: request.distance?.toString() || "",
      notes: request.notes || "",
      customerNotes: request.customerNotes || "",
    });
    setIsRequestDialogOpen(true);
  };

  const handleEditTruck = (truck: TowTruck) => {
    setEditingTruckId(truck.id);
    truckForm.reset({
      garageId: truck.garageId,
      truckName: truck.truckName,
      truckNumber: truck.truckNumber || "",
      licensePlate: truck.licensePlate || "",
      capacity: truck.capacity || "light_duty",
      currentDriverId: truck.currentDriverId || "",
      status: truck.status || "available",
      currentLocation: truck.currentLocation || "",
      gpsEnabled: truck.gpsEnabled || false,
      lastKnownLatitude: truck.lastKnownLatitude?.toString() || "",
      lastKnownLongitude: truck.lastKnownLongitude?.toString() || "",
      isActive: truck.isActive ?? true,
    });
    setIsTruckDialogOpen(true);
  };

  const getRequestStatusBadge = (status: string, requestId: string) => {
    const statusColors: Record<string, string> = {
      requested: "bg-salis-gray-light text-salis-black dark:bg-salis-gray-dark dark:text-white",
      assigned: "bg-salis-50-black text-white",
      en_route: "bg-salis-gray text-white",
      arrived: "bg-salis-black text-white dark:bg-white dark:text-salis-black",
      in_progress: "bg-salis-50-black text-white",
      completed: "bg-salis-black text-white dark:bg-white dark:text-salis-black",
      cancelled: "bg-salis-gray text-white",
    };
    
    return (
      <Badge className={statusColors[status] || "bg-salis-gray text-white"} data-testid={`badge-request-status-${requestId}`}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string, requestId: string) => {
    const urgencyColors: Record<string, string> = {
      normal: "bg-salis-gray-light text-salis-black dark:bg-salis-gray-dark dark:text-white",
      urgent: "bg-salis-50-black text-white",
      emergency: "bg-salis-black text-white dark:bg-white dark:text-salis-black",
    };
    
    return (
      <Badge className={urgencyColors[urgency] || "bg-salis-gray text-white"} data-testid={`badge-urgency-${requestId}`}>
        {urgency.toUpperCase()}
      </Badge>
    );
  };

  const getTruckStatusBadge = (status: string, truckId: string) => {
    const statusColors: Record<string, string> = {
      available: "bg-salis-black text-white dark:bg-white dark:text-salis-black",
      on_job: "bg-salis-50-black text-white",
      maintenance: "bg-salis-gray text-white",
      offline: "bg-salis-gray-light text-salis-black dark:bg-salis-gray-dark dark:text-white",
    };
    
    return (
      <Badge className={statusColors[status] || "bg-salis-gray text-white"} data-testid={`badge-truck-status-${truckId}`}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const requestsTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salis-black dark:text-white">{t('towingAssistance.towingRequests', 'Towing Requests')}</h2>
        <Button
          onClick={() => {
            setEditingRequestId(null);
            requestForm.reset();
            setIsRequestDialogOpen(true);
          }}
          className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
          data-testid="button-create-request"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('towingAssistance.createRequest', 'Create Request')}
        </Button>
      </div>

      <div className="border border-salis-gray-light dark:border-salis-gray rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-salis-gray-light dark:bg-salis-gray-dark">
            <TableRow>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.requestNumber', 'Request #')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('customers.customer', 'Customer')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('vehicles.vehicle', 'Vehicle')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.serviceType', 'Service Type')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('towing.pickupLocation', 'Pickup Location')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.urgency', 'Urgency')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.requestedAt', 'Requested At')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('common.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requestsLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-salis-gray dark:text-salis-gray-light">
                  {t('common.loading', 'Loading')}...
                </TableCell>
              </TableRow>
            ) : towingRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-salis-gray dark:text-salis-gray-light">
                  {t('towingAssistance.noTowingRequestsFound', 'No towing requests found')}
                </TableCell>
              </TableRow>
            ) : (
              towingRequests.map((request) => (
                <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                  <TableCell className="text-salis-black dark:text-white">{request.requestNumber || t('common.na', 'N/A')}</TableCell>
                  <TableCell className="text-salis-black dark:text-white">
                    {customers.find(c => c.id === request.customerId)?.fullName || t('common.unknown', 'Unknown')}
                  </TableCell>
                  <TableCell className="text-salis-black dark:text-white">
                    {vehicles.find(v => v.id === request.vehicleId)?.make || t('common.na', 'N/A')} {vehicles.find(v => v.id === request.vehicleId)?.model || ""}
                  </TableCell>
                  <TableCell className="text-salis-black dark:text-white capitalize">{request.serviceType.replace("_", " ")}</TableCell>
                  <TableCell className="text-salis-black dark:text-white max-w-xs truncate">{request.pickupLocation}</TableCell>
                  <TableCell>{getRequestStatusBadge(request.status || "requested", request.id)}</TableCell>
                  <TableCell>{getUrgencyBadge(request.urgency || "normal", request.id)}</TableCell>
                  <TableCell className="text-salis-black dark:text-white">
                    {request.requestedAt ? format(new Date(request.requestedAt), "MMM dd, yyyy HH:mm") : t('common.na', 'N/A')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRequest(request)}
                        data-testid={`button-edit-request-${request.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRequestMutation.mutate(request.id)}
                        data-testid={`button-delete-request-${request.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-salis-gray" />
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

  const trucksTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salis-black dark:text-white">{t('towingAssistance.towTrucks', 'Tow Trucks')}</h2>
        <Button
          onClick={() => {
            setEditingTruckId(null);
            truckForm.reset();
            setIsTruckDialogOpen(true);
          }}
          className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
          data-testid="button-create-truck"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('towingAssistance.addTruck', 'Add Truck')}
        </Button>
      </div>

      <div className="border border-salis-gray-light dark:border-salis-gray rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-salis-gray-light dark:bg-salis-gray-dark">
            <TableRow>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.truckName', 'Truck Name')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.truckNumber', 'Truck #')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.licensePlate', 'License Plate')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.capacity', 'Capacity')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.currentDriver', 'Current Driver')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.gpsEnabled', 'GPS Enabled')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('towingAssistance.lastUpdated', 'Last Updated')}</TableHead>
              <TableHead className="text-salis-black dark:text-white">{t('common.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trucksLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-salis-gray dark:text-salis-gray-light">
                  {t('common.loading', 'Loading')}...
                </TableCell>
              </TableRow>
            ) : towTrucks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-salis-gray dark:text-salis-gray-light">
                  {t('towingAssistance.noTowTrucksFound', 'No tow trucks found')}
                </TableCell>
              </TableRow>
            ) : (
              towTrucks.map((truck) => (
                <TableRow key={truck.id} data-testid={`row-truck-${truck.id}`}>
                  <TableCell className="text-salis-black dark:text-white">{truck.truckName}</TableCell>
                  <TableCell className="text-salis-black dark:text-white">{truck.truckNumber || t('common.na', 'N/A')}</TableCell>
                  <TableCell className="text-salis-black dark:text-white">{truck.licensePlate || t('common.na', 'N/A')}</TableCell>
                  <TableCell className="text-salis-black dark:text-white capitalize">{truck.capacity?.replace("_", " ") || t('common.na', 'N/A')}</TableCell>
                  <TableCell className="text-salis-black dark:text-white">
                    {drivers.find(d => d.id === truck.currentDriverId)?.fullName || t('towingAssistance.unassigned', 'Unassigned')}
                  </TableCell>
                  <TableCell>{getTruckStatusBadge(truck.status || "available", truck.id)}</TableCell>
                  <TableCell className="text-salis-black dark:text-white">{truck.gpsEnabled ? t('common.yes', 'Yes') : t('common.no', 'No')}</TableCell>
                  <TableCell className="text-salis-black dark:text-white">
                    {truck.updatedAt ? format(new Date(truck.updatedAt), "MMM dd, yyyy HH:mm") : t('common.na', 'N/A')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTruck(truck)}
                        data-testid={`button-edit-truck-${truck.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTruckMutation.mutate(truck.id)}
                        data-testid={`button-delete-truck-${truck.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-salis-gray" />
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
        title={t('towingAssistance.title', 'Towing & Roadside Assistance')}
        description={t('towingAssistance.description', 'Manage towing requests, roadside assistance, and tow truck fleet')}
        icon={Truck}
        tabs={[
          {
            id: "requests",
            label: t('towingAssistance.towingRequests', 'Towing Requests'),
            icon: Truck,
            content: requestsTab,
          },
          {
            id: "trucks",
            label: t('towingAssistance.towTrucks', 'Tow Trucks'),
            icon: Radio,
            content: trucksTab,
          },
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingRequestId ? t('towingAssistance.editTowingRequest', 'Edit Towing Request') : t('towingAssistance.createTowingRequest', 'Create Towing Request')}
            </DialogTitle>
            <DialogDescription className="text-salis-gray dark:text-salis-gray-light">
              {editingRequestId ? t('towingAssistance.updateTowingRequestDetails', 'Update towing request details') : t('towingAssistance.createNewTowingRequest', 'Create a new towing or roadside assistance request')}
            </DialogDescription>
          </DialogHeader>
          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit((data) => requestMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={requestForm.control}
                  name="requestNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.requestNumber', 'Request Number')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder={t('towingAssistance.autoGenerated', 'Auto-generated')}
                          readOnly={!editingRequestId}
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-request-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('customers.customer', 'Customer')} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-customer">
                            <SelectValue placeholder={t('towingAssistance.selectCustomer', 'Select customer')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('vehicles.vehicle', 'Vehicle')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-vehicle">
                            <SelectValue placeholder={t('towingAssistance.selectVehicle', 'Select vehicle')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
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
                  control={requestForm.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.serviceType', 'Service Type')} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-service-type">
                            <SelectValue placeholder={t('towingAssistance.selectServiceType', 'Select service type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="towing">{t('towingAssistance.towing', 'Towing')}</SelectItem>
                          <SelectItem value="roadside_assistance">{t('towingAssistance.roadsideAssistance', 'Roadside Assistance')}</SelectItem>
                          <SelectItem value="jump_start">{t('towingAssistance.jumpStart', 'Jump Start')}</SelectItem>
                          <SelectItem value="tire_change">{t('towingAssistance.tireChange', 'Tire Change')}</SelectItem>
                          <SelectItem value="fuel_delivery">{t('towingAssistance.fuelDelivery', 'Fuel Delivery')}</SelectItem>
                          <SelectItem value="lockout">{t('towingAssistance.lockout', 'Lockout')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.urgency', 'Urgency')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-urgency">
                            <SelectValue placeholder={t('towingAssistance.selectUrgency', 'Select urgency')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">{t('towingAssistance.normal', 'Normal')}</SelectItem>
                          <SelectItem value="urgent">{t('towingAssistance.urgent', 'Urgent')}</SelectItem>
                          <SelectItem value="emergency">{t('priority.emergency', 'Emergency')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('common.status', 'Status')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-request-status">
                            <SelectValue placeholder={t('towingAssistance.selectStatus', 'Select status')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="requested">{t('status.requested', 'Requested')}</SelectItem>
                          <SelectItem value="assigned">{t('status.assigned', 'Assigned')}</SelectItem>
                          <SelectItem value="en_route">{t('towingAssistance.enRoute', 'En Route')}</SelectItem>
                          <SelectItem value="arrived">{t('towingAssistance.arrived', 'Arrived')}</SelectItem>
                          <SelectItem value="in_progress">{t('common.inProgress', 'In Progress')}</SelectItem>
                          <SelectItem value="completed">{t('common.completed', 'Completed')}</SelectItem>
                          <SelectItem value="cancelled">{t('status.cancelled', 'Cancelled')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="assignedDriverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.assignedDriver', 'Assigned Driver')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-assigned-driver">
                            <SelectValue placeholder={t('towingAssistance.selectDriver', 'Select driver')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={requestForm.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">{t('towing.pickupLocation', 'Pickup Location')} *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('towingAssistance.enterPickupLocation', 'Enter pickup location')}
                        className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                        data-testid="input-pickup-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={requestForm.control}
                  name="pickupLatitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.pickupLatitude', 'Pickup Latitude')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder={t('towingAssistance.latitudePlaceholder', 'e.g., 40.7128')}
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-pickup-latitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="pickupLongitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.pickupLongitude', 'Pickup Longitude')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder={t('towingAssistance.longitudePlaceholder', 'e.g., -74.0060')}
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-pickup-longitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={requestForm.control}
                name="dropoffLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">{t('towing.dropoffLocation', 'Dropoff Location')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t('towingAssistance.enterDropoffLocation', 'Enter dropoff location')}
                        className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                        data-testid="input-dropoff-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={requestForm.control}
                  name="dropoffLatitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.dropoffLatitude', 'Dropoff Latitude')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder={t('towingAssistance.latitudePlaceholder', 'e.g., 40.7128')}
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-dropoff-latitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="dropoffLongitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.dropoffLongitude', 'Dropoff Longitude')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder={t('towingAssistance.longitudePlaceholder', 'e.g., -74.0060')}
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-dropoff-longitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={requestForm.control}
                  name="serviceCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.serviceCost', 'Service Cost')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-service-cost"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.distanceKm', 'Distance (km)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-distance"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={requestForm.control}
                  name="estimatedArrival"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.estimatedArrival', 'Estimated Arrival')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="datetime-local"
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-estimated-arrival"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="actualArrival"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.actualArrival', 'Actual Arrival')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="datetime-local"
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-actual-arrival"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={requestForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.internalNotes', 'Internal Notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t('towingAssistance.internalNotesPlaceholder', 'Notes for internal use')}
                        className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={requestForm.control}
                name="customerNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.customerNotes', 'Customer Notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t('towingAssistance.customerNotesPlaceholder', 'Notes from customer')}
                        className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                        data-testid="input-customer-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRequestDialogOpen(false)}
                  className="border-salis-gray-light dark:border-salis-gray"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  disabled={requestMutation.isPending}
                  data-testid="button-save-request"
                >
                  {requestMutation.isPending ? t('common.saving', 'Saving...') : t('towingAssistance.saveRequest', 'Save Request')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTruckDialogOpen} onOpenChange={setIsTruckDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingTruckId ? t('towingAssistance.editTowTruck', 'Edit Tow Truck') : t('towingAssistance.addTowTruck', 'Add Tow Truck')}
            </DialogTitle>
            <DialogDescription className="text-salis-gray dark:text-salis-gray-light">
              {editingTruckId ? t('towingAssistance.updateTowTruckDetails', 'Update tow truck details') : t('towingAssistance.addNewTowTruck', 'Add a new tow truck to the fleet')}
            </DialogDescription>
          </DialogHeader>
          <Form {...truckForm}>
            <form onSubmit={truckForm.handleSubmit((data) => truckMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={truckForm.control}
                  name="truckName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.truckName', 'Truck Name')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('towingAssistance.truckNamePlaceholder', 'e.g., Tow Truck Alpha')}
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-truck-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={truckForm.control}
                  name="truckNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.truckNumber', 'Truck Number')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder={t('towingAssistance.truckNumberPlaceholder', 'e.g., TOW-001')}
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-truck-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={truckForm.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.licensePlate', 'License Plate')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder={t('towingAssistance.licensePlatePlaceholder', 'e.g., ABC-1234')}
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-license-plate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={truckForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.capacity', 'Capacity')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-capacity">
                            <SelectValue placeholder={t('towingAssistance.selectCapacity', 'Select capacity')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light_duty">{t('towingAssistance.lightDuty', 'Light Duty')}</SelectItem>
                          <SelectItem value="medium_duty">{t('towingAssistance.mediumDuty', 'Medium Duty')}</SelectItem>
                          <SelectItem value="heavy_duty">{t('towingAssistance.heavyDuty', 'Heavy Duty')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={truckForm.control}
                  name="currentDriverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.currentDriver', 'Current Driver')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-current-driver">
                            <SelectValue placeholder={t('towingAssistance.selectDriver', 'Select driver')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={truckForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('common.status', 'Status')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-truck-status">
                            <SelectValue placeholder={t('towingAssistance.selectStatus', 'Select status')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">{t('towingAssistance.available', 'Available')}</SelectItem>
                          <SelectItem value="on_job">{t('towingAssistance.onJob', 'On Job')}</SelectItem>
                          <SelectItem value="maintenance">{t('towingAssistance.maintenance', 'Maintenance')}</SelectItem>
                          <SelectItem value="offline">{t('towingAssistance.offline', 'Offline')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={truckForm.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.currentLocation', 'Current Location')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t('towingAssistance.enterCurrentLocation', 'Enter current location')}
                        className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                        data-testid="input-current-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={truckForm.control}
                  name="lastKnownLatitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.lastKnownLatitude', 'Last Known Latitude')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder={t('towingAssistance.latitudePlaceholder', 'e.g., 40.7128')}
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-last-latitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={truckForm.control}
                  name="lastKnownLongitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">{t('towingAssistance.lastKnownLongitude', 'Last Known Longitude')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder={t('towingAssistance.longitudePlaceholder', 'e.g., -74.0060')}
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-last-longitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={truckForm.control}
                name="gpsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-gps-enabled"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-salis-black dark:text-white">
                        {t('towingAssistance.gpsEnabled', 'GPS Enabled')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={truckForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-is-active"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-salis-black dark:text-white">
                        {t('towingAssistance.activeTruck', 'Active Truck')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTruckDialogOpen(false)}
                  className="border-salis-gray-light dark:border-salis-gray"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  disabled={truckMutation.isPending}
                  data-testid="button-save-truck"
                >
                  {truckMutation.isPending ? t('common.saving', 'Saving...') : t('towingAssistance.saveTruck', 'Save Truck')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
