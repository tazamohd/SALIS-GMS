import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DashboardPage } from "@/components/layouts/DashboardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Wrench,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  GripVertical,
  Maximize2
} from "lucide-react";
import { format, addDays, startOfWeek, addHours, isSameDay, parseISO } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  customerName: string;
  vehicleInfo: string;
  serviceType: string;
  startTime: Date;
  endTime: Date;
  resourceId: string;
  resourceName: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  color: string;
}

interface WorkshopResource {
  id: string;
  name: string;
  type: "bay" | "technician" | "equipment";
  color: string;
}

export default function WorkshopCalendar() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);

  const resources: WorkshopResource[] = [
    { id: "bay-1", name: t('workshopCalendar.bay1General', 'Bay 1 - General'), type: "bay", color: "#3b82f6" },
    { id: "bay-2", name: t('workshopCalendar.bay2Alignment', 'Bay 2 - Alignment'), type: "bay", color: "#10b981" },
    { id: "bay-3", name: t('workshopCalendar.bay3Paint', 'Bay 3 - Paint'), type: "bay", color: "#f59e0b" },
    { id: "bay-4", name: t('workshopCalendar.bay4QuickService', 'Bay 4 - Quick Service'), type: "bay", color: "#8b5cf6" },
    { id: "tech-1", name: t('workshopCalendar.ahmedSeniorTech', 'Ahmed (Senior Tech)'), type: "technician", color: "#ec4899" },
    { id: "tech-2", name: t('workshopCalendar.mohammedTech', 'Mohammed (Tech)'), type: "technician", color: "#06b6d4" },
  ];

  const generateEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
    
    const sampleEvents = [
      { title: t('workshopCalendar.oilChange', 'Oil Change'), customer: "Ahmed Al-Rashid", vehicle: "Toyota Camry 2022", service: t('workshopCalendar.maintenance', 'Maintenance'), bay: "bay-1", dayOffset: 0, hour: 9, duration: 2 },
      { title: t('workshopCalendar.brakeInspection', 'Brake Inspection'), customer: "Fatima Hassan", vehicle: "Honda Accord 2021", service: t('workshopCalendar.inspection', 'Inspection'), bay: "bay-2", dayOffset: 0, hour: 10, duration: 3 },
      { title: t('workshopCalendar.wheelAlignment', 'Wheel Alignment'), customer: "Mohammed Khalid", vehicle: "BMW X5 2023", service: t('workshopCalendar.alignment', 'Alignment'), bay: "bay-2", dayOffset: 1, hour: 8, duration: 4 },
      { title: t('workshopCalendar.paintTouchUp', 'Paint Touch-up'), customer: "Sara Abdullah", vehicle: "Mercedes C-Class", service: t('workshopCalendar.bodyWork', 'Body Work'), bay: "bay-3", dayOffset: 1, hour: 9, duration: 6 },
      { title: t('workshopCalendar.acService', 'AC Service'), customer: "Khalid Omar", vehicle: "Nissan Patrol 2020", service: t('workshopCalendar.acHeating', 'AC/Heating'), bay: "bay-1", dayOffset: 2, hour: 11, duration: 3 },
      { title: t('workshopCalendar.fullService', 'Full Service'), customer: "Nora Ahmed", vehicle: "Lexus ES 2022", service: t('workshopCalendar.fullService', 'Full Service'), bay: "bay-4", dayOffset: 2, hour: 8, duration: 4 },
      { title: t('workshopCalendar.tireRotation', 'Tire Rotation'), customer: "Ali Hassan", vehicle: "Ford F-150 2021", service: t('workshopCalendar.tires', 'Tires'), bay: "bay-4", dayOffset: 3, hour: 14, duration: 1 },
      { title: t('workshopCalendar.engineDiagnostic', 'Engine Diagnostic'), customer: "Layla Mohammed", vehicle: "Audi A4 2023", service: t('workshopCalendar.diagnostic', 'Diagnostic'), bay: "bay-1", dayOffset: 3, hour: 9, duration: 3 },
      { title: t('workshopCalendar.transmissionCheck', 'Transmission Check'), customer: "Omar Saleh", vehicle: "Chevrolet Tahoe", service: t('workshopCalendar.transmission', 'Transmission'), bay: "bay-2", dayOffset: 4, hour: 10, duration: 4 },
      { title: t('workshopCalendar.batteryReplacement', 'Battery Replacement'), customer: "Mona Yousef", vehicle: "Hyundai Sonata", service: t('workshopCalendar.electrical', 'Electrical'), bay: "bay-4", dayOffset: 4, hour: 15, duration: 1 },
    ];
    
    sampleEvents.forEach((event, idx) => {
      const resource = resources.find(r => r.id === event.bay);
      const startTime = addHours(addDays(startOfCurrentWeek, event.dayOffset), event.hour);
      const endTime = addHours(startTime, event.duration);
      
      events.push({
        id: `event-${idx}`,
        title: event.title,
        customerName: event.customer,
        vehicleInfo: event.vehicle,
        serviceType: event.service,
        startTime,
        endTime,
        resourceId: event.bay,
        resourceName: resource?.name || t('common.unknown', 'Unknown'),
        status: idx < 3 ? "completed" : idx < 6 ? "in-progress" : "scheduled",
        color: resource?.color || "#gray",
      });
    });
    
    return events;
  };

  const events = generateEvents();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 12 }, (_, i) => i + 7);

  const getEventsForDayAndResource = (day: Date, resourceId: string) => {
    return events.filter(event => 
      isSameDay(event.startTime, day) && event.resourceId === resourceId
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "scheduled": return "bg-gray-400";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const navigateWeek = (direction: number) => {
    setCurrentDate(prev => addDays(prev, direction * 7));
  };

  const totalScheduled = events.filter(e => e.status === "scheduled").length;
  const totalInProgress = events.filter(e => e.status === "in-progress").length;
  const totalCompleted = events.filter(e => e.status === "completed").length;
  const utilizationRate = Math.round((events.length / (resources.length * 7 * 8)) * 100);

  const metrics = [
    { label: t('workshopCalendar.scheduled', 'Scheduled'), value: totalScheduled, icon: CalendarIcon, color: "text-blue-500" },
    { label: t('common.inProgress', 'In Progress'), value: totalInProgress, icon: Clock, color: "text-yellow-500" },
    { label: t('common.completed', 'Completed'), value: totalCompleted, icon: CheckCircle2, color: "text-green-500" },
    { label: t('workshopCalendar.utilization', 'Utilization'), value: `${utilizationRate}%`, icon: Users, color: "text-purple-500" },
  ];

  return (
    <DashboardPage
      title={t('workshopCalendar.title', 'Workshop Calendar')}
      description={t('workshopCalendar.description', 'Interactive drag-and-drop scheduling for service bays and technicians')}
      icon={CalendarIcon}
      metrics={metrics}
    >
      <div className="space-y-4" data-testid="workshop-calendar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)} data-testid="button-prev-week">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </h2>
            <Button variant="outline" size="icon" onClick={() => navigateWeek(1)} data-testid="button-next-week">
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())} data-testid="button-today">
              {t('workshopCalendar.today', 'Today')}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsDragMode(!isDragMode)} data-testid="button-toggle-drag">
              <GripVertical className="w-4 h-4 mr-2" />
              {isDragMode ? t('workshopCalendar.exitDragMode', 'Exit Drag Mode') : t('workshopCalendar.enableDrag', 'Enable Drag')}
            </Button>
            <Button data-testid="button-new-appointment">
              <Plus className="w-4 h-4 mr-2" />
              {t('workshopCalendar.newAppointment', 'New Appointment')}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[1200px]">
              <div className="grid" style={{ gridTemplateColumns: "150px repeat(7, 1fr)" }}>
                <div className="p-3 border-b border-r font-medium bg-muted">{t('workshopCalendar.resource', 'Resource')}</div>
                {weekDays.map((day, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 border-b text-center font-medium ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-muted'}`}
                  >
                    <div className="text-sm text-muted-foreground">{format(day, "EEE")}</div>
                    <div className={`text-lg ${isSameDay(day, new Date()) ? 'text-blue-600 font-bold' : ''}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>

              {resources.filter(r => r.type === "bay").map((resource) => (
                <div 
                  key={resource.id} 
                  className="grid" 
                  style={{ gridTemplateColumns: "150px repeat(7, 1fr)" }}
                  data-testid={`calendar-row-${resource.id}`}
                >
                  <div className="p-3 border-b border-r flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: resource.color }} />
                    <span className="text-sm font-medium truncate">{resource.name}</span>
                  </div>
                  {weekDays.map((day, dayIdx) => {
                    const dayEvents = getEventsForDayAndResource(day, resource.id);
                    return (
                      <div 
                        key={dayIdx} 
                        className={`p-1 border-b min-h-[100px] relative ${isSameDay(day, new Date()) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                      >
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`p-2 mb-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${isDragMode ? 'cursor-grab' : ''}`}
                            style={{ backgroundColor: event.color, color: 'white' }}
                            onClick={() => handleEventClick(event)}
                            data-testid={`event-${event.id}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="truncate opacity-80">{event.customerName}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{format(event.startTime, "HH:mm")}</span>
                              <Badge variant="outline" className={`text-[10px] px-1 py-0 ${getStatusColor(event.status)} text-white border-0`}>
                                {event.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {dayEvents.length === 0 && isDragMode && (
                          <div className="absolute inset-1 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs">
                            {t('workshopCalendar.dropHere', 'Drop here')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                {t('workshopCalendar.schedulingConflicts', 'Scheduling Conflicts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('workshopCalendar.noConflicts', 'No conflicts detected')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                {t('workshopCalendar.technicianAvailability', 'Technician Availability')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {resources.filter(r => r.type === "technician").map(tech => (
                <div key={tech.id} className="flex items-center justify-between text-sm">
                  <span>{tech.name}</span>
                  <Badge variant="outline" className="text-green-600" data-testid={`badge-tech-status-${tech.id}`}>{t('workshopCalendar.available', 'Available')}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wrench className="w-4 h-4 text-purple-500" />
                {t('workshopCalendar.bayStatus', 'Bay Status')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {resources.filter(r => r.type === "bay").map(bay => {
                const bayEvents = events.filter(e => e.resourceId === bay.id && e.status === "in-progress");
                return (
                  <div key={bay.id} className="flex items-center justify-between text-sm">
                    <span>{bay.name}</span>
                    <Badge variant={bayEvents.length > 0 ? "default" : "outline"} data-testid={`badge-bay-status-${bay.id}`}>
                      {bayEvents.length > 0 ? t('workshopCalendar.occupied', 'Occupied') : t('workshopCalendar.available', 'Available')}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">{t('workshopCalendar.customer', 'Customer')}</Label>
                  <p className="font-medium">{selectedEvent.customerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('workshopCalendar.vehicle', 'Vehicle')}</Label>
                  <p className="font-medium">{selectedEvent.vehicleInfo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('workshopCalendar.serviceType', 'Service Type')}</Label>
                  <p className="font-medium">{selectedEvent.serviceType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('workshopCalendar.resource', 'Resource')}</Label>
                  <p className="font-medium">{selectedEvent.resourceName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('workshopCalendar.startTime', 'Start Time')}</Label>
                  <p className="font-medium">{format(selectedEvent.startTime, "MMM d, HH:mm")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('workshopCalendar.endTime', 'End Time')}</Label>
                  <p className="font-medium">{format(selectedEvent.endTime, "MMM d, HH:mm")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">{t('common.status', 'Status')}:</Label>
                <Badge className={getStatusColor(selectedEvent.status)} data-testid="badge-event-status">{selectedEvent.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)} data-testid="button-close-event">{t('common.close', 'Close')}</Button>
            <Button data-testid="button-edit-appointment">{t('workshopCalendar.editAppointment', 'Edit Appointment')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}
