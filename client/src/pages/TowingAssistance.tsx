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

// Extend insert schemas for form handling
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
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("requests");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isTruckDialogOpen, setIsTruckDialogOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editingTruckId, setEditingTruckId] = useState<string | null>(null);

  // Fetch towing requests
  const { data: towingRequests = [], isLoading: requestsLoading } = useQuery<TowingRequest[]>({
    queryKey: ["/api/towing-requests"],
  });

  // Fetch tow trucks
  const { data: towTrucks = [], isLoading: trucksLoading } = useQuery<TowTruck[]>({
    queryKey: ["/api/tow-trucks"],
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ["/api/customers"],
    enabled: isRequestDialogOpen,
  });

  // Fetch vehicles for dropdown
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    enabled: isRequestDialogOpen,
  });

  // Fetch users/drivers for dropdown
  const { data: drivers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isRequestDialogOpen || isTruckDialogOpen,
  });

  // Towing Request Form
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

  // Tow Truck Form
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

  // Create/Update Towing Request Mutation
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
        title: editingRequestId ? "Request Updated" : "Request Created",
        description: "Towing request saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save towing request",
        variant: "destructive",
      });
    },
  });

  // Create/Update Tow Truck Mutation
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
        title: editingTruckId ? "Truck Updated" : "Truck Created",
        description: "Tow truck saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save tow truck",
        variant: "destructive",
      });
    },
  });

  // Delete Mutations
  const deleteRequestMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/towing-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/towing-requests"] });
      toast({ title: "Request Deleted", description: "Towing request removed successfully" });
    },
  });

  const deleteTruckMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tow-trucks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tow-trucks"] });
      toast({ title: "Truck Deleted", description: "Tow truck removed successfully" });
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
      requested: "bg-yellow-600 dark:bg-yellow-500",
      assigned: "bg-blue-600 dark:bg-blue-500",
      en_route: "bg-cyan-600 dark:bg-cyan-500",
      arrived: "bg-green-600 dark:bg-green-500",
      in_progress: "bg-purple-600 dark:bg-purple-500",
      completed: "bg-green-600 dark:bg-green-500",
      cancelled: "bg-red-600 dark:bg-red-500",
    };
    
    return (
      <Badge className={`${statusColors[status] || "bg-salis-gray"} text-white`} data-testid={`badge-request-status-${requestId}`}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string, requestId: string) => {
    const urgencyColors: Record<string, string> = {
      normal: "bg-gray-500 dark:bg-gray-400",
      urgent: "bg-orange-600 dark:bg-orange-500",
      emergency: "bg-red-600 dark:bg-red-500",
    };
    
    return (
      <Badge className={`${urgencyColors[urgency] || "bg-salis-gray"} text-white`} data-testid={`badge-urgency-${requestId}`}>
        {urgency.toUpperCase()}
      </Badge>
    );
  };

  const getTruckStatusBadge = (status: string, truckId: string) => {
    const statusColors: Record<string, string> = {
      available: "bg-green-600 dark:bg-green-500",
      on_job: "bg-blue-600 dark:bg-blue-500",
      maintenance: "bg-yellow-600 dark:bg-yellow-500",
      offline: "bg-gray-500 dark:bg-gray-400",
    };
    
    return (
      <Badge className={`${statusColors[status] || "bg-salis-gray"} text-white`} data-testid={`badge-truck-status-${truckId}`}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-salis-black min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-semibold text-salis-black dark:text-white">
            Towing & Roadside Assistance
          </h1>
          <p className="text-sm text-salis-gray dark:text-salis-gray-light mt-1">
            Manage towing requests, roadside assistance, and tow truck fleet
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="bg-salis-gray-light dark:bg-salis-gray-dark">
          <TabsTrigger value="requests" data-testid="tab-requests" className="data-[state=active]:bg-white dark:data-[state=active]:bg-salis-black">
            <Truck className="w-4 h-4 mr-2" />
            Towing Requests
          </TabsTrigger>
          <TabsTrigger value="trucks" data-testid="tab-trucks" className="data-[state=active]:bg-white dark:data-[state=active]:bg-salis-black">
            <Radio className="w-4 h-4 mr-2" />
            Tow Trucks
          </TabsTrigger>
        </TabsList>

        {/* Towing Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">Towing Requests</h2>
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
              Create Request
            </Button>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-salis-gray-light dark:bg-salis-gray-dark">
                <TableRow>
                  <TableHead className="text-salis-black dark:text-white">Request #</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Customer</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Vehicle</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Service Type</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Pickup Location</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Status</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Urgency</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Requested At</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestsLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-salis-gray dark:text-salis-gray-light">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : towingRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-salis-gray dark:text-salis-gray-light">
                      No towing requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  towingRequests.map((request) => (
                    <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                      <TableCell className="text-salis-black dark:text-white">{request.requestNumber || "N/A"}</TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {customers.find(c => c.id === request.customerId)?.fullName || "Unknown"}
                      </TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {vehicles.find(v => v.id === request.vehicleId)?.make || "N/A"} {vehicles.find(v => v.id === request.vehicleId)?.model || ""}
                      </TableCell>
                      <TableCell className="text-salis-black dark:text-white capitalize">{request.serviceType.replace("_", " ")}</TableCell>
                      <TableCell className="text-salis-black dark:text-white max-w-xs truncate">{request.pickupLocation}</TableCell>
                      <TableCell>{getRequestStatusBadge(request.status || "requested", request.id)}</TableCell>
                      <TableCell>{getUrgencyBadge(request.urgency || "normal", request.id)}</TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {request.requestedAt ? format(new Date(request.requestedAt), "MMM dd, yyyy HH:mm") : "N/A"}
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
                            <Trash2 className="w-4 h-4 text-red-600" />
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

        {/* Tow Trucks Tab */}
        <TabsContent value="trucks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">Tow Trucks</h2>
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
              Add Truck
            </Button>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-salis-gray-light dark:bg-salis-gray-dark">
                <TableRow>
                  <TableHead className="text-salis-black dark:text-white">Truck Name</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Truck #</TableHead>
                  <TableHead className="text-salis-black dark:text-white">License Plate</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Capacity</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Current Driver</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Status</TableHead>
                  <TableHead className="text-salis-black dark:text-white">GPS Enabled</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Last Updated</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trucksLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-salis-gray dark:text-salis-gray-light">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : towTrucks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-salis-gray dark:text-salis-gray-light">
                      No tow trucks found
                    </TableCell>
                  </TableRow>
                ) : (
                  towTrucks.map((truck) => (
                    <TableRow key={truck.id} data-testid={`row-truck-${truck.id}`}>
                      <TableCell className="text-salis-black dark:text-white">{truck.truckName}</TableCell>
                      <TableCell className="text-salis-black dark:text-white">{truck.truckNumber || "N/A"}</TableCell>
                      <TableCell className="text-salis-black dark:text-white">{truck.licensePlate || "N/A"}</TableCell>
                      <TableCell className="text-salis-black dark:text-white capitalize">{truck.capacity?.replace("_", " ") || "N/A"}</TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {drivers.find(d => d.id === truck.currentDriverId)?.fullName || "Unassigned"}
                      </TableCell>
                      <TableCell>{getTruckStatusBadge(truck.status || "available", truck.id)}</TableCell>
                      <TableCell className="text-salis-black dark:text-white">{truck.gpsEnabled ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {truck.updatedAt ? format(new Date(truck.updatedAt), "MMM dd, yyyy HH:mm") : "N/A"}
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
                            <Trash2 className="w-4 h-4 text-red-600" />
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

      {/* Create/Edit Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingRequestId ? "Edit Towing Request" : "Create Towing Request"}
            </DialogTitle>
            <DialogDescription className="text-salis-gray dark:text-salis-gray-light">
              {editingRequestId ? "Update towing request details" : "Create a new towing or roadside assistance request"}
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
                      <FormLabel className="text-salis-black dark:text-white">Request Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder="Auto-generated"
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
                      <FormLabel className="text-salis-black dark:text-white">Customer *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-customer">
                            <SelectValue placeholder="Select customer" />
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
                      <FormLabel className="text-salis-black dark:text-white">Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-vehicle">
                            <SelectValue placeholder="Select vehicle" />
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
                      <FormLabel className="text-salis-black dark:text-white">Service Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-service-type">
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="towing">Towing</SelectItem>
                          <SelectItem value="jumpstart">Jumpstart</SelectItem>
                          <SelectItem value="tire_change">Tire Change</SelectItem>
                          <SelectItem value="fuel_delivery">Fuel Delivery</SelectItem>
                          <SelectItem value="lockout">Lockout</SelectItem>
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
                      <FormLabel className="text-salis-black dark:text-white">Urgency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-urgency">
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
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
                      <FormLabel className="text-salis-black dark:text-white">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="requested">Requested</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="en_route">En Route</SelectItem>
                          <SelectItem value="arrived">Arrived</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
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
                      <FormLabel className="text-salis-black dark:text-white">Assigned Driver</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-driver">
                            <SelectValue placeholder="Select driver" />
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
                    <FormLabel className="text-salis-black dark:text-white">Pickup Location *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter pickup location address"
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
                      <FormLabel className="text-salis-black dark:text-white">Pickup Latitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder="e.g., 40.7128"
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
                      <FormLabel className="text-salis-black dark:text-white">Pickup Longitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder="e.g., -74.0060"
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
                    <FormLabel className="text-salis-black dark:text-white">Dropoff Location</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder="Enter dropoff location address (optional)"
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
                      <FormLabel className="text-salis-black dark:text-white">Dropoff Latitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder="e.g., 40.7580"
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
                      <FormLabel className="text-salis-black dark:text-white">Dropoff Longitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder="e.g., -73.9855"
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
                  name="estimatedArrival"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Estimated Arrival</FormLabel>
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
                      <FormLabel className="text-salis-black dark:text-white">Actual Arrival</FormLabel>
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

                <FormField
                  control={requestForm.control}
                  name="serviceCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Service Cost</FormLabel>
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
                      <FormLabel className="text-salis-black dark:text-white">Distance (miles/km)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-distance"
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
                    <FormLabel className="text-salis-black dark:text-white">Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder="Internal notes for staff"
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
                    <FormLabel className="text-salis-black dark:text-white">Customer Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder="Notes from/for customer"
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  disabled={requestMutation.isPending}
                  data-testid="button-save-request"
                >
                  {requestMutation.isPending ? "Saving..." : "Save Request"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Truck Dialog */}
      <Dialog open={isTruckDialogOpen} onOpenChange={setIsTruckDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingTruckId ? "Edit Tow Truck" : "Add Tow Truck"}
            </DialogTitle>
            <DialogDescription className="text-salis-gray dark:text-salis-gray-light">
              {editingTruckId ? "Update tow truck details" : "Add a new tow truck to the fleet"}
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
                      <FormLabel className="text-salis-black dark:text-white">Truck Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Tow Truck Alpha"
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
                      <FormLabel className="text-salis-black dark:text-white">Truck Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder="e.g., TOW-001"
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
                      <FormLabel className="text-salis-black dark:text-white">License Plate</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder="e.g., ABC-1234"
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
                      <FormLabel className="text-salis-black dark:text-white">Capacity</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-capacity">
                            <SelectValue placeholder="Select capacity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light_duty">Light Duty</SelectItem>
                          <SelectItem value="medium_duty">Medium Duty</SelectItem>
                          <SelectItem value="heavy_duty">Heavy Duty</SelectItem>
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
                      <FormLabel className="text-salis-black dark:text-white">Current Driver</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-current-driver">
                            <SelectValue placeholder="Select driver" />
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
                      <FormLabel className="text-salis-black dark:text-white">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white" data-testid="select-truck-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="on_job">On Job</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
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
                    <FormLabel className="text-salis-black dark:text-white">Current Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder="Current location address"
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
                      <FormLabel className="text-salis-black dark:text-white">GPS Latitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder="e.g., 40.7128"
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-gps-latitude"
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
                      <FormLabel className="text-salis-black dark:text-white">GPS Longitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0000001"
                          placeholder="e.g., -74.0060"
                          className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                          data-testid="input-gps-longitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-4">
                <FormField
                  control={truckForm.control}
                  name="gpsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-gps-enabled"
                        />
                      </FormControl>
                      <FormLabel className="text-salis-black dark:text-white">GPS Enabled</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={truckForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-is-active"
                        />
                      </FormControl>
                      <FormLabel className="text-salis-black dark:text-white">Active</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTruckDialogOpen(false)}
                  className="border-salis-gray-light dark:border-salis-gray"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  disabled={truckMutation.isPending}
                  data-testid="button-save-truck"
                >
                  {truckMutation.isPending ? "Saving..." : "Save Truck"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
