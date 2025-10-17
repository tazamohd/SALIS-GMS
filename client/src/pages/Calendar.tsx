import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar as BigCalendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Users, Clock, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema, type InsertAppointment } from "@shared/schema";
import type { Appointment, User, Customer, Vehicle } from "@shared/schema";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

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

const DragAndDropCalendar = withDragAndDrop(BigCalendar);

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);

  const form = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema.extend({
      appointmentDate: insertAppointmentSchema.shape.appointmentDate,
      duration: insertAppointmentSchema.shape.duration,
    })),
    defaultValues: {
      appointmentNumber: '',
      garageId: '',
      customerId: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      vehicleId: '',
      serviceType: '',
      appointmentDate: new Date().toISOString(),
      duration: 60,
      status: 'scheduled',
      assignedTo: '',
      notes: '',
    },
  });

  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ['/api/garages'],
  });

  const { data: technicians = [] } = useQuery<User[]>({
    queryKey: ['/api/technicians', selectedGarageId],
    enabled: !!selectedGarageId,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
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

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAppointment> }) => {
      return await apiRequest(`/api/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Appointment Updated",
        description: "The appointment has been rescheduled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment & { syncToCalendar?: boolean; sendEmail?: boolean }) => {
      const appointment = await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Sync to Google Calendar if enabled
      if (data.syncToCalendar) {
        try {
          await apiRequest('/api/integrations/google-calendar/sync-appointment', {
            method: 'POST',
            body: JSON.stringify({
              appointmentDate: data.appointmentDate,
              service: data.serviceType,
              notes: data.notes,
              customerEmail: data.customerEmail,
            }),
          });
        } catch (error) {
          console.error('Failed to sync to Google Calendar:', error);
        }
      }

      // Send email confirmation if enabled
      if (data.sendEmail && data.customerEmail) {
        try {
          await apiRequest('/api/integrations/gmail/send-appointment-confirmation', {
            method: 'POST',
            body: JSON.stringify({
              appointment: {
                service: data.serviceType,
                appointmentDate: data.appointmentDate,
                notes: data.notes,
              },
              customer: {
                fullName: data.customerName,
                email: data.customerEmail,
              },
            }),
          });
        } catch (error) {
          console.error('Failed to send confirmation email:', error);
        }
      }

      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Appointment Created",
        description: "The appointment has been created successfully.",
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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
    setSelectedSlot(slotInfo);
    const duration = Math.round((slotInfo.end.getTime() - slotInfo.start.getTime()) / 60000);
    
    form.reset({
      appointmentNumber: `APT-${Date.now()}`,
      garageId: selectedGarageId,
      customerId: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      vehicleId: '',
      serviceType: '',
      appointmentDate: slotInfo.start.toISOString(),
      duration: duration > 0 ? duration : 60,
      status: 'scheduled',
      assignedTo: selectedTechnicianId !== 'all' ? selectedTechnicianId : '',
      notes: '',
    });
    
    setCreateDialogOpen(true);
  }, [selectedGarageId, selectedTechnicianId, form]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  }, []);

  const handleEventDrop = useCallback(({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    if (event.type !== 'appointment') {
      toast({
        title: "Cannot Move Event",
        description: "Only appointments can be rescheduled via drag-and-drop.",
        variant: "destructive",
      });
      return;
    }

    const duration = Math.round((end.getTime() - start.getTime()) / 60000);
    updateAppointmentMutation.mutate({
      id: event.id,
      data: {
        appointmentDate: start.toISOString(),
        duration,
      },
    });
  }, [updateAppointmentMutation, toast]);

  const handleEventResize = useCallback(({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    if (event.type !== 'appointment') {
      return;
    }

    const duration = Math.round((end.getTime() - start.getTime()) / 60000);
    updateAppointmentMutation.mutate({
      id: event.id,
      data: {
        appointmentDate: start.toISOString(),
        duration,
      },
    });
  }, [updateAppointmentMutation]);

  const onSubmitAppointment = (data: InsertAppointment) => {
    createAppointmentMutation.mutate(data);
  };

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
    <div className="p-8 bg-gray-800 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-chrome-silver" data-testid="text-calendar-title">Scheduling & Calendar</h1>
          <p className="text-chrome-silver/70">
            Visual calendar view with drag-and-drop scheduling
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-midnight-blue border-dark-steel p-4">
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

        <Card className="bg-midnight-blue border-dark-steel p-4">
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

        <Card className="bg-midnight-blue border-dark-steel p-4">
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
        <Card className="bg-midnight-blue border-dark-steel p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-chrome-silver/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Garage</h3>
            <p className="text-chrome-silver/70">
              Please select a garage from the dropdown above to view the calendar
            </p>
          </div>
        </Card>
      ) : (
        <Card className="bg-midnight-blue border-dark-steel p-4">
          <div className="h-[700px]" data-testid="calendar-view">
            <DragAndDropCalendar
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
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              eventPropGetter={eventStyleGetter}
              selectable
              resizable
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

      {/* Create Appointment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-create-appointment-title">Create Appointment</DialogTitle>
            <DialogDescription>
              {selectedSlot && `Selected time: ${format(selectedSlot.start, 'PPp')}`}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAppointment)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        const customer = customers.find(c => c.id === value);
                        if (customer) {
                          form.setValue('customerName', customer.fullName);
                          form.setValue('customerPhone', customer.phone);
                          form.setValue('customerEmail', customer.email || '');
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-customer">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vehicle">
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Oil Change, Brake Service, etc." data-testid="input-service-type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger data-testid="select-technician-assign">
                            <SelectValue placeholder="Select technician" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.fullName || tech.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-duration" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes..." data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAppointmentMutation.isPending}
                  data-testid="button-create"
                >
                  {createAppointmentMutation.isPending ? "Creating..." : "Create Appointment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
