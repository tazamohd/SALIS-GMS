import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar as BigCalendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Users, Clock, AlertCircle } from "lucide-react";
import type { Appointment, User } from "@shared/schema";
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any;
  type: 'appointment' | 'event' | 'blocked';
  color?: string;
}

export default function Calendar() {
  const { toast } = useToast();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedGarageId, setSelectedGarageId] = useState<string>('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ['/api/garages'],
  });

  const { data: technicians = [] } = useQuery<User[]>({
    queryKey: ['/api/technicians', selectedGarageId],
    enabled: !!selectedGarageId,
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', selectedGarageId],
    enabled: !!selectedGarageId,
  });

  const { data: calendarEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/calendar-events', selectedGarageId, {
      startDate: startOfMonth(date).toISOString(),
      endDate: endOfMonth(date).toISOString(),
    }],
    enabled: !!selectedGarageId,
  });

  // Transform appointments and events for calendar display
  const events = useMemo<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = [];

    // Add appointments
    appointments
      .filter(apt => selectedTechnicianId === 'all' || apt.assignedTo === selectedTechnicianId)
      .forEach(apt => {
        const start = new Date(apt.appointmentDate);
        const end = new Date(start.getTime() + apt.duration * 60000);
        result.push({
          id: apt.id,
          title: `${apt.customerName} - ${apt.serviceType}`,
          start,
          end,
          resource: apt,
          type: 'appointment',
          color: apt.status === 'completed' ? '#10b981' : apt.status === 'cancelled' ? '#ef4444' : '#3b82f6',
        });
      });

    // Add calendar events
    calendarEvents.forEach((event: any) => {
      result.push({
        id: event.id,
        title: event.title,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        resource: event,
        type: event.eventType === 'blocked_time' ? 'blocked' : 'event',
        color: event.color || '#6b7280',
      });
    });

    return result;
  }, [appointments, calendarEvents, selectedTechnicianId]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    // Open appointment creation dialog with pre-filled date/time
    toast({
      title: "Create Appointment",
      description: `Selected: ${format(slotInfo.start, 'PPp')}`,
    });
    // TODO: Open create appointment dialog
  }, [toast]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  }, []);

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-calendar-title">Scheduling & Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visual calendar view with drag-and-drop scheduling
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Filter by Garage</h3>
          </div>
          <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
            <SelectTrigger data-testid="select-garage">
              <SelectValue placeholder="Select garage" />
            </SelectTrigger>
            <SelectContent>
              {garages.map((garage: any) => (
                <SelectItem key={garage.id} value={garage.id}>
                  {garage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Filter by Technician</h3>
          </div>
          <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
            <SelectTrigger data-testid="select-technician">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {technicians.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.fullName || tech.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">View Mode</h3>
          </div>
          <Select value={view} onValueChange={(v) => handleViewChange(v as View)}>
            <SelectTrigger data-testid="select-view">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="agenda">Agenda</SelectItem>
            </SelectContent>
          </Select>
        </Card>
      </div>

      {!selectedGarageId ? (
        <Card className="p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Garage</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please select a garage from the dropdown above to view the calendar
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="h-[700px]" data-testid="calendar-view">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={handleViewChange}
              date={date}
              onNavigate={handleNavigate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              selectable
              popup
              step={30}
              showMultiDayTimes
              defaultView="month"
              views={['month', 'week', 'day', 'agenda']}
              toolbar={true}
              style={{ height: '100%' }}
            />
          </div>
        </Card>
      )}

      {/* Event Details Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-event-title">
              {selectedEvent?.type === 'appointment' ? 'Appointment Details' : 'Event Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && (
                <div className="space-y-2 mt-4">
                  <div>
                    <span className="font-semibold">Title:</span> {selectedEvent.title}
                  </div>
                  <div>
                    <span className="font-semibold">Start:</span> {format(selectedEvent.start, 'PPp')}
                  </div>
                  <div>
                    <span className="font-semibold">End:</span> {format(selectedEvent.end, 'PPp')}
                  </div>
                  {selectedEvent.type === 'appointment' && selectedEvent.resource && (
                    <>
                      <div>
                        <span className="font-semibold">Customer:</span> {selectedEvent.resource.customerName}
                      </div>
                      <div>
                        <span className="font-semibold">Phone:</span> {selectedEvent.resource.customerPhone}
                      </div>
                      <div>
                        <span className="font-semibold">Service:</span> {selectedEvent.resource.serviceType}
                      </div>
                      <div>
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={`px-2 py-1 rounded text-xs ${
                          selectedEvent.resource.status === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedEvent.resource.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedEvent.resource.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
