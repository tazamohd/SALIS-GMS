import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Warehouse, Car, MapPin, Calendar } from "lucide-react";

const facilitySchema = z.object({
  facilityName: z.string().min(1, "Facility name is required"),
  address: z.string().min(1, "Address is required"),
  totalSpaces: z.number().min(1, "Total spaces must be at least 1"),
  availableSpaces: z.number().min(0),
  monthlyRate: z.number().min(0),
  securityFeatures: z.array(z.string()).optional(),
  operatingHours: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
});

const assignmentSchema = z.object({
  facilityId: z.string().min(1, "Facility is required"),
  vehicleId: z.string().optional(),
  spaceNumber: z.string().min(1, "Space number is required"),
  startDate: z.string(),
  endDate: z.string().optional(),
  monthlyRate: z.number().min(0),
  status: z.enum(["active", "ended", "reserved"]).default("active"),
  notes: z.string().optional(),
});

type FacilityFormData = z.infer<typeof facilitySchema>;
type AssignmentFormData = z.infer<typeof assignmentSchema>;

export default function VehicleStorage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("facilities");
  const [isFacilityDialogOpen, setIsFacilityDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

  const { data: facilities = [], isLoading: facilitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/storage-facilities"],
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<any[]>({
    queryKey: ["/api/vehicle-storage-assignments"],
  });

  const facilityForm = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      facilityName: "",
      address: "",
      totalSpaces: 0,
      availableSpaces: 0,
      monthlyRate: 0,
      securityFeatures: [],
      operatingHours: "",
      contactPerson: "",
      phone: "",
    }
  });

  const assignmentForm = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      facilityId: "",
      vehicleId: "",
      spaceNumber: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      monthlyRate: 0,
      status: "active",
      notes: "",
    }
  });

  const createFacilityMutation = useMutation({
    mutationFn: (data: FacilityFormData) => apiRequest("POST", "/api/storage-facilities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage-facilities"] });
      toast({ title: "Success", description: "Storage facility created" });
      setIsFacilityDialogOpen(false);
      facilityForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create facility", variant: "destructive" });
    }
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data: AssignmentFormData) => apiRequest("POST", "/api/vehicle-storage-assignments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-storage-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage-facilities"] });
      toast({ title: "Success", description: "Vehicle assigned to storage" });
      setIsAssignmentDialogOpen(false);
      assignmentForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create assignment", variant: "destructive" });
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6 bg-white dark:bg-[#010101] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-montserrat font-semibold text-salis-black dark:text-white" data-testid="heading-storage">
            Vehicle Storage Management
          </h1>
          <p className="text-salis-gray dark:text-salis-gray-light font-poppins mt-1" data-testid="text-subtitle">
            Manage storage facilities and vehicle assignments
          </p>
        </div>
        <Button
          onClick={() => setIsFacilityDialogOpen(true)}
          className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
          data-testid="button-create-facility"
        >
          <Warehouse className="mr-2 h-4 w-4" />
          Add Facility
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="bg-salis-gray-light dark:bg-salis-gray-dark" data-testid="tabs-storage">
          <TabsTrigger value="facilities" className="font-poppins" data-testid="tab-facilities">
            <Warehouse className="mr-2 h-4 w-4" />
            Facilities
          </TabsTrigger>
          <TabsTrigger value="assignments" className="font-poppins" data-testid="tab-assignments">
            <Car className="mr-2 h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facilities" className="space-y-4">
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Storage Facilities</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                Manage storage facilities and capacity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {facilitiesLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading">Loading facilities...</p>
              ) : facilities.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-facilities">No storage facilities found</p>
              ) : (
                <div className="grid gap-4">
                  {facilities.map((facility: any) => (
                    <Card key={facility.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-facility-${facility.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white mb-2" data-testid={`text-facility-name-${facility.id}`}>
                              {facility.facilityName}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-salis-gray dark:text-salis-gray-light font-poppins flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {facility.address}
                                </p>
                                <p className="text-salis-gray dark:text-salis-gray-light font-poppins mt-1" data-testid={`text-contact-${facility.id}`}>
                                  Contact: {facility.contactPerson || "N/A"}
                                </p>
                                {facility.phone && (
                                  <p className="text-salis-gray dark:text-salis-gray-light font-poppins" data-testid={`text-phone-${facility.id}`}>
                                    Phone: {facility.phone}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-salis-gray dark:text-salis-gray-light font-poppins">Capacity</p>
                                <p className="text-lg font-semibold text-salis-black dark:text-white" data-testid={`text-capacity-${facility.id}`}>
                                  {facility.availableSpaces} / {facility.totalSpaces} available
                                </p>
                                <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mt-1" data-testid={`text-rate-${facility.id}`}>
                                  ${facility.monthlyRate.toFixed(2)}/month
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsAssignmentDialogOpen(true)}
              className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
              data-testid="button-create-assignment"
            >
              <Car className="mr-2 h-4 w-4" />
              Assign Vehicle
            </Button>
          </div>
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Vehicle Assignments</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                Active and past vehicle storage assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading-assignments">Loading assignments...</p>
              ) : assignments.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-assignments">No vehicle assignments found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Space Number</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Monthly Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment: any) => (
                      <TableRow key={assignment.id} data-testid={`row-assignment-${assignment.id}`}>
                        <TableCell className="font-medium" data-testid={`text-space-${assignment.id}`}>{assignment.spaceNumber}</TableCell>
                        <TableCell data-testid={`text-vehicle-${assignment.id}`}>{assignment.vehicleId || "N/A"}</TableCell>
                        <TableCell data-testid={`text-start-${assignment.id}`}>
                          {new Date(assignment.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell data-testid={`text-end-${assignment.id}`}>
                          {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : "Ongoing"}
                        </TableCell>
                        <TableCell data-testid={`text-monthly-rate-${assignment.id}`}>${assignment.monthlyRate.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={assignment.status === "active" ? "bg-green-500 text-white" : "bg-salis-gray text-white"} data-testid={`badge-status-${assignment.id}`}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFacilityDialogOpen} onOpenChange={setIsFacilityDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Add Storage Facility</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Create a new storage facility
            </DialogDescription>
          </DialogHeader>
          <Form {...facilityForm}>
            <form onSubmit={facilityForm.handleSubmit((data) => createFacilityMutation.mutate(data))} className="space-y-4">
              <FormField
                control={facilityForm.control}
                name="facilityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Downtown Storage" data-testid="input-facility-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={facilityForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Storage St, City, State" data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={facilityForm.control}
                  name="totalSpaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Spaces</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-total-spaces"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={facilityForm.control}
                  name="availableSpaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Spaces</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-available-spaces"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={facilityForm.control}
                name="monthlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rate</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-monthly-rate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={facilityForm.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" data-testid="input-contact-person" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={facilityForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 123-4567" data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createFacilityMutation.isPending} data-testid="button-submit-facility">
                  {createFacilityMutation.isPending ? "Creating..." : "Create Facility"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Assign Vehicle to Storage</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Create a new storage assignment
            </DialogDescription>
          </DialogHeader>
          <Form {...assignmentForm}>
            <form onSubmit={assignmentForm.handleSubmit((data) => createAssignmentMutation.mutate(data))} className="space-y-4">
              <FormField
                control={assignmentForm.control}
                name="facilityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-facility">
                          <SelectValue placeholder="Select facility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {facilities.map((facility: any) => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.facilityName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={assignmentForm.control}
                name="spaceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Space Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="A-101" data-testid="input-space-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={assignmentForm.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle ID (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Vehicle identifier" data-testid="input-vehicle-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={assignmentForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={assignmentForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={assignmentForm.control}
                name="monthlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rate</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-assignment-rate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={assignmentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional information..." data-testid="input-assignment-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createAssignmentMutation.isPending} data-testid="button-submit-assignment">
                  {createAssignmentMutation.isPending ? "Creating..." : "Create Assignment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
