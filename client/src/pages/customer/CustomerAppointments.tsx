// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Filter } from "lucide-react";
import { format } from "date-fns";
import type { Appointment } from "@shared/schema";
import { BookAppointmentDialog } from "@/components/customer/BookAppointmentDialog";
import { StandardPageLayout } from "@/components/layouts";

export function CustomerAppointments() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/customer/appointments'],
  });

  const filteredAppointments = appointments.filter(apt => 
    statusFilter === 'all' || apt.status === statusFilter
  );

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white';
      case 'scheduled':
        return 'bg-[#E2E8F0] dark:bg-[#232A36] text-[#0B1F3B] dark:text-white';
      case 'in_progress':
        return 'bg-[#0BB3FF]/20 text-[#0A5ED7] dark:text-[#0BB3FF]';
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'cancelled':
        return 'bg-[#F97316]/20 text-[#F97316]';
      default:
        return 'bg-[#E2E8F0] dark:bg-[#232A36] text-[#64748B]';
    }
  };

  return (
    <StandardPageLayout
      title="My Appointments"
      description="View and manage your service appointments"
      icon={Calendar}
      actions={[
        {
          label: "Book Appointment",
          onClick: () => setBookingOpen(true),
          icon: Plus,
        },
      ]}
    >
      <div className="flex items-center gap-4 mb-6">
        <Filter className="h-4 w-4 text-[#64748B]" />
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map(option => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(option.value)}
              className={statusFilter === option.value 
                ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 hover:opacity-90' 
                : 'border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#151A23]'}
              data-testid={`button-filter-${option.value}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#64748B]">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-[#64748B] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white mb-2">
              No appointments found
            </h3>
            <p className="text-[#64748B] mb-6">
              {statusFilter === 'all' 
                ? "You haven't booked any appointments yet."
                : `No ${statusFilter} appointments.`}
            </p>
            <Button 
              onClick={() => setBookingOpen(true)} 
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 hover:opacity-90"
              data-testid="button-book-first-appointment"
            >
              <Plus className="h-4 w-4 mr-2" />
              Book Your First Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map(apt => (
            <Card key={apt.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-appointment-${apt.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-[#0B1F3B] dark:text-white" data-testid={`text-appointment-service-${apt.id}`}>
                      {apt.serviceType}
                    </CardTitle>
                    <CardDescription className="mt-1 text-[#64748B]">
                      Appointment #{apt.appointmentNumber}
                    </CardDescription>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}
                    data-testid={`status-appointment-${apt.id}`}
                  >
                    {apt.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-[#64748B]">Date & Time</p>
                    <p className="font-medium mt-1 text-[#0B1F3B] dark:text-white" data-testid={`text-appointment-date-${apt.id}`}>
                      {format(new Date(apt.appointmentDate), 'PPP p')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Duration</p>
                    <p className="font-medium mt-1 text-[#0B1F3B] dark:text-white">{apt.duration} minutes</p>
                  </div>
                  {apt.vehicleInfo && typeof apt.vehicleInfo === 'object' && (
                    <div>
                      <p className="text-sm text-[#64748B]">Vehicle</p>
                      <p className="font-medium mt-1 text-[#0B1F3B] dark:text-white">
                        {String((apt.vehicleInfo as any).make || '')} {String((apt.vehicleInfo as any).model || '')} ({String((apt.vehicleInfo as any).year || '')})
                      </p>
                    </div>
                  )}
                  {apt.description && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-[#64748B]">Description</p>
                      <p className="mt-1 text-[#0B1F3B] dark:text-white">{apt.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BookAppointmentDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </StandardPageLayout>
  );
}
