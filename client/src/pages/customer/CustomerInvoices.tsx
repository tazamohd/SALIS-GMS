import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Filter, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PaymentDialog } from "@/components/customer/PaymentDialog";
import type { Invoice } from "@shared/schema";

export function CustomerInvoices() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const { toast } = useToast();

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/customer/invoices'],
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      return apiRequest('POST', '/api/customer/create-payment-intent', { invoiceId });
    },
    onSuccess: (data: any) => {
      setClientSecret(data.clientSecret);
      setPaymentDialogOpen(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    },
  });

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    createPaymentIntentMutation.mutate(invoice.id);
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/customer/invoices'] });
    setSelectedInvoice(null);
    setClientSecret('');
  };

  const filteredInvoices = invoices.filter(inv => 
    statusFilter === 'all' || inv.status === statusFilter
  );

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            My Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and pay your service invoices
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex gap-2">
          {statusOptions.map(option => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(option.value)}
              data-testid={`button-filter-${option.value}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No invoices found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === 'all' 
                ? "You don't have any invoices yet."
                : `No ${statusFilter} invoices.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map(inv => (
            <Card key={inv.id} data-testid={`card-invoice-${inv.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl" data-testid={`text-invoice-number-${inv.id}`}>
                      Invoice #{inv.invoiceNumber}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Issued: {format(new Date(inv.invoiceDate), 'PPP')}
                    </CardDescription>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}
                    data-testid={`status-invoice-${inv.id}`}
                  >
                    {inv.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                      <p className="font-medium mt-1" data-testid={`text-invoice-duedate-${inv.id}`}>
                        {format(new Date(inv.dueDate), 'PPP')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="font-medium mt-1 text-lg" data-testid={`text-invoice-total-${inv.id}`}>
                        ${Number(inv.totalAmount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Balance Due</p>
                      <p className="font-medium mt-1 text-lg" data-testid={`text-invoice-balance-${inv.id}`}>
                        ${Number(inv.balanceAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {inv.notes && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                      <p className="mt-1">{inv.notes}</p>
                    </div>
                  )}

                  {inv.status !== 'paid' && Number(inv.balanceAmount) > 0 && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        className="flex-1" 
                        onClick={() => handlePayInvoice(inv)}
                        disabled={createPaymentIntentMutation.isPending}
                        data-testid={`button-pay-invoice-${inv.id}`}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {createPaymentIntentMutation.isPending && selectedInvoice?.id === inv.id 
                          ? 'Loading...' 
                          : `Pay $${Number(inv.balanceAmount).toFixed(2)}`}
                      </Button>
                      <Button variant="outline" disabled data-testid={`button-download-invoice-${inv.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}

                  {inv.status === 'paid' && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 pt-4 border-t">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Paid on {inv.paidAt ? format(new Date(inv.paidAt), 'PPP') : 'N/A'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedInvoice && clientSecret && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          invoiceId={selectedInvoice.id}
          amount={Number(selectedInvoice.balanceAmount)}
          clientSecret={clientSecret}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
