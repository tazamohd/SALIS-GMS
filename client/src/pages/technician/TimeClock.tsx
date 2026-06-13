import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TimeClockEntry {
  id: string;
  clockInTime: string;
  clockOutTime: string | null;
  totalHours: string | null;
  overtimeHours: string | null;
}

export default function TechnicianTimeClock() {
  const { user } = useAuth();
  const { toast } = useToast();
  const endpoint = `/api/technicians/${user?.id}/time-clock`;

  const { data: timeEntries } = useQuery<TimeClockEntry[]>({
    queryKey: [endpoint],
    enabled: !!user?.id,
  });

  // The currently-open shift (clocked in, not yet clocked out), if any.
  const openEntry = useMemo(
    () => timeEntries?.find((e) => !e.clockOutTime),
    [timeEntries],
  );
  const clockedIn = !!openEntry;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [endpoint] });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", endpoint, {});
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Clocked in", description: "Your shift has started." });
    },
    onError: (err: Error) => {
      toast({ title: "Clock in failed", description: err.message, variant: "destructive" });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const res = await apiRequest("PATCH", `${endpoint}/${entryId}/clock-out`);
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Clocked out", description: "Your hours have been recorded." });
    },
    onError: (err: Error) => {
      toast({ title: "Clock out failed", description: err.message, variant: "destructive" });
    },
  });

  const currentTime = new Date();
  const pending = clockInMutation.isPending || clockOutMutation.isPending;

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white mb-2">
          Time Clock
        </h1>
        <p className="text-[#64748B]">
          Track your working hours
        </p>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
              <Clock className="h-16 w-16 text-white" />
            </div>

            <div>
              <p className="text-5xl font-bold text-[#0B1F3B] dark:text-white mb-2">
                {format(currentTime, "HH:mm:ss")}
              </p>
              <p className="text-[#64748B]">
                {format(currentTime, "EEEE, MMMM d, yyyy")}
              </p>
            </div>

            {clockedIn && openEntry && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                  Clocked in since
                </p>
                <p className="text-2xl font-semibold text-green-900 dark:text-green-100">
                  {format(new Date(openEntry.clockInTime), "h:mm a")}
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {!clockedIn ? (
                <Button
                  onClick={() => clockInMutation.mutate()}
                  disabled={pending || !user?.id}
                  size="lg"
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white px-8"
                  data-testid="button-clock-in"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Clock In
                </Button>
              ) : (
                <Button
                  onClick={() => clockOutMutation.mutate(openEntry!.id)}
                  disabled={pending}
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

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">Recent Time Entries</CardTitle>
          <p className="text-sm text-[#64748B] mt-1">
            Your work hour history
          </p>
        </CardHeader>
        <CardContent>
          {!timeEntries || timeEntries.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-[#64748B] mb-3" />
              <p className="text-[#64748B]">No time entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeEntries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg"
                >
                  <div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">
                      {format(new Date(entry.clockInTime), "EEE, MMM d")}
                    </p>
                    <p className="text-sm text-[#64748B]">
                      {format(new Date(entry.clockInTime), "h:mm a")} -{" "}
                      {entry.clockOutTime
                        ? format(new Date(entry.clockOutTime), "h:mm a")
                        : "In progress"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">
                      {entry.totalHours ? `${entry.totalHours} hrs` : "—"}
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
