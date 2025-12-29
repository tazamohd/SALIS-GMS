import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Vehicle, type InsertVehicle, insertVehicleSchema } from "@shared/schema";
import { StandardPageLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Car, Plus, Edit, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function Vehicles() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ['/api/garages'],
  });

  const form = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema),
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

  const createMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      return await apiRequest('POST', '/api/vehicles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('vehicles.vehicleAddedSuccessfully', 'Vehicle added successfully'),
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('vehicles.failedToAddVehicle', 'Failed to add vehicle'),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertVehicle> }) => {
      return await apiRequest('PATCH', `/api/vehicles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('vehicles.vehicleUpdatedSuccessfully', 'Vehicle updated successfully'),
      });
      setIsDialogOpen(false);
      setEditingVehicle(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('vehicles.failedToUpdateVehicle', 'Failed to update vehicle'),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('vehicles.vehicleDeletedSuccessfully', 'Vehicle deleted successfully'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('vehicles.failedToDeleteVehicle', 'Failed to delete vehicle'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertVehicle) => {
    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset(vehicle);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('vehicles.confirmDeleteVehicle', 'Are you sure you want to delete this vehicle?'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingVehicle(null);
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
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const customer = customers.find(c => c.id === vehicle.customerId);
    const customerName = customer?.fullName?.toLowerCase() || "";
    
    return (
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.licensePlate.toLowerCase().includes(query) ||
      vehicle.vin?.toLowerCase().includes(query) ||
      customerName.includes(query)
    );
  });

  const actionButtons = (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button
          className="bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-gray-300 text-white dark:text-black"
          data-testid="button-add-vehicle"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('vehicles.addVehicle', 'Add Vehicle')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" data-testid="modal-vehicle-form">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-gray-900 dark:text-white">
            {editingVehicle ? t('vehicles.editVehicle', 'Edit Vehicle') : t('vehicles.addNewVehicle', 'Add New Vehicle')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vehicles.customer', 'Customer')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-customer">
                        <SelectValue placeholder={t('vehicles.selectCustomer', 'Select customer')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.fullName || customer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.make', 'Make')} *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Toyota"
                        data-testid="input-make"
                      />
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
                    <FormLabel>{t('vehicles.model', 'Model')} *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Camry"
                        data-testid="input-model"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.year', 'Year')} *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="2024"
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
                    <FormLabel>{t('vehicles.licensePlate', 'License Plate')} *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ABC-1234"
                        data-testid="input-license-plate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.vin', 'VIN')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="1HGBH41JXMN109186"
                        value={field.value || ""}
                        data-testid="input-vin"
                      />
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
                    <FormLabel>{t('vehicles.color', 'Color')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('vehicles.white', 'White')}
                        value={field.value || ""}
                        data-testid="input-color"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="engineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.engineType', 'Engine Type')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-engine-type">
                          <SelectValue placeholder={t('vehicles.selectEngineType', 'Select engine type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormLabel>{t('vehicles.transmission', 'Transmission')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-transmission">
                          <SelectValue placeholder={t('vehicles.selectTransmission', 'Select transmission')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="automatic">{t('vehicles.automatic', 'Automatic')}</SelectItem>
                        <SelectItem value="manual">{t('vehicles.manual', 'Manual')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vehicles.mileage', 'Mileage')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="50000"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      value={field.value || 0}
                      data-testid="input-mileage"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.notes', 'Notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('vehicles.additionalNotes', 'Additional notes...')}
                      value={field.value || ""}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
                data-testid="button-cancel"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                className="bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-gray-300 text-white dark:text-black"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-vehicle"
              >
                {createMutation.isPending || updateMutation.isPending ? t('common.saving', 'Saving...') : t('vehicles.saveVehicle', 'Save Vehicle')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <StandardPageLayout
        title={t('vehicles.title', 'Vehicles')}
        description={t('vehicles.description', 'Manage customer vehicles and service history')}
        icon={Car}
        actionButtons={actionButtons}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title={t('vehicles.title', 'Vehicles')}
      description={t('vehicles.description', 'Manage customer vehicles and service history')}
      icon={Car}
      actionButtons={actionButtons}
    >
      <div className="space-y-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-400" />
          <Input
            type="text"
            placeholder={t('vehicles.searchVehicles', 'Search vehicles...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 dark:border-salis-gray-dark"
            data-testid="input-search-vehicles"
          />
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 mx-auto text-gray-600 dark:text-gray-400 mb-4" />
            <p className="font-['Poppins',Helvetica] text-gray-600 dark:text-gray-400">
              {searchQuery ? t('vehicles.noVehiclesMatchingSearch', 'No vehicles found matching your search') : t('vehicles.noVehiclesYet', 'No vehicles added yet')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => {
              const customer = customers.find(c => c.id === vehicle.customerId);
              
              return (
                <div
                  key={vehicle.id}
                  className="bg-white dark:bg-salis-black border border-gray-200 dark:border-salis-gray-dark rounded-lg p-6 hover:shadow-md transition-shadow"
                  data-testid={`card-vehicle-${vehicle.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <h3 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="font-['Poppins',Helvetica] text-sm text-gray-600 dark:text-gray-400">
                          {vehicle.year}
                        </p>
                      </div>
                    </div>
                    {vehicle.isActive && (
                      <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">{t('common.active', 'Active')}</Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="font-['Poppins',Helvetica] text-sm text-gray-600 dark:text-gray-400">{t('vehicles.owner', 'Owner')}:</span>
                      <span className="font-['Poppins',Helvetica] text-sm text-gray-900 dark:text-white">
                        {customer?.fullName || t('common.unknown', 'Unknown')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-['Poppins',Helvetica] text-sm text-gray-600 dark:text-gray-400">{t('vehicles.license', 'License')}:</span>
                      <span className="font-['Poppins',Helvetica] text-sm text-gray-900 dark:text-white font-medium">
                        {vehicle.licensePlate}
                      </span>
                    </div>
                    {vehicle.vin && (
                      <div className="flex justify-between">
                        <span className="font-['Poppins',Helvetica] text-sm text-gray-600 dark:text-gray-400">{t('vehicles.vin', 'VIN')}:</span>
                        <span className="font-['Poppins',Helvetica] text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
                          {vehicle.vin}
                        </span>
                      </div>
                    )}
                    {vehicle.mileage && vehicle.mileage > 0 && (
                      <div className="flex justify-between">
                        <span className="font-['Poppins',Helvetica] text-sm text-gray-600 dark:text-gray-400">{t('vehicles.mileage', 'Mileage')}:</span>
                        <span className="font-['Poppins',Helvetica] text-sm text-gray-900 dark:text-white">
                          {vehicle.mileage.toLocaleString()} km
                        </span>
                      </div>
                    )}
                    {vehicle.engineType && (
                      <div className="flex justify-between">
                        <span className="font-['Poppins',Helvetica] text-sm text-gray-600 dark:text-gray-400">{t('vehicles.engine', 'Engine')}:</span>
                        <span className="font-['Poppins',Helvetica] text-sm text-gray-900 dark:text-white capitalize">
                          {vehicle.engineType}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-salis-gray-dark">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vehicle)}
                      className="flex-1"
                      data-testid={`button-edit-${vehicle.id}`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {t('common.edit', 'Edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(vehicle.id)}
                      className="flex-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                      data-testid={`button-delete-${vehicle.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('common.delete', 'Delete')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StandardPageLayout>
  );
}
