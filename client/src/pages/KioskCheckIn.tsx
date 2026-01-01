import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabletSmartphone, User, Car, Calendar, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { DashboardPage } from "@/components/layouts";

interface CustomerLookupResult {
  found: boolean;
  customer?: { id: string; fullName: string; phone: string; email: string };
  vehicles?: { id: string; make: string; model: string; year: number; plateNumber: string }[];
  todayAppointments?: { id: string; appointmentNumber: string; serviceType: string; appointmentDate: string; status: string; vehicleId?: string | null }[];
}

export default function KioskCheckIn() {
  const { t } = useTranslation();
  const [checkInStep, setCheckInStep] = useState<"idle" | "phone" | "searching" | "notfound" | "vehicle" | "appointment" | "confirm" | "complete">("idle");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerData, setCustomerData] = useState<CustomerLookupResult | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [vehicleAppointments, setVehicleAppointments] = useState<any[]>([]);
  const { toast } = useToast();

  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/kiosk/sessions"],
  });

  // Lookup customer by phone
  const lookupMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await fetch(`/api/kiosk/lookup-customer?phone=${encodeURIComponent(phone)}`, { credentials: 'include' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Customer not found');
      }
      return res.json() as Promise<CustomerLookupResult>;
    },
    onSuccess: (data) => {
      if (data.found) {
        setCustomerData(data);
        setCheckInStep("vehicle");
      } else {
        setCheckInStep("notfound");
      }
    },
    onError: () => {
      setCheckInStep("notfound");
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (checkInData: {
      customerId: string;
      vehicleId: string;
      appointmentId?: string;
      phoneNumber: string;
      checkInMethod: string;
    }) => {
      // First validate the check-in
      await apiRequest("POST", "/api/kiosk/validate-checkin", {
        customerId: checkInData.customerId,
        vehicleId: checkInData.vehicleId,
        appointmentId: checkInData.appointmentId,
      });
      // Then create the session
      return await apiRequest("POST", "/api/kiosk/checkin", checkInData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kiosk/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: t('common.success', 'Success'),
        description: t('kiosk.checkInCompleted', 'Check-in completed successfully'),
      });
      setCheckInStep("complete");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('common.error', 'Error'),
        description: error.message || t('kiosk.checkInFailed', 'Failed to complete check-in'),
      });
    },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter((s: any) => new Date(s.checkInTime || s.createdAt) >= todayStart);
  
  const sessionsWithDuration = todaySessions.filter((s: any) => s.checkInDuration);
  const avgDuration = sessionsWithDuration.length > 0
    ? Math.round(sessionsWithDuration.reduce((sum: number, s: any) => sum + (Number(s.checkInDuration) || 0), 0) / sessionsWithDuration.length)
    : (todaySessions.length > 0 ? 45 : 0);
  
  const stats = {
    todayCheckIns: todaySessions.length || 0,
    withAppointment: todaySessions.filter((s: any) => s.appointmentId).length || 0,
    walkIns: todaySessions.filter((s: any) => !s.appointmentId).length || 0,
    avgCheckInTime: avgDuration,
  };

  const handlePhoneLookup = () => {
    if (phoneNumber.trim().length >= 7) {
      setCheckInStep("searching");
      lookupMutation.mutate(phoneNumber);
    } else {
      toast({
        variant: "destructive",
        title: t('common.error', 'Error'),
        description: t('kiosk.invalidPhone', 'Please enter a valid phone number'),
      });
    }
  };

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    
    // Filter appointments for this specific vehicle only (match by vehicleId)
    // If appointment has no vehicleId, it won't match any vehicle to avoid ambiguity
    const filteredAppointments = customerData?.todayAppointments?.filter(
      (apt: any) => apt.vehicleId === vehicle.id
    ) || [];
    
    setVehicleAppointments(filteredAppointments);
    
    if (filteredAppointments.length === 1) {
      // Auto-select single appointment
      setSelectedAppointment(filteredAppointments[0]);
      setCheckInStep("confirm");
    } else if (filteredAppointments.length > 1) {
      // Multiple appointments - show selection step
      setCheckInStep("appointment");
    } else {
      // No appointment for this vehicle - proceed as walk-in
      setSelectedAppointment(null);
      setCheckInStep("confirm");
    }
  };
  
  const handleAppointmentSelect = (appointment: any | null) => {
    setSelectedAppointment(appointment);
    setCheckInStep("confirm");
  };

  const handleConfirmCheckIn = () => {
    if (!customerData?.customer || !selectedVehicle) return;
    
    checkInMutation.mutate({
      customerId: customerData.customer.id,
      vehicleId: selectedVehicle.id,
      appointmentId: selectedAppointment?.id,
      phoneNumber: phoneNumber,
      checkInMethod: "kiosk",
    });
  };

  const resetCheckIn = () => {
    setCheckInStep("idle");
    setPhoneNumber("");
    setCustomerData(null);
    setSelectedVehicle(null);
    setSelectedAppointment(null);
    setVehicleAppointments([]);
  };

  const metrics = [
    {
      label: t('kiosk.todaysCheckIns', "Today's Check-Ins"),
      value: stats.todayCheckIns,
      icon: TabletSmartphone,
      color: "text-blue-600",
    },
    {
      label: t('kiosk.withAppointment', 'With Appointment'),
      value: stats.withAppointment,
      icon: Calendar,
      color: "text-[#0A5ED7]",
    },
    {
      label: t('kiosk.walkIns', 'Walk-Ins'),
      value: stats.walkIns,
      icon: User,
      color: "text-purple-600",
    },
    {
      label: t('kiosk.avgTimeSec', 'Avg Time (sec)'),
      value: stats.avgCheckInTime,
      icon: CheckCircle,
      color: "text-yellow-600",
    },
  ];

  return (
    <DashboardPage
      title={t('kiosk.title', '🖥️ Kiosk Check-In')}
      description={t('kiosk.description', 'Self-service customer check-in system')}
      icon={TabletSmartphone}
      metrics={metrics}
    >
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('kiosk.interfaceDemo', 'Kiosk Interface Demo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-8">
            {checkInStep === "idle" && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                  <TabletSmartphone className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[#0B1F3B] dark:text-white">{t('kiosk.welcomeToSalis', 'Welcome to SALIS AUTO')}</h2>
                <p className="text-lg text-[#64748B]">{t('kiosk.tapToBegin', 'Tap to begin check-in')}</p>
                <Button size="lg" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white" onClick={() => setCheckInStep("phone")} data-testid="button-start-checkin">
                  {t('kiosk.startCheckIn', 'Start Check-In')}
                </Button>
              </div>
            )}
            {checkInStep === "phone" && (
              <div className="text-center space-y-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t('kiosk.enterPhoneNumber', 'Enter Phone Number')}</h2>
                <Input 
                  type="tel" 
                  placeholder="(555) 123-4567" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-xl text-center bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" 
                  data-testid="input-phone" 
                />
                <Button size="lg" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white" onClick={handlePhoneLookup}>
                  {t('common.next', 'Continue')}
                </Button>
                <Button variant="ghost" className="text-[#64748B]" onClick={resetCheckIn}>
                  {t('common.cancel', 'Cancel')}
                </Button>
              </div>
            )}
            {checkInStep === "searching" && (
              <div className="text-center space-y-6">
                <Loader2 className="w-16 h-16 mx-auto animate-spin text-[#0A5ED7]" />
                <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t('kiosk.lookingUp', 'Looking up your information...')}</h2>
              </div>
            )}
            {checkInStep === "notfound" && (
              <div className="text-center space-y-6 w-full max-w-md">
                <div className="w-24 h-24 mx-auto rounded-full bg-[#F97316]/20 flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-[#F97316]" />
                </div>
                <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t('kiosk.customerNotFound', 'Customer Not Found')}</h2>
                <p className="text-[#64748B]">{t('kiosk.pleaseCheckPhone', 'Please check your phone number or speak with our front desk.')}</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-[#0A5ED7] text-[#0A5ED7]" onClick={() => setCheckInStep("phone")}>
                    {t('kiosk.tryAgain', 'Try Again')}
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" onClick={resetCheckIn}>
                    {t('common.cancel', 'Cancel')}
                  </Button>
                </div>
              </div>
            )}
            {checkInStep === "vehicle" && customerData && (
              <div className="text-center space-y-6 w-full max-w-md">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 rounded-lg">
                  <User className="h-8 w-8 text-[#0A5ED7]" />
                  <div className="text-left">
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">{t('kiosk.welcomeBack', 'Welcome back')}, {customerData.customer?.fullName}!</p>
                    <p className="text-sm text-[#64748B]">{customerData.customer?.phone}</p>
                  </div>
                </div>
                {customerData.todayAppointments && customerData.todayAppointments.length > 0 && (
                  <div className="p-3 bg-[#0A5ED7]/10 rounded-lg border border-[#0A5ED7]/30">
                    <div className="flex items-center gap-2 text-[#0A5ED7]">
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">{t('kiosk.appointmentToday', 'You have an appointment today!')}</span>
                    </div>
                    <p className="text-sm text-[#64748B] mt-1">{customerData.todayAppointments[0].serviceType}</p>
                  </div>
                )}
                <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t('kiosk.selectVehicle', 'Select Vehicle')}</h2>
                <div className="space-y-3">
                  {customerData.vehicles && customerData.vehicles.length > 0 ? (
                    customerData.vehicles.map((vehicle) => (
                      <Button 
                        key={vehicle.id}
                        variant="outline" 
                        className="w-full justify-start text-lg p-6 border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#0A5ED7]/10 hover:border-[#0A5ED7]" 
                        onClick={() => handleVehicleSelect(vehicle)}
                      >
                        <Car className="h-6 w-6 mr-3 text-[#0A5ED7]" />
                        {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.plateNumber})
                      </Button>
                    ))
                  ) : (
                    <p className="text-[#64748B]">{t('kiosk.noVehicles', 'No vehicles registered. Please speak with front desk.')}</p>
                  )}
                </div>
                <Button variant="ghost" className="text-[#64748B]" onClick={resetCheckIn}>
                  {t('common.cancel', 'Cancel')}
                </Button>
              </div>
            )}
            {checkInStep === "appointment" && customerData && selectedVehicle && (
              <div className="text-center space-y-6 w-full max-w-md">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 rounded-lg">
                  <Car className="h-8 w-8 text-[#0A5ED7]" />
                  <div className="text-left">
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                    <p className="text-sm text-[#64748B]">{selectedVehicle.plateNumber}</p>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t('kiosk.selectAppointment', 'Select Your Appointment')}</h2>
                <div className="space-y-3">
                  {vehicleAppointments.map((apt) => (
                    <Button 
                      key={apt.id}
                      variant="outline" 
                      className="w-full justify-start text-lg p-6 border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#0A5ED7]/10 hover:border-[#0A5ED7]" 
                      onClick={() => handleAppointmentSelect(apt)}
                    >
                      <Calendar className="h-6 w-6 mr-3 text-[#0A5ED7]" />
                      <div className="text-left">
                        <div className="font-semibold">{apt.serviceType}</div>
                        <div className="text-sm text-[#64748B]">#{apt.appointmentNumber}</div>
                      </div>
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-lg p-6 border-[#F97316] text-[#F97316] hover:bg-[#F97316]/10" 
                    onClick={() => handleAppointmentSelect(null)}
                  >
                    <User className="h-6 w-6 mr-3" />
                    {t('kiosk.walkInService', 'Walk-in Service (No Appointment)')}
                  </Button>
                </div>
                <Button variant="ghost" className="text-[#64748B]" onClick={() => setCheckInStep("vehicle")}>
                  {t('common.back', 'Back')}
                </Button>
              </div>
            )}
            {checkInStep === "confirm" && customerData && selectedVehicle && (
              <div className="text-center space-y-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t('kiosk.confirmCheckIn', 'Confirm Check-In')}</h2>
                <div className="bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 p-6 rounded-lg border border-[#0A5ED7]/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#0A5ED7]" />
                    <span className="font-semibold text-[#0B1F3B] dark:text-white">{customerData.customer?.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-[#0A5ED7]" />
                    <span className="text-[#0B1F3B] dark:text-white">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</span>
                  </div>
                  {selectedAppointment && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#0A5ED7]" />
                      <span className="text-[#0B1F3B] dark:text-white">{t('kiosk.appointment', 'Appointment')}: {selectedAppointment.serviceType}</span>
                    </div>
                  )}
                  {!selectedAppointment && (
                    <div className="text-sm text-[#F97316] mt-2">{t('kiosk.walkInService', 'Walk-in Service')}</div>
                  )}
                </div>
                <Button 
                  size="lg" 
                  onClick={handleConfirmCheckIn} 
                  disabled={checkInMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white"
                >
                  {checkInMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {t('kiosk.confirmCheckIn', 'Confirm Check-In')}
                </Button>
                <Button variant="ghost" className="text-[#64748B]" onClick={() => setCheckInStep("vehicle")}>
                  {t('common.back', 'Back')}
                </Button>
              </div>
            )}
            {checkInStep === "complete" && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-[#0A5ED7]/20 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-[#0A5ED7]" />
                </div>
                <h2 className="text-3xl font-bold text-[#0B1F3B] dark:text-white">{t('kiosk.checkInComplete', 'Check-In Complete!')}</h2>
                <p className="text-lg text-[#64748B]">{t('kiosk.pleaseHaveASeat', 'Please have a seat. A technician will be with you shortly.')}</p>
                <Button size="lg" variant="outline" className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10" onClick={resetCheckIn}>
                  {t('kiosk.newCheckIn', 'New Check-In')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('kiosk.recentCheckIns', 'Recent Check-Ins')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">{t('kiosk.loadingCheckIns', 'Loading check-ins...')}</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center">
                <TabletSmartphone className="h-8 w-8 text-[#0A5ED7]" />
              </div>
              <p className="text-[#64748B]">{t('kiosk.noCheckInsYet', 'No check-ins recorded yet.')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`session-${session.id}`}>
                  <div>
                    <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{session.customerName || t('kiosk.unknownCustomer', 'Unknown Customer')}</h3>
                    <p className="text-sm text-[#64748B]">
                      {session.vehicleMake} {session.vehicleModel} - {session.vehiclePlate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#0A5ED7]">
                      {session.appointmentId ? t('kiosk.appointment', 'Appointment') : t('kiosk.walkIn', 'Walk-In')}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {session.checkInTime ? new Date(session.checkInTime).toLocaleTimeString() : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
