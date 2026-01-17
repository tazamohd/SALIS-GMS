import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { StandardPageLayout } from "@/components/layouts";

export default function VehiclesEnhanced() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [vinDecoding, setVinDecoding] = useState(false);

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ['/api/garages'],
  });

  const { data: serviceHistory = [] } = useQuery<VehicleServiceHistory[]>({
    queryKey: [`/api/vehicles/${selectedVehicle?.id}/service-history`],
    enabled: !!selectedVehicle,
  });

  const { data: maintenanceSchedules = [] } = useQuery<MaintenanceSchedule[]>({
    queryKey: [`/api/vehicles/${selectedVehicle?.id}/maintenance-schedules`],
    enabled: !!selectedVehicle,
  });

  const { data: serviceReminders = [] } = useQuery<ServiceReminder[]>({
    queryKey: [`/api/vehicles/${selectedVehicle?.id}/service-reminders`],
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
      garageId: "",
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

  useEffect(() => {
    if (garages.length > 0 && !form.getValues("garageId")) {
      form.setValue("garageId", garages[0].id);
    }
  }, [garages, form]);

  const decodeVIN = async (vin: string) => {
    if (!vin || vin.length < 17) {
      toast({
        title: t('vehicles.invalidVin', 'Invalid VIN'),
        description: t('vehicles.vinMustBe17', 'VIN must be 17 characters long'),
        variant: "destructive",
      });
      return;
    }

    setVinDecoding(true);
    try {
      const response = await apiRequest(`/api/decode-vin/${vin}`, 'GET');
      const data = response as unknown as any[];
      
      const makeField = data?.find((item: any) => item.Variable === "Make")?.Value;
      const modelField = data?.find((item: any) => item.Variable === "Model")?.Value;
      const yearField = data?.find((item: any) => item.Variable === "Model Year")?.Value;
      const engineField = data?.find((item: any) => item.Variable === "Engine Number of Cylinders")?.Value;
      
      if (makeField) form.setValue("make", makeField);
      if (modelField) form.setValue("model", modelField);
      if (yearField) form.setValue("year", parseInt(yearField));
      
      toast({
        title: t('vehicles.vinDecoded', 'VIN Decoded'),
        description: t('vehicles.vinPopulated', 'Vehicle information populated from VIN'),
      });
    } catch (error: any) {
      toast({
        title: t('vehicles.vinDecodeFailed', 'VIN Decode Failed'),
        description: error.message || t('vehicles.couldNotDecodeVin', 'Could not decode VIN'),
        variant: "destructive",
      });
    } finally {
      setVinDecoding(false);
    }
  };

  const createVehicleMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      return await apiRequest('POST', '/api/vehicles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({ title: t('common.success', 'Success'), description: t('vehicles.vehicleAdded', 'Vehicle added successfully') });
      setIsDialogOpen(false);
      form.reset({
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
      });
    },
    onError: (error: any) => {
      toast({ title: t('common.error', 'Error'), description: error.message, variant: "destructive" });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertVehicle> }) => {
      return await apiRequest('PATCH', `/api/vehicles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({ title: t('common.success', 'Success'), description: t('vehicles.vehicleUpdated', 'Vehicle updated successfully') });
      setIsDialogOpen(false);
      form.reset({
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
      });
    },
    onError: (error: any) => {
      toast({ title: t('common.error', 'Error'), description: error.message, variant: "destructive" });
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
    <StandardPageLayout
      title={t('vehicles.management', 'Vehicle Management')}
      description={t('vehicles.managementDescription', 'Track vehicles, service history, maintenance schedules, and more')}
      icon={Car}
    >
      <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Button 
          onClick={() => {
            setSelectedVehicle(null);
            form.reset({
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
            });
            setIsDialogOpen(true);
          }} 
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a0e6] text-white shadow-lg"
          data-testid="button-add-vehicle"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('vehicles.addVehicle', 'Add Vehicle')}
        </Button>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{selectedVehicle ? t('vehicles.editVehicle', 'Edit Vehicle') : t('vehicles.addNewVehicle', 'Add New Vehicle')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.vin', 'VIN')}</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder={t('vehicles.vinPlaceholder', '17-character VIN')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-vin" />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => decodeVIN(field.value || "")}
                          disabled={vinDecoding}
                          className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                          data-testid="button-decode-vin"
                        >
                          {vinDecoding ? t('vehicles.decoding', 'Decoding...') : t('vehicles.decodeVin', 'Decode VIN')}
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.owner', 'Owner')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-customer">
                            <SelectValue placeholder={t('vehicles.selectOwner', 'Select owner')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.garage', 'Garage')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-garage">
                            <SelectValue placeholder={t('vehicles.selectGarage', 'Select garage')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.make', 'Make')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('vehicles.makePlaceholder', 'e.g. Toyota')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-make" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.model', 'Model')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('vehicles.modelPlaceholder', 'e.g. Camry')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-model" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.year', 'Year')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.licensePlate', 'License Plate')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('vehicles.licensePlatePlaceholder', 'e.g. ABC123')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-license-plate" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.color', 'Color')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder={t('vehicles.colorPlaceholder', 'Silver')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-color" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.mileage', 'Mileage')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || 0}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.engineType', 'Engine Type')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-engine-type">
                            <SelectValue placeholder={t('vehicles.selectEngineType', 'Select engine type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="gasoline">{t('vehicles.gasoline', 'Gasoline')}</SelectItem>
                          <SelectItem value="diesel">{t('vehicles.diesel', 'Diesel')}</SelectItem>
                          <SelectItem value="electric">{t('vehicles.electric', 'Electric')}</SelectItem>
                          <SelectItem value="hybrid">{t('vehicles.hybrid', 'Hybrid')}</SelectItem>
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.transmission', 'Transmission')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-transmission">
                            <SelectValue placeholder={t('vehicles.selectTransmission', 'Select transmission')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="automatic">{t('vehicles.automatic', 'Automatic')}</SelectItem>
                          <SelectItem value="manual">{t('vehicles.manual', 'Manual')}</SelectItem>
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.warrantyProvider', 'Warranty Provider')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder={t('vehicles.manufacturer', 'Manufacturer')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-warranty-provider" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.warrantyType', 'Warranty Type')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-warranty-type">
                            <SelectValue placeholder={t('vehicles.selectWarrantyType', 'Select warranty type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="manufacturer">{t('vehicles.manufacturerWarranty', 'Manufacturer')}</SelectItem>
                          <SelectItem value="extended">{t('vehicles.extendedWarranty', 'Extended')}</SelectItem>
                          <SelectItem value="powertrain">{t('vehicles.powertrainWarranty', 'Powertrain')}</SelectItem>
                          <SelectItem value="bumper-to-bumper">{t('vehicles.bumperToBumper', 'Bumper-to-Bumper')}</SelectItem>
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.warrantyEndDate', 'Warranty End Date')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.warrantyMileageLimit', 'Warranty Mileage Limit')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || 0}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} placeholder={t('vehicles.additionalNotes', 'Additional notes...')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a0e6] text-white"
                  data-testid="button-submit"
                >
                  {createVehicleMutation.isPending || updateVehicleMutation.isPending ? t('common.saving', 'Saving...') : t('vehicles.saveVehicle', 'Save Vehicle')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <Input
              type="text"
              placeholder={t('vehicles.searchVehicles', 'Search vehicles...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              data-testid="input-search"
            />
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto">
            {filteredVehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className={`cursor-pointer transition-colors bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] ${selectedVehicle?.id === vehicle.id ? 'ring-2 ring-[#0A5ED7]' : 'hover:border-[#0A5ED7]'}`}
                onClick={() => handleSelectVehicle(vehicle)}
                data-testid={`card-vehicle-${vehicle.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#0A5ED7]/10 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-[#0A5ED7]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-[#64748B]">{vehicle.licensePlate}</p>
                      <div className="flex gap-2 mt-2">
                        {vehicle.engineType && (
                          <Badge variant="outline" className="text-xs border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">{vehicle.engineType}</Badge>
                        )}
                        {vehicle.mileage && (
                          <Badge variant="outline" className="text-xs border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">{vehicle.mileage.toLocaleString()} {t('vehicles.mi', 'mi')}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="col-span-8">
          {selectedVehicle ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-overview">{t('vehicles.overview', 'Overview')}</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-history">
                  <Clock className="w-4 h-4 mr-1" />
                  {t('vehicles.history', 'History')}
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-maintenance">
                  <Wrench className="w-4 h-4 mr-1" />
                  {t('vehicles.maintenance', 'Maintenance')}
                </TabsTrigger>
                <TabsTrigger value="reminders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-reminders">
                  <Bell className="w-4 h-4 mr-1" />
                  {t('vehicles.reminders', 'Reminders')}
                </TabsTrigger>
                <TabsTrigger value="warranty" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-warranty">
                  <Shield className="w-4 h-4 mr-1" />
                  {t('vehicles.warranty', 'Warranty')}
                </TabsTrigger>
                <TabsTrigger value="photos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-photos">
                  <Image className="w-4 h-4 mr-1" />
                  {t('vehicles.photos', 'Photos')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <CardHeader>
                    <CardTitle className="text-[#0B1F3B] dark:text-white">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</CardTitle>
                    <CardDescription className="text-[#64748B]">{t('vehicles.vehicleInformation', 'Vehicle Information')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#64748B]">{t('vehicles.licensePlate', 'License Plate')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedVehicle.licensePlate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">{t('vehicles.vin', 'VIN')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedVehicle.vin || t('common.notAvailable', 'N/A')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">{t('vehicles.color', 'Color')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedVehicle.color || t('common.notAvailable', 'N/A')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">{t('vehicles.mileage', 'Mileage')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedVehicle.mileage?.toLocaleString() || "0"} {t('vehicles.miles', 'miles')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">{t('vehicles.engineType', 'Engine Type')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedVehicle.engineType || t('common.notAvailable', 'N/A')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">{t('vehicles.transmission', 'Transmission')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedVehicle.transmissionType || t('common.notAvailable', 'N/A')}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <CardHeader>
                    <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vehicles.serviceHistoryTimeline', 'Service History Timeline')}</CardTitle>
                    <CardDescription className="text-[#64748B]">{t('vehicles.completeServiceHistory', 'Complete service history for this vehicle')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {serviceHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
                          <Clock className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-[#64748B]">{t('vehicles.noServiceHistory', 'No service history recorded yet')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {serviceHistory.map((service) => (
                          <div key={service.id} className="border-l-2 border-[#0A5ED7] pl-4 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-[#0B1F3B] dark:text-white">{service.serviceType}</h4>
                                <p className="text-sm text-[#64748B]">{service.description}</p>
                                {service.serviceDate && (
                                  <p className="text-xs text-[#64748B] mt-1">
                                    {format(new Date(service.serviceDate), 'PPP')} • {service.mileageAtService?.toLocaleString()} {t('vehicles.miles', 'miles')}
                                  </p>
                                )}
                              </div>
                              {service.cost && (
                                <Badge variant="outline" className="border-[#0A5ED7] text-[#0A5ED7]">${service.cost}</Badge>
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
                <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <CardHeader>
                    <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vehicles.maintenanceSchedule', 'Maintenance Schedule')}</CardTitle>
                    <CardDescription className="text-[#64748B]">{t('vehicles.upcomingMaintenance', 'Upcoming and scheduled maintenance items')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {maintenanceSchedules.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
                          <Wrench className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-[#64748B]">{t('vehicles.noMaintenanceSchedules', 'No maintenance schedules configured')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {maintenanceSchedules.map((schedule) => (
                          <div key={schedule.id} className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-[#0B1F3B] dark:text-white">{schedule.serviceName}</h4>
                                <p className="text-sm text-[#64748B]">{schedule.description}</p>
                                <div className="flex gap-4 mt-2 text-xs text-[#64748B]">
                                  {schedule.nextDueDate && (
                                    <span>{t('vehicles.due', 'Due')}: {format(new Date(schedule.nextDueDate), 'PP')}</span>
                                  )}
                                  {schedule.nextDueMileage && (
                                    <span>{t('vehicles.at', 'At')}: {schedule.nextDueMileage.toLocaleString()} {t('vehicles.miles', 'miles')}</span>
                                  )}
                                </div>
                              </div>
                              <Badge className={schedule.isActive ? "bg-emerald-500/10 text-emerald-600 border-0" : "bg-[#64748B]/10 text-[#64748B] border-0"}>
                                {schedule.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
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
                <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <CardHeader>
                    <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vehicles.serviceReminders', 'Service Reminders')}</CardTitle>
                    <CardDescription className="text-[#64748B]">{t('vehicles.automatedReminders', 'Automated reminders for upcoming services')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {serviceReminders.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
                          <Bell className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-[#64748B]">{t('vehicles.noReminders', 'No service reminders set')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {serviceReminders.map((reminder) => (
                          <div key={reminder.id} className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-[#0B1F3B] dark:text-white">{reminder.reminderTitle}</h4>
                                <p className="text-sm text-[#64748B]">{reminder.reminderMessage}</p>
                                <div className="flex gap-4 mt-2 text-xs text-[#64748B]">
                                  {reminder.triggerDate && (
                                    <span>{t('vehicles.trigger', 'Trigger')}: {format(new Date(reminder.triggerDate), 'PP')}</span>
                                  )}
                                  {reminder.triggerMileage && (
                                    <span>{t('vehicles.at', 'At')}: {reminder.triggerMileage.toLocaleString()} {t('vehicles.miles', 'miles')}</span>
                                  )}
                                </div>
                              </div>
                              <Badge className={reminder.status === "pending" ? "bg-[#0A5ED7]/10 text-[#0A5ED7] border-0" : "bg-[#64748B]/10 text-[#64748B] border-0"}>
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
                <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <CardHeader>
                    <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vehicles.warrantyInformation', 'Warranty Information')}</CardTitle>
                    <CardDescription className="text-[#64748B]">{t('vehicles.warrantyDetails', 'Vehicle warranty details and coverage')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedVehicle.warrantyProvider ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[#64748B]">{t('vehicles.provider', 'Provider')}</p>
                          <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedVehicle.warrantyProvider}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#64748B]">{t('common.type', 'Type')}</p>
                          <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedVehicle.warrantyType || t('common.notAvailable', 'N/A')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#64748B]">{t('vehicles.expirationDate', 'Expiration Date')}</p>
                          <p className="font-medium text-[#0B1F3B] dark:text-white">
                            {selectedVehicle.warrantyEndDate
                              ? format(new Date(selectedVehicle.warrantyEndDate), 'PP')
                              : t('common.notAvailable', 'N/A')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#64748B]">{t('vehicles.mileageLimit', 'Mileage Limit')}</p>
                          <p className="font-medium text-[#0B1F3B] dark:text-white">
                            {selectedVehicle.warrantyMileageLimit
                              ? `${selectedVehicle.warrantyMileageLimit.toLocaleString()} ${t('vehicles.miles', 'miles')}`
                              : t('common.notAvailable', 'N/A')}
                          </p>
                        </div>
                        {selectedVehicle.warrantyNotes && (
                          <div className="col-span-2">
                            <p className="text-sm text-[#64748B]">{t('common.notes', 'Notes')}</p>
                            <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedVehicle.warrantyNotes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-[#64748B]">{t('vehicles.noWarrantyInfo', 'No warranty information available')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="mt-4">
                <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <CardHeader>
                    <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vehicles.vehiclePhotos', 'Vehicle Photos')}</CardTitle>
                    <CardDescription className="text-[#64748B]">{t('vehicles.photoGallery', 'Photo gallery for this vehicle')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedVehicle.photos && selectedVehicle.photos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {selectedVehicle.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`${t('vehicles.vehiclePhoto', 'Vehicle photo')} ${index + 1}`}
                            className="rounded-lg object-cover w-full h-48"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-[#64748B]">{t('vehicles.noPhotos', 'No photos uploaded yet')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] h-full flex items-center justify-center">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
                  <Car className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#0B1F3B] dark:text-white">{t('vehicles.noVehicleSelected', 'No Vehicle Selected')}</h3>
                <p className="text-[#64748B]">{t('vehicles.selectVehicleFromList', 'Select a vehicle from the list to view details')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </>
    </StandardPageLayout>
  );
}
