import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Car, Calendar, FileText, CreditCard, History, LogOut, 
  CheckCircle, Clock, AlertCircle 
} from "lucide-react";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone: string;
}

export default function CustomerPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem('portal_token');
    const savedCustomer = localStorage.getItem('portal_customer');
    
    if (savedToken && savedCustomer) {
      setToken(savedToken);
      setCustomer(JSON.parse(savedCustomer));
      setIsLoggedIn(true);
      fetchAllData(savedToken);
    }
  }, []);

  const forceLogout = () => {
    setToken(null);
    setCustomer(null);
    setIsLoggedIn(false);
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_customer');
    toast({
      title: "Session Expired",
      description: "Please log in again",
      variant: "destructive",
    });
  };

  const fetchWithAuth = async (url: string, token: string) => {
    const response = await fetch(url, {
      headers: {
        'x-portal-token': token,
      },
    });
    
    if (response.status === 401 || response.status === 403) {
      forceLogout();
      throw new Error('Session expired or unauthorized');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    
    return response.json();
  };

  const fetchAllData = async (authToken: string) => {
    try {
      const [appts, vehs, history, ests, invs, pays] = await Promise.all([
        fetchWithAuth('/api/customer-portal/appointments', authToken),
        fetchWithAuth('/api/customer-portal/vehicles', authToken),
        fetchWithAuth('/api/customer-portal/service-history', authToken),
        fetchWithAuth('/api/customer-portal/estimates', authToken),
        fetchWithAuth('/api/customer-portal/invoices', authToken),
        fetchWithAuth('/api/customer-portal/payments', authToken),
      ]);
      
      setAppointments(appts);
      setVehicles(vehs);
      setServiceHistory(history);
      setEstimates(ests);
      setInvoices(invs);
      setPayments(pays);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load your data",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/customer-portal/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      
      setToken(data.token);
      setCustomer(data.customer);
      setIsLoggedIn(true);
      
      localStorage.setItem('portal_token', data.token);
      localStorage.setItem('portal_customer', JSON.stringify(data.customer));
      
      await fetchAllData(data.token);
      
      toast({
        title: "Welcome!",
        description: `Logged in as ${data.customer.fullName}`,
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!token) return;
    
    try {
      await fetch('/api/customer-portal/logout', {
        method: 'POST',
        headers: {
          'x-portal-token': token,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setCustomer(null);
      setIsLoggedIn(false);
      localStorage.removeItem('portal_token');
      localStorage.removeItem('portal_customer');
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    }
  };

  const approveEstimate = async (estimateId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/customer-portal/estimates/${estimateId}/approve`, {
        method: 'POST',
        headers: {
          'x-portal-token': token,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve estimate');
      }
      
      await fetchAllData(token);
      
      toast({
        title: "Estimate Approved",
        description: "The estimate has been approved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve estimate",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pending: { label: "Pending", variant: "secondary" },
      confirmed: { label: "Confirmed", variant: "default" },
      completed: { label: "Completed", variant: "outline" },
      cancelled: { label: "Cancelled", variant: "destructive" },
      approved: { label: "Approved", variant: "default" },
      draft: { label: "Draft", variant: "secondary" },
      paid: { label: "Paid", variant: "default" },
      unpaid: { label: "Unpaid", variant: "destructive" },
    };
    
    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant} data-testid={`badge-${status}`}>{config.label}</Badge>;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-salis-black to-gray-900 p-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-salis-black to-salis-50-black rounded-full flex items-center justify-center">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-montserrat font-semibold">Customer Portal</CardTitle>
              <CardDescription>Access your service history and appointments</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-salis-black hover:bg-salis-gray text-white"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appointmentsTab = (
    <Card>
      <CardHeader>
        <CardTitle>Your Appointments</CardTitle>
        <CardDescription>View and manage your service appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-center text-salis-gray py-8">No appointments found</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt: any) => (
              <div 
                key={appt.id} 
                className="border rounded-lg p-4 space-y-2"
                data-testid={`appointment-${appt.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{appt.serviceType || 'Service Appointment'}</p>
                    <p className="text-sm text-salis-gray">
                      {new Date(appt.appointmentDate).toLocaleDateString()} at{' '}
                      {appt.appointmentTime}
                    </p>
                  </div>
                  {getStatusBadge(appt.status)}
                </div>
                {appt.notes && (
                  <p className="text-sm text-salis-gray">{appt.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const vehiclesTab = (
    <Card>
      <CardHeader>
        <CardTitle>Your Vehicles</CardTitle>
        <CardDescription>Manage your registered vehicles</CardDescription>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <p className="text-center text-salis-gray py-8">No vehicles found</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {vehicles.map((vehicle: any) => (
              <div 
                key={vehicle.id} 
                className="border rounded-lg p-4 space-y-2"
                data-testid={`vehicle-${vehicle.id}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-sm text-salis-gray">{vehicle.licensePlate}</p>
                    <p className="text-xs text-salis-gray">VIN: {vehicle.vin}</p>
                  </div>
                  <Car className="w-8 h-8 text-salis-gray" />
                </div>
                {vehicle.currentMileage && (
                  <p className="text-sm text-salis-gray">
                    {vehicle.currentMileage.toLocaleString()} miles
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const historyTab = (
    <Card>
      <CardHeader>
        <CardTitle>Service History</CardTitle>
        <CardDescription>View your complete service records</CardDescription>
      </CardHeader>
      <CardContent>
        {serviceHistory.length === 0 ? (
          <p className="text-center text-salis-gray py-8">No service history found</p>
        ) : (
          <div className="space-y-4">
            {serviceHistory.map((record: any) => (
              <div 
                key={record.history.id} 
                className="border rounded-lg p-4 space-y-2"
                data-testid={`history-${record.history.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{record.history.serviceType}</p>
                    <p className="text-sm text-salis-gray">
                      {new Date(record.history.serviceDate).toLocaleDateString()}
                    </p>
                    {record.vehicle && (
                      <p className="text-sm text-salis-gray">
                        {record.vehicle.make} {record.vehicle.model}
                      </p>
                    )}
                  </div>
                  {record.history.cost && (
                    <p className="font-semibold">${record.history.cost}</p>
                  )}
                </div>
                {record.history.description && (
                  <p className="text-sm text-salis-gray">{record.history.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const estimatesTab = (
    <Card>
      <CardHeader>
        <CardTitle>Estimates</CardTitle>
        <CardDescription>Review and approve service estimates</CardDescription>
      </CardHeader>
      <CardContent>
        {estimates.length === 0 ? (
          <p className="text-center text-salis-gray py-8">No estimates found</p>
        ) : (
          <div className="space-y-4">
            {estimates.map((est: any) => (
              <div 
                key={est.estimate.id} 
                className="border rounded-lg p-4 space-y-3"
                data-testid={`estimate-${est.estimate.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Estimate #{est.estimate.estimateNumber}</p>
                    <p className="text-sm text-salis-gray">
                      {new Date(est.estimate.createdAt).toLocaleDateString()}
                    </p>
                    {est.vehicle && (
                      <p className="text-sm text-salis-gray">
                        {est.vehicle.make} {est.vehicle.model}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-salis-black dark:text-white">
                      ${est.estimate.totalAmount}
                    </p>
                    {getStatusBadge(est.estimate.status)}
                  </div>
                </div>
                {est.estimate.notes && (
                  <p className="text-sm text-salis-gray">{est.estimate.notes}</p>
                )}
                {est.estimate.status === 'pending' && (
                  <>
                    <Separator />
                    <Button
                      onClick={() => approveEstimate(est.estimate.id)}
                      className="w-full bg-salis-black hover:bg-salis-gray text-white"
                      data-testid={`button-approve-${est.estimate.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Estimate
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const invoicesTab = (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>View your service invoices</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-center text-salis-gray py-8">No invoices found</p>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv: any) => (
              <div 
                key={inv.id} 
                className="border rounded-lg p-4 space-y-2"
                data-testid={`invoice-${inv.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Invoice #{inv.invoiceNumber}</p>
                    <p className="text-sm text-salis-gray">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-salis-gray">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-salis-black dark:text-white">
                      ${inv.totalAmount}
                    </p>
                    {getStatusBadge(inv.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const paymentsTab = (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View all your payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-center text-salis-gray py-8">No payments found</p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <div 
                key={payment.payment.id} 
                className="border rounded-lg p-4 space-y-2"
                data-testid={`payment-${payment.payment.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      Payment - {payment.payment.paymentMethod}
                    </p>
                    <p className="text-sm text-salis-gray">
                      {new Date(payment.payment.paymentDate).toLocaleDateString()}
                    </p>
                    {payment.invoice && (
                      <p className="text-xs text-salis-gray">
                        Invoice: {payment.invoice.invoiceNumber}
                      </p>
                    )}
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    ${payment.payment.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <TabsPageLayout
      title={`Welcome, ${customer?.fullName}`}
      description={customer?.email || "Customer Portal"}
      icon={Car}
      primaryAction={{
        label: "Logout",
        icon: LogOut,
        onClick: handleLogout,
        variant: "outline",
        testId: "button-logout",
      }}
      tabs={[
        {
          id: "appointments",
          label: "Appointments",
          icon: Calendar,
          content: appointmentsTab,
        },
        {
          id: "vehicles",
          label: "Vehicles",
          icon: Car,
          content: vehiclesTab,
        },
        {
          id: "history",
          label: "History",
          icon: History,
          content: historyTab,
        },
        {
          id: "estimates",
          label: "Estimates",
          icon: FileText,
          content: estimatesTab,
        },
        {
          id: "invoices",
          label: "Invoices",
          icon: FileText,
          content: invoicesTab,
        },
        {
          id: "payments",
          label: "Payments",
          icon: CreditCard,
          content: paymentsTab,
        },
      ]}
      defaultTab="appointments"
    />
  );
}
