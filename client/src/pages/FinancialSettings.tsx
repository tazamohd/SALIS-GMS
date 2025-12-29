import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Percent, DollarSign, CalendarIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const taxConfigSchema = z.object({
  garageId: z.string().min(1, "Garage is required"),
  taxName: z.string().min(1, "Tax name is required"),
  taxRate: z.string().min(1, "Tax rate is required"),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
});

type TaxConfigFormData = z.infer<typeof taxConfigSchema>;

const discountSchema = z.object({
  garageId: z.string().min(1, "Garage is required"),
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.string().min(1, "Value is required"),
  validFrom: z.date(),
  validTo: z.date(),
  minPurchaseAmount: z.string().optional(),
  maxDiscountAmount: z.string().optional(),
  usageLimit: z.string().optional(),
  customerSpecific: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type DiscountFormData = z.infer<typeof discountSchema>;

export default function FinancialSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");
  const [taxDialogOpen, setTaxDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<any | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<any | null>(null);

  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ["/api/garages"],
  });

  useEffect(() => {
    if (!selectedGarageId && garages.length > 0) {
      setSelectedGarageId(garages[0].id);
    }
  }, [garages, selectedGarageId]);

  const { data: taxConfigs = [], isLoading: taxLoading } = useQuery<any[]>({
    queryKey: ["/api/tax-configurations", { garageId: selectedGarageId }],
    enabled: !!selectedGarageId,
  });

  const { data: discounts = [], isLoading: discountsLoading } = useQuery<any[]>({
    queryKey: ["/api/discounts", { garageId: selectedGarageId }],
    enabled: !!selectedGarageId,
  });

  const taxForm = useForm<TaxConfigFormData>({
    resolver: zodResolver(taxConfigSchema),
    defaultValues: {
      garageId: selectedGarageId,
      taxName: "",
      taxRate: "",
      category: "",
      isActive: true,
    },
  });

  const discountForm = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      garageId: selectedGarageId,
      code: "",
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      minPurchaseAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      customerSpecific: false,
      isActive: true,
    },
  });

  const taxMutation = useMutation({
    mutationFn: async (data: TaxConfigFormData) => {
      if (editingTax) {
        return apiRequest("PATCH", `/api/tax-configurations/${editingTax.id}`, data);
      }
      return apiRequest("POST", "/api/tax-configurations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/tax-configurations')
      });
      toast({ title: editingTax ? t('financial.taxUpdated', 'Tax updated') : t('financial.taxCreated', 'Tax created successfully') });
      setTaxDialogOpen(false);
      setEditingTax(null);
      taxForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('financial.failedToSaveTax', 'Failed to save tax configuration'), variant: "destructive" });
    },
  });

  const deleteTaxMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/tax-configurations/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/tax-configurations')
      });
      toast({ title: t('financial.taxDeleted', 'Tax configuration deleted') });
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('financial.failedToDeleteTax', 'Failed to delete tax configuration'), variant: "destructive" });
    },
  });

  const discountMutation = useMutation({
    mutationFn: async (data: DiscountFormData) => {
      const payload = {
        ...data,
        discountValue: parseFloat(data.discountValue),
        minPurchaseAmount: data.minPurchaseAmount ? parseFloat(data.minPurchaseAmount) : null,
        maxDiscountAmount: data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
      };
      if (editingDiscount) {
        return apiRequest("PATCH", `/api/discounts/${editingDiscount.id}`, payload);
      }
      return apiRequest("POST", "/api/discounts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/discounts')
      });
      toast({ title: editingDiscount ? t('financial.discountUpdated', 'Discount updated') : t('financial.discountCreated', 'Discount created successfully') });
      setDiscountDialogOpen(false);
      setEditingDiscount(null);
      discountForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('financial.failedToSaveDiscount', 'Failed to save discount'), variant: "destructive" });
    },
  });

  const deleteDiscountMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/discounts/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/discounts')
      });
      toast({ title: t('financial.discountDeleted', 'Discount deleted') });
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('financial.failedToDeleteDiscount', 'Failed to delete discount'), variant: "destructive" });
    },
  });

  const handleEditTax = (tax: any) => {
    setEditingTax(tax);
    taxForm.reset({
      garageId: tax.garageId,
      taxName: tax.taxName,
      taxRate: tax.taxRate.toString(),
      category: tax.category || "",
      isActive: tax.isActive,
    });
    setTaxDialogOpen(true);
  };

  const handleEditDiscount = (discount: any) => {
    setEditingDiscount(discount);
    discountForm.reset({
      garageId: discount.garageId,
      code: discount.code,
      name: discount.name,
      description: discount.description || "",
      discountType: discount.discountType,
      discountValue: discount.discountValue.toString(),
      validFrom: new Date(discount.validFrom),
      validTo: new Date(discount.validTo),
      minPurchaseAmount: discount.minPurchaseAmount?.toString() || "",
      maxDiscountAmount: discount.maxDiscountAmount?.toString() || "",
      usageLimit: discount.usageLimit?.toString() || "",
      customerSpecific: discount.customerSpecific,
      isActive: discount.isActive,
    });
    setDiscountDialogOpen(true);
  };

  const garageSelector = (
    <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
      <SelectTrigger className="w-[200px]" data-testid="select-garage">
        <SelectValue placeholder={t('financial.selectGarage', 'Select garage')} />
      </SelectTrigger>
      <SelectContent>
        {garages.map((garage) => (
          <SelectItem key={garage.id} value={garage.id} data-testid={`select-garage-${garage.id}`}>
            {garage.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const taxesTabContent = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-gray-900 dark:text-white">{t('financial.taxConfigurations', 'Tax Configurations')}</CardTitle>
          <CardDescription className="text-gray-900 dark:text-white/60">{t('financial.taxConfigurationsDesc', 'Configure automatic tax calculations for your garage')}</CardDescription>
        </div>
        <Dialog open={taxDialogOpen} onOpenChange={setTaxDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingTax(null); taxForm.reset({ garageId: selectedGarageId }); }} data-testid="button-add-tax">
              <Plus className="h-4 w-4 mr-2" />
              {t('financial.addTax', 'Add Tax')}
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-tax-form">
            <DialogHeader>
              <DialogTitle>{editingTax ? t('financial.editTaxConfiguration', 'Edit Tax Configuration') : t('financial.addTaxConfiguration', 'Add Tax Configuration')}</DialogTitle>
              <DialogDescription>{t('financial.configureTaxRates', 'Configure tax rates for automatic calculation')}</DialogDescription>
            </DialogHeader>
            <Form {...taxForm}>
              <form onSubmit={taxForm.handleSubmit((data) => taxMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={taxForm.control}
                  name="taxName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('financial.taxName', 'Tax Name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('financial.taxNamePlaceholder', 'e.g., VAT, Sales Tax')} {...field} data-testid="input-tax-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taxForm.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('financial.taxRate', 'Tax Rate (%)')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder={t('financial.taxRatePlaceholder', 'e.g., 15')} {...field} data-testid="input-tax-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taxForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('financial.categoryOptional', 'Category (Optional)')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('financial.categoryPlaceholder', 'e.g., parts, labor')} {...field} data-testid="input-tax-category" />
                      </FormControl>
                      <FormDescription>{t('financial.leaveEmptyToApplyAll', 'Leave empty to apply to all categories')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taxForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{t('common.active', 'Active')}</FormLabel>
                        <FormDescription>{t('financial.enableTaxConfig', 'Enable this tax configuration')}</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-tax-active" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={taxMutation.isPending} data-testid="button-save-tax">
                    {taxMutation.isPending ? t('common.saving', 'Saving...') : editingTax ? t('common.update', 'Update') : t('common.create', 'Create')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {taxLoading ? (
          <div className="text-center py-8 text-gray-900 dark:text-white/60">{t('common.loading', 'Loading...')}</div>
        ) : taxConfigs.length === 0 ? (
          <div className="text-center py-8 text-gray-900 dark:text-white/60" data-testid="text-no-taxes">
            {t('financial.noTaxConfigurations', 'No tax configurations found. Add one to get started.')}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-salis-gray-dark">
              <TableRow className="border-b border-gray-200 dark:border-salis-gray-dark hover:bg-gray-100 dark:hover:bg-salis-gray-dark">
                <TableHead className="text-gray-900 dark:text-white">{t('financial.taxName', 'Tax Name')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('financial.rate', 'Rate')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('common.category', 'Category')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxConfigs.map((tax) => (
                <TableRow key={tax.id} data-testid={`row-tax-${tax.id}`}>
                  <TableCell className="font-medium" data-testid={`text-tax-name-${tax.id}`}>{tax.taxName}</TableCell>
                  <TableCell data-testid={`text-tax-rate-${tax.id}`}>{tax.taxRate}%</TableCell>
                  <TableCell data-testid={`text-tax-category-${tax.id}`}>{tax.category || t('common.all', 'All')}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">
                    <Badge variant={tax.isActive ? "default" : "secondary"} data-testid={`badge-tax-status-${tax.id}`}>
                      {tax.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-white">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditTax(tax)} data-testid={`button-edit-tax-${tax.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteTaxMutation.mutate(tax.id)} data-testid={`button-delete-tax-${tax.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const discountsTabContent = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-gray-900 dark:text-white">{t('financial.discountsPromotions', 'Discounts & Promotions')}</CardTitle>
          <CardDescription className="text-gray-900 dark:text-white/60">{t('financial.discountsPromotionsDesc', 'Create and manage discount codes and promotional campaigns')}</CardDescription>
        </div>
        <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingDiscount(null); discountForm.reset({ garageId: selectedGarageId }); }} data-testid="button-add-discount">
              <Plus className="h-4 w-4 mr-2" />
              {t('financial.addDiscount', 'Add Discount')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-discount-form">
                <DialogHeader>
                  <DialogTitle>{editingDiscount ? t('financial.editDiscount', 'Edit Discount') : t('financial.createDiscount', 'Create Discount')}</DialogTitle>
                  <DialogDescription>{t('financial.setupDiscountCodes', 'Set up discount codes and promotional offers')}</DialogDescription>
                </DialogHeader>
                <Form {...discountForm}>
                  <form onSubmit={discountForm.handleSubmit((data) => discountMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={discountForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('financial.discountCode', 'Discount Code')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('financial.discountCodePlaceholder', 'e.g., SUMMER2024')} {...field} data-testid="input-discount-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={discountForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('common.name', 'Name')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('financial.discountNamePlaceholder', 'e.g., Summer Sale')} {...field} data-testid="input-discount-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={discountForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.description', 'Description')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('financial.descriptionPlaceholder', 'Description...')} {...field} data-testid="input-discount-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={discountForm.control}
                        name="discountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('common.type', 'Type')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-discount-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="percentage" data-testid="select-discount-type-percentage">
                                  <div className="flex items-center gap-2">
                                    <Percent className="h-4 w-4" />
                                    {t('financial.percentage', 'Percentage')}
                                  </div>
                                </SelectItem>
                                <SelectItem value="fixed" data-testid="select-discount-type-fixed">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    {t('financial.fixedAmount', 'Fixed Amount')}
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={discountForm.control}
                        name="discountValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('financial.value', 'Value')}</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder={t('financial.valuePlaceholder', 'e.g., 10')} {...field} data-testid="input-discount-value" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={discountForm.control}
                        name="validFrom"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>{t('financial.validFrom', 'Valid From')}</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-gray-900 dark:text-white/60")} data-testid="button-discount-valid-from">
                                    {field.value ? format(field.value, "PPP") : <span>{t('financial.pickADate', 'Pick a date')}</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={discountForm.control}
                        name="validTo"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>{t('financial.validTo', 'Valid To')}</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-gray-900 dark:text-white/60")} data-testid="button-discount-valid-to">
                                    {field.value ? format(field.value, "PPP") : <span>{t('financial.pickADate', 'Pick a date')}</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={discountForm.control}
                        name="minPurchaseAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('financial.minPurchase', 'Min Purchase')}</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder={t('common.optional', 'Optional')} {...field} data-testid="input-discount-min-purchase" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={discountForm.control}
                        name="maxDiscountAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('financial.maxDiscount', 'Max Discount')}</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder={t('common.optional', 'Optional')} {...field} data-testid="input-discount-max-amount" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={discountForm.control}
                        name="usageLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('financial.usageLimit', 'Usage Limit')}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder={t('common.optional', 'Optional')} {...field} data-testid="input-discount-usage-limit" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-4">
                      <FormField
                        control={discountForm.control}
                        name="customerSpecific"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 flex-1">
                            <div className="space-y-0.5">
                              <FormLabel>{t('financial.customerSpecific', 'Customer Specific')}</FormLabel>
                              <FormDescription>{t('financial.restrictToCustomers', 'Restrict to specific customers')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-discount-customer-specific" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={discountForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 flex-1">
                            <div className="space-y-0.5">
                              <FormLabel>{t('common.active', 'Active')}</FormLabel>
                              <FormDescription>{t('financial.enableDiscount', 'Enable this discount')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-discount-active" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={discountMutation.isPending} data-testid="button-save-discount">
                        {discountMutation.isPending ? t('common.saving', 'Saving...') : editingDiscount ? t('common.update', 'Update') : t('common.create', 'Create')}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {discountsLoading ? (
              <div className="text-center py-8 text-gray-900 dark:text-white/60">{t('common.loading', 'Loading...')}</div>
            ) : discounts.length === 0 ? (
              <div className="text-center py-8 text-gray-900 dark:text-white/60" data-testid="text-no-discounts">
                {t('financial.noDiscounts', 'No discounts found. Create one to get started.')}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-salis-gray-dark">
                  <TableRow className="border-b border-gray-200 dark:border-salis-gray-dark hover:bg-gray-100 dark:hover:bg-salis-gray-dark">
                    <TableHead className="text-gray-900 dark:text-white">{t('financial.code', 'Code')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">{t('common.name', 'Name')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">{t('common.type', 'Type')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">{t('financial.value', 'Value')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">{t('financial.validPeriod', 'Valid Period')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">{t('common.status', 'Status')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">{t('common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((discount) => (
                    <TableRow key={discount.id} data-testid={`row-discount-${discount.id}`}>
                      <TableCell className="font-mono font-medium" data-testid={`text-discount-code-${discount.id}`}>
                        {discount.code}
                      </TableCell>
                      <TableCell data-testid={`text-discount-name-${discount.id}`}>{discount.name}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        <Badge variant="outline" data-testid={`badge-discount-type-${discount.id}`}>
                          {discount.discountType === "percentage" ? <Percent className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                          {discount.discountType === "percentage" ? t('financial.percentage', 'Percentage') : t('financial.fixedAmount', 'Fixed Amount')}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-discount-value-${discount.id}`}>
                        {discount.discountType === "percentage" ? `${discount.discountValue}%` : `$${discount.discountValue}`}
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`text-discount-period-${discount.id}`}>
                        {format(new Date(discount.validFrom), "MMM dd")} - {format(new Date(discount.validTo), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        <Badge variant={discount.isActive ? "default" : "secondary"} data-testid={`badge-discount-status-${discount.id}`}>
                          {discount.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditDiscount(discount)} data-testid={`button-edit-discount-${discount.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteDiscountMutation.mutate(discount.id)} data-testid={`button-delete-discount-${discount.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
    </CardContent>
  </Card>
);

  return (
    <TabsPageLayout
      title={t('financial.financialSettings', 'Financial Settings')}
      description={t('financial.financialSettingsDesc', 'Manage tax configurations, discounts, and promotions')}
      tabs={[
        {
          id: "taxes",
          label: t('financial.taxConfigurations', 'Tax Configurations'),
          content: taxesTabContent,
        },
        {
          id: "discounts",
          label: t('financial.discountsPromotions', 'Discounts & Promotions'),
          content: discountsTabContent,
        },
      ]}
      defaultTab="taxes"
      headerContent={garageSelector}
    />
  );
}
