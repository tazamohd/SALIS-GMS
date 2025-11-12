import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function TechnicianTimeClock() {
  const { user } = useAuth();
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);

  const { data: timeEntries } = useQuery<any[]>({
    queryKey: ["/api/technicians", user?.id, "time-clock"],
    enabled: !!user?.id,
  });

  const handleClockIn = () => {
    setClockedIn(true);
    setClockInTime(new Date());
  };

  const handleClockOut = () => {
    setClockedIn(false);
    setClockInTime(null);
  };

  const currentTime = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Time Clock
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your working hours
        </p>
      </div>

      {/* Current Status */}
      <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 dark:bg-salis-gray">
              <Clock className="h-16 w-16 text-gray-600 dark:text-gray-400" />
            </div>
            
            <div>
              <p className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {format(currentTime, "HH:mm:ss")}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {format(currentTime, "EEEE, MMMM d, yyyy")}
              </p>
            </div>

            {clockedIn && clockInTime && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                  Clocked in since
                </p>
                <p className="text-2xl font-semibold text-green-900 dark:text-green-100">
                  {format(clockInTime, "h:mm a")}
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {!clockedIn ? (
                <Button
                  onClick={handleClockIn}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                  data-testid="button-clock-in"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Clock In
                </Button>
              ) : (
                <Button
                  onClick={handleClockOut}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8"
                  data-testid="button-clock-out"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Clock Out
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Time Entries */}
      <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Recent Time Entries</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your work hour history
          </p>
        </CardHeader>
        <CardContent>
          {!timeEntries || timeEntries.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No time entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeEntries.slice(0, 10).map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-salis-gray rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {entry.date}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.clockIn} - {entry.clockOut}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {entry.totalHours} hrs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
