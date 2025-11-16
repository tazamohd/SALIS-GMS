import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardTablePage, Column } from "@/components/layouts/StandardTablePage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Play, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VideoEstimates() {
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
      toast({ title: "Estimate approved", description: "Video estimate has been approved." });
      queryClient.invalidateQueries({ queryKey: ["/api/video-estimates", customerId] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pending" },
      sent: { variant: "default", label: "Sent" },
      viewed: { variant: "default", label: "Viewed" },
      approved: { variant: "default", label: "Approved" },
      declined: { variant: "destructive", label: "Declined" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: Column<any>[] = [
    {
      header: "Vehicle",
      accessorKey: "vehicleId",
      cell: (row) => row.vehicleId || "N/A",
    },
    {
      header: "Estimated Cost",
      accessorKey: "estimatedCost",
      cell: (row) => `$${row.estimatedCost || 0}`,
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
          {row.videoUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(row.videoUrl, "_blank")}
              data-testid={`button-play-${row.id}`}
            >
              <Play className="h-3 w-3 mr-1" />
              Watch
            </Button>
          )}
          {row.status !== "approved" && row.status !== "declined" && (
            <Button
              size="sm"
              onClick={() => approveEstimate.mutate(row.id)}
              data-testid={`button-approve-${row.id}`}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <StandardTablePage
      title="Video Estimates"
      description="Visual repair estimates with video walkarounds"
      icon={Video}
      data={estimates}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Search estimates..."
      filters={[
        {
          id: "status",
          label: "Status",
          options: [
            { value: "all", label: "All Statuses" },
            { value: "pending", label: "Pending" },
            { value: "sent", label: "Sent" },
            { value: "viewed", label: "Viewed" },
            { value: "approved", label: "Approved" },
            { value: "declined", label: "Declined" },
          ],
        },
      ]}
      emptyState={{
        icon: Video,
        title: "No estimates",
        description: "No video estimates available.",
      }}
    />
  );
}
