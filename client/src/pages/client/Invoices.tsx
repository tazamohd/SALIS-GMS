import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, CreditCard, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ClientInvoices() {
  const { user } = useAuth();

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
    return vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}` : "Unknown Vehicle";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
      case "sent":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Invoices & Payments
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage your service invoices
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-stat-pending">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-amount">
              ${totalPending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-paid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-paid-amount">
              ${totalPaid.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paidInvoices.length} invoice{paidInvoices.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Time Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-amount">
              ${myInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.totalAmount || "0"), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {myInvoices.length} total invoice{myInvoices.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <Card data-testid="card-pending-invoices">
          <CardHeader>
            <CardTitle>Pending Invoices</CardTitle>
            <CardDescription>Invoices awaiting payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingInvoices.map((invoice: any) => (
              <div
                key={invoice.id}
                className="flex items-start gap-4 p-4 rounded-lg border"
                data-testid={`pending-invoice-${invoice.id}`}
              >
                {getStatusIcon(invoice.status)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Invoice #{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {getVehicleInfo(invoice.vehicleId)}
                      </p>
                    </div>
                    <Badge variant="destructive">{invoice.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                      {invoice.dueDate && (
                        <> • Due: {new Date(invoice.dueDate).toLocaleDateString()}</>
                      )}
                    </div>
                    <div className="text-xl font-bold">
                      ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" data-testid={`button-pay-${invoice.id}`}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-download-${invoice.id}`}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Invoices */}
      <Card data-testid="card-all-invoices">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Complete invoice history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : myInvoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No invoices yet</p>
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
                      className="flex items-center justify-between p-4 rounded-lg border"
                      data-testid={`invoice-${invoice.id}`}
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <p className="font-medium">Invoice #{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {getVehicleInfo(invoice.vehicleId)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                          </div>
                          <Badge variant={isPaid ? "default" : "destructive"}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon" data-testid={`button-view-${invoice.id}`}>
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
