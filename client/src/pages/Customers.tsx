import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Users, Search, Car, Phone, Mail, MessageSquare, Building2, Trash2, FileText, AlertCircle, DollarSign, ClipboardList, Send, CheckCircle, Clock, XCircle } from "lucide-react";
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
import type { User, Vehicle, Garage, CustomerNote } from "@shared/schema";
import { StandardPageLayout } from "@/components/layouts";

export function Customers() {
  const { t } = useTranslation();
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
    queryKey: [`/api/customers/${selectedCustomerId}`],
    enabled: !!selectedCustomerId,
  });

  const { data: customerVehicles } = useQuery<Vehicle[]>({
    queryKey: [`/api/customers/${selectedCustomerId}/vehicles`],
    enabled: !!selectedCustomerId,
  });

  const { data: customerNotes } = useQuery<CustomerNote[]>({
    queryKey: [`/api/customers/${selectedCustomerId}/notes`],
    enabled: !!selectedCustomerId,
  });

  const { data: allJobCards } = useQuery<any[]>({
    queryKey: ['/api/job-cards'],
    enabled: !!selectedCustomerId,
  });

  const { data: allInvoices } = useQuery<any[]>({
    queryKey: ['/api/invoices'],
    enabled: !!selectedCustomerId,
  });

  const customerJobCards = !customerVehicles ? [] : (allJobCards ?? []).filter((job: any) => {
    // Match by customer ID directly if available
    if (job.customerId === selectedCustomerId) {
      return true;
    }
    // Otherwise, match by vehicle info
    if (job.vehicleInfo) {
      const vehicle = customerVehicles.find(v => 
        job.vehicleInfo.licensePlate === v.licensePlate || 
        job.vehicleInfo.vin === v.vin
      );
      return !!vehicle;
    }
    return false;
  });

  const customerInvoices = (allInvoices ?? []).filter((inv: any) => inv.customerId === selectedCustomerId);

  const outstandingJobs = customerJobCards.filter((job: any) => 
    job.status !== 'completed' && job.status !== 'cancelled'
  );

  const unpaidInvoices = customerInvoices.filter((inv: any) => inv.status === 'pending');

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
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${selectedCustomerId}/vehicles`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${selectedCustomerId}/notes`] });
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
              <SelectTrigger className="w-[200px]" data-testid="select-garage-filter">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Garages" />
              </SelectTrigger>
              <SelectContent>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-900 dark:text-white/50" />
                <Input
                  type="text"
                  placeholder={t('customers.searchPlaceholder', 'Search customers...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-customers"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-900 dark:text-white/60">{t('customers.loading', 'Loading customers...')}</div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-900 dark:text-white/50 mx-auto mb-2" />
                    <p className="text-gray-900 dark:text-white/60 text-sm">{t('customers.noCustomersFound', 'No customers found')}</p>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCustomerId === customer.id
                          ? 'bg-gray-100 dark:bg-salis-gray-dark border-gray-300 dark:border-salis-gray'
                          : 'hover:bg-gray-50 dark:hover:bg-salis-gray-dark border-gray-200 dark:border-gray-700'
                      }`}
                      data-testid={`customer-item-${customer.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-salis-gray-dark flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-gray-900 dark:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-['Poppins',Helvetica] font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {customer.fullName || t('customers.unnamedCustomer', 'Unnamed Customer')}
                          </h3>
                          {customer.email && (
                            <p className="text-xs text-gray-900 dark:text-white/60 truncate">{customer.email}</p>
                          )}
                          {customer.phone && (
                            <p className="text-xs text-gray-900 dark:text-white/60">{customer.phone}</p>
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
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-600 mb-2">
                  {t('customers.noCustomerSelected', 'No Customer Selected')}
                </h3>
                <p className="text-sm text-gray-900 dark:text-white/50">
                  {t('customers.selectCustomerPrompt', 'Select a customer from the list to view their details')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-salis-gray-dark flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <h2 className="font-['Poppins',Helvetica] font-bold text-2xl text-gray-900 dark:text-white">
                          {selectedCustomer?.fullName || t('customers.unnamedCustomer', 'Unnamed Customer')}
                        </h2>
                        <p className="text-sm text-gray-900 dark:text-white/60 mt-1">{t('customers.customerId', 'Customer ID')}: {selectedCustomer?.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {outstandingJobs.length > 0 && (
                        <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {outstandingJobs.length} {t('customers.activeJobs', 'Active Jobs')}
                        </Badge>
                      )}
                      {unpaidInvoices.length > 0 && (
                        <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {unpaidInvoices.length} {t('customers.unpaid', 'Unpaid')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCustomer?.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-900 dark:text-white/50" />
                        <div>
                          <p className="text-xs text-gray-900 dark:text-white/60">{t('table.email', 'Email')}</p>
                          <p className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white">
                            {selectedCustomer.email}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedCustomer?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-900 dark:text-white/50" />
                        <div>
                          <p className="text-xs text-gray-900 dark:text-white/60">{t('table.phone', 'Phone')}</p>
                          <p className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white">
                            {selectedCustomer.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {(outstandingJobs.length > 0 || unpaidInvoices.length > 0) && (
                    <div className="mt-6 space-y-3">
                      {unpaidInvoices.length > 0 && (
                        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-sm text-gray-900 dark:text-white">
                            <strong>{t('customers.outstandingPayments', 'Outstanding Payments')}:</strong> ${unpaidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0).toFixed(2)} {t('customers.dueAcross', 'due across')} {unpaidInvoices.length} {t('customers.invoices', 'invoice(s)')}
                          </AlertDescription>
                        </Alert>
                      )}
                      {outstandingJobs.length > 0 && (
                        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                          <ClipboardList className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-sm text-gray-900 dark:text-white">
                            <strong>{t('customers.activeService', 'Active Service')}:</strong> {outstandingJobs.length} {t('customers.jobsInProgress', 'job(s) currently in progress')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="vehicles" className="space-y-4" data-testid="tabs-customer-history">
                <TabsList className="bg-white dark:bg-salis-black">
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
                  <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-900 dark:text-white">
                          {t('customers.tabs.vehicles', 'Vehicles')}
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
                      {(customerVehicles ?? []).length === 0 ? (
                        <div className="text-center py-8">
                          <Car className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-900 dark:text-white/60">{t('customers.noVehiclesRegistered', 'No vehicles registered')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customerVehicles?.map((vehicle) => (
                            <div
                              key={vehicle.id}
                              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark transition-colors"
                              data-testid={`vehicle-item-${vehicle.id}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <Car className="w-5 h-5 text-gray-900 dark:text-white/50 mt-1" />
                                  <div className="flex-1">
                                    <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-gray-900 dark:text-white">
                                      {vehicle.year} {vehicle.make} {vehicle.model}
                                    </h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-900 dark:text-white/60">
                                      <span>{t('customers.license', 'License')}: {vehicle.licensePlate}</span>
                                      {vehicle.color && <span>{t('customers.color', 'Color')}: {vehicle.color}</span>}
                                      {vehicle.mileage && <span>{t('customers.mileage', 'Mileage')}: {vehicle.mileage.toLocaleString()} {t('customers.km', 'km')}</span>}
                                    </div>
                                    {vehicle.engineType && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-salis-gray-dark rounded text-xs capitalize">
                                          {vehicle.engineType}
                                        </span>
                                        {vehicle.transmissionType && (
                                          <span className="px-2 py-1 bg-gray-100 dark:bg-salis-gray-dark rounded text-xs capitalize">
                                            {vehicle.transmissionType}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteVehicleMutation.mutate(vehicle.id)}
                                  data-testid={`button-delete-vehicle-${vehicle.id}`}
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

                <TabsContent value="jobs">
                  <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                    <CardHeader>
                      <CardTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-900 dark:text-white">
                        {t('customers.tabs.jobHistory', 'Job History')} ({customerJobCards.length} {t('common.total', 'total')})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customerJobCards.length === 0 ? (
                        <div className="text-center py-8">
                          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-900 dark:text-white/60">{t('customers.noJobHistory', 'No job history available')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customerJobCards.map((job: any) => (
                            <div
                              key={job.id}
                              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark transition-colors"
                              data-testid={`job-item-${job.id}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-gray-900 dark:text-white">
                                      {job.jobNumber}
                                    </h4>
                                    <Badge 
                                      variant="outline" 
                                      className={
                                        job.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                                        job.status === 'in_progress' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                        job.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                                        'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                                      }
                                    >
                                      {job.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                      {job.status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
                                      {job.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
                                      {job.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{job.description}</p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-900 dark:text-white/60">
                                    <span>{t('customers.service', 'Service')}: {job.serviceType}</span>
                                    <span>{t('customers.vehicle', 'Vehicle')}: {job.vehicleInfo?.make} {job.vehicleInfo?.model}</span>
                                    {job.completedAt && <span>{t('common.completed', 'Completed')}: {new Date(job.completedAt).toLocaleDateString()}</span>}
                                    {job.totalCost && <span className="font-semibold text-gray-900 dark:text-white">${Number(job.totalCost).toFixed(2)}</span>}
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
                  <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                    <CardHeader>
                      <CardTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-900 dark:text-white">
                        {t('customers.tabs.invoicesPayments', 'Invoices & Payments')} ({customerInvoices.length} {t('common.total', 'total')})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customerInvoices.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-900 dark:text-white/60">{t('customers.noInvoices', 'No invoices available')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customerInvoices.map((invoice: any) => (
                            <div
                              key={invoice.id}
                              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark transition-colors"
                              data-testid={`invoice-item-${invoice.id}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-gray-900 dark:text-white">
                                      Invoice #{invoice.invoiceNumber}
                                    </h4>
                                    <Badge 
                                      variant="outline" 
                                      className={
                                        invoice.status === 'paid' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                                        invoice.status === 'pending' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                                        'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                                      }
                                    >
                                      {invoice.status}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-900 dark:text-white/60 mb-2">
                                    <span>{t('common.date', 'Date')}: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</span>
                                    {invoice.dueDate && <span>{t('customers.due', 'Due')}: {new Date(invoice.dueDate).toLocaleDateString()}</span>}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                      ${Number(invoice.totalAmount || 0).toFixed(2)}
                                    </span>
                                    {invoice.status === 'pending' && (
                                      selectedCustomer?.phone && selectedCustomer.phone.trim().length > 0 ? (
                                        <Button
                                          size="sm"
                                          variant="outline"
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
                                      ) : (
                                        <span className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-no-phone">
                                          {t('customers.noPhoneNumber', 'No phone number')}
                                        </span>
                                      )
                                    )}
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

                <TabsContent value="notes">
                  <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-900 dark:text-white">
                          {t('customers.tabs.notes', 'Notes')} & {t('customers.communication', 'Communication')}
                        </CardTitle>
                        <AddCustomerNoteDialog customerId={selectedCustomerId} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(customerNotes ?? []).length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-900 dark:text-white/60">{t('customers.noNotes', 'No notes available')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customerNotes?.map((note) => (
                            <div
                              key={note.id}
                              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark transition-colors"
                              data-testid={`note-item-${note.id}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {note.subject && (
                                    <h4 className="font-['Poppins',Helvetica] font-semibold text-sm text-gray-900 dark:text-white mb-1">
                                      {note.subject}
                                    </h4>
                                  )}
                                  <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-xs capitalize">
                                      {note.noteType}
                                    </span>
                                    <span className="text-xs text-gray-900 dark:text-white/60">
                                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNoteMutation.mutate(note.id)}
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
