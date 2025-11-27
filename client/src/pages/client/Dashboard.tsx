import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Calendar, FileText, Clock, AlertCircle, CheckCircle, User } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function ClientDashboard() {
  const { user } = useAuth();

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["/api/vehicles", user?.id],
    enabled: !!user?.id,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", user?.id],
    enabled: !!user?.id,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices", user?.id],
    enabled: !!user?.id,
  });

  const myVehicles = Array.isArray(vehicles) 
    ? vehicles.filter((v: any) => v.customerId === user?.id)
    : [];

  const myAppointments = Array.isArray(appointments)
    ? appointments.filter((a: any) => {
        const vehicle = myVehicles.find((v: any) => v.id === a.vehicleId);
        return !!vehicle;
      }).slice(0, 3)
    : [];

  const myInvoices = Array.isArray(invoices)
    ? invoices.filter((inv: any) => {
        const vehicle = myVehicles.find((v: any) => v.id === inv.vehicleId);
        return !!vehicle;
      }).slice(0, 3)
    : [];

  const upcomingAppointments = myAppointments.filter(
    (a: any) => a.status === "scheduled" || a.status === "confirmed"
  );

  const pendingInvoices = myInvoices.filter(
    (inv: any) => inv.status === "pending" || inv.status === "sent"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Welcome Back, {user?.fullName?.split(" ")[0] || "Customer"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your vehicles and service activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-stat-vehicles">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {vehiclesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-vehicles-count">
                {myVehicles.length}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Registered vehicles
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-appointments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-appointments-count">
                {upcomingAppointments.length}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled services
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-invoices">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-pending-invoices-count">
                {pendingInvoices.length}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card data-testid="card-recent-appointments">
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Your latest service appointments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointmentsLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : myAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No appointments yet</p>
                <Link href="/client/appointments">
                  <Button variant="link" className="mt-2" data-testid="button-book-appointment">
                    Book your first appointment
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {myAppointments.map((appointment: any) => {
                  const vehicle = myVehicles.find((v: any) => v.id === appointment.vehicleId);
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                      data-testid={`appointment-${appointment.id}`}
                    >
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {vehicle?.make} {vehicle?.model} - {vehicle?.licensePlate}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.scheduledDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <Badge variant={
                          appointment.status === "completed" ? "default" :
                          appointment.status === "confirmed" ? "secondary" : "outline"
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                <Link href="/client/appointments">
                  <Button variant="outline" className="w-full" data-testid="button-view-all-appointments">
                    View All Appointments
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card data-testid="card-recent-invoices">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Your latest service invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoicesLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : myInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No invoices yet</p>
              </div>
            ) : (
              <>
                {myInvoices.map((invoice: any) => {
                  const vehicle = myVehicles.find((v: any) => v.id === invoice.vehicleId);
                  const isPaid = invoice.status === "paid";
                  return (
                    <div
                      key={invoice.id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                      data-testid={`invoice-${invoice.id}`}
                    >
                      {isPaid ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {vehicle?.make} {vehicle?.model} - Invoice #{invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                          </span>
                          <Badge variant={isPaid ? "default" : "destructive"}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Link href="/client/invoices">
                  <Button variant="outline" className="w-full" data-testid="button-view-all-invoices">
                    View All Invoices
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/client/appointments">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2" data-testid="button-quick-book">
                <Calendar className="h-8 w-8" />
                <span>Book Appointment</span>
              </Button>
            </Link>
            <Link href="/client/vehicles">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2" data-testid="button-quick-vehicles">
                <Car className="h-8 w-8" />
                <span>My Vehicles</span>
              </Button>
            </Link>
            <Link href="/client/invoices">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2" data-testid="button-quick-invoices">
                <FileText className="h-8 w-8" />
                <span>View Invoices</span>
              </Button>
            </Link>
            <Link href="/client/profile">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2" data-testid="button-quick-profile">
                <User className="h-8 w-8" />
                <span>Update Profile</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
