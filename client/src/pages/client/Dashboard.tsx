import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Car, Calendar, FileText, Clock, AlertCircle, CheckCircle, User, 
  Bell, MessageSquare, Wrench, Settings, MapPin, Star, Sparkles,
  AlertTriangle, ChevronRight, Gauge, Droplets, Wind, Disc
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface ServiceRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: typeof Wrench;
  dueIn: string;
  vehicleId?: string;
}

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

  const { data: reminders } = useQuery({
    queryKey: ["/api/customers", user?.id, "service-reminders"],
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

  const allActiveReminders = Array.isArray(reminders)
    ? reminders.filter((r: any) => !r.isCompleted && r.customerId === user?.id)
    : [];
  const activeReminders = allActiveReminders.slice(0, 3);

  const upcomingAppointments = myAppointments.filter(
    (a: any) => a.status === "scheduled" || a.status === "confirmed"
  );

  const pendingInvoices = myInvoices.filter(
    (inv: any) => inv.status === "pending" || inv.status === "sent"
  );

  const serviceRecommendations: ServiceRecommendation[] = myVehicles.length > 0 ? [
    {
      id: "1",
      title: "Oil Change Due Soon",
      description: "Based on your mileage, it's time for an oil change",
      priority: "high",
      icon: Droplets,
      dueIn: "500 km or 2 weeks",
    },
    {
      id: "2", 
      title: "Tire Rotation Recommended",
      description: "Regular rotation extends tire life and improves safety",
      priority: "medium",
      icon: Disc,
      dueIn: "1,000 km",
    },
    {
      id: "3",
      title: "Air Filter Inspection",
      description: "Check air filter for optimal engine performance",
      priority: "low",
      icon: Wind,
      dueIn: "Next service",
    },
  ] : [];

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-page-title">
          Welcome Back, {user?.fullName?.split(" ")[0] || "Customer"}!
        </h1>
        <p className="text-[#64748B] mt-1">
          Here's an overview of your vehicles and service activities
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-stat-vehicles">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">My Vehicles</CardTitle>
            <Car className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            {vehiclesLoading ? (
              <Skeleton className="h-8 w-16 bg-[#E2E8F0] dark:bg-[#232A36]" />
            ) : (
              <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-vehicles-count">
                {myVehicles.length}
              </div>
            )}
            <p className="text-xs text-[#64748B] mt-1">Registered vehicles</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-stat-appointments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">Upcoming Services</CardTitle>
            <Calendar className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <Skeleton className="h-8 w-16 bg-[#E2E8F0] dark:bg-[#232A36]" />
            ) : (
              <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-appointments-count">
                {upcomingAppointments.length}
              </div>
            )}
            <p className="text-xs text-[#64748B] mt-1">Scheduled services</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-stat-reminders">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-reminders-count">
              {allActiveReminders.length}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Maintenance alerts</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-stat-invoices">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">Pending Payments</CardTitle>
            <FileText className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <Skeleton className="h-8 w-16 bg-[#E2E8F0] dark:bg-[#232A36]" />
            ) : (
              <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-pending-invoices-count">
                {pendingInvoices.length}
              </div>
            )}
            <p className="text-xs text-[#64748B] mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {serviceRecommendations.length > 0 && (
        <Card className="border-[#0A5ED7]/20 dark:border-[#0BB3FF]/20 bg-gradient-to-r from-[#0A5ED7]/5 to-[#0BB3FF]/5 dark:from-[#0A5ED7]/10 dark:to-[#0BB3FF]/10" data-testid="card-recommendations">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Sparkles className="h-5 w-5 text-[#0A5ED7]" />
              Service Recommendations
            </CardTitle>
            <CardDescription className="text-[#64748B]">Personalized maintenance suggestions for your vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {serviceRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-lg bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] shadow-sm"
                  data-testid={`recommendation-${rec.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      rec.priority === "high" 
                        ? "bg-[#F97316]/10" 
                        : rec.priority === "medium"
                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                          : "bg-green-100 dark:bg-green-900/30"
                    }`}>
                      <rec.icon className={`h-5 w-5 ${
                        rec.priority === "high" 
                          ? "text-[#F97316]" 
                          : rec.priority === "medium"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-green-600 dark:text-green-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-[#0B1F3B] dark:text-white">{rec.title}</h4>
                        <Badge 
                          variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "secondary" : "outline"}
                          className={rec.priority === "high" ? "bg-[#F97316] text-white" : ""}
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">{rec.description}</p>
                      <p className="text-xs font-medium text-[#0A5ED7] dark:text-[#0BB3FF] mt-2">
                        Due in: {rec.dueIn}
                      </p>
                    </div>
                  </div>
                  <Link href="/client/appointments">
                    <Button size="sm" variant="outline" className="w-full mt-3 border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-gradient-to-r hover:from-[#0A5ED7] hover:to-[#0BB3FF] hover:text-white hover:border-transparent" data-testid={`button-book-${rec.id}`}>
                      Book Service
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-upcoming-services">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Calendar className="h-5 w-5 text-[#0A5ED7]" />
                Upcoming Services
              </CardTitle>
              <CardDescription className="text-[#64748B]">Your scheduled appointments</CardDescription>
            </div>
            <Link href="/client/appointments">
              <Button variant="ghost" size="sm" className="text-[#0A5ED7] hover:text-[#0BB3FF]" data-testid="button-view-all-services">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointmentsLoading ? (
              <>
                <Skeleton className="h-20 w-full bg-[#E2E8F0] dark:bg-[#232A36]" />
                <Skeleton className="h-20 w-full bg-[#E2E8F0] dark:bg-[#232A36]" />
              </>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming services</p>
                <Link href="/client/appointments">
                  <Button variant="link" className="mt-2 text-[#0A5ED7]" data-testid="button-book-first">
                    Book your first appointment
                  </Button>
                </Link>
              </div>
            ) : (
              upcomingAppointments.slice(0, 3).map((appointment: any) => {
                const vehicle = myVehicles.find((v: any) => v.id === appointment.vehicleId);
                return (
                  <div
                    key={appointment.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`upcoming-${appointment.id}`}
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10">
                      <Clock className="h-5 w-5 text-[#0A5ED7]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-[#0B1F3B] dark:text-white">
                        {vehicle?.make} {vehicle?.model}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {appointment.serviceType || "General Service"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-[#64748B]">
                        <Calendar className="h-3 w-3" />
                        {new Date(appointment.scheduledDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <Badge className="bg-[#E2E8F0] dark:bg-[#232A36] text-[#0B1F3B] dark:text-white">{appointment.status}</Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-service-reminders">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Bell className="h-5 w-5 text-[#0A5ED7]" />
                Service Reminders
              </CardTitle>
              <CardDescription className="text-[#64748B]">Maintenance alerts for your vehicles</CardDescription>
            </div>
            <Link href="/client/reminders">
              <Button variant="ghost" size="sm" className="text-[#0A5ED7] hover:text-[#0BB3FF]" data-testid="button-view-all-reminders">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeReminders.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active reminders</p>
                <Link href="/client/reminders">
                  <Button variant="link" className="mt-2 text-[#0A5ED7]" data-testid="button-add-reminder">
                    Set up a reminder
                  </Button>
                </Link>
              </div>
            ) : (
              activeReminders.map((reminder: any) => {
                const vehicle = myVehicles.find((v: any) => v.id === reminder.vehicleId);
                const dueDate = new Date(reminder.dueDate);
                const isOverdue = dueDate < new Date();
                const isDueSoon = !isOverdue && dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                
                return (
                  <div
                    key={reminder.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      isOverdue 
                        ? "border-[#F97316]/50 bg-[#F97316]/5" 
                        : isDueSoon
                          ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20"
                          : "border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]"
                    }`}
                    data-testid={`reminder-${reminder.id}`}
                  >
                    {isOverdue ? (
                      <AlertTriangle className="h-5 w-5 text-[#F97316] mt-0.5" />
                    ) : isDueSoon ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    ) : (
                      <Bell className="h-5 w-5 text-[#0A5ED7] mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="font-medium capitalize text-[#0B1F3B] dark:text-white">
                        {reminder.reminderType?.replace(/_/g, " ") || "Service Reminder"}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {vehicle?.make} {vehicle?.model} - {vehicle?.licensePlate}
                      </p>
                      <p className="text-xs">
                        {isOverdue ? (
                          <span className="text-[#F97316] font-medium">Overdue!</span>
                        ) : (
                          <span className="text-[#64748B]">Due: {dueDate.toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-recent-invoices">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[#0B1F3B] dark:text-white">Recent Invoices</CardTitle>
            <CardDescription className="text-[#64748B]">Your latest service invoices</CardDescription>
          </div>
          <Link href="/client/invoices">
            <Button variant="ghost" size="sm" className="text-[#0A5ED7] hover:text-[#0BB3FF]" data-testid="button-view-all-invoices">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoicesLoading ? (
            <>
              <Skeleton className="h-20 w-full bg-[#E2E8F0] dark:bg-[#232A36]" />
              <Skeleton className="h-20 w-full bg-[#E2E8F0] dark:bg-[#232A36]" />
            </>
          ) : myInvoices.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {myInvoices.map((invoice: any) => {
                const vehicle = myVehicles.find((v: any) => v.id === invoice.vehicleId);
                const isPaid = invoice.status === "paid";
                return (
                  <div
                    key={invoice.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`invoice-${invoice.id}`}
                  >
                    {isPaid ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-[#F97316] mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                        Invoice #{invoice.invoiceNumber}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {vehicle?.make} {vehicle?.model}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                          ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                        </span>
                        <Badge className={isPaid ? "bg-green-500 text-white" : "bg-[#F97316] text-white"}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">Quick Actions</CardTitle>
          <CardDescription className="text-[#64748B]">Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link href="/client/appointments">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] hover:bg-gradient-to-r hover:from-[#0A5ED7]/5 hover:to-[#0BB3FF]/5" data-testid="button-quick-book">
                <Calendar className="h-8 w-8 text-[#0A5ED7]" />
                <span className="text-[#0B1F3B] dark:text-white">Book Appointment</span>
              </Button>
            </Link>
            <Link href="/client/vehicles">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] hover:bg-gradient-to-r hover:from-[#0A5ED7]/5 hover:to-[#0BB3FF]/5" data-testid="button-quick-vehicles">
                <Car className="h-8 w-8 text-green-500" />
                <span className="text-[#0B1F3B] dark:text-white">My Vehicles</span>
              </Button>
            </Link>
            <Link href="/client/reminders">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] hover:bg-gradient-to-r hover:from-[#0A5ED7]/5 hover:to-[#0BB3FF]/5" data-testid="button-quick-reminders">
                <Bell className="h-8 w-8 text-[#F97316]" />
                <span className="text-[#0B1F3B] dark:text-white">Reminders</span>
              </Button>
            </Link>
            <Link href="/client/review-chat">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] hover:bg-gradient-to-r hover:from-[#0A5ED7]/5 hover:to-[#0BB3FF]/5" data-testid="button-quick-chat">
                <MessageSquare className="h-8 w-8 text-purple-500" />
                <span className="text-[#0B1F3B] dark:text-white">Chat with Garage</span>
              </Button>
            </Link>
            <Link href="/client/live-tracking">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] hover:bg-gradient-to-r hover:from-[#0A5ED7]/5 hover:to-[#0BB3FF]/5" data-testid="button-quick-tracking">
                <MapPin className="h-8 w-8 text-red-500" />
                <span className="text-[#0B1F3B] dark:text-white">Track Service</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
