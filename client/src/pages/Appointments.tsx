import { useState } from "react";
import { Calendar, Clock, Plus, Search, User, Phone, Car } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Appointment } from "@shared/schema";
import { format } from "date-fns";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

export function Appointments() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
    retry: false,
  });

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
      scheduled: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-0",
      confirmed: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0",
      in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0",
      completed: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0",
      no_show: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-0",
    };
    return statusMap[status] || "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-0";
  };

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
      <Card className="mb-6 bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-500" />
              <Input
                type="text"
                placeholder={t('appointments.searchPlaceholder', 'Search by customer name, phone, or appointment #')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
                data-testid="input-search-appointments"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder={t('appointments.filterByStatus', 'Filter by status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('appointments.allStatuses', 'All Statuses')}</SelectItem>
                <SelectItem value="scheduled">{t('appointments.status.scheduled', 'Scheduled')}</SelectItem>
                <SelectItem value="confirmed">{t('appointments.status.confirmed', 'Confirmed')}</SelectItem>
                <SelectItem value="in_progress">{t('appointments.status.inProgress', 'In Progress')}</SelectItem>
                <SelectItem value="completed">{t('appointments.status.completed', 'Completed')}</SelectItem>
                <SelectItem value="cancelled">{t('appointments.status.cancelled', 'Cancelled')}</SelectItem>
                <SelectItem value="no_show">{t('appointments.status.noShow', 'No Show')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-4 text-sm font-poppins">
              <span className="text-gray-700 dark:text-gray-300">
                {t('common.total', 'Total')}: <span className="font-montserrat font-bold text-gray-900 dark:text-white">{filteredAppointments.length}</span>
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {t('appointments.today', 'Today')}: <span className="font-montserrat font-bold text-gray-900 dark:text-white">
                  {(appointments ?? []).filter(apt => {
                    const today = new Date().toDateString();
                    return new Date(apt.appointmentDate).toDateString() === today;
                  }).length}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse text-gray-700 dark:text-gray-300 font-poppins">{t('appointments.loading', 'Loading appointments...')}</div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-900 dark:text-white font-poppins font-medium">{t('appointments.noAppointments', 'No appointments found')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins mt-1">
                {searchQuery || statusFilter !== "all" 
                  ? t('appointments.adjustFilters', 'Try adjusting your filters')
                  : t('appointments.createFirst', 'Create your first appointment to get started')}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-salis-gray-dark">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-salis-gray-dark/50">
                    <tr className="border-b border-gray-200 dark:border-salis-gray-dark">
                      <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">
                        {t('appointments.appointmentNumber', 'Appointment #')}
                      </th>
                      <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">
                        {t('appointments.customer', 'Customer')}
                      </th>
                      <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">
                        {t('appointments.vehicle', 'Vehicle')}
                      </th>
                      <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">
                        {t('appointments.serviceType', 'Service Type')}
                      </th>
                      <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">
                        {t('appointments.dateTime', 'Date & Time')}
                      </th>
                      <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">
                        {t('common.status', 'Status')}
                      </th>
                      <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">
                        {t('common.actions', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAppointments.map((apt) => {
                      const vehicleInfo = apt.vehicleInfo as any;
                      return (
                        <tr key={apt.id} className="border-b border-gray-100 dark:border-salis-gray-dark hover:bg-gray-50 dark:hover:bg-salis-gray-dark/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                            #{apt.appointmentNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-poppins text-sm text-gray-700 dark:text-gray-300" data-testid={`text-customer-name-${apt.id}`}>
                              {apt.customerName}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {apt.customerPhone}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-poppins text-sm text-gray-700 dark:text-gray-300" data-testid={`text-vehicle-${apt.id}`}>
                            {vehicleInfo?.make} {vehicleInfo?.model} ({vehicleInfo?.year})
                          </td>
                          <td className="py-3 px-4 font-poppins text-sm text-gray-700 dark:text-gray-300 capitalize" data-testid={`text-service-type-${apt.id}`}>
                            {apt.serviceType}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-poppins text-sm text-gray-900 dark:text-white" data-testid={`text-date-${apt.id}`}>
                              {format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}
                            </div>
                            <div className="font-poppins text-xs text-gray-600 dark:text-gray-400">
                              {format(new Date(apt.appointmentDate), 'hh:mm a')} ({apt.duration} {t('appointments.min', 'min')})
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusBadge(apt.status)} text-xs font-medium`} data-testid={`badge-status-${apt.id}`}>
                              {getStatusLabel(apt.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-7 px-3 text-xs"
                              onClick={() => navigate(`/calendar?appointmentId=${apt.id}`)}
                              data-testid={`button-view-${apt.id}`}
                            >
                              {t('common.view', 'View')}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-4 pb-4">
                  <div className="text-sm font-poppins text-gray-700 dark:text-gray-300">
                    {t('appointments.showing', 'Showing')} {((currentPage - 1) * itemsPerPage) + 1} {t('appointments.to', 'to')} {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} {t('appointments.of', 'of')} {filteredAppointments.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      ← {t('common.previous', 'Prev')}
                    </Button>
                    <span className="text-sm font-poppins text-gray-700 dark:text-gray-300">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
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
