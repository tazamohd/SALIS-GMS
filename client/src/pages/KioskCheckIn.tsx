import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabletSmartphone, User, Car, Calendar, CheckCircle } from "lucide-react";
import { DashboardPage } from "@/components/layouts";

export default function KioskCheckIn() {
  const { t } = useTranslation();
  const [checkInStep, setCheckInStep] = useState<"idle" | "phone" | "vehicle" | "confirm" | "complete">("idle");
  const { toast } = useToast();

  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/kiosk/sessions"],
  });

  const checkInMutation = useMutation({
    mutationFn: async (checkInData: {
      customerId: string;
      vehicleId: string;
      appointmentId?: string;
      phoneNumber: string;
      checkInMethod: string;
    }) => {
      return await apiRequest("POST", "/api/kiosk/checkin", checkInData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kiosk/sessions"] });
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

  const simulateCheckIn = () => {
    checkInMutation.mutate({
      customerId: "demo-customer",
      vehicleId: "demo-vehicle",
      phoneNumber: "(555) 123-4567",
      checkInMethod: "kiosk",
    });
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
                <Input type="tel" placeholder="(555) 123-4567" className="text-xl text-center bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-phone" />
                <Button size="lg" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white" onClick={() => setCheckInStep("vehicle")}>
                  {t('common.next', 'Continue')}
                </Button>
              </div>
            )}
            {checkInStep === "vehicle" && (
              <div className="text-center space-y-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t('kiosk.selectVehicle', 'Select Vehicle')}</h2>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-lg p-6 border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#0A5ED7]/10 hover:border-[#0A5ED7]" onClick={() => setCheckInStep("confirm")}>
                    <Car className="h-6 w-6 mr-3 text-[#0A5ED7]" />
                    2020 Honda Civic (ABC 123)
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-lg p-6 border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#0A5ED7]/10 hover:border-[#0A5ED7]">
                    <Car className="h-6 w-6 mr-3 text-[#0A5ED7]" />
                    2019 Toyota Camry (XYZ 789)
                  </Button>
                </div>
              </div>
            )}
            {checkInStep === "confirm" && (
              <div className="text-center space-y-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t('kiosk.confirmCheckIn', 'Confirm Check-In')}</h2>
                <div className="bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 p-6 rounded-lg border border-[#0A5ED7]/30">
                  <p className="font-semibold text-[#0B1F3B] dark:text-white">2020 Honda Civic</p>
                  <p className="text-sm text-[#64748B]">{t('kiosk.oilChangeInspection', 'Oil Change & Inspection')}</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={simulateCheckIn} 
                  disabled={checkInMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white"
                >
                  {t('kiosk.confirmCheckIn', 'Confirm Check-In')}
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
                <Button size="lg" variant="outline" className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10" onClick={() => setCheckInStep("idle")}>
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
