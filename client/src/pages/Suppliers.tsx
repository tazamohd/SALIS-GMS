import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
import { Plus, Building2, Mail, Phone, MapPin, Trash2, Search, Pencil } from "lucide-react";
import type { Supplier, InsertSupplier } from "@shared/schema";
import { insertSupplierSchema } from "@shared/schema";
import { StandardPageLayout } from "@/components/layouts";

export default function Suppliers() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
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
        title: t('common.success', 'Success'),
        description: t('inventory.supplierCreated', 'Supplier created successfully'),
      });
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: error instanceof Error ? error.message : t('inventory.failedToCreateSupplier', 'Failed to create supplier'),
        variant: "destructive",
      });
    }
  };

  const updateSupplier = async (data: InsertSupplier) => {
    if (!selectedSupplier) return;
    
    try {
      await apiRequest("PATCH", `/api/suppliers/${selectedSupplier.id}`, data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setIsEditOpen(false);
      setSelectedSupplier(null);
      form.reset();
      toast({
        title: t('common.success', 'Success'),
        description: t('inventory.supplierUpdated', 'Supplier updated successfully'),
      });
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: error instanceof Error ? error.message : t('inventory.failedToUpdateSupplier', 'Failed to update supplier'),
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
        title: t('common.success', 'Success'),
        description: t('inventory.supplierDeleted', 'Supplier deleted successfully'),
      });
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: error instanceof Error ? error.message : t('inventory.failedToDeleteSupplier', 'Failed to delete supplier'),
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailsOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    form.reset({
      garageId: supplier.garageId,
      name: supplier.name,
      contactPerson: supplier.contactPerson ?? undefined,
      email: supplier.email ?? undefined,
      phone: supplier.phone ?? undefined,
      address: supplier.address ?? undefined,
      city: supplier.city ?? undefined,
      country: supplier.country ?? undefined,
      taxId: supplier.taxId ?? undefined,
      paymentTerms: supplier.paymentTerms ?? "net30",
      notes: supplier.notes ?? undefined,
      isActive: supplier.isActive ?? true,
    });
    setIsDetailsOpen(false);
    setIsEditOpen(true);
  };

  return (
    <>
      <StandardPageLayout
        title={t('inventory.suppliers', 'Suppliers')}
        description={t('inventory.manageSupplierNetwork', 'Manage your supplier network')}
        icon={Building2}
        actions={[{
          label: t('inventory.addSupplier', 'Add Supplier'),
          onClick: () => setIsCreateOpen(true),
          icon: Plus,
          variant: 'default' as const,
        }]}
      >
        <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input
            placeholder={t('inventory.searchSuppliers', 'Search by name, contact person, or email...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
            data-testid="input-search"
          />
        </div>
      </div>

      {error ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-[#F97316] mb-4" />
            <p className="text-lg font-medium mb-2 text-[#0B1F3B] dark:text-white">{t('inventory.failedToLoadSuppliers', 'Failed to load suppliers')}</p>
            <p className="text-[#64748B] mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] })} 
              data-testid="button-retry"
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
            >
              {t('common.retry', 'Retry')}
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`skeleton-card-${i}`}>
              <CardHeader className="pb-3">
                <div className="h-6 bg-[#E2E8F0] dark:bg-[#232A36] rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-[#E2E8F0] dark:bg-[#232A36] rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 bg-[#E2E8F0] dark:bg-[#232A36] rounded w-20"></div>
                  <div className="h-6 bg-[#E2E8F0] dark:bg-[#232A36] rounded w-20"></div>
                </div>
                <div className="h-10 bg-[#E2E8F0] dark:bg-[#232A36] rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-[#64748B] mb-4" />
            <p className="text-lg font-medium mb-2 text-[#0B1F3B] dark:text-white">{t('inventory.noSuppliersFound', 'No suppliers found')}</p>
            <p className="text-[#64748B] mb-4">
              {searchQuery ? t('inventory.tryAdjustingSearch', 'Try adjusting your search') : t('inventory.getStartedAddingSupplier', 'Get started by creating your first supplier')}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setIsCreateOpen(true)} 
                data-testid="button-create-first"
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> {t('inventory.addSupplier', 'Add Supplier')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]"
              onClick={() => handleViewDetails(supplier)}
              data-testid={`card-supplier-${supplier.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-[#0B1F3B] dark:text-white" data-testid={`text-name-${supplier.id}`}>
                      {supplier.name}
                    </CardTitle>
                    {supplier.contactPerson && (
                      <CardDescription className="text-[#64748B]" data-testid={`text-contact-${supplier.id}`}>
                        {supplier.contactPerson}
                      </CardDescription>
                    )}
                  </div>
                  <Badge 
                    className={supplier.isActive 
                      ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" 
                      : "bg-[#64748B] text-white"
                    } 
                    data-testid={`badge-status-${supplier.id}`}
                  >
                    {supplier.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {supplier.email && (
                  <div className="flex items-center text-sm text-[#64748B]" data-testid={`text-email-${supplier.id}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {supplier.email}
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center text-sm text-[#64748B]" data-testid={`text-phone-${supplier.id}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {supplier.phone}
                  </div>
                )}
                {(supplier.city || supplier.country) && (
                  <div className="flex items-center text-sm text-[#64748B]" data-testid={`text-location-${supplier.id}`}>
                    <MapPin className="mr-2 h-4 w-4" />
                    {[supplier.city, supplier.country].filter(Boolean).join(", ")}
                  </div>
                )}
                {supplier.paymentTerms && (
                  <div className="mt-3">
                    <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid={`badge-payment-${supplier.id}`}>
                      {supplier.paymentTerms.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      </StandardPageLayout>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.createNewSupplier', 'Create New Supplier')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('inventory.addNewSupplierDesc', 'Add a new supplier to your network')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(createSupplier)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.supplierName', 'Supplier Name')} *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('inventory.supplierNamePlaceholder', 'ABC Auto Parts')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-name" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.contactPerson', 'Contact Person')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('inventory.contactPersonPlaceholder', 'John Doe')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-contact-person" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('auth.email', 'Email')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} type="email" placeholder={t('inventory.emailPlaceholder', 'contact@supplier.com')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-email" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.phone', 'Phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('inventory.phonePlaceholder', '+1 234 567 8900')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-phone" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.taxId', 'Tax ID')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('inventory.taxIdPlaceholder', 'TAX123456')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-tax-id" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.address', 'Address')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} placeholder={t('inventory.addressPlaceholder', '123 Main Street')} rows={2} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-address" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.city', 'City')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('inventory.cityPlaceholder', 'New York')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-city" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.country', 'Country')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('inventory.countryPlaceholder', 'USA')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-country" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.paymentTerms', 'Payment Terms')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-payment-terms">
                            <SelectValue placeholder={t('inventory.selectPaymentTerms', 'Select payment terms')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="net30">{t('inventory.net30', 'Net 30')}</SelectItem>
                          <SelectItem value="net60">{t('inventory.net60', 'Net 60')}</SelectItem>
                          <SelectItem value="cod">{t('inventory.cashOnDelivery', 'Cash on Delivery')}</SelectItem>
                          <SelectItem value="immediate">{t('inventory.immediate', 'Immediate')}</SelectItem>
                          <SelectItem value="advance">{t('inventory.advancePayment', 'Advance Payment')}</SelectItem>
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} placeholder={t('inventory.additionalInfo', 'Additional information')} rows={3} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="button-cancel">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-submit">{t('inventory.createSupplier', 'Create Supplier')}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.editSupplier', 'Edit Supplier')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('inventory.updateSupplierInfo', 'Update supplier information')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(updateSupplier)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.supplierName', 'Supplier Name')} *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('inventory.supplierNamePlaceholder', 'ABC Auto Parts')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-edit-name" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.contactPerson', 'Contact Person')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('inventory.contactPersonPlaceholder', 'John Doe')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-edit-contact-person" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('auth.email', 'Email')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} type="email" placeholder={t('inventory.emailPlaceholder', 'contact@supplier.com')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-edit-email" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.phone', 'Phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('inventory.phonePlaceholder', '+1 234 567 8900')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-edit-phone" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.taxId', 'Tax ID')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('inventory.taxIdPlaceholder', 'TAX123456')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-edit-tax-id" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.address', 'Address')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} placeholder={t('inventory.addressPlaceholder', '123 Main Street')} rows={2} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-edit-address" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.city', 'City')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('inventory.cityPlaceholder', 'New York')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-edit-city" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.country', 'Country')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('inventory.countryPlaceholder', 'USA')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-edit-country" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('inventory.paymentTerms', 'Payment Terms')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-edit-payment-terms">
                            <SelectValue placeholder={t('inventory.selectPaymentTerms', 'Select payment terms')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="net30">{t('inventory.net30', 'Net 30')}</SelectItem>
                          <SelectItem value="net60">{t('inventory.net60', 'Net 60')}</SelectItem>
                          <SelectItem value="cod">{t('inventory.cashOnDelivery', 'Cash on Delivery')}</SelectItem>
                          <SelectItem value="immediate">{t('inventory.immediate', 'Immediate')}</SelectItem>
                          <SelectItem value="advance">{t('inventory.advancePayment', 'Advance Payment')}</SelectItem>
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} placeholder={t('inventory.additionalInfo', 'Additional information')} rows={3} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-edit-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="button-edit-cancel">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-edit-submit">{t('inventory.updateSupplier', 'Update Supplier')}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{selectedSupplier?.name}</DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('inventory.supplierDetails', 'Supplier Details')}</DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-[#64748B]">{t('inventory.contactPerson', 'Contact Person')}</p>
                  <p className="text-[#0B1F3B] dark:text-white">{selectedSupplier.contactPerson || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#64748B]">{t('auth.email', 'Email')}</p>
                  <p className="text-[#0B1F3B] dark:text-white">{selectedSupplier.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#64748B]">{t('inventory.phone', 'Phone')}</p>
                  <p className="text-[#0B1F3B] dark:text-white">{selectedSupplier.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#64748B]">{t('inventory.taxId', 'Tax ID')}</p>
                  <p className="text-[#0B1F3B] dark:text-white">{selectedSupplier.taxId || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-[#64748B]">{t('inventory.address', 'Address')}</p>
                  <p className="text-[#0B1F3B] dark:text-white">{selectedSupplier.address || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#64748B]">{t('inventory.city', 'City')}</p>
                  <p className="text-[#0B1F3B] dark:text-white">{selectedSupplier.city || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#64748B]">{t('inventory.country', 'Country')}</p>
                  <p className="text-[#0B1F3B] dark:text-white">{selectedSupplier.country || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-[#64748B]">{t('inventory.paymentTerms', 'Payment Terms')}</p>
                  <p className="text-[#0B1F3B] dark:text-white">{selectedSupplier.paymentTerms || "-"}</p>
                </div>
                {selectedSupplier.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-[#64748B]">{t('common.notes', 'Notes')}</p>
                    <p className="text-[#0B1F3B] dark:text-white">{selectedSupplier.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleEdit(selectedSupplier)} className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="button-details-edit">
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('common.edit', 'Edit')}
                </Button>
                <Button variant="outline" onClick={() => deleteSupplier(selectedSupplier.id)} className="border-[#F97316] text-[#F97316] hover:bg-[#F97316]/10" data-testid="button-details-delete">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('common.delete', 'Delete')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
