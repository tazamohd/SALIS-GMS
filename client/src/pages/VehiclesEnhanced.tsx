import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  type Vehicle,
  type InsertVehicle,
  insertVehicleSchema,
  type VehicleServiceHistory,
  type MaintenanceSchedule,
  type ServiceReminder,
  insertVehicleServiceHistorySchema,
  insertMaintenanceScheduleSchema,
  insertServiceReminderSchema
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Car, Plus, Edit, Trash2, Search, Clock, Wrench, Bell, Shield, Image, Download } from "lucide-react";
import { format } from "date-fns";

export default function VehiclesEnhanced() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [vinDecoding, setVinDecoding] = useState(false);

  // Vehicle queries
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ['/api/garages'],
  });

  // Enhanced data queries for selected vehicle
  const { data: serviceHistory = [] } = useQuery<VehicleServiceHistory[]>({
    queryKey: ['/api/vehicles', selectedVehicle?.id, 'service-history'],
    enabled: !!selectedVehicle,
  });

  const { data: maintenanceSchedules = [] } = useQuery<MaintenanceSchedule[]>({
    queryKey: ['/api/vehicles', selectedVehicle?.id, 'maintenance-schedules'],
    enabled: !!selectedVehicle,
  });

  const { data: serviceReminders = [] } = useQuery<ServiceReminder[]>({
    queryKey: ['/api/vehicles', selectedVehicle?.id, 'service-reminders'],
    enabled: !!selectedVehicle,
  });

  const form = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema.extend({
      warrantyProvider: insertVehicleSchema.shape.warrantyProvider.optional(),
      warrantyType: insertVehicleSchema.shape.warrantyType.optional(),
      warrantyStartDate: insertVehicleSchema.shape.warrantyStartDate.optional(),
      warrantyEndDate: insertVehicleSchema.shape.warrantyEndDate.optional(),
      warrantyMileageLimit: insertVehicleSchema.shape.warrantyMileageLimit.optional(),
      warrantyNotes: insertVehicleSchema.shape.warrantyNotes.optional(),
      photos: insertVehicleSchema.shape.photos.optional(),
    })),
    defaultValues: {
      customerId: "",
      garageId: garages[0]?.id || "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
      vin: "",
      color: "",
      mileage: 0,
      engineType: "",
      transmissionType: "",
      notes: "",
      isActive: true,
    },
  });

  // VIN decoder
  const decodeVIN = async (vin: string) => {
    if (!vin || vin.length < 17) {
      toast({
        title: "Invalid VIN",
        description: "VIN must be 17 characters long",
        variant: "destructive",
      });
      return;
    }

    setVinDecoding(true);
    try {
      const data = await apiRequest('GET', `/api/decode-vin/${vin}`) as any[];
      
      // Extract relevant fields from NHTSA response
      const makeField = data?.find((item: any) => item.Variable === "Make")?.Value;
      const modelField = data?.find((item: any) => item.Variable === "Model")?.Value;
      const yearField = data?.find((item: any) => item.Variable === "Model Year")?.Value;
      const engineField = data?.find((item: any) => item.Variable === "Engine Number of Cylinders")?.Value;
      
      if (makeField) form.setValue("make", makeField);
      if (modelField) form.setValue("model", modelField);
      if (yearField) form.setValue("year", parseInt(yearField));
      
      toast({
        title: "VIN Decoded",
        description: "Vehicle information populated from VIN",
      });
    } catch (error: any) {
      toast({
        title: "VIN Decode Failed",
        description: error.message || "Could not decode VIN",
        variant: "destructive",
      });
    } finally {
      setVinDecoding(false);
    }
  };

  // Mutations
  const createVehicleMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      return await apiRequest('POST', '/api/vehicles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({ title: "Success", description: "Vehicle added successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertVehicle> }) => {
      return await apiRequest('PATCH', `/api/vehicles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({ title: "Success", description: "Vehicle updated successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredVehicles = vehicles.filter(vehicle =>
    searchQuery === "" ||
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.vin?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setActiveTab("overview");
  };

  const onSubmit = (data: InsertVehicle) => {
    if (selectedVehicle) {
      updateVehicleMutation.mutate({ id: selectedVehicle.id, data });
    } else {
      createVehicleMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-vehicles-title">Vehicle Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track vehicles, service history, maintenance schedules, and more
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => {
            setSelectedVehicle(null);
            form.reset();
            setIsDialogOpen(true);
          }} data-testid="button-add-vehicle">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>VIN</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="17-character VIN" data-testid="input-vin" />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => decodeVIN(field.value || "")}
                            disabled={vinDecoding}
                            data-testid="button-decode-vin"
                          >
                            {vinDecoding ? "Decoding..." : "Decode VIN"}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-customer">
                              <SelectValue placeholder="Select owner" />
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

                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Toyota" data-testid="input-make" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Camry" data-testid="input-model" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABC123" data-testid="input-license-plate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Silver" data-testid="input-color" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mileage</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || 0}
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-mileage"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="engineType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Engine Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-engine-type">
                              <SelectValue placeholder="Select engine type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gasoline">Gasoline</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transmissionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmission</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-transmission">
                              <SelectValue placeholder="Select transmission" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="warrantyProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty Provider</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Manufacturer" data-testid="input-warranty-provider" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="warrantyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-warranty-type">
                              <SelectValue placeholder="Select warranty type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manufacturer">Manufacturer</SelectItem>
                            <SelectItem value="extended">Extended</SelectItem>
                            <SelectItem value="powertrain">Powertrain</SelectItem>
                            <SelectItem value="bumper-to-bumper">Bumper-to-Bumper</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="warrantyEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty End Date</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            data-testid="input-warranty-end-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="warrantyMileageLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty Mileage Limit</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || 0}
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-warranty-mileage"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Additional notes..." data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createVehicleMutation.isPending || updateVehicleMutation.isPending ? "Saving..." : "Save Vehicle"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Vehicle List */}
        <div className="col-span-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto">
            {filteredVehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className={`cursor-pointer transition-colors ${selectedVehicle?.id === vehicle.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => handleSelectVehicle(vehicle)}
                data-testid={`card-vehicle-${vehicle.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Car className="w-8 h-8 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                      <div className="flex gap-2 mt-2">
                        {vehicle.engineType && (
                          <Badge variant="outline" className="text-xs">{vehicle.engineType}</Badge>
                        )}
                        {vehicle.mileage && (
                          <Badge variant="outline" className="text-xs">{vehicle.mileage.toLocaleString()} mi</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Vehicle Details with Tabs */}
        <div className="col-span-8">
          {selectedVehicle ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="history" data-testid="tab-history">
                  <Clock className="w-4 h-4 mr-1" />
                  History
                </TabsTrigger>
                <TabsTrigger value="maintenance" data-testid="tab-maintenance">
                  <Wrench className="w-4 h-4 mr-1" />
                  Maintenance
                </TabsTrigger>
                <TabsTrigger value="reminders" data-testid="tab-reminders">
                  <Bell className="w-4 h-4 mr-1" />
                  Reminders
                </TabsTrigger>
                <TabsTrigger value="warranty" data-testid="tab-warranty">
                  <Shield className="w-4 h-4 mr-1" />
                  Warranty
                </TabsTrigger>
                <TabsTrigger value="photos" data-testid="tab-photos">
                  <Image className="w-4 h-4 mr-1" />
                  Photos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</CardTitle>
                    <CardDescription>Vehicle Information</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">License Plate</p>
                      <p className="font-medium">{selectedVehicle.licensePlate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">VIN</p>
                      <p className="font-medium">{selectedVehicle.vin || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Color</p>
                      <p className="font-medium">{selectedVehicle.color || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mileage</p>
                      <p className="font-medium">{selectedVehicle.mileage?.toLocaleString() || "0"} miles</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Engine Type</p>
                      <p className="font-medium">{selectedVehicle.engineType || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transmission</p>
                      <p className="font-medium">{selectedVehicle.transmissionType || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Service History Timeline</CardTitle>
                    <CardDescription>Complete service history for this vehicle</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {serviceHistory.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No service history recorded yet</p>
                    ) : (
                      <div className="space-y-4">
                        {serviceHistory.map((service) => (
                          <div key={service.id} className="border-l-2 border-blue-500 pl-4 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{service.serviceType}</h4>
                                <p className="text-sm text-gray-600">{service.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {format(new Date(service.serviceDate), 'PPP')} • {service.mileageAtService?.toLocaleString()} miles
                                </p>
                              </div>
                              {service.cost && (
                                <Badge variant="outline">${service.cost}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="maintenance" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance Schedule</CardTitle>
                    <CardDescription>Upcoming and scheduled maintenance items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {maintenanceSchedules.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No maintenance schedules configured</p>
                    ) : (
                      <div className="space-y-3">
                        {maintenanceSchedules.map((schedule) => (
                          <div key={schedule.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{schedule.serviceName}</h4>
                                <p className="text-sm text-gray-600">{schedule.description}</p>
                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                  {schedule.nextDueDate && (
                                    <span>Due: {format(new Date(schedule.nextDueDate), 'PP')}</span>
                                  )}
                                  {schedule.nextDueMileage && (
                                    <span>At: {schedule.nextDueMileage.toLocaleString()} miles</span>
                                  )}
                                </div>
                              </div>
                              <Badge variant={schedule.isActive ? "default" : "secondary"}>
                                {schedule.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reminders" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Reminders</CardTitle>
                    <CardDescription>Automated reminders for upcoming services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {serviceReminders.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No service reminders set</p>
                    ) : (
                      <div className="space-y-3">
                        {serviceReminders.map((reminder) => (
                          <div key={reminder.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{reminder.reminderTitle}</h4>
                                <p className="text-sm text-gray-600">{reminder.reminderMessage}</p>
                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                  {reminder.triggerDate && (
                                    <span>Trigger: {format(new Date(reminder.triggerDate), 'PP')}</span>
                                  )}
                                  {reminder.triggerMileage && (
                                    <span>At: {reminder.triggerMileage.toLocaleString()} miles</span>
                                  )}
                                </div>
                              </div>
                              <Badge variant={reminder.status === "pending" ? "default" : "secondary"}>
                                {reminder.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="warranty" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Warranty Information</CardTitle>
                    <CardDescription>Vehicle warranty details and coverage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedVehicle.warrantyProvider ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Provider</p>
                          <p className="font-medium">{selectedVehicle.warrantyProvider}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Type</p>
                          <p className="font-medium">{selectedVehicle.warrantyType || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Expiration Date</p>
                          <p className="font-medium">
                            {selectedVehicle.warrantyEndDate
                              ? format(new Date(selectedVehicle.warrantyEndDate), 'PP')
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Mileage Limit</p>
                          <p className="font-medium">
                            {selectedVehicle.warrantyMileageLimit
                              ? `${selectedVehicle.warrantyMileageLimit.toLocaleString()} miles`
                              : "N/A"}
                          </p>
                        </div>
                        {selectedVehicle.warrantyNotes && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="font-medium">{selectedVehicle.warrantyNotes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No warranty information available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Photos</CardTitle>
                    <CardDescription>Photo gallery for this vehicle</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedVehicle.photos && selectedVehicle.photos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {selectedVehicle.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Vehicle photo ${index + 1}`}
                            className="rounded-lg object-cover w-full h-48"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No photos uploaded yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-16">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Vehicle Selected</h3>
                <p className="text-gray-600">Select a vehicle from the list to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
