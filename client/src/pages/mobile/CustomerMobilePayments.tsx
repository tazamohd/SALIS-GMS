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
      <div className="p-4 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your invoices and payments</p>
      </div>

      {/* Balance Summary */}
      <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
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
              className="w-full mt-4 bg-white text-orange-600 hover:bg-gray-100"
              data-testid="button-pay-now"
            >
              Pay Now
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <div>
          <h3 className="text-base font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            Pending Payments
          </h3>
          <div className="space-y-2">
            {pendingInvoices.map((invoice) => (
              <Card 
                key={invoice.id}
                className="bg-white dark:bg-gray-900 border-orange-200 dark:border-orange-900/30"
                data-testid={`pending-invoice-${invoice.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Invoice #{invoice.invoiceNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        ${Number(invoice.totalAmount).toFixed(2)}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                  {invoice.dueDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/invoices`} className="flex-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        data-testid={`button-view-${invoice.id}`}
                      >
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700 flex-1"
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

      {/* Payment History */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Payment History
        </h3>
        <div className="space-y-2">
          {paidInvoices.slice(0, 5).map((invoice) => (
            <Card 
              key={invoice.id}
              className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              data-testid={`paid-invoice-${invoice.id}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Invoice #{invoice.invoiceNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${Number(invoice.totalAmount).toFixed(2)}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Paid
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {paidInvoices.length === 0 && pendingInvoices.length === 0 && (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-8 text-center">
                <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No Invoices Yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
