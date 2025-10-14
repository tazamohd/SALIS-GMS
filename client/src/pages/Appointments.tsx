import { useState } from "react";
import { Calendar, Clock, Plus, Search, User, Phone, Car } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Appointment } from "@shared/schema";
import { format } from "date-fns";

export function Appointments() {
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
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-orange-100 text-orange-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      scheduled: "Scheduled",
      confirmed: "Confirmed",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      no_show: "No Show",
    };
    return labelMap[status] || status;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-[#222029]">
            Appointments
          </h1>
          <p className="font-['Poppins',Helvetica] font-normal text-sm text-[#999999] mt-1">
            Manage and schedule customer appointments
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-create-appointment"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by customer name, phone, or appointment #"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
                data-testid="input-search-appointments"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>

            {/* Stats Summary */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                Total: <span className="font-semibold text-gray-900">{filteredAppointments.length}</span>
              </span>
              <span className="text-gray-600">
                Today: <span className="font-semibold text-gray-900">
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

      {/* Appointments Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No appointments found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Create your first appointment to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-4 px-4 text-left font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                        Appointment #
                      </th>
                      <th className="py-4 px-4 text-left font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                        Customer
                      </th>
                      <th className="py-4 px-4 text-left font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                        Vehicle
                      </th>
                      <th className="py-4 px-4 text-left font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                        Service Type
                      </th>
                      <th className="py-4 px-4 text-left font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                        Date & Time
                      </th>
                      <th className="py-4 px-4 text-left font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                        Status
                      </th>
                      <th className="py-4 px-4 text-left font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAppointments.map((apt) => {
                      const vehicleInfo = apt.vehicleInfo as any;
                      return (
                        <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <span className="font-['Poppins',Helvetica] font-medium text-sm text-blue-600" data-testid={`text-apt-number-${apt.id}`}>
                              {apt.appointmentNumber}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div>
                                <div className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029]" data-testid={`text-customer-name-${apt.id}`}>
                                  {apt.customerName}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Phone className="w-3 h-3" />
                                  {apt.customerPhone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-gray-400" />
                              <span className="font-['Poppins',Helvetica] font-normal text-sm text-[#222029]" data-testid={`text-vehicle-${apt.id}`}>
                                {vehicleInfo?.make} {vehicleInfo?.model} ({vehicleInfo?.year})
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-['Poppins',Helvetica] font-normal text-sm text-[#222029] capitalize" data-testid={`text-service-type-${apt.id}`}>
                              {apt.serviceType}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div>
                                <div className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029]" data-testid={`text-date-${apt.id}`}>
                                  {format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {format(new Date(apt.appointmentDate), 'hh:mm a')} ({apt.duration} min)
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={`${getStatusBadge(apt.status)} border-0`} data-testid={`badge-status-${apt.id}`}>
                              {getStatusLabel(apt.status)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-view-${apt.id}`}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} appointments
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
