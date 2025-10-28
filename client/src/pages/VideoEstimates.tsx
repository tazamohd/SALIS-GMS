import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Play, Send, Eye, CheckCircle, Upload, Plus, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VideoEstimates() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [formData, setFormData] = useState({ vehicleId: "", estimatedCost: "", videoUrl: "" });
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

  const createEstimate = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/video-estimates", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Estimate created", description: "Video estimate has been saved." });
      setIsCreateDialogOpen(false);
      setFormData({ vehicleId: "", estimatedCost: "", videoUrl: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/video-estimates", customerId] });
    },
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

  const stats = {
    totalEstimates: estimates.length || 0,
    pendingApproval: estimates.filter((e: any) => e.status === 'pending' || e.status === 'sent').length || 0,
    approvalRate: estimates.length > 0 
      ? Math.round((estimates.filter((e: any) => e.status === 'approved').length / estimates.length) * 100)
      : 0,
    averageValue: estimates.length > 0
      ? Math.round(estimates.reduce((sum: number, e: any) => {
          const cost = e.estimatedCost ? parseFloat(e.estimatedCost) : 0;
          return sum + cost;
        }, 0) / estimates.length)
      : 0,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pending" },
      sent: { variant: "default", label: "Sent" },
      viewed: { variant: "default", label: "Viewed" },
      approved: { variant: "default", label: "Approved" },
      declined: { variant: "destructive", label: "Declined" },
    };
    const config = variants[status] || { variant: "secondary", label: status || "Unknown" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-64"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🎥 Video Estimates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Record and send video walkarounds to customers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-estimate">
              <Plus className="h-4 w-4 mr-2" />
              Create Estimate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Video Estimate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Vehicle ID</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  placeholder="Enter vehicle ID"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  data-testid="input-vehicle-id"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Video URL</label>
                <input
                  type="url"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  placeholder="https://example.com/video.mp4"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  data-testid="input-video-url"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Cost ($)</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  placeholder="0.00"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  data-testid="input-cost"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  if (!formData.vehicleId || !formData.videoUrl || !formData.estimatedCost) {
                    toast({ title: "Validation error", description: "Please fill in all fields", variant: "destructive" });
                    return;
                  }
                  createEstimate.mutate({
                    customerId: customerId,
                    vehicleId: formData.vehicleId,
                    estimatedCost: parseFloat(formData.estimatedCost),
                    videoUrl: formData.videoUrl,
                    technicianId: user?.id,
                    garageId: user?.garageId,
                  });
                }}
                disabled={createEstimate.isPending}
                data-testid="button-save-estimate"
              >
                {createEstimate.isPending ? "Saving..." : "Save Estimate"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-total-estimates">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Estimates</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalEstimates}</h3>
              </div>
              <Video className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-pending-approval">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.pendingApproval}</h3>
              </div>
              <Eye className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-approval-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.approvalRate}%</h3>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-avg-value">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Value</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  ${stats.averageValue}
                </h3>
              </div>
              <Video className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {estimates.length === 0 && !isLoading && (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Video Estimates
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No video estimates found. Create your first estimate to get started.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Create First Estimate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estimates Grid */}
      {estimates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estimates.map((estimate: any, index: number) => {
            const estimatedCost = estimate.estimatedCost ? parseFloat(estimate.estimatedCost) : 0;
            const services = estimate.recommendedServices || [];
            
            return (
              <Card
                key={`estimate-${estimate.id || index}`}
                className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedVideo(estimate)}
                data-testid={`estimate-${estimate.id || index}`}
              >
                <div className="relative">
                  {estimate.thumbnailUrl ? (
                    <img
                      src={estimate.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <Video className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                    {formatDuration(estimate.duration)}
                  </div>
                  <Button
                    size="sm"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    data-testid={`button-play-${estimate.id || index}`}
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {estimate.technicianName || "Technician"}
                    </h3>
                    {getStatusBadge(estimate.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Estimated Cost:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {estimatedCost > 0 ? `$${estimatedCost.toFixed(2)}` : "Not available"}
                      </span>
                    </div>
                    {estimate.technicianName && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Technician: {estimate.technicianName}
                      </div>
                    )}
                  </div>
                  {estimate.status === "pending" && (
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        approveEstimate.mutate(estimate.id);
                      }}
                      data-testid={`button-approve-${estimate.id || index}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Estimate
                    </Button>
                  )}
                  {estimate.viewedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Viewed: {new Date(estimate.viewedAt).toLocaleString()}
                    </p>
                  )}
                  {estimate.approvedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Approved: {new Date(estimate.approvedAt).toLocaleString()}
                    </p>
                  )}
                  {!estimate.viewedAt && !estimate.approvedAt && estimate.createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(estimate.createdAt).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Video Player Dialog */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Video Estimate - {selectedVideo.technicianName || "Technician"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                {selectedVideo.videoUrl ? (
                  <p className="text-white text-sm">Video URL: {selectedVideo.videoUrl}</p>
                ) : (
                  <p className="text-white text-sm">No video URL available</p>
                )}
              </div>
              {selectedVideo.transcription && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Transcription</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedVideo.transcription}</p>
                </div>
              )}
              {selectedVideo.recommendedServices && Array.isArray(selectedVideo.recommendedServices) && selectedVideo.recommendedServices.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommended Services</h4>
                  <div className="space-y-2">
                    {selectedVideo.recommendedServices.map((service: any, index: number) => (
                      <div
                        key={`service-${index}`}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded"
                      >
                        <span className="text-sm text-gray-900 dark:text-white">
                          {service.name || "Service"}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {service.cost ? `$${parseFloat(service.cost).toFixed(2)}` : "N/A"}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900 rounded font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedVideo.estimatedCost 
                          ? `$${parseFloat(selectedVideo.estimatedCost).toFixed(2)}`
                          : "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
