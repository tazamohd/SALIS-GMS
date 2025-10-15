import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { insertPaymentSchema, type InsertPayment, type Invoice } from "@shared/schema";

interface AddPaymentDialogProps {
  invoice: Invoice;
}

export function AddPaymentDialog({ invoice }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const maxPaymentAmount = parseFloat(invoice.balanceAmount);
  const canAddPayment = maxPaymentAmount > 0;

  const form = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: {
      invoiceId: invoice.id,
      amount: maxPaymentAmount.toString(),
      paymentMethod: "cash",
      paymentDate: new Date(),
      notes: "",
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (data: InsertPayment) => {
      return await apiRequest("POST", "/api/payments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/invoices' || 
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/invoices')) ||
          query.queryKey[0] === '/api/payments'
      });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPayment) => {
    const paymentAmount = parseFloat(data.amount);
    if (paymentAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be greater than zero",
        variant: "destructive",
      });
      return;
    }
    if (paymentAmount > maxPaymentAmount) {
      toast({
        title: "Invalid Amount",
        description: `Payment amount cannot exceed balance due of $${maxPaymentAmount.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }
    addPaymentMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-green-600 hover:bg-green-700" 
          disabled={!canAddPayment}
          data-testid="button-add-payment"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Invoice Total:</span>
            <span className="font-medium">${parseFloat(invoice.totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Paid Amount:</span>
            <span className="font-medium text-green-600">${parseFloat(invoice.paidAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t mt-2 pt-2">
            <span>Balance Due:</span>
            <span className="text-orange-600">${maxPaymentAmount.toFixed(2)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      data-testid="input-payment-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      data-testid="input-payment-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Check number, transaction ID, etc."
                      {...field}
                      value={field.value ?? ""}
                      data-testid="input-reference-number"
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
                    <Textarea
                      placeholder="Additional payment notes..."
                      {...field}
                      value={field.value ?? ""}
                      data-testid="textarea-payment-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-payment"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addPaymentMutation.isPending}
                data-testid="button-submit-payment"
              >
                {addPaymentMutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
