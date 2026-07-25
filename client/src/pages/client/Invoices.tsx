import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, CreditCard, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { useTranslation } from "react-i18next";

export default function ClientInvoices() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles", user?.id],
    enabled: !!user?.id,
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
    enabled: !!user?.id,
  });

  const myVehicles = Array.isArray(vehicles)
    ? vehicles.filter((v: any) => v.customerId === user?.id)
    : [];

  const myInvoices = Array.isArray(invoices)
    ? invoices.filter((inv: any) => {
        const vehicle = myVehicles.find((v: any) => v.id === inv.vehicleId);
        return !!vehicle;
      })
    : [];

  const pendingInvoices = myInvoices.filter(
    (inv: any) => inv.status === "pending" || inv.status === "sent"
  );

  const paidInvoices = myInvoices.filter(
    (inv: any) => inv.status === "paid"
  );

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = myVehicles.find((v: any) => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}` : t('nav.unknown_vehicle', 'Unknown Vehicle');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
      case "sent":
        return <AlertCircle className="h-5 w-5 text-[#F97316]" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-[#64748B]" />;
    }
  };

  const totalPending = pendingInvoices.reduce(
    (sum: number, inv: any) => sum + parseFloat(inv.totalAmount || "0"),
    0
  );

  const totalPaid = paidInvoices.reduce(
    (sum: number, inv: any) => sum + parseFloat(inv.totalAmount || "0"),
    0
  );

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-page-title">
          {t('nav.invoices_payments', 'Invoices & Payments')}
        </h1>
        <p className="text-[#64748B] mt-1">
          {t('nav.view_manage_invoices', 'View and manage your service invoices')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-stat-pending">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('nav.pending_payments', 'Pending Payments')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-[#F97316]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-pending-amount">
              ${totalPending.toFixed(2)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              {pendingInvoices.length} {t('common.invoice', 'invoice')}{pendingInvoices.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-stat-paid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('nav.total_paid', 'Total Paid')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-paid-amount">
              ${totalPaid.toFixed(2)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              {paidInvoices.length} {t('common.invoice', 'invoice')}{paidInvoices.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-stat-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('nav.all_time_total', 'All Time Total')}</CardTitle>
            <FileText className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-amount">
              ${myInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.totalAmount || "0"), 0).toFixed(2)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              {myInvoices.length} {t('common.total_invoice', 'total invoice')}{myInvoices.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {pendingInvoices.length > 0 && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-pending-invoices">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('nav.pending_invoices', 'Pending Invoices')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('nav.invoices_awaiting_payment', 'Invoices awaiting payment')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingInvoices.map((invoice: any) => (
              <div
                key={invoice.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`pending-invoice-${invoice.id}`}
              >
                {getStatusIcon(invoice.status)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{t('common.invoice', 'Invoice')} #{invoice.invoiceNumber}</p>
                      <p className="text-sm text-[#64748B]">
                        {getVehicleInfo(invoice.vehicleId)}
                      </p>
                    </div>
                    <Badge className="bg-[#F97316] text-white">{invoice.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[#64748B]">
                      {t('common.issued', 'Issued')}: {new Date(invoice.issueDate).toLocaleDateString()}
                      {invoice.dueDate && (
                        <> • {t('common.due', 'Due')}: {new Date(invoice.dueDate).toLocaleDateString()}</>
                      )}
                    </div>
                    <div className="text-xl font-bold text-[#0B1F3B] dark:text-white">
                      ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white" data-testid={`button-pay-${invoice.id}`}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {t('nav.pay_now', 'Pay Now')}
                    </Button>
                    <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid={`button-download-${invoice.id}`}>
                      <Download className="h-4 w-4 mr-2" />
                      {t('nav.download', 'Download')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-all-invoices">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('nav.all_invoices', 'All Invoices')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('nav.complete_invoice_history', 'Complete invoice history')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 bg-[#E2E8F0] dark:bg-[#232A36]" />
              <Skeleton className="h-24 bg-[#E2E8F0] dark:bg-[#232A36]" />
              <Skeleton className="h-24 bg-[#E2E8F0] dark:bg-[#232A36]" />
            </div>
          ) : myInvoices.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('nav.no_invoices_yet', 'No invoices yet')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myInvoices
                .sort((a: any, b: any) => 
                  new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
                )
                .map((invoice: any) => {
                  const isPaid = invoice.status === "paid";
                  return (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]"
                      data-testid={`invoice-${invoice.id}`}
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <p className="font-medium text-[#0B1F3B] dark:text-white">{t('common.invoice', 'Invoice')} #{invoice.invoiceNumber}</p>
                          <p className="text-sm text-[#64748B]">
                            {getVehicleInfo(invoice.vehicleId)}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                            ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                          </div>
                          <Badge className={isPaid ? "bg-green-500 text-white" : "bg-[#F97316] text-white"}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="text-[#64748B] hover:text-[#0A5ED7]" data-testid={`button-view-${invoice.id}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
