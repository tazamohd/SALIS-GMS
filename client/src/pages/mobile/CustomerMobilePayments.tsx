import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Download, CreditCard, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { Invoice } from "@shared/schema";

export default function CustomerMobilePayments() {
  const { data: invoices, isLoading } = useQuery<{ data: Invoice[] }>({
    queryKey: ["/api/invoices"],
  });

  const pendingInvoices = invoices?.data?.filter(
    (inv) => inv.status === "pending" || inv.status === "overdue"
  ) || [];
  
  const paidInvoices = invoices?.data?.filter(
    (inv) => inv.status === "paid"
  ) || [];

  const totalPending = pendingInvoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount), 0
  );

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64 bg-[#F8FAFC] dark:bg-[#0E1117]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5ED7] mx-auto mb-4" />
          <p className="text-[#64748B]">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <div>
        <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">Payments</h2>
        <p className="text-sm text-[#64748B]">Manage your invoices and payments</p>
      </div>

      <Card className="bg-gradient-to-r from-[#F97316] to-[#ea580c] text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Pending</p>
              <p className="text-3xl font-bold">${totalPending.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">{pendingInvoices.length} invoice(s)</p>
            </div>
            <CreditCard className="h-16 w-16 opacity-20" />
          </div>
          {pendingInvoices.length > 0 && (
            <Button 
              className="w-full mt-4 bg-white text-[#F97316] hover:bg-gray-100"
              data-testid="button-pay-now"
            >
              Pay Now
            </Button>
          )}
        </CardContent>
      </Card>

      {pendingInvoices.length > 0 && (
        <div>
          <h3 className="text-base font-semibold mb-2 text-[#0B1F3B] dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#F97316]" />
            Pending Payments
          </h3>
          <div className="space-y-2">
            {pendingInvoices.map((invoice) => (
              <Card 
                key={invoice.id}
                className="bg-white dark:bg-[#151A23] border-[#F97316]/30 dark:border-[#F97316]/20"
                data-testid={`pending-invoice-${invoice.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-[#0B1F3B] dark:text-white">
                        Invoice #{invoice.invoiceNumber}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#F97316]">
                        ${Number(invoice.totalAmount).toFixed(2)}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316]">
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                  {invoice.dueDate && (
                    <p className="text-xs text-[#64748B] mb-2">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/invoices`} className="flex-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-[#E2E8F0] dark:border-[#232A36]"
                        data-testid={`button-view-${invoice.id}`}
                      >
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      className="bg-[#F97316] hover:bg-[#ea580c] flex-1"
                      data-testid={`button-pay-${invoice.id}`}
                    >
                      Pay Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-base font-semibold mb-2 text-[#0B1F3B] dark:text-white flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          Payment History
        </h3>
        <div className="space-y-2">
          {paidInvoices.slice(0, 5).map((invoice) => (
            <Card 
              key={invoice.id}
              className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid={`paid-invoice-${invoice.id}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-[#0B1F3B] dark:text-white">
                      Invoice #{invoice.invoiceNumber}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">
                      ${Number(invoice.totalAmount).toFixed(2)}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      Paid
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {paidInvoices.length === 0 && pendingInvoices.length === 0 && (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-8 text-center">
                <Receipt className="h-16 w-16 mx-auto mb-4 text-[#E2E8F0] dark:text-[#232A36]" />
                <h3 className="text-lg font-semibold mb-2 text-[#0B1F3B] dark:text-white">No Invoices Yet</h3>
                <p className="text-sm text-[#64748B]">
                  Your payment history will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
