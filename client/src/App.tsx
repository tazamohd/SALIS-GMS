import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { LoginDashboard } from "@/pages/LoginDashboard";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { TasksManagement } from "@/pages/TasksManagement";
import { Appointments } from "@/pages/Appointments";
import { Customers } from "@/pages/Customers";
import { PurchaseOrders } from "@/pages/PurchaseOrders";
import { Invoices } from "@/pages/Invoices";
import { Reports } from "@/pages/Reports";
import { JobCards } from "@/pages/JobCards";
import { Profile } from "@/pages/Profile";
import ServiceTemplates from "@/pages/ServiceTemplates";
import Tools from "@/pages/Tools";
import SpareParts from "@/pages/SpareParts";
import Suppliers from "@/pages/Suppliers";
import { TechnicianPortal } from "@/pages/TechnicianPortal";
import TechnicianManagement from "@/pages/TechnicianManagement";
import Landing from "@/pages/Landing";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

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

  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/dashboard" />} />
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
