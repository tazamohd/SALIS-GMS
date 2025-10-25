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
        title: editingLoanerId ? "Loaner Vehicle Updated" : "Loaner Vehicle Created",
        description: "Changes saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save loaner vehicle",
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
        title: editingReservationId ? "Reservation Updated" : "Reservation Created",
        description: "Changes saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save reservation",
        variant: "destructive",
      });
    },
  });

  const deleteLoanerMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/loaner-vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loaner-vehicles"] });
      toast({ title: "Loaner Vehicle Deleted", description: "Loaner vehicle removed successfully" });
    },
  });

  const deleteReservationMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/loaner-reservations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loaner-reservations"] });
      toast({ title: "Reservation Deleted", description: "Reservation removed successfully" });
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

  return (
    <div className="min-h-screen bg-salis-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Loaner Vehicle Management</h1>
            <p className="text-gray-400 mt-1">Manage loaner fleet and reservations</p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-salis-gray">
            <TabsTrigger value="fleet" data-testid="tab-fleet" className="data-[state=active]:bg-salis-blue">
              <Car className="w-4 h-4 mr-2" />
              Loaner Fleet
            </TabsTrigger>
            <TabsTrigger value="reservations" data-testid="tab-reservations" className="data-[state=active]:bg-salis-blue">
              <Key className="w-4 h-4 mr-2" />
              Reservations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fleet" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Loaner Fleet</h2>
              <Button
                onClick={() => {
                  setEditingLoanerId(null);
                  loanerForm.reset();
                  setIsLoanerDialogOpen(true);
                }}
                className="bg-salis-blue hover:bg-salis-blue/90"
                data-testid="button-create-loaner"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Loaner Vehicle
              </Button>
            </div>

            {loanersLoading ? (
              <div className="text-center py-8 text-gray-400">Loading loaner vehicles...</div>
            ) : loanerVehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No loaner vehicles found</div>
            ) : (
              <div className="border border-salis-gray-light rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-salis-gray border-b border-salis-gray-light">
                      <TableHead className="text-white">Loaner #</TableHead>
                      <TableHead className="text-white">Make/Model/Year</TableHead>
                      <TableHead className="text-white">License Plate</TableHead>
                      <TableHead className="text-white">Condition</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Daily Rate</TableHead>
                      <TableHead className="text-white">Deposit</TableHead>
                      <TableHead className="text-white">Last Service</TableHead>
                      <TableHead className="text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanerVehicles.map((loaner) => (
                      <TableRow
                        key={loaner.id}
                        data-testid={`row-loaner-${loaner.id}`}
                        className="hover:bg-salis-gray border-b border-salis-gray-light"
                      >
                        <TableCell>{loaner.loanerNumber ?? "N/A"}</TableCell>
                        <TableCell>
                          {loaner.make} {loaner.model} {loaner.year}
                        </TableCell>
                        <TableCell>{loaner.licensePlate ?? "N/A"}</TableCell>
                        <TableCell>
                          {getConditionBadge(loaner.condition ?? "good", loaner.id)}
                        </TableCell>
                        <TableCell>
                          {getLoanerStatusBadge(loaner.status ?? "available", loaner.id)}
                        </TableCell>
                        <TableCell>${loaner.dailyRate ?? "0.00"}</TableCell>
                        <TableCell>${loaner.depositAmount ?? "0.00"}</TableCell>
                        <TableCell>
                          {loaner.lastServiceDate
                            ? format(new Date(loaner.lastServiceDate), "MMM dd, yyyy")
                            : "N/A"}
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
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Reservations</h2>
              <Button
                onClick={() => {
                  setEditingReservationId(null);
                  reservationForm.reset();
                  setIsReservationDialogOpen(true);
                }}
                className="bg-salis-blue hover:bg-salis-blue/90"
                data-testid="button-create-reservation"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Reservation
              </Button>
            </div>

            {reservationsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading reservations...</div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No reservations found</div>
            ) : (
              <div className="border border-salis-gray-light rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-salis-gray border-b border-salis-gray-light">
                      <TableHead className="text-white">Reservation #</TableHead>
                      <TableHead className="text-white">Loaner Vehicle</TableHead>
                      <TableHead className="text-white">Customer</TableHead>
                      <TableHead className="text-white">Start Date</TableHead>
                      <TableHead className="text-white">End Date</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Deposit Paid</TableHead>
                      <TableHead className="text-white">Total Cost</TableHead>
                      <TableHead className="text-white">Damage Reported</TableHead>
                      <TableHead className="text-white">Actions</TableHead>
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
                          className="hover:bg-salis-gray border-b border-salis-gray-light"
                        >
                          <TableCell>{reservation.reservationNumber ?? "N/A"}</TableCell>
                          <TableCell>
                            {loaner ? `${loaner.make} ${loaner.model}` : "N/A"}
                          </TableCell>
                          <TableCell>{customer?.fullName ?? "N/A"}</TableCell>
                          <TableCell>
                            {reservation.startDate
                              ? format(new Date(reservation.startDate), "MMM dd, yyyy")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {reservation.endDate
                              ? format(new Date(reservation.endDate), "MMM dd, yyyy")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {getReservationStatusBadge(reservation.status ?? "reserved", reservation.id)}
                          </TableCell>
                          <TableCell>${reservation.depositPaid ?? "0.00"}</TableCell>
                          <TableCell>${reservation.totalCost ?? "0.00"}</TableCell>
                          <TableCell>
                            {reservation.damageReported ? (
                              <Badge variant="destructive">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
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
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isLoanerDialogOpen} onOpenChange={setIsLoanerDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-salis-gray text-white border-salis-gray-light">
          <DialogHeader>
            <DialogTitle>{editingLoanerId ? "Edit" : "Create"} Loaner Vehicle</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingLoanerId ? "Update loaner vehicle information" : "Add a new loaner vehicle to the fleet"}
            </DialogDescription>
          </DialogHeader>

          <Form {...loanerForm}>
            <form onSubmit={loanerForm.handleSubmit((data) => loanerMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={loanerForm.control}
                  name="loanerNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loaner Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Auto-generated if empty"
                          data-testid="input-loaner-number"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loanerForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status" className="bg-salis-black border-salis-gray-light text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-salis-gray text-white border-salis-gray-light">
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="on_loan">On Loan</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={loanerForm.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-make"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
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
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-model"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loanerForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          data-testid="input-year"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={loanerForm.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-license-plate"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loanerForm.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          maxLength={17}
                          data-testid="input-vin"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={loanerForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-color"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loanerForm.control}
                  name="currentMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Mileage</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          data-testid="input-current-mileage"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
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
                      <FormLabel>Daily Rate</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          step="0.01"
                          data-testid="input-daily-rate"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
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
                      <FormLabel>Deposit Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          step="0.01"
                          data-testid="input-deposit-amount"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={loanerForm.control}
                name="insuranceCoverage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Coverage</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        data-testid="textarea-insurance-coverage"
                        className="bg-salis-black border-salis-gray-light text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loanerForm.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-condition" className="bg-salis-black border-salis-gray-light text-white">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-salis-gray text-white border-salis-gray-light">
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={loanerForm.control}
                  name="lastServiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Service Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="date"
                          data-testid="input-last-service-date"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loanerForm.control}
                  name="nextServiceDue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Service Due (Mileage)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          data-testid="input-next-service-due"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={loanerForm.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features (JSON array or comma-separated)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder='["GPS", "Bluetooth"] or GPS, Bluetooth'
                        data-testid="textarea-features"
                        className="bg-salis-black border-salis-gray-light text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loanerForm.control}
                name="restrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restrictions</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        data-testid="textarea-restrictions"
                        className="bg-salis-black border-salis-gray-light text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loanerForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-is-active"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={loanerForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        data-testid="textarea-notes"
                        className="bg-salis-black border-salis-gray-light text-white"
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
                  onClick={() => setIsLoanerDialogOpen(false)}
                  className="border-salis-gray-light"
                  data-testid="button-cancel-loaner"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loanerMutation.isPending}
                  className="bg-salis-blue hover:bg-salis-blue/90"
                  data-testid="button-save-loaner"
                >
                  {loanerMutation.isPending ? "Saving..." : editingLoanerId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-salis-gray text-white border-salis-gray-light">
          <DialogHeader>
            <DialogTitle>{editingReservationId ? "Edit" : "Create"} Reservation</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingReservationId ? "Update reservation details" : "Create a new loaner reservation"}
            </DialogDescription>
          </DialogHeader>

          <Form {...reservationForm}>
            <form onSubmit={reservationForm.handleSubmit((data) => reservationMutation.mutate(data))} className="space-y-4">
              <FormField
                control={reservationForm.control}
                name="reservationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reservation Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Auto-generated if empty"
                        data-testid="input-reservation-number"
                        className="bg-salis-black border-salis-gray-light text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={reservationForm.control}
                  name="loanerVehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loaner Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-loaner-vehicle" className="bg-salis-black border-salis-gray-light text-white">
                            <SelectValue placeholder="Select loaner vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-salis-gray text-white border-salis-gray-light">
                          {loanerVehicles.map((loaner) => (
                            <SelectItem key={loaner.id} value={loaner.id}>
                              {loaner.make} {loaner.model} {loaner.year} - {loaner.loanerNumber ?? "No #"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={reservationForm.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-customer" className="bg-salis-black border-salis-gray-light text-white">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-salis-gray text-white border-salis-gray-light">
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.fullName ?? customer.email}
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
                control={reservationForm.control}
                name="jobCardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Card ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="UUID of related job card"
                        data-testid="input-job-card-id"
                        className="bg-salis-black border-salis-gray-light text-white"
                      />
                    </FormControl>
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
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="datetime-local"
                          data-testid="input-start-date"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
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
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="datetime-local"
                          data-testid="input-end-date"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={reservationForm.control}
                name="actualReturnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Return Date (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="datetime-local"
                        data-testid="input-actual-return-date"
                        className="bg-salis-black border-salis-gray-light text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={reservationForm.control}
                  name="startMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Mileage</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          data-testid="input-start-mileage"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={reservationForm.control}
                  name="endMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Mileage (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          data-testid="input-end-mileage"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={reservationForm.control}
                  name="startFuelLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Fuel Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-start-fuel-level" className="bg-salis-black border-salis-gray-light text-white">
                            <SelectValue placeholder="Select fuel level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-salis-gray text-white border-salis-gray-light">
                          <SelectItem value="empty">Empty</SelectItem>
                          <SelectItem value="quarter">Quarter</SelectItem>
                          <SelectItem value="half">Half</SelectItem>
                          <SelectItem value="three_quarters">Three Quarters</SelectItem>
                          <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={reservationForm.control}
                  name="endFuelLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Fuel Level (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-end-fuel-level" className="bg-salis-black border-salis-gray-light text-white">
                            <SelectValue placeholder="Select fuel level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-salis-gray text-white border-salis-gray-light">
                          <SelectItem value="empty">Empty</SelectItem>
                          <SelectItem value="quarter">Quarter</SelectItem>
                          <SelectItem value="half">Half</SelectItem>
                          <SelectItem value="three_quarters">Three Quarters</SelectItem>
                          <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={reservationForm.control}
                  name="depositPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Paid</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          step="0.01"
                          data-testid="input-deposit-paid"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={reservationForm.control}
                  name="depositRefunded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Refunded (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          step="0.01"
                          data-testid="input-deposit-refunded"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={reservationForm.control}
                  name="totalCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Cost</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          step="0.01"
                          data-testid="input-total-cost"
                          className="bg-salis-black border-salis-gray-light text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={reservationForm.control}
                name="damageReported"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-damage-reported"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Damage Reported</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {reservationForm.watch("damageReported") && (
                <>
                  <FormField
                    control={reservationForm.control}
                    name="damageDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Damage Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-damage-description"
                            className="bg-salis-black border-salis-gray-light text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={reservationForm.control}
                    name="damagePhotos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Damage Photos (JSON array URLs)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            placeholder='["https://example.com/photo1.jpg"] or comma-separated URLs'
                            data-testid="textarea-damage-photos"
                            className="bg-salis-black border-salis-gray-light text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={reservationForm.control}
                    name="damageCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Damage Charge (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            type="number"
                            step="0.01"
                            data-testid="input-damage-charge"
                            className="bg-salis-black border-salis-gray-light text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={reservationForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-reservation-status" className="bg-salis-black border-salis-gray-light text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-salis-gray text-white border-salis-gray-light">
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={reservationForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        data-testid="textarea-reservation-notes"
                        className="bg-salis-black border-salis-gray-light text-white"
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
                  onClick={() => setIsReservationDialogOpen(false)}
                  className="border-salis-gray-light"
                  data-testid="button-cancel-reservation"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={reservationMutation.isPending}
                  className="bg-salis-blue hover:bg-salis-blue/90"
                  data-testid="button-save-reservation"
                >
                  {reservationMutation.isPending ? "Saving..." : editingReservationId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
