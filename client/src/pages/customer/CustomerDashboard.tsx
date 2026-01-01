import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Car, Clock, DollarSign, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Appointment, Invoice, Vehicle } from "@shared/schema";
import { DashboardPage } from "@/components/layouts";

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

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return aptDate >= today && aptDate <= nextWeek && apt.status !== 'cancelled';
  }).slice(0, 3);

  const unpaidInvoices = invoices.filter(inv => 
    inv.status !== 'paid' && inv.status !== 'cancelled'
  ).slice(0, 3);

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => 
    sum + Number(inv.balanceAmount || 0), 0
  );

  const metrics = [
    {
      label: "Total Vehicles",
      value: loadingVehicles ? '...' : vehicles.filter(v => v.isActive).length,
      icon: Car,
    },
    {
      label: "Upcoming Appointments",
      value: loadingAppointments ? '...' : upcomingAppointments.length,
      icon: Clock,
    },
    {
      label: "Unpaid Balance",
      value: loadingInvoices ? '...' : `$${totalUnpaid.toFixed(2)}`,
      icon: DollarSign,
    },
  ];

  return (
    <DashboardPage
      title="Dashboard"
      description="Welcome back! Here's an overview of your account."
      metrics={metrics}
      metricsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    >
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-[#0B1F3B] dark:text-white">Upcoming Appointments</CardTitle>
              <CardDescription className="text-[#64748B]">Your scheduled service appointments</CardDescription>
            </div>
            <Link href="/portal/appointments">
              <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="button-view-all-appointments">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAppointments ? (
            <div className="text-center py-8 text-[#64748B]">Loading...</div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
              <p className="text-[#64748B]">No upcoming appointments</p>
              <Link href="/portal/appointments">
                <Button className="mt-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 hover:opacity-90" data-testid="button-book-appointment">
                  Book an Appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`card-appointment-${apt.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] p-3 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-appointment-service-${apt.id}`}>{apt.serviceType}</p>
                      <p className="text-sm text-[#64748B]">
                        {format(new Date(apt.appointmentDate), 'PPP p')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'confirmed' 
                      ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white'
                      : 'bg-[#E2E8F0] dark:bg-[#232A36] text-[#0B1F3B] dark:text-white'
                  }`} data-testid={`status-appointment-${apt.id}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {unpaidInvoices.length > 0 && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                  <AlertCircle className="h-5 w-5 text-[#F97316]" />
                  Pending Payments
                </CardTitle>
                <CardDescription className="text-[#64748B]">Invoices requiring payment</CardDescription>
              </div>
              <Link href="/portal/invoices">
                <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="button-view-all-invoices">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unpaidInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`card-invoice-${inv.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-[#F97316]/20 p-3 rounded-lg">
                      <FileText className="h-5 w-5 text-[#F97316]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-invoice-number-${inv.id}`}>{inv.invoiceNumber}</p>
                      <p className="text-sm text-[#64748B]">
                        Due: {format(new Date(inv.dueDate), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0B1F3B] dark:text-white" data-testid={`text-invoice-amount-${inv.id}`}>${Number(inv.balanceAmount).toFixed(2)}</p>
                    <Link href="/portal/invoices">
                      <Button size="sm" className="mt-2 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 hover:opacity-90" data-testid={`button-pay-invoice-${inv.id}`}>
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

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-[#0B1F3B] dark:text-white">My Vehicles</CardTitle>
              <CardDescription className="text-[#64748B]">Your registered vehicles</CardDescription>
            </div>
            <Link href="/portal/vehicles">
              <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="button-view-all-vehicles">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loadingVehicles ? (
            <div className="text-center py-8 text-[#64748B]">Loading...</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
              <p className="text-[#64748B]">No vehicles registered</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.filter(v => v.isActive).slice(0, 3).map(vehicle => (
                <div key={vehicle.id} className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`card-vehicle-${vehicle.id}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Car className="h-5 w-5 text-[#0A5ED7]" />
                    <h3 className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-vehicle-name-${vehicle.id}`}>
                      {vehicle.make} {vehicle.model}
                    </h3>
                  </div>
                  <div className="text-sm text-[#64748B] space-y-1">
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
    </DashboardPage>
  );
}
