import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Play, Send, Eye, CheckCircle, Upload, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VideoEstimates() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const { toast } = useToast();

  const { data: estimates = [] } = useQuery({
    queryKey: ["/api/video-estimates"],
  });

  const createEstimate = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/video-estimates", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Estimate created", description: "Video estimate has been saved." });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/video-estimates"] });
    },
  });

  const sendEstimate = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/video-estimates/${id}/send`, "POST", {});
    },
    onSuccess: () => {
      toast({ title: "Estimate sent", description: "Video estimate sent to customer." });
      queryClient.invalidateQueries({ queryKey: ["/api/video-estimates"] });
    },
  });

  // Mock data
  const mockEstimates = [
    {
      id: "1",
      customerName: "John Smith",
      vehicle: "2020 Honda Civic",
      technicianName: "Mike Davis",
      videoUrl: "https://example.com/video1.mp4",
      thumbnailUrl: "https://via.placeholder.com/300x200",
      duration: 125, // seconds
      estimatedCost: 850.00,
      recommendedServices: [
        { name: "Brake Pad Replacement", cost: 450.00 },
        { name: "Brake Rotor Resurfacing", cost: 250.00 },
        { name: "Brake Fluid Flush", cost: 150.00 },
      ],
      status: "sent",
      createdAt: "2024-10-25T10:00:00Z",
      viewedAt: "2024-10-25T14:30:00Z",
    },
    {
      id: "2",
      customerName: "Sarah Johnson",
      vehicle: "2019 Toyota Camry",
      technicianName: "Emily Brown",
      videoUrl: "https://example.com/video2.mp4",
      thumbnailUrl: "https://via.placeholder.com/300x200",
      duration: 180,
      estimatedCost: 1250.00,
      recommendedServices: [
        { name: "Timing Belt Replacement", cost: 850.00 },
        { name: "Water Pump Replacement", cost: 400.00 },
      ],
      status: "approved",
      createdAt: "2024-10-24T09:00:00Z",
      viewedAt: "2024-10-24T15:20:00Z",
      approvedAt: "2024-10-24T16:00:00Z",
    },
    {
      id: "3",
      customerName: "Mike Wilson",
      vehicle: "2021 Ford F-150",
      technicianName: "John Smith",
      videoUrl: "https://example.com/video3.mp4",
      thumbnailUrl: "https://via.placeholder.com/300x200",
      duration: 90,
      estimatedCost: 450.00,
      recommendedServices: [
        { name: "Oil Change", cost: 75.00 },
        { name: "Air Filter Replacement", cost: 45.00 },
        { name: "Tire Rotation", cost: 50.00 },
        { name: "Alignment Check", cost: 280.00 },
      ],
      status: "pending",
      createdAt: "2024-10-26T08:00:00Z",
    },
  ];

  const stats = {
    totalEstimates: 45,
    pendingApproval: 12,
    approvalRate: 78,
    averageValue: 925,
  };

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Upload video or record new
                </p>
                <Button variant="outline" size="sm" data-testid="button-upload-video">
                  <Video className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Cost ($)</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  placeholder="0.00"
                  data-testid="input-cost"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  createEstimate.mutate({
                    customerId: "1",
                    vehicleId: "1",
                    estimatedCost: 500,
                  });
                }}
                data-testid="button-save-estimate"
              >
                Save Estimate
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">${stats.averageValue}</h3>
              </div>
              <Video className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockEstimates.map((estimate) => (
          <Card
            key={estimate.id}
            className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedVideo(estimate)}
            data-testid={`estimate-${estimate.id}`}
          >
            <div className="relative">
              <img
                src={estimate.thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                {formatDuration(estimate.duration)}
              </div>
              <Button
                size="sm"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                data-testid={`button-play-${estimate.id}`}
              >
                <Play className="h-6 w-6" />
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{estimate.customerName}</h3>
                {getStatusBadge(estimate.status)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{estimate.vehicle}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Cost:</span>
                  <span className="font-bold text-gray-900 dark:text-white">${estimate.estimatedCost.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Technician: {estimate.technicianName}
                </div>
              </div>
              {estimate.status === "pending" && (
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    sendEstimate.mutate(estimate.id);
                  }}
                  data-testid={`button-send-${estimate.id}`}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to Customer
                </Button>
              )}
              {estimate.viewedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Viewed: {new Date(estimate.viewedAt).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Player Dialog */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedVideo.customerName} - {selectedVideo.vehicle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                <p className="text-white">Video Player Placeholder</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommended Services</h4>
                <div className="space-y-2">
                  {selectedVideo.recommendedServices.map((service: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">{service.name}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">${service.cost.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900 rounded font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">${selectedVideo.estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
