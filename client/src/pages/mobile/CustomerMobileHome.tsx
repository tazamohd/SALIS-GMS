import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Car, Clock, DollarSign, Wrench, Bell, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import type { Appointment, Vehicle, Invoice } from "@shared/schema";

export default function CustomerMobileHome() {
  const { data: upcomingAppointments } = useQuery<{ data: Appointment[] }>({
    queryKey: ["/api/appointments"],
  });

  const { data: vehicles } = useQuery<{ data: Vehicle[] }>({
    queryKey: ["/api/vehicles"],
  });

  const { data: recentInvoices } = useQuery<{ data: Invoice[] }>({
    queryKey: ["/api/invoices"],
  });

  const nextAppointment = upcomingAppointments?.data?.find(
    (apt) => apt.status === "scheduled" && new Date(apt.appointmentDate) > new Date()
  );

  const totalVehicles = vehicles?.data?.length || 0;
  const pendingInvoices = recentInvoices?.data?.filter(
    (inv) => inv.status === "pending" || inv.status === "overdue"
  )?.length || 0;

  const quickActions = [
    { 
      icon: Calendar, 
      label: "Book Service", 
      route: "/customer-app/booking", 
      color: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]",
      testId: "quick-action-book"
    },
    { 
      icon: Car, 
      label: "My Vehicles", 
      route: "/customer-app/vehicles", 
      color: "bg-emerald-500",
      testId: "quick-action-vehicles"
    },
    { 
      icon: Clock, 
      label: "History", 
      route: "/invoices", 
      color: "bg-violet-500",
      testId: "quick-action-history"
    },
    { 
      icon: MessageSquare, 
      label: "Support", 
      route: "/chat", 
      color: "bg-[#F97316]",
      testId: "quick-action-support"
    },
  ];

  return (
    <div className="p-4 space-y-4 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <div className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
        <p className="text-blue-100">Manage your vehicles and service appointments</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-4 text-center">
            <Car className="h-6 w-6 mx-auto mb-2 text-[#0A5ED7] dark:text-[#0BB3FF]" />
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{totalVehicles}</div>
            <div className="text-xs text-[#64748B]">Vehicles</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-4 text-center">
            <Wrench className="h-6 w-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
              {upcomingAppointments?.data?.filter(a => a.status === "scheduled").length || 0}
            </div>
            <div className="text-xs text-[#64748B]">Appointments</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-[#F97316]" />
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{pendingInvoices}</div>
            <div className="text-xs text-[#64748B]">Pending</div>
          </CardContent>
        </Card>
      </div>

      {nextAppointment && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#0A5ED7]" />
              <span className="text-[#0B1F3B] dark:text-white">Next Appointment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-[#0B1F3B] dark:text-white">{nextAppointment.serviceType}</p>
                <p className="text-sm text-[#64748B]">
                  {new Date(nextAppointment.appointmentDate).toLocaleDateString()} at{" "}
                  {nextAppointment.appointmentTime}
                </p>
              </div>
              <Link href={`/appointments`}>
                <Button size="sm" variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-view-appointment">
                  View
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3 text-[#0B1F3B] dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.route} href={action.route}>
              <Card 
                className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors cursor-pointer"
                data-testid={action.testId}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`${action.color} p-3 rounded-full mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-[#0B1F3B] dark:text-white">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-base text-[#0B1F3B] dark:text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentInvoices?.data?.slice(0, 3).map((invoice) => (
            <div 
              key={invoice.id} 
              className="flex justify-between items-center py-2 border-b border-[#E2E8F0] dark:border-[#232A36] last:border-0"
              data-testid={`activity-invoice-${invoice.id}`}
            >
              <div>
                <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">Invoice #{invoice.invoiceNumber}</p>
                <p className="text-xs text-[#64748B]">
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">
                  ${Number(invoice.totalAmount).toFixed(2)}
                </p>
                <p className={`text-xs ${
                  invoice.status === "paid" 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-[#F97316]"
                }`}>
                  {invoice.status}
                </p>
              </div>
            </div>
          ))}
          {(!recentInvoices?.data || recentInvoices.data.length === 0) && (
            <p className="text-sm text-[#64748B] text-center py-4">
              No recent activity
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
