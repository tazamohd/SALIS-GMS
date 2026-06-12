// @ts-nocheck
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardTablePage, Column } from "@/components/layouts/StandardTablePage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Play, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VideoEstimates() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: userResponse } = useQuery({
    queryKey: ["/api/user"],
  });

  const user = (userResponse as any)?.user;
  const customerId = user?.id;

  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ["/api/video-estimates", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const response = await fetch(`/api/video-estimates/customer/${customerId}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!customerId,
  });

  const approveEstimate = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/video-estimates/${id}/approve`, "PATCH", {});
    },
    onSuccess: () => {
      toast({ title: t('videoEstimates.estimateApproved', 'Estimate approved'), description: t('videoEstimates.estimateApprovedDesc', 'Video estimate has been approved.') });
      queryClient.invalidateQueries({ queryKey: ["/api/video-estimates", customerId] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: t('common.pending', 'Pending') },
      sent: { variant: "default", label: t('videoEstimates.sent', 'Sent') },
      viewed: { variant: "default", label: t('videoEstimates.viewed', 'Viewed') },
      approved: { variant: "default", label: t('videoEstimates.approved', 'Approved') },
      declined: { variant: "destructive", label: t('videoEstimates.declined', 'Declined') },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: Column<any>[] = [
    {
      header: t('vehicles.vehicle', 'Vehicle'),
      accessorKey: "vehicleId",
      cell: (row) => <span className="text-[#0B1F3B] dark:text-white">{row.vehicleId || t('common.notAvailable', 'N/A')}</span>,
    },
    {
      header: t('videoEstimates.estimatedCost', 'Estimated Cost'),
      accessorKey: "estimatedCost",
      cell: (row) => <span className="text-[#0B1F3B] dark:text-white font-semibold">${row.estimatedCost || 0}</span>,
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
          {row.videoUrl && (
            <Button
              size="sm"
              variant="outline"
              className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              onClick={() => window.open(row.videoUrl, "_blank")}
              data-testid={`button-play-${row.id}`}
            >
              <Play className="h-3 w-3 mr-1" />
              {t('videoEstimates.watch', 'Watch')}
            </Button>
          )}
          {row.status !== "approved" && row.status !== "declined" && (
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
              onClick={() => approveEstimate.mutate(row.id)}
              data-testid={`button-approve-${row.id}`}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('videoEstimates.approve', 'Approve')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <StandardTablePage
      title={t('videoEstimates.title', 'Video Estimates')}
      description={t('videoEstimates.description', 'Visual repair estimates with video walkarounds')}
      icon={Video}
      data={estimates}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder={t('videoEstimates.searchPlaceholder', 'Search estimates...')}
      filters={[
        {
          id: "status",
          label: t('common.status', 'Status'),
          options: [
            { value: "all", label: t('common.allStatuses', 'All Statuses') },
            { value: "pending", label: t('common.pending', 'Pending') },
            { value: "sent", label: t('videoEstimates.sent', 'Sent') },
            { value: "viewed", label: t('videoEstimates.viewed', 'Viewed') },
            { value: "approved", label: t('videoEstimates.approved', 'Approved') },
            { value: "declined", label: t('videoEstimates.declined', 'Declined') },
          ],
        },
      ]}
      emptyState={{
        icon: Video,
        title: t('videoEstimates.noEstimates', 'No estimates'),
        description: t('videoEstimates.noEstimatesDesc', 'No video estimates available.'),
      }}
    />
  );
}
