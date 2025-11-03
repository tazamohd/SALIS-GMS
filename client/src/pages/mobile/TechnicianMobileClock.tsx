import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, Calendar, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TechnicianMobileClock() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

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
      } else {
        return apiRequest("/api/time-clock/clock-out", "POST", {
          entryId: todayEntry.id,
          clockOutTime: new Date().toISOString(),
        });
      }
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
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Time Clock</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track your work hours</p>
      </div>

      {/* Clock Display */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white">
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

      {/* Clock In/Out Button */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          {isClockedIn ? (
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400 animate-pulse" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">You're clocked in</p>
              </div>
              <p className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatDuration(todayEntry.clockInTime)}
              </p>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
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
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                Ready to start your shift?
              </p>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
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

      {/* Today's Time Entries */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-gray-900 dark:text-white">Today's Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayEntries.map((entry, index) => (
            <div 
              key={entry.id || index}
              className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              data-testid={`time-entry-${index}`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(entry.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  {entry.clockOutTime && (
                    <> - {new Date(entry.clockOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {entry.clockOutTime ? formatDuration(entry.clockInTime, entry.clockOutTime) : "In progress..."}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                entry.clockOutTime 
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              }`}>
                {entry.clockOutTime ? "Completed" : "Active"}
              </span>
            </div>
          ))}
          {todayEntries.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No time entries for today
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
