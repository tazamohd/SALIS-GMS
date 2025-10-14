import { useState } from "react";
import { Users, Search, Car, Plus, Phone, Mail, MessageSquare, Building2, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AddVehicleDialog } from "@/components/AddVehicleDialog";
import { AddCustomerNoteDialog } from "@/components/AddCustomerNoteDialog";
import type { User, Vehicle, Garage, CustomerNote } from "@shared/schema";

export function Customers() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  // Build query params for customers endpoint
  const customersQueryParams = new URLSearchParams();
  if (selectedGarageId !== "all") {
    customersQueryParams.append("garage_id", selectedGarageId);
  }
  if (searchQuery) {
    customersQueryParams.append("search", searchQuery);
  }
  const customersUrl = `/api/customers${customersQueryParams.toString() ? `?${customersQueryParams.toString()}` : ''}`;

  const { data: customers, isLoading } = useQuery<User[]>({
    queryKey: [customersUrl],
    retry: false,
  });

  const { data: selectedCustomer } = useQuery<User>({
    queryKey: [`/api/customers/${selectedCustomerId}`],
    enabled: !!selectedCustomerId,
  });

  const { data: customerVehicles } = useQuery<Vehicle[]>({
    queryKey: [`/api/customers/${selectedCustomerId}/vehicles`],
    enabled: !!selectedCustomerId,
  });

  const { data: customerNotes } = useQuery<CustomerNote[]>({
    queryKey: [`/api/customers/${selectedCustomerId}/notes`],
    enabled: !!selectedCustomerId,
  });

  const { toast } = useToast();

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      return await apiRequest("DELETE", `/api/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${selectedCustomerId}/vehicles`] });
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return await apiRequest("DELETE", `/api/customer-notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${selectedCustomerId}/notes`] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = (customers ?? []).filter(customer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.fullName?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    );
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-[#222029]">
            Customer Management
          </h1>
          <p className="font-['Poppins',Helvetica] font-normal text-sm text-[#999999] mt-1">
            Manage customer profiles and vehicle information
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
            <SelectTrigger className="w-[200px]" data-testid="select-garage-filter">
              <Building2 className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Garages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Garages</SelectItem>
              {(garages ?? []).map((garage) => (
                <SelectItem key={garage.id} value={garage.id}>
                  {garage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-customers"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading customers...</div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No customers found</p>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCustomerId === customer.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      data-testid={`customer-item-${customer.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-['Poppins',Helvetica] font-semibold text-sm text-[#222029] truncate">
                            {customer.fullName || 'Unnamed Customer'}
                          </h3>
                          {customer.email && (
                            <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                          )}
                          {customer.phone && (
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        <div className="lg:col-span-2">
          {!selectedCustomerId ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-600 mb-2">
                  No Customer Selected
                </h3>
                <p className="text-sm text-gray-400">
                  Select a customer from the list to view their details
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Customer Info Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="font-['Poppins',Helvetica] font-bold text-2xl text-[#222029]">
                          {selectedCustomer?.fullName || 'Unnamed Customer'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Customer ID: {selectedCustomer?.id}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Customer managed via authentication
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCustomer?.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029]">
                            {selectedCustomer.email}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedCustomer?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029]">
                            {selectedCustomer.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vehicles Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#222029]">
                      Vehicles
                    </h3>
                    {selectedCustomer?.garageId && (
                      <AddVehicleDialog 
                        customerId={selectedCustomerId} 
                        garageId={selectedCustomer.garageId} 
                      />
                    )}
                  </div>

                  {(customerVehicles ?? []).length === 0 ? (
                    <div className="text-center py-8">
                      <Car className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No vehicles registered</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerVehicles?.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                          data-testid={`vehicle-item-${vehicle.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <Car className="w-5 h-5 text-gray-400 mt-1" />
                              <div className="flex-1">
                                <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                  <span>License: {vehicle.licensePlate}</span>
                                  {vehicle.color && <span>Color: {vehicle.color}</span>}
                                  {vehicle.mileage && <span>Mileage: {vehicle.mileage.toLocaleString()} km</span>}
                                </div>
                                {vehicle.engineType && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                                      {vehicle.engineType}
                                    </span>
                                    {vehicle.transmissionType && (
                                      <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                                        {vehicle.transmissionType}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteVehicleMutation.mutate(vehicle.id)}
                              data-testid={`button-delete-vehicle-${vehicle.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#222029]">
                      Notes & Communication
                    </h3>
                    <AddCustomerNoteDialog customerId={selectedCustomerId} />
                  </div>

                  {(customerNotes ?? []).length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No notes available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerNotes?.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                          data-testid={`note-item-${note.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {note.subject && (
                                <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-[#222029] mb-1">
                                  {note.subject}
                                </h4>
                              )}
                              <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                                  {note.noteType}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(note.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNoteMutation.mutate(note.id)}
                              data-testid={`button-delete-note-${note.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
