import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardTablePage, Column } from "@/components/layouts/StandardTablePage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Copy, PlayCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VideoConsultations() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: consultations = [], isLoading } = useQuery({
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: "secondary",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
    };
    const statusColors: Record<string, string> = {
      scheduled: "",
      in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      cancelled: "",
    };
    return <Badge variant={variants[status] || "secondary"} className={statusColors[status]}>{status.replace("_", " ")}</Badge>;
  };

  const copyMeetingLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Meeting link copied to clipboard." });
  };

  const columns: Column<typeof mockConsultations[0]>[] = [
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: (row) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{row.customerName}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{row.jobCardNumber}</div>
        </div>
      ),
    },
    {
      header: "Technician",
      accessorKey: "technicianName",
    },
    {
      header: "Platform",
      accessorKey: "platform",
      cell: (row) => <Badge variant="outline">{row.platform}</Badge>,
    },
    {
      header: "Scheduled",
      accessorKey: "scheduledAt",
      cell: (row) => new Date(row.scheduledAt).toLocaleString(),
    },
    {
      header: "Duration",
      accessorKey: "duration",
      cell: (row) => `${row.duration} min`,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "scheduled" && (
            <>
              <Button
                size="sm"
                onClick={() => startMeeting.mutate(row.id)}
                data-testid={`button-start-${row.id}`}
              >
                <PlayCircle className="h-3 w-3 mr-1" />
                Start
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyMeetingLink(row.meetingUrl)}
                data-testid={`button-copy-${row.id}`}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </>
          )}
          {row.status === "in_progress" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => window.open(row.meetingUrl, "_blank")}
              data-testid={`button-join-${row.id}`}
            >
              Join
            </Button>
          )}
          {row.status === "completed" && row.recordingUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(row.recordingUrl, "_blank")}
              data-testid={`button-recording-${row.id}`}
            >
              Recording
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <StandardTablePage
        title="Video Consultations"
        description="Remote vehicle diagnostics and customer consultations"
        icon={Video}
        actions={[
          {
            label: "Schedule Consultation",
            onClick: () => setIsCreateDialogOpen(true),
            variant: "default",
          },
        ]}
        data={mockConsultations}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search consultations..."
        filters={[
          {
            id: "status",
            label: "Status",
            options: [
              { value: "all", label: "All Statuses" },
              { value: "scheduled", label: "Scheduled" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
            ],
          },
        ]}
        emptyState={{
          icon: Video,
          title: "No consultations",
          description: "No video consultations scheduled yet.",
        }}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Video Consultation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Customer</label>
              <Input placeholder="Select customer..." className="mt-1" data-testid="input-customer" />
            </div>
            <div>
              <label className="text-sm font-medium">Platform</label>
              <Select>
                <SelectTrigger className="mt-1" data-testid="select-platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="meet">Google Meet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Scheduled Time</label>
              <Input type="datetime-local" className="mt-1" data-testid="input-scheduled-time" />
            </div>
            <Button className="w-full" onClick={() => createConsultation.mutate({})} data-testid="button-schedule">
              Schedule Consultation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
