import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Filter } from "lucide-react";
import { format } from "date-fns";
import type { Appointment } from "@shared/schema";
import { BookAppointmentDialog } from "@/components/customer/BookAppointmentDialog";

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
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            My Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage your service appointments
          </p>
        </div>
        <Button onClick={() => setBookingOpen(true)} data-testid="button-book-appointment">
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex gap-2">
          {statusOptions.map(option => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(option.value)}
              data-testid={`button-filter-${option.value}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {statusFilter === 'all' 
                ? "You haven't booked any appointments yet."
                : `No ${statusFilter} appointments.`}
            </p>
            <Button onClick={() => setBookingOpen(true)} data-testid="button-book-first-appointment">
              <Plus className="h-4 w-4 mr-2" />
              Book Your First Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map(apt => (
            <Card key={apt.id} data-testid={`card-appointment-${apt.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl" data-testid={`text-appointment-service-${apt.id}`}>
                      {apt.serviceType}
                    </CardTitle>
                    <CardDescription className="mt-1">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                    <p className="font-medium mt-1" data-testid={`text-appointment-date-${apt.id}`}>
                      {format(new Date(apt.appointmentDate), 'PPP p')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="font-medium mt-1">{apt.duration} minutes</p>
                  </div>
                  {apt.vehicleInfo && typeof apt.vehicleInfo === 'object' && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle</p>
                      <p className="font-medium mt-1">
                        {String((apt.vehicleInfo as any).make || '')} {String((apt.vehicleInfo as any).model || '')} ({String((apt.vehicleInfo as any).year || '')})
                      </p>
                    </div>
                  )}
                  {apt.description && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                      <p className="mt-1">{apt.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BookAppointmentDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
}
