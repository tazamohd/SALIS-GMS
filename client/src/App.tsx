import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { LoginDashboard } from "@/pages/LoginDashboard";
import { Layout } from "@/components/Layout";
import { CustomerPortalLayout } from "@/components/CustomerPortalLayout";
import { Dashboard } from "@/pages/Dashboard";
import { TasksManagement } from "@/pages/TasksManagement";
import { Appointments } from "@/pages/Appointments";
import { Customers } from "@/pages/Customers";
import Vehicles from "@/pages/Vehicles";
import { PurchaseOrders } from "@/pages/PurchaseOrders";
import { Invoices } from "@/pages/Invoices";
import { Estimates } from "@/pages/Estimates";
import { Reports } from "@/pages/Reports";
import { JobCards } from "@/pages/JobCards";
import { Profile } from "@/pages/Profile";
import ServiceTemplates from "@/pages/ServiceTemplates";
import Tools from "@/pages/Tools";
import SpareParts from "@/pages/SpareParts";
import Suppliers from "@/pages/Suppliers";
import { TechnicianPortal } from "@/pages/TechnicianPortal";
import TechnicianManagement from "@/pages/TechnicianManagement";
import Notifications from "@/pages/Notifications";
import Landing from "@/pages/Landing";
import { CustomerDashboard } from "@/pages/customer/CustomerDashboard";
import { CustomerAppointments } from "@/pages/customer/CustomerAppointments";
import { CustomerInvoices } from "@/pages/customer/CustomerInvoices";
import { CustomerVehicles } from "@/pages/customer/CustomerVehicles";
import { CustomerCommunications } from "@/pages/customer/CustomerCommunications";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  // Check if user is a customer
  const isCustomer = user?.userType === 'customer';

  return (
    <Switch>
      {/* Root redirect based on user type */}
      <Route path="/" component={() => (
        <Redirect to={isCustomer ? "/portal/dashboard" : "/dashboard"} />
      )} />

      {/* Customer Portal Routes */}
      <Route path="/portal/dashboard">
        <CustomerPortalLayout>
          <CustomerDashboard />
        </CustomerPortalLayout>
      </Route>
      <Route path="/portal/appointments">
        <CustomerPortalLayout>
          <CustomerAppointments />
        </CustomerPortalLayout>
      </Route>
      <Route path="/portal/invoices">
        <CustomerPortalLayout>
          <CustomerInvoices />
        </CustomerPortalLayout>
      </Route>
      <Route path="/portal/vehicles">
        <CustomerPortalLayout>
          <CustomerVehicles />
        </CustomerPortalLayout>
      </Route>
      <Route path="/portal/communications">
        <CustomerPortalLayout>
          <CustomerCommunications />
        </CustomerPortalLayout>
      </Route>

      {/* Garage Management Routes */}
      <Route path="/old-dashboard" component={LoginDashboard} />
      <Route path="/dashboard">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/tasks">
        <Layout>
          <TasksManagement />
        </Layout>
      </Route>
      <Route path="/appointments">
        <Layout>
          <Appointments />
        </Layout>
      </Route>
      <Route path="/customers">
        <Layout>
          <Customers />
        </Layout>
      </Route>
      <Route path="/vehicles">
        <Layout>
          <Vehicles />
        </Layout>
      </Route>
      <Route path="/purchase-orders">
        <Layout>
          <PurchaseOrders />
        </Layout>
      </Route>
      <Route path="/invoices">
        <Layout>
          <Invoices />
        </Layout>
      </Route>
      <Route path="/estimates">
        <Layout>
          <Estimates />
        </Layout>
      </Route>
      <Route path="/reports">
        <Layout>
          <Reports />
        </Layout>
      </Route>
      <Route path="/job-cards">
        <Layout>
          <JobCards />
        </Layout>
      </Route>
      <Route path="/service-templates">
        <Layout>
          <ServiceTemplates />
        </Layout>
      </Route>
      <Route path="/tools">
        <Layout>
          <Tools />
        </Layout>
      </Route>
      <Route path="/spare-parts">
        <Layout>
          <SpareParts />
        </Layout>
      </Route>
      <Route path="/suppliers">
        <Layout>
          <Suppliers />
        </Layout>
      </Route>
      <Route path="/technician-portal">
        <Layout>
          <TechnicianPortal />
        </Layout>
      </Route>
      <Route path="/technician-management">
        <Layout>
          <TechnicianManagement />
        </Layout>
      </Route>
      <Route path="/profile">
        <Layout>
          <Profile />
        </Layout>
      </Route>
      <Route path="/notifications">
        <Layout>
          <Notifications />
        </Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
