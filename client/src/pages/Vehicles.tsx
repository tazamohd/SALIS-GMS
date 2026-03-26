import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Vehicle, type InsertVehicle, insertVehicleSchema } from "@shared/schema";
import { vehicleMakes, getModelsForMake, vehicleYears, nationalities, engineTypes, transmissionTypes, colors } from "@shared/vehicleCatalogs";
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
import { Car, Plus, Edit, Trash2, Search, ScanLine, Loader2, Camera, Upload, FileText, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";

export default function Vehicles() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMakeId, setSelectedMakeId] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([]);
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [vinDecodeResult, setVinDecodeResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanType, setScanType] = useState<'vin' | 'license' | 'id' | 'driverLicense'>('vin');

  const { data: vehicles = [], isLoading, error, refetch } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ['/api/garages'],
  });

  const form = useForm<any>({
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
      nationality: "",
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
    
    // Hydrate selectedMakeId from vehicle.make using multiple matching strategies
    const vehicleMakeLower = (vehicle.make || '').toLowerCase().trim();
    let matchedMake = vehicleMakes.find(m => m.name.toLowerCase() === vehicleMakeLower) // Exact match
      || vehicleMakes.find(m => m.name.toLowerCase().includes(vehicleMakeLower)) // Contains
      || vehicleMakes.find(m => vehicleMakeLower.includes(m.name.toLowerCase())); // Reverse contains
    
    if (matchedMake) {
      setSelectedMakeId(matchedMake.id);
      setAvailableModels(getModelsForMake(matchedMake.id));
    } else {
      // Fallback: keep the model dropdown enabled with empty models list
      // but still allow the user to manually select a make
      setSelectedMakeId("");
      setAvailableModels([]);
    }
    
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
    setSelectedMakeId("");
    setAvailableModels([]);
    setVinDecodeResult(null);
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

  // Handle make selection and update available models
  const handleMakeChange = (makeId: string) => {
    setSelectedMakeId(makeId);
    const make = vehicleMakes.find(m => m.id === makeId);
    if (make) {
      form.setValue("make", make.name);
      const models = getModelsForMake(makeId);
      setAvailableModels(models);
      form.setValue("model", ""); // Reset model when make changes
    }
  };

  // VIN Decode function
  const handleDecodeVin = async () => {
    const vin = form.getValues("vin");
    if (!vin || vin.length !== 17) {
      toast({
        title: t('common.error', 'Error'),
        description: t('vehicles.vinMustBe17', 'VIN must be exactly 17 characters'),
        variant: "destructive",
      });
      return;
    }

    setIsDecodingVin(true);
    try {
      const response = await fetch(`/api/vin-decode/${vin}`);
      if (!response.ok) {
        throw new Error('Failed to decode VIN');
      }
      const decoded = await response.json();
      setVinDecodeResult(decoded);

      // Auto-fill form fields with decoded data
      if (decoded.make) {
        const matchedMake = vehicleMakes.find(m => 
          m.name.toLowerCase() === decoded.make.toLowerCase()
        );
        if (matchedMake) {
          setSelectedMakeId(matchedMake.id);
          form.setValue("make", matchedMake.name);
          const models = getModelsForMake(matchedMake.id);
          setAvailableModels(models);
          
          // Try to match model
          if (decoded.model) {
            const matchedModel = models.find(m => 
              m.name.toLowerCase() === decoded.model.toLowerCase()
            );
            form.setValue("model", matchedModel ? matchedModel.name : decoded.model);
          }
        } else {
          form.setValue("make", decoded.make);
        }
      }
      if (decoded.year) form.setValue("year", decoded.year);
      
      // Match engine type to catalog (graceful fallback to first matching or raw value)
      if (decoded.engineType) {
        const matchedEngine = engineTypes.find(e => 
          e.name.toLowerCase().includes(decoded.engineType.toLowerCase()) ||
          decoded.engineType.toLowerCase().includes(e.name.toLowerCase())
        );
        form.setValue("engineType", matchedEngine ? matchedEngine.name : decoded.engineType);
      }
      
      // Match transmission type to catalog
      if (decoded.transmissionType) {
        const matchedTrans = transmissionTypes.find(t => 
          t.name.toLowerCase().includes(decoded.transmissionType.toLowerCase()) ||
          decoded.transmissionType.toLowerCase().includes(t.name.toLowerCase())
        );
        form.setValue("transmissionType", matchedTrans ? matchedTrans.name : decoded.transmissionType);
      }

      toast({
        title: t('common.success', 'Success'),
        description: t('vehicles.vinDecodedSuccessfully', 'VIN decoded successfully! Vehicle details have been filled in.'),
      });
    } catch (error) {
      console.error('VIN decode error:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('vehicles.failedToDecodeVin', 'Failed to decode VIN. Please check the VIN and try again.'),
        variant: "destructive",
      });
    } finally {
      setIsDecodingVin(false);
    }
  };

  // Open scan dialog
  const openScanDialog = (type: 'vin' | 'license' | 'id' | 'driverLicense') => {
    setScanType(type);
    setScanDialogOpen(true);
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message="Failed to load vehicles" retry={refetch} />;

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
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a0e6] text-white shadow-lg"
          data-testid="button-add-vehicle"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('vehicles.addVehicle', 'Add Vehicle')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-vehicle-form">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-[#0B1F3B] dark:text-white">
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
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.customer', 'Customer')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-customer">
                        <SelectValue placeholder={t('vehicles.selectCustomer', 'Select customer')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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

            {/* VIN Field with Decode Button */}
            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.vin', 'VIN')}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="1HGBH41JXMN109186"
                        value={field.value || ""}
                        maxLength={17}
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white uppercase"
                        data-testid="input-vin"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={handleDecodeVin}
                      disabled={isDecodingVin}
                      className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a0e6] text-white whitespace-nowrap"
                      data-testid="button-decode-vin"
                    >
                      {isDecodingVin ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ScanLine className="w-4 h-4 mr-1" />
                          {t('vehicles.decodeVin', 'Decode')}
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">{t('vehicles.vinHelp', 'Enter 17-character VIN to auto-fill vehicle details')}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* VIN Decode Result Display */}
            {vinDecodeResult && vinDecodeResult.engineCylinders && (
              <div className="p-3 bg-[#0A5ED7]/5 border border-[#0A5ED7]/20 rounded-lg">
                <p className="text-sm font-semibold text-[#0A5ED7] mb-2">{t('vehicles.decodedInfo', 'Decoded Vehicle Info')}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B]">
                  {vinDecodeResult.engineCylinders && <p>{t('vehicles.cylinders', 'Cylinders')}: {vinDecodeResult.engineCylinders}</p>}
                  {vinDecodeResult.engineDisplacement && <p>{t('vehicles.displacement', 'Engine Size')}: {vinDecodeResult.engineDisplacement}L</p>}
                  {vinDecodeResult.driveType && <p>{t('vehicles.driveType', 'Drive Type')}: {vinDecodeResult.driveType}</p>}
                  {vinDecodeResult.bodyClass && <p>{t('vehicles.bodyType', 'Body Type')}: {vinDecodeResult.bodyClass}</p>}
                  {vinDecodeResult.manufacturer && <p>{t('vehicles.manufacturer', 'Manufacturer')}: {vinDecodeResult.manufacturer}</p>}
                  {vinDecodeResult.plantCountry && <p>{t('vehicles.madeIn', 'Made In')}: {vinDecodeResult.plantCountry}</p>}
                </div>
              </div>
            )}

            {/* Make Dropdown with Logos */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.make', 'Make')} *</FormLabel>
                    <Select 
                      onValueChange={(value) => handleMakeChange(value)} 
                      value={selectedMakeId}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-make">
                          <SelectValue placeholder={t('vehicles.selectMake', 'Select make')}>
                            {selectedMakeId && (
                              <span className="flex items-center gap-2">
                                {vehicleMakes.find(m => m.id === selectedMakeId)?.logo}
                                {vehicleMakes.find(m => m.id === selectedMakeId)?.name}
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-h-[300px]">
                        <ScrollArea className="h-[280px]">
                          {vehicleMakes.map((make) => (
                            <SelectItem key={make.id} value={make.id}>
                              <span className="flex items-center gap-2">
                                <span>{make.logo}</span>
                                <span>{make.name}</span>
                                <span className="text-xs text-[#64748B]">({make.country})</span>
                              </span>
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Model Dropdown - Dependent on Make */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.model', 'Model')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMakeId}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-model">
                          <SelectValue placeholder={selectedMakeId ? t('vehicles.selectModel', 'Select model') : t('vehicles.selectMakeFirst', 'Select make first')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-h-[300px]">
                        <ScrollArea className="h-[280px]">
                          {availableModels.map((model) => (
                            <SelectItem key={model.id} value={model.name}>
                              {model.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">{t('vehicles.otherModel', 'Other')}</SelectItem>
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Year and Color Dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.year', 'Year')} *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-year">
                          <SelectValue placeholder={t('vehicles.selectYear', 'Select year')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-h-[300px]">
                        <ScrollArea className="h-[280px]">
                          {vehicleYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-color">
                          <SelectValue placeholder={t('vehicles.selectColor', 'Select color')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        {colors.map((color) => (
                          <SelectItem key={color.id} value={color.name}>
                            <span className="flex items-center gap-2">
                              <span 
                                className="w-4 h-4 rounded-full border border-[#E2E8F0]" 
                                style={{ backgroundColor: color.hex }}
                              />
                              {color.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* License Plate with Scan Button and Nationality */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.licensePlate', 'License Plate')} *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="ABC-1234"
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white uppercase"
                          data-testid="input-license-plate"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openScanDialog('license')}
                        className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10 px-3"
                        data-testid="button-scan-license"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nationality Dropdown - bound to form */}
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.nationality', 'Nationality')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-nationality">
                          <SelectValue placeholder={t('vehicles.selectNationality', 'Select nationality')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-h-[300px]">
                        <ScrollArea className="h-[280px]">
                          {nationalities.map((nat) => (
                            <SelectItem key={nat.id} value={nat.name}>
                              {nat.name}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mileage */}
            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.mileage', 'Mileage')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="50000"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      value={field.value || 0}
                      className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                      data-testid="input-mileage"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Engine Type and Transmission Dropdowns - stores names for consistency */}
            <div className="grid grid-cols-2 gap-4">
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
                        {engineTypes.map((engine) => (
                          <SelectItem key={engine.id} value={engine.name}>
                            {engine.name}
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
                        {transmissionTypes.map((trans) => (
                          <SelectItem key={trans.id} value={trans.name}>
                            {trans.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Owner ID Number with Scan Button */}
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.idNum', 'ID Number')}</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('vehicles.enterIdNum', 'Enter ID number')}
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                    data-testid="input-id-num"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openScanDialog('id')}
                    className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10 px-3"
                    data-testid="button-scan-id"
                  >
                    <ScanLine className="w-4 h-4" />
                  </Button>
                </div>
              </FormItem>

              <FormItem>
                <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.driverLicense', 'Driver License')}</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('vehicles.enterDriverLicense', 'Enter license number')}
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                    data-testid="input-driver-license"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openScanDialog('driverLicense')}
                    className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10 px-3"
                    data-testid="button-scan-driver-license"
                  >
                    <CreditCard className="w-4 h-4" />
                  </Button>
                </div>
              </FormItem>
            </div>

            {/* Document Attachments Section */}
            <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
              <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('vehicles.documentAttachments', 'Document Attachments')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] hover:bg-[#0A5ED7]/10 hover:text-[#0A5ED7] hover:border-[#0A5ED7]"
                  data-testid="button-attach-vehicle-registration"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('vehicles.vehicleRegistration', 'Vehicle Registration')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] hover:bg-[#0A5ED7]/10 hover:text-[#0A5ED7] hover:border-[#0A5ED7]"
                  data-testid="button-attach-insurance"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('vehicles.insuranceDoc', 'Insurance Document')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] hover:bg-[#0A5ED7]/10 hover:text-[#0A5ED7] hover:border-[#0A5ED7]"
                  data-testid="button-attach-id-photo"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {t('vehicles.idPhoto', 'ID Photo')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] hover:bg-[#0A5ED7]/10 hover:text-[#0A5ED7] hover:border-[#0A5ED7]"
                  data-testid="button-attach-vehicle-photo"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {t('vehicles.vehiclePhotos', 'Vehicle Photos')}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                data-testid="input-file-upload"
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('vehicles.additionalNotes', 'Additional notes...')}
                      value={field.value || ""}
                      className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
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
                className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                data-testid="button-cancel"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a0e6] text-white"
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
    >
        {actionButtons}
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#0A5ED7]/30 border-t-[#0A5ED7] rounded-full animate-spin"></div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title={t('vehicles.title', 'Vehicles')}
      description={t('vehicles.description', 'Manage customer vehicles and service history')}
      icon={Car}
    >
      {actionButtons}
      <div className="space-y-6 mt-6">
        <div className="relative max-w-md">
          <div className="relative bg-white dark:bg-[#0E1117] rounded-xl border border-[#E2E8F0] dark:border-[#232A36] shadow-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <Input
              type="text"
              placeholder={t('vehicles.searchVehicles', 'Search vehicles...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-transparent border-0 focus:ring-0 text-[#0B1F3B] dark:text-white"
              data-testid="input-search-vehicles"
            />
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
              <Car className="w-10 h-10 text-white" />
            </div>
            <p className="text-[#64748B]">
              {searchQuery ? t('vehicles.noVehiclesMatchingSearch', 'No vehicles found matching your search') : t('vehicles.noVehiclesYet', 'No vehicles added yet')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => {
              const customer = customers.find(c => c.id === vehicle.customerId);
              
              return (
                <div
                  key={vehicle.id}
                  className="group relative"
                  data-testid={`card-vehicle-${vehicle.id}`}
                >
                  <div className="relative bg-white dark:bg-[#151A23] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#232A36] shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0A5ED7]/10 rounded-xl flex items-center justify-center">
                          <Car className="w-6 h-6 text-[#0A5ED7]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#0B1F3B] dark:text-white">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-[#64748B]">
                            {vehicle.year}
                          </p>
                        </div>
                      </div>
                      {vehicle.isActive && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">{t('common.active', 'Active')}</Badge>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-[#64748B]">{t('vehicles.owner', 'Owner')}:</span>
                        <span className="text-sm text-[#0B1F3B] dark:text-white">
                          {customer?.fullName || t('common.unknown', 'Unknown')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[#64748B]">{t('vehicles.license', 'License')}:</span>
                        <span className="text-sm text-[#0B1F3B] dark:text-white font-medium">
                          {vehicle.licensePlate}
                        </span>
                      </div>
                      {vehicle.vin && (
                        <div className="flex justify-between">
                          <span className="text-sm text-[#64748B]">{t('vehicles.vin', 'VIN')}:</span>
                          <span className="text-sm text-[#0B1F3B] dark:text-white truncate max-w-[150px]">
                            {vehicle.vin}
                          </span>
                        </div>
                      )}
                      {vehicle.mileage && vehicle.mileage > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-[#64748B]">{t('vehicles.mileage', 'Mileage')}:</span>
                          <span className="text-sm text-[#0B1F3B] dark:text-white">
                            {vehicle.mileage.toLocaleString()} km
                          </span>
                        </div>
                      )}
                      {vehicle.engineType && (
                        <div className="flex justify-between">
                          <span className="text-sm text-[#64748B]">{t('vehicles.engine', 'Engine')}:</span>
                          <span className="text-sm text-[#0B1F3B] dark:text-white capitalize">
                            {vehicle.engineType}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(vehicle)}
                        className="flex-1 border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                        data-testid={`button-edit-vehicle-${vehicle.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {t('common.edit', 'Edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(vehicle.id)}
                        className="flex-1 border-[#F97316] text-[#F97316] hover:bg-[#F97316]/10"
                        data-testid={`button-delete-vehicle-${vehicle.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {t('common.delete', 'Delete')}
                      </Button>
                    </div>
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
