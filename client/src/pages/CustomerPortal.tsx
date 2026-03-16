import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car, Calendar, FileText, CreditCard, History, LogOut,
  CheckCircle, Clock, AlertCircle, Wrench, Plus, ChevronRight
} from "lucide-react";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone: string;
}

const SERVICE_TYPES = [
  { value: "oil_change", label: "Oil Change" },
  { value: "brake_service", label: "Brake Service" },
  { value: "ac_service", label: "AC Service" },
  { value: "general_maintenance", label: "General Maintenance" },
  { value: "tire_service", label: "Tire Service" },
  { value: "engine_diagnostic", label: "Engine Diagnostic" },
];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

export default function CustomerPortal() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<string | null>(null);

  // Booking form state
  const [bookingVehicleId, setBookingVehicleId] = useState("");
  const [bookingServiceType, setBookingServiceType] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedToken = localStorage.getItem('portal_token');
    const savedCustomer = localStorage.getItem('portal_customer');

    if (savedToken && savedCustomer) {
      setToken(savedToken);
      setCustomer(JSON.parse(savedCustomer));
      setIsLoggedIn(true);
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

  const fetchWithAuth = async (url: string) => {
    if (!token) throw new Error('No auth token');
    const response = await fetch(url, {
      headers: { 'x-portal-token': token },
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

  // React Query hooks for data fetching
  const { data: vehiclesData } = useQuery({
    queryKey: ['portal-vehicles', customer?.id],
    queryFn: () => fetchWithAuth(`/api/portal/vehicles/${customer?.id}`),
    enabled: isLoggedIn && !!customer?.id,
    staleTime: 30000,
  });

  const { data: jobsData } = useQuery({
    queryKey: ['portal-jobs', customer?.id],
    queryFn: () => fetchWithAuth(`/api/portal/jobs/${customer?.id}`),
    enabled: isLoggedIn && !!customer?.id,
    staleTime: 30000,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['portal-invoices', customer?.id],
    queryFn: () => fetchWithAuth(`/api/portal/invoices/${customer?.id}`),
    enabled: isLoggedIn && !!customer?.id,
    staleTime: 30000,
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ['portal-appointments', customer?.id],
    queryFn: () => fetchWithAuth(`/api/portal/appointments/${customer?.id}`),
    enabled: isLoggedIn && !!customer?.id,
    staleTime: 30000,
  });

  const { data: serviceHistoryData } = useQuery({
    queryKey: ['portal-service-history', selectedVehicleForHistory],
    queryFn: () => fetchWithAuth(`/api/portal/service-history/${selectedVehicleForHistory}`),
    enabled: isLoggedIn && !!selectedVehicleForHistory,
    staleTime: 30000,
  });

  const vehicles = vehiclesData?.vehicles || [];
  const jobs = jobsData?.jobs || [];
  const invoices = invoicesData?.invoices || [];
  const appointments = appointmentsData?.appointments || [];
  const serviceHistory = serviceHistoryData?.history || [];

  // Booking mutation
  const bookAppointment = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/portal/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': token || '',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: t('customers.portal.appointmentBooked', 'Appointment Booked'),
          description: t('customers.portal.appointmentBookedDescription', 'Your service appointment has been requested successfully'),
        });
        setBookingVehicleId("");
        setBookingServiceType("");
        setBookingDate("");
        setBookingTime("");
        setBookingNotes("");
        queryClient.invalidateQueries({ queryKey: ['portal-appointments'] });
      } else {
        toast({
          title: t('common.error', 'Error'),
          description: data.message || t('customers.portal.failedToBook', 'Failed to book appointment'),
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('customers.portal.failedToBook', 'Failed to book appointment'),
        variant: "destructive",
      });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/customer-portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'x-portal-token': token },
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

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    bookAppointment.mutate({
      customerId: customer.id,
      vehicleId: bookingVehicleId,
      serviceType: bookingServiceType,
      preferredDate: bookingDate,
      preferredTime: bookingTime,
      notes: bookingNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon?: any }> = {
      pending: { label: t('common.pending', 'Pending'), variant: "secondary", icon: Clock },
      requested: { label: t('common.requested', 'Requested'), variant: "secondary", icon: Clock },
      confirmed: { label: t('common.confirmed', 'Confirmed'), variant: "default", icon: CheckCircle },
      in_progress: { label: t('common.inProgress', 'In Progress'), variant: "default", icon: Wrench },
      completed: { label: t('common.completed', 'Completed'), variant: "outline", icon: CheckCircle },
      cancelled: { label: t('common.cancelled', 'Cancelled'), variant: "destructive", icon: AlertCircle },
      approved: { label: t('common.approved', 'Approved'), variant: "default", icon: CheckCircle },
      draft: { label: t('common.draft', 'Draft'), variant: "secondary", icon: FileText },
      paid: { label: t('common.paid', 'Paid'), variant: "default", icon: CheckCircle },
      unpaid: { label: t('common.unpaid', 'Unpaid'), variant: "destructive", icon: AlertCircle },
      overdue: { label: t('common.overdue', 'Overdue'), variant: "destructive", icon: AlertCircle },
      sent: { label: t('common.sent', 'Sent'), variant: "default", icon: FileText },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant} data-testid={`badge-${status}`}>{config.label}</Badge>;
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-l-green-500';
      case 'in_progress': return 'border-l-blue-500';
      case 'draft': return 'border-l-gray-400';
      case 'cancelled': return 'border-l-red-500';
      default: return 'border-l-yellow-500';
    }
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
                  placeholder="your@email.com"
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
                  placeholder="********"
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

  // --- Tab: My Vehicles ---
  const vehiclesTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.portal.yourVehicles', 'My Vehicles')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('customers.portal.manageVehicles', 'Your registered vehicles')}</CardDescription>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 mx-auto text-[#64748B] mb-3" />
            <p className="text-[#64748B]">{t('customers.portal.noVehicles', 'No vehicles found')}</p>
            <p className="text-sm text-[#64748B] mt-1">Contact us to register your vehicle</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {vehicles.map((vehicle: any) => (
              <div
                key={vehicle.id}
                className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 space-y-3 bg-[#F8FAFC] dark:bg-[#0E1117] hover:shadow-md transition-shadow"
                data-testid={`vehicle-${vehicle.id}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[#0B1F3B] dark:text-white text-lg">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-sm text-[#64748B] mt-1">{vehicle.licensePlate}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A5ED7]/10 to-[#0BB3FF]/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-[#0A5ED7]" />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {vehicle.vin && (
                    <div>
                      <p className="text-[#64748B] text-xs">VIN</p>
                      <p className="text-[#0B1F3B] dark:text-white font-mono text-xs">{vehicle.vin}</p>
                    </div>
                  )}
                  {vehicle.color && (
                    <div>
                      <p className="text-[#64748B] text-xs">Color</p>
                      <p className="text-[#0B1F3B] dark:text-white">{vehicle.color}</p>
                    </div>
                  )}
                  {vehicle.currentMileage && (
                    <div>
                      <p className="text-[#64748B] text-xs">Mileage</p>
                      <p className="text-[#0B1F3B] dark:text-white">{Number(vehicle.currentMileage).toLocaleString()} km</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setSelectedVehicleForHistory(vehicle.id)}
                  data-testid={`btn-history-${vehicle.id}`}
                >
                  <History className="w-4 h-4 mr-2" />
                  View Service History
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // --- Tab: Book Service ---
  const bookServiceTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('customers.portal.bookService', 'Book a Service')}
        </CardTitle>
        <CardDescription className="text-[#64748B]">Schedule a new service appointment for your vehicle</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBooking} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Vehicle selection */}
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">Select Vehicle</Label>
              <Select value={bookingVehicleId} onValueChange={setBookingVehicleId}>
                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectValue placeholder="Choose a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v: any) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.year} {v.make} {v.model} - {v.licensePlate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service type */}
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">Service Type</Label>
              <Select value={bookingServiceType} onValueChange={setBookingServiceType}>
                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((st) => (
                    <SelectItem key={st.value} value={st.value}>
                      {st.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date picker */}
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">Preferred Date</Label>
              <Input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                required
              />
            </div>

            {/* Time slot */}
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">Preferred Time</Label>
              <Select value={bookingTime} onValueChange={setBookingTime}>
                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">Additional Notes</Label>
            <Textarea
              placeholder="Describe any symptoms or specific concerns..."
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={4}
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
            disabled={!bookingVehicleId || !bookingServiceType || !bookingDate || !bookingTime || bookAppointment.isPending}
            data-testid="button-book-appointment"
          >
            {bookAppointment.isPending ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" /> Booking...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Book Appointment
              </span>
            )}
          </Button>
        </form>

        {/* Existing appointments */}
        {appointments.length > 0 && (
          <div className="mt-8">
            <Separator className="mb-6" />
            <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white mb-4">Your Appointments</h3>
            <div className="space-y-3">
              {appointments.map((appt: any) => (
                <div
                  key={appt.id}
                  className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 bg-[#F8FAFC] dark:bg-[#0E1117] flex items-center justify-between"
                  data-testid={`appointment-${appt.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A5ED7]/10 to-[#0BB3FF]/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#0A5ED7]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0B1F3B] dark:text-white">
                        {SERVICE_TYPES.find(s => s.value === appt.serviceType)?.label || appt.serviceType || 'Service Appointment'}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {appt.scheduledDate ? new Date(appt.scheduledDate).toLocaleDateString() : 'N/A'} at {appt.scheduledTime || 'N/A'}
                      </p>
                      {appt.make && (
                        <p className="text-xs text-[#64748B]">{appt.make} {appt.model} - {appt.licensePlate}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(appt.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // --- Tab: My Jobs ---
  const jobsTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.portal.myJobs', 'My Jobs')}</CardTitle>
        <CardDescription className="text-[#64748B]">Track the status of your service jobs in real time</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 mx-auto text-[#64748B] mb-3" />
            <p className="text-[#64748B]">{t('customers.portal.noJobs', 'No jobs found')}</p>
            <p className="text-sm text-[#64748B] mt-1">Book a service to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: any) => (
              <div
                key={job.id}
                className={`border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-5 bg-[#F8FAFC] dark:bg-[#0E1117] border-l-4 ${getJobStatusColor(job.status)} hover:shadow-md transition-shadow`}
                data-testid={`job-${job.id}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#0B1F3B] dark:text-white text-lg">
                        Job #{job.jobNumber}
                      </p>
                      {getStatusBadge(job.status)}
                    </div>
                    {job.make && (
                      <p className="text-sm text-[#64748B] mt-1">
                        {job.make} {job.model} - {job.licensePlate}
                      </p>
                    )}
                  </div>
                  {job.totalCost && (
                    <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">
                      SAR {Number(job.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
                {job.description && (
                  <p className="text-sm text-[#64748B] mb-3">{job.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-[#64748B]">
                  <span>Created: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</span>
                  {job.completedAt && (
                    <span>Completed: {new Date(job.completedAt).toLocaleDateString()}</span>
                  )}
                </div>

                {/* Progress bar for in-progress jobs */}
                {job.status === 'in_progress' && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                      <Wrench className="w-3 h-3" />
                      <span>Work in progress</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] dark:bg-[#232A36] rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // --- Tab: Invoices & Payments ---
  const invoicesTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.portal.invoicesPayments', 'Invoices & Payments')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('customers.portal.viewInvoices', 'View and manage your invoices')}</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-[#64748B] mb-3" />
            <p className="text-[#64748B]">{t('customers.portal.noInvoices', 'No invoices found')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="rounded-lg border border-[#E2E8F0] dark:border-[#232A36] p-4 bg-[#F8FAFC] dark:bg-[#0E1117]">
                <p className="text-xs text-[#64748B] uppercase tracking-wide">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-500 mt-1">
                  SAR {invoices
                    .filter((inv: any) => inv.status !== 'paid')
                    .reduce((sum: number, inv: any) => sum + Number(inv.totalAmount || 0), 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] dark:border-[#232A36] p-4 bg-[#F8FAFC] dark:bg-[#0E1117]">
                <p className="text-xs text-[#64748B] uppercase tracking-wide">Total Paid</p>
                <p className="text-2xl font-bold text-green-500 mt-1">
                  SAR {invoices
                    .filter((inv: any) => inv.status === 'paid')
                    .reduce((sum: number, inv: any) => sum + Number(inv.totalAmount || 0), 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] dark:border-[#232A36] p-4 bg-[#F8FAFC] dark:bg-[#0E1117]">
                <p className="text-xs text-[#64748B] uppercase tracking-wide">Total Invoices</p>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white mt-1">{invoices.length}</p>
              </div>
            </div>

            {/* Invoice list */}
            {invoices.map((inv: any) => (
              <div
                key={inv.id}
                className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-5 bg-[#F8FAFC] dark:bg-[#0E1117] hover:shadow-md transition-shadow"
                data-testid={`invoice-${inv.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#0B1F3B] dark:text-white">Invoice #{inv.invoiceNumber}</p>
                      {getStatusBadge(inv.status)}
                    </div>
                    <p className="text-sm text-[#64748B] mt-1">
                      Issued: {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">
                      SAR {Number(inv.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    {inv.taxAmount && (
                      <p className="text-xs text-[#64748B]">
                        incl. VAT: SAR {Number(inv.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
                {inv.status !== 'paid' && (
                  <>
                    <Separator className="my-3" />
                    <Button
                      className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
                      onClick={() => {
                        toast({
                          title: "Payment Gateway",
                          description: "Online payment integration coming soon. Please contact us for payment options.",
                        });
                      }}
                      data-testid={`btn-pay-${inv.id}`}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Now
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

  // --- Tab: Service History ---
  const serviceHistoryTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.portal.serviceHistory', 'Service History')}</CardTitle>
        <CardDescription className="text-[#64748B]">View complete service records per vehicle</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Vehicle selector */}
        <div className="mb-6">
          <Label className="text-[#0B1F3B] dark:text-white mb-2 block">Select a vehicle to view its history</Label>
          <Select value={selectedVehicleForHistory || ""} onValueChange={setSelectedVehicleForHistory}>
            <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] max-w-md">
              <SelectValue placeholder="Choose a vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v: any) => (
                <SelectItem key={v.id} value={String(v.id)}>
                  {v.year} {v.make} {v.model} - {v.licensePlate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedVehicleForHistory ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto text-[#64748B] mb-3" />
            <p className="text-[#64748B]">Select a vehicle above to view its service history</p>
          </div>
        ) : serviceHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto text-[#64748B] mb-3" />
            <p className="text-[#64748B]">{t('customers.portal.noServiceHistory', 'No service history found for this vehicle')}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0A5ED7] to-[#0BB3FF]" />

            <div className="space-y-6">
              {serviceHistory.map((record: any, index: number) => (
                <div key={record.id} className="relative pl-12" data-testid={`history-${record.id}`}>
                  {/* Timeline dot */}
                  <div className={`absolute left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    record.status === 'completed'
                      ? 'bg-green-500 border-green-600'
                      : record.status === 'in_progress'
                      ? 'bg-blue-500 border-blue-600'
                      : 'bg-gray-400 border-gray-500'
                  }`}>
                    {record.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                    {record.status === 'in_progress' && <Wrench className="w-3 h-3 text-white" />}
                    {record.status !== 'completed' && record.status !== 'in_progress' && <Clock className="w-3 h-3 text-white" />}
                  </div>

                  <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 bg-[#F8FAFC] dark:bg-[#0E1117] hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#0B1F3B] dark:text-white">
                            Job #{record.jobNumber}
                          </p>
                          {getStatusBadge(record.status)}
                        </div>
                        <p className="text-xs text-[#64748B] mt-1">
                          {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
                          {record.completedAt && ` - ${new Date(record.completedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      {record.totalCost && (
                        <p className="font-bold text-[#0B1F3B] dark:text-white">
                          SAR {Number(record.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                    {record.description && (
                      <p className="text-sm text-[#64748B] mt-2">{record.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
          id: "vehicles",
          label: t('customers.portal.myVehicles', 'My Vehicles'),
          icon: Car,
          content: vehiclesTab,
          badge: vehicles.length || undefined,
        },
        {
          id: "book-service",
          label: t('customers.portal.bookService', 'Book Service'),
          icon: Calendar,
          content: bookServiceTab,
        },
        {
          id: "jobs",
          label: t('customers.portal.myJobs', 'My Jobs'),
          icon: Wrench,
          content: jobsTab,
          badge: jobs.filter((j: any) => j.status === 'in_progress').length || undefined,
        },
        {
          id: "invoices",
          label: t('customers.portal.invoicesPayments', 'Invoices & Payments'),
          icon: CreditCard,
          content: invoicesTab,
          badge: invoices.filter((i: any) => i.status !== 'paid').length || undefined,
        },
        {
          id: "history",
          label: t('customers.portal.serviceHistory', 'Service History'),
          icon: History,
          content: serviceHistoryTab,
        },
      ]}
      defaultTab="vehicles"
    />
  );
}
