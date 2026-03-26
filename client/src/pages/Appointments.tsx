import { useState } from "react";
import { Calendar, Clock, Plus, Search, User, Phone, Car, MoreHorizontal, CheckCircle, XCircle, PlayCircle, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from "@shared/schema";
import { format } from "date-fns";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";

export function Appointments() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const { data: appointments, isLoading, error, refetch } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
    retry: false,
  });

  // Status transition mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      return await apiRequest("POST", `/api/appointments/${id}/status`, { status, reason });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('appointments.statusUpdated', 'Appointment status updated to {{status}}', { status: variables.status }),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('common.error', 'Error'),
        description: error.message || t('appointments.statusUpdateFailed', 'Failed to update appointment status'),
      });
    },
  });

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: appointmentId, status: newStatus });
  };

  // Get valid next statuses for an appointment
  const getNextStatuses = (currentStatus: string) => {
    const transitions: Record<string, string[]> = {
      scheduled: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled', 'no_show'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: ['scheduled'],
      no_show: ['scheduled'],
    };
    return transitions[currentStatus] || [];
  };

  const filteredAppointments = (appointments ?? []).filter(apt => {
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customerPhone.includes(searchQuery) ||
      apt.appointmentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      scheduled: "bg-[#F97316]/10 text-[#F97316] border-0",
      confirmed: "bg-[#0A5ED7]/10 text-[#0A5ED7] border-0",
      in_progress: "bg-[#0A5ED7]/10 text-[#0A5ED7] border-0",
      completed: "bg-[#0A5ED7]/10 text-[#0A5ED7] border-0",
      cancelled: "bg-[#F97316]/10 text-[#F97316] border-0",
      no_show: "bg-[#64748B]/10 text-[#64748B] border-0",
    };
    return statusMap[status] || "bg-[#64748B]/10 text-[#64748B] border-0";
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message="Failed to load appointments" retry={refetch} />;

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      scheduled: t('appointments.status.scheduled', 'Scheduled'),
      confirmed: t('appointments.status.confirmed', 'Confirmed'),
      in_progress: t('appointments.status.inProgress', 'In Progress'),
      completed: t('appointments.status.completed', 'Completed'),
      cancelled: t('appointments.status.cancelled', 'Cancelled'),
      no_show: t('appointments.status.noShow', 'No Show'),
    };
    return labelMap[status] || status;
  };

  return (
    <StandardPageLayout
      title={t('appointments.title', 'Appointments')}
      description={t('appointments.description', 'Manage and schedule customer appointments')}
      icon={Calendar}
      actions={[
        {
          label: t('appointments.new', 'New Appointment'),
          onClick: () => navigate("/calendar"),
          icon: Plus,
          variant: "default",
        }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] p-4 text-white">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium text-white/80">{t('appointments.total', 'Total Appointments')}</span>
            </div>
            <p className="text-3xl font-bold">{filteredAppointments.length}</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10" />
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#0A5ED7]" />
            <span className="text-sm font-medium text-[#64748B]">{t('appointments.today', 'Today')}</span>
          </div>
          <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">
            {(appointments ?? []).filter(apt => new Date(apt.appointmentDate).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10" />
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-[#0A5ED7]" />
            <span className="text-sm font-medium text-[#64748B]">{t('appointments.confirmed', 'Confirmed')}</span>
          </div>
          <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">
            {(appointments ?? []).filter(apt => apt.status === 'confirmed').length}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#F97316]/5 dark:bg-[#F97316]/10" />
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#F97316]" />
            <span className="text-sm font-medium text-[#64748B]">{t('appointments.scheduled', 'Scheduled')}</span>
          </div>
          <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">
            {(appointments ?? []).filter(apt => apt.status === 'scheduled').length}
          </p>
        </div>
      </div>

      <Card className="mb-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <Input
                type="text"
                placeholder={t('appointments.searchPlaceholder', 'Search by customer name, phone, or appointment #')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-search-appointments"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-status-filter">
                <SelectValue placeholder={t('appointments.filterByStatus', 'Filter by status')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23]">
                <SelectItem value="all">{t('appointments.allStatuses', 'All Statuses')}</SelectItem>
                <SelectItem value="scheduled">{t('appointments.status.scheduled', 'Scheduled')}</SelectItem>
                <SelectItem value="confirmed">{t('appointments.status.confirmed', 'Confirmed')}</SelectItem>
                <SelectItem value="in_progress">{t('appointments.status.inProgress', 'In Progress')}</SelectItem>
                <SelectItem value="completed">{t('appointments.status.completed', 'Completed')}</SelectItem>
                <SelectItem value="cancelled">{t('appointments.status.cancelled', 'Cancelled')}</SelectItem>
                <SelectItem value="no_show">{t('appointments.status.noShow', 'No Show')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#64748B]">
                {t('common.total', 'Total')}: <span className="font-bold text-[#0B1F3B] dark:text-white">{filteredAppointments.length}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse text-[#64748B]">{t('appointments.loading', 'Loading appointments...')}</div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-[#0A5ED7]" />
              </div>
              <p className="text-[#0B1F3B] dark:text-white font-medium">{t('appointments.noAppointments', 'No appointments found')}</p>
              <p className="text-sm text-[#64748B] mt-1">
                {searchQuery || statusFilter !== "all" 
                  ? t('appointments.adjustFilters', 'Try adjusting your filters')
                  : t('appointments.createFirst', 'Create your first appointment to get started')}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <tr className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                      <th className="text-left py-3 px-4 font-semibold text-xs text-[#64748B]">
                        {t('appointments.appointmentNumber', 'Appointment #')}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-xs text-[#64748B]">
                        {t('appointments.customer', 'Customer')}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-xs text-[#64748B]">
                        {t('appointments.vehicle', 'Vehicle')}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-xs text-[#64748B]">
                        {t('appointments.serviceType', 'Service Type')}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-xs text-[#64748B]">
                        {t('appointments.dateTime', 'Date & Time')}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-xs text-[#64748B]">
                        {t('common.status', 'Status')}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-xs text-[#64748B]">
                        {t('common.actions', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAppointments.map((apt) => {
                      const vehicleInfo = apt.vehicleInfo as any;
                      return (
                        <tr key={apt.id} className="border-b border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors">
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-[#0A5ED7]">
                            #{apt.appointmentNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-customer-name-${apt.id}`}>
                              {apt.customerName}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-[#64748B] mt-0.5">
                              <Phone className="w-3 h-3" />
                              {apt.customerPhone}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-[#0B1F3B] dark:text-white" data-testid={`text-vehicle-${apt.id}`}>
                            {vehicleInfo?.make} {vehicleInfo?.model} ({vehicleInfo?.year})
                          </td>
                          <td className="py-3 px-4 text-sm text-[#0B1F3B] dark:text-white capitalize" data-testid={`text-service-type-${apt.id}`}>
                            {apt.serviceType}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-[#0B1F3B] dark:text-white" data-testid={`text-date-${apt.id}`}>
                              {format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs text-[#64748B]">
                              {format(new Date(apt.appointmentDate), 'hh:mm a')} ({apt.duration} {t('appointments.min', 'min')})
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusBadge(apt.status)} text-xs font-medium`} data-testid={`badge-status-${apt.id}`}>
                              {getStatusLabel(apt.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 px-3 text-xs border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                                onClick={() => navigate(`/calendar?appointmentId=${apt.id}`)}
                                data-testid={`button-view-${apt.id}`}
                              >
                                {t('common.view', 'View')}
                              </Button>
                              {getNextStatuses(apt.status).length > 0 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-7 w-7 p-0"
                                      data-testid={`button-actions-${apt.id}`}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white dark:bg-[#151A23]">
                                    {getNextStatuses(apt.status).includes('confirmed') && (
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                        className="text-[#0A5ED7]"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {t('appointments.confirm', 'Confirm')}
                                      </DropdownMenuItem>
                                    )}
                                    {getNextStatuses(apt.status).includes('in_progress') && (
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusChange(apt.id, 'in_progress')}
                                        className="text-[#0A5ED7]"
                                      >
                                        <PlayCircle className="h-4 w-4 mr-2" />
                                        {t('appointments.startService', 'Start Service')}
                                      </DropdownMenuItem>
                                    )}
                                    {getNextStatuses(apt.status).includes('completed') && (
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusChange(apt.id, 'completed')}
                                        className="text-[#0A5ED7]"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {t('appointments.markComplete', 'Mark Complete')}
                                      </DropdownMenuItem>
                                    )}
                                    {getNextStatuses(apt.status).includes('scheduled') && (
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusChange(apt.id, 'scheduled')}
                                        className="text-[#0A5ED7]"
                                      >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {t('appointments.reschedule', 'Reschedule')}
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    {getNextStatuses(apt.status).includes('no_show') && (
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusChange(apt.id, 'no_show')}
                                        className="text-[#F97316]"
                                      >
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        {t('appointments.markNoShow', 'Mark No-Show')}
                                      </DropdownMenuItem>
                                    )}
                                    {getNextStatuses(apt.status).includes('cancelled') && (
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                        className="text-[#F97316]"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        {t('appointments.cancel', 'Cancel')}
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-4 pb-4">
                  <div className="text-sm text-[#64748B]">
                    {t('appointments.showing', 'Showing')} {((currentPage - 1) * itemsPerPage) + 1} {t('appointments.to', 'to')} {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} {t('appointments.of', 'of')} {filteredAppointments.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs border-[#E2E8F0] dark:border-[#232A36]"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      ← {t('common.previous', 'Prev')}
                    </Button>
                    <span className="text-sm text-[#0B1F3B] dark:text-white">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs border-[#E2E8F0] dark:border-[#232A36]"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      data-testid="button-next-page"
                    >
                      {t('common.next', 'Next')} →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
