import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Calendar, Clock, User, PlayCircle, Plus, Copy, Input as InputIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VideoConsultations() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: consultations = [] } = useQuery({
    queryKey: ["/api/video/consultations"],
  });

  const createConsultation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/video/consultations", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Consultation scheduled", description: "Video meeting link sent to customer." });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/video/consultations"] });
    },
  });

  const startMeeting = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/video/consultations/${id}/start`, "POST", {});
    },
    onSuccess: (data: any) => {
      if (data.meetingUrl) {
        window.open(data.meetingUrl, "_blank");
      }
      toast({ title: "Meeting started", description: "Opening video consultation..." });
    },
  });

  // Mock data
  const mockConsultations = [
    {
      id: "1",
      customerName: "John Smith",
      technicianName: "Mike Davis",
      jobCardNumber: "JC-2024-1842",
      platform: "zoom",
      scheduledAt: "2024-10-26T15:00:00Z",
      duration: 30,
      status: "scheduled",
      meetingUrl: "https://zoom.us/j/1234567890",
      passcode: "abc123",
    },
    {
      id: "2",
      customerName: "Sarah Johnson",
      technicianName: "Emily Brown",
      jobCardNumber: "JC-2024-1835",
      platform: "teams",
      scheduledAt: "2024-10-26T14:00:00Z",
      startedAt: "2024-10-26T14:02:00Z",
      duration: 45,
      status: "in_progress",
      meetingUrl: "https://teams.microsoft.com/l/meetup-join/...",
    },
    {
      id: "3",
      customerName: "Mike Wilson",
      technicianName: "John Smith",
      jobCardNumber: "JC-2024-1820",
      platform: "zoom",
      scheduledAt: "2024-10-25T16:00:00Z",
      startedAt: "2024-10-25T16:05:00Z",
      endedAt: "2024-10-25T16:35:00Z",
      duration: 30,
      status: "completed",
      recordingUrl: "https://zoom.us/rec/share/...",
      customerAttended: true,
      technicianAttended: true,
    },
  ];

  const stats = {
    totalScheduled: 24,
    completedThisWeek: 15,
    averageDuration: 28,
    attendanceRate: 92,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: "secondary",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
      no_show: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const copyMeetingLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Meeting link copied to clipboard." });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            📹 Video Consultations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Schedule and conduct virtual meetings with customers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-schedule-consultation">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Consultation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Schedule Video Consultation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Customer</label>
                <Select>
                  <SelectTrigger className="mt-1" data-testid="select-customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">John Smith</SelectItem>
                    <SelectItem value="2">Sarah Johnson</SelectItem>
                    <SelectItem value="3">Mike Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Technician</label>
                <Select>
                  <SelectTrigger className="mt-1" data-testid="select-technician">
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">John Smith</SelectItem>
                    <SelectItem value="2">Mike Davis</SelectItem>
                    <SelectItem value="3">Emily Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Platform</label>
                <Select defaultValue="zoom">
                  <SelectTrigger className="mt-1" data-testid="select-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date & Time</label>
                  <Input type="datetime-local" className="mt-1" data-testid="input-datetime" />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input type="number" defaultValue={30} className="mt-1" data-testid="input-duration" />
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                createConsultation.mutate({
                  customerId: "1",
                  technicianId: "1",
                  platform: "zoom",
                  duration: 30
                });
              }} data-testid="button-create-consultation">
                Schedule Consultation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-total-scheduled">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Scheduled</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalScheduled}</h3>
              </div>
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-completed-week">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.completedThisWeek}</h3>
              </div>
              <Video className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-avg-duration">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.averageDuration} min</h3>
              </div>
              <Clock className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-attendance-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.attendanceRate}%</h3>
              </div>
              <User className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultations List */}
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockConsultations.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                data-testid={`consultation-${consultation.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{consultation.customerName}</h3>
                    {getStatusBadge(consultation.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Technician:</span> {consultation.technicianName}
                    </div>
                    <div>
                      <span className="font-medium">Job Card:</span> {consultation.jobCardNumber}
                    </div>
                    <div>
                      <span className="font-medium">Platform:</span> {consultation.platform}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {consultation.duration} min
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Scheduled: {new Date(consultation.scheduledAt).toLocaleString()}
                  </p>
                  {consultation.status === "scheduled" && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="link"
                        className="h-auto p-0"
                        onClick={() => copyMeetingLink(consultation.meetingUrl)}
                        data-testid={`button-copy-link-${consultation.id}`}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Meeting Link
                      </Button>
                      {consultation.passcode && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          | Passcode: <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{consultation.passcode}</code>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {consultation.status === "scheduled" && (
                    <Button
                      size="sm"
                      onClick={() => startMeeting.mutate(consultation.id)}
                      data-testid={`button-start-${consultation.id}`}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Meeting
                    </Button>
                  )}
                  {consultation.status === "completed" && consultation.recordingUrl && (
                    <Button size="sm" variant="outline" data-testid={`button-recording-${consultation.id}`}>
                      <Video className="h-4 w-4 mr-2" />
                      View Recording
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
