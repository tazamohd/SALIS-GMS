import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Tax Configuration Schema
const taxConfigSchema = z.object({
  garageId: z.string().min(1, "Garage is required"),
  taxName: z.string().min(1, "Tax name is required"),
  taxRate: z.string().min(1, "Tax rate is required"),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
});

type TaxConfigFormData = z.infer<typeof taxConfigSchema>;

// Discount/Promotion Schema
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
  const { toast } = useToast();
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");
  const [taxDialogOpen, setTaxDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<any | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<any | null>(null);

  // Fetch garages
  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ["/api/garages"],
  });

  // Set default garage
  useEffect(() => {
    if (!selectedGarageId && garages.length > 0) {
      setSelectedGarageId(garages[0].id);
    }
  }, [garages, selectedGarageId]);

  // Fetch tax configurations
  const { data: taxConfigs = [], isLoading: taxLoading } = useQuery<any[]>({
    queryKey: ["/api/tax-configurations", { garageId: selectedGarageId }],
    enabled: !!selectedGarageId,
  });

  // Fetch discounts
  const { data: discounts = [], isLoading: discountsLoading } = useQuery<any[]>({
    queryKey: ["/api/discounts", { garageId: selectedGarageId }],
    enabled: !!selectedGarageId,
  });

  // Tax form
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

  // Discount form
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

  // Create/Update Tax Config
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
      toast({ title: editingTax ? "Tax updated" : "Tax created successfully" });
      setTaxDialogOpen(false);
      setEditingTax(null);
      taxForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save tax configuration", variant: "destructive" });
    },
  });

  // Delete Tax Config
  const deleteTaxMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/tax-configurations/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/tax-configurations')
      });
      toast({ title: "Tax configuration deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete tax configuration", variant: "destructive" });
    },
  });

  // Create/Update Discount
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
      toast({ title: editingDiscount ? "Discount updated" : "Discount created successfully" });
      setDiscountDialogOpen(false);
      setEditingDiscount(null);
      discountForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save discount", variant: "destructive" });
    },
  });

  // Delete Discount
  const deleteDiscountMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/discounts/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/discounts')
      });
      toast({ title: "Discount deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete discount", variant: "destructive" });
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Financial Settings</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Manage tax configurations, discounts, and promotions
          </p>
        </div>
        <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
          <SelectTrigger className="w-[200px]" data-testid="select-garage">
            <SelectValue placeholder="Select garage" />
          </SelectTrigger>
          <SelectContent>
            {garages.map((garage) => (
              <SelectItem key={garage.id} value={garage.id} data-testid={`select-garage-${garage.id}`}>
                {garage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="taxes" className="space-y-4">
        <TabsList data-testid="tabs-financial-settings">
          <TabsTrigger value="taxes" data-testid="tab-taxes">Tax Configurations</TabsTrigger>
          <TabsTrigger value="discounts" data-testid="tab-discounts">Discounts & Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="taxes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tax Configurations</CardTitle>
                <CardDescription>Configure automatic tax calculations for your garage</CardDescription>
              </div>
              <Dialog open={taxDialogOpen} onOpenChange={setTaxDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingTax(null); taxForm.reset({ garageId: selectedGarageId }); }} data-testid="button-add-tax">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tax
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-tax-form">
                  <DialogHeader>
                    <DialogTitle>{editingTax ? "Edit Tax Configuration" : "Add Tax Configuration"}</DialogTitle>
                    <DialogDescription>Configure tax rates for automatic calculation</DialogDescription>
                  </DialogHeader>
                  <Form {...taxForm}>
                    <form onSubmit={taxForm.handleSubmit((data) => taxMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={taxForm.control}
                        name="taxName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., VAT, Sales Tax" {...field} data-testid="input-tax-name" />
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
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="e.g., 15" {...field} data-testid="input-tax-rate" />
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
                            <FormLabel>Category (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., parts, labor" {...field} data-testid="input-tax-category" />
                            </FormControl>
                            <FormDescription>Leave empty to apply to all categories</FormDescription>
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
                              <FormLabel>Active</FormLabel>
                              <FormDescription>Enable this tax configuration</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-tax-active" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={taxMutation.isPending} data-testid="button-save-tax">
                          {taxMutation.isPending ? "Saving..." : editingTax ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {taxLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : taxConfigs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-taxes">
                  No tax configurations found. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tax Name</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxConfigs.map((tax) => (
                      <TableRow key={tax.id} data-testid={`row-tax-${tax.id}`}>
                        <TableCell className="font-medium" data-testid={`text-tax-name-${tax.id}`}>{tax.taxName}</TableCell>
                        <TableCell data-testid={`text-tax-rate-${tax.id}`}>{tax.taxRate}%</TableCell>
                        <TableCell data-testid={`text-tax-category-${tax.id}`}>{tax.category || "All"}</TableCell>
                        <TableCell>
                          <Badge variant={tax.isActive ? "default" : "secondary"} data-testid={`badge-tax-status-${tax.id}`}>
                            {tax.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
        </TabsContent>

        <TabsContent value="discounts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Discounts & Promotions</CardTitle>
                <CardDescription>Create and manage discount codes and promotional campaigns</CardDescription>
              </div>
              <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingDiscount(null); discountForm.reset({ garageId: selectedGarageId }); }} data-testid="button-add-discount">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Discount
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-discount-form">
                  <DialogHeader>
                    <DialogTitle>{editingDiscount ? "Edit Discount" : "Create Discount"}</DialogTitle>
                    <DialogDescription>Set up discount codes and promotional offers</DialogDescription>
                  </DialogHeader>
                  <Form {...discountForm}>
                    <form onSubmit={discountForm.handleSubmit((data) => discountMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={discountForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Code</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., SUMMER2024" {...field} data-testid="input-discount-code" />
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
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Summer Sale" {...field} data-testid="input-discount-name" />
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Description..." {...field} data-testid="input-discount-description" />
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
                              <FormLabel>Type</FormLabel>
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
                                      Percentage
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="fixed" data-testid="select-discount-type-fixed">
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4" />
                                      Fixed Amount
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
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="e.g., 10" {...field} data-testid="input-discount-value" />
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
                              <FormLabel>Valid From</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} data-testid="button-discount-valid-from">
                                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                              <FormLabel>Valid To</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} data-testid="button-discount-valid-to">
                                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                              <FormLabel>Min Purchase</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="Optional" {...field} data-testid="input-discount-min-purchase" />
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
                              <FormLabel>Max Discount</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="Optional" {...field} data-testid="input-discount-max-amount" />
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
                              <FormLabel>Usage Limit</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Optional" {...field} data-testid="input-discount-usage-limit" />
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
                                <FormLabel>Customer Specific</FormLabel>
                                <FormDescription>Restrict to specific customers</FormDescription>
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
                                <FormLabel>Active</FormLabel>
                                <FormDescription>Enable this discount</FormDescription>
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
                          {discountMutation.isPending ? "Saving..." : editingDiscount ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {discountsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : discounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-discounts">
                  No discounts found. Create one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Valid Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((discount) => (
                      <TableRow key={discount.id} data-testid={`row-discount-${discount.id}`}>
                        <TableCell className="font-mono font-medium" data-testid={`text-discount-code-${discount.id}`}>
                          {discount.code}
                        </TableCell>
                        <TableCell data-testid={`text-discount-name-${discount.id}`}>{discount.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" data-testid={`badge-discount-type-${discount.id}`}>
                            {discount.discountType === "percentage" ? <Percent className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                            {discount.discountType}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-discount-value-${discount.id}`}>
                          {discount.discountType === "percentage" ? `${discount.discountValue}%` : `$${discount.discountValue}`}
                        </TableCell>
                        <TableCell className="text-sm" data-testid={`text-discount-period-${discount.id}`}>
                          {format(new Date(discount.validFrom), "MMM dd")} - {format(new Date(discount.validTo), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={discount.isActive ? "default" : "secondary"} data-testid={`badge-discount-status-${discount.id}`}>
                            {discount.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
