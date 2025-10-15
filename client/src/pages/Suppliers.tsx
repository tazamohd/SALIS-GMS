import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Mail, Phone, MapPin, Trash2, Search } from "lucide-react";
import type { Supplier, InsertSupplier } from "@shared/schema";
import { insertSupplierSchema } from "@shared/schema";

export default function Suppliers() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: suppliers = [], isLoading, error } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      garageId: "d290f1ee-6c54-4b01-90e6-d701748f0851",
      name: "",
      contactPerson: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
      city: undefined,
      country: undefined,
      taxId: undefined,
      paymentTerms: "net30",
      notes: undefined,
      isActive: true,
    },
  });

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = searchQuery === "" ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const createSupplier = async (data: InsertSupplier) => {
    try {
      await apiRequest("POST", "/api/suppliers", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Supplier created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create supplier",
        variant: "destructive",
      });
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/suppliers/${id}`);
      
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setIsDetailsOpen(false);
      setSelectedSupplier(null);
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier network</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-supplier">
              <Plus className="mr-2 h-4 w-4" /> Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Supplier</DialogTitle>
              <DialogDescription>Add a new supplier to your network</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(createSupplier)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Supplier Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABC Auto Parts" data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="John Doe" data-testid="input-contact-person" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} type="email" placeholder="contact@supplier.com" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="+1 234 567 8900" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="TAX123456" data-testid="input-tax-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ""} placeholder="123 Main Street" rows={2} data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="New York" data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="USA" data-testid="input-country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Payment Terms</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-payment-terms">
                              <SelectValue placeholder="Select payment terms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="net30">Net 30</SelectItem>
                            <SelectItem value="net60">Net 60</SelectItem>
                            <SelectItem value="cod">Cash on Delivery</SelectItem>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="advance">Advance Payment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ""} placeholder="Additional information" rows={3} data-testid="input-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="button-submit">Create Supplier</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, contact person, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium mb-2">Failed to load suppliers</p>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] })} data-testid="button-retry">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse" data-testid={`skeleton-card-${i}`}>
              <CardHeader className="pb-3">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No suppliers found</p>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search" : "Get started by creating your first supplier"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first">
                <Plus className="mr-2 h-4 w-4" /> Add Supplier
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleViewDetails(supplier)}
              data-testid={`card-supplier-${supplier.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`text-name-${supplier.id}`}>
                      {supplier.name}
                    </CardTitle>
                    {supplier.contactPerson && (
                      <CardDescription data-testid={`text-contact-${supplier.id}`}>
                        {supplier.contactPerson}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={supplier.isActive ? "default" : "secondary"} data-testid={`badge-status-${supplier.id}`}>
                    {supplier.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {supplier.email && (
                  <div className="flex items-center text-sm text-muted-foreground" data-testid={`text-email-${supplier.id}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {supplier.email}
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center text-sm text-muted-foreground" data-testid={`text-phone-${supplier.id}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {supplier.phone}
                  </div>
                )}
                {(supplier.city || supplier.country) && (
                  <div className="flex items-center text-sm text-muted-foreground" data-testid={`text-location-${supplier.id}`}>
                    <MapPin className="mr-2 h-4 w-4" />
                    {[supplier.city, supplier.country].filter(Boolean).join(", ")}
                  </div>
                )}
                {supplier.paymentTerms && (
                  <div className="mt-3">
                    <Badge variant="outline" data-testid={`badge-payment-${supplier.id}`}>
                      {supplier.paymentTerms.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
            <DialogDescription>View supplier information</DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supplier Name</p>
                  <p className="text-base" data-testid="detail-name">{selectedSupplier.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={selectedSupplier.isActive ? "default" : "secondary"} data-testid="detail-status">
                    {selectedSupplier.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {selectedSupplier.contactPerson && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                    <p className="text-base" data-testid="detail-contact-person">{selectedSupplier.contactPerson}</p>
                  </div>
                )}
                {selectedSupplier.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base" data-testid="detail-email">{selectedSupplier.email}</p>
                  </div>
                )}
                {selectedSupplier.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-base" data-testid="detail-phone">{selectedSupplier.phone}</p>
                  </div>
                )}
                {selectedSupplier.taxId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tax ID</p>
                    <p className="text-base" data-testid="detail-tax-id">{selectedSupplier.taxId}</p>
                  </div>
                )}
                {selectedSupplier.address && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-base" data-testid="detail-address">{selectedSupplier.address}</p>
                  </div>
                )}
                {selectedSupplier.city && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <p className="text-base" data-testid="detail-city">{selectedSupplier.city}</p>
                  </div>
                )}
                {selectedSupplier.country && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Country</p>
                    <p className="text-base" data-testid="detail-country">{selectedSupplier.country}</p>
                  </div>
                )}
                {selectedSupplier.paymentTerms && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Terms</p>
                    <p className="text-base" data-testid="detail-payment-terms">
                      {selectedSupplier.paymentTerms.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                  </div>
                )}
              </div>
              {selectedSupplier.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-base whitespace-pre-wrap" data-testid="detail-notes">{selectedSupplier.notes}</p>
                </div>
              )}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => deleteSupplier(selectedSupplier.id)}
                  data-testid="button-delete"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Supplier
                </Button>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)} data-testid="button-close">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
