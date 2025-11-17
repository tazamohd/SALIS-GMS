import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabletSmartphone, User, Car, Calendar, CheckCircle } from "lucide-react";
import { DashboardPage } from "@/components/layouts";

export default function KioskCheckIn() {
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
        title: "Success",
        description: "Check-in completed successfully",
      });
      setCheckInStep("complete");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to complete check-in",
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
      label: "Today's Check-Ins",
      value: stats.todayCheckIns,
      icon: TabletSmartphone,
      color: "text-blue-600",
    },
    {
      label: "With Appointment",
      value: stats.withAppointment,
      icon: Calendar,
      color: "text-green-600",
    },
    {
      label: "Walk-Ins",
      value: stats.walkIns,
      icon: User,
      color: "text-purple-600",
    },
    {
      label: "Avg Time (sec)",
      value: stats.avgCheckInTime,
      icon: CheckCircle,
      color: "text-yellow-600",
    },
  ];

  return (
    <DashboardPage
      title="🖥️ Kiosk Check-In"
      description="Self-service customer check-in system"
      icon={TabletSmartphone}
      metrics={metrics}
    >
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Kiosk Interface Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
            {checkInStep === "idle" && (
              <div className="text-center space-y-6">
                <TabletSmartphone className="h-24 w-24 mx-auto text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to SALIS AUTO</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Tap to begin check-in</p>
                <Button size="lg" onClick={() => setCheckInStep("phone")} data-testid="button-start-checkin">
                  Start Check-In
                </Button>
              </div>
            )}
            {checkInStep === "phone" && (
              <div className="text-center space-y-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Phone Number</h2>
                <Input type="tel" placeholder="(555) 123-4567" className="text-xl text-center" data-testid="input-phone" />
                <Button size="lg" onClick={() => setCheckInStep("vehicle")} className="w-full">
                  Continue
                </Button>
              </div>
            )}
            {checkInStep === "vehicle" && (
              <div className="text-center space-y-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Vehicle</h2>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-lg p-6" onClick={() => setCheckInStep("confirm")}>
                    <Car className="h-6 w-6 mr-3" />
                    2020 Honda Civic (ABC 123)
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-lg p-6">
                    <Car className="h-6 w-6 mr-3" />
                    2019 Toyota Camry (XYZ 789)
                  </Button>
                </div>
              </div>
            )}
            {checkInStep === "confirm" && (
              <div className="text-center space-y-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Check-In</h2>
                <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-white">2020 Honda Civic</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Oil Change & Inspection</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={simulateCheckIn} 
                  disabled={checkInMutation.isPending}
                  className="w-full"
                >
                  Confirm Check-In
                </Button>
              </div>
            )}
            {checkInStep === "complete" && (
              <div className="text-center space-y-6">
                <CheckCircle className="h-24 w-24 mx-auto text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Check-In Complete!</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Please have a seat. A technician will be with you shortly.</p>
                <Button size="lg" variant="outline" onClick={() => setCheckInStep("idle")}>
                  New Check-In
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Check-Ins</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading check-ins...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No check-ins recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`session-${session.id}`}>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{session.customerName || "Unknown Customer"}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.vehicleMake} {session.vehicleModel} - {session.vehiclePlate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.appointmentId ? "Appointment" : "Walk-In"}
                    </p>
                    <p className="text-xs text-gray-500">
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
