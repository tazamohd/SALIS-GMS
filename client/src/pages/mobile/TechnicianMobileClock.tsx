import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, Calendar, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TechnicianMobileClock() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: timeEntries } = useQuery<{ data: any[] }>({
    queryKey: ["/api/time-clock/entries"],
  });

  const todayEntry = timeEntries?.data?.find(entry => 
    !entry.clockOutTime && new Date(entry.clockInTime).toDateString() === new Date().toDateString()
  );

  const isClockedIn = !!todayEntry;

  const clockMutation = useMutation({
    mutationFn: async (type: "in" | "out") => {
      if (type === "in") {
        return apiRequest("/api/time-clock/clock-in", "POST", {
          clockInTime: new Date().toISOString(),
          location: "Mobile App",
        });
      } 
        return apiRequest("/api/time-clock/clock-out", "POST", {
          entryId: todayEntry.id,
          clockOutTime: new Date().toISOString(),
        });
      
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-clock/entries"] });
      toast({
        title: isClockedIn ? "Clocked Out" : "Clocked In",
        description: `Successfully ${isClockedIn ? "ended" : "started"} your shift`,
      });
    },
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diff = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const todayEntries = timeEntries?.data?.filter(entry =>
    new Date(entry.clockInTime).toDateString() === new Date().toDateString()
  ) || [];

  return (
    <div className="p-4 space-y-4 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <div>
        <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">Time Clock</h2>
        <p className="text-sm text-[#64748B]">Track your work hours</p>
      </div>

      <Card className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] border-0 text-white">
        <CardContent className="p-8 text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 opacity-80" />
          <div className="text-5xl font-bold mb-2">{formatTime(currentTime)}</div>
          <div className="text-sm opacity-80">
            {currentTime.toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-6">
          {isClockedIn ? (
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">You're clocked in</p>
              </div>
              <p className="text-center text-2xl font-bold text-[#0B1F3B] dark:text-white mb-1">
                {formatDuration(todayEntry.clockInTime)}
              </p>
              <p className="text-center text-xs text-[#64748B] mb-4">
                Since {new Date(todayEntry.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
                onClick={() => clockMutation.mutate("out")}
                disabled={clockMutation.isPending}
                data-testid="button-clock-out"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Clock Out
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-center text-sm text-[#64748B] mb-4">
                Ready to start your shift?
              </p>
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
                onClick={() => clockMutation.mutate("in")}
                disabled={clockMutation.isPending}
                data-testid="button-clock-in"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Clock In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#0A5ED7]" />
            <span className="text-[#0B1F3B] dark:text-white">Today's Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayEntries.map((entry, index) => (
            <div 
              key={entry.id || index}
              className="flex justify-between items-center py-2 border-b border-[#E2E8F0] dark:border-[#232A36] last:border-0"
              data-testid={`time-entry-${index}`}
            >
              <div>
                <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                  {new Date(entry.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  {entry.clockOutTime && (
                    <> - {new Date(entry.clockOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</>
                  )}
                </p>
                <p className="text-xs text-[#64748B]">
                  {entry.clockOutTime ? formatDuration(entry.clockInTime, entry.clockOutTime) : "In progress..."}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                entry.clockOutTime 
                  ? "bg-[#F8FAFC] dark:bg-[#0E1117] text-[#64748B]"
                  : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              }`}>
                {entry.clockOutTime ? "Completed" : "Active"}
              </span>
            </div>
          ))}
          {todayEntries.length === 0 && (
            <p className="text-sm text-[#64748B] text-center py-4">
              No time entries for today
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
