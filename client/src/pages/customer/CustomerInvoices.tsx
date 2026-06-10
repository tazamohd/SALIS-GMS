import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Filter, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PaymentMethodsDialog } from "@/components/customer/PaymentMethodsDialog";
import { exportInvoiceToPDF } from "@/lib/pdfExport";
import type { Invoice, InvoiceItem } from "@shared/schema";
import { StandardPageLayout } from "@/components/layouts";

export function CustomerInvoices() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Generate and download a ZATCA-styled invoice PDF using the shared
  // jsPDF exporter. Line items are fetched on demand; if that call fails the
  // PDF still renders with the header + totals from the invoice itself.
  const handleDownloadPdf = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      let items: InvoiceItem[] = [];
      try {
        const res = await apiRequest('GET', `/api/invoices/${invoice.id}/items`);
        items = (await res.json()) as InvoiceItem[];
      } catch {
        items = [];
      }
      const customerName = (user as any)?.fullName || (user as any)?.email || 'Customer';
      exportInvoiceToPDF(invoice, items, customerName, { name: 'SALIS AUTO' });
    } catch (error: any) {
      toast({
        title: 'Download failed',
        description: error?.message || 'Could not generate the invoice PDF.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/customer/invoices'],
  });

  // Opens the multi-gateway method selector (Mada/cards/Apple Pay/STC Pay/
  // Tabby/Tamara/PayPal/cash — whatever is configured).
  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setMethodsOpen(true);
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/customer/invoices'] });
    setSelectedInvoice(null);
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
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'sent':
        return 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white';
      case 'overdue':
        return 'bg-[#F97316]/20 text-[#F97316]';
      case 'draft':
        return 'bg-[#E2E8F0] dark:bg-[#232A36] text-[#64748B]';
      default:
        return 'bg-[#E2E8F0] dark:bg-[#232A36] text-[#64748B]';
    }
  };

  return (
    <StandardPageLayout
      title="My Invoices"
      description="View and pay your service invoices"
      icon={FileText}
    >
      <div className="flex items-center gap-4 mb-6">
        <Filter className="h-4 w-4 text-[#64748B]" />
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map(option => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(option.value)}
              className={statusFilter === option.value 
                ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 hover:opacity-90' 
                : 'border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#151A23]'}
              data-testid={`button-filter-${option.value}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#64748B]">Loading invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-[#64748B] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white mb-2">
              No invoices found
            </h3>
            <p className="text-[#64748B]">
              {statusFilter === 'all' 
                ? "You don't have any invoices yet."
                : `No ${statusFilter} invoices.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map(inv => (
            <Card key={inv.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-invoice-${inv.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-[#0B1F3B] dark:text-white" data-testid={`text-invoice-number-${inv.id}`}>
                      Invoice #{inv.invoiceNumber}
                    </CardTitle>
                    <CardDescription className="mt-1 text-[#64748B]">
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
                      <p className="text-sm text-[#64748B]">Due Date</p>
                      <p className="font-medium mt-1 text-[#0B1F3B] dark:text-white" data-testid={`text-invoice-duedate-${inv.id}`}>
                        {format(new Date(inv.dueDate), 'PPP')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">Total Amount</p>
                      <p className="font-medium mt-1 text-lg text-[#0B1F3B] dark:text-white" data-testid={`text-invoice-total-${inv.id}`}>
                        ${Number(inv.totalAmount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">Balance Due</p>
                      <p className="font-medium mt-1 text-lg text-[#0B1F3B] dark:text-white" data-testid={`text-invoice-balance-${inv.id}`}>
                        ${Number(inv.balanceAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {inv.notes && (
                    <div>
                      <p className="text-sm text-[#64748B]">Notes</p>
                      <p className="mt-1 text-[#0B1F3B] dark:text-white">{inv.notes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                    {inv.status !== 'paid' && Number(inv.balanceAmount) > 0 && (
                      <Button
                        className="flex-1 min-w-[160px] bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 hover:opacity-90"
                        onClick={() => handlePayInvoice(inv)}
                        data-testid={`button-pay-invoice-${inv.id}`}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {`Pay $${Number(inv.balanceAmount).toFixed(2)}`}
                      </Button>
                    )}

                    {inv.status === 'paid' && (
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm font-medium">Paid on {inv.paidAt ? format(new Date(inv.paidAt), 'PPP') : 'N/A'}</span>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => handleDownloadPdf(inv)}
                      disabled={downloadingId === inv.id}
                      className="border-[#E2E8F0] dark:border-[#232A36]"
                      data-testid={`button-download-invoice-${inv.id}`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {downloadingId === inv.id ? 'Generating…' : 'Download PDF'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedInvoice && (
        <PaymentMethodsDialog
          open={methodsOpen}
          onOpenChange={setMethodsOpen}
          invoiceId={selectedInvoice.id}
          amount={Number(selectedInvoice.balanceAmount)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </StandardPageLayout>
  );
}
