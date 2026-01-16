import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSupplierSchema, type InsertSupplier, type Garage } from "@shared/schema";

export function AddSupplierDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      garageId: "",
      name: "",
      paymentTerms: "net30",
      isActive: true,
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      return await apiRequest("POST", "/api/suppliers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/suppliers' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/suppliers'))
      });
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add supplier",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSupplier) => {
    createSupplierMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-add-supplier">
          <Plus className="w-4 h-4 mr-2" />
          {t('suppliers.addSupplier', 'Add Supplier')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('suppliers.addNewSupplier', 'Add New Supplier')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('suppliers.formDescription', 'Form to add a new supplier to the system')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="garageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('suppliers.garage', 'Garage')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-supplier-garage">
                        <SelectValue placeholder={t('suppliers.selectGarage', 'Select garage')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(garages ?? []).map((garage) => (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('suppliers.supplierName', 'Supplier Name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Auto Parts" {...field} data-testid="input-supplier-name" />
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
                    <FormLabel>{t('suppliers.contactPersonOptional', 'Contact Person (Optional)')}</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} value={field.value ?? ""} data-testid="input-contact-person" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('suppliers.emailOptional', 'Email (Optional)')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="supplier@example.com" {...field} value={field.value ?? ""} data-testid="input-supplier-email" />
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
                    <FormLabel>{t('suppliers.phoneOptional', 'Phone (Optional)')}</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 8900" {...field} value={field.value ?? ""} data-testid="input-supplier-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('suppliers.addressOptional', 'Address (Optional)')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Main St" {...field} value={field.value ?? ""} data-testid="textarea-supplier-address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('suppliers.cityOptional', 'City (Optional)')}</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} value={field.value ?? ""} data-testid="input-supplier-city" />
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
                    <FormLabel>{t('suppliers.countryOptional', 'Country (Optional)')}</FormLabel>
                    <FormControl>
                      <Input placeholder="USA" {...field} value={field.value ?? ""} data-testid="input-supplier-country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('suppliers.taxIdOptional', 'Tax ID (Optional)')}</FormLabel>
                    <FormControl>
                      <Input placeholder="123-45-6789" {...field} value={field.value ?? ""} data-testid="input-supplier-tax-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('suppliers.paymentTerms', 'Payment Terms')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "net30"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-payment-terms">
                          <SelectValue placeholder={t('suppliers.selectPaymentTerms', 'Select payment terms')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="net30">{t('suppliers.net30', 'Net 30')}</SelectItem>
                        <SelectItem value="net60">{t('suppliers.net60', 'Net 60')}</SelectItem>
                        <SelectItem value="cod">{t('suppliers.cod', 'COD (Cash on Delivery)')}</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <FormLabel>{t('suppliers.notesOptional', 'Notes (Optional)')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('suppliers.additionalNotes', 'Additional notes...')} {...field} value={field.value ?? ""} data-testid="textarea-supplier-notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-supplier"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createSupplierMutation.isPending}
                data-testid="button-submit-supplier"
              >
                {createSupplierMutation.isPending ? t('common.adding', 'Adding...') : t('suppliers.addSupplier', 'Add Supplier')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
