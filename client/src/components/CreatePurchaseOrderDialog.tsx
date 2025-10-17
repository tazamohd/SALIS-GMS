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
import { insertPurchaseOrderSchema, type InsertPurchaseOrder, type Supplier, type Garage } from "@shared/schema";
import { z } from "zod";

const itemSchema = z.object({
  partName: z.string().min(1, "Part name is required"),
  partNumber: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

type POItem = z.infer<typeof itemSchema>;

export function CreatePurchaseOrderDialog() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<POItem[]>([]);
  const [currentItem, setCurrentItem] = useState<POItem>({
    partName: "",
    partNumber: "",
    quantity: 1,
    unitPrice: 0,
  });
  const { toast } = useToast();

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  const form = useForm<InsertPurchaseOrder>({
    resolver: zodResolver(insertPurchaseOrderSchema),
    defaultValues: {
      garageId: "",
      supplierId: "",
      status: "draft",
      subtotal: "0",
      taxAmount: "0",
      totalAmount: "0",
    },
  });

  const createPOMutation = useMutation({
    mutationFn: async (data: InsertPurchaseOrder) => {
      const itemsData = items.map(item => ({
        partName: item.partName,
        partNumber: item.partNumber || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        lineTotal: (item.quantity * item.unitPrice).toString(),
      }));
      
      return await apiRequest("POST", "/api/purchase-orders/with-items", {
        purchaseOrder: data,
        items: itemsData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/purchase-orders' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/purchase-orders'))
      });
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
      form.reset();
      setItems([]);
      setCurrentItem({ partName: "", partNumber: "", quantity: 1, unitPrice: 0 });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase order",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    if (!currentItem.partName || currentItem.quantity < 1 || currentItem.unitPrice < 0) {
      toast({
        title: "Invalid Item",
        description: "Please fill in all required item fields",
        variant: "destructive",
      });
      return;
    }
    
    setItems([...items, currentItem]);
    setCurrentItem({ partName: "", partNumber: "", quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const onSubmit = (data: InsertPurchaseOrder) => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item to the purchase order",
        variant: "destructive",
      });
      return;
    }

    const { subtotal, tax, total } = calculateTotals();
    
    createPOMutation.mutate({
      ...data,
      subtotal: subtotal.toFixed(2),
      taxAmount: tax.toFixed(2),
      totalAmount: total.toFixed(2),
    });
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-po">
          <Plus className="w-4 h-4 mr-2" />
          Create Purchase Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription className="sr-only">
            Form to create a new purchase order for ordering parts from suppliers
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="garageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-po-garage">
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
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-po-supplier">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(suppliers ?? []).map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expectedDeliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Delivery Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      data-testid="input-delivery-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} value={field.value ?? ""} data-testid="textarea-po-notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Purchase Order Items</h3>
              
              <div className="grid grid-cols-5 gap-2 mb-2">
                <Input
                  placeholder="Part Name"
                  value={currentItem.partName}
                  onChange={(e) => setCurrentItem({ ...currentItem, partName: e.target.value })}
                  data-testid="input-item-name"
                />
                <Input
                  placeholder="Part Number (Optional)"
                  value={currentItem.partNumber}
                  onChange={(e) => setCurrentItem({ ...currentItem, partNumber: e.target.value })}
                  data-testid="input-item-number"
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                  data-testid="input-item-quantity"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Unit Price"
                  value={currentItem.unitPrice}
                  onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  data-testid="input-item-price"
                />
                <Button type="button" onClick={addItem} data-testid="button-add-item">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {items.length > 0 && (
                <div className="mt-4 space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded" data-testid={`item-row-${index}`}>
                      <div className="flex-1">
                        <span className="font-medium">{item.partName}</span>
                        {item.partNumber && <span className="text-sm text-gray-500 ml-2">({item.partNumber})</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <span className="text-sm">@ ${item.unitPrice.toFixed(2)}</span>
                        <span className="font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</span>
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
                  
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-end gap-8 text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Tax (10%):</span>
                          <span className="font-medium">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-base font-bold">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-po"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPOMutation.isPending}
                data-testid="button-submit-po"
              >
                {createPOMutation.isPending ? "Creating..." : "Create Purchase Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
