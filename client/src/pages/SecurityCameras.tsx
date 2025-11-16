import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Circle, Video } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts";

export default function SecurityCameras() {
  const { toast } = useToast();
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const { data: cameras = [], isLoading: loadingCameras } = useQuery<any[]>({
    queryKey: ["/api/cameras/cameras"],
  });

  const { data: recordings = [] } = useQuery<any[]>({
    queryKey: ["/api/cameras/recordings", { cameraId: selectedCamera }],
    enabled: !!selectedCamera,
  });

  const createCameraMutation = useMutation({
    mutationFn: async (cameraData: {
      name: string;
      location: string;
      cameraType: string;
      ipAddress?: string;
      streamUrl?: string;
      resolution: string;
    }) => {
      return await apiRequest("POST", "/api/cameras/cameras", cameraData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cameras/cameras"] });
      toast({
        title: "Success",
        description: "Camera created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create camera",
      });
    },
  });

  const stats = {
    activeCameras: cameras.filter((c: any) => c.isActive).length || 0,
    totalRecordings: recordings.length || 0,
    storageUsed: recordings.reduce((sum: number, r: any) => sum + (r.fileSize || 0), 0) / 1000 || 0,
    motionEvents: recordings.filter((r: any) => r.eventType === "motion").length || 0,
  };

  return (
    <StandardPageLayout
      title="📹 Security Cameras"
      description="Monitor and manage security camera system"
      icon={Camera}
      actions={[
        {
          label: "Add Camera",
          onClick: () => {
            createCameraMutation.mutate({
              name: "New Camera",
              location: "Service Bay",
              cameraType: "indoor",
              resolution: "1920x1080",
            });
          },
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Cameras</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-active-cameras">{stats.activeCameras}</h3>
              </div>
              <Camera className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recordings</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-total-recordings">{stats.totalRecordings}</h3>
              </div>
              <Video className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Storage (GB)</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-storage-used">{stats.storageUsed.toFixed(1)}</h3>
              </div>
              <Video className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Motion Events</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-motion-events">{stats.motionEvents}</h3>
              </div>
              <Circle className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Camera Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCameras ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading cameras...</p>
            </div>
          ) : cameras.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No cameras configured yet. Add a camera to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameras.map((camera: any) => (
                <div 
                  key={camera.id} 
                  className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500"
                  onClick={() => setSelectedCamera(camera.id)}
                  data-testid={`camera-${camera.id}`}
                >
                  <div className="bg-black aspect-video flex items-center justify-center relative">
                    {camera.isActive ? (
                      <>
                        <Play className="h-16 w-16 text-white opacity-50" />
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive" className="gap-1">
                            <Circle className="h-2 w-2 fill-current" />
                            LIVE
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <p className="text-white">Camera Offline</p>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{camera.cameraName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{camera.location} • {camera.cameraType}</p>
                      </div>
                      <div className="flex gap-2">
                        {camera.recordingEnabled && <Badge variant="secondary">Recording</Badge>}
                        {camera.motionDetection && <Badge>Motion</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          {recordings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {selectedCamera ? "No recordings found for this camera." : "Select a camera to view recordings."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording: any) => (
                <div key={recording.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`recording-${recording.id}`}>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {recording.vehiclePlate || "Recording"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {recording.recordingStart ? new Date(recording.recordingStart).toLocaleString() : ""} - 
                      {recording.recordingEnd ? new Date(recording.recordingEnd).toLocaleTimeString() : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge>{recording.eventType}</Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {recording.fileSize ? `${(recording.fileSize / 1000).toFixed(1)} MB` : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
