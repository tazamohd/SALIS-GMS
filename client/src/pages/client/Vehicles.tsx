import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Car, Calendar, FileText, Wrench, DollarSign, Receipt, Eye, Download, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useState } from "react";

export default function ClientVehicles() {
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["/api/vehicles", user?.id],
    enabled: !!user?.id,
  });

  const { data: jobCards } = useQuery({
    queryKey: ["/api/job-cards"],
    enabled: !!user?.id,
  });

  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user?.id,
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
    enabled: !!user?.id,
  });

  const myVehicles = Array.isArray(vehicles)
    ? vehicles.filter((v: any) => v.customerId === user?.id)
    : [];

  const getVehicleHistory = (vehicleId: string) => {
    const vehicleJobs = Array.isArray(jobCards)
      ? jobCards.filter((jc: any) => jc.vehicleId === vehicleId)
      : [];
    const vehicleAppts = Array.isArray(appointments)
      ? appointments.filter((a: any) => a.vehicleId === vehicleId)
      : [];
    const vehicleInvoices = Array.isArray(invoices)
      ? invoices.filter((inv: any) => {
          const job = vehicleJobs.find((j: any) => j.id === inv.jobCardId);
          return !!job || inv.vehicleId === vehicleId;
        })
      : [];
    return { jobs: vehicleJobs, appointments: vehicleAppts, invoices: vehicleInvoices };
  };

  const getInvoiceForJob = (jobId: string) => {
    if (!Array.isArray(invoices)) return null;
    return invoices.find((inv: any) => inv.jobCardId === jobId);
  };

  const getTotalSpending = (vehicleInvoices: any[]) => {
    return vehicleInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || "0"), 0);
  };

  const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "pending": return "outline";
      case "paid": return "default";
      case "unpaid": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            My Vehicles
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your vehicles, view service history, and invoices
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      ) : myVehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Vehicles Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Contact your service center to add vehicles to your account
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myVehicles.map((vehicle: any) => {
            const history = getVehicleHistory(vehicle.id);
            const lastService = history.jobs.length > 0
              ? history.jobs.sort((a: any, b: any) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0]
              : null;
            const totalSpending = getTotalSpending(history.invoices);

            return (
              <Card key={vehicle.id} data-testid={`vehicle-card-${vehicle.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {vehicle.make} {vehicle.model}
                        </CardTitle>
                        <CardDescription>{vehicle.year}</CardDescription>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedVehicle(vehicle)}
                          data-testid={`button-details-${vehicle.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </DialogTitle>
                          <DialogDescription>
                            Complete vehicle details, service history, and invoices
                          </DialogDescription>
                        </DialogHeader>
                        <VehicleDetailView 
                          vehicle={vehicle} 
                          history={history}
                          getInvoiceForJob={getInvoiceForJob}
                          getStatusColor={getStatusColor}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">License Plate</span>
                      <span className="font-medium">{vehicle.licensePlate}</span>
                    </div>
                    {vehicle.vin && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">VIN</span>
                        <span className="font-mono text-xs">{vehicle.vin}</span>
                      </div>
                    )}
                    {vehicle.color && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Color</span>
                        <span className="font-medium">{vehicle.color}</span>
                      </div>
                    )}
                    {vehicle.mileage && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mileage</span>
                        <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                    )}
                  </div>

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview" data-testid={`tab-overview-${vehicle.id}`}>
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="history" data-testid={`tab-history-${vehicle.id}`}>
                        Jobs
                      </TabsTrigger>
                      <TabsTrigger value="invoices" data-testid={`tab-invoices-${vehicle.id}`}>
                        Invoices
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-3 mt-4">
                      {lastService ? (
                        <div className="p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Last Service</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(lastService.createdAt).toLocaleDateString()}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {lastService.status}
                          </Badge>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg border text-center text-sm text-muted-foreground">
                          No service history yet
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 rounded-lg border text-center">
                          <div className="text-2xl font-bold text-primary">
                            {history.jobs.length}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Services</p>
                        </div>
                        <div className="p-3 rounded-lg border text-center">
                          <div className="text-2xl font-bold text-primary">
                            {history.invoices.length}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Invoices</p>
                        </div>
                        <div className="p-3 rounded-lg border text-center">
                          <div className="text-lg font-bold text-primary">
                            ${totalSpending.toFixed(0)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Spent</p>
                        </div>
                      </div>

                      <Link href="/client/appointments">
                        <Button className="w-full" data-testid={`button-book-${vehicle.id}`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Service
                        </Button>
                      </Link>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-2 mt-4">
                      {history.jobs.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                          No service history
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {history.jobs
                            .sort((a: any, b: any) => 
                              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            )
                            .slice(0, 5)
                            .map((job: any) => {
                              const invoice = getInvoiceForJob(job.id);
                              return (
                                <div
                                  key={job.id}
                                  className="p-3 rounded-lg border text-sm"
                                  data-testid={`job-${job.id}`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">Job #{job.jobNumber}</span>
                                    <Badge variant={getStatusColor(job.status)} className="text-xs">
                                      {job.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(job.createdAt).toLocaleDateString()}
                                    </p>
                                    {invoice && (
                                      <span className="text-xs font-medium text-primary">
                                        ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="invoices" className="space-y-2 mt-4">
                      {history.invoices.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                          <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No invoices yet
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {history.invoices
                            .sort((a: any, b: any) => 
                              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            )
                            .slice(0, 5)
                            .map((invoice: any) => (
                              <div
                                key={invoice.id}
                                className="p-3 rounded-lg border text-sm"
                                data-testid={`invoice-${invoice.id}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">#{invoice.invoiceNumber}</span>
                                  <Badge variant={getStatusColor(invoice.status)} className="text-xs">
                                    {invoice.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                  </p>
                                  <span className="font-medium text-primary">
                                    ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VehicleDetailView({ 
  vehicle, 
  history, 
  getInvoiceForJob,
  getStatusColor 
}: { 
  vehicle: any; 
  history: { jobs: any[]; appointments: any[]; invoices: any[] };
  getInvoiceForJob: (jobId: string) => any;
  getStatusColor: (status: string) => "default" | "secondary" | "outline" | "destructive";
}) {
  const totalSpending = history.invoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || "0"), 0);
  const completedJobs = history.jobs.filter((j: any) => j.status === "completed").length;

  return (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-6 pr-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border text-center">
            <Wrench className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{history.jobs.length}</div>
            <p className="text-xs text-muted-foreground">Total Services</p>
          </div>
          <div className="p-4 rounded-lg border text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{completedJobs}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="p-4 rounded-lg border text-center">
            <Receipt className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{history.invoices.length}</div>
            <p className="text-xs text-muted-foreground">Invoices</p>
          </div>
          <div className="p-4 rounded-lg border text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">${totalSpending.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">Vehicle Information</h4>
            <div className="space-y-1 text-muted-foreground">
              <p>Make: <span className="text-foreground">{vehicle.make}</span></p>
              <p>Model: <span className="text-foreground">{vehicle.model}</span></p>
              <p>Year: <span className="text-foreground">{vehicle.year}</span></p>
              <p>License: <span className="text-foreground">{vehicle.licensePlate}</span></p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Additional Details</h4>
            <div className="space-y-1 text-muted-foreground">
              {vehicle.vin && <p>VIN: <span className="text-foreground font-mono text-xs">{vehicle.vin}</span></p>}
              {vehicle.color && <p>Color: <span className="text-foreground">{vehicle.color}</span></p>}
              {vehicle.mileage && <p>Mileage: <span className="text-foreground">{vehicle.mileage.toLocaleString()} km</span></p>}
              {vehicle.engineType && <p>Engine: <span className="text-foreground">{vehicle.engineType}</span></p>}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Service History
          </h4>
          {history.jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No service history available</p>
          ) : (
            <div className="space-y-3">
              {history.jobs
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((job: any) => {
                  const invoice = getInvoiceForJob(job.id);
                  return (
                    <div key={job.id} className="p-4 rounded-lg border" data-testid={`detail-job-${job.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">Job #{job.jobNumber}</p>
                          {job.description && (
                            <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                          )}
                        </div>
                        <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created: {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        {job.completedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed: {new Date(job.completedAt).toLocaleDateString()}
                          </span>
                        )}
                        {invoice && (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <DollarSign className="h-3 w-3" />
                            ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                          </span>
                        )}
                      </div>
                      {invoice && (
                        <div className="mt-3 p-2 bg-muted/50 rounded flex items-center justify-between">
                          <span className="text-xs">Invoice #{invoice.invoiceNumber}</span>
                          <Badge variant={getStatusColor(invoice.status)} className="text-xs">
                            {invoice.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            All Invoices
          </h4>
          {history.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices available</p>
          ) : (
            <div className="space-y-2">
              {history.invoices
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((invoice: any) => (
                  <div key={invoice.id} className="p-3 rounded-lg border flex items-center justify-between" data-testid={`detail-invoice-${invoice.id}`}>
                    <div>
                      <p className="font-medium text-sm">Invoice #{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">
                        ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                      </span>
                      <Badge variant={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
