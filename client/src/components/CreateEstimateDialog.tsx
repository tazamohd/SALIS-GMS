import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
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
import { insertEstimateSchema, type InsertEstimate, type Garage, type User, type Vehicle } from "@shared/schema";
import { z } from "zod";

const itemSchema = z.object({
  itemType: z.enum(["service", "part", "labor"]),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

type EstimateItemInput = z.infer<typeof itemSchema>;

export function CreateEstimateDialog() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<EstimateItemInput[]>([]);
  const [currentItem, setCurrentItem] = useState<EstimateItemInput>({
    itemType: "service",
    description: "",
    quantity: 1,
    unitPrice: 0,
  });
  const { toast } = useToast();

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const { data: customers } = useQuery<User[]>({
    queryKey: ['/api/customers'],
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const form = useForm<InsertEstimate>({
    resolver: zodResolver(insertEstimateSchema),
    defaultValues: {
      title: "",
      garageId: "",
      customerId: "",
      vehicleId: "",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "draft",
      subtotal: "0",
      taxRate: "0",
      taxAmount: "0",
      discountAmount: "0",
      totalAmount: "0",
    },
  });

  const customerId = form.watch("customerId");
  const customerVehicles = vehicles?.filter(v => v.customerId === customerId) || [];

  const createEstimateMutation = useMutation({
    mutationFn: async (data: InsertEstimate) => {
      const itemsData = items.map(item => ({
        itemType: item.itemType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        lineTotal: (item.quantity * item.unitPrice).toString(),
        taxRate: "10",
        taxAmount: ((item.quantity * item.unitPrice) * 0.1).toString(),
      }));
      
      return await apiRequest("POST", "/api/estimates/with-items", {
        estimate: data,
        items: itemsData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/estimates' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/estimates'))
      });
      toast({
        title: "Success",
        description: "Estimate created successfully",
      });
      form.reset();
      setItems([]);
      setCurrentItem({ itemType: "service", description: "", quantity: 1, unitPrice: 0 });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create estimate",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    if (!currentItem.description || currentItem.quantity < 1 || currentItem.unitPrice < 0) {
      toast({
        title: "Invalid Item",
        description: "Please fill in all required item fields",
        variant: "destructive",
      });
      return;
    }
    
    setItems([...items, currentItem]);
    setCurrentItem({ itemType: "service", description: "", quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = 10; // 10% tax rate
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = 0;
    const total = subtotal + taxAmount - discountAmount;
    return { subtotal, taxRate, taxAmount, discountAmount, total };
  };

  const onSubmit = (data: InsertEstimate) => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item to the estimate",
        variant: "destructive",
      });
      return;
    }

    const { subtotal, taxRate, taxAmount, discountAmount, total } = calculateTotals();
    
    createEstimateMutation.mutate({
      ...data,
      subtotal: subtotal.toFixed(2),
      taxRate: taxRate.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      totalAmount: total.toFixed(2),
    });
  };

  const { subtotal, taxRate, taxAmount, discountAmount, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-gray-300 text-white dark:text-black" data-testid="button-create-estimate">
          <Plus className="w-4 h-4 mr-2" />
          Create Estimate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-gray-900 dark:text-white">
            Create New Estimate
          </DialogTitle>
          <DialogDescription className="sr-only">
            Form to create a new estimate with items and pricing for a customer
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimate Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Brake Service Estimate"
                      {...field}
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="garageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-garage">
                          <SelectValue placeholder="Select garage" />
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

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-customer">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(customers ?? []).map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} 
                      value={field.value || "none"}
                      disabled={!customerId}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-vehicle">
                          <SelectValue placeholder={customerId ? "Select vehicle" : "Select customer first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No vehicle</SelectItem>
                        {customerVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        data-testid="input-valid-until"
                      />
                    </FormControl>
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes..."
                      {...field}
                      value={field.value || ""}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4">
              <h3 className="font-['Poppins',Helvetica] font-semibold text-lg mb-4">Items</h3>
              
              <div className="grid grid-cols-5 gap-2 mb-2">
                <Select 
                  value={currentItem.itemType} 
                  onValueChange={(value: any) => setCurrentItem({...currentItem, itemType: value})}
                >
                  <SelectTrigger data-testid="select-item-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="part">Part</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Description"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                  className="col-span-2"
                  data-testid="input-item-description"
                />
                
                <Input
                  type="number"
                  placeholder="Qty"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 0})}
                  data-testid="input-item-quantity"
                />
                
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={currentItem.unitPrice}
                    onChange={(e) => setCurrentItem({...currentItem, unitPrice: parseFloat(e.target.value) || 0})}
                    data-testid="input-item-price"
                  />
                  <Button type="button" onClick={addItem} size="sm" data-testid="button-add-item">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {items.length > 0 && (
                <div className="space-y-2 mt-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded" data-testid={`item-${index}`}>
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-500">
                          {item.itemType} • Qty: {item.quantity} • ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          data-testid={`button-remove-item-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold" data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax ({taxRate}%):</span>
                    <span className="font-semibold" data-testid="text-tax">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-semibold" data-testid="text-discount">${discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span data-testid="text-total">${total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEstimateMutation.isPending}
                className="bg-[#1a73e8] hover:bg-[#1557b0]"
                data-testid="button-submit"
              >
                {createEstimateMutation.isPending ? "Creating..." : "Create Estimate"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
