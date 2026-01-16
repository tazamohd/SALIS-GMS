import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
import { insertInvoiceSchema, type InsertInvoice, type Garage, type User, type Vehicle } from "@shared/schema";
import { z } from "zod";

const itemSchema = z.object({
  itemType: z.enum(["service", "part", "labor"]),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  taxRate: z.number().min(0).max(100),
});

type InvoiceItemInput = z.infer<typeof itemSchema>;

export function CreateInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InvoiceItemInput[]>([]);
  const [currentItem, setCurrentItem] = useState<InvoiceItemInput>({
    itemType: "service",
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 10,
  });
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const { data: customers } = useQuery<User[]>({
    queryKey: ['/api/customers'],
  });

  const form = useForm<InsertInvoice>({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      garageId: "",
      customerId: "",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "draft",
      subtotal: "0",
      taxAmount: "0",
      discountAmount: "0",
      totalAmount: "0",
      paidAmount: "0",
      balanceAmount: "0",
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InsertInvoice) => {
      const itemsData = items.map(item => ({
        itemType: item.itemType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        lineTotal: (item.quantity * item.unitPrice).toString(),
        taxRate: item.taxRate.toString(),
      }));
      
      return await apiRequest("POST", "/api/invoices/with-items", {
        invoice: data,
        items: itemsData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/invoices' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/invoices'))
      });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      form.reset();
      setItems([]);
      setCurrentItem({ itemType: "service", description: "", quantity: 1, unitPrice: 0, taxRate: 10 });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
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
    setCurrentItem({ itemType: "service", description: "", quantity: 1, unitPrice: 0, taxRate: 10 });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (itemTotal * item.taxRate / 100);
    }, 0);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const onSubmit = (data: InsertInvoice) => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item to the invoice",
        variant: "destructive",
      });
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals();
    
    createInvoiceMutation.mutate({
      ...data,
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: total.toFixed(2),
      balanceAmount: total.toFixed(2),
    });
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-invoice">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('dialogs.createInvoice', 'Create Invoice')}</DialogTitle>
          <DialogDescription className="sr-only">
            Form to create a new invoice with items and pricing for a customer
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
                        <SelectTrigger data-testid="select-invoice-garage">
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
                        <SelectTrigger data-testid="select-invoice-customer">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(customers ?? []).map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.fullName || customer.email}
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
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      data-testid="input-due-date"
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
                    <Textarea placeholder="Additional notes..." {...field} value={field.value ?? ""} data-testid="textarea-invoice-notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Invoice Items</h3>
              
              <div className="grid grid-cols-6 gap-2 mb-2">
                <Select
                  value={currentItem.itemType}
                  onValueChange={(value: "service" | "part" | "labor") => setCurrentItem({ ...currentItem, itemType: value })}
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
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  className="col-span-2"
                  data-testid="input-item-description"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                  data-testid="input-item-quantity"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price"
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
                        <span className="font-medium capitalize">{item.itemType}: {item.description}</span>
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
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-medium">${taxAmount.toFixed(2)}</span>
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
                data-testid="button-cancel-invoice"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createInvoiceMutation.isPending}
                data-testid="button-submit-invoice"
              >
                {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
