import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Car, Clock, DollarSign, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Appointment, Invoice, Vehicle } from "@shared/schema";

export function CustomerDashboard() {
  const { data: appointments = [], isLoading: loadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['/api/customer/appointments'],
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['/api/customer/invoices'],
  });

  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/customer/vehicles'],
  });

  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return aptDate >= today && aptDate <= nextWeek && apt.status !== 'cancelled';
  }).slice(0, 3);

  // Get unpaid invoices
  const unpaidInvoices = invoices.filter(inv => 
    inv.status !== 'paid' && inv.status !== 'cancelled'
  ).slice(0, 3);

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => 
    sum + Number(inv.balanceAmount || 0), 0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here's an overview of your account.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Vehicles
            </CardTitle>
            <Car className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-vehicle-count">
              {loadingVehicles ? '...' : vehicles.filter(v => v.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Upcoming Appointments
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-upcoming-appointments">
              {loadingAppointments ? '...' : upcomingAppointments.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Unpaid Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-unpaid-balance">
              {loadingInvoices ? '...' : `$${totalUnpaid.toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled service appointments</CardDescription>
            </div>
            <Link href="/portal/appointments">
              <Button variant="outline" size="sm" data-testid="button-view-all-appointments">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAppointments ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming appointments</p>
              <Link href="/portal/appointments">
                <Button className="mt-4" data-testid="button-book-appointment">
                  Book an Appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`card-appointment-${apt.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`text-appointment-service-${apt.id}`}>{apt.serviceType}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(apt.appointmentDate), 'PPP p')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`} data-testid={`status-appointment-${apt.id}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Pending Payments
                </CardTitle>
                <CardDescription>Invoices requiring payment</CardDescription>
              </div>
              <Link href="/portal/invoices">
                <Button variant="outline" size="sm" data-testid="button-view-all-invoices">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unpaidInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`card-invoice-${inv.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                      <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`text-invoice-number-${inv.id}`}>{inv.invoiceNumber}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {format(new Date(inv.dueDate), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" data-testid={`text-invoice-amount-${inv.id}`}>${Number(inv.balanceAmount).toFixed(2)}</p>
                    <Link href="/portal/invoices">
                      <Button size="sm" className="mt-2" data-testid={`button-pay-invoice-${inv.id}`}>
                        Pay Now
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Vehicles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">My Vehicles</CardTitle>
              <CardDescription>Your registered vehicles</CardDescription>
            </div>
            <Link href="/portal/vehicles">
              <Button variant="outline" size="sm" data-testid="button-view-all-vehicles">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loadingVehicles ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No vehicles registered</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.filter(v => v.isActive).slice(0, 3).map(vehicle => (
                <div key={vehicle.id} className="p-4 border rounded-lg" data-testid={`card-vehicle-${vehicle.id}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Car className="h-5 w-5 text-gray-400" />
                    <h3 className="font-medium" data-testid={`text-vehicle-name-${vehicle.id}`}>
                      {vehicle.make} {vehicle.model}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Year: {vehicle.year}</p>
                    <p>License: {vehicle.licensePlate}</p>
                    {vehicle.mileage && <p>Mileage: {vehicle.mileage.toLocaleString()} mi</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
