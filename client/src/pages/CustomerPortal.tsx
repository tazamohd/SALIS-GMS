import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      title: t('auth.sessionExpired', 'Session Expired'),
      description: t('auth.pleaseLogInAgain', 'Please log in again'),
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
      throw new Error(t('auth.sessionExpiredOrUnauthorized', 'Session expired or unauthorized'));
    }
    
    if (!response.ok) {
      throw new Error(t('common.failedToFetch', 'Failed to fetch'));
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
        title: t('common.error', 'Error'),
        description: t('customers.portal.failedToLoadData', 'Failed to load your data'),
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
        throw new Error(error.message || t('auth.loginFailed', 'Login failed'));
      }
      
      const data = await response.json();
      
      setToken(data.token);
      setCustomer(data.customer);
      setIsLoggedIn(true);
      
      localStorage.setItem('portal_token', data.token);
      localStorage.setItem('portal_customer', JSON.stringify(data.customer));
      
      await fetchAllData(data.token);
      
      toast({
        title: t('customers.portal.welcome', 'Welcome!'),
        description: t('customers.portal.loggedInAs', 'Logged in as') + ` ${data.customer.fullName}`,
      });
    } catch (error: any) {
      toast({
        title: t('auth.loginFailed', 'Login Failed'),
        description: error.message || t('auth.invalidCredentials', 'Invalid credentials'),
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
        title: t('auth.loggedOut', 'Logged Out'),
        description: t('auth.loggedOutSuccessfully', 'You have been logged out successfully'),
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
        throw new Error(t('customers.portal.failedToApproveEstimate', 'Failed to approve estimate'));
      }
      
      await fetchAllData(token);
      
      toast({
        title: t('customers.portal.estimateApproved', 'Estimate Approved'),
        description: t('customers.portal.estimateApprovedDescription', 'The estimate has been approved successfully'),
      });
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('customers.portal.failedToApproveEstimate', 'Failed to approve estimate'),
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pending: { label: t('common.pending', 'Pending'), variant: "secondary" },
      confirmed: { label: t('common.confirmed', 'Confirmed'), variant: "default" },
      completed: { label: t('common.completed', 'Completed'), variant: "outline" },
      cancelled: { label: t('common.cancelled', 'Cancelled'), variant: "destructive" },
      approved: { label: t('common.approved', 'Approved'), variant: "default" },
      draft: { label: t('common.draft', 'Draft'), variant: "secondary" },
      paid: { label: t('common.paid', 'Paid'), variant: "default" },
      unpaid: { label: t('common.unpaid', 'Unpaid'), variant: "destructive" },
    };
    
    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant} data-testid={`badge-${status}`}>{config.label}</Badge>;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] p-4">
        <Card className="w-full max-w-md bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-montserrat font-semibold text-[#0B1F3B] dark:text-white">{t('customers.portal.title', 'Customer Portal')}</CardTitle>
              <CardDescription>{t('customers.portal.description', 'Access your service history and appointments')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0B1F3B] dark:text-white">{t('auth.email', 'Email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0B1F3B] dark:text-white">{t('auth.password', 'Password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder', '••••••••')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? t('auth.loggingIn', 'Logging in...') : t('auth.login', 'Login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appointmentsTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.portal.yourAppointments', 'Your Appointments')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('customers.portal.manageAppointments', 'View and manage your service appointments')}</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-center text-[#64748B] py-8">{t('customers.portal.noAppointments', 'No appointments found')}</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt: any) => (
              <div 
                key={appt.id} 
                className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 space-y-2 bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`appointment-${appt.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">{appt.serviceType || t('customers.portal.serviceAppointment', 'Service Appointment')}</p>
                    <p className="text-sm text-[#64748B]">
                      {new Date(appt.appointmentDate).toLocaleDateString()} {t('common.at', 'at')}{' '}
                      {appt.appointmentTime}
                    </p>
                  </div>
                  {getStatusBadge(appt.status)}
                </div>
                {appt.notes && (
                  <p className="text-sm text-[#64748B]">{appt.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const vehiclesTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.portal.yourVehicles', 'Your Vehicles')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('customers.portal.manageVehicles', 'Manage your registered vehicles')}</CardDescription>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <p className="text-center text-[#64748B] py-8">{t('customers.portal.noVehicles', 'No vehicles found')}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {vehicles.map((vehicle: any) => (
              <div 
                key={vehicle.id} 
                className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 space-y-2 bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`vehicle-${vehicle.id}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-sm text-[#64748B]">{vehicle.licensePlate}</p>
                    <p className="text-xs text-[#64748B]">{t('vehicles.vin', 'VIN')}: {vehicle.vin}</p>
                  </div>
                  <Car className="w-8 h-8 text-[#64748B]" />
                </div>
                {vehicle.currentMileage && (
                  <p className="text-sm text-[#64748B]">
                    {vehicle.currentMileage.toLocaleString()} {t('vehicles.miles', 'miles')}
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
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.portal.serviceHistory', 'Service History')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('customers.portal.viewServiceRecords', 'View your complete service records')}</CardDescription>
      </CardHeader>
      <CardContent>
        {serviceHistory.length === 0 ? (
          <p className="text-center text-[#64748B] py-8">{t('customers.portal.noServiceHistory', 'No service history found')}</p>
        ) : (
          <div className="space-y-4">
            {serviceHistory.map((record: any) => (
              <div 
                key={record.history.id} 
                className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 space-y-2 bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`history-${record.history.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">{record.history.serviceType}</p>
                    <p className="text-sm text-[#64748B]">
                      {new Date(record.history.serviceDate).toLocaleDateString()}
                    </p>
                    {record.vehicle && (
                      <p className="text-sm text-[#64748B]">
                        {record.vehicle.make} {record.vehicle.model}
                      </p>
                    )}
                  </div>
                  {record.history.cost && (
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">${record.history.cost}</p>
                  )}
                </div>
                {record.history.description && (
                  <p className="text-sm text-[#64748B]">{record.history.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const estimatesTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.portal.estimates', 'Estimates')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('customers.portal.reviewEstimates', 'Review and approve service estimates')}</CardDescription>
      </CardHeader>
      <CardContent>
        {estimates.length === 0 ? (
          <p className="text-center text-[#64748B] py-8">{t('customers.portal.noEstimates', 'No estimates found')}</p>
        ) : (
          <div className="space-y-4">
            {estimates.map((est: any) => (
              <div 
                key={est.estimate.id} 
                className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 space-y-3 bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`estimate-${est.estimate.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">{t('estimates.estimateNumber', 'Estimate')} #{est.estimate.estimateNumber}</p>
                    <p className="text-sm text-[#64748B]">
                      {new Date(est.estimate.createdAt).toLocaleDateString()}
                    </p>
                    {est.vehicle && (
                      <p className="text-sm text-[#64748B]">
                        {est.vehicle.make} {est.vehicle.model}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                      ${est.estimate.totalAmount}
                    </p>
                    {getStatusBadge(est.estimate.status)}
                  </div>
                </div>
                {est.estimate.notes && (
                  <p className="text-sm text-[#64748B]">{est.estimate.notes}</p>
                )}
                {est.estimate.status === 'pending' && (
                  <>
                    <Separator />
                    <Button
                      onClick={() => approveEstimate(est.estimate.id)}
                      className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
                      data-testid={`button-approve-${est.estimate.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('customers.portal.approveEstimate', 'Approve Estimate')}
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
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.portal.invoices', 'Invoices')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('customers.portal.viewInvoices', 'View your service invoices')}</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-center text-[#64748B] py-8">{t('customers.portal.noInvoices', 'No invoices found')}</p>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv: any) => (
              <div 
                key={inv.id} 
                className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 space-y-2 bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`invoice-${inv.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">{t('invoices.invoiceNumber', 'Invoice')} #{inv.invoiceNumber}</p>
                    <p className="text-sm text-[#64748B]">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-[#64748B]">{t('invoices.dueDate', 'Due')}: {new Date(inv.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">
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
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.portal.paymentHistory', 'Payment History')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('customers.portal.viewPayments', 'View all your payment transactions')}</CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-center text-[#64748B] py-8">{t('customers.portal.noPayments', 'No payments found')}</p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <div 
                key={payment.payment.id} 
                className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 space-y-2 bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`payment-${payment.payment.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">
                      {t('payments.payment', 'Payment')} - {payment.payment.paymentMethod}
                    </p>
                    <p className="text-sm text-[#64748B]">
                      {new Date(payment.payment.paymentDate).toLocaleDateString()}
                    </p>
                    {payment.invoice && (
                      <p className="text-xs text-[#64748B]">
                        {t('invoices.invoice', 'Invoice')}: {payment.invoice.invoiceNumber}
                      </p>
                    )}
                  </div>
                  <p className="text-xl font-bold text-green-500">
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
      title={`${t('customers.portal.welcomeUser', 'Welcome')}, ${customer?.fullName}`}
      description={customer?.email || t('customers.portal.title', 'Customer Portal')}
      icon={Car}
      primaryAction={{
        label: t('auth.logout', 'Logout'),
        icon: LogOut,
        onClick: handleLogout,
        variant: "outline",
        testId: "button-logout",
      }}
      tabs={[
        {
          id: "appointments",
          label: t('nav.appointments', 'Appointments'),
          icon: Calendar,
          content: appointmentsTab,
        },
        {
          id: "vehicles",
          label: t('nav.vehicles', 'Vehicles'),
          icon: Car,
          content: vehiclesTab,
        },
        {
          id: "history",
          label: t('customers.portal.history', 'History'),
          icon: History,
          content: historyTab,
        },
        {
          id: "estimates",
          label: t('nav.estimates', 'Estimates'),
          icon: FileText,
          content: estimatesTab,
        },
        {
          id: "invoices",
          label: t('nav.invoices', 'Invoices'),
          icon: FileText,
          content: invoicesTab,
        },
        {
          id: "payments",
          label: t('customers.portal.payments', 'Payments'),
          icon: CreditCard,
          content: paymentsTab,
        },
      ]}
      defaultTab="appointments"
    />
  );
}
