import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      toast({ title: t('videoConsultations.consultationScheduled', 'Consultation scheduled'), description: t('videoConsultations.meetingLinkSent', 'Video meeting link sent to customer.') });
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
      toast({ title: t('videoConsultations.meetingStarted', 'Meeting started'), description: t('videoConsultations.openingConsultation', 'Opening video consultation...') });
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
    const statusLabels: Record<string, string> = {
      scheduled: t('common.scheduled', 'Scheduled'),
      in_progress: t('common.inProgress', 'In Progress'),
      completed: t('common.completed', 'Completed'),
      cancelled: t('common.cancelled', 'Cancelled'),
    };
    return <Badge variant={variants[status] || "secondary"} className={statusColors[status]}>{statusLabels[status] || status}</Badge>;
  };

  const copyMeetingLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: t('videoConsultations.linkCopied', 'Link copied'), description: t('videoConsultations.meetingLinkCopied', 'Meeting link copied to clipboard.') });
  };

  const columns: Column<typeof mockConsultations[0]>[] = [
    {
      header: t('customers.customer', 'Customer'),
      accessorKey: "customerName",
      cell: (row) => (
        <div>
          <div className="font-semibold text-[#0B1F3B] dark:text-white">{row.customerName}</div>
          <div className="text-sm text-[#64748B]">{row.jobCardNumber}</div>
        </div>
      ),
    },
    {
      header: t('technicians.technician', 'Technician'),
      accessorKey: "technicianName",
    },
    {
      header: t('videoConsultations.platform', 'Platform'),
      accessorKey: "platform",
      cell: (row) => <Badge variant="outline">{row.platform}</Badge>,
    },
    {
      header: t('common.scheduled', 'Scheduled'),
      accessorKey: "scheduledAt",
      cell: (row) => new Date(row.scheduledAt).toLocaleString(),
    },
    {
      header: t('videoConsultations.duration', 'Duration'),
      accessorKey: "duration",
      cell: (row) => `${row.duration} ${t('common.min', 'min')}`,
    },
    {
      header: t('common.status', 'Status'),
      accessorKey: "status",
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: t('common.actions', 'Actions'),
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
                {t('common.start', 'Start')}
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
              {t('videoConsultations.join', 'Join')}
            </Button>
          )}
          {row.status === "completed" && row.recordingUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(row.recordingUrl, "_blank")}
              data-testid={`button-recording-${row.id}`}
            >
              {t('videoConsultations.recording', 'Recording')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <StandardTablePage
        title={t('videoConsultations.title', 'Video Consultations')}
        description={t('videoConsultations.description', 'Remote vehicle diagnostics and customer consultations')}
        icon={Video}
        actions={[
          {
            label: t('videoConsultations.scheduleConsultation', 'Schedule Consultation'),
            onClick: () => setIsCreateDialogOpen(true),
            variant: "default",
          },
        ]}
        data={mockConsultations}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder={t('videoConsultations.searchPlaceholder', 'Search consultations...')}
        filters={[
          {
            id: "status",
            label: t('common.status', 'Status'),
            options: [
              { value: "all", label: t('common.allStatuses', 'All Statuses') },
              { value: "scheduled", label: t('common.scheduled', 'Scheduled') },
              { value: "in_progress", label: t('common.inProgress', 'In Progress') },
              { value: "completed", label: t('common.completed', 'Completed') },
            ],
          },
        ]}
        emptyState={{
          icon: Video,
          title: t('videoConsultations.noConsultations', 'No consultations'),
          description: t('videoConsultations.noConsultationsDesc', 'No video consultations scheduled yet.'),
        }}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('videoConsultations.scheduleVideoConsultation', 'Schedule Video Consultation')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('customers.customer', 'Customer')}</label>
              <Input placeholder={t('videoConsultations.selectCustomer', 'Select customer...')} className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-customer" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('videoConsultations.platform', 'Platform')}</label>
              <Select>
                <SelectTrigger className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-platform">
                  <SelectValue placeholder={t('videoConsultations.selectPlatform', 'Select platform')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="meet">Google Meet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('videoConsultations.scheduledTime', 'Scheduled Time')}</label>
              <Input type="datetime-local" className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-scheduled-time" />
            </div>
            <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" onClick={() => createConsultation.mutate({})} data-testid="button-schedule">
              {t('videoConsultations.scheduleConsultation', 'Schedule Consultation')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
