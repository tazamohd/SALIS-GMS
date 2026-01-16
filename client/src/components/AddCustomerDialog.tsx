import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Garage } from "@shared/schema";

const customerFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  garageId: z.string().min(1, "Please select a garage"),
  nationalId: z.string().optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  preferredLanguage: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface AddCustomerDialogProps {
  defaultGarageId?: string;
}

export function AddCustomerDialog({ defaultGarageId }: AddCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ["/api/garages"],
  });

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      fullName: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      garageId: defaultGarageId || "",
      nationalId: "",
      address: "",
      nationality: "",
      preferredLanguage: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      return await apiRequest("POST", "/api/customers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Customer Created",
        description: "New customer has been added successfully",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerFormValues) => {
    createCustomerMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-customer">
          <UserPlus className="w-4 h-4 mr-2" />
          {t('customers.addCustomer', 'Add Customer')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-add-customer">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl">
            {t('customers.addNewCustomer', 'Add New Customer')}
          </DialogTitle>
          <DialogDescription>
            {t('customers.createCustomerDescription', 'Create a new customer profile for your garage')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.fullName', 'Full Name')} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('customers.enterCustomerName', 'Enter customer name')}
                      {...field}
                      data-testid="input-customer-name"
                    />
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
                  <FormLabel>{t('customers.emailAddress', 'Email Address')} *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      {...field}
                      data-testid="input-customer-email"
                    />
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
                  <FormLabel>{t('customers.phoneNumber', 'Phone Number')}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+966 5XX XXX XXXX"
                      {...field}
                      data-testid="input-customer-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="garageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.garage', 'Garage')} *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-customer-garage">
                        <SelectValue placeholder={t('customers.selectGarage', 'Select a garage')} />
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

            <Collapsible open={showOptional} onOpenChange={setShowOptional}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full flex items-center justify-between text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                  data-testid="button-toggle-optional"
                >
                  <span>{t('customers.optionalDetails', 'Optional Details')}</span>
                  {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('customers.firstName', 'First Name')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('customers.firstName', 'First name')}
                            {...field}
                            data-testid="input-customer-first-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('customers.lastName', 'Last Name')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('customers.lastName', 'Last name')}
                            {...field}
                            data-testid="input-customer-last-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('customers.nationalId', 'National ID')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customers.enterNationalId', 'Enter national ID')}
                          {...field}
                          data-testid="input-customer-national-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('customers.address', 'Address')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customers.enterAddress', 'Enter address')}
                          {...field}
                          data-testid="input-customer-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('customers.nationality', 'Nationality')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('customers.nationalityPlaceholder', 'e.g. Saudi Arabia')}
                            {...field}
                            data-testid="input-customer-nationality"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferredLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('customers.preferredLanguage', 'Preferred Language')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-customer-language">
                              <SelectValue placeholder={t('customers.selectLanguage', 'Select language')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ar">{t('languages.arabic', 'Arabic')}</SelectItem>
                            <SelectItem value="en">{t('languages.english', 'English')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-customer"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createCustomerMutation.isPending}
                data-testid="button-submit-customer"
              >
                {createCustomerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.creating', 'Creating...')}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('customers.createCustomer', 'Create Customer')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
