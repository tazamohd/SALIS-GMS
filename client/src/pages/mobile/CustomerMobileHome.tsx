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
      color: "bg-blue-500",
      testId: "quick-action-book"
    },
    { 
      icon: Car, 
      label: "My Vehicles", 
      route: "/customer-app/vehicles", 
      color: "bg-green-500",
      testId: "quick-action-vehicles"
    },
    { 
      icon: Clock, 
      label: "History", 
      route: "/customer-app/history", 
      color: "bg-purple-500",
      testId: "quick-action-history"
    },
    { 
      icon: MessageSquare, 
      label: "Support", 
      route: "/chat", 
      color: "bg-orange-500",
      testId: "quick-action-support"
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
        <p className="text-blue-100">Manage your vehicles and service appointments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <Car className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalVehicles}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Vehicles</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <Wrench className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {upcomingAppointments?.data?.filter(a => a.status === "scheduled").length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Appointments</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{pendingInvoices}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment */}
      {nextAppointment && (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="text-gray-900 dark:text-white">Next Appointment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{nextAppointment.serviceType}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(nextAppointment.appointmentDate).toLocaleDateString()} at{" "}
                  {nextAppointment.appointmentTime}
                </p>
              </div>
              <Link href={`/appointments`}>
                <Button size="sm" variant="outline" data-testid="button-view-appointment">
                  View
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.route} href={action.route}>
              <Card 
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                data-testid={action.testId}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`${action.color} p-3 rounded-full mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base text-gray-900 dark:text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentInvoices?.data?.slice(0, 3).map((invoice) => (
            <div 
              key={invoice.id} 
              className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              data-testid={`activity-invoice-${invoice.id}`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Invoice #{invoice.invoiceNumber}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${Number(invoice.totalAmount).toFixed(2)}
                </p>
                <p className={`text-xs ${
                  invoice.status === "paid" 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-orange-600 dark:text-orange-400"
                }`}>
                  {invoice.status}
                </p>
              </div>
            </div>
          ))}
          {(!recentInvoices?.data || recentInvoices.data.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No recent activity
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
