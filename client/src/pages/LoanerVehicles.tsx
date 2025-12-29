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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Pencil,
  Trash2,
  Car,
  Key,
} from "lucide-react";
import { format } from "date-fns";
import {
  insertLoanerVehicleSchema,
  insertLoanerReservationSchema,
  type LoanerVehicle,
  type LoanerReservation,
  type User,
} from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { TabsPageLayout } from "@/components/layouts";

const loanerVehicleFormSchema = insertLoanerVehicleSchema.extend({
  year: z.string().min(1, "Year required").transform(val => parseInt(val)),
  currentMileage: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  dailyRate: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  depositAmount: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  nextServiceDue: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  lastServiceDate: z.string().optional(),
  features: z.string().optional().transform(val => {
    if (!val || val.trim() === "") return undefined;
    try {
      return JSON.parse(val);
    } catch {
      return val.split(",").map(s => s.trim()).filter(Boolean);
    }
  }),
});

const loanerReservationFormSchema = insertLoanerReservationSchema.extend({
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  actualReturnDate: z.string().optional(),
  startMileage: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  endMileage: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  depositPaid: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  depositRefunded: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  totalCost: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  damageCharge: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  damagePhotos: z.string().optional().transform(val => {
    if (!val || val.trim() === "") return undefined;
    try {
      return JSON.parse(val);
    } catch {
      return val.split(",").map(s => s.trim()).filter(Boolean);
    }
  }),
});

type LoanerVehicleFormData = z.input<typeof loanerVehicleFormSchema>;
type LoanerReservationFormData = z.input<typeof loanerReservationFormSchema>;

export default function LoanerVehicles() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("fleet");
  const [isLoanerDialogOpen, setIsLoanerDialogOpen] = useState(false);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [editingLoanerId, setEditingLoanerId] = useState<string | null>(null);
  const [editingReservationId, setEditingReservationId] = useState<string | null>(null);

  const { data: loanerVehicles = [], isLoading: loanersLoading } = useQuery<LoanerVehicle[]>({
    queryKey: ["/api/loaner-vehicles"],
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery<LoanerReservation[]>({
    queryKey: ["/api/loaner-reservations"],
  });

  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ["/api/customers"],
    enabled: isReservationDialogOpen,
  });

  const loanerForm = useForm<LoanerVehicleFormData>({
    resolver: zodResolver(loanerVehicleFormSchema),
    defaultValues: {
      garageId: (user as any)?.garageId || "",
      vehicleId: "",
      loanerNumber: "",
      make: "",
      model: "",
      year: "",
      licensePlate: "",
      vin: "",
      color: "",
      currentMileage: "",
      dailyRate: "",
      depositAmount: "",
      insuranceCoverage: "",
      status: "available",
      condition: "good",
      lastServiceDate: "",
      nextServiceDue: "",
      features: "",
      restrictions: "",
      isActive: true,
      notes: "",
    },
  });

  const reservationForm = useForm<LoanerReservationFormData>({
    resolver: zodResolver(loanerReservationFormSchema),
    defaultValues: {
      loanerVehicleId: "",
      customerId: "",
      jobCardId: "",
      reservationNumber: "",
      startDate: "",
      endDate: "",
      actualReturnDate: "",
      startMileage: "",
      endMileage: "",
      startFuelLevel: "",
      endFuelLevel: "",
      depositPaid: "",
      depositRefunded: "",
      totalCost: "",
      damageReported: false,
      damageDescription: "",
      damagePhotos: "",
      damageCharge: "",
      status: "reserved",
      notes: "",
    },
  });

  const loanerMutation = useMutation({
    mutationFn: async (data: LoanerVehicleFormData) => {
      const parsed = loanerVehicleFormSchema.parse(data);
      if (editingLoanerId) {
        return await apiRequest("PATCH", `/api/loaner-vehicles/${editingLoanerId}`, parsed);
      }
      return await apiRequest("POST", "/api/loaner-vehicles", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loaner-vehicles"] });
      setIsLoanerDialogOpen(false);
      setEditingLoanerId(null);
      loanerForm.reset();
      toast({
        title: editingLoanerId ? t('vehicles.loanerVehicleUpdated', 'Loaner Vehicle Updated') : t('vehicles.loanerVehicleCreated', 'Loaner Vehicle Created'),
        description: t('vehicles.changesSavedSuccessfully', 'Changes saved successfully'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('vehicles.failedToSaveLoanerVehicle', 'Failed to save loaner vehicle'),
        variant: "destructive",
      });
    },
  });

  const reservationMutation = useMutation({
    mutationFn: async (data: LoanerReservationFormData) => {
      const parsed = loanerReservationFormSchema.parse(data);
      if (editingReservationId) {
        return await apiRequest("PATCH", `/api/loaner-reservations/${editingReservationId}`, parsed);
      }
      return await apiRequest("POST", "/api/loaner-reservations", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loaner-reservations"] });
      setIsReservationDialogOpen(false);
      setEditingReservationId(null);
      reservationForm.reset();
      toast({
        title: editingReservationId ? t('vehicles.reservationUpdated', 'Reservation Updated') : t('vehicles.reservationCreated', 'Reservation Created'),
        description: t('vehicles.changesSavedSuccessfully', 'Changes saved successfully'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('vehicles.failedToSaveReservation', 'Failed to save reservation'),
        variant: "destructive",
      });
    },
  });

  const deleteLoanerMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/loaner-vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loaner-vehicles"] });
      toast({ title: t('vehicles.loanerVehicleDeleted', 'Loaner Vehicle Deleted'), description: t('vehicles.loanerVehicleRemovedSuccessfully', 'Loaner vehicle removed successfully') });
    },
  });

  const deleteReservationMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/loaner-reservations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loaner-reservations"] });
      toast({ title: t('vehicles.reservationDeleted', 'Reservation Deleted'), description: t('vehicles.reservationRemovedSuccessfully', 'Reservation removed successfully') });
    },
  });

  const handleEditLoaner = (loaner: LoanerVehicle) => {
    setEditingLoanerId(loaner.id);
    loanerForm.reset({
      garageId: loaner.garageId,
      vehicleId: loaner.vehicleId ?? "",
      loanerNumber: loaner.loanerNumber ?? "",
      make: loaner.make,
      model: loaner.model,
      year: loaner.year.toString(),
      licensePlate: loaner.licensePlate ?? "",
      vin: loaner.vin ?? "",
      color: loaner.color ?? "",
      currentMileage: loaner.currentMileage?.toString() ?? "",
      dailyRate: loaner.dailyRate ?? "",
      depositAmount: loaner.depositAmount ?? "",
      insuranceCoverage: loaner.insuranceCoverage ?? "",
      status: loaner.status ?? "available",
      condition: loaner.condition ?? "good",
      lastServiceDate: loaner.lastServiceDate ? format(new Date(loaner.lastServiceDate), "yyyy-MM-dd") : "",
      nextServiceDue: loaner.nextServiceDue?.toString() ?? "",
      features: loaner.features ? JSON.stringify(loaner.features) : "",
      restrictions: loaner.restrictions ?? "",
      isActive: loaner.isActive ?? true,
      notes: loaner.notes ?? "",
    });
    setIsLoanerDialogOpen(true);
  };

  const handleEditReservation = (reservation: LoanerReservation) => {
    setEditingReservationId(reservation.id);
    reservationForm.reset({
      loanerVehicleId: reservation.loanerVehicleId,
      customerId: reservation.customerId,
      jobCardId: reservation.jobCardId ?? "",
      reservationNumber: reservation.reservationNumber ?? "",
      startDate: reservation.startDate ? format(new Date(reservation.startDate), "yyyy-MM-dd'T'HH:mm") : "",
      endDate: reservation.endDate ? format(new Date(reservation.endDate), "yyyy-MM-dd'T'HH:mm") : "",
      actualReturnDate: reservation.actualReturnDate ? format(new Date(reservation.actualReturnDate), "yyyy-MM-dd'T'HH:mm") : "",
      startMileage: reservation.startMileage?.toString() ?? "",
      endMileage: reservation.endMileage?.toString() ?? "",
      startFuelLevel: reservation.startFuelLevel ?? "",
      endFuelLevel: reservation.endFuelLevel ?? "",
      depositPaid: reservation.depositPaid ?? "",
      depositRefunded: reservation.depositRefunded ?? "",
      totalCost: reservation.totalCost ?? "",
      damageReported: reservation.damageReported ?? false,
      damageDescription: reservation.damageDescription ?? "",
      damagePhotos: reservation.damagePhotos ? JSON.stringify(reservation.damagePhotos) : "",
      damageCharge: reservation.damageCharge ?? "",
      status: reservation.status ?? "reserved",
      notes: reservation.notes ?? "",
    });
    setIsReservationDialogOpen(true);
  };

  const getLoanerStatusBadge = (status: string, loanerId: string) => {
    const statusColors: Record<string, string> = {
      available: "bg-salis-black text-white dark:bg-white dark:text-salis-black",
      reserved: "bg-salis-50-black text-white",
      on_loan: "bg-salis-gray text-white",
      maintenance: "bg-salis-gray-light text-salis-black dark:bg-salis-gray-dark dark:text-white",
      retired: "bg-salis-gray-light text-salis-black dark:bg-salis-gray-dark dark:text-white",
    };
    
    return (
      <Badge className={statusColors[status] || "bg-salis-gray text-white"} data-testid={`badge-loaner-status-${loanerId}`}>
        {status}
      </Badge>
    );
  };

  const getConditionBadge = (condition: string, loanerId: string) => {
    const conditionColors: Record<string, string> = {
      excellent: "bg-salis-black text-white dark:bg-white dark:text-salis-black",
      good: "bg-salis-50-black text-white",
      fair: "bg-salis-gray text-white",
      poor: "bg-salis-gray-light text-salis-black dark:bg-salis-gray-dark dark:text-white",
    };
    
    return (
      <Badge className={conditionColors[condition] || "bg-salis-gray text-white"} data-testid={`badge-condition-${loanerId}`}>
        {condition}
      </Badge>
    );
  };

  const getReservationStatusBadge = (status: string, reservationId: string) => {
    const statusColors: Record<string, string> = {
      reserved: "bg-salis-50-black text-white",
      active: "bg-salis-gray text-white",
      returned: "bg-salis-black text-white dark:bg-white dark:text-salis-black",
      late: "bg-salis-gray text-white",
      cancelled: "bg-salis-gray-light text-salis-black dark:bg-salis-gray-dark dark:text-white",
    };
    
    return (
      <Badge className={statusColors[status] || "bg-salis-gray text-white"} data-testid={`badge-reservation-status-${reservationId}`}>
        {status}
      </Badge>
    );
  };

  const fleetContent = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingLoanerId(null);
            loanerForm.reset();
            setIsLoanerDialogOpen(true);
          }}
          className="bg-salis-blue hover:bg-salis-blue/90 dark:bg-salis-blue dark:hover:bg-salis-blue/90"
          data-testid="button-create-loaner"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('vehicles.addLoanerVehicle', 'Add Loaner Vehicle')}
        </Button>
      </div>

      {loanersLoading ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-400">{t('vehicles.loadingLoanerVehicles', 'Loading loaner vehicles...')}</div>
      ) : loanerVehicles.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-400">{t('vehicles.noLoanerVehiclesFound', 'No loaner vehicles found')}</div>
      ) : (
        <div className="border border-gray-200 dark:border-salis-gray-light rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-50 dark:hover:bg-salis-gray border-b border-gray-200 dark:border-salis-gray-light">
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.loanerNumber', 'Loaner #')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.makeModelYear', 'Make/Model/Year')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.licensePlate', 'License Plate')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.condition', 'Condition')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.dailyRate', 'Daily Rate')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.deposit', 'Deposit')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.lastService', 'Last Service')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanerVehicles.map((loaner) => (
                <TableRow
                  key={loaner.id}
                  data-testid={`row-loaner-${loaner.id}`}
                  className="hover:bg-gray-50 dark:hover:bg-salis-gray border-b border-gray-200 dark:border-salis-gray-light"
                >
                  <TableCell className="text-gray-900 dark:text-white">{loaner.loanerNumber ?? t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">
                    {loaner.make} {loaner.model} {loaner.year}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-white">{loaner.licensePlate ?? t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>
                    {getConditionBadge(loaner.condition ?? "good", loaner.id)}
                  </TableCell>
                  <TableCell>
                    {getLoanerStatusBadge(loaner.status ?? "available", loaner.id)}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-white">${loaner.dailyRate ?? "0.00"}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">${loaner.depositAmount ?? "0.00"}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">
                    {loaner.lastServiceDate
                      ? format(new Date(loaner.lastServiceDate), "MMM dd, yyyy")
                      : t('common.notAvailable', 'N/A')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLoaner(loaner)}
                        data-testid={`button-edit-loaner-${loaner.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLoanerMutation.mutate(loaner.id)}
                        data-testid={`button-delete-loaner-${loaner.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );

  const reservationsContent = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingReservationId(null);
            reservationForm.reset();
            setIsReservationDialogOpen(true);
          }}
          className="bg-salis-blue hover:bg-salis-blue/90 dark:bg-salis-blue dark:hover:bg-salis-blue/90"
          data-testid="button-create-reservation"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('vehicles.createReservation', 'Create Reservation')}
        </Button>
      </div>

      {reservationsLoading ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-400">{t('vehicles.loadingReservations', 'Loading reservations...')}</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-400">{t('vehicles.noReservationsFound', 'No reservations found')}</div>
      ) : (
        <div className="border border-gray-200 dark:border-salis-gray-light rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-50 dark:hover:bg-salis-gray border-b border-gray-200 dark:border-salis-gray-light">
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.reservationNumber', 'Reservation #')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.loanerVehicle', 'Loaner Vehicle')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.customer', 'Customer')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.startDate', 'Start Date')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.endDate', 'End Date')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.depositPaid', 'Deposit Paid')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.totalCost', 'Total Cost')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('vehicles.damageReported', 'Damage Reported')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => {
                const loaner = loanerVehicles.find(l => l.id === reservation.loanerVehicleId);
                const customer = customers.find(c => c.id === reservation.customerId);
                return (
                  <TableRow
                    key={reservation.id}
                    data-testid={`row-reservation-${reservation.id}`}
                    className="hover:bg-gray-50 dark:hover:bg-salis-gray border-b border-gray-200 dark:border-salis-gray-light"
                  >
                    <TableCell className="text-gray-900 dark:text-white">{reservation.reservationNumber ?? t('common.notAvailable', 'N/A')}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">
                      {loaner ? `${loaner.make} ${loaner.model}` : t('common.notAvailable', 'N/A')}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{customer?.fullName ?? t('common.notAvailable', 'N/A')}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">
                      {reservation.startDate
                        ? format(new Date(reservation.startDate), "MMM dd, yyyy")
                        : t('common.notAvailable', 'N/A')}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">
                      {reservation.endDate
                        ? format(new Date(reservation.endDate), "MMM dd, yyyy")
                        : t('common.notAvailable', 'N/A')}
                    </TableCell>
                    <TableCell>
                      {getReservationStatusBadge(reservation.status ?? "reserved", reservation.id)}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">${reservation.depositPaid ?? "0.00"}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">${reservation.totalCost ?? "0.00"}</TableCell>
                    <TableCell>
                      {reservation.damageReported ? (
                        <Badge variant="destructive">{t('common.yes', 'Yes')}</Badge>
                      ) : (
                        <Badge variant="outline">{t('common.no', 'No')}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReservation(reservation)}
                          data-testid={`button-edit-reservation-${reservation.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReservationMutation.mutate(reservation.id)}
                          data-testid={`button-delete-reservation-${reservation.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );

  return (
    <>
      <TabsPageLayout
        title={t('vehicles.loanerVehicleManagement', 'Loaner Vehicle Management')}
        description={t('vehicles.manageLoanerFleetAndReservations', 'Manage loaner fleet and reservations')}
        icon={Car}
        tabs={[
          {
            id: "fleet",
            label: t('vehicles.loanerFleet', 'Loaner Fleet'),
            icon: Car,
            content: fleetContent,
          },
          {
            id: "reservations",
            label: t('vehicles.reservations', 'Reservations'),
            icon: Key,
            content: reservationsContent,
          },
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <Dialog open={isLoanerDialogOpen} onOpenChange={setIsLoanerDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingLoanerId ? t('vehicles.editLoanerVehicle', 'Edit Loaner Vehicle') : t('vehicles.addLoanerVehicle', 'Add Loaner Vehicle')}
            </DialogTitle>
          </DialogHeader>
          <Form {...loanerForm}>
            <form onSubmit={loanerForm.handleSubmit((data) => loanerMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={loanerForm.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.make', 'Make')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-make" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loanerForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.model', 'Model')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={loanerForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.year', 'Year')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" data-testid="input-year" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loanerForm.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.licensePlate', 'License Plate')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} data-testid="input-license" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={loanerForm.control}
                  name="dailyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.dailyRate', 'Daily Rate')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" data-testid="input-daily-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loanerForm.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.depositAmount', 'Deposit Amount')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" data-testid="input-deposit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsLoanerDialogOpen(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={loanerMutation.isPending}>
                  {loanerMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingReservationId ? t('vehicles.editReservation', 'Edit Reservation') : t('vehicles.createReservation', 'Create Reservation')}
            </DialogTitle>
          </DialogHeader>
          <Form {...reservationForm}>
            <form onSubmit={reservationForm.handleSubmit((data) => reservationMutation.mutate(data))} className="space-y-4">
              <FormField
                control={reservationForm.control}
                name="loanerVehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.loanerVehicle', 'Loaner Vehicle')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-loaner">
                          <SelectValue placeholder={t('vehicles.selectLoanerVehicle', 'Select loaner vehicle')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loanerVehicles.map((loaner) => (
                          <SelectItem key={loaner.id} value={loaner.id}>
                            {loaner.make} {loaner.model} - {loaner.licensePlate}
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
                  control={reservationForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.startDate', 'Start Date')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="datetime-local" data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={reservationForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.endDate', 'End Date')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="datetime-local" data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReservationDialogOpen(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={reservationMutation.isPending}>
                  {reservationMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
