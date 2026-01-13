import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Users, Search, Car, Phone, Mail, MessageSquare, Building2, Trash2, FileText, AlertCircle, DollarSign, ClipboardList, Send, CheckCircle, Clock, XCircle, Eye, Shield, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AddVehicleDialog } from "@/components/AddVehicleDialog";
import { AddCustomerNoteDialog } from "@/components/AddCustomerNoteDialog";
import { AddCustomerDialog } from "@/components/AddCustomerDialog";
import { JobCardDetailsDialog } from "@/components/JobCardDetailsDialog";
import { InvoiceDetailsDialog } from "@/components/InvoiceDetailsDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { RoleBadge } from "@/components/RoleBadge";
import type { User, Vehicle, Garage, CustomerNote } from "@shared/schema";
import { StandardPageLayout } from "@/components/layouts";

export function Customers() {
  const { t } = useTranslation();
  const { canCreate, canEdit, canDelete, canView, hasPermission, getRoleDisplayName } = usePermissions();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const customersQueryParams = new URLSearchParams();
  if (selectedGarageId !== "all") {
    customersQueryParams.append("garage_id", selectedGarageId);
  }
  if (searchQuery) {
    customersQueryParams.append("search", searchQuery);
  }
  const customersUrl = `/api/customers${customersQueryParams.toString() ? `?${customersQueryParams.toString()}` : ''}`;

  const { data: customers, isLoading } = useQuery<User[]>({
    queryKey: [customersUrl],
    retry: false,
  });

  const { data: selectedCustomer } = useQuery<User>({
    queryKey: ['/api/customers', selectedCustomerId],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${selectedCustomerId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch customer');
      return res.json();
    },
    enabled: !!selectedCustomerId,
  });

  const { data: customerVehicles, isLoading: vehiclesLoading, error: vehiclesError } = useQuery<Vehicle[]>({
    queryKey: ['/api/customers', selectedCustomerId, 'vehicles'],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${selectedCustomerId}/vehicles`, { credentials: 'include' });
      if (!res.ok) {
        console.error('Failed to fetch vehicles:', res.status, res.statusText);
        throw new Error('Failed to fetch vehicles');
      }
      return res.json();
    },
    enabled: !!selectedCustomerId,
    retry: 1,
  });

  const { data: customerNotes, isLoading: notesLoading, error: notesError } = useQuery<CustomerNote[]>({
    queryKey: ['/api/customers', selectedCustomerId, 'notes'],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${selectedCustomerId}/notes`, { credentials: 'include' });
      if (!res.ok) {
        console.error('Failed to fetch notes:', res.status, res.statusText);
        throw new Error('Failed to fetch notes');
      }
      return res.json();
    },
    enabled: !!selectedCustomerId,
    retry: 1,
  });

  const { data: customerJobCards, isLoading: jobsLoading, error: jobsError } = useQuery<any[]>({
    queryKey: ['/api/customers', selectedCustomerId, 'job-cards'],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${selectedCustomerId}/job-cards`, { credentials: 'include' });
      if (!res.ok) {
        console.error('Failed to fetch job cards:', res.status, res.statusText);
        throw new Error('Failed to fetch job cards');
      }
      return res.json();
    },
    enabled: !!selectedCustomerId,
    retry: 1,
  });

  const { data: customerInvoices, isLoading: invoicesLoading, error: invoicesError } = useQuery<any[]>({
    queryKey: ['/api/customers', selectedCustomerId, 'invoices'],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${selectedCustomerId}/invoices`, { credentials: 'include' });
      if (!res.ok) {
        console.error('Failed to fetch invoices:', res.status, res.statusText);
        throw new Error('Failed to fetch invoices');
      }
      return res.json();
    },
    enabled: !!selectedCustomerId,
    retry: 1,
  });

  const { data: customerPayments, isLoading: paymentsLoading, error: paymentsError } = useQuery<any[]>({
    queryKey: ['/api/customers', selectedCustomerId, 'payments'],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${selectedCustomerId}/payments`, { credentials: 'include' });
      if (!res.ok) {
        console.error('Failed to fetch payments:', res.status, res.statusText);
        throw new Error('Failed to fetch payments');
      }
      return res.json();
    },
    enabled: !!selectedCustomerId,
    retry: 1,
  });

  const outstandingJobs = (customerJobCards ?? []).filter((job: any) => 
    job.status !== 'completed' && job.status !== 'cancelled'
  );

  const unpaidInvoices = (customerInvoices ?? []).filter((inv: any) => 
    inv.status === 'sent' || inv.status === 'overdue' || inv.status === 'draft'
  );

  const { toast } = useToast();

  const sendReminderMutation = useMutation({
    mutationFn: async (data: { invoiceId: string; amount: number }) => {
      return await apiRequest("POST", `/api/send-payment-reminder`, { 
        customerId: selectedCustomerId,
        customerName: selectedCustomer?.fullName,
        customerPhone: selectedCustomer?.phone,
        invoiceId: data.invoiceId,
        amount: data.amount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', selectedCustomerId, 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: t('customers.reminderSent', 'Reminder Sent'),
        description: t('customers.reminderSentDescription', 'Payment reminder has been sent via SMS'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('customers.failedToSendReminder', 'Failed to send reminder'),
        variant: "destructive",
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      return await apiRequest("DELETE", `/api/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', selectedCustomerId, 'vehicles'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('customers.vehicleDeleted', 'Vehicle deleted successfully'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('customers.failedToDeleteVehicle', 'Failed to delete vehicle'),
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return await apiRequest("DELETE", `/api/customer-notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', selectedCustomerId, 'notes'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('customers.noteDeleted', 'Note deleted successfully'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('customers.failedToDeleteNote', 'Failed to delete note'),
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = (customers ?? []).filter(customer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.fullName?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    );
  });

  return (
    <StandardPageLayout
      title={t('customers.title', 'Customer Management')}
      description={t('customers.description', 'Manage customer profiles and vehicle information')}
      icon={Users}
      actions={[
        {
          label: (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{selectedGarageId === "all" ? "All Garages" : garages?.find(g => g.id === selectedGarageId)?.name || "Select Garage"}</span>
            </div>
          ) as any,
          onClick: () => {},
          variant: "outline",
          testId: "select-garage-filter",
          customRender: (
            <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
              <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-garage-filter">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Garages" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23]">
                <SelectItem value="all">{t('customers.allGarages', 'All Garages')}</SelectItem>
                {(garages ?? []).map((garage) => (
                  <SelectItem key={garage.id} value={garage.id}>
                    {garage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
        } as any,
        {
          label: t('customers.addCustomer', 'Add Customer'),
          onClick: () => {},
          testId: "add-customer-action",
          customRender: (
            <AddCustomerDialog defaultGarageId={selectedGarageId !== "all" ? selectedGarageId : undefined} />
          ),
        } as any,
      ]}
    >
      {/* Role-Based Access Indicator */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/50 dark:bg-[#151A23]/50 border border-[#E2E8F0] dark:border-[#232A36]">
        <RoleBadge size="md" />
        {canCreate('customers') ? (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            You can create and manage customer profiles
          </span>
        ) : canEdit('customers') ? (
          <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            You can update customer information
          </span>
        ) : (
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Shield className="w-3 h-3" /> View only - contact a manager to modify customer records
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] p-4 text-white">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium text-white/80">{t('customers.totalCustomers', 'Total Customers')}</span>
            </div>
            <p className="text-3xl font-bold">{filteredCustomers.length}</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10" />
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-5 h-5 text-[#0A5ED7]" />
            <span className="text-sm font-medium text-[#64748B]">{t('customers.totalVehicles', 'Total Vehicles')}</span>
          </div>
          <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">{customerVehicles?.length || 0}</p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10" />
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-5 h-5 text-[#0A5ED7]" />
            <span className="text-sm font-medium text-[#64748B]">{t('customers.activeJobs', 'Active Jobs')}</span>
          </div>
          <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">{outstandingJobs.length}</p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#F97316]/5 dark:bg-[#F97316]/10" />
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-[#F97316]" />
            <span className="text-sm font-medium text-[#64748B]">{t('customers.unpaidInvoices', 'Unpaid Invoices')}</span>
          </div>
          <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">{unpaidInvoices.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input
                  type="text"
                  placeholder={t('customers.searchPlaceholder', 'Search customers...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-search-customers"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-[#64748B]">{t('customers.loading', 'Loading customers...')}</div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-[#64748B] mx-auto mb-2" />
                    <p className="text-[#64748B] text-sm">{t('customers.noCustomersFound', 'No customers found')}</p>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCustomerId === customer.id
                          ? 'bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 border-[#0A5ED7] dark:border-[#0A5ED7]'
                          : 'hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]'
                      }`}
                      data-testid={`customer-item-${customer.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-[#0B1F3B] dark:text-white truncate">
                            {customer.fullName || t('customers.unnamedCustomer', 'Unnamed Customer')}
                          </h3>
                          {customer.email && (
                            <p className="text-xs text-[#64748B] truncate">{customer.email}</p>
                          )}
                          {customer.phone && (
                            <p className="text-xs text-[#64748B]">{customer.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!selectedCustomerId ? (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center">
                  <Users className="w-10 h-10 text-[#0A5ED7]" />
                </div>
                <h3 className="font-semibold text-lg text-[#0B1F3B] dark:text-white mb-2">
                  {t('customers.noCustomerSelected', 'No Customer Selected')}
                </h3>
                <p className="text-sm text-[#64748B]">
                  {t('customers.selectCustomerPrompt', 'Select a customer from the list to view their details')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-2xl text-[#0B1F3B] dark:text-white">
                          {selectedCustomer?.fullName || t('customers.unnamedCustomer', 'Unnamed Customer')}
                        </h2>
                        <p className="text-sm text-[#64748B] mt-1">{t('customers.customerId', 'Customer ID')}: {selectedCustomer?.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {outstandingJobs.length > 0 && (
                        <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-[#0A5ED7]/30">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {outstandingJobs.length} {t('customers.activeJobs', 'Active Jobs')}
                        </Badge>
                      )}
                      {unpaidInvoices.length > 0 && (
                        <Badge className="bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {unpaidInvoices.length} {t('customers.unpaid', 'Unpaid')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCustomer?.email && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                        <Mail className="w-5 h-5 text-[#0A5ED7]" />
                        <div>
                          <p className="text-xs text-[#64748B]">{t('table.email', 'Email')}</p>
                          <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">
                            {selectedCustomer.email}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedCustomer?.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                        <Phone className="w-5 h-5 text-[#0A5ED7]" />
                        <div>
                          <p className="text-xs text-[#64748B]">{t('table.phone', 'Phone')}</p>
                          <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">
                            {selectedCustomer.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {(outstandingJobs.length > 0 || unpaidInvoices.length > 0) && (
                    <div className="mt-6 space-y-3">
                      {unpaidInvoices.length > 0 && (
                        <Alert className="bg-[#F97316]/10 dark:bg-[#F97316]/20 border-[#F97316]/30 dark:border-[#F97316]/40">
                          <AlertCircle className="h-4 w-4 text-[#F97316]" />
                          <AlertDescription className="text-sm text-[#0B1F3B] dark:text-white">
                            <strong>{t('customers.outstandingPayments', 'Outstanding Payments')}:</strong> ${unpaidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0).toFixed(2)} {t('customers.dueAcross', 'due across')} {unpaidInvoices.length} {t('customers.invoices', 'invoice(s)')}
                          </AlertDescription>
                        </Alert>
                      )}
                      {outstandingJobs.length > 0 && (
                        <Alert className="bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 border-[#0A5ED7]/30 dark:border-[#0A5ED7]/40">
                          <ClipboardList className="h-4 w-4 text-[#0A5ED7]" />
                          <AlertDescription className="text-sm text-[#0B1F3B] dark:text-white">
                            <strong>{t('customers.activeService', 'Active Service')}:</strong> {outstandingJobs.length} {t('customers.jobsInProgress', 'job(s) currently in progress')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="vehicles" className="space-y-4" data-testid="tabs-customer-history">
                <TabsList className="bg-white dark:bg-[#151A23]">
                  <TabsTrigger value="vehicles" data-testid="tab-vehicles">
                    <Car className="w-4 h-4 mr-2" />
                    {t('customers.tabs.vehicles', 'Vehicles')}
                  </TabsTrigger>
                  <TabsTrigger value="jobs" data-testid="tab-jobs">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    {t('customers.tabs.jobHistory', 'Job History')}
                  </TabsTrigger>
                  <TabsTrigger value="invoices" data-testid="tab-invoices">
                    <FileText className="w-4 h-4 mr-2" />
                    {t('customers.tabs.invoicesPayments', 'Invoices & Payments')}
                  </TabsTrigger>
                  <TabsTrigger value="notes" data-testid="tab-notes">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('customers.tabs.notes', 'Notes')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="vehicles">
                  <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white">
                          {t('customers.tabs.vehicles', 'Vehicles')} {customerVehicles ? `(${customerVehicles.length})` : ''}
                        </CardTitle>
                        {selectedCustomer?.garageId && (
                          <AddVehicleDialog 
                            customerId={selectedCustomerId} 
                            garageId={selectedCustomer.garageId} 
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {vehiclesLoading ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('common.loading', 'Loading...')}</p>
                        </div>
                      ) : vehiclesError ? (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-[#F97316] mx-auto mb-2" />
                          <p className="text-sm text-[#F97316]">{t('common.errorLoading', 'Error loading data')}</p>
                        </div>
                      ) : (customerVehicles ?? []).length === 0 ? (
                        <div className="text-center py-8">
                          <Car className="w-12 h-12 text-[#64748B] mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('customers.noVehiclesRegistered', 'No vehicles registered')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customerVehicles?.map((vehicle) => (
                            <div
                              key={vehicle.id}
                              className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
                              data-testid={`vehicle-item-${vehicle.id}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <Car className="w-5 h-5 text-[#0A5ED7] mt-1" />
                                  <div className="flex-1">
                                    <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-[#0B1F3B] dark:text-white">
                                      {vehicle.year} {vehicle.make} {vehicle.model}
                                    </h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#64748B]">
                                      <span>{t('customers.license', 'License')}: {vehicle.licensePlate}</span>
                                      {vehicle.color && <span>{t('customers.color', 'Color')}: {vehicle.color}</span>}
                                      {vehicle.mileage && <span>{t('customers.mileage', 'Mileage')}: {vehicle.mileage.toLocaleString()} {t('customers.km', 'km')}</span>}
                                    </div>
                                    {vehicle.engineType && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <span className="px-2 py-1 bg-[#F8FAFC] dark:bg-[#0E1117] rounded text-xs capitalize text-[#0B1F3B] dark:text-white">
                                          {vehicle.engineType}
                                        </span>
                                        {vehicle.transmissionType && (
                                          <span className="px-2 py-1 bg-[#F8FAFC] dark:bg-[#0E1117] rounded text-xs capitalize text-[#0B1F3B] dark:text-white">
                                            {vehicle.transmissionType}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {canDelete('vehicles') && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => deleteVehicleMutation.mutate(vehicle.id)}
                                    data-testid={`button-delete-vehicle-${vehicle.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="jobs">
                  <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <CardHeader>
                      <CardTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white">
                        {t('customers.tabs.jobHistory', 'Job History')} ({(customerJobCards ?? []).length} {t('common.total', 'total')})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {jobsLoading ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('common.loading', 'Loading...')}</p>
                        </div>
                      ) : jobsError ? (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-[#F97316] mx-auto mb-2" />
                          <p className="text-sm text-[#F97316]">{t('common.errorLoading', 'Error loading data')}</p>
                        </div>
                      ) : (customerJobCards ?? []).length === 0 ? (
                        <div className="text-center py-8">
                          <ClipboardList className="w-12 h-12 text-[#64748B] mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('customers.noJobHistory', 'No job history available')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(customerJobCards ?? []).map((job: any) => (
                            <div
                              key={job.id}
                              className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
                              data-testid={`job-item-${job.id}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-[#0B1F3B] dark:text-white">
                                      {job.jobNumber}
                                    </h4>
                                    <Badge 
                                      variant="outline" 
                                      className={
                                        job.status === 'completed' ? 'bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 border-[#0A5ED7]/30 text-[#0A5ED7]' :
                                        job.status === 'in_progress' ? 'bg-[#0BB3FF]/10 dark:bg-[#0BB3FF]/20 border-[#0BB3FF]/30 text-[#0BB3FF]' :
                                        job.status === 'cancelled' ? 'bg-[#F97316]/10 dark:bg-[#F97316]/20 border-[#F97316]/30 text-[#F97316]' :
                                        'bg-[#64748B]/10 dark:bg-[#64748B]/20 border-[#64748B]/30 text-[#64748B]'
                                      }
                                    >
                                      {job.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                      {job.status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
                                      {job.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
                                      {job.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-[#64748B] mb-2">{job.description}</p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B]">
                                    <span>{t('customers.service', 'Service')}: {job.serviceType}</span>
                                    <span>{t('customers.vehicle', 'Vehicle')}: {job.vehicleInfo?.make} {job.vehicleInfo?.model}</span>
                                    {job.completedAt && <span>{t('common.completed', 'Completed')}: {new Date(job.completedAt).toLocaleDateString()}</span>}
                                    {job.totalCost && <span className="font-semibold text-[#0B1F3B] dark:text-white">${Number(job.totalCost).toFixed(2)}</span>}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#232A36]">
                                    <JobCardDetailsDialog jobCardId={job.id}>
                                      <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
                                        data-testid={`button-view-job-details-${job.id}`}
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        {t('common.viewFullDetails', 'View Full Details')}
                                      </Button>
                                    </JobCardDetailsDialog>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="invoices">
                  <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <CardHeader>
                      <CardTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white">
                        {t('customers.tabs.invoicesPayments', 'Invoices & Payments')} ({(customerInvoices ?? []).length} {t('common.total', 'total')})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {invoicesLoading ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('common.loading', 'Loading...')}</p>
                        </div>
                      ) : invoicesError ? (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-[#F97316] mx-auto mb-2" />
                          <p className="text-sm text-[#F97316]">{t('common.errorLoading', 'Error loading data')}</p>
                        </div>
                      ) : (customerInvoices ?? []).length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-[#64748B] mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('customers.noInvoices', 'No invoices available')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(customerInvoices ?? []).map((invoice: any) => (
                            <div
                              key={invoice.id}
                              className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
                              data-testid={`invoice-item-${invoice.id}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-[#0B1F3B] dark:text-white">
                                      Invoice #{invoice.invoiceNumber}
                                    </h4>
                                    <Badge 
                                      variant="outline" 
                                      className={
                                        invoice.status === 'paid' ? 'bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 border-[#0A5ED7]/30 text-[#0A5ED7]' :
                                        invoice.status === 'overdue' ? 'bg-[#F97316]/10 dark:bg-[#F97316]/20 border-[#F97316]/30 text-[#F97316]' :
                                        invoice.status === 'sent' ? 'bg-[#0BB3FF]/10 dark:bg-[#0BB3FF]/20 border-[#0BB3FF]/30 text-[#0BB3FF]' :
                                        invoice.status === 'cancelled' ? 'bg-[#F97316]/10 dark:bg-[#F97316]/20 border-[#F97316]/30 text-[#F97316]' :
                                        'bg-[#64748B]/10 dark:bg-[#64748B]/20 border-[#64748B]/30 text-[#64748B]'
                                      }
                                    >
                                      {invoice.status}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B] mb-2">
                                    <span>{t('common.date', 'Date')}: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</span>
                                    {invoice.dueDate && <span>{t('customers.due', 'Due')}: {new Date(invoice.dueDate).toLocaleDateString()}</span>}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                                      ${Number(invoice.totalAmount || 0).toFixed(2)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <InvoiceDetailsDialog invoiceId={invoice.id}>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-gradient-to-r hover:from-[#0A5ED7] hover:to-[#0BB3FF] hover:text-white hover:border-transparent"
                                          data-testid={`button-view-invoice-${invoice.id}`}
                                        >
                                          <Eye className="w-3 h-3 mr-2" />
                                          {t('common.view', 'View')}
                                        </Button>
                                      </InvoiceDetailsDialog>
                                      {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                                        selectedCustomer?.phone && selectedCustomer.phone.trim().length > 0 ? (
                                          <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
                                            onClick={() => sendReminderMutation.mutate({ 
                                              invoiceId: invoice.id, 
                                              amount: Number(invoice.totalAmount) 
                                            })}
                                            disabled={sendReminderMutation.isPending}
                                            data-testid={`button-send-reminder-${invoice.id}`}
                                          >
                                            <Send className="w-3 h-3 mr-2" />
                                            {t('customers.sendReminder', 'Send Reminder')}
                                          </Button>
                                        ) : null
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] mt-4">
                    <CardHeader>
                      <CardTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white">
                        <DollarSign className="w-5 h-5 inline-block mr-2 text-[#0A5ED7]" />
                        {t('customers.paymentHistory', 'Payment History')} ({(customerPayments ?? []).length} {t('common.total', 'total')})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {paymentsLoading ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('common.loading', 'Loading...')}</p>
                        </div>
                      ) : paymentsError ? (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-[#F97316] mx-auto mb-2" />
                          <p className="text-sm text-[#F97316]">{t('common.errorLoading', 'Error loading data')}</p>
                        </div>
                      ) : (customerPayments ?? []).length === 0 ? (
                        <div className="text-center py-8">
                          <DollarSign className="w-12 h-12 text-[#64748B] mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('customers.noPayments', 'No payments recorded')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(customerPayments ?? []).map((paymentItem: any) => {
                            const payment = paymentItem.payment || paymentItem;
                            const invoice = paymentItem.invoice;
                            return (
                              <div
                                key={payment.id}
                                className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
                                data-testid={`payment-item-${payment.id}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-[#0B1F3B] dark:text-white">
                                        {invoice ? `Invoice #${invoice.invoiceNumber}` : `Payment #${payment.id.slice(0, 8)}`}
                                      </h4>
                                      <Badge 
                                        variant="outline" 
                                        className="bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 border-[#0A5ED7]/30 text-[#0A5ED7] capitalize"
                                      >
                                        {payment.paymentMethod?.replace('_', ' ') || 'N/A'}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B] mb-2">
                                      <span>{t('common.date', 'Date')}: {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</span>
                                      {payment.reference && <span>{t('common.reference', 'Ref')}: {payment.reference}</span>}
                                    </div>
                                    <span className="text-lg font-bold text-[#0A5ED7]">
                                      ${Number(payment.amount || 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes">
                  <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white">
                          {t('customers.tabs.notes', 'Notes')} & {t('customers.communication', 'Communication')}
                        </CardTitle>
                        <AddCustomerNoteDialog customerId={selectedCustomerId} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {notesLoading ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('common.loading', 'Loading...')}</p>
                        </div>
                      ) : notesError ? (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-[#F97316] mx-auto mb-2" />
                          <p className="text-sm text-[#F97316]">{t('common.errorLoading', 'Error loading data')}</p>
                        </div>
                      ) : (customerNotes ?? []).length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-[#64748B] mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('customers.noNotes', 'No notes available')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customerNotes?.map((note) => (
                            <div
                              key={note.id}
                              className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
                              data-testid={`note-item-${note.id}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {note.subject && (
                                    <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-[#0B1F3B] dark:text-white mb-1">
                                      {note.subject}
                                    </h4>
                                  )}
                                  <p className="text-sm text-[#64748B] mb-2">{note.content}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 text-[#0A5ED7] rounded text-xs capitalize">
                                      {note.noteType}
                                    </span>
                                    <span className="text-xs text-[#64748B]">
                                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNoteMutation.mutate(note.id)}
                                  className="text-[#F97316] hover:bg-[#F97316]/10"
                                  data-testid={`button-delete-note-${note.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </StandardPageLayout>
  );
}
