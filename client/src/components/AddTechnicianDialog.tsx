import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { insertUserSchema, Garage } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { UserPlus } from "lucide-react";

const technicianFormSchema = insertUserSchema.extend({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  garageId: z.string().min(1, "Garage is required"),
});

type TechnicianFormValues = z.infer<typeof technicianFormSchema>;

interface AddTechnicianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garages: Garage[];
}

export default function AddTechnicianDialog({ open, onOpenChange, garages }: AddTechnicianDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<TechnicianFormValues>({
    resolver: zodResolver(technicianFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      garageId: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TechnicianFormValues) => {
      return apiRequest("POST", "/api/technicians", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/technicians' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/technicians'))
      });
      toast({
        title: "Success",
        description: "Technician created successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create technician",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TechnicianFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-add-technician">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">{t('technicians.addNewTechnician', 'Add New Technician')}</DialogTitle>
          <DialogDescription data-testid="text-dialog-subtitle">
            {t('technicians.createNewAccount', 'Create a new technician account')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('technicians.fullName', 'Full Name')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Technician" data-testid="input-fullname" />
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
                  <FormLabel>{t('technicians.email', 'Email')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="technician@garage.com" data-testid="input-email" />
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
                  <FormLabel>{t('technicians.phoneOptional', 'Phone (Optional)')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+1234567890" data-testid="input-phone" />
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
                  <FormLabel>{t('technicians.garage', 'Garage')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-garage">
                        <SelectValue placeholder={t('technicians.selectGarage', 'Select garage')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {garages.map((garage) => (
                        <SelectItem key={garage.id} value={garage.id} data-testid={`option-garage-${garage.id}`}>
                          {garage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                {createMutation.isPending ? t('common.creating', 'Creating...') : t('technicians.createTechnician', 'Create Technician')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
