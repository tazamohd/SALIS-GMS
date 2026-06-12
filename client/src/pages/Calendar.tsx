// @ts-nocheck
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar as BigCalendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useTranslation } from "react-i18next";
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
import { StandardPageLayout } from "@/components/layouts";
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
  const { t } = useTranslation();
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
        title: t('calendar.appointmentUpdated', 'Appointment Updated'),
        description: t('calendar.rescheduledSuccess', 'The appointment has been rescheduled successfully.'),
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment & { syncToCalendar?: boolean; sendEmail?: boolean }) => {
      const appointment = await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      });

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
        title: t('calendar.appointmentCreated', 'Appointment Created'),
        description: t('calendar.createdSuccess', 'The appointment has been created successfully.'),
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const events = useMemo<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = [];

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
          color: apt.status === 'completed' ? '#6b7280' : apt.status === 'cancelled' ? '#4b5563' : '#9ca3af',
        });
      });

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
        title: t('calendar.cannotMoveEvent', 'Cannot Move Event'),
        description: t('calendar.onlyAppointmentsCanBeRescheduled', 'Only appointments can be rescheduled via drag-and-drop.'),
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
  }, [updateAppointmentMutation, toast, t]);

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
    <StandardPageLayout
      title={t('calendar.title', 'Scheduling & Calendar')}
      description={t('calendar.description', 'Visual calendar view with drag-and-drop scheduling')}
      icon={CalendarIcon}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-semibold">{t('calendar.filterByGarage', 'Filter by Garage')}</h3>
          </div>
          <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
            <SelectTrigger data-testid="select-garage">
              <SelectValue placeholder={t('calendar.selectGarage', 'Select garage')} />
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

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-semibold">{t('calendar.filterByTechnician', 'Filter by Technician')}</h3>
          </div>
          <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
            <SelectTrigger data-testid="select-technician">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('calendar.allTechnicians', 'All Technicians')}</SelectItem>
              {technicians.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.fullName || tech.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-semibold">{t('calendar.viewMode', 'View Mode')}</h3>
          </div>
          <Select value={view} onValueChange={(v) => handleViewChange(v as View)}>
            <SelectTrigger data-testid="select-view">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t('calendar.month', 'Month')}</SelectItem>
              <SelectItem value="week">{t('calendar.week', 'Week')}</SelectItem>
              <SelectItem value="day">{t('calendar.day', 'Day')}</SelectItem>
              <SelectItem value="agenda">{t('calendar.agenda', 'Agenda')}</SelectItem>
            </SelectContent>
          </Select>
        </Card>
      </div>

      {!selectedGarageId ? (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-900 dark:text-white/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('calendar.selectAGarage', 'Select a Garage')}</h3>
            <p className="text-gray-900 dark:text-white/70">
              {t('calendar.pleaseSelectGarage', 'Please select a garage from the dropdown above to view the calendar')}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark p-4">
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
              toolbar
              style={{ height: '100%' }}
            />
          </div>
        </Card>
      )}

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-event-title">
              {selectedEvent?.type === 'appointment' ? t('calendar.appointmentDetails', 'Appointment Details') : t('calendar.eventDetails', 'Event Details')}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && (
                <div className="space-y-2 mt-4">
                  <div>
                    <span className="font-semibold">{t('calendar.eventTitle', 'Title')}:</span> {selectedEvent.title}
                  </div>
                  <div>
                    <span className="font-semibold">{t('calendar.start', 'Start')}:</span> {format(selectedEvent.start, 'PPp')}
                  </div>
                  <div>
                    <span className="font-semibold">{t('calendar.end', 'End')}:</span> {format(selectedEvent.end, 'PPp')}
                  </div>
                  {selectedEvent.type === 'appointment' && selectedEvent.resource && (
                    <>
                      <div>
                        <span className="font-semibold">{t('calendar.customer', 'Customer')}:</span> {selectedEvent.resource.customerName}
                      </div>
                      <div>
                        <span className="font-semibold">{t('calendar.phone', 'Phone')}:</span> {selectedEvent.resource.customerPhone}
                      </div>
                      <div>
                        <span className="font-semibold">{t('calendar.service', 'Service')}:</span> {selectedEvent.resource.serviceType}
                      </div>
                      <div>
                        <span className="font-semibold">{t('common.status', 'Status')}:</span>{' '}
                        <span className={`px-2 py-1 rounded text-xs ${
                          selectedEvent.resource.status === 'completed' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' :
                          selectedEvent.resource.status === 'cancelled' ? 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-create-appointment-title">{t('calendar.createAppointment', 'Create Appointment')}</DialogTitle>
            <DialogDescription>
              {selectedSlot && `${t('calendar.selectedTime', 'Selected time')}: ${format(selectedSlot.start, 'PPp')}`}
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
                      <FormLabel>{t('calendar.customer', 'Customer')}</FormLabel>
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
                            <SelectValue placeholder={t('calendar.selectCustomer', 'Select customer')} />
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
                      <FormLabel>{t('calendar.vehicleOptional', 'Vehicle (Optional)')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vehicle">
                            <SelectValue placeholder={t('calendar.selectVehicle', 'Select vehicle')} />
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
                      <FormLabel>{t('calendar.serviceType', 'Service Type')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('calendar.serviceTypePlaceholder', 'Oil Change, Brake Service, etc.')} data-testid="input-service-type" />
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
                      <FormLabel>{t('calendar.assignTo', 'Assign To')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger data-testid="select-technician-assign">
                            <SelectValue placeholder={t('calendar.selectTechnician', 'Select technician')} />
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
                      <FormLabel>{t('calendar.durationMinutes', 'Duration (minutes)')}</FormLabel>
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
                      <FormLabel>{t('common.status', 'Status')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">{t('calendar.status.scheduled', 'Scheduled')}</SelectItem>
                          <SelectItem value="confirmed">{t('calendar.status.confirmed', 'Confirmed')}</SelectItem>
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
                    <FormLabel>{t('calendar.notesOptional', 'Notes (Optional)')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('calendar.notesPlaceholder', 'Additional notes...')} data-testid="input-notes" />
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
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAppointmentMutation.isPending}
                  data-testid="button-create"
                >
                  {createAppointmentMutation.isPending ? t('calendar.creating', 'Creating...') : t('calendar.createAppointment', 'Create Appointment')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}
